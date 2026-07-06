"use client";

import { useState, useEffect } from "react";
import { HelpCircle, ShieldCheck, CheckCircle2, ChevronDown } from "lucide-react";

export function GuestbookGuidelines() {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  }, []);

  return (
    <div className="rounded-2xl border border-[#D4AF37]/30 bg-black/60 p-4 sm:p-5 md:p-6 text-sm text-[#FDFBF7] space-y-4 shadow-inner">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-[#D4AF37] text-left cursor-pointer focus:outline-none"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <h2 className="text-base font-bold flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#D4AF37]" />
            Panduan
          </h2>
          <div className="inline-flex w-fit items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            Ditinjau Panitia Sebelum Tayang
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-[#D4AF37] transition-transform duration-300 shrink-0 ml-2 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`transition-all duration-300 overflow-hidden ${
          isOpen ? "max-h-[1000px] opacity-100 mt-4" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="space-y-4 pt-2">
          <div className="grid gap-3 sm:grid-cols-3 text-xs">
            <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
              <span className="font-bold text-[#D4AF37] block">1. Unggah Foto Profil (Opsional)</span>
              <p className="text-gray-300">Pilih foto terbaik Anda (maks 5MB) untuk ditampilkan di samping nama ucapan Anda.</p>
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
              <span className="font-bold text-[#D4AF37] block">2. Isi Nama &amp; Asal Jemaat</span>
              <p className="text-gray-300">Isi nama lengkap dan pilih asal Mupel/Jemaat GPIB Anda (atau pilih opsi <em>Umum / Non-GPIB</em>).</p>
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
              <span className="font-bold text-[#D4AF37] block">3. Tuliskan Ucapan &amp; Doa</span>
              <p className="text-gray-300">Tulis ucapan sukacita dan harapan Anda untuk HUT ke-16 PKLU GPIB (maksimal 300 karakter).</p>
            </div>
          </div>

          {/* Admin Moderation Notice */}
          <div className="p-3 bg-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/30 text-xs text-gray-200 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Catatan Moderasi:</strong> Demi kenyamanan dan kerapian bersama, seluruh ucapan yang dikirimkan akan <strong>ditinjau terlebih dahulu oleh panitia/admin</strong> sebelum ditampilkan secara resmi pada daftar ucapan publik.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
