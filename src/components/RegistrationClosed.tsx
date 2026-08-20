"use client";

import Link from "next/link";
import { 
  Lock, 
  CheckCircle2, 
  Search, 
  ShoppingBag, 
  Phone, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  HeartHandshake
} from "lucide-react";

export function RegistrationClosed() {
  return (
    <div className="space-y-8">
      {/* Main Closed Banner Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#022c22]/90 via-[#011c15]/95 to-black/90 p-6 md:p-10 border border-[#D4AF37]/30 shadow-[0_0_40px_rgba(212,175,55,0.1)] text-center">
        {/* Glow decoration */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />
        
        {/* Icon & Status Pill */}
        <div className="relative z-10 flex flex-col items-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest animate-pulse">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            Pendaftaran Resmi Ditutup
          </div>

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FDFBF7] via-[#D4AF37] to-[#FDFBF7]">
            Kuota Peserta Telah Terpenuhi
          </h2>

          <p className="text-gray-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed font-light">
            Terima kasih atas sukacita, antusiasme, dan partisipasi yang luar biasa dari seluruh Jemaat &amp; Pelkat PKLU GPIB se-Indonesia. Pendaftaran peserta untuk Ibadah Syukur Agung &amp; Perayaan HUT ke-16 Pelkat PKLU GPIB saat ini telah ditutup karena kapasitas gedung dan kuota peserta telah terpenuhi.
          </p>
        </div>

        {/* Primary Action Button (Cek Status / E-Ticket) */}
        <div className="relative z-10 pt-8 pb-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/cek"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] text-[#022c22] font-bold text-sm md:text-base hover:brightness-110 active:scale-98 transition-all shadow-[0_0_25px_rgba(212,175,55,0.25)] group"
          >
            <Search className="w-5 h-5 text-[#022c22]" />
            <span>Cek Status / Unduh E-Ticket</span>
            <ArrowRight className="w-4 h-4 text-[#022c22] transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          
          <Link
            href="/merch"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-[#FDFBF7] border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 font-semibold text-sm md:text-base transition-all"
          >
            <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
            <span>Pesan Merchandise (s/d 31 Agust)</span>
          </Link>
        </div>

        <p className="text-[11px] text-gray-400 mt-2">
          Bagi peserta atau perwakilan jemaat yang telah mendaftar, silakan akses menu <span className="text-[#D4AF37] font-medium">Cek Status</span> untuk melihat verifikasi pendaftaran dan QR Code E-Ticket Anda.
        </p>
      </div>

      {/* Grid: Kontak Humas & Merchandise Reminder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kontak Bantuan Humas */}
        <div className="rounded-2xl bg-black/40 border border-white/10 p-6 space-y-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#FDFBF7] text-base">Informasi &amp; Kontak Panitia</h3>
              <p className="text-xs text-gray-400">Perlu konfirmasi pendaftaran jemaat? Hubungi Tim Humas:</p>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <a
              href="https://wa.me/628986955114?text=Halo%20Panitia%20HUT%2016%20PKLU%20GPIB,%20saya%20ingin%20menanyakan%20perihal%20pendaftaran%20peserta"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/20 hover:border-emerald-500/40 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 font-bold text-xs">
                  GT
                </div>
                <div>
                  <div className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">Gladys Tutuarima</div>
                  <div className="text-xs text-gray-400 font-mono">+62 898-6955-114</div>
                </div>
              </div>
              <span className="text-xs bg-emerald-500/20 px-3 py-1.5 rounded-full text-emerald-300 group-hover:bg-emerald-500/30 font-medium">
                Chat WA →
              </span>
            </a>

            <a
              href="https://wa.me/6285212133173?text=Halo%20Panitia%20HUT%2016%20PKLU%20GPIB,%20saya%20ingin%20menanyakan%20perihal%20pendaftaran%20peserta"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/20 hover:border-emerald-500/40 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 font-bold text-xs">
                  SH
                </div>
                <div>
                  <div className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">Sharon Hento</div>
                  <div className="text-xs text-gray-400 font-mono">+62 852-1213-3173</div>
                </div>
              </div>
              <span className="text-xs bg-emerald-500/20 px-3 py-1.5 rounded-full text-emerald-300 group-hover:bg-emerald-500/30 font-medium">
                Chat WA →
              </span>
            </a>
          </div>
        </div>

        {/* Merchandise & Ekosistem Partisipasi Lain */}
        <div className="rounded-2xl bg-black/40 border border-white/10 p-6 space-y-4 backdrop-blur-md flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#FDFBF7] text-base">Merchandise &amp; Dukungan</h3>
                <span className="inline-block text-[10px] font-semibold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  Buka s/d 31 Agustus 2026
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed font-light">
              Meskipun pendaftaran peserta ditutup, Anda tetap dapat memiliki koleksi souvenir resmi edisi khusus HUT ke-16 (Kaos Eksklusif, Mug, Topi, Goodie Bag, Pin) dan mengirimkan untaian doa di Buku Tamu.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Link
              href="/merch"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold text-center transition-all"
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span>Beli Merch</span>
            </Link>
            <Link
              href="/ucapan"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-xs font-semibold text-center transition-all"
            >
              <HeartHandshake className="w-3.5 h-3.5 shrink-0" />
              <span>Kirim Ucapan</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Info Waktu & Tempat Acara Puncak */}
      <div className="rounded-2xl bg-black/30 border border-white/10 p-5 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-gray-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-white">Senin, 12 Oktober 2026</div>
              <div className="text-[11px] text-gray-400">Pukul 08.00 WIB s/d selesai</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-white">Bekasi Convention Center (BCC)</div>
              <div className="text-[11px] text-gray-400">Hotel Santika Mega Mall, Bekasi</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
