"use client";

import { useState, useEffect, useTransition } from "react";
import { 
  fetchCheckInData, 
  submitCheckIn, 
  undoCheckIn, 
  submitMerchCollection, 
  undoMerchCollection,
  getCheckedInList,
  getCollectedMerchList
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  QrCode, 
  Search, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  ShoppingBag, 
  X, 
  Undo2, 
  FileText, 
  RefreshCw, 
  Camera, 
  CameraOff, 
  Gift, 
  Check, 
  MapPin, 
  Phone,
  Bookmark,
  Calendar,
  Hourglass,
  ArrowRightLeft
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

export default function CheckInAdminPage() {
  const [activeTab, setActiveTab] = useState<"scan" | "attendance" | "merchandise">("scan");
  
  // Search & Scanner states
  const [searchQuery, setSearchQuery] = useState("");
  const [isPendingSearch, startSearchTransition] = useTransition();
  const [scanResult, setScanResult] = useState<{
    registrations: any[];
    merchOrders: any[];
  } | null>(null);

  // Scanner status
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);

  // List views states
  const [loadingLists, setLoadingLists] = useState(false);
  const [checkedInList, setCheckedInList] = useState<any[]>([]);
  const [collectedMerchList, setCollectedMerchList] = useState<any[]>([]);
  
  // Rombongan actual check-in counts
  const [actualParticipants, setActualParticipants] = useState<number>(0);
  const [actualCompanions, setActualCompanions] = useState<number>(0);

  // Search filter for Lists
  const [listSearch, setListSearch] = useState("");

  // Start/Stop scanner
  const toggleScanner = () => {
    setScannerActive((prev) => !prev);
    setScannerError(null);
  };

  // Perform search manually
  const handleSearch = async (queryToSearch?: string) => {
    const term = queryToSearch !== undefined ? queryToSearch : searchQuery;
    if (!term.trim()) {
      toast.error("Masukkan kode, nama, atau nomor WA!");
      return;
    }
    
    // Stop scanner if active
    setScannerActive(false);

    startSearchTransition(async () => {
      const res = await fetchCheckInData(term);
      if (res.success && res.registrations && res.merchOrders) {
        setScanResult({
          registrations: res.registrations,
          merchOrders: res.merchOrders
        });

        // Initialize rombongan counts if rombongan found
        const firstReg = res.registrations[0];
        if (firstReg && firstReg.registration_mode === "Rombongan") {
          // If already checked in previously, default to their saved values, otherwise the full count
          setActualParticipants(firstReg.checked_in ? firstReg.checked_in_participants : (firstReg.participant_count || 0));
          setActualCompanions(firstReg.checked_in ? firstReg.checked_in_companions : (firstReg.companion_count || 0));
        }

        if (res.registrations.length === 0 && res.merchOrders.length === 0) {
          toast.error("Data tidak ditemukan");
        } else {
          toast.success("Data berhasil dimuat");
        }
      } else {
        toast.error(res.error || "Gagal memuat data");
      }
    });
  };

  // Handle scanner success callback
  const handleScanSuccess = (decodedText: string) => {
    setScannerActive(false);
    setSearchQuery(decodedText);
    handleSearch(decodedText);
  };

  // Setup HTML5 QR Scanner
  useEffect(() => {
    let qrScanner: Html5Qrcode | null = null;

    if (scannerActive && activeTab === "scan") {
      // Small timeout to let the container render
      const timer = setTimeout(() => {
        qrScanner = new Html5Qrcode("qr-reader-container");
        qrScanner
          .start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: (width, height) => {
                const size = Math.min(width, height) * 0.7;
                return { width: size, height: size };
              },
            },
            (decodedText) => {
              handleScanSuccess(decodedText);
            },
            () => {
              // Verbose error logging ignored
            }
          )
          .catch((err) => {
            console.error("Gagal start camera scanner:", err);
            setScannerError("Gagal mengakses kamera. Berikan izin akses kamera.");
            setScannerActive(false);
          });
      }, 300);

      return () => {
        clearTimeout(timer);
        if (qrScanner) {
          if (qrScanner.isScanning) {
            qrScanner.stop().catch((e) => console.error("Error stopping camera:", e));
          }
        }
      };
    }
  }, [scannerActive, activeTab]);

  // Load attendance and merchandise lists
  const fetchLists = async () => {
    setLoadingLists(true);
    const [attRes, merchRes] = await Promise.all([
      getCheckedInList(),
      getCollectedMerchList(),
    ]);
    setLoadingLists(false);

    if (attRes.success && attRes.data) {
      setCheckedInList(attRes.data);
    }
    if (merchRes.success && merchRes.data) {
      setCollectedMerchList(merchRes.data);
    }
  };

  useEffect(() => {
    if (activeTab !== "scan") {
      fetchLists();
    } else {
      // Turn off scanner if switching to scan tab is not done
      setScannerActive(false);
    }
  }, [activeTab]);

  // Handle participant check-in execution
  const executeCheckIn = async (reg: any) => {
    let parts = 1;
    let comps = 0;

    if (reg.registration_mode === "Rombongan") {
      parts = actualParticipants;
      comps = actualCompanions;
      if (parts < 0 || comps < 0) {
        toast.error("Jumlah kehadiran tidak boleh negatif!");
        return;
      }
      if (parts > (reg.participant_count || 0) || comps > (reg.companion_count || 0)) {
        toast.error(`Kuantitas melebihi kuota rombongan (${reg.participant_count}P, ${reg.companion_count}D)`);
        return;
      }
    } else {
      // Mandiri
      if (reg.type === "Peserta") {
        parts = 1;
        comps = 0;
      } else {
        parts = 0;
        comps = 1;
      }
    }

    const res = await submitCheckIn(reg.id, parts, comps);
    if (res.success) {
      toast.success("Cek in berhasil dicatat!");
      // Update local state
      if (scanResult) {
        const updatedRegs = scanResult.registrations.map(r => r.id === reg.id ? { ...r, checked_in: true, checked_in_at: new Date().toISOString(), checked_in_participants: parts, checked_in_companions: comps } : r);
        setScanResult({ ...scanResult, registrations: updatedRegs });
      }
    } else {
      toast.error(res.error || "Gagal melakukan cek in");
    }
  };

  // Handle undo participant check-in
  const executeUndoCheckIn = async (reg: any) => {
    const res = await undoCheckIn(reg.id);
    if (res.success) {
      toast.success("Cek in berhasil dibatalkan!");
      // Update local state
      if (scanResult) {
        const updatedRegs = scanResult.registrations.map(r => r.id === reg.id ? { ...r, checked_in: false, checked_in_at: null, checked_in_participants: 0, checked_in_companions: 0 } : r);
        setScanResult({ ...scanResult, registrations: updatedRegs });
      }
    } else {
      toast.error(res.error || "Gagal membatalkan cek in");
    }
  };

  // Handle merchandise collection execution
  const executeMerchCollect = async (order: any) => {
    const res = await submitMerchCollection(order.id);
    if (res.success) {
      toast.success("Serah terima souvenir berhasil dicatat!");
      // Update local state
      if (scanResult) {
        const updatedOrders = scanResult.merchOrders.map(o => o.id === order.id ? { ...o, merch_collected: true, collected_at: new Date().toISOString() } : o);
        setScanResult({ ...scanResult, merchOrders: updatedOrders });
      }
    } else {
      toast.error(res.error || "Gagal mencatat penyerahan");
    }
  };

  // Handle undo merchandise collection
  const executeUndoMerchCollect = async (order: any) => {
    const res = await undoMerchCollection(order.id);
    if (res.success) {
      toast.success("Penyerahan souvenir berhasil dibatalkan!");
      // Update local state
      if (scanResult) {
        const updatedOrders = scanResult.merchOrders.map(o => o.id === order.id ? { ...o, merch_collected: false, collected_at: null } : o);
        setScanResult({ ...scanResult, merchOrders: updatedOrders });
      }
    } else {
      toast.error(res.error || "Gagal membatalkan penyerahan");
    }
  };

  // Reset scan details views
  const handleClearResults = () => {
    setScanResult(null);
    setSearchQuery("");
  };

  // Filtering lists for local search
  const filteredCheckedIn = checkedInList.filter(item => {
    const q = listSearch.toLowerCase().trim();
    if (!q) return true;
    const name = item.registration_mode === "Mandiri" ? item.full_name : item.pic_name;
    return (
      (item.registration_code && item.registration_code.toLowerCase().includes(q)) ||
      (name && name.toLowerCase().includes(q)) ||
      (item.church_name && item.church_name.toLowerCase().includes(q)) ||
      (item.mupel && item.mupel.toLowerCase().includes(q))
    );
  });

  const filteredCollectedMerch = collectedMerchList.filter(item => {
    const q = listSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      (item.registration_code && item.registration_code.toLowerCase().includes(q)) ||
      (item.buyer_name && item.buyer_name.toLowerCase().includes(q)) ||
      (item.church_city && item.church_city.toLowerCase().includes(q)) ||
      (item.item_type && item.item_type.toLowerCase().includes(q))
    );
  });

  // Calculate statistics for Checked-In list
  const attendanceStats = (() => {
    let registrationsCount = filteredCheckedIn.length;
    let totalHeadcount = 0;
    let totalPeserta = 0;
    let totalPendamping = 0;
    let umum = 0;
    let tuanRumah = 0;

    filteredCheckedIn.forEach((item) => {
      const p = item.checked_in_participants || 0;
      const c = item.checked_in_companions || 0;
      totalHeadcount += (p + c);
      totalPeserta += p;
      totalPendamping += c;

      if (item.category === "Umum") {
        umum += (p + c);
      } else {
        tuanRumah += (p + c);
      }
    });

    return { registrationsCount, totalHeadcount, totalPeserta, totalPendamping, umum, tuanRumah };
  })();

  // Calculate statistics for Merchandise list
  const merchStats = (() => {
    let orderCount = filteredCollectedMerch.length;
    let itemCount = 0;

    filteredCollectedMerch.forEach((item) => {
      itemCount += (item.quantity || 1);
    });

    return { orderCount, itemCount };
  })();

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-12 select-none px-2 sm:px-0">
      
      {/* Title Header */}
      <div className="text-center sm:text-left space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#D4AF37] tracking-tight">Cek In &amp; Souvenir</h1>
        <p className="text-xs sm:text-sm text-gray-400">Portal Cek In Panitia HUT ke-16 PKLU GPIB</p>
      </div>

      {/* Tabs Navigation (Mobile Friendly Pill Layout) */}
      <div className="grid grid-cols-3 gap-1 bg-[#022c22]/40 p-1.5 rounded-xl border border-[#D4AF37]/20 backdrop-blur-md">
        <button
          onClick={() => setActiveTab("scan")}
          className={`py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-lg flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all duration-300 ${
            activeTab === "scan" 
              ? "bg-[#D4AF37] text-black font-black shadow-[0_0_10px_rgba(212,175,55,0.25)]" 
              : "text-gray-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Scan / Cari</span>
        </button>
        <button
          onClick={() => setActiveTab("attendance")}
          className={`py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-lg flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all duration-300 ${
            activeTab === "attendance" 
              ? "bg-[#D4AF37] text-black font-black shadow-[0_0_10px_rgba(212,175,55,0.25)]" 
              : "text-gray-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Hadir</span>
        </button>
        <button
          onClick={() => setActiveTab("merchandise")}
          className={`py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-lg flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all duration-300 ${
            activeTab === "merchandise" 
              ? "bg-[#D4AF37] text-black font-black shadow-[0_0_10px_rgba(212,175,55,0.25)]" 
              : "text-gray-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Souvenir</span>
        </button>
      </div>

      {/* ==================== TAB 1: SCAN QR & SEARCH ==================== */}
      {activeTab === "scan" && (
        <div className="space-y-6">
          
          {/* Scanner / Search Card */}
          <div className="bg-[#022c22]/20 border border-[#D4AF37]/20 p-5 rounded-2xl shadow-xl backdrop-blur-md space-y-4">
            
            {/* Camera QR Reader Toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-widest flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#D4AF37]" />
                  QR Scanner Kamera
                </span>
                <Button 
                  onClick={toggleScanner}
                  variant={scannerActive ? "destructive" : "outline"}
                  size="sm"
                  className={`text-xs h-8 px-3.5 rounded-lg border-2 ${
                    scannerActive 
                      ? "bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30" 
                      : "border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10"
                  }`}
                >
                  {scannerActive ? (
                    <><CameraOff className="w-3.5 h-3.5 mr-1" /> Nonaktifkan</>
                  ) : (
                    <><Camera className="w-3.5 h-3.5 mr-1" /> Aktifkan Kamera</>
                  )}
                </Button>
              </div>

              {/* Camera view container */}
              {scannerActive ? (
                <div className="relative border-2 border-[#D4AF37]/50 rounded-2xl overflow-hidden bg-black/80 aspect-square w-full max-w-[320px] mx-auto shadow-inner flex items-center justify-center">
                  <div id="qr-reader-container" className="w-full h-full" />
                  
                  {/* Scanner target frame HUD overlay */}
                  <div className="absolute inset-0 border-4 border-transparent pointer-events-none flex items-center justify-center">
                    <div className="w-[70%] h-[70%] border-2 border-[#D4AF37] border-dashed rounded-xl opacity-60 animate-pulse relative">
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#D4AF37]"></div>
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#D4AF37]"></div>
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#D4AF37]"></div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#D4AF37]"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-white/5 bg-black/40 rounded-2xl p-6 text-center text-gray-400 text-xs">
                  <QrCode className="w-10 h-10 text-gray-600 mx-auto mb-2 opacity-50" />
                  Kamera nonaktif. Klik tombol diatas untuk memindai QR Code tiket / invoice.
                </div>
              )}

              {scannerError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{scannerError}</span>
                </div>
              )}
            </div>

            {/* Separator line */}
            <div className="relative flex items-center justify-center py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <span className="relative px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-[#060a08]">Atau Cari Manual</span>
            </div>

            {/* Manual Search Form */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
              className="flex gap-2"
            >
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Kode Tiket (PKLU-XXX), Nama, atau No WA..."
                className="bg-black/50 text-white border-[#D4AF37]/30 h-11 text-xs rounded-xl focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
              />
              <Button 
                type="submit" 
                disabled={isPendingSearch}
                className="bg-[#D4AF37] hover:bg-[#B3932D] text-black font-extrabold h-11 px-5 rounded-xl transition-all"
              >
                {isPendingSearch ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </form>
          </div>

          {/* ================= SCAN RESULT VIEW ================= */}
          {scanResult && (
            <div className="space-y-6">
              
              {/* Header result info */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Hasil Pencarian</span>
                <Button 
                  onClick={handleClearResults} 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-gray-400 hover:text-white px-2.5 rounded-lg text-xs"
                >
                  <X className="w-3.5 h-3.5 mr-1" /> Bersihkan
                </Button>
              </div>

              {/* 1. REGISTRATIONS RESULTS */}
              {scanResult.registrations.map((reg) => {
                const isRombongan = reg.registration_mode === "Rombongan";
                const totalQuota = isRombongan ? ((reg.participant_count || 0) + (reg.companion_count || 0)) : 1;
                const arrivalCount = isRombongan ? ((reg.checked_in_participants || 0) + (reg.checked_in_companions || 0)) : (reg.checked_in ? 1 : 0);

                return (
                  <div 
                    key={reg.id} 
                    className="bg-[#0b0f0d] border border-[#D4AF37]/30 rounded-2xl p-5 shadow-2xl space-y-4"
                  >
                    {/* Header: Code & Status */}
                    <div className="flex items-start justify-between border-b border-white/10 pb-3">
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Tiket Pendaftaran</span>
                        <span className="font-mono text-base font-black text-[#D4AF37] uppercase tracking-wider">{reg.registration_code}</span>
                      </div>
                      
                      {reg.checked_in ? (
                        <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Hadir
                        </div>
                      ) : (
                        <div className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase flex items-center gap-1">
                          <Hourglass className="w-3 h-3" />
                          Belum Cek In
                        </div>
                      )}
                    </div>

                    {/* Main details list */}
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-gray-400">Mode:</span>
                        <strong className="text-white">{reg.registration_mode}</strong>
                      </div>
                      
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-gray-400">Nama:</span>
                        <strong className="text-white">{isRombongan ? reg.pic_name : reg.full_name}</strong>
                      </div>

                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-gray-400">Asal Jemaat:</span>
                        <strong className="text-emerald-300 text-right">{reg.church_name} ({reg.mupel})</strong>
                      </div>

                      {!isRombongan ? (
                        <>
                          <div className="flex justify-between py-1 border-b border-white/5">
                            <span className="text-gray-400">Tipe / Peran:</span>
                            <strong className="text-white">{reg.type} {reg.role ? `(${reg.role})` : ""}</strong>
                          </div>
                          <div className="flex justify-between py-1 border-b border-white/5">
                            <span className="text-gray-400">Ukuran Kaos:</span>
                            <span className="font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded text-[10px]">{reg.shirt_size || "Acak"}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between py-1 border-b border-white/5">
                            <span className="text-gray-400">Total Kuota Rombongan:</span>
                            <strong className="text-white">{totalQuota} Orang <span className="text-[10px] text-gray-400 font-normal">({reg.participant_count}P, {reg.companion_count}D)</span></strong>
                          </div>
                          {reg.shirt_sizes_summary && (
                            <div className="py-1.5 border-b border-white/5">
                              <span className="text-gray-400 block mb-1">Rincian Baju Rombongan:</span>
                              <div className="flex flex-wrap gap-1 font-mono text-[9px]">
                                {Object.entries(reg.shirt_sizes_summary).map(([sz, q]) => (
                                  Number(q) > 0 ? <span key={sz} className="bg-white/5 px-2 py-0.5 rounded border border-white/10 text-white">{sz}:{String(q)}</span> : null
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-gray-400">WhatsApp:</span>
                        <strong className="text-white font-mono">{reg.whatsapp_number}</strong>
                      </div>

                      <div className="flex justify-between py-1 items-center border-b border-white/5">
                        <span className="text-gray-400">Status Pembayaran:</span>
                        {reg.payment_status === "verified" ? (
                          <span className="bg-emerald-500/15 text-emerald-400 font-extrabold border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] uppercase">LUNAS</span>
                        ) : (
                          <span className="bg-amber-500/15 text-amber-400 font-extrabold border border-amber-500/20 px-2 py-0.5 rounded text-[10px] uppercase">PENDING</span>
                        )}
                      </div>

                      {reg.checked_in && (
                        <div className="bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-xl space-y-1">
                          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Informasi Kedatangan</p>
                          <p className="text-gray-300">Waktu: <strong className="text-white font-mono">{new Date(reg.checked_in_at).toLocaleString("id-ID")}</strong></p>
                          {isRombongan && (
                            <p className="text-gray-300">Jumlah Hadir: <strong className="text-white">{arrivalCount} Orang</strong> <span className="text-[10px] text-gray-400 font-mono">({reg.checked_in_participants} Peserta, {reg.checked_in_companions} Pendamping)</span></p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Group check-in controls */}
                    {!reg.checked_in && isRombongan && reg.payment_status === "verified" && (
                      <div className="bg-black/50 p-4 rounded-xl border border-white/5 space-y-3">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Input Kehadiran Aktual</span>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-400 block">Peserta (Maks {reg.participant_count || 0})</label>
                            <Input 
                              type="number"
                              min={0}
                              max={reg.participant_count || 0}
                              value={actualParticipants}
                              onChange={(e) => setActualParticipants(Math.max(0, parseInt(e.target.value) || 0))}
                              className="bg-black/50 h-9 text-xs text-white text-center border-white/10 rounded-lg"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-400 block">Pendamping (Maks {reg.companion_count || 0})</label>
                            <Input 
                              type="number"
                              min={0}
                              max={reg.companion_count || 0}
                              value={actualCompanions}
                              onChange={(e) => setActualCompanions(Math.max(0, parseInt(e.target.value) || 0))}
                              className="bg-black/50 h-9 text-xs text-white text-center border-white/10 rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="pt-2">
                      {reg.payment_status !== "verified" ? (
                        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-400 text-[10px] text-center font-bold">
                          Pembayaran belum diverifikasi! Peserta/Rombongan TIDAK boleh melakukan cek in.
                        </div>
                      ) : !reg.checked_in ? (
                        <Button 
                          onClick={() => executeCheckIn(reg)}
                          className="w-full bg-[#D4AF37] hover:bg-[#B3932D] text-black font-extrabold py-3 rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all text-xs"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Cek In Peserta Sekarang
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => executeUndoCheckIn(reg)}
                          variant="outline"
                          className="w-full border-red-500/30 hover:border-red-500/50 text-red-400 hover:bg-red-950/20 py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors font-bold"
                        >
                          <Undo2 className="w-4 h-4" />
                          Batalkan Cek In Peserta
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* 2. MERCHANDISE RESULTS */}
              {scanResult.merchOrders.map((order) => {
                const isVerified = order.payment_status === "verified";
                const isPending = order.payment_status === "pending";
                
                return (
                  <div 
                    key={order.id} 
                    className="bg-[#0b0f0d] border border-[#D4AF37]/30 rounded-2xl p-5 shadow-2xl space-y-4"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-white/10 pb-3">
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Bukti Pembelian Merchandise</span>
                        <span className="font-mono text-sm font-black text-[#D4AF37] uppercase tracking-wider">#MB-{order.id.slice(0, 6).toUpperCase()}</span>
                      </div>
                      
                      {order.merch_collected ? (
                        <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase flex items-center gap-1">
                          <Gift className="w-3 h-3" />
                          Sudah Diambil
                        </div>
                      ) : (
                        <div className="bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Belum Diambil
                        </div>
                      )}
                    </div>

                    {/* Order Details */}
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-gray-400">Pembeli:</span>
                        <strong className="text-white">{order.buyer_name}</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-gray-400">Gereja / Kota:</span>
                        <strong className="text-emerald-300">{order.church_city}</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-gray-400">WhatsApp:</span>
                        <strong className="text-white font-mono">{order.whatsapp}</strong>
                      </div>
                      
                      {order.registration_code && (
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-gray-400">Tautan Tiket:</span>
                          <strong className="text-[#D4AF37] font-mono cursor-pointer hover:underline" onClick={() => handleSearch(order.registration_code)}>
                            {order.registration_code} ↗
                          </strong>
                        </div>
                      )}

                      <div className="py-2 border-b border-white/5">
                        <span className="text-gray-400 block mb-1 font-semibold">Rincian Item:</span>
                        <div className="bg-black/40 p-2.5 rounded-lg border border-white/5 font-mono text-[10px] text-gray-200">
                          {order.item_type} ({order.quantity || 1} Pcs)
                        </div>
                      </div>

                      <div className="flex justify-between py-1 items-center border-b border-white/5">
                        <span className="text-gray-400">Status Pembayaran:</span>
                        {isVerified ? (
                          <span className="bg-emerald-500/15 text-emerald-400 font-extrabold border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] uppercase">LUNAS</span>
                        ) : (
                          <span className="bg-amber-500/15 text-amber-400 font-extrabold border border-amber-500/20 px-2 py-0.5 rounded text-[10px] uppercase">PENDING / BELUM LUNAS</span>
                        )}
                      </div>

                      {order.merch_collected && (
                        <div className="bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-xl">
                          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Informasi Pengambilan</p>
                          <p className="text-gray-300">Diserahkan pada: <strong className="text-white font-mono">{new Date(order.collected_at).toLocaleString("id-ID")}</strong></p>
                        </div>
                      )}
                    </div>

                    {/* Actions for merchandise */}
                    <div className="pt-2">
                      {!isVerified ? (
                        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-400 text-[10px] text-center font-bold">
                          Pembayaran belum diverifikasi! Souvenir TIDAK boleh diserahkan kepada peserta.
                        </div>
                      ) : !order.merch_collected ? (
                        <Button 
                          onClick={() => executeMerchCollect(order)}
                          className="w-full bg-[#022c22] border border-[#D4AF37]/50 hover:bg-[#033c2e] text-[#D4AF37] font-extrabold py-3 rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all text-xs"
                        >
                          <Gift className="w-4 h-4" />
                          Serahkan Souvenir &amp; Cek In Merch
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => executeUndoMerchCollect(order)}
                          variant="outline"
                          className="w-full border-red-500/30 hover:border-red-500/50 text-red-400 hover:bg-red-950/20 py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors font-bold"
                        >
                          <Undo2 className="w-4 h-4" />
                          Batalkan Pengambilan Souvenir
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 2: ATTENDANCE LIST ==================== */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          
          {/* Header Action: PDF Laporan */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                placeholder="Cari daftar hadir..."
                className="pl-9 h-10 bg-[#022c22]/10 border-[#D4AF37]/20 text-white rounded-xl focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] text-xs"
              />
            </div>
            
            <a 
              href="/api/reports/checkin" 
              target="_blank" 
              rel="noreferrer"
              className="w-full sm:w-auto shrink-0"
            >
              <Button className="w-full bg-[#022c22] border border-[#D4AF37]/45 hover:bg-[#033C2E] text-[#D4AF37] font-bold text-xs h-10 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(2,44,34,0.3)]">
                <FileText className="w-4 h-4" />
                Cetak PDF
              </Button>
            </a>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#022c22]/10 border border-[#D4AF37]/15 rounded-xl p-3 shadow text-center">
              <span className="text-[10px] text-gray-400 block font-semibold uppercase tracking-wider mb-0.5">Total Registrasi</span>
              <strong className="text-xl text-[#D4AF37] font-extrabold">{attendanceStats.registrationsCount} Form</strong>
            </div>
            <div className="bg-[#022c22]/10 border border-[#D4AF37]/15 rounded-xl p-3 shadow text-center">
              <span className="text-[10px] text-gray-400 block font-semibold uppercase tracking-wider mb-0.5">Total Jiwa Hadir</span>
              <strong className="text-xl text-emerald-400 font-extrabold">{attendanceStats.totalHeadcount} Jiwa</strong>
            </div>
            <div className="bg-black/30 border border-white/5 rounded-xl p-2.5 text-center text-xs">
              <span className="text-[9px] text-gray-400 block uppercase">Peserta / Pendamping</span>
              <span className="font-semibold text-white">{attendanceStats.totalPeserta}P / {attendanceStats.totalPendamping}D</span>
            </div>
            <div className="bg-black/30 border border-white/5 rounded-xl p-2.5 text-center text-xs">
              <span className="text-[9px] text-gray-400 block uppercase">Umum / Tuan Rumah</span>
              <span className="font-semibold text-white">{attendanceStats.umum} / {attendanceStats.tuanRumah}</span>
            </div>
          </div>

          {/* List display */}
          <div className="space-y-3">
            {loadingLists ? (
              <div className="py-10 text-center text-xs text-gray-400">Memuat daftar hadir...</div>
            ) : filteredCheckedIn.length === 0 ? (
              <div className="py-10 text-center text-xs text-gray-400 border border-white/5 rounded-xl bg-black/20">Tidak ada peserta yang check-in.</div>
            ) : (
              filteredCheckedIn.map((item) => {
                const name = item.registration_mode === "Mandiri" ? item.full_name : item.pic_name;
                const headcount = item.registration_mode === "Rombongan" ? ((item.checked_in_participants || 0) + (item.checked_in_companions || 0)) : 1;
                return (
                  <div 
                    key={item.id}
                    onClick={() => {
                      setSearchQuery(item.registration_code);
                      setScanResult({ registrations: [item], merchOrders: [] });
                      setActiveTab("scan");
                    }}
                    className="bg-black/40 border border-white/5 hover:border-[#D4AF37]/30 p-3 rounded-xl shadow cursor-pointer transition-colors flex items-center justify-between text-xs"
                  >
                    <div className="space-y-1 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-white uppercase tracking-wider">{item.registration_code}</span>
                        <span className="text-[9px] bg-[#022c22]/20 border border-[#D4AF37]/25 text-[#D4AF37] px-1.5 rounded font-medium">{item.registration_mode}</span>
                      </div>
                      <h4 className="font-bold text-white truncate max-w-[200px]">{name}</h4>
                      <p className="text-[10px] text-gray-400 truncate max-w-[200px]">{item.church_name}</p>
                    </div>
                    <div className="text-right shrink-0 space-y-1.5">
                      <span className="inline-flex bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded text-[10px]">{headcount} Jiwa</span>
                      <p className="text-[9px] text-gray-500 font-mono">{new Date(item.checked_in_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 3: MERCHANDISE LIST ==================== */}
      {activeTab === "merchandise" && (
        <div className="space-y-6">
          
          {/* Header Action: PDF Laporan */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                placeholder="Cari pengambilan souvenir..."
                className="pl-9 h-10 bg-[#022c22]/10 border-[#D4AF37]/20 text-white rounded-xl focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] text-xs"
              />
            </div>
            
            <a 
              href="/api/reports/merch-collected" 
              target="_blank" 
              rel="noreferrer"
              className="w-full sm:w-auto shrink-0"
            >
              <Button className="w-full bg-[#022c22] border border-[#D4AF37]/45 hover:bg-[#033C2E] text-[#D4AF37] font-bold text-xs h-10 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(2,44,34,0.3)]">
                <FileText className="w-4 h-4" />
                Cetak PDF
              </Button>
            </a>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#022c22]/10 border border-[#D4AF37]/15 rounded-xl p-3 shadow text-center">
              <span className="text-[10px] text-gray-400 block font-semibold uppercase tracking-wider mb-0.5">Total Pengambilan</span>
              <strong className="text-xl text-[#D4AF37] font-extrabold">{merchStats.orderCount} Transaksi</strong>
            </div>
            <div className="bg-[#022c22]/10 border border-[#D4AF37]/15 rounded-xl p-3 shadow text-center">
              <span className="text-[10px] text-gray-400 block font-semibold uppercase tracking-wider mb-0.5">Total Item Diserahkan</span>
              <strong className="text-xl text-emerald-400 font-extrabold">{merchStats.itemCount} Souvenir</strong>
            </div>
          </div>

          {/* List display */}
          <div className="space-y-3">
            {loadingLists ? (
              <div className="py-10 text-center text-xs text-gray-400">Memuat daftar pengambilan...</div>
            ) : filteredCollectedMerch.length === 0 ? (
              <div className="py-10 text-center text-xs text-gray-400 border border-white/5 rounded-xl bg-black/20">Tidak ada souvenir yang diserahkan.</div>
            ) : (
              filteredCollectedMerch.map((item) => {
                return (
                  <div 
                    key={item.id}
                    onClick={() => {
                      setSearchQuery(item.id);
                      setScanResult({ registrations: [], merchOrders: [item] });
                      setActiveTab("scan");
                    }}
                    className="bg-black/40 border border-white/5 hover:border-[#D4AF37]/30 p-3 rounded-xl shadow cursor-pointer transition-colors flex items-center justify-between text-xs"
                  >
                    <div className="space-y-1 pr-2 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-white uppercase tracking-wider">#MB-{item.id.slice(0, 6).toUpperCase()}</span>
                        {item.registration_code && <span className="text-[9px] bg-white/5 border border-white/10 text-gray-400 px-1 rounded">{item.registration_code}</span>}
                      </div>
                      <h4 className="font-bold text-white truncate">{item.buyer_name}</h4>
                      <p className="text-[10px] text-gray-400 truncate">{item.item_type}</p>
                    </div>
                    <div className="text-right shrink-0 space-y-1.5 pl-2">
                      <span className="inline-flex bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded text-[10px]">{item.quantity || 1} Pcs</span>
                      <p className="text-[9px] text-gray-500 font-mono">{new Date(item.collected_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
