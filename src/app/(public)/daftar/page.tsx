import { RegistrationClosed } from "@/components/RegistrationClosed";
import { RegistrationHeaderGuides } from "@/components/RegistrationHeaderGuides";
import { UserCheck } from "lucide-react";

export const metadata = {
  title: "Pendaftaran Ditutup - HUT ke-16 PKLU GPIB",
  description: "Pendaftaran peserta HUT ke-16 Pelkat PKLU GPIB telah ditutup karena kuota terpenuhi.",
};

export default function RegistrationPage() {
  return (
    <div className="container mx-auto min-h-screen py-10 px-4">
      <div className="mx-auto max-w-4xl space-y-8 rounded-2xl bg-black/50 p-6 md:p-8 backdrop-blur-md border border-[#D4AF37]/20 shadow-2xl">
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 mb-1">
            <UserCheck className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#D4AF37] sm:text-4xl">
            Pendaftaran Peserta
          </h1>
          <p className="text-gray-300 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Ibadah Syukur Agung &amp; Perayaan HUT ke-16 Pelkat PKLU GPIB 2026.
          </p>
        </div>

        {/* Closed Announcement Component */}
        <RegistrationClosed />

        {/* Informasi & Panduan Kegiatan (Dapat dilihat untuk info jadwal/tempat) */}
        <div className="pt-4 border-t border-white/10">
          <RegistrationHeaderGuides />
        </div>
      </div>
    </div>
  );
}

