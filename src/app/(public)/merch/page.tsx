import { supabaseAdmin } from "@/lib/supabase/admin";
import { MerchOrderForm } from "@/components/MerchOrderForm";
import { ShoppingBag } from "lucide-react";

export const metadata = {
  title: "Merchandise - HUT ke-16 PKLU GPIB",
  description: "Pembelian souvenir dan merchandise cenderamata edisi khusus HUT ke-16 Persekutuan Kaum Lanjut Usia (PKLU) GPIB 2026.",
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
            Dapatkan koleksi souvenir cenderamata edisi terbatas HUT ke-16 PKLU GPIB 2026.
          </p>
        </div>

        <MerchOrderForm churches={churches || []} />
      </div>
    </div>
  );
}
