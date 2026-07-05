import { supabaseAdmin } from "@/lib/supabase/admin";
import { RegistrationForm } from "@/components/registration-form";
import { Calendar, Clock, MapPin, Phone } from "lucide-react";

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
    <div className="container mx-auto min-h-screen py-10">
      <div className="mx-auto max-w-3xl space-y-8 rounded-2xl bg-black/40 p-6 md:p-8 backdrop-blur-md border border-[#D4AF37]/20 shadow-2xl">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter text-[#D4AF37] sm:text-4xl md:text-5xl">
            Pendaftaran
          </h1>
          <p className="text-muted-foreground md:text-lg">
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
        <div className="grid gap-5 md:grid-cols-2 text-sm text-gray-300 bg-black/60 p-6 rounded-xl border border-[#D4AF37]/20 mb-8 shadow-inner">
          <div className="space-y-4">
            <div>
              <p className="font-bold text-[#D4AF37] text-lg mb-1">Bertumbuh dalam Keselamatan</p>
              <p className="italic text-gray-400">Sub Tema: Lansia Teladan dalam Iman, Karya dan Pelayanan</p>
              <p className="font-semibold mt-1">Tagline: "Teruskan Baktimu"</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-full bg-[#D4AF37]/10"><Calendar className="w-4 h-4 text-[#D4AF37]" /></div>
                <span>Senin, 12 Oktober 2026</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-full bg-[#D4AF37]/10"><Clock className="w-4 h-4 text-[#D4AF37]" /></div>
                <span>08.00 WIB s/d selesai</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-full bg-[#D4AF37]/10 shrink-0 mt-0.5"><MapPin className="w-4 h-4 text-[#D4AF37]" /></div>
                <span>Bekasi Convention Center (BCC),<br/>Hotel Santika Mega Mall, Bekasi</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3 border-t md:border-t-0 md:border-l border-white/10 pt-5 md:pt-0 md:pl-6 flex flex-col justify-center">
            <p className="font-semibold text-white">Informasi & Bantuan (Humas):</p>
            <div className="flex flex-col gap-3">
              <a href="https://wa.me/628986955114" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 group hover:bg-emerald-500/20">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4" />
                  <span className="font-medium">Gladys Tutuarima</span>
                </div>
                <span className="text-xs bg-emerald-500/20 px-2 py-1 rounded text-emerald-300 group-hover:bg-emerald-500/30">Hubungi WA</span>
              </a>
              <a href="https://wa.me/6285212133173" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 group hover:bg-emerald-500/20">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4" />
                  <span className="font-medium">Sharon Hento</span>
                </div>
                <span className="text-xs bg-emerald-500/20 px-2 py-1 rounded text-emerald-300 group-hover:bg-emerald-500/30">Hubungi WA</span>
              </a>
            </div>
          </div>
        </div>
        
        <RegistrationForm churches={churches || []} />
      </div>
    </div>
  );
}
