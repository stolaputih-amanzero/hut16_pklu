import { supabaseAdmin } from "@/lib/supabase/admin";
import { MerchOrderForm } from "@/components/MerchOrderForm";
import { ShoppingBag, Clock, Sparkles } from "lucide-react";

export const metadata = {
  title: "Merchandise - HUT ke-16 PKLU GPIB",
  description: "Pembelian souvenir dan merchandise cenderamata edisi khusus HUT ke-16 Persekutuan Kaum Lanjut Usia (PKLU) GPIB 2026. Pre-order dibuka hingga 31 Agustus 2026.",
};

export const revalidate = 60;

export default async function MerchOrderPage() {
  const { data: churches } = await supabaseAdmin
    .from("churches")
    .select("*")
    .order("mupel", { ascending: true })
    .order("name", { ascending: true });

  return (
    <div className="container mx-auto min-h-screen py-10 px-4">
      <div className="mx-auto max-w-4xl space-y-8 rounded-2xl bg-black/50 p-6 md:p-8 backdrop-blur-md border border-[#D4AF37]/20 shadow-2xl">
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 mb-1">
            <ShoppingBag className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#D4AF37] sm:text-4xl">
            Merchandise
          </h1>
          <p className="text-gray-300 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Dapatkan koleksi souvenir edisi terbatas HUT ke-16 PKLU GPIB 2026.
          </p>

          {/* Pre-order Deadline Banner */}
          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs md:text-sm font-semibold shadow-inner">
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Pemesanan Merchandise Resmi Dibuka Hingga <strong>31 Agustus 2026</strong></span>
            </div>
          </div>
        </div>

        <MerchOrderForm churches={churches || []} />
      </div>
    </div>
  );
}
