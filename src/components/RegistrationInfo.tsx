"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Phone, Info, ChevronDown } from "lucide-react";

export function RegistrationInfo() {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  }, []);

  return (
    <div className="rounded-2xl border border-[#D4AF37]/30 bg-black/60 p-4 sm:p-5 md:p-6 text-sm text-[#FDFBF7] space-y-4 shadow-inner">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-[#D4AF37] text-left cursor-pointer focus:outline-none"
      >
        <h2 className="text-base font-bold flex items-center gap-2">
          <Info className="w-5 h-5 text-[#D4AF37]" />
          Informasi Kegiatan &amp; Bantuan Panitia:
        </h2>
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
      </div>
    </div>
  );
}
