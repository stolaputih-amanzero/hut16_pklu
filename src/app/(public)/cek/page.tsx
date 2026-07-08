"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getRegistrationByCode } from "@/app/(public)/daftar/actions";
import { getMerchOrderByCodeOrWa } from "@/app/(public)/merch/actions";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, CheckCircle2, AlertCircle, Calendar, MapPin, ShieldCheck, Download, ShoppingBag } from "lucide-react";

function CheckContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "";
  const initialMerchId = searchParams.get("merch_id") || "";

  const [query, setQuery] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [merchResults, setMerchResults] = useState<any[] | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [downloadingCode, setDownloadingCode] = useState<string | null>(null);

  const downloadTicketImage = async (code: string) => {
    const element = document.getElementById(`ticket-${code}`);
    if (!element) return;
    setDownloadingCode(code);
    try {
      await new Promise((resolve) => setTimeout(resolve, 150));
      const { toPng } = await import("html-to-image");

      const dataUrl = await toPng(element, {
        cacheBust: true,
        backgroundColor: "#0B0904",
        pixelRatio: 3,
        style: {
          borderRadius: "12px",
        },
        filter: (node: any) => {
          if (node.classList?.contains("no-export")) {
            return false;
          }
          return true;
        }
      });

      const link = document.createElement("a");
      link.download = `PKLU-Registration-${code}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Gagal menyimpan gambar:", err);
      alert("Gagal menyimpan gambar. Silakan coba screenshot layar Anda.");
    } finally {
      setDownloadingCode(null);
    }
  };

  const handleSearch = async (codeToSearch?: string, merchIdToSearch?: string) => {
    const q = (codeToSearch !== undefined ? codeToSearch : query).trim();
    const merchId = merchIdToSearch || initialMerchId;

    if (!q && !merchId) return;
    setLoading(true);
    setErrorMsg("");
    setResults(null);
    setMerchResults(null);

    let hasReg = false;
    let hasMerch = false;

    if (q) {
      const res = await getRegistrationByCode(q);
      if (res.success && res.registrations) {
        setResults(res.registrations);
        hasReg = true;
      }

      const resMerch = await getMerchOrderByCodeOrWa(q);
      if (resMerch.success && resMerch.data && resMerch.data.length > 0) {
        setMerchResults(resMerch.data);
        hasMerch = true;
      }
    } else if (merchId) {
      const resMerch = await getMerchOrderByCodeOrWa(merchId);
      if (resMerch.success && resMerch.data && resMerch.data.length > 0) {
        setMerchResults(resMerch.data);
        hasMerch = true;
      }
    }

    setLoading(false);

    if (!hasReg && !hasMerch) {
      setErrorMsg("Data pendaftaran atau pembelian merchandise tidak ditemukan.");
    }
  };

  // Check if we are checking merchandise or registration
  const isMerchMode = !!initialMerchId || (merchResults && merchResults.length > 0 && (!results || results.length === 0));

  const titleText = isMerchMode ? "Cek Status Pembelian Merchandise" : "Cek Status Pendaftaran";
  const subtext = isMerchMode
    ? "Masukkan Kode Registrasi (PKLU-XXXXX) atau No WhatsApp untuk verifikasi status pembelian merchandise."
    : "Masukkan Kode Registrasi (PKLU-XXXXX) atau No WhatsApp untuk verifikasi status.";
  const placeholderText = isMerchMode
    ? "Contoh: 08123456789 atau Kode Registrasi"
    : "Contoh: PKLU-A8K9X atau 08123456789";

  useEffect(() => {
    if (initialCode) {
      handleSearch(initialCode, "");
    } else if (initialMerchId) {
      handleSearch("", initialMerchId);
    }
  }, [initialCode, initialMerchId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.title = `${titleText} | HUT PKLU 16`;
    }
  }, [titleText]);

  return (
    <div className="container mx-auto min-h-screen py-6 sm:py-10 px-3 sm:px-4">
      <div className="mx-auto max-w-2xl space-y-6 sm:space-y-8 rounded-2xl bg-black/60 p-4 sm:p-6 md:p-8 backdrop-blur-md border border-[#D4AF37]/30 shadow-2xl text-[#FDFBF7]">
        <div className="text-center space-y-2.5">
          <div className="inline-flex p-3 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 mb-1">
            <ShieldCheck className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#D4AF37] tracking-tight leading-tight">{titleText}</h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto leading-relaxed">{subtext}</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex flex-col sm:flex-row gap-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholderText}
            className="bg-black/50 text-white border-[#D4AF37]/30 py-3.5 px-4 h-12 text-sm focus-visible:ring-1 focus-visible:ring-[#D4AF37]/50 rounded-xl"
          />
          <Button type="submit" disabled={loading} className="bg-[#D4AF37] hover:bg-[#B3932D] text-black font-bold h-12 py-3 px-6 shrink-0 rounded-xl transition-all duration-300 active:scale-[0.98] shadow-lg flex items-center justify-center gap-1.5">
            {loading ? "Mencari..." : <><Search className="w-4 h-4 mr-1.5" /> Cari</>}
          </Button>
        </form>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-center gap-3 text-red-400 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Results */}
        {results && results.length > 0 && (
          <div className="space-y-6">
            {results.map((reg) => {
              const fullUrl = typeof window !== "undefined" ? `${window.location.origin}/cek?code=${reg.registration_code}` : reg.registration_code;

              return (
                <div
                  key={reg.id}
                  id={`ticket-${reg.registration_code}`}
                  className="rounded-xl border border-[#D4AF37]/40 bg-[#0B0904] p-4 sm:p-6 space-y-6 shadow-[0_0_20px_rgba(212,175,55,0.15)] relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-4 gap-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 block mb-0.5">Kode Registrasi</span>
                      <h2 className="text-2xl font-black text-[#D4AF37] font-mono tracking-wider">{reg.registration_code}</h2>
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-1.5 rounded-full text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      Status: TEREKAM &amp; VALID
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-3 items-center">
                    {/* Details */}
                    <div className="md:col-span-2 space-y-2.5 text-xs sm:text-sm">
                      <div className="flex justify-between py-1.5 border-b border-white/5 gap-2">
                        <span className="text-gray-400 shrink-0">Mode:</span>
                        <span className="font-semibold text-white text-right">{reg.registration_mode}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/5 gap-2">
                        <span className="text-gray-400 shrink-0">Kategori:</span>
                        <span className="font-semibold text-white text-right">{reg.category}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/5 gap-2">
                        <span className="text-gray-400 shrink-0">Asal Jemaat:</span>
                        <span className="font-semibold text-emerald-300 text-right">{reg.church_name} ({reg.mupel})</span>
                      </div>
                      {reg.registration_mode === "Mandiri" ? (
                        <>
                          <div className="flex justify-between py-1.5 border-b border-white/5 gap-2">
                            <span className="text-gray-400 shrink-0">Nama Pendaftar:</span>
                            <span className="font-semibold text-white text-right">{reg.full_name}</span>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-white/5 gap-2">
                            <span className="text-gray-400 shrink-0">Tipe / Peran:</span>
                            <span className="font-semibold text-white text-right">{reg.type} {reg.role ? `(${reg.role})` : ""}</span>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-white/5 gap-2">
                            <span className="text-gray-400 shrink-0">Ukuran Kaos:</span>
                            <span className="font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded text-xs">{reg.shirt_size || "Acak"}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between py-1.5 border-b border-white/5 gap-2">
                            <span className="text-gray-400 shrink-0">PIC Rombongan:</span>
                            <span className="font-semibold text-white text-right">{reg.pic_name}</span>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-white/5 gap-2">
                            <span className="text-gray-400 shrink-0">Total Orang:</span>
                            <span className="font-semibold text-white text-right">
                              {(reg.participant_count || 0) + (reg.companion_count || 0)} Orang <span className="text-xs text-gray-400 font-normal">({reg.participant_count} Peserta, {reg.companion_count} Pendamping)</span>
                            </span>
                          </div>
                          {reg.shirt_sizes_summary && (
                            <div className="py-2 border-b border-white/5">
                              <span className="text-gray-400 block mb-1.5">Rekap Baju:</span>
                              <div className="flex flex-wrap gap-1.5 font-mono">
                                {Object.entries(reg.shirt_sizes_summary).map(([sz, qty]) => (
                                  Number(qty) > 0 ? (
                                    <span key={sz} className="bg-white/10 px-2 py-0.5 rounded text-white text-[10px]">
                                      {sz}: {String(qty)}
                                    </span>
                                  ) : null
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      <div className="text-[10px] text-gray-500 pt-1.5">
                        Waktu Daftar: {new Date(reg.created_at).toLocaleString("id-ID")}
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl text-black space-y-2">
                      <QRCodeSVG value={fullUrl} size={130} level="H" />
                      <p className="text-[10px] font-bold text-gray-600 text-center tracking-tight">SCAN KODE VERIFIKASI</p>
                    </div>
                  </div>

                  {/* Actions Section (Excluded from image export via 'no-export' class) */}
                  <div className="flex justify-end pt-4 border-t border-white/10 no-export">
                    <Button
                      type="button"
                      disabled={downloadingCode === reg.registration_code}
                      onClick={() => downloadTicketImage(reg.registration_code)}
                      className="bg-[#D4AF37] hover:bg-[#B3932D] text-black font-bold text-xs py-2.5 px-4 rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(212,175,55,0.15)] w-full sm:w-auto h-10 transition-all active:scale-[0.98]"
                    >
                      <Download className="w-4 h-4" />
                      {downloadingCode === reg.registration_code ? "Menyimpan..." : "Simpan Gambar"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Merchandise Results */}
        {merchResults && merchResults.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-[#D4AF37]/20">
            <h3 className="text-lg font-bold text-[#D4AF37] flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
              Pembelian Souvenir / Merchandise
            </h3>
            <div className="space-y-4">
              {merchResults.map((order) => {
                const isPending = order.payment_status === "pending";
                const isVerified = order.payment_status === "verified";
                const isRejected = order.payment_status === "rejected";

                return (
                  <div
                    key={order.id}
                    className="rounded-xl border border-[#D4AF37]/35 bg-[#0B0904]/80 p-4 sm:p-5 space-y-4 shadow-lg text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3 gap-2.5">
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase tracking-wider">No Pembelian</span>
                        <span className="font-mono text-sm font-black text-[#D4AF37] uppercase">#MB-{order.id.slice(0, 6).toUpperCase()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isPending && (
                          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2.5 py-1 rounded-full font-semibold text-[10px] uppercase tracking-wider">
                            Tercatat, Menunggu Konfirmasi
                          </span>
                        )}
                        {isVerified && (
                          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-full font-semibold text-[10px] uppercase tracking-wider">
                            Confirmed (Lunas &amp; Terverifikasi)
                          </span>
                        )}
                        {isRejected && (
                          <span className="bg-red-500/20 text-red-400 border border-red-500/40 px-2.5 py-1 rounded-full font-semibold text-[10px] uppercase tracking-wider">
                            Pembayaran Ditolak
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 bg-black/40 p-4 rounded-xl border border-white/5 text-xs">
                      <div className="flex justify-between sm:block py-1 border-b border-white/5 sm:border-0 gap-2">
                        <span className="text-gray-400 block">Nama Pembeli:</span>
                        <span className="font-semibold text-white text-right sm:text-left">{order.buyer_name}</span>
                      </div>
                      <div className="flex justify-between sm:block py-1 border-b border-white/5 sm:border-0 gap-2">
                        <span className="text-gray-400 block">Asal Mupel/Gereja:</span>
                        <span className="font-semibold text-emerald-300 text-right sm:text-left">{order.church_city}</span>
                      </div>
                      <div className="flex justify-between sm:block py-1 border-b border-white/5 sm:border-0 gap-2">
                        <span className="text-gray-400 block">No WhatsApp:</span>
                        <span className="font-semibold text-white font-mono text-right sm:text-left">{order.whatsapp}</span>
                      </div>
                      <div className="flex justify-between sm:block py-1 border-b border-white/5 sm:border-0 gap-2">
                        <span className="text-gray-400 block">Tanggal Transfer/Bayar:</span>
                        <span className="font-semibold text-white text-right sm:text-left">
                          {order.payment_date ? new Date(order.payment_date).toLocaleDateString("id-ID", { dateStyle: "long" }) : "-"}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5">
                      <span className="text-gray-400 block mb-1.5 font-semibold">Rincian Souvenir:</span>
                      <div className="bg-black/40 p-3 rounded-lg border border-white/5 font-mono text-[11px] text-gray-200 space-y-1.5">
                        {order.item_type?.split(order.item_type.includes("; ") ? "; " : ", ").map((item: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <span className="text-[#D4AF37] shrink-0">•</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {order.notes && (
                      <div className="pt-2 border-t border-white/5">
                        <span className="text-gray-400 block mb-1 font-semibold">Catatan Pembeli:</span>
                        <p className="italic text-gray-300 leading-relaxed bg-black/20 p-2.5 rounded-lg border border-white/5">{order.notes}</p>
                      </div>
                    )}

                    {order.admin_notes && (
                      <div className="pt-2 border-t border-white/5 bg-amber-500/5 p-3 rounded-lg border border-amber-500/20">
                        <span className="text-[#D4AF37] font-bold block mb-1">Catatan Panitia:</span>
                        <p className="text-amber-200 italic font-medium">"{order.admin_notes}"</p>
                      </div>
                    )}

                    {order.payment_proof_url && (
                      <div className="pt-2 border-t border-white/5">
                        <span className="text-gray-400 block mb-1.5 font-semibold">Bukti Pembayaran:</span>
                        <div className="flex items-center gap-3 bg-black/30 p-2.5 rounded-lg border border-white/5">
                          <a
                            href={order.payment_proof_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block relative h-14 w-14 rounded-lg overflow-hidden border border-white/10 bg-black hover:opacity-85 transition-opacity shrink-0"
                          >
                            <img src={order.payment_proof_url} alt="Bukti Transfer" className="h-full w-full object-cover" />
                          </a>
                          <div className="text-[10px] text-gray-400">
                            <p className="font-semibold text-white mb-0.5">Bukti transfer terunggah</p>
                            <a
                              href={order.payment_proof_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#D4AF37] hover:underline font-semibold"
                            >
                              Lihat Gambar Penuh ↗
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckPage() {
  return (
    <Suspense fallback={<div className="text-center text-white py-20">Memuat...</div>}>
      <CheckContent />
    </Suspense>
  );
}
