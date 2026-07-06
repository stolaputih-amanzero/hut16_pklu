"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  LogOut,
  LayoutDashboard,
  Users,
  MessageSquareQuote,
  ShoppingBag,
  Plus,
  FileSpreadsheet,
  Menu,
  X,
  ShieldAlert,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface SidebarProps {
  fullName: string;
  role: string;
}

export function Sidebar({ fullName, role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const navItems = [
    { name: "Dashboard Overview", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Data Pendaftaran", path: "/admin/registrations", icon: Users },
    { name: "Pesanan Merchandise", path: "/admin/merch", icon: ShoppingBag },
    { name: "Buku Tamu Moderasi", path: "/admin/guestbook", icon: MessageSquareQuote },
    { name: "Buat Proposal", path: "/admin/buat-proposal", icon: Plus },
    { name: "Laporan Proposal", path: "/admin/daftar-proposal", icon: FileSpreadsheet },
  ];

  return (
    <>
      {/* 1. Mobile Header with Hamburger Menu */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#022c22]/90 backdrop-blur-md border-b border-[#D4AF37]/20 px-4 flex items-center justify-between z-40 select-none shadow-md">
        <div className="flex items-center gap-2">
          <Image
            src="/logo_hut16_pklu.png"
            alt="Logo"
            width={32}
            height={32}
            className="object-contain"
          />
          <div>
            <h1 className="font-black text-[#FDFBF7] text-xs tracking-wider">HUT ke-16 PKLU</h1>
            <p className="text-[9px] text-[#D4AF37]">Admin Portal</p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Toggle Sidebar"
        >
          {isOpen ? <X className="w-6 h-6 text-[#D4AF37]" /> : <Menu className="w-6 h-6 text-[#D4AF37]" />}
        </button>
      </header>

      {/* 2. Backdrop Overlay for Mobile Drawer */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity duration-300"
        />
      )}

      {/* 3. Main Sidebar Container (Desktop static + Mobile drawer) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#022c22]/95 backdrop-blur-xl border-r border-[#D4AF37]/20 pt-20 md:pt-6 pb-6 px-4 z-40 flex flex-col justify-between shadow-[4px_0_30px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          {/* Header Brand (Desktop Only) */}
          <div className="hidden md:flex items-center gap-3 px-2">
            <Image
              src="/logo_hut16_pklu.png"
              alt="Logo"
              width={40}
              height={40}
              className="object-contain drop-shadow-[0_2px_10px_rgba(212,175,55,0.3)]"
            />
            <div>
              <h1 className="font-extrabold text-[#FDFBF7] text-xs tracking-widest uppercase">HUT ke-16 PKLU</h1>
              <p className="text-[10px] text-[#D4AF37] font-semibold">Administrasi Panitia</p>
            </div>
          </div>

          <div className="h-px bg-[#D4AF37]/20 hidden md:block" />

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-300 border ${
                    isActive
                      ? "bg-[#D4AF37] text-black font-bold border-[#D4AF37]/40 shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                      : "text-[#FDFBF7]/70 hover:text-white hover:bg-white/5 border-transparent"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Exclusive Super User Navigation Link (Strict JavaScript Logical Conditional Rendering) */}
            {role === "super_user" && (
              <Link
                href="/admin/users"
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-300 border ${
                  pathname === "/admin/users"
                    ? "bg-[#D4AF37] text-black font-bold border-[#D4AF37]/40 shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                    : "text-[#FDFBF7]/70 hover:text-white hover:bg-white/5 border-transparent"
                }`}
              >
                <UserCog className="h-4.5 w-4.5 shrink-0" />
                <span>Manage Users</span>
              </Link>
            )}
          </nav>
        </div>

        {/* User Card Profile & Sign Out Block */}
        <div className="space-y-4">
          <div className="h-px bg-white/10" />

          {/* Profile Card */}
          <div className="flex items-center gap-3 px-2 select-none">
            <div className="p-2 rounded-xl bg-black/40 border border-[#D4AF37]/30 text-[#D4AF37]">
              {role === "super_user" ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#FDFBF7] truncate leading-tight">{fullName}</p>
              <span
                className={`inline-block text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md mt-1 ${
                  role === "super_user"
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                }`}
              >
                {role === "super_user" ? "Super User" : "Admin"}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 text-xs font-bold cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Keluar Sesi
          </button>
        </div>
      </aside>
    </>
  );
}
