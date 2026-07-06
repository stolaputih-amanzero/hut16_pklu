import { Loader2 } from "lucide-react";

export default function AdminRootLoading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh] select-none">
      <div className="text-center space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37] mx-auto drop-shadow-[0_0_10px_rgba(212,175,55,0.2)]" />
        <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">
          Memuat Halaman Administrasi...
        </p>
      </div>
    </div>
  );
}
