"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getRegistrationByCode } from "@/app/(public)/daftar/actions";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, CheckCircle2, AlertCircle, Calendar, MapPin, ShieldCheck, Download } from "lucide-react";

function CheckContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "";

  const [query, setQuery] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
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

  const handleSearch = async (codeToSearch?: string) => {
    const q = codeToSearch || query;
    if (!q.trim()) return;
    setLoading(true);
    setErrorMsg("");
    setResults(null);

    const res = await getRegistrationByCode(q);
    setLoading(false);

    if (res.success && res.registrations) {
      setResults(res.registrations);
    } else {
      setErrorMsg(res.error || "Data tidak ditemukan");
    }
  };

  useEffect(() => {
    if (initialCode) {
      handleSearch(initialCode);
    }
  }, [initialCode]);

  return (
    <div className="container mx-auto min-h-screen py-10 px-4">
      <div className="mx-auto max-w-2xl space-y-8 rounded-2xl bg-black/60 p-6 md:p-8 backdrop-blur-md border border-[#D4AF37]/30 shadow-2xl text-[#FDFBF7]">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 mb-2">
            <ShieldCheck className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#D4AF37]">Cek Status Pendaftaran</h1>
          <p className="text-sm text-gray-300">Masukkan Kode Registrasi (PKLU-XXXXX) atau No WhatsApp untuk verifikasi status.</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-3">
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Contoh: PKLU-A8K9X atau 08123456789" 
            className="bg-black/50 text-white border-[#D4AF37]/30 py-6"
          />
          <Button type="submit" disabled={loading} className="bg-[#D4AF37] hover:bg-[#B3932D] text-black font-bold px-6 py-6">
            {loading ? "Mencari..." : <><Search className="w-5 h-5 mr-1" /> Cari</>}
          </Button>
        </form>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-center gap-3 text-red-400 text-sm">
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
                  className="rounded-xl border border-[#D4AF37]/40 bg-[#0B0904] p-6 space-y-6 shadow-[0_0_20px_rgba(212,175,55,0.15)] relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-4 gap-3">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-gray-400">Kode Registrasi</span>
                      <h2 className="text-2xl font-black text-[#D4AF37] font-mono tracking-wider">{reg.registration_code}</h2>
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-1.5 rounded-full text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      Status: TEREKAM & VALID
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-3 items-center">
                    {/* Details */}
                    <div className="md:col-span-2 space-y-2 text-sm">
                      <p><span className="text-gray-400">Mode:</span> <strong>{reg.registration_mode}</strong></p>
                      <p><span className="text-gray-400">Kategori:</span> <strong>{reg.category}</strong></p>
                      <p><span className="text-gray-400">Asal Jemaat:</span> <strong>{reg.church_name} ({reg.mupel})</strong></p>
                      {reg.registration_mode === "Mandiri" ? (
                        <>
                          <p><span className="text-gray-400">Nama Pendaftar:</span> <strong>{reg.full_name}</strong></p>
                          <p><span className="text-gray-400">Tipe / Peran:</span> <strong>{reg.type} {reg.role ? `(${reg.role})` : ""}</strong></p>
                          <p><span className="text-gray-400">Ukuran Kaos:</span> <strong>{reg.shirt_size || "Acak"}</strong></p>
                        </>
                      ) : (
                        <>
                          <p><span className="text-gray-400">PIC Rombongan:</span> <strong>{reg.pic_name}</strong></p>
                          <p><span className="text-gray-400">Total Orang:</span> <strong>{(reg.participant_count || 0) + (reg.companion_count || 0)} Orang</strong> ({reg.participant_count} Peserta, {reg.companion_count} Pendamping)</p>
                          {reg.shirt_sizes_summary && (
                            <div className="mt-2 pt-2 border-t border-white/10 text-xs">
                              <p className="text-gray-400 mb-1">Rekap Baju:</p>
                              <div className="flex flex-wrap gap-1.5 font-mono">
                                {Object.entries(reg.shirt_sizes_summary).map(([sz, qty]) => (
                                  Number(qty) > 0 ? <span key={sz} className="bg-white/10 px-2 py-0.5 rounded text-white">{sz}: {String(qty)}</span> : null
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      <p className="text-xs text-gray-400 pt-2 border-t border-white/10">Waktu Daftar: {new Date(reg.created_at).toLocaleString("id-ID")}</p>
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
                      className="bg-[#D4AF37] hover:bg-[#B3932D] text-black font-bold text-xs py-2 px-4 rounded-lg inline-flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(212,175,55,0.15)]"
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
