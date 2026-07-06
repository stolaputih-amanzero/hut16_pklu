"use client";

import { useState } from "react";
import { X, Loader2, Mail, User, Lock, ShieldCheck } from "lucide-react";
import { createUser } from "@/app/(admin)/admin/users/actions";
import { useRouter } from "next/navigation";

interface CreateUserModalProps {
  onClose: () => void;
}

export function CreateUserModal({ onClose }: CreateUserModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "super_user">("admin");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Client-side Validations
    if (!email.trim() || !fullName.trim() || !password || !role) {
      setError("Semua field wajib diisi.");
      return;
    }

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Format alamat email tidak valid.");
      return;
    }

    // Password length validation
    if (password.length < 8) {
      setError("Kata sandi minimal harus 8 karakter.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createUser({
        email: email.trim(),
        full_name: fullName.trim(),
        password,
        role,
      });

      if (result.success) {
        router.refresh();
        onClose();
      } else {
        setError(result.error || "Gagal mendaftarkan user baru.");
        setLoading(false);
      }
    } catch (err: any) {
      setError("Terjadi kesalahan sistem. Silakan coba lagi nanti.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-[#022c22]/95 border border-[#D4AF37]/30 rounded-2xl p-6 sm:p-8 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-250 select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <h3 className="text-sm font-bold text-[#FDFBF7] uppercase tracking-wider">
            Tambah Admin Baru
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold text-center animate-in fade-in slide-in-from-top-1 duration-200">
              {error}
            </div>
          )}

          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#D4AF37] tracking-wider uppercase">
              Alamat Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                required
                placeholder="email@domain.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                className="block w-full pl-9 pr-3 py-2 bg-black/30 border border-white/10 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Name field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#D4AF37] tracking-wider uppercase">
              Nama Lengkap
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                placeholder="Nama Lengkap"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (error) setError(null);
                }}
                className="block w-full pl-9 pr-3 py-2 bg-black/30 border border-white/10 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#D4AF37] tracking-wider uppercase">
              Kata Sandi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                required
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                className="block w-full pl-9 pr-3 py-2 bg-black/30 border border-white/10 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Role Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#D4AF37] tracking-wider uppercase">
              Hak Akses / Role
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value as any);
                  if (error) setError(null);
                }}
                className="block w-full pl-9 pr-3 py-2 bg-black/30 border border-white/10 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl text-xs text-white focus:outline-none transition-all cursor-pointer appearance-none"
              >
                <option value="admin" className="bg-[#022c22] text-white">Admin</option>
                <option value="super_user" className="bg-[#022c22] text-white">Super User</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-transparent hover:bg-white/5 border border-white/10 text-gray-300 hover:text-white font-bold text-xs rounded-xl cursor-pointer disabled:cursor-not-allowed transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#D4AF37] hover:bg-[#B3932D] disabled:bg-gray-700 disabled:text-gray-400 text-black font-bold text-xs rounded-xl cursor-pointer disabled:cursor-not-allowed transition-all shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Mendaftarkan...
                </>
              ) : (
                "Simpan Admin"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
