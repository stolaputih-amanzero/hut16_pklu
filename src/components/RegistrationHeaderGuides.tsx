"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Phone, Info, ChevronDown, BookOpen } from "lucide-react";

export function RegistrationHeaderGuides() {
  const [activeTab, setActiveTab] = useState<"info" | "panduan" | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // For desktop independent collapse states
  const [isInfoOpen, setIsInfoOpen] = useState(true);
  const [isPanduanOpen, setIsPanduanOpen] = useState(true);

  // If mobile state changes, reset active tab
  useEffect(() => {
    if (isMobile) {
      setActiveTab(null); // Collapsed by default on mobile
    }
  }, [isMobile]);

  const renderInfoContent = () => (
    <div className="grid gap-5 md:grid-cols-2 text-sm text-gray-300 pt-2">
      {/* Informasi Kegiatan */}
      <div className="space-y-4">
        <div>
          <p className="font-bold text-[#D4AF37] text-lg mb-1">Bertumbuh dalam Keselamatan</p>
          <p className="italic text-gray-400">Sub Tema: Lansia Teladan dalam Iman, Karya dan Pelayanan</p>
          <p className="font-semibold mt-1">Tagline: "Teruskan Baktimu"</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-full bg-[#D4AF37]/10 shrink-0">
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <span>Senin, 12 Oktober 2026</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-full bg-[#D4AF37]/10 shrink-0">
              <Clock className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <span>08.00 WIB s/d selesai</span>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-full bg-[#D4AF37]/10 shrink-0 mt-0.5">
              <MapPin className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <span>
              Bekasi Convention Center (BCC),
              <br />
              Hotel Santika Mega Mall, Bekasi
            </span>
          </div>
        </div>
      </div>

      {/* Informasi & Bantuan */}
      <div className="space-y-3 border-t md:border-t-0 md:border-l border-white/10 pt-5 md:pt-0 md:pl-6 flex flex-col justify-center">
        <p className="font-semibold text-white">Informasi &amp; Bantuan (Humas):</p>
        <div className="flex flex-col gap-3">
          <a
            href="https://wa.me/628986955114"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 group hover:bg-emerald-500/20"
          >
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4" />
              <span className="font-medium">Gladys Tutuarima</span>
            </div>
            <span className="text-xs bg-emerald-500/20 px-2 py-1 rounded text-emerald-300 group-hover:bg-emerald-500/30">
              Hubungi WA
            </span>
          </a>
          <a
            href="https://wa.me/6285212133173"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 group hover:bg-emerald-500/20"
          >
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4" />
              <span className="font-medium">Sharon Hento</span>
            </div>
            <span className="text-xs bg-emerald-500/20 px-2 py-1 rounded text-emerald-300 group-hover:bg-emerald-500/30">
              Hubungi WA
            </span>
          </a>
        </div>
      </div>
    </div>
  );

  const renderPanduanContent = () => (
    <div className="space-y-6 pt-2 max-h-[70vh] overflow-y-auto pr-2">
      {/* Pendaftaran Mandiri */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-[#D4AF37] border-b border-[#D4AF37]/20 pb-1">
          A. Pendaftaran Mandiri (1 Orang)
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-xs text-gray-300 leading-relaxed">
          <li>Pilih <strong>Kategori</strong> dan <strong>Asal Jemaat</strong> Anda.</li>
          <li>Isi data diri Anda di bagian <strong>Pendaftar (Mandiri)</strong>.</li>
          <li>Jika Anda adalah <span className="text-blue-400">Peserta</span>, Anda wajib memilih peran dan surat tugas. (Unggah surat tugas pribadi Anda di kolom <em>Surat Tugas</em> di bagian bawah).</li>
          <li>Lakukan pembayaran sesuai nominal kategori Anda (Umum: Rp 475.000, Tuan Rumah: Rp 350.000).</li>
          <li>Unggah <strong>Bukti Transfer</strong> di bagian bawah form.</li>
          <li>Klik tombol <strong>Kirim Formulir Pendaftaran</strong>.</li>
        </ol>
      </div>

      {/* Pendaftaran Rombongan */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-[#D4AF37] border-b border-[#D4AF37]/20 pb-1">
          B. Pendaftaran Rombongan / Bulk (Lebih dari 1 Orang)
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-xs text-gray-300 leading-relaxed">
          <li>Pilih mode pendaftaran <strong>Jalur Cepat Rombongan</strong>.</li>
          <li>Pilih <strong>Kategori</strong> dan <strong>Asal Jemaat</strong> untuk rombongan ini (semua peserta dalam 1 form harus dari Jemaat yang sama).</li>
          <li>Isi data Penanggung Jawab (PIC).</li>
          <li>Masukkan total Jumlah Peserta dan Pendamping.</li>
          <li>Isi <strong>Kuantitas Ukuran Kaos</strong> rombongan di kotak yang disediakan. Pastikan total kaos sama dengan jumlah orang.</li>
          <li>Unggah <strong>File Daftar Nama (Excel/PDF)</strong> yang memuat nama-nama anggota rombongan.</li>
          <li>Lakukan pembayaran <span className="font-semibold text-white">secara kumulatif / total</span> untuk semua orang dalam 1 kali transfer.</li>
          <li>Unggah 1 Bukti Transfer dan 1 Surat Tugas Kolektif (jika ada *Peserta*).</li>
          <li>Klik tombol <strong>Kirim Formulir Pendaftaran</strong>.</li>
        </ol>
      </div>
    </div>
  );

  if (isMobile) {
    return (
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
              ? "max-h-[1200px] opacity-100 p-4 sm:p-5 border border-[#D4AF37]/30 bg-black/60 rounded-2xl shadow-inner mt-2"
              : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          {activeTab === "info" && renderInfoContent()}
          {activeTab === "panduan" && renderPanduanContent()}
        </div>
      </div>
    );
  }

  // Desktop view: separate collapsible blocks stacked
  return (
    <div className="space-y-6">
      {/* 1. Informasi Kegiatan Card */}
      <div className="rounded-2xl border border-[#D4AF37]/30 bg-black/60 p-4 sm:p-5 md:p-6 text-sm text-[#FDFBF7] space-y-4 shadow-inner">
        <button
          type="button"
          onClick={() => setIsInfoOpen(!isInfoOpen)}
          className="w-full flex items-center justify-between text-[#D4AF37] text-left cursor-pointer focus:outline-none"
        >
          <h2 className="text-base font-bold flex items-center gap-2">
            <Info className="w-5 h-5 text-[#D4AF37]" />
            Informasi Kegiatan &amp; Bantuan Panitia:
          </h2>
          <ChevronDown
            className={`w-5 h-5 text-[#D4AF37] transition-transform duration-300 shrink-0 ml-2 ${
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

      {/* 2. Panduan Pendaftaran Card */}
      <div className="rounded-2xl border border-[#D4AF37]/30 bg-black/60 p-4 sm:p-5 md:p-6 text-sm text-[#FDFBF7] space-y-4 shadow-inner">
        <button
          type="button"
          onClick={() => setIsPanduanOpen(!isPanduanOpen)}
          className="w-full flex items-center justify-between text-[#D4AF37] text-left cursor-pointer focus:outline-none"
        >
          <h2 className="text-base font-bold flex items-center gap-2">
            <Info className="w-5 h-5 text-[#D4AF37]" />
            Tata Cara / Panduan Pendaftaran:
          </h2>
          <ChevronDown
            className={`w-5 h-5 text-[#D4AF37] transition-transform duration-300 shrink-0 ml-2 ${
              isPanduanOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        <div
          className={`transition-all duration-300 overflow-hidden ${
            isPanduanOpen ? "max-h-[1200px] opacity-100 mt-4" : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          {renderPanduanContent()}
        </div>
      </div>
    </div>
  );
}
