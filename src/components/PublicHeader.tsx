"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  Home, 
  UserCheck, 
  Sparkles, 
  ShoppingBag, 
  HeartHandshake, 
  ShieldCheck
} from "lucide-react";

export function PublicHeader() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Beranda", href: "/", icon: Home },
    { name: "Pendaftaran", href: "/daftar", icon: UserCheck },
    { name: "Amanaura", href: "/amanaura", icon: Sparkles },
    { name: "Merchandise", href: "/merch", icon: ShoppingBag },
    { name: "Buku Tamu", href: "/ucapan", icon: HeartHandshake },
  ];

  return (
    <>
      {/* Top Desktop Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-[#D4AF37]/20 bg-[#022c22]/90 backdrop-blur-xl transition-all">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative h-9 w-9 overflow-hidden rounded-full border border-[#D4AF37]/50 bg-black/40 p-0.5 group-hover:border-[#D4AF37] transition-colors">
              <Image
                src="/logo_hut16_pklu.png"
                alt="Logo HUT 16 PKLU"
                width={36}
                height={36}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[#FDFBF7] text-sm tracking-tight group-hover:text-[#D4AF37] transition-colors">
                HUT ke-16 PKLU GPIB
              </span>
              <span className="text-[10px] text-[#D4AF37] tracking-widest uppercase">
                Teruskan Baktimu!
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.name}
                </Link>
              );
            })}
          </nav>


          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 z-50">
            {/* Akses/Login Panitia (most right) */}
            <Link
              href="/dashboard"
              className="p-2 text-[#D4AF37] hover:text-[#D4AF37]/80 hover:bg-[#D4AF37]/10 rounded-full transition-all duration-200 active:scale-95 shadow-[0_0_10px_rgba(212,175,55,0.1)] border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 flex items-center justify-center"
              title="Akses Panitia"
            >
              <ShieldCheck className="w-4.5 h-4.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Floating Glassmorphism Mobile Bottom Navbar */}
      <div className="md:hidden fixed bottom-3 left-0 right-0 mx-auto z-50 w-[92%] max-w-md bg-[#022c22]/90 backdrop-blur-xl border border-[#D4AF37]/35 rounded-full px-2 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.6),_0_0_12px_rgba(212,175,55,0.15)] flex items-center justify-around">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center py-1 flex-1 px-1 rounded-full transition-all duration-300 relative ${
                isActive
                  ? "text-[#D4AF37] scale-105"
                  : "text-gray-400 hover:text-white hover:scale-105"
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[9px] font-medium tracking-tight whitespace-nowrap">{link.name}</span>
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-[#D4AF37] rounded-full shadow-[0_0_8px_#D4AF37]" />
              )}
            </Link>
          );
        })}
      </div>
    </>
  );
}
