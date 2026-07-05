import { PublicHeader } from "@/components/PublicHeader";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#022c22] text-[#FDFBF7] flex flex-col font-sans relative selection:bg-[#D4AF37] selection:text-[#022c22]">
      {/* Shared Public Header */}
      <PublicHeader />

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-12">{children}</main>

      {/* Shared Public Footer */}
      <footer className="border-t border-[#D4AF37]/20 bg-black/80 pt-8 pb-28 md:pb-8 px-4 text-center text-xs text-gray-400 space-y-2">
        <div className="container mx-auto max-w-4xl space-y-2">
          <p className="text-gray-300 font-semibold">
            PANITIA PELAKSANA TEMU &amp; HUT KE-16 PELKAT PKLU GPIB TAHUN 2026
          </p>
          <p className="text-[11px] text-gray-400">
            Musyawarah Pelayanan (Mupel) GPIB Bekasi • Host Venue: Bekasi Convention Center
          </p>
          <p className="text-[10px] text-[#D4AF37]">
            &copy; 2026 Pelkat PKLU GPIB. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
