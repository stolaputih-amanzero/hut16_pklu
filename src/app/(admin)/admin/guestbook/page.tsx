"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { 
  fetchAdminGuestbookMessages, 
  approveGuestbookMessage, 
  unapproveGuestbookMessage, 
  deleteGuestbookMessage,
  updateGuestbookMessage
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { 
  MessageSquareQuote, 
  Search, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Clock, 
  Check, 
  RefreshCw, 
  ShieldAlert, 
  MapPin, 
  Calendar,
  Edit3,
  FileText,
  Camera,
  X,
  User
} from "lucide-react";

const decodeHTMLEntities = (str: string) => {
  if (!str) return "";
  return str
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
};

type GuestbookItem = {
  id: string;
  name: string;
  church_city: string;
  message: string;
  avatar_url?: string | null;
  is_approved: boolean;
  created_at: string;
};

export default function AdminGuestbookPage() {
  const confirm = useConfirm();
  const [messages, setMessages] = useState<GuestbookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved">("all");
  const [actionId, setActionId] = useState<string | null>(null);

  // Edit State
  const [editingMessage, setEditingMessage] = useState<GuestbookItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editChurchCity, setEditChurchCity] = useState("");
  const [editMessageText, setEditMessageText] = useState("");
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);
  const [editRemoveAvatar, setEditRemoveAvatar] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenEdit = (item: GuestbookItem) => {
    setEditingMessage(item);
    setEditName(item.name);
    setEditChurchCity(item.church_city);
    setEditMessageText(decodeHTMLEntities(item.message));
    setEditAvatarFile(null);
    setEditAvatarPreview(item.avatar_url || null);
    setEditRemoveAvatar(false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMessage) return;
    setIsSavingEdit(true);

    try {
      const fd = new FormData();
      fd.append("id", editingMessage.id);
      fd.append("name", editName);
      fd.append("church_city", editChurchCity);
      fd.append("message", editMessageText);
      fd.append("removeAvatar", editRemoveAvatar ? "true" : "false");
      if (editAvatarFile) {
        fd.append("avatar", editAvatarFile, editAvatarFile.name);
      }

      console.log("Submitting edit form data keys:", Array.from(fd.keys()));
      const res = await updateGuestbookMessage(fd);
      console.log("Response from update action:", res);

      if (res.success) {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id === editingMessage.id) {
              let nextAvatar = m.avatar_url;
              if (res.avatarRemoved) {
                nextAvatar = null;
              } else if (res.avatar_url) {
                nextAvatar = res.avatar_url;
              }
              return {
                ...m,
                name: editName,
                church_city: editChurchCity,
                message: editMessageText,
                avatar_url: nextAvatar,
              };
            }
            return m;
          })
        );
        setEditingMessage(null);
      } else {
        alert(res.error || "Gagal mengupdate ucapan.");
      }
    } catch (err: any) {
      console.error("Exception in handleSaveEdit client side:", err);
      alert("Error: " + (err.message || err));
    } finally {
      setIsSavingEdit(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    const res = await fetchAdminGuestbookMessages();
    if (res.success) {
      setMessages(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter Data
  const filteredMessages = useMemo(() => {
    return messages.filter((item) => {
      // Status Filter
      if (statusFilter === "pending" && item.is_approved) return false;
      if (statusFilter === "approved" && !item.is_approved) return false;

      // Search Filter
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.church_city.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q)
      );
    });
  }, [messages, statusFilter, search]);

  // Stat Counters
  const totalCount = messages.length;
  const pendingCount = messages.filter((m) => !m.is_approved).length;
  const approvedCount = messages.filter((m) => m.is_approved).length;

  // Actions
  const handleApprove = async (id: string) => {
    setActionId(id);
    const res = await approveGuestbookMessage(id);
    setActionId(null);
    if (res.success) {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_approved: true } : m))
      );
    }
  };

  const handleUnapprove = async (id: string) => {
    setActionId(id);
    const res = await unapproveGuestbookMessage(id);
    setActionId(null);
    if (res.success) {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_approved: false } : m))
      );
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Hapus Ucapan",
      message: "Apakah Anda yakin ingin menghapus ucapan ini secara permanen? Tindakan ini tidak dapat dibatalkan.",
      variant: "danger",
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
    });
    if (!isConfirmed) return;
    setActionId(id);
    const res = await deleteGuestbookMessage(id);
    setActionId(null);
    if (res.success) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D4AF37]/20 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#FDFBF7] flex items-center gap-2">
            <MessageSquareQuote className="h-6 w-6 text-[#D4AF37]" />
            Moderasi Buku Tamu &amp; Ucapan Selamat
          </h1>
          <p className="text-xs text-gray-300">
            Tinjau, setujui, atau hapus ucapan publik sebelum ditampilkan pada Buku Tamu Utama.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={loadData}
            disabled={loading}
            className="border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 flex-1 md:flex-initial"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
          <a
            href={`/api/reports/guestbook?status=${statusFilter}&q=${encodeURIComponent(search)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-initial"
          >
            <Button
              size="sm"
              className="bg-[#022c22] border border-[#D4AF37]/45 hover:bg-[#033B2B] text-[#D4AF37] font-bold h-9 w-full"
            >
              <FileText className="w-4 h-4 mr-2" />
              Laporan PDF
            </Button>
          </a>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-md flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <MessageSquareQuote className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Total Ucapan Masuk</p>
            <p className="text-2xl font-bold text-white">{totalCount}</p>
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 backdrop-blur-md flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-amber-300 font-medium">Menunggu Persetujuan</p>
            <p className="text-2xl font-bold text-amber-200">{pendingCount}</p>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 backdrop-blur-md flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-emerald-300 font-medium">Disetujui (Tampil Publik)</p>
            <p className="text-2xl font-bold text-emerald-200">{approvedCount}</p>
          </div>
        </div>
      </div>

      {/* Search & Status Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/40 p-4 rounded-xl border border-white/10 backdrop-blur-md">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-white/10 w-full sm:w-auto text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              statusFilter === "all" ? "bg-[#D4AF37] text-black font-bold" : "text-gray-300 hover:text-white"
            }`}
          >
            Semua ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              statusFilter === "pending" ? "bg-amber-500 text-black font-bold" : "text-gray-300 hover:text-white"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("approved")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              statusFilter === "approved" ? "bg-emerald-500 text-black font-bold" : "text-gray-300 hover:text-white"
            }`}
          >
            Disetujui ({approvedCount})
          </button>
        </div>

        {/* Global Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, gereja, ucapan..."
            className="pl-9 bg-black/50 border-white/20 text-white text-xs h-9"
          />
        </div>
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="p-12 text-center text-gray-400 bg-black/40 rounded-xl border border-white/10">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#D4AF37]" />
          Memuat data ucapan...
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="p-12 text-center text-gray-400 bg-black/40 rounded-xl border border-white/10 space-y-2">
          <ShieldAlert className="w-8 h-8 mx-auto text-gray-500" />
          <p className="text-sm font-semibold">Tidak Ada Ucapan Ditemukan</p>
          <p className="text-xs text-gray-500">Coba ubah filter status atau kata kunci pencarian Anda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMessages.map((item) => (
            <div
              key={item.id}
              className={`p-4 md:p-5 rounded-xl border backdrop-blur-md transition-all space-y-3 ${
                item.is_approved
                  ? "bg-black/40 border-emerald-500/30"
                  : "bg-amber-950/20 border-amber-500/40"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  {item.avatar_url ? (
                    <div className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden border border-[#D4AF37] shadow">
                      <img src={item.avatar_url} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold border border-[#D4AF37]/40 text-xs">
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-white text-sm">{item.name}</h3>
                    <p className="text-xs text-[#D4AF37] flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {item.church_city}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.created_at).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>

                  {item.is_approved ? (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Disetujui
                    </span>
                  ) : (
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Menunggu Review
                    </span>
                  )}
                </div>
              </div>

              {/* Message Content */}
              <p className="text-xs md:text-sm text-gray-200 whitespace-pre-line leading-relaxed italic bg-black/40 p-3 rounded-lg border border-white/5">
                "{decodeHTMLEntities(item.message)}"
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1">
                {!item.is_approved ? (
                  <Button
                    size="sm"
                    disabled={actionId === item.id}
                    onClick={() => handleApprove(item.id)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-8 px-3"
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    Setujui Ucapan
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actionId === item.id}
                    onClick={() => handleUnapprove(item.id)}
                    className="border-amber-500/50 text-amber-300 hover:bg-amber-500/20 text-xs h-8 px-3"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    Batalkan Setuju
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  disabled={actionId === item.id}
                  onClick={() => handleOpenEdit(item)}
                  className="border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10 text-xs h-8 px-3"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1" />
                  Edit
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  disabled={actionId === item.id}
                  onClick={() => handleDelete(item.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-950/40 text-xs h-8 px-2"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Hapus
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Edit Guestbook Message Modal */}
      {editingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-[#D4AF37]/30 bg-[#0c0d0e] p-6 text-[#FDFBF7] shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-[#D4AF37] flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                Edit Ucapan Buku Tamu
              </h3>
              <button
                onClick={() => setEditingMessage(null)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Tutup modal"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Optional Avatar Upload Area */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Foto Profil / Diri</label>
                
                <div className="flex items-center gap-4 p-3 bg-black/50 rounded-xl border border-white/10">
                  <div className="relative">
                    {editAvatarPreview ? (
                      <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-[#D4AF37] shadow-md">
                        <img src={editAvatarPreview} alt="Preview Foto" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setEditAvatarFile(null);
                            setEditAvatarPreview(null);
                            setEditRemoveAvatar(true);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                          className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 shadow"
                          title="Hapus foto"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                        <User className="w-7 h-7" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        if (file.size > 5 * 1024 * 1024) {
                          alert("Ukuran foto maksimal 5MB");
                          return;
                        }

                        setEditAvatarFile(file);
                        setEditRemoveAvatar(false);
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setEditAvatarPreview(event.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="hidden"
                      id="edit-gb-avatar-input"
                    />
                    <label
                      htmlFor="edit-gb-avatar-input"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-semibold rounded-lg cursor-pointer transition-all"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      {editAvatarPreview ? "Ganti Foto" : "Unggah Foto"}
                    </label>
                    <p className="text-[10px] text-gray-400">Format: JPG, PNG, WEBP (Maks 5MB)</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Nama Pengirim</label>
                <Input
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-black/60 border-white/20 text-white text-sm"
                  placeholder="Contoh: Oma Elizabeth"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Asal Jemaat / Kota</label>
                <Input
                  required
                  value={editChurchCity}
                  onChange={(e) => setEditChurchCity(e.target.value)}
                  className="bg-black/60 border-white/20 text-white text-sm"
                  placeholder="Contoh: GPIB Immanuel (Mupel Banten)"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-300">Isi Ucapan &amp; Harapan</label>
                  <span className={`text-[10px] font-mono ${editMessageText.length > 280 ? "text-amber-400 font-bold" : "text-gray-400"}`}>
                    {editMessageText.length}/300
                  </span>
                </div>
                <textarea
                  required
                  rows={5}
                  maxLength={300}
                  value={editMessageText}
                  onChange={(e) => setEditMessageText(e.target.value)}
                  className="w-full rounded-md border border-white/20 bg-black/60 p-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] resize-none"
                  placeholder="Tuliskan ucapan selamat..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingMessage(null)}
                  className="text-gray-300 hover:text-white hover:bg-white/5 text-sm h-10 px-4 rounded-xl"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSavingEdit}
                  className="bg-[#D4AF37] hover:bg-[#B3932D] text-black font-bold text-sm h-10 px-6 rounded-xl transition-all"
                >
                  {isSavingEdit ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
