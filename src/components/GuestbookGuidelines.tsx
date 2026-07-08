"use client";

import { useState, useEffect } from "react";
import { Info, BookOpen, ShieldCheck, ChevronDown } from "lucide-react";

export function GuestbookGuidelines() {
  const [activeTab, setActiveTab] = useState<"info" | "panduan" | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(true);
  const [isGuideOpen, setIsGuideOpen] = useState(true);

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

  const renderInfoContent = () => (
    <div className="space-y-3 pt-2 text-left text-xs leading-relaxed text-gray-300">
      <div className="inline-flex w-fit items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-xl font-bold">
        <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
        Sistem Moderasi Aktif
      </div>
      <p>
        Seluruh ucapan, doa, dan foto profil yang dikirimkan melalui Buku Tamu Digital ini akan <strong>ditinjau terlebih dahulu oleh panitia/admin</strong> sebelum ditampilkan secara publik. Hal ini demi menjaga kenyamanan, sopan santun, dan ketertiban bersama.
      </p>
      <p>
        Ucapan yang telah disetujui oleh panitia akan langsung muncul pada daftar ucapan di sebelah kanan layar (atau di bawah form pada perangkat mobile) secara real-time.
      </p>
    </div>
  );

  const renderPanduanContent = () => (
    <div className="space-y-3 pt-2 text-left text-xs text-gray-300">
      <ol className="list-decimal list-inside space-y-2 leading-relaxed">
        <li>
          <strong className="text-[#D4AF37]">Unggah Foto Profil (Opsional):</strong>
          <p className="pl-4 text-[11px] text-gray-400">Pilih foto wajah terbaik Anda (Format JPG/PNG, maksimal 5MB) untuk disematkan di sebelah nama Anda.</p>
        </li>
        <li>
          <strong className="text-[#D4AF37]">Lengkapi Identitas Diri:</strong>
          <p className="pl-4 text-[11px] text-gray-400">Isi Nama Lengkap dan pilih asal jemaat GPIB Anda (Mupel &amp; Jemaat) atau pilih kategori <strong>Umum / Non-GPIB</strong>.</p>
        </li>
        <li>
          <strong className="text-[#D4AF37]">Tulis Ucapan &amp; Doa Harapan:</strong>
          <p className="pl-4 text-[11px] text-gray-400">Tuliskan pesan sukacita atau doa harapan terbaik Anda untuk HUT ke-16 PKLU GPIB (maksimal 300 karakter).</p>
        </li>
        <li>
          <strong className="text-[#D4AF37]">Kirim ke Sistem:</strong>
          <p className="pl-4 text-[11px] text-gray-400">Klik tombol <strong>Kirim Doa Ucapan</strong>. Ucapan Anda akan masuk ke antrean persetujuan panitia dan segera ditayangkan.</p>
        </li>
      </ol>
    </div>
  );

  return (
    <div className="w-full">
      {/* Info & Panduan Blocks (Desktop Side-by-Side, Mobile Responsive Tabs) */}
      {isMobile ? (
        <div className="space-y-4">
          {/* Mobile Side-by-Side Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === "info" ? null : "info")}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-bold transition-all duration-300 cursor-pointer ${
                activeTab === "info"
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
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-bold transition-all duration-300 cursor-pointer ${
                activeTab === "panduan"
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
            className={`transition-all duration-300 overflow-hidden ${
              activeTab !== null
                ? "max-h-[1200px] opacity-100 p-4 sm:p-5 border border-[#D4AF37]/30 bg-black/60 rounded-2xl shadow-inner mt-2 animate-in fade-in duration-300"
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
                Informasi Buku Tamu
              </h2>
              <ChevronDown
                className={`w-5 h-5 text-[#D4AF37] transition-transform duration-300 shrink-0 ml-2 group-hover/btn:translate-y-0.5 ${
                  isInfoOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`transition-all duration-300 overflow-hidden ${
                isInfoOpen ? "max-h-[1000px] opacity-100 mt-4" : "max-h-0 opacity-0 pointer-events-none"
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
                Tata Cara / Panduan Mengisi
              </h2>
              <ChevronDown
                className={`w-5 h-5 text-[#D4AF37] transition-transform duration-300 shrink-0 ml-2 group-hover/btn:translate-y-0.5 ${
                  isGuideOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`transition-all duration-300 overflow-hidden ${
                isGuideOpen ? "max-h-[1200px] opacity-100 mt-4" : "max-h-0 opacity-0 pointer-events-none"
              }`}
            >
              {renderPanduanContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
