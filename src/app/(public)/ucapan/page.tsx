import { Suspense } from "react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { GuestbookForm } from "@/components/GuestbookForm";
import { GuestbookList } from "@/components/GuestbookList";
import { MessageSquareQuote, HeartHandshake, ShieldCheck, HelpCircle, FileText, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Buku Tamu Digital & Ucapan Selamat - HUT ke-16 PKLU GPIB",
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
      <div className="mx-auto max-w-4xl space-y-8 rounded-2xl bg-black/50 p-6 md:p-8 backdrop-blur-md border border-[#D4AF37]/20 shadow-2xl">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 mb-1">
            <HeartHandshake className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#D4AF37] sm:text-4xl">
            Buku Tamu Digital &amp; Ucapan Selamat
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
        <div className="rounded-2xl border border-[#D4AF37]/30 bg-black/60 p-5 md:p-6 text-sm text-[#FDFBF7] space-y-4 shadow-inner">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <h2 className="text-base font-bold text-[#D4AF37] flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#D4AF37]" />
              Tata Cara Menulis Ucapan Selamat:
            </h2>
            <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-full text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              Ditinjau Panitia Sebelum Tayang
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 text-xs">
            <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
              <span className="font-bold text-[#D4AF37] block">1. Unggah Foto Profil (Opsional)</span>
              <p className="text-gray-300">Pilih foto terbaik Anda (maks 5MB) untuk ditampilkan di samping nama ucapan Anda.</p>
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
              <span className="font-bold text-[#D4AF37] block">2. Isi Nama &amp; Asal Jemaat</span>
              <p className="text-gray-300">Isi nama lengkap dan pilih asal Mupel/Jemaat GPIB Anda (atau pilih opsi <em>Umum / Non-GPIB</em>).</p>
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
              <span className="font-bold text-[#D4AF37] block">3. Tuliskan Ucapan &amp; Doa</span>
              <p className="text-gray-300">Tulis ucapan sukacita dan harapan Anda untuk HUT ke-16 PKLU GPIB (maksimal 300 karakter).</p>
            </div>
          </div>

          {/* Admin Moderation Notice */}
          <div className="p-3 bg-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/30 text-xs text-gray-200 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Catatan Moderasi:</strong> Demi kenyamanan dan kerapian bersama, seluruh ucapan yang dikirimkan akan <strong>ditinjau terlebih dahulu oleh panitia/admin</strong> sebelum ditampilkan secara resmi pada daftar ucapan publik.
            </p>
          </div>
        </div>

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
