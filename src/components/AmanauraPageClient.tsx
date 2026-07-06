"use client";

import { useState, useRef, useEffect } from "react";
import { AmanauraGenerator } from "@/components/AmanauraGenerator";
import { SocialMediaCampaignKit } from "@/components/SocialMediaCampaignKit";
import { CheckCircle2, ArrowDown, HelpCircle, ChevronDown } from "lucide-react";

export function AmanauraPageClient() {
  const [downloaded, setDownloaded] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(true);
  const kitRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsGuideOpen(false);
    }
  }, []);

  const handleDownloadSuccess = () => {
    setDownloaded(true);
    setTimeout(() => {
      kitRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  return (
    <div className="space-y-8">
      {/* Step-by-Step Guide Card */}
      <div className="rounded-2xl border border-[#D4AF37]/30 bg-black/60 p-4 sm:p-5 md:p-6 text-sm text-[#FDFBF7] space-y-4 shadow-inner">
        <button
          onClick={() => setIsGuideOpen(!isGuideOpen)}
          className="w-full flex items-center justify-between text-[#D4AF37] text-left cursor-pointer focus:outline-none"
        >
          <h2 className="text-base font-bold flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#D4AF37]" />
            Panduan
          </h2>
          <ChevronDown
            className={`w-5 h-5 text-[#D4AF37] transition-transform duration-300 shrink-0 ml-2 ${
              isGuideOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        <div
          className={`transition-all duration-300 overflow-hidden ${
            isGuideOpen ? "max-h-[1000px] opacity-100 mt-4" : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs pt-2">
            <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
              <span className="font-bold text-[#D4AF37] block">1. Pilih Foto</span>
              <p className="text-gray-300">Klik tombol <strong>Pilih / Ambil Foto</strong> untuk memasukkan foto terbaik Anda dari galeri HP atau kamera.</p>
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
              <span className="font-bold text-[#D4AF37] block">2. Atur Posisi &amp; Zoom</span>
              <p className="text-gray-300">Geser foto menggunakan jari/mouse dan sesuaikan ukuran slider <strong>Zoom</strong> agar pas di tengah frame.</p>
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
              <span className="font-bold text-[#D4AF37] block">3. Unduh Hasil</span>
              <p className="text-gray-300">Klik <strong>Download Hasil Amanaura</strong> untuk menyimpan gambar Amanaura berformat JPG 1080x1080 ke galeri HP Anda.</p>
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
              <span className="font-bold text-[#D4AF37] block">4. Salin Caption &amp; Share</span>
              <p className="text-gray-300">Pilih tab media sosial (IG, FB, TikTok, WA), klik <strong>Salin Caption</strong>, lalu posting foto Amanaura Anda!</p>
            </div>
          </div>
        </div>
      </div>

      {downloaded && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 p-4 rounded-xl text-emerald-300 text-sm flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              <strong>Amanaura Berhasil Diunduh!</strong> Sekarang salin caption di bawah untuk diposting ke media sosial Anda.
            </span>
          </div>
          <ArrowDown className="w-5 h-5 animate-bounce hidden sm:block text-emerald-400" />
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2 items-stretch">
        <AmanauraGenerator onDownloadSuccess={handleDownloadSuccess} />
        
        <div ref={kitRef} className="transition-all duration-300 h-full">
          <SocialMediaCampaignKit />
        </div>
      </div>
    </div>
  );
}
