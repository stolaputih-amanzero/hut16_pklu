import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ConfirmProvider } from "@/components/ui/confirm-dialog";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HUT ke-16 Pelkat PKLU GPIB",
  description: "Teruskan Baktimu! Lansia Teladan dalam Iman, Karya, dan Pelayanan.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon_apps.png", sizes: "192x192", type: "image/png" },
      { url: "/icon_apps.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icon_apps.png",
    apple: [
      { url: "/icon_apps.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HUT 16 PKLU",
  },
};

export const viewport = {
  themeColor: "#047857",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <ConfirmProvider>
          {children}
        </ConfirmProvider>
        <Toaster 
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "rgba(2, 44, 34, 0.96)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(212, 175, 55, 0.25)",
              color: "#FDFBF7",
              fontFamily: "var(--font-geist-sans), sans-serif",
              boxShadow: "0 12px 40px -12px rgba(0, 0, 0, 0.8), 0 0 15px rgba(212, 175, 55, 0.08)",
              maxWidth: "calc(100vw - 2rem)",
            },
            classNames: {
              toast: "rounded-xl border-[#D4AF37]/30",
              success: "!border-emerald-500/35 !bg-gradient-to-r !from-[#022c22] !to-[#064e3b] text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
              error: "!border-red-500/35 !bg-gradient-to-r !from-[#022c22] !to-[#7f1d1d] text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]",
              warning: "!border-amber-500/35 !bg-gradient-to-r !from-[#022c22] !to-[#78350f] text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]",
              info: "!border-blue-500/35 !bg-gradient-to-r !from-[#022c22] !to-[#1e3a8a] text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]",
            },
          }}
        />
      </body>
    </html>
  );
}
