"use client";

import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#022c22] px-4 relative overflow-hidden select-none">
      {/* Premium ambient glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] bg-[#D4AF37]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-[#047857]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 z-10 text-center">
        <div className="inline-flex p-4 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 shadow-lg animate-bounce">
          <ShieldAlert className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-[#FDFBF7]">
            Akses Ditolak
          </h1>
          <p className="text-sm text-gray-300 max-w-xs mx-auto leading-relaxed">
            Maaf, akun Anda tidak memiliki akses ke area admin.
          </p>
          <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
            Jika Anda merasa ini kesalahan, silakan hubungi administrator sistem.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/admin/login"
            className="w-full sm:w-auto px-5 py-2.5 bg-[#D4AF37] hover:bg-[#B3932D] text-black font-bold text-xs rounded-xl shadow-lg transition-colors"
          >
            Masuk dengan Akun Lain
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 bg-black/40 hover:bg-black/60 border border-white/10 text-gray-300 hover:text-white font-bold text-xs rounded-xl transition-all inline-flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Halaman Publik
          </Link>
        </div>
      </div>
    </div>
  );
}
