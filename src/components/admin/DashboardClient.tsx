"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  ShoppingBag,
  FileSpreadsheet,
  TrendingUp,
  Banknote,
  DollarSign,
  Calendar,
  MessageSquareQuote,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  Package,
  CalendarDays,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  CartesianGrid
} from "recharts";
import { splitItemType } from "@/lib/utils";

type DashboardClientProps = {
  profile: {
    full_name: string;
    role: string;
  };
  registrations: any[];
  merchOrders: any[];
  proposals: any[];
  merchProducts: any[];
  pendingGuestbookCount: number;
};

export default function DashboardClient({
  profile,
  registrations,
  merchOrders,
  proposals,
  merchProducts,
  pendingGuestbookCount
}: DashboardClientProps) {
  // Filters & State
  const [dateFilter, setDateFilter] = useState<"7d" | "30d" | "all">("30d");
  const [trendType, setTrendType] = useState<"revenue" | "volume">("revenue");

  // Format Date Helper
  const formatDateString = (dateStr: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateStr));
  };

  // Helper: Parse & match merch product price
  const getOrderPrice = useMemo(() => {
    return (itemTypeStr: string) => {
      if (!itemTypeStr) return 0;
      const parts = splitItemType(itemTypeStr);
      let total = 0;
      parts.forEach((part) => {
        const qtyMatch = part.match(/\s+x(\d+)$/);
        const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;

        let cleanName = part.replace(/\s+x\d+$/, "");
        cleanName = cleanName.replace(/\s+\(Ukuran\s+[^)]+\)$/i, "");

        const normalizedClean = cleanName.trim().toLowerCase();
        const prod = merchProducts.find((p) => {
          const normalizedProd = p.name.trim().toLowerCase();
          return (
            normalizedClean === normalizedProd ||
            normalizedClean.includes(normalizedProd) ||
            normalizedProd.includes(normalizedClean)
          );
        });

        if (prod) {
          total += prod.price * qty;
        } else {
          // Standard Fallback Pricing
          if (normalizedClean.includes("kaos") || normalizedClean.includes("shirt")) {
            total += 100000 * qty;
          } else if (normalizedClean.includes("pin")) {
            total += 15000 * qty;
          } else {
            total += 50000 * qty;
          }
        }
      });
      return total;
    };
  }, [merchProducts]);

  // Aggregate stats based on dynamic date range
  const summaryStats = useMemo(() => {
    // 1. Pendaftaran Statistics
    let totalHeadcount = 0;
    let regRevenue = 0;
    let umumCount = 0;
    let tuanRumahCount = 0;

    registrations.forEach((r) => {
      const headcount =
        r.registration_mode === "Mandiri"
          ? 1
          : (r.participant_count || 0) + (r.companion_count || 0);
      totalHeadcount += headcount;
      const price = r.category === "Umum" ? 475000 : 350000;
      regRevenue += headcount * price;

      if (r.category === "Umum") umumCount += headcount;
      if (r.category === "Tuan Rumah") tuanRumahCount += headcount;
    });

    // 2. Merchandise Statistics
    let verifiedMerchRevenue = 0;
    let pendingMerchRevenue = 0;
    let verifiedMerchItemsCount = 0;
    let pendingMerchItemsCount = 0;

    merchOrders.forEach((o) => {
      const price = getOrderPrice(o.item_type);
      const qty = o.quantity || 1;

      if (o.payment_status === "verified") {
        verifiedMerchRevenue += price;
        verifiedMerchItemsCount += qty;
      } else if (o.payment_status === "pending" || !o.payment_status) {
        pendingMerchRevenue += price;
        pendingMerchItemsCount += qty;
      }
    });

    // 3. Proposal Statistics
    let confirmedProposalRevenue = 0;
    let pendingProposalRevenue = 0;
    let confirmedProposalCount = 0;
    let pendingProposalCount = 0;

    proposals.forEach((p) => {
      const val = Number(p.contribution_value || 0);
      if (p.payment_status === "confirmed") {
        confirmedProposalRevenue += val;
        confirmedProposalCount += 1;
      } else if (p.payment_status === "pending" && val > 0) {
        pendingProposalRevenue += val;
        pendingProposalCount += 1;
      }
    });

    const totalRevenue = regRevenue + verifiedMerchRevenue + confirmedProposalRevenue;

    return {
      totalRevenue,
      regRevenue,
      verifiedMerchRevenue,
      pendingMerchRevenue,
      confirmedProposalRevenue,
      pendingProposalRevenue,
      totalHeadcount,
      verifiedMerchItemsCount,
      pendingMerchItemsCount,
      confirmedProposalCount,
      pendingProposalCount,
      umumCount,
      tuanRumahCount,
    };
  }, [registrations, merchOrders, proposals, getOrderPrice]);

  // Prepare Trend Data dynamically
  const trendData = useMemo(() => {
    const dataMap: {
      [key: string]: {
        date: string;
        formattedDate: string;
        revenue: number;
        pendaftaran: number;
        merchandise: number;
        proposal: number;
      };
    } = {};

    let daysCount = 30;
    if (dateFilter === "7d") daysCount = 7;
    else if (dateFilter === "all") daysCount = 90; // Default to last 90 days for trend representation

    // Initialize map
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const formatted = d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });
      dataMap[dateStr] = {
        date: dateStr,
        formattedDate: formatted,
        revenue: 0,
        pendaftaran: 0,
        merchandise: 0,
        proposal: 0,
      };
    }

    // Accumulate Registrations
    registrations.forEach((r) => {
      const dStr = r.created_at.split("T")[0];
      if (dataMap[dStr]) {
        const hc =
          r.registration_mode === "Mandiri"
            ? 1
            : (r.participant_count || 0) + (r.companion_count || 0);
        const price = r.category === "Umum" ? 475000 : 350000;
        dataMap[dStr].revenue += hc * price;
        dataMap[dStr].pendaftaran += hc;
      }
    });

    // Accumulate Merchandise (Only count verified merch sales in revenue trend!)
    merchOrders.forEach((o) => {
      const dStr = o.created_at.split("T")[0];
      if (dataMap[dStr] && o.payment_status === "verified") {
        const pr = getOrderPrice(o.item_type);
        dataMap[dStr].revenue += pr;
        dataMap[dStr].merchandise += o.quantity || 1;
      }
    });

    // Accumulate Proposals
    proposals.forEach((p) => {
      const dStr = p.created_at.split("T")[0];
      if (dataMap[dStr] && p.payment_status === "confirmed") {
        const val = Number(p.contribution_value || 0);
        dataMap[dStr].revenue += val;
        dataMap[dStr].proposal += 1;
      }
    });

    return Object.values(dataMap);
  }, [dateFilter, registrations, merchOrders, proposals, getOrderPrice]);

  // Distribution chart data
  const revenueDistributionData = [
    { name: "Pendaftaran", value: summaryStats.regRevenue, color: "#10B981" }, // emerald
    { name: "Merchandise", value: summaryStats.verifiedMerchRevenue, color: "#3B82F6" }, // blue
    { name: "Proposal Kontribusi", value: summaryStats.confirmedProposalRevenue, color: "#D4AF37" } // gold
  ].filter(item => item.value > 0);

  const regCategoryDistribution = [
    { name: "Umum (Rp475rb)", value: summaryStats.umumCount, color: "#10B981" },
    { name: "Tuan Rumah (Rp350rb)", value: summaryStats.tuanRumahCount, color: "#D4AF37" }
  ].filter(item => item.value > 0);

  // Parse Merchandise Product Popularity
  const merchPopularityData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    merchOrders.forEach((o) => {
      if (o.payment_status === "rejected") return; // Exclude rejected orders from popularity
      const parts = splitItemType(o.item_type);
      parts.forEach((part: string) => {
        const qtyMatch = part.match(/\s+x(\d+)$/);
        const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
        let cleanName = part.replace(/\s+x\d+$/, "");
        cleanName = cleanName.replace(/\s+\(Ukuran\s+[^)]+\)$/i, "");

        const normalizedClean = cleanName.trim().toLowerCase();
        const prod = merchProducts.find((p) => {
          const normalizedProd = p.name.trim().toLowerCase();
          return (
            normalizedClean === normalizedProd ||
            normalizedClean.includes(normalizedProd) ||
            normalizedProd.includes(normalizedClean)
          );
        });

        const finalName = prod ? prod.name : cleanName;
        counts[finalName] = (counts[finalName] || 0) + qty;
      });
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // top 5
  }, [merchOrders, merchProducts]);

  // Compile unified recent activity timeline (combining all 3)
  const recentActivities = useMemo(() => {
    const list: any[] = [];

    registrations.forEach((r) => {
      const isRombongan = r.registration_mode === "Rombongan";
      const name = isRombongan ? r.pic_name : r.full_name;
      list.push({
        id: r.id,
        type: "registration",
        title: `Pendaftaran Baru: ${name}`,
        subtitle: `${r.church_name} (${r.registration_mode})`,
        time: new Date(r.created_at),
        badge: "Registrasi",
        badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      });
    });

    merchOrders.forEach((o) => {
      const statusStr = o.payment_status === "verified" ? "Lunas" : o.payment_status === "rejected" ? "Ditolak" : "Pending";
      list.push({
        id: o.id,
        type: "merchandise",
        title: `Merchandise: ${o.buyer_name}`,
        subtitle: `${o.item_type} (${o.quantity} Pcs) • [${statusStr}]`,
        time: new Date(o.created_at),
        badge: "Merch",
        badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20"
      });
    });

    proposals.forEach((p) => {
      const typeStr = p.type === "donatur" ? "Donatur" : "Sponsor";
      const paymentStatusStr = p.payment_status === "confirmed" ? "Lunas" : "Komitmen";
      list.push({
        id: p.id,
        type: "proposal",
        title: `Proposal ${typeStr}: ${p.name}`,
        subtitle: `Nilai: Rp ${(p.contribution_value || 0).toLocaleString("id-ID")} (${paymentStatusStr})`,
        time: new Date(p.created_at),
        badge: "Proposal",
        badgeColor: "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20"
      });
    });

    return list.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5);
  }, [registrations, merchOrders, proposals]);

  return (
    <div className="space-y-8 select-none">
      {/* 1. Header Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#D4AF37]/20 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#FDFBF7] tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-gray-300 mt-1.5 font-montserrat">
            Ringkasan performa keuangan, pendaftaran, proposal, dan pembelian merchandise.
          </p>
        </div>

        {/* Global Date Filter Toggle */}
        <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-white/10 shrink-0 self-start md:self-auto">
          {[
            { id: "7d", label: "7 Hari" },
            { id: "30d", label: "30 Hari" },
            { id: "all", label: "90 Hari" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setDateFilter(item.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${dateFilter === item.id
                  ? "bg-[#D4AF37] text-black shadow-lg"
                  : "text-gray-300 hover:text-white"
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Financial Metrics Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card A: Total Revenue */}
        <div className="rounded-2xl border border-[#D4AF37]/35 bg-gradient-to-br from-[#033B2B]/60 to-[#022c22]/40 p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-[#D4AF37]/5 rounded-bl-full pointer-events-none group-hover:bg-[#D4AF37]/10 transition-all duration-500" />
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total Pendapatan Terkumpul</span>
          <h2 className="text-2xl md:text-3xl font-black text-[#D4AF37] mt-3 font-mono">
            Rp {summaryStats.totalRevenue.toLocaleString("id-ID")}
          </h2>
          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-white/5">
            <span className="text-gray-400">Pendaftaran, Merch &amp; Proposal</span>
            <ArrowUpRight className="w-4 h-4 text-[#D4AF37] opacity-60" />
          </div>
        </div>

        {/* Card B: Registrations Revenue */}
        <div className="rounded-2xl border border-white/10 bg-black/45 hover:border-[#10B981]/50 p-6 shadow-xl transition-all duration-300 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-[#10B981]/5 rounded-bl-full pointer-events-none group-hover:bg-[#10B981]/10 transition-all duration-500" />
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Kontribusi Pendaftaran</span>
          <h2 className="text-2xl md:text-3xl font-black text-[#10B981] mt-3 font-mono">
            Rp {summaryStats.regRevenue.toLocaleString("id-ID")}
          </h2>
          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-white/5">
            <span className="text-gray-400">Total: {summaryStats.totalHeadcount} Orang Terdaftar</span>
            <Users className="w-4 h-4 text-[#10B981] opacity-60" />
          </div>
        </div>

        {/* Card C: Merch Sales */}
        <div className="rounded-2xl border border-white/10 bg-black/45 hover:border-blue-500/50 p-6 shadow-xl transition-all duration-300 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:bg-blue-500/10 transition-all duration-500" />
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Penjualan Merchandise Realisasi</span>
          <h2 className="text-2xl md:text-3xl font-black text-blue-400 mt-3 font-mono">
            Rp {summaryStats.verifiedMerchRevenue.toLocaleString("id-ID")}
          </h2>
          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-white/5 text-[11px]">
            <span className="text-gray-400">Komitmen Pending: Rp {summaryStats.pendingMerchRevenue.toLocaleString("id-ID")}</span>
            <ShoppingBag className="w-4 h-4 text-blue-400 opacity-60" />
          </div>
        </div>

        {/* Card D: Confirmed Proposals */}
        <div className="rounded-2xl border border-white/10 bg-black/45 hover:border-[#D4AF37]/50 p-6 shadow-xl transition-all duration-300 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-[#D4AF37]/5 rounded-bl-full pointer-events-none group-hover:bg-[#D4AF37]/10 transition-all duration-500" />
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Kontribusi Proposal Realisasi</span>
          <h2 className="text-2xl md:text-3xl font-black text-white mt-3 font-mono">
            Rp {summaryStats.confirmedProposalRevenue.toLocaleString("id-ID")}
          </h2>
          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-white/5 text-[11px]">
            <span className="text-gray-400">Komitmen Pending: Rp {summaryStats.pendingProposalRevenue.toLocaleString("id-ID")}</span>
            <FileSpreadsheet className="w-4 h-4 text-[#D4AF37] opacity-60" />
          </div>
        </div>
      </div>

      {/* 3. Interactive Main Trend Chart */}
      <div className="rounded-2xl border border-white/10 bg-black/40 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-[#FDFBF7] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
              Grafik Analisis Tren
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Visualisasi tren transaksi harian berdasarkan rentang waktu terpilih.
            </p>
          </div>

          {/* Toggle Trend Type */}
          <div className="flex items-center gap-1.5 bg-black/50 border border-white/15 p-1 rounded-xl">
            <button
              onClick={() => setTrendType("revenue")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${trendType === "revenue"
                  ? "bg-[#D4AF37] text-black"
                  : "text-gray-300 hover:text-white"
                }`}
            >
              Pendapatan (Rp)
            </button>
            <button
              onClick={() => setTrendType("volume")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${trendType === "volume"
                  ? "bg-[#D4AF37] text-black"
                  : "text-gray-300 hover:text-white"
                }`}
            >
              Volume Transaksi
            </button>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="formattedDate"
                stroke="#718096"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#718096"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  trendType === "revenue"
                    ? `Rp ${value >= 1000000 ? (value / 1000000).toFixed(1) + "M" : (value / 1000).toFixed(0) + "k"}`
                    : value
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#022c22",
                  borderColor: "rgba(212,175,55,0.4)",
                  borderRadius: "12px",
                  color: "#FDFBF7",
                  fontSize: "12px"
                }}
                formatter={(value: any, name: any) => {
                  const nameStr = name ? String(name) : "";
                  return [
                    trendType === "revenue"
                      ? `Rp ${Number(value).toLocaleString("id-ID")}`
                      : `${value} Transaksi`,
                    nameStr === "revenue"
                      ? "Pendapatan Total"
                      : nameStr ? nameStr.charAt(0).toUpperCase() + nameStr.slice(1) : ""
                  ];
                }}
              />
              {trendType === "revenue" ? (
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#D4AF37"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              ) : (
                <>
                  <Area
                    type="monotone"
                    dataKey="pendaftaran"
                    stroke="#10B981"
                    strokeWidth={1.5}
                    stackId="1"
                    fillOpacity={0.1}
                    fill="#10B981"
                  />
                  <Area
                    type="monotone"
                    dataKey="merchandise"
                    stroke="#3B82F6"
                    strokeWidth={1.5}
                    stackId="1"
                    fillOpacity={0.1}
                    fill="#3B82F6"
                  />
                  <Area
                    type="monotone"
                    dataKey="proposal"
                    stroke="#D4AF37"
                    strokeWidth={1.5}
                    stackId="1"
                    fillOpacity={0.1}
                    fill="#D4AF37"
                  />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Pie Distribution Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Share of Revenue */}
        <div className="rounded-2xl border border-white/10 bg-black/40 p-5 shadow-xl flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="font-bold text-white text-sm">Persentase Earning</h4>
            <p className="text-[10px] text-gray-400 mt-0.5">Proporsi sumber dana masuk yang terverifikasi.</p>
          </div>

          <div className="h-[180px] w-full flex items-center justify-center relative">
            {revenueDistributionData.length === 0 ? (
              <span className="text-xs text-gray-500 font-mono">Belum ada dana masuk</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {revenueDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => `Rp ${Number(value).toLocaleString("id-ID")}`}
                    contentStyle={{ backgroundColor: "#022c22", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Custom Legends */}
          <div className="space-y-1.5 pt-3 border-t border-white/5">
            {revenueDistributionData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-gray-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-mono text-[#FDFBF7] font-semibold">
                  {summaryStats.totalRevenue > 0
                    ? ((item.value / summaryStats.totalRevenue) * 100).toFixed(1) + "%"
                    : "0%"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Registration Categories Breakdown */}
        <div className="rounded-2xl border border-white/10 bg-black/40 p-5 shadow-xl flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="font-bold text-white text-sm">Pembagian Kategori Pendaftar</h4>
            <p className="text-[10px] text-gray-400 mt-0.5">Proporsi pendaftar Umum vs Jemaat Tuan Rumah.</p>
          </div>

          <div className="h-[180px] w-full flex items-center justify-center">
            {regCategoryDistribution.length === 0 ? (
              <span className="text-xs text-gray-500 font-mono">Belum ada pendaftar</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={regCategoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {regCategoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => `${value} Orang`}
                    contentStyle={{ backgroundColor: "#022c22", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Custom Legends */}
          <div className="space-y-1.5 pt-3 border-t border-white/5">
            {regCategoryDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-gray-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-mono text-[#FDFBF7] font-semibold">
                  {summaryStats.totalHeadcount > 0
                    ? ((item.value / summaryStats.totalHeadcount) * 100).toFixed(1) + "%"
                    : "0%"} ({item.value} Orang)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Merchandise Top Sold */}
        <div className="rounded-2xl border border-white/10 bg-black/40 p-5 shadow-xl flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="font-bold text-white text-sm">Produk Terlaris</h4>
            <p className="text-[10px] text-gray-400 mt-0.5">Top merchandise terlaris berdasarkan kuantitas.</p>
          </div>

          <div className="h-[180px] w-full flex items-center justify-center">
            {merchPopularityData.length === 0 ? (
              <span className="text-xs text-gray-500 font-mono">Belum ada pembelian</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={merchPopularityData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" fontSize={8} stroke="#718096" tickLine={false} />
                  <YAxis fontSize={9} stroke="#718096" tickLine={false} />
                  <Tooltip
                    formatter={(value: any) => [`${value} Pcs`, "Kuantitas"]}
                    contentStyle={{ backgroundColor: "#022c22", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                    {merchPopularityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "#D4AF37" : "#3B82F6"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="space-y-1.5 pt-3 border-t border-white/5">
            {merchPopularityData.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px] text-gray-300">
                <span className="truncate max-w-[200px]">{idx + 1}. {item.name}</span>
                <span className="font-mono text-white font-semibold">{item.count} Pcs</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Moderation Banner & Recent Activity Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Moderation Pending / Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          {pendingGuestbookCount > 0 ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-5 shadow-xl relative overflow-hidden group">
              <span className="relative flex h-2.5 w-2.5 absolute top-4 right-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <h4 className="font-bold text-red-400 text-sm flex items-center gap-1.5">
                <MessageSquareQuote className="w-4 h-4" /> Moderasi Ucapan Tamu
              </h4>
              <p className="text-[11px] text-red-300/80 mt-2 leading-relaxed">
                Terdapat <strong className="text-white font-mono text-xs">{pendingGuestbookCount} ucapan tamu baru</strong> yang memerlukan peninjauan sebelum ditayangkan ke publik.
              </p>
              <div className="mt-4">
                <a
                  href="/admin/guestbook"
                  className="inline-flex items-center gap-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold shadow-lg transition-colors"
                >
                  Tinjau Sekarang <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#D4AF37]/25 bg-gradient-to-br from-[#033B2B]/20 to-[#022c22]/10 p-5 shadow-xl">
              <h4 className="font-bold text-[#D4AF37] text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Status Sistem Oke
              </h4>
              <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                Semua ucapan tamu di buku tamu telah dimoderasi. Gunakan menu navigasi di sidebar untuk mengelola data pendaftaran atau mencetak dokumen proposal LPJ.
              </p>
            </div>
          )}

          {/* Quick Info / Guidelines Link */}
          <div className="rounded-2xl border border-white/10 bg-black/45 p-5 shadow-xl space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Metrik Keabsahan</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-gray-400 pb-2 border-b border-white/5">
                <span>Pendaftar Umum:</span>
                <span className="font-mono text-[#FDFBF7] font-semibold">{summaryStats.umumCount} Orang</span>
              </div>
              <div className="flex items-center justify-between text-gray-400 pb-2 border-b border-white/5">
                <span>Pendaftar Tuan Rumah:</span>
                <span className="font-mono text-[#FDFBF7] font-semibold">{summaryStats.tuanRumahCount} Orang</span>
              </div>
              <div className="flex items-center justify-between text-gray-400 pb-2 border-b border-white/5">
                <span>Merchandise Lunas:</span>
                <span className="font-mono text-emerald-400 font-semibold">Rp {summaryStats.verifiedMerchRevenue.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex items-center justify-between text-gray-400 pb-2 border-b border-white/5">
                <span>Merchandise Pending:</span>
                <span className="font-mono text-amber-400 font-semibold">Rp {summaryStats.pendingMerchRevenue.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span>Proposal Kontribusi:</span>
                <span className="font-mono text-[#D4AF37] font-semibold">
                  {summaryStats.confirmedProposalCount} Realisasi / {summaryStats.pendingProposalCount} Komitmen
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-black/40 p-6 shadow-xl">
          <div className="mb-4">
            <h4 className="font-bold text-white text-sm">Aktifitas Terbaru</h4>
            <p className="text-[11px] text-gray-400 mt-0.5">5 aktifitas pendaftaran, merchandise, atau proposal terakhir masuk.</p>
          </div>

          <div className="flow-root mt-4">
            <ul className="-mb-8">
              {recentActivities.map((activity, idx) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {idx !== recentActivities.length - 1 && (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-white/10"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex space-x-3 items-start">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center ring-8 ring-transparent">
                          {activity.type === "registration" && <Users className="w-4 h-4 text-emerald-400" />}
                          {activity.type === "merchandise" && <ShoppingBag className="w-4 h-4 text-blue-400" />}
                          {activity.type === "proposal" && <FileText className="w-4 h-4 text-[#D4AF37]" />}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-xs font-bold text-white">
                            {activity.title}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {activity.subtitle}
                          </p>
                        </div>
                        <div className="text-right text-[10px] whitespace-nowrap text-gray-500 flex flex-col items-end gap-1 shrink-0">
                          <span className={`px-2 py-0.5 rounded-full border text-[9px] font-semibold ${activity.badgeColor}`}>
                            {activity.badge}
                          </span>
                          <span className="font-mono">{formatDateString(activity.time.toISOString())}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
