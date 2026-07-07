"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { Lock, ArrowLeft, Loader2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ResetPasswordPage() {
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check if we have an active session (hydrated by clicking email recovery link)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setHasSession(true);
          setTimeout(() => passwordInputRef.current?.focus(), 50);
        } else {
          setError("Sesi pemulihan tidak ditemukan atau telah kedaluwarsa. Silakan minta tautan baru.");
        }
      } catch (err) {
        setError("Gagal membaca status sesi pemulihan.");
      } finally {
        setSessionChecked(true);
      }
    };
    checkSession();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!newPassword || !confirmPassword) {
      setError("Semua field kata sandi wajib diisi.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak sesuai.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Kata sandi baru minimal harus terdiri dari 6 karakter.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        // Force redirect to admin dashboard after short timeout
        setTimeout(() => {
          window.location.href = "/admin/dashboard";
        }, 2000);
      }
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#022c22]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#022c22] px-4 relative overflow-hidden select-none">
      {/* Premium ambient glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] bg-[#D4AF37]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-[#047857]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 z-10">
        {/* Branding & Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex relative p-4 rounded-full border border-[#D4AF37]/30 bg-black/40 shadow-inner">
            <Image
              src="/logo_hut16_pklu.png"
              alt="Logo"
              width={64}
              height={64}
              className="object-contain"
              priority
            />
            <div className="absolute -top-1 -right-1 bg-[#D4AF37] text-black rounded-full p-1 shadow-lg">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-[#FDFBF7]">
              Atur Ulang Kata Sandi
            </h1>
            <p className="text-sm text-[#D4AF37]/80 uppercase tracking-widest font-semibold">
              Portal Administrasi Panitia
            </p>
          </div>
        </div>

        {/* Reset Password Form Card */}
        <div className="bg-black/60 backdrop-blur-xl border border-[#D4AF37]/20 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {success ? (
            <div className="text-center space-y-4 py-4 animate-in fade-in duration-300">
              <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Sandi Berhasil Diperbarui!</h3>
                <p className="text-xs text-gray-400">Sedang mengalihkan Anda ke Dashboard...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-5">
              {/* Message Display Area */}
              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold text-center flex items-center justify-center gap-2 animate-in fade-in duration-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {hasSession ? (
                <>
                  <div className="text-xs text-gray-300 bg-white/5 border border-white/10 p-3 rounded-xl leading-relaxed">
                    Masukkan kata sandi baru untuk akun administrator Anda.
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <label
                      htmlFor="new-password"
                      className="text-xs font-bold text-[#D4AF37] tracking-wider uppercase"
                    >
                      Kata Sandi Baru
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Lock className="h-4.5 w-4.5" />
                      </div>
                      <input
                        ref={passwordInputRef}
                        id="new-password"
                        type="password"
                        required
                        placeholder="Minimal 6 karakter"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (error) setError(null);
                        }}
                        className="block w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label
                      htmlFor="confirm-password"
                      className="text-xs font-bold text-[#D4AF37] tracking-wider uppercase"
                    >
                      Konfirmasi Kata Sandi Baru
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Lock className="h-4.5 w-4.5" />
                      </div>
                      <input
                        id="confirm-password"
                        type="password"
                        required
                        placeholder="Ulangi kata sandi baru"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (error) setError(null);
                        }}
                        className="block w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#D4AF37] hover:bg-[#B3932D] disabled:bg-gray-700 disabled:text-gray-400 text-black font-bold text-sm rounded-xl cursor-pointer disabled:cursor-not-allowed transition-all duration-300 shadow-lg active:scale-98"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4.5 h-4.5 animate-spin" />
                        Menyimpan Sandi...
                      </>
                    ) : (
                      "Simpan Sandi Baru"
                    )}
                  </button>
                </>
              ) : (
                <Link
                  href="/admin/login"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-sm rounded-xl cursor-pointer transition-all duration-300"
                >
                  <ArrowLeft className="w-4.5 h-4.5" />
                  Kembali ke Halaman Login
                </Link>
              )}
            </form>
          )}

          {hasSession && !success && (
            <>
              <div className="h-px bg-white/10" />

              {/* Back link */}
              <div className="text-center">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#D4AF37] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Batal dan Kembali
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
