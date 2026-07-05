"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, AlertTriangle, ArrowLeft, MessageSquare, UserPlus } from "lucide-react";

export default function CheckStatusNotFound() {
  const router = useRouter();
  const [inputCode, setInputCode] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputCode.trim().toUpperCase();
    if (clean) {
      router.push(`/cek-status/${clean}`);
    }
  };

  return (
    <div className="container mx-auto min-h-screen py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-lg space-y-6 rounded-2xl bg-black/60 p-6 md:p-8 backdrop-blur-xl border border-amber-500/30 text-[#FDFBF7] text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-amber-400">Kode Pendaftaran Tidak Ditemukan</h1>
          <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
            Kode pendaftaran yang Anda masukkan tidak valid atau tidak terdaftar di sistem kami. Periksa kembali penulisan kode Anda atau lakukan pendaftaran ulang.
          </p>
        </div>

        {/* Quick Search Form */}
        <form onSubmit={handleSearch} className="space-y-2 pt-2">
          <p className="text-xs font-semibold text-gray-400">Coba Masukkan Kode Lain:</p>
          <div className="flex gap-2">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <Input
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Contoh: PKLU-A7B8C"
                className="pl-9 bg-black/50 border-white/20 text-white font-mono uppercase text-sm h-10"
              />
            </div>
            <Button type="submit" className="bg-[#D4AF37] hover:bg-[#B3932D] text-black font-bold h-10 px-4">
              Cari
            </Button>
          </div>
        </form>

        {/* Action Links */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <Link href="/daftar" className="block w-full">
            <Button className="w-full bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] font-bold py-5 text-xs rounded-xl transition-all">
              <UserPlus className="w-4 h-4 mr-2" />
              Kembali ke Form Pendaftaran
            </Button>
          </Link>

          <a
            href="https://wa.me/6281234567890?text=Halo%20Panitia%20HUT%20PKLU,%20saya%20butuh%20bantuan%20cek%20kode%20pendaftaran"
            target="_blank"
            rel="noreferrer"
            className="block w-full"
          >
            <Button variant="outline" className="w-full border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 font-bold py-5 text-xs rounded-xl transition-all">
              <MessageSquare className="w-4 h-4 mr-2" />
              Hubungi Panitia via WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
