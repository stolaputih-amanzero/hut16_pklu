"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Share2, MessageSquare, Globe } from "lucide-react";

// Platform Captions Constants
const CAPTIONS = {
  IG: `"Bertumbuh dalam Keselamatan, Lansia Teladan dalam Iman, Karya dan Pelayanan." ✝️✨

Saya bangga menjadi bagian dari perayaan TEMU & HUT ke-16 PKLU GPIB 2026! Mari bersama-sama meneruskan bakti dan pelayanan bagi kemuliaan Tuhan.

📍 Bekasi Convention Center (BCC)
📅 Senin, 12 Oktober 2026

#HUTPKLU16 #GPIB #PKLUGPIB #KaumLanjutUsia #TeruskanBaktimu #TemuPKLU2026`,

  FB: `Shalom Bapak/Ibu/Saudara sekalian,

Mari kita meriahkan dan sukseskan Acara Temu PKLU GPIB & Peringatan HUT ke-16 Pelayanan Kategorial Lanjut Usia (PKLU) GPIB Tahun 2026 yang akan diselenggarakan pada:

📅 Hari/Tanggal: Senin, 12 Oktober 2026
⏰ Waktu: 08.00 WIB s/d selesai
📍 Lokasi: Bekasi Convention Center (BCC), Hotel Santika Mega Mall, Bekasi

"Bertumbuh dalam Keselamatan - Lansia Teladan dalam Iman, Karya dan Pelayanan."

#HUTPKLU16 #GPIB #PKLUGPIB #KaumLanjutUsia #TeruskanBaktimu`,

  TikTok: `Teruskan Baktimu! ✨ Selamat HUT ke-16 PKLU GPIB 2026! Sampai jumpa di Bekasi Convention Center 12 Oktober 2026 nanti yaa! 🙏❤️

#HUTPKLU16 #GPIB #PKLUGPIB #KaumLanjutUsia #FYP`,

  WA: `*UNDANGAN & KAMPANYE HUT KE-16 PKLU GPIB 2026* ✝️

Shalom! Saya mengajak seluruh jemaat dan keluarga besar PKLU GPIB untuk hadir dalam *TEMU PKLU GPIB 2026*:

🗓 *Senin, 12 Oktober 2026*
⏰ *08.00 WIB s/d Selesai*
📍 *Bekasi Convention Center (BCC)*

Tema: _Bertumbuh dalam Keselamatan_
Tagline: _Teruskan Baktimu_

Daftar sekarang melalui website resmi:
https://hut16-pklu.gpib.or.id/daftar

#HUTPKLU16 #GPIB #PKLUGPIB #KaumLanjutUsia`,
};

type Platform = "IG" | "FB" | "TikTok" | "WA";

export function SocialMediaCampaignKit() {
  const [activeTab, setActiveTab] = useState<Platform>("IG");
  const [copied, setCopied] = useState(false);

  const currentCaption = CAPTIONS[activeTab];

  // Copy to clipboard with fallback
  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(currentCaption);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = currentCaption;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Gagal menyalin caption:", err);
    }
  };

  // WhatsApp Deep Link Share
  const handleWAShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(currentCaption)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6 rounded-2xl border border-[#D4AF37]/30 bg-black/40 p-6 backdrop-blur-md text-[#FDFBF7]">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-[#D4AF37]">Social Media Campaign Kit</h2>
        <p className="text-xs text-gray-300">Pilih platform media sosial dan salin caption resmi untuk postingan Anda.</p>
      </div>

      {/* Tab Navigation */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-black/60 rounded-xl border border-white/10 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("IG")}
          className={`py-2 px-1 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "IG" ? "bg-[#D4AF37] text-black font-bold shadow" : "text-gray-300 hover:text-white"
          }`}
        >
          <svg className="w-3.5 h-3.5 stroke-current fill-none shrink-0" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
          IG
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("FB")}
          className={`py-2 px-1 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "FB" ? "bg-[#D4AF37] text-black font-bold shadow" : "text-gray-300 hover:text-white"
          }`}
        >
          <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          FB
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("TikTok")}
          className={`py-2 px-1 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "TikTok" ? "bg-[#D4AF37] text-black font-bold shadow" : "text-gray-300 hover:text-white"
          }`}
        >
          <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.96-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.53-1.36 1.45-1.44 2.42-.1.97.25 1.96.93 2.66.75.76 1.86 1.09 2.9.89 1.15-.18 2.19-.94 2.68-1.99.35-.71.49-1.51.48-2.3-.01-4.72-.01-9.44-.01-14.16z"/>
          </svg>
          TikTok
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("WA")}
          className={`py-2 px-1 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "WA" ? "bg-[#D4AF37] text-black font-bold shadow" : "text-gray-300 hover:text-white"
          }`}
        >
          <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M12.012 2c-5.506 0-9.989 4.478-9.989 9.984 0 1.758.459 3.474 1.33 4.988l-1.413 5.164 5.283-1.386c1.455.793 3.096 1.21 4.787 1.21 5.507 0 9.99-4.478 9.99-9.984s-4.483-9.976-9.988-9.976zm0 18.291c-1.492 0-2.955-.4-4.232-1.157l-.304-.18-3.146.825.839-3.067-.198-.315c-.832-1.325-1.272-2.861-1.272-4.413 0-4.577 3.725-8.297 8.313-8.297 4.587 0 8.313 3.72 8.313 8.297 0 4.578-3.726 8.307-8.313 8.307z"/>
          </svg>
          WA
        </button>
      </div>

      {/* Caption Preview Box */}
      <div className="relative bg-black/60 p-4 rounded-xl border border-white/10 space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <span className="text-xs font-semibold text-[#D4AF37]">Template Caption ({activeTab})</span>
          <span className="text-[10px] text-gray-400">Hashtag Resmi Terlampir</span>
        </div>

        <p className="text-xs text-gray-200 whitespace-pre-line leading-relaxed max-h-[220px] overflow-y-auto pr-1 select-all font-mono">
          {currentCaption}
        </p>

        {copied && (
          <div className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 p-2 rounded border border-emerald-500/30 flex items-center justify-center gap-1.5 animate-in fade-in">
            <Check className="w-4 h-4" /> Caption Berhasil Disalin ke Clipboard!
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          type="button"
          onClick={handleCopy}
          className="w-full bg-[#D4AF37] hover:bg-[#B3932D] text-black font-bold py-5 text-sm rounded-xl transition-all"
        >
          {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? "Caption Ter-Salin!" : "Salin Text Caption"}
        </Button>

        {activeTab === "WA" && (
          <Button
            type="button"
            onClick={handleWAShare}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 text-sm rounded-xl transition-all"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Bagikan Langsung ke WhatsApp
          </Button>
        )}
      </div>
    </div>
  );
}
