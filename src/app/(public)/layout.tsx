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
      <main className="flex-1 pt-16 pb-20 md:pb-12">{children}</main>

      {/* Shared Public Footer */}
      <footer className="relative z-10 border-t border-[#D4AF37]/20 bg-black/80 pt-8 pb-28 md:pb-8 px-4 text-center text-xs text-gray-400 space-y-2">
        <div className="container mx-auto max-w-4xl space-y-2">
          <p className="text-[10px] text-[#D4AF37]">
            &copy; 2026 Pelkat PKLU GPIB Mupel Bekasi. All Rights Reserved.
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 pt-1">
            <span>Powered by</span>
            <a 
              href="https://amanloka.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1 hover:text-[#D4AF37] transition-all duration-300 group"
            >
              <img 
                src="/aman.png" 
                alt="AMAN Ecosystem" 
                className="h-3 w-auto object-contain opacity-60 group-hover:opacity-100 transition-opacity" 
              />
              <span className="font-medium tracking-wide">AMAN Ecosystem</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
