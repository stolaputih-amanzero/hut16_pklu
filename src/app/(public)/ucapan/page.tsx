import { Suspense } from "react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { GuestbookForm } from "@/components/GuestbookForm";
import { GuestbookList } from "@/components/GuestbookList";
import { GuestbookGuidelines } from "@/components/GuestbookGuidelines";
import { HeartHandshake } from "lucide-react";

export const metadata = {
  title: "Buku Tamu Digital - HUT ke-16 PKLU GPIB",
  description: "Tuliskan ucapan selamat dan doa untuk HUT ke-16 Pelayanan Kategorial Lanjut Usia (PKLU) GPIB 2026.",
};

export const revalidate = 60; // Revalidate every 60s for new approved messages

export default async function GuestbookPage() {
  const { data: churches } = await supabaseAdmin
    .from("churches")
    .select("*")
    .order("mupel", { ascending: true })
    .order("name", { ascending: true });

  return (
    <div className="container mx-auto min-h-screen py-10 px-4">
      <div className="mx-auto max-w-4xl space-y-8 rounded-2xl bg-black/50 p-4 sm:p-6 md:p-8 backdrop-blur-md border border-[#D4AF37]/20 shadow-2xl">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 mb-1">
            <HeartHandshake className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#D4AF37] sm:text-4xl">
            Buku Tamu Digital
          </h1>
          <p className="text-gray-300 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Tuliskan ucapan selamat dan doa sukacita untuk HUT ke-16 PKLU GPIB.
          </p>

          <noscript>
            <div className="bg-amber-500/20 border border-amber-500/40 p-3 rounded-xl text-amber-300 text-xs mt-3">
              ⚠️ JavaScript diperlukan untuk mengirim ucapan dan memuat daftar pesan. Silakan aktifkan JavaScript di peramban Anda.
            </div>
          </noscript>
        </div>

        {/* Guideline & Admin Review Notice Card */}
        <GuestbookGuidelines />

        {/* Form & List Section (Mobile-First) */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Left Column: Form */}
          <div className="lg:col-span-5">
            <GuestbookForm churches={churches || []} />
          </div>

          {/* Right Column: List */}
          <div className="lg:col-span-7">
            <Suspense fallback={
              <div className="p-8 text-center text-gray-400 text-sm bg-black/40 rounded-xl border border-white/10">
                Memuat daftar ucapan...
              </div>
            }>
              <GuestbookList />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
