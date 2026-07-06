"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Lock, Mail, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const emailInputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Auto-focus email field on page load & check if user is already authenticated
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }

    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          // Verify if they exist in admin_profiles
          const { data: profile } = await supabase
            .from("admin_profiles")
            .select("id")
            .eq("id", session.user.id)
            .maybeSingle();

          if (profile) {
            router.push("/admin/dashboard");
            return;
          }
        }
      } catch (err) {
        console.error("Error checking existing session:", err);
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [router]);

  // 2. Handle admin credentials submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Basic input validation
    if (!email.trim() || !password.trim()) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (signInError) {
        // Handle specific error codes or provide friendly feedback
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Email atau sandi salah. Silakan coba kembali.");
        } else if (signInError.message.includes("Email not confirmed")) {
          setError("Alamat email belum dikonfirmasi oleh sistem.");
        } else {
          setError(signInError.message);
        }
        setLoading(false);
        return;
      }

      if (data?.user) {
        // Verify user presence in the admin_profiles table
        const { data: profile, error: profileError } = await supabase
          .from("admin_profiles")
          .select("id")
          .eq("id", data.user.id)
          .maybeSingle();

        if (profileError || !profile) {
          setError("Akses ditolak. Akun Anda tidak terdaftar sebagai admin.");
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        // Redirect to admin dashboard
        router.push("/admin/dashboard");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem. Silakan coba lagi nanti.");
      setLoading(false);
    }
  };

  if (checkingSession) {
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
          <div className="inline-flex relative p-4 rounded-full border border-[#D4AF37]/30 bg-black/40 shadow-inner group">
            <Image
              src="/logo_hut16_pklu.png"
              alt="Logo HUT 16 PKLU"
              width={64}
              height={64}
              className="object-contain drop-shadow-[0_2px_10px_rgba(212,175,55,0.3)] group-hover:scale-105 transition-transform duration-300"
              priority
            />
            <div className="absolute -top-1 -right-1 bg-[#D4AF37] text-black rounded-full p-1 shadow-lg">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-[#FDFBF7]">
              HUT ke-16 PKLU GPIB
            </h1>
            <p className="text-sm text-[#D4AF37]/80 uppercase tracking-widest font-semibold">
              Portal Administrasi Panitia
            </p>
          </div>
        </div>

        {/* Login Card Form */}
        <div className="bg-black/60 backdrop-blur-xl border border-[#D4AF37]/20 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Error Message Area */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold text-center animate-in fade-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-xs font-bold text-[#D4AF37] tracking-wider uppercase"
              >
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  ref={emailInputRef}
                  id="email"
                  type="email"
                  required
                  placeholder="admin@hut16pklu.org"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null); // Clear error on typing
                  }}
                  className="block w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-xs font-bold text-[#D4AF37] tracking-wider uppercase"
              >
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null); // Clear error on typing
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
                  Mengotentikasi...
                </>
              ) : (
                "Masuk ke Dashboard"
              )}
            </button>
          </form>

          <div className="h-px bg-white/10" />

          {/* Back link */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#D4AF37] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Halaman Publik
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
