"use client";

import { useState } from "react";
import { X, Loader2, AlertTriangle } from "lucide-react";
import { deleteUser } from "@/app/(admin)/admin/users/actions";
import { useRouter } from "next/navigation";

interface DeleteUserDialogProps {
  user: {
    id: string;
    full_name: string;
  };
  currentUserId: string;
  onClose: () => void;
}

export function DeleteUserDialog({ user, currentUserId, onClose }: DeleteUserDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSelf = user.id === currentUserId;

  const handleDelete = async () => {
    if (isSelf || loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await deleteUser(user.id);

      if (result.success) {
        router.refresh();
        onClose();
      } else {
        setError(result.error || "Gagal menghapus admin.");
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

      {/* Dialog Container */}
      <div className="relative w-full max-w-sm bg-[#022c22]/95 border border-[#D4AF37]/30 rounded-2xl p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-250 select-none">
        {/* Close button top-right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-4 text-center pt-2">
          {/* Warning Icon */}
          <div className="inline-flex p-3 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-[#FDFBF7] uppercase tracking-wider">
              Konfirmasi Hapus Admin
            </h3>
            {isSelf ? (
              <p className="text-xs text-red-400 font-semibold px-2 leading-relaxed">
                Anda tidak dapat menghapus akun Anda sendiri demi keamanan sistem.
              </p>
            ) : (
              <p className="text-xs text-gray-300 px-2 leading-relaxed">
                Apakah Anda yakin ingin menghapus admin <strong className="text-[#D4AF37] font-bold">{user.full_name}</strong>? Tindakan ini tidak dapat dibatalkan.
              </p>
            )}
          </div>

          {/* Inline Error */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-semibold">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-center gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-transparent hover:bg-white/5 border border-white/10 text-gray-300 hover:text-white font-bold text-xs rounded-xl cursor-pointer disabled:cursor-not-allowed transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              disabled={isSelf || loading}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-700 disabled:text-gray-400 text-white font-bold text-xs rounded-xl cursor-pointer disabled:cursor-not-allowed transition-all shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus Admin"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
