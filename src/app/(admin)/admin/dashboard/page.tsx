import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  Users,
  ShoppingBag,
  MessageSquareQuote,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const headerList = await headers();
  const userId = headerList.get("x-user-id");
  const userRole = headerList.get("x-user-role");
  const userName = headerList.get("x-user-name");

  if (!userId || !userRole || !userName) {
    redirect("/admin/login");
  }

  const profile = {
    full_name: userName,
    role: userRole,
  };

  // 1. Initialize Supabase Server Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  // 4. Fetch 3 core statistics in parallel for optimal database response times
  let registrationsCount = 0;
  let merchOrdersCount = 0;
  let guestbookCount = 0;
  let hasError = false;

  try {
    const [regRes, merchRes, guestbookRes] = await Promise.all([
      supabase.from("registrations").select("*", { count: "exact", head: true }),
      supabase.from("merch_orders").select("*", { count: "exact", head: true }),
      supabase
        .from("guestbook_messages")
        .select("*", { count: "exact", head: true })
        .eq("is_approved", false),
    ]);

    if (regRes.error) throw regRes.error;
    if (merchRes.error) throw merchRes.error;
    if (guestbookRes.error) throw guestbookRes.error;

    registrationsCount = regRes.count || 0;
    merchOrdersCount = merchRes.count || 0;
    guestbookCount = guestbookRes.count || 0;
  } catch (error) {
    console.error("Dashboard stats parallel fetch error:", error);
    hasError = true;
  }

  // 5. Server-side Indonesian Date formatting
  const todayFormatted = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="container mx-auto max-w-6xl py-4">
      {/* A. Welcome Header Section */}
      <div className="mb-8 space-y-2 select-none">
        <h1 className="text-2xl md:text-3xl font-black text-[#FDFBF7] tracking-tight">
          Selamat Datang, {profile.full_name}
        </h1>
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-gray-300">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
              profile.role === "super_user"
                ? "bg-red-500/15 text-red-400 border border-red-500/25"
                : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
            }`}
          >
            {profile.role === "super_user" ? (
              <>
                <ShieldAlert className="w-3 h-3" />
                Super User
              </>
            ) : (
              <>
                <ShieldCheck className="w-3 h-3" />
                Admin
              </>
            )}
          </span>
          <span className="text-gray-500">•</span>
          <span className="font-semibold text-gray-400">{todayFormatted}</span>
        </div>
      </div>

      {/* B. Error Banner if database query fails */}
      {hasError && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <span>Gagal memuat beberapa data statistik terbaru. Silakan coba kembali.</span>
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold text-xs hover:bg-red-600 transition-colors shrink-0"
          >
            Coba Lagi
          </Link>
        </div>
      )}

      {/* C. Statistics Cards Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 select-none">
        {/* Card 1: Registrations */}
        <Link
          href="/admin/registrations"
          className="group relative block bg-black/45 hover:bg-black/60 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 rounded-2xl p-6 transition-all duration-300 shadow-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 rounded-bl-full pointer-events-none group-hover:bg-[#D4AF37]/10 transition-colors duration-300" />
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Pendaftar</span>
              <h2 className="text-4xl md:text-5xl font-black text-[#D4AF37] tracking-tight tabular-nums font-mono">
                {registrationsCount}
              </h2>
            </div>
            <div className="p-3 bg-[#D4AF37]/15 rounded-2xl text-[#D4AF37] border border-[#D4AF37]/20 group-hover:scale-110 transition-transform duration-300 shadow-inner">
              <Users className="w-8 h-8" />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-emerald-400 group-hover:text-emerald-300 transition-colors">
            <span>Kelola data pendaftaran</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 2: Merchandise */}
        <Link
          href="/admin/merch"
          className="group relative block bg-black/45 hover:bg-black/60 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 rounded-2xl p-6 transition-all duration-300 shadow-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 rounded-bl-full pointer-events-none group-hover:bg-[#D4AF37]/10 transition-colors duration-300" />
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pesanan Merchandise</span>
              <h2 className="text-4xl md:text-5xl font-black text-[#D4AF37] tracking-tight tabular-nums font-mono">
                {merchOrdersCount}
              </h2>
            </div>
            <div className="p-3 bg-[#D4AF37]/15 rounded-2xl text-[#D4AF37] border border-[#D4AF37]/20 group-hover:scale-110 transition-transform duration-300 shadow-inner">
              <ShoppingBag className="w-8 h-8" />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-emerald-400 group-hover:text-emerald-300 transition-colors">
            <span>Kelola pesanan produk</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 3: Guestbook */}
        <Link
          href="/admin/guestbook"
          className="group relative block bg-black/45 hover:bg-black/60 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 rounded-2xl p-6 transition-all duration-300 shadow-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] overflow-hidden md:col-span-2 lg:col-span-1"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 rounded-bl-full pointer-events-none group-hover:bg-[#D4AF37]/10 transition-colors duration-300" />
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ucapan Perlu Moderasi</span>
                {guestbookCount > 0 && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-[#D4AF37] tracking-tight tabular-nums font-mono">
                {guestbookCount}
              </h2>
            </div>
            <div className="p-3 bg-[#D4AF37]/15 rounded-2xl text-[#D4AF37] border border-[#D4AF37]/20 group-hover:scale-110 transition-transform duration-300 shadow-inner">
              <MessageSquareQuote className="w-8 h-8" />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-emerald-400 group-hover:text-emerald-300 transition-colors">
            <span>Tinjau ucapan tamu</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}