"use client";

import { useState, useRef, useEffect } from "react";
import { AmanauraGenerator } from "@/components/AmanauraGenerator";
import { SocialMediaCampaignKit } from "@/components/SocialMediaCampaignKit";
import { CheckCircle2, ArrowDown, Info, BookOpen, ChevronDown } from "lucide-react";

export function AmanauraPageClient() {
  const [downloaded, setDownloaded] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "panduan" | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(true);
  const [isGuideOpen, setIsGuideOpen] = useState(true);
  const kitRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setActiveTab(null);
    }
  }, [isMobile]);

  const handleDownloadSuccess = () => {
    setDownloaded(true);
    setTimeout(() => {
      kitRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  const renderInfoContent = () => (
    <div className="space-y-3 pt-2 text-left text-xs leading-relaxed text-gray-300">
      <p>
        <strong>Amanaura Frame</strong> adalah bingkai foto digital resmi yang disediakan khusus oleh panitia untuk merayakan dan memeriahkan <strong>HUT ke-16 Pelayanan Kategorial Lanjut Usia (PKLU) GPIB 2026</strong>.
      </p>
      <p>
        Kampanye digital ini bertujuan untuk mempersatukan seluruh warga jemaat, khususnya lansia GPIB, untuk membagikan sukacita perayaan ke jejaring sosial. Melalui bingkai foto ini, Anda dapat menunjukkan partisipasi aktif dan menyebarkan semangat pelayanan bertema <strong>"Teruskan Baktimu"</strong>.
      </p>
      <p className="text-[11px] text-amber-300 font-semibold bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/25">
        📌 Foto yang Anda unduh di halaman ini diproses secara lokal di dalam browser Anda, menjamin privasi foto pribadi Anda sepenuhnya aman.
      </p>
    </div>
  );

  const renderPanduanContent = () => (
    <div className="space-y-3 pt-2 text-left text-xs text-gray-300">
      <ol className="list-decimal list-inside space-y-2 leading-relaxed">
        <li>
          <strong className="text-[#D4AF37]">Pilih Foto Profil:</strong>
          <p className="pl-4 text-[11px] text-gray-400">Klik tombol <strong>Pilih / Ambil Foto</strong> untuk memasukkan foto terbaik Anda dari galeri perangkat atau kamera HP.</p>
        </li>
        <li>
          <strong className="text-[#D4AF37]">Sesuaikan Posisi &amp; Zoom:</strong>
          <p className="pl-4 text-[11px] text-gray-400">Gunakan slider <strong>Zoom</strong> untuk memperbesar/memperkecil, lalu geser (drag) foto Anda agar posisinya pas di tengah-tengah lingkaran bingkai.</p>
        </li>
        <li>
          <strong className="text-[#D4AF37]">Unduh Hasil Bingkai:</strong>
          <p className="pl-4 text-[11px] text-gray-400">Klik <strong>Download Hasil Amanaura (JPG)</strong> untuk mengunduh foto berbingkai dengan resolusi tinggi 1080x1080 piksel ke galeri Anda.</p>
        </li>
        <li>
          <strong className="text-[#D4AF37]">Salin &amp; Posting Caption:</strong>
          <p className="pl-4 text-[11px] text-gray-400">Pilih tab media sosial yang diinginkan di area Kit Sosmed, klik tombol <strong>Salin Caption</strong>, lalu unggah foto dan tempel caption tersebut di media sosial Anda.</p>
        </li>
      </ol>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Info & Panduan Blocks (Desktop Side-by-Side, Mobile Responsive Tabs) */}
      {isMobile ? (
        <div className="space-y-4">
          {/* Mobile Side-by-Side Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === "info" ? null : "info")}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-bold transition-all duration-300 cursor-pointer ${activeTab === "info"
                  ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                  : "bg-black/60 text-gray-300 border-white/10 hover:bg-black/85"
                }`}
            >
              <Info className="w-4 h-4 shrink-0" />
              Info
            </button>

            <button
              type="button"
              onClick={() => setActiveTab(activeTab === "panduan" ? null : "panduan")}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-bold transition-all duration-300 cursor-pointer ${activeTab === "panduan"
                  ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                  : "bg-black/60 text-gray-300 border-white/10 hover:bg-black/85"
                }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              Panduan
            </button>
          </div>

          {/* Collapsible Panel Content */}
          <div
            className={`transition-all duration-300 overflow-hidden ${activeTab !== null
                ? "max-h-[1200px] opacity-100 p-4 sm:p-5 border border-[#D4AF37]/30 bg-black/60 rounded-2xl shadow-inner mt-2"
                : "max-h-0 opacity-0 pointer-events-none"
              }`}
          >
            {activeTab === "info" && renderInfoContent()}
            {activeTab === "panduan" && renderPanduanContent()}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Info */}
          <div className="rounded-2xl border border-white/10 bg-black/45 p-4 sm:p-5 md:p-6 text-sm text-[#FDFBF7] space-y-4 shadow-lg">
            <button
              type="button"
              onClick={() => setIsInfoOpen(!isInfoOpen)}
              className="w-full flex items-center justify-between text-[#D4AF37] text-left cursor-pointer focus:outline-none group/btn"
            >
              <h2 className="text-sm sm:text-base font-bold flex items-center gap-2">
                <Info className="w-5 h-5 text-[#D4AF37] shrink-0" />
                Informasi Amanaura
              </h2>
              <ChevronDown
                className={`w-5 h-5 text-[#D4AF37] transition-transform duration-300 shrink-0 ml-2 group-hover/btn:translate-y-0.5 ${isInfoOpen ? "rotate-180" : ""
                  }`}
              />
            </button>
            <div
              className={`transition-all duration-300 overflow-hidden ${isInfoOpen ? "max-h-[1000px] opacity-100 mt-4" : "max-h-0 opacity-0 pointer-events-none"
                }`}
            >
              {renderInfoContent()}
            </div>
          </div>

          {/* Card Panduan */}
          <div className="rounded-2xl border border-white/10 bg-black/45 p-4 sm:p-5 md:p-6 text-sm text-[#FDFBF7] space-y-4 shadow-lg">
            <button
              type="button"
              onClick={() => setIsGuideOpen(!isGuideOpen)}
              className="w-full flex items-center justify-between text-[#D4AF37] text-left cursor-pointer focus:outline-none group/btn"
            >
              <h2 className="text-sm sm:text-base font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#D4AF37] shrink-0" />
                Tata Cara / Panduan Amanaura
              </h2>
              <ChevronDown
                className={`w-5 h-5 text-[#D4AF37] transition-transform duration-300 shrink-0 ml-2 group-hover/btn:translate-y-0.5 ${isGuideOpen ? "rotate-180" : ""
                  }`}
              />
            </button>
            <div
              className={`transition-all duration-300 overflow-hidden ${isGuideOpen ? "max-h-[1200px] opacity-100 mt-4" : "max-h-0 opacity-0 pointer-events-none"
                }`}
            >
              {renderPanduanContent()}
            </div>
          </div>
        </div>
      )}

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
