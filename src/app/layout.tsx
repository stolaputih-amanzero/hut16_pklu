import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

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
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster 
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "rgba(2, 44, 34, 0.95)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(212, 175, 55, 0.3)",
              color: "#FDFBF7",
              fontFamily: "var(--font-geist-sans), sans-serif",
              boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.7), 0 0 15px rgba(212, 175, 55, 0.1)",
            },
            className: "rounded-xl border-[#D4AF37]/30",
          }}
        />
      </body>
    </html>
  );
}
