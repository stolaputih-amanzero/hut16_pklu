import { TwibbonPageClient } from "@/components/TwibbonPageClient";
import { Camera } from "lucide-react";

export const metadata = {
  title: "Twibbon Generator & Social Media Kit - HUT ke-16 PKLU GPIB",
  description: "Pasang foto Anda di Twibbon Resmi HUT ke-16 PKLU GPIB 2026 dan bagikan pesan kampanye di media sosial.",
  openGraph: {
    title: "Twibbon Generator & Social Media Kit - HUT ke-16 PKLU GPIB 2026",
    description: "Mari meriahkan HUT ke-16 PKLU GPIB! Pasang foto Anda di Twibbon resmi dan dapatkan caption kampanyenya.",
    url: "https://pklu.amanloka.com/twibbon",
    siteName: "HUT ke-16 PKLU GPIB 2026",
    images: [
      {
        url: "/twibbon-frame.png",
        width: 1080,
        height: 1080,
        alt: "Frame Resmi Twibbon HUT ke-16 PKLU GPIB 2026",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Twibbon Generator - HUT ke-16 PKLU GPIB 2026",
    description: "Pasang foto Anda di Twibbon Resmi HUT ke-16 PKLU GPIB 2026.",
    images: ["/twibbon-frame.png"],
  },
};

export default function TwibbonPage() {
  return (
    <div className="container mx-auto min-h-screen py-10 px-4">
      <div className="mx-auto max-w-4xl space-y-8 rounded-2xl bg-black/50 p-6 md:p-8 backdrop-blur-md border border-[#D4AF37]/20 shadow-2xl">
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 mb-1">
            <Camera className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#D4AF37] sm:text-4xl">
            Twibbon & Social Media Kit
          </h1>
          <p className="text-gray-300 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Dukung dan meriahkan HUT ke-16 PKLU GPIB 2026! Upload foto Anda, unduh Twibbon, dan gunakan caption resmi untuk dibagikan di media sosial.
          </p>
        </div>

        <TwibbonPageClient />
      </div>
    </div>
  );
}
