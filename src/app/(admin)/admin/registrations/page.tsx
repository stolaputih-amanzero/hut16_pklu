"use client";

import { useEffect, useState, useMemo } from "react";
import { getAllRegistrations, deleteRegistration } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Users, 
  Banknote,
  Shirt, 
  Search, 
  Download, 
  Eye, 
  Trash2, 
  FileText, 
  Image as ImageIcon, 
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  Building,
  RotateCcw
} from "lucide-react";

export default function RekapRegistrasiPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & Sorting
  const [search, setSearch] = useState("");
  const [selectedMode, setSelectedMode] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedMupel, setSelectedMupel] = useState("ALL");
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const resetFilters = () => {
    setSearch("");
    setSelectedMode("ALL");
    setSelectedCategory("ALL");
    setSelectedType("ALL");
    setSelectedMupel("ALL");
  };

  // Selected Detail Modal
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    const res = await getAllRegistrations();
    setLoading(false);

    if (res.success && res.data) {
      setData(res.data);
    } else {
      setError(res.error || "Gagal memuat data registrasi");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data registrasi ini?")) return;
    setDeletingId(id);
    const res = await deleteRegistration(id);
    setDeletingId(null);

    if (res.success) {
      setData((prev) => prev.filter((item) => item.id !== id));
      if (selectedRecord?.id === id) setSelectedRecord(null);
    } else {
      alert(`Gagal menghapus: ${res.error}`);
    }
  };

  // List unique Mupel for filter
  const uniqueMupel = useMemo(() => {
    const list = Array.from(new Set(data.map((item) => item.mupel).filter(Boolean)));
    return list.sort();
  }, [data]);

  // Global Search Filtered Data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const modeMatch = selectedMode === "ALL" || item.registration_mode === selectedMode;
      const catMatch = selectedCategory === "ALL" || item.category === selectedCategory;
      const mupelMatch = selectedMupel === "ALL" || item.mupel === selectedMupel;

      let typeMatch = true;
      if (selectedType !== "ALL") {
        if (item.registration_mode === "Mandiri") {
          typeMatch = item.type === selectedType;
        } else if (item.registration_mode === "Rombongan") {
          if (selectedType === "Peserta") typeMatch = (item.participant_count || 0) > 0;
          if (selectedType === "Pendamping") typeMatch = (item.companion_count || 0) > 0;
        }
      }

      const q = search.toLowerCase().trim();
      const nameStr = (item.registration_mode === "Mandiri" ? item.full_name : item.pic_name) || "";
      const keywordMatch =
        !q ||
        (item.registration_code && item.registration_code.toLowerCase().includes(q)) ||
        nameStr.toLowerCase().includes(q) ||
        (item.whatsapp_number && item.whatsapp_number.includes(q)) ||
        (item.church_name && item.church_name.toLowerCase().includes(q)) ||
        (item.mupel && item.mupel.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.registration_mode && item.registration_mode.toLowerCase().includes(q)) ||
        (item.type && item.type.toLowerCase().includes(q)) ||
        (item.role && item.role.toLowerCase().includes(q)) ||
        (item.companion_for && item.companion_for.toLowerCase().includes(q));

      return modeMatch && catMatch && typeMatch && mupelMatch && keywordMatch;
    });
  }, [data, selectedMode, selectedCategory, selectedType, selectedMupel, search]);

  // Sorted Data
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let valA: any = "";
      let valB: any = "";

      switch (sortField) {
        case "code":
          valA = a.registration_code || "";
          valB = b.registration_code || "";
          break;
        case "mode":
          valA = a.registration_mode || "";
          valB = b.registration_mode || "";
          break;
        case "church":
          valA = a.church_name || "";
          valB = b.church_name || "";
          break;
        case "name":
          valA = (a.registration_mode === "Mandiri" ? a.full_name : a.pic_name) || "";
          valB = (b.registration_mode === "Mandiri" ? b.full_name : b.pic_name) || "";
          break;
        case "wa":
          valA = a.whatsapp_number || "";
          valB = b.whatsapp_number || "";
          break;
        case "headcount":
          valA = a.registration_mode === "Mandiri" ? 1 : (a.participant_count || 0) + (a.companion_count || 0);
          valB = b.registration_mode === "Mandiri" ? 1 : (b.participant_count || 0) + (b.companion_count || 0);
          break;
        case "created_at":
        default:
          valA = new Date(a.created_at).getTime();
          valB = new Date(b.created_at).getTime();
          break;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortField, sortOrder]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const renderSortArrow = (field: string) => {
    if (sortField !== field) return <span className="opacity-30 ml-1">↕</span>;
    return sortOrder === "asc" ? <span className="ml-1 text-[#D4AF37]">↑</span> : <span className="ml-1 text-[#D4AF37]">↓</span>;
  };

  // Statistics Summary
  const stats = useMemo(() => {
    let totalFormCount = filteredData.length;
    let totalHeadcount = 0;
    let totalRevenue = 0;
    let totalUmumCount = 0;
    let totalTuanRumahCount = 0;
    let totalPesertaCount = 0;
    let totalPendampingCount = 0;

    const shirtSummary = { S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, Random: 0 };

    filteredData.forEach((item) => {
      let head = 1;
      if (item.registration_mode === "Mandiri") {
        head = 1;
        if (item.type === "Peserta") totalPesertaCount += 1;
        if (item.type === "Pendamping") totalPendampingCount += 1;
      } else if (item.registration_mode === "Rombongan") {
        const pC = item.participant_count || 0;
        const cC = item.companion_count || 0;
        head = pC + cC;
        totalPesertaCount += pC;
        totalPendampingCount += cC;
      }

      totalHeadcount += head;

      const price = item.category === "Umum" ? 475000 : 350000;
      totalRevenue += head * price;

      if (item.category === "Umum") totalUmumCount += head;
      if (item.category === "Tuan Rumah") totalTuanRumahCount += head;

      if (item.registration_mode === "Mandiri") {
        const sz = (item.shirt_size || "").toUpperCase();
        if (sz in shirtSummary) {
          shirtSummary[sz as keyof typeof shirtSummary] += 1;
        } else {
          shirtSummary.Random += 1;
        }
      } else if (item.registration_mode === "Rombongan" && item.shirt_sizes_summary) {
        Object.entries(item.shirt_sizes_summary).forEach(([sKey, qty]) => {
          const uKey = sKey.toUpperCase();
          if (uKey in shirtSummary) {
            shirtSummary[uKey as keyof typeof shirtSummary] += Number(qty || 0);
          }
        });
      }
    });

    return {
      totalFormCount,
      totalHeadcount,
      totalRevenue,
      totalUmumCount,
      totalTuanRumahCount,
      totalPesertaCount,
      totalPendampingCount,
      shirtSummary,
    };
  }, [filteredData]);

  // Export CSV
  const exportToCSV = () => {
    if (filteredData.length === 0) {
      alert("Tidak ada data untuk diexport");
      return;
    }

    const headers = [
      "Kode Registrasi",
      "Mode",
      "Kategori",
      "Mupel",
      "Jemaat",
      "Nama Pendaftar / PIC",
      "No WhatsApp",
      "Tipe/Peran",
      "Total Orang",
      "Rincian Ukuran Baju",
      "Bukti Transfer URL",
      "Surat Tugas URL",
      "Daftar Nama URL",
      "Waktu Pendaftaran",
    ];

    const rows = filteredData.map((item) => {
      let nameStr = item.registration_mode === "Mandiri" ? item.full_name : item.pic_name;
      let totalHead = item.registration_mode === "Mandiri" ? 1 : (item.participant_count || 0) + (item.companion_count || 0);
      let shirtStr = item.registration_mode === "Mandiri" ? (item.shirt_size || "Acak") : JSON.stringify(item.shirt_sizes_summary || {});

      return [
        `"${item.registration_code || ""}"`,
        `"${item.registration_mode || ""}"`,
        `"${item.category || ""}"`,
        `"${item.mupel || ""}"`,
        `"${item.church_name || ""}"`,
        `"${nameStr || ""}"`,
        `"${item.whatsapp_number || ""}"`,
        `"${item.type || (item.role || "-")}"`,
        totalHead,
        `"${shirtStr.replace(/"/g, '""')}"`,
        `"${item.proof_of_transfer_url || ""}"`,
        `"${item.assignment_letter_url || ""}"`,
        `"${item.participant_list_url || ""}"`,
        `"${new Date(item.created_at).toLocaleString("id-ID")}"`,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Registrasi_HUT16_PKLU_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#D4AF37] tracking-tight">Rekap Data Registrasi</h1>
          <p className="text-sm text-gray-300">Data pendaftaran publik Temu PKLU GPIB 2026</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-0">
          <Button variant="outline" onClick={fetchData} disabled={loading} className="flex-1 sm:flex-none border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={exportToCSV} className="flex-1 sm:flex-none bg-[#D4AF37] hover:bg-[#B3932D] text-black font-bold">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <a
            href={`/api/reports/registrations?category=${selectedCategory}&q=${encodeURIComponent(search)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none"
          >
            <Button className="w-full bg-[#022c22] border border-[#D4AF37]/45 hover:bg-[#033B2B] text-[#D4AF37] font-bold">
              <FileText className="w-4 h-4 mr-2" />
              Laporan PDF
            </Button>
          </a>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {/* Card 1: Total Headcount */}
        <div className="rounded-xl border border-[#D4AF37]/20 bg-gradient-to-br from-black/80 to-black/40 p-5 shadow-xl backdrop-blur-md relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-[#D4AF37]/5 transition-transform group-hover:scale-110 group-hover:rotate-12 duration-500">
            <Users className="w-32 h-32" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-gray-400">Total Pendaftar</span>
            <div className="p-2 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-extrabold text-white">{stats.totalHeadcount} <span className="text-sm font-normal text-gray-400">Orang</span></p>
            <p className="text-xs text-[#D4AF37] font-semibold mt-1">Peserta: {stats.totalPesertaCount} | Pendamping: {stats.totalPendampingCount}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{stats.totalFormCount} Formulir Terisi</p>
          </div>
        </div>

        {/* Card 2: Total Revenue */}
        <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-black/80 to-black/40 p-5 shadow-xl backdrop-blur-md relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-emerald-500/5 transition-transform group-hover:scale-110 group-hover:rotate-12 duration-500">
            <Banknote className="w-32 h-32" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-gray-400">Est. Total Kontribusi</span>
            <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-extrabold text-xs">
              Rp
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-extrabold text-emerald-400">Rp {stats.totalRevenue.toLocaleString("id-ID")}</p>
            <p className="text-xs text-emerald-300 font-semibold mt-1">Umum: {stats.totalUmumCount} | Tuan Rumah: {stats.totalTuanRumahCount}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">@ Rp475k (Umum) / Rp350k (TR)</p>
          </div>
        </div>

        {/* Card 3: Agregat Kaos */}
        <div className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-black/80 to-black/40 p-5 shadow-xl backdrop-blur-md sm:col-span-2 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-blue-500/5 transition-transform group-hover:scale-110 group-hover:rotate-12 duration-500">
            <Shirt className="w-32 h-32" />
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-gray-400">Agregat Ukuran Baju (Vendor Konveksi)</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Shirt className="w-5 h-5" />
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-center mt-4 relative z-10">
            {Object.entries(stats.shirtSummary).map(([sz, qty]) => (
              sz !== "Random" ? (
                <div key={sz} className="bg-black/50 border border-white/10 rounded-lg p-2">
                  <span className="text-[10px] text-gray-400 block">{sz}</span>
                  <span className="text-lg font-bold text-[#D4AF37]">{qty}</span>
                </div>
              ) : null
            ))}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-4 shadow-lg backdrop-blur-sm">
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
            <Input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Cari Nama / PIC / WA..." 
              className="pl-9 h-11 bg-black/50 border-white/20 text-white rounded-lg focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]" 
            />
          </div>

          {/* Mode Filter */}
          <Select value={selectedMode} onValueChange={setSelectedMode}>
            <SelectTrigger className="h-11 bg-black/50 border-white/20 text-white rounded-lg focus:border-[#D4AF37]">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Mode</SelectItem>
              <SelectItem value="Mandiri">Mandiri</SelectItem>
              <SelectItem value="Rombongan">Rombongan</SelectItem>
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="h-11 bg-black/50 border-white/20 text-white rounded-lg focus:border-[#D4AF37]">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Kategori</SelectItem>
              <SelectItem value="Umum">Umum</SelectItem>
              <SelectItem value="Tuan Rumah">Tuan Rumah</SelectItem>
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="h-11 bg-black/50 border-white/20 text-white rounded-lg focus:border-[#D4AF37]">
              <SelectValue placeholder="Tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Tipe</SelectItem>
              <SelectItem value="Peserta">Peserta</SelectItem>
              <SelectItem value="Pendamping">Pendamping</SelectItem>
            </SelectContent>
          </Select>

          {/* Mupel Filter */}
          <Select value={selectedMupel} onValueChange={setSelectedMupel}>
            <SelectTrigger className="h-11 bg-black/50 border-white/20 text-white rounded-lg focus:border-[#D4AF37]">
              <SelectValue placeholder="Mupel Asal" />
            </SelectTrigger>
            <SelectContent className="max-h-[250px]">
              <SelectItem value="ALL">Semua Mupel</SelectItem>
              {uniqueMupel.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Reset Filters Button */}
          <Button 
            type="button" 
            onClick={resetFilters}
            variant="outline"
            className="h-11 border-red-500/30 hover:border-red-500/60 text-red-400 hover:bg-red-950/20 font-bold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Filter
          </Button>
        </div>
      </div>

      {/* DATA VIEW (HYBRID: MOBILE CARDS & DESKTOP TABLE) */}
      
      {/* 1. MOBILE CARDS VIEW (< xl) */}
      <div className="xl:hidden space-y-4">
        {loading ? (
          <div className="py-12 text-center text-gray-400 border border-white/10 rounded-xl bg-black/40">Memuat data registrasi...</div>
        ) : sortedData.length === 0 ? (
          <div className="py-12 text-center text-gray-400 border border-white/10 rounded-xl bg-black/40">Tidak ada data pendaftaran ditemukan.</div>
        ) : (
          sortedData.map((item) => {
            const isRombongan = item.registration_mode === "Rombongan";
            const headcount = isRombongan ? (item.participant_count || 0) + (item.companion_count || 0) : 1;
            const nameDisplay = isRombongan ? item.pic_name : item.full_name;
            const cleanWa = (item.whatsapp_number || "").replace(/^0/, "62").replace(/\D/g, "");

            return (
              <div 
                key={item.id} 
                onClick={() => setSelectedRecord(item)}
                className="bg-black/40 border border-[#D4AF37]/20 rounded-xl p-4 shadow-lg backdrop-blur-sm cursor-pointer hover:bg-black/60 transition-colors space-y-3"
              >
                {/* Card Header: Badges & Actions */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${isRombongan ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "bg-blue-500/20 text-blue-300 border border-blue-500/30"}`}>
                        {item.registration_mode}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${item.category === "Tuan Rumah" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"}`}>
                        {item.category}
                      </span>
                    </div>
                    <span className="font-mono text-sm font-bold text-[#D4AF37] block">{item.registration_code}</span>
                  </div>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button size="icon" variant="ghost" onClick={() => setSelectedRecord(item)} className="h-8 w-8 text-gray-300 hover:text-white bg-white/5 rounded-lg">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)} disabled={deletingId === item.id} className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-950/50 bg-red-500/10 rounded-lg border border-red-500/20">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Card Body: Info */}
                <div>
                  <h3 className="font-bold text-white text-lg leading-tight">{nameDisplay}</h3>
                  <div className="text-xs text-gray-400 mt-0.5">
                    <span className="text-gray-300 font-medium">{item.church_name}</span> • {item.mupel}
                  </div>
                  <div className="text-[10px] text-[#D4AF37]/90 mt-1">
                    Daftar: {new Date(item.created_at).toLocaleDateString("id-ID")} {new Date(item.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                  </div>
                  <div className="text-[11px] mt-1">
                    {!isRombongan ? (
                      <span className={item.type === "Peserta" ? "text-blue-300" : "text-purple-300"}>
                        {item.type} {item.role ? `(${item.role})` : ""}
                      </span>
                    ) : (
                      <span className="text-gray-400">P: {item.participant_count || 0} Peserta | D: {item.companion_count || 0} Pendamping</span>
                    )}
                  </div>
                </div>

                {/* Card Footer: Status & File Icons */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs font-semibold text-white bg-white/10 px-2 py-1 rounded-md">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      {headcount}
                    </div>
                    {cleanWa && (
                      <a 
                        href={`https://wa.me/${cleanWa}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 text-xs font-mono font-medium"
                      >
                        WA
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.proof_of_transfer_url && <ImageIcon className="w-4 h-4 text-emerald-400" />}
                    {item.assignment_letter_url && <FileText className="w-4 h-4 text-blue-400" />}
                    {item.participant_list_url && <ExternalLink className="w-4 h-4 text-purple-400" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 2. DESKTOP TABLE VIEW (>= xl) */}
      <div className="hidden xl:block rounded-xl border border-white/10 bg-black/40 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-black/60 text-xs uppercase text-[#D4AF37] border-b border-white/10 select-none">
              <tr>
                <th onClick={() => handleSort("code")} className="py-3 px-4 cursor-pointer hover:text-white">
                  Kode / Waktu {renderSortArrow("code")}
                </th>
                <th onClick={() => handleSort("mode")} className="py-3 px-4 cursor-pointer hover:text-white">
                  Mode / Kat. {renderSortArrow("mode")}
                </th>
                <th onClick={() => handleSort("church")} className="py-3 px-4 cursor-pointer hover:text-white">
                  Asal Jemaat {renderSortArrow("church")}
                </th>
                <th onClick={() => handleSort("name")} className="py-3 px-4 cursor-pointer hover:text-white">
                  Pendaftar / PIC {renderSortArrow("name")}
                </th>
                <th onClick={() => handleSort("wa")} className="py-3 px-4 cursor-pointer hover:text-white">
                  No WhatsApp {renderSortArrow("wa")}
                </th>
                <th onClick={() => handleSort("headcount")} className="py-3 px-4 text-center cursor-pointer hover:text-white">
                  Orang {renderSortArrow("headcount")}
                </th>
                <th className="py-3 px-4">Baju / Rekap</th>
                <th className="py-3 px-4 text-center">Berkas</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">Memuat data registrasi...</td>
                </tr>
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">Tidak ada data pendaftaran ditemukan.</td>
                </tr>
              ) : (
                sortedData.map((item) => {
                  const isRombongan = item.registration_mode === "Rombongan";
                  const headcount = isRombongan ? (item.participant_count || 0) + (item.companion_count || 0) : 1;
                  const nameDisplay = isRombongan ? item.pic_name : item.full_name;
                  const cleanWa = (item.whatsapp_number || "").replace(/^0/, "62").replace(/\D/g, "");

                  return (
                    <tr 
                      key={item.id} 
                      onClick={() => setSelectedRecord(item)}
                      className="hover:bg-white/10 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-white group-hover:text-[#D4AF37] transition-colors block">{item.registration_code}</span>
                        <span className="text-[11px] text-gray-400 block mt-0.5">
                          {new Date(item.created_at).toLocaleDateString("id-ID")} {new Date(item.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded ${isRombongan ? "bg-purple-500/20 text-purple-300" : "bg-blue-500/20 text-blue-300"}`}>
                          {item.registration_mode}
                        </span>
                        <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded ml-1 ${item.category === "Tuan Rumah" ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-white block">{item.church_name}</span>
                        <span className="text-xs text-[#D4AF37]">{item.mupel}</span>
                      </td>
                      <td className="py-3 px-4 font-medium text-white">
                        <div>{nameDisplay}</div>
                        <div className="text-[11px]">
                          {!isRombongan ? (
                            <span className={item.type === "Peserta" ? "text-blue-300" : "text-purple-300"}>
                              {item.type} {item.role ? `(${item.role})` : ""}
                            </span>
                          ) : (
                            <span className="text-gray-400">P: {item.participant_count || 0} Peserta | D: {item.companion_count || 0} Pendamping</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs" onClick={(e) => e.stopPropagation()}>
                        {cleanWa ? (
                          <a 
                            href={`https://wa.me/${cleanWa}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-emerald-400 hover:text-emerald-300 hover:underline inline-flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20"
                            title="Chat WhatsApp"
                          >
                            {item.whatsapp_number}
                          </a>
                        ) : (
                          <span className="text-gray-400">{item.whatsapp_number}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-white">{headcount}</td>
                      <td className="py-3 px-4 text-xs">
                        {!isRombongan ? (
                          <span className="bg-white/10 px-2 py-1 rounded text-white font-mono">{item.shirt_size || "Acak"}</span>
                        ) : (
                          <div className="flex flex-wrap gap-1 font-mono text-[11px]">
                            {item.shirt_sizes_summary && Object.entries(item.shirt_sizes_summary).map(([sz, q]) => (
                              Number(q) > 0 ? <span key={sz} className="bg-white/10 px-1.5 py-0.5 rounded">{sz}:{String(q)}</span> : null
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          {item.proof_of_transfer_url && (
                            <a href={item.proof_of_transfer_url} target="_blank" rel="noreferrer" title="Bukti Transfer" className="p-1 rounded hover:bg-white/10 text-emerald-400">
                              <ImageIcon className="w-4 h-4" />
                            </a>
                          )}
                          {item.assignment_letter_url && (
                            <a href={item.assignment_letter_url} target="_blank" rel="noreferrer" title="Surat Tugas" className="p-1 rounded hover:bg-white/10 text-blue-400">
                              <FileText className="w-4 h-4" />
                            </a>
                          )}
                          {item.participant_list_url && (
                            <a href={item.participant_list_url} target="_blank" rel="noreferrer" title="File Daftar Nama" className="p-1 rounded hover:bg-white/10 text-purple-400">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setSelectedRecord(item)} className="h-8 w-8 p-0 text-gray-300 hover:text-white">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)} disabled={deletingId === item.id} className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-950/30">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="max-w-2xl bg-black/90 border-[#D4AF37]/40 text-[#FDFBF7]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#D4AF37] font-mono">
              Detail Pendaftaran ({selectedRecord?.registration_code})
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Rincian lengkap data pendaftaran dan berkas terlampir.
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-5 py-4 max-h-[70vh] overflow-y-auto text-sm pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                <div>
                  <span className="text-xs text-gray-400 block">Mode Pendaftaran</span>
                  <strong className="text-white text-base">{selectedRecord.registration_mode}</strong>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Kategori</span>
                  <strong className="text-white text-base">{selectedRecord.category}</strong>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Asal Mupel</span>
                  <strong className="text-white">{selectedRecord.mupel}</strong>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Nama Jemaat</span>
                  <strong className="text-white">{selectedRecord.church_name}</strong>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Waktu Pendaftaran</span>
                  <strong className="text-white">
                    {new Date(selectedRecord.created_at).toLocaleDateString("id-ID")} {new Date(selectedRecord.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                  </strong>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Status Pendaftaran</span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Terekam &amp; Valid
                  </span>
                </div>
              </div>

              {selectedRecord.registration_mode === "Mandiri" ? (
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
                  <p className="font-semibold text-[#D4AF37] border-b border-white/10 pb-1 mb-2">Data Peserta / Pendamping</p>
                  <p><span className="text-gray-400">Nama Lengkap:</span> <strong className="text-white">{selectedRecord.full_name}</strong></p>
                  <p><span className="text-gray-400">No WhatsApp:</span> <strong className="text-white">{selectedRecord.whatsapp_number}</strong></p>
                  <p><span className="text-gray-400">Tipe Pendaftaran:</span> <strong className="text-white">{selectedRecord.type}</strong></p>
                  {selectedRecord.role && <p><span className="text-gray-400">Peran:</span> <strong className="text-white">{selectedRecord.role}</strong></p>}
                  {selectedRecord.companion_for && <p><span className="text-gray-400">Mendampingi:</span> <strong className="text-white">{selectedRecord.companion_for}</strong></p>}
                  <p><span className="text-gray-400">Ukuran Baju:</span> <strong className="text-white">{selectedRecord.shirt_size || "Acak"}</strong></p>
                </div>
              ) : (
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
                  <p className="font-semibold text-[#D4AF37] border-b border-white/10 pb-1 mb-2">Data Rombongan (Bulk)</p>
                  <p><span className="text-gray-400">Nama PIC:</span> <strong className="text-white">{selectedRecord.pic_name}</strong></p>
                  <p><span className="text-gray-400">No WhatsApp PIC:</span> <strong className="text-white">{selectedRecord.whatsapp_number}</strong></p>
                  <p><span className="text-gray-400">Jumlah Peserta:</span> <strong className="text-white">{selectedRecord.participant_count || 0} Orang</strong></p>
                  <p><span className="text-gray-400">Jumlah Pendamping:</span> <strong className="text-white">{selectedRecord.companion_count || 0} Orang</strong></p>
                  
                  {selectedRecord.shirt_sizes_summary && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-xs text-gray-400 mb-2">Rincian Ukuran Baju Rombongan:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(selectedRecord.shirt_sizes_summary).map(([sz, q]) => (
                          Number(q) > 0 ? (
                            <span key={sz} className="bg-black/50 border border-[#D4AF37]/30 text-[#D4AF37] px-3 py-1 rounded font-mono text-xs">
                              {sz}: {String(q)}
                            </span>
                          ) : null
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tautan Berkas */}
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3">
                <p className="font-semibold text-[#D4AF37] border-b border-white/10 pb-1">Lampiran Berkas (Supabase Storage)</p>
                <div className="flex flex-col gap-2">
                  {selectedRecord.proof_of_transfer_url ? (
                    <a href={selectedRecord.proof_of_transfer_url} target="_blank" rel="noreferrer" className="flex items-center justify-between bg-emerald-500/10 text-emerald-400 p-2.5 rounded-lg border border-emerald-500/30 hover:bg-emerald-500/20">
                      <span className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Bukti Transfer</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : <span className="text-xs text-gray-500">Bukti transfer tidak tersedia</span>}

                  {selectedRecord.assignment_letter_url && (
                    <a href={selectedRecord.assignment_letter_url} target="_blank" rel="noreferrer" className="flex items-center justify-between bg-blue-500/10 text-blue-400 p-2.5 rounded-lg border border-blue-500/30 hover:bg-blue-500/20">
                      <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Surat Tugas Kolektif</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  {selectedRecord.participant_list_url && (
                    <a href={selectedRecord.participant_list_url} target="_blank" rel="noreferrer" className="flex items-center justify-between bg-purple-500/10 text-purple-400 p-2.5 rounded-lg border border-purple-500/30 hover:bg-purple-500/20">
                      <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> File Lampiran Daftar Nama</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRecord(null)} className="border-white/20 text-white">
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
