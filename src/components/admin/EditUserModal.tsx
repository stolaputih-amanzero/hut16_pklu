"use client";

import { useState } from "react";
import { X, Loader2, Mail, User, ShieldCheck, AlertTriangle } from "lucide-react";
import { updateUser } from "@/app/(admin)/admin/users/actions";
import { useRouter } from "next/navigation";

interface EditUserModalProps {
  user: {
    id: string;
    full_name: string;
    role: string;
    email: string;
  };
  currentUserId: string;
  onClose: () => void;
}

export function EditUserModal({ user, currentUserId, onClose }: EditUserModalProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(user.full_name);
  const [role, setRole] = useState<"admin" | "super_user">(user.role as any);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditingSelf = user.id === currentUserId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!fullName.trim() || !role) {
      setError("Nama Lengkap wajib diisi.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await updateUser(user.id, {
        full_name: fullName.trim(),
        role,
      });

      if (result.success) {
        router.refresh();
        onClose();
      } else {
        setError(result.error || "Gagal mengubah profil admin.");
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
            Edit Profil Admin
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

          {/* Email field (Disabled / Read Only) */}
          <div className="space-y-1.5 opacity-60">
            <label className="text-[10px] font-bold text-[#D4AF37] tracking-wider uppercase">
              Alamat Email (Tidak Dapat Diubah)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                disabled
                value={user.email}
                className="block w-full pl-9 pr-3 py-2 bg-black/50 border border-white/5 rounded-xl text-xs text-gray-400 focus:outline-none cursor-not-allowed"
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
                disabled={isEditingSelf}
                value={role}
                onChange={(e) => {
                  setRole(e.target.value as any);
                  if (error) setError(null);
                }}
                className={`block w-full pl-9 pr-3 py-2 bg-black/30 border border-white/10 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl text-xs text-white focus:outline-none transition-all appearance-none ${
                  isEditingSelf ? "cursor-not-allowed opacity-60 bg-black/50" : "cursor-pointer"
                }`}
              >
                <option value="admin" className="bg-[#022c22] text-white">Admin</option>
                <option value="super_user" className="bg-[#022c22] text-white">Super User</option>
              </select>
            </div>
            
            {/* Self demotion lockout warning inline */}
            {isEditingSelf && (
              <div className="flex items-start gap-1.5 mt-1.5 text-[10px] text-amber-400 font-semibold leading-relaxed">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Pemberitahuan: Anda tidak dapat mengubah peran Anda sendiri demi mencegah kehilangan akses Super User.</span>
              </div>
            )}
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
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
