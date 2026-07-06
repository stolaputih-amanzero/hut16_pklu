import { supabaseAdmin } from "@/lib/supabase/admin";
import { RegistrationForm } from "@/components/registration-form";
import { RegistrationInfo } from "@/components/RegistrationInfo";
import { UserCheck } from "lucide-react";

export const metadata = {
  title: "Pendaftaran - HUT ke-16 PKLU GPIB",
  description: "Isi formulir pendaftaran peserta atau pendamping HUT ke-16 PKLU GPIB.",
};

export const revalidate = 3600; // Cache for 1 hour since churches rarely change

export default async function RegistrationPage() {
  const { data: churches, error } = await supabaseAdmin
    .from("churches")
    .select("*")
    .order("mupel", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-500">Gagal memuat data jemaat. Silakan muat ulang halaman.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen py-10 px-4">
      <div className="mx-auto max-w-4xl space-y-8 rounded-2xl bg-black/50 p-6 md:p-8 backdrop-blur-md border border-[#D4AF37]/20 shadow-2xl">
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 mb-1">
            <UserCheck className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#D4AF37] sm:text-4xl">
            Pendaftaran
          </h1>
          <p className="text-gray-300 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Isi formulir di bawah ini untuk mendaftar sebagai peserta atau pendamping.
          </p>
          <div className="pt-2">
            <a 
              href="/cek" 
              className="inline-flex items-center text-xs font-semibold text-[#D4AF37] hover:underline bg-[#D4AF37]/10 px-3 py-1.5 rounded-full border border-[#D4AF37]/30"
            >
              Sudah Pernah Mendaftar? Cek Status / QR Code Pendaftaran →
            </a>
          </div>
        </div>

        {/* Informasi Kegiatan */}
        <RegistrationInfo />
        
        <RegistrationForm churches={churches || []} />
      </div>
    </div>
  );
}
