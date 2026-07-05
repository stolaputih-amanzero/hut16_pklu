"use client";

import { useEffect, useState } from "react";
import { fetchMerchProducts, saveMerchProduct, deleteMerchProduct, fetchMerchOrders, deleteMerchOrder } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ShoppingBag, 
  Plus, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  Image as ImageIcon, 
  Shirt, 
  X, 
  Tag, 
  ListFilter, 
  Search, 
  Phone, 
  Calendar, 
  Package, 
  Users 
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  stock: number;
  has_size: boolean;
  is_active: boolean;
  created_at: string;
};

type MerchOrder = {
  id: string;
  buyer_name: string;
  church_city: string;
  whatsapp: string;
  item_type: string;
  size?: string | null;
  quantity: number;
  notes?: string | null;
  created_at: string;
};

export default function AdminMerchPage() {
  const [activeTab, setActiveTab] = useState<"catalog" | "orders">("catalog");

  // Catalog State
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Orders State
  const [orders, setOrders] = useState<MerchOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Product Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [stock, setStock] = useState("100");
  const [hasSize, setHasSize] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const loadCatalog = async () => {
    setLoadingProducts(true);
    const res = await fetchMerchProducts(false);
    if (res.success) {
      setProducts(res.data);
    }
    setLoadingProducts(false);
  };

  const loadOrders = async () => {
    setLoadingOrders(true);
    const res = await fetchMerchOrders();
    if (res.success) {
      setOrders(res.data);
    }
    setLoadingOrders(false);
  };

  useEffect(() => {
    loadCatalog();
    loadOrders();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName("");
    setDescription("");
    setPrice("50000");
    setStock("100");
    setHasSize(false);
    setIsActive(true);
    setImagePreview(null);
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);
    setPrice(String(p.price));
    setStock(String(p.stock ?? 100));
    setHasSize(p.has_size);
    setIsActive(p.is_active);
    setImagePreview(p.image_url);
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const fd = new FormData();
    if (editingProduct) fd.append("id", editingProduct.id);
    fd.append("name", name);
    fd.append("description", description);
    fd.append("price", price);
    fd.append("stock", stock);
    fd.append("has_size", String(hasSize));
    fd.append("is_active", String(isActive));
    if (editingProduct?.image_url) fd.append("existing_image_url", editingProduct.image_url);
    if (selectedFile) fd.append("image", selectedFile);

    const res = await saveMerchProduct(fd);
    setIsSaving(false);

    if (res.success) {
      setIsModalOpen(false);
      loadCatalog();
    } else {
      alert(res.error || "Gagal menyimpan produk.");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;
    const res = await deleteMerchProduct(id);
    if (res.success) {
      loadCatalog();
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pesanan ini?")) return;
    const res = await deleteMerchOrder(id);
    if (res.success) {
      loadOrders();
    }
  };

  // Filter Orders
  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    return (
      o.buyer_name.toLowerCase().includes(q) ||
      o.church_city.toLowerCase().includes(q) ||
      o.whatsapp.includes(q) ||
      o.item_type.toLowerCase().includes(q)
    );
  });

  const totalQuantitySum = orders.reduce((sum, o) => sum + (o.quantity || 1), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D4AF37]/20 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#FDFBF7] flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-[#D4AF37]" />
            Manajemen Merchandise &amp; Souvenir
          </h1>
          <p className="text-xs text-gray-300">
            Kelola katalog foto produk dan rekap seluruh pesanan merchandise cenderamata tambahan dari pemesan.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 bg-black/60 p-1.5 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "catalog"
                ? "bg-[#D4AF37] text-black shadow"
                : "text-gray-300 hover:text-white"
            }`}
          >
            <Package className="w-3.5 h-3.5" /> Katalog Produk ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "orders"
                ? "bg-[#D4AF37] text-black shadow"
                : "text-gray-300 hover:text-white"
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" /> Rekap Pesanan ({orders.length})
          </button>
        </div>
      </div>

      {/* TAB 1: KATALOG PRODUK */}
      {activeTab === "catalog" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-[#D4AF37]">Daftar Item Merchandise Katalog:</h2>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={loadCatalog}
                disabled={loadingProducts}
                className="border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loadingProducts ? "animate-spin" : ""}`} /> Refresh
              </Button>
              <Button
                size="sm"
                onClick={handleOpenAdd}
                className="bg-[#D4AF37] hover:bg-[#B3932D] text-black font-bold text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Produk Baru
              </Button>
            </div>
          </div>

          {loadingProducts ? (
            <div className="p-12 text-center text-gray-400 bg-black/40 rounded-xl border border-white/10 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#D4AF37]" />
              Memuat katalog produk...
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-gray-400 bg-black/40 rounded-xl border border-white/10 space-y-3">
              <ShoppingBag className="w-10 h-10 mx-auto text-gray-500" />
              <p className="text-sm font-semibold">Belum Ada Produk Merchandise</p>
              <Button onClick={handleOpenAdd} size="sm" className="bg-[#D4AF37] text-black font-bold">
                <Plus className="w-4 h-4 mr-1" /> Tambah Produk Pertama
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-black/50 overflow-hidden backdrop-blur-md shadow-lg flex flex-col justify-between group hover:border-[#D4AF37]/50 transition-all text-xs"
                >
                  <div className="space-y-3">
                    <div className="relative h-48 w-full bg-black/60 overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur border ${
                            item.is_active
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : "bg-red-500/20 text-red-300 border-red-500/40"
                          }`}
                        >
                          {item.is_active ? "Aktif" : "Non-Aktif"}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-white text-sm leading-snug">{item.name}</h3>
                        <span className="font-mono font-extrabold text-[#D4AF37] text-xs shrink-0">
                          Rp {item.price.toLocaleString("id-ID")}
                        </span>
                      </div>

                      <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">{item.description}</p>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] pt-1">
                        {item.stock > 0 ? (
                          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
                            Stok Tersedia: {item.stock} pcs
                          </span>
                        ) : (
                          <span className="bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded font-bold">
                            STOK HABIS
                          </span>
                        )}

                        {item.has_size ? (
                          <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                            <Shirt className="w-3 h-3" /> Ada Ukuran
                          </span>
                        ) : (
                          <span className="bg-gray-500/20 text-gray-300 border border-gray-500/30 px-2 py-0.5 rounded">
                            All Size
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex items-center justify-end gap-2 border-t border-white/10 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEdit(item)}
                      className="border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10 h-8 text-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit Produk
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteProduct(item.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-950/40 h-8 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Hapus
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REKAP PESANAN MERCH */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-black/60 rounded-xl border border-[#D4AF37]/30 flex items-center justify-between text-xs">
              <div>
                <p className="text-gray-400">Total Transaksi Pesanan</p>
                <p className="text-2xl font-black text-white font-mono">{orders.length}</p>
              </div>
              <div className="p-3 bg-[#D4AF37]/10 rounded-xl text-[#D4AF37]">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="p-4 bg-black/60 rounded-xl border border-[#D4AF37]/30 flex items-center justify-between text-xs">
              <div>
                <p className="text-gray-400">Total Item Pcs Dipesan</p>
                <p className="text-2xl font-black text-[#D4AF37] font-mono">{totalQuantitySum} Pcs</p>
              </div>
              <div className="p-3 bg-[#D4AF37]/10 rounded-xl text-[#D4AF37]">
                <Package className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Search & Refresh */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari pemesan, jemaat, WA, item..."
                className="pl-9 bg-black/50 border-white/20 text-white text-xs h-10"
              />
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={loadOrders}
              disabled={loadingOrders}
              className="border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 text-xs w-full sm:w-auto h-10"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loadingOrders ? "animate-spin" : ""}`} /> Refresh Rekap
            </Button>
          </div>

          {/* Orders Table */}
          {loadingOrders ? (
            <div className="p-12 text-center text-gray-400 bg-black/40 rounded-xl border border-white/10 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#D4AF37]" />
              Memuat data pesanan merchandise...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-400 bg-black/40 rounded-xl border border-white/10 text-xs">
              Belum ada data pesanan merchandise yang sesuai.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/50">
              <table className="w-full text-left text-xs text-[#FDFBF7]">
                <thead className="bg-white/5 text-[11px] uppercase tracking-wider text-gray-400 border-b border-white/10">
                  <tr>
                    <th className="p-3">Waktu</th>
                    <th className="p-3">Nama Pemesan</th>
                    <th className="p-3">Asal Jemaat</th>
                    <th className="p-3">WhatsApp</th>
                    <th className="p-3">Item Merch</th>
                    <th className="p-3">Ukuran</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3">Catatan</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredOrders.map((o) => {
                    const cleanWa = (o.whatsapp || "").replace(/^0/, "62").replace(/\D/g, "");
                    return (
                      <tr key={o.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3 font-mono text-gray-400 whitespace-nowrap">
                          {new Date(o.created_at).toLocaleString("id-ID", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="p-3 font-bold text-white whitespace-nowrap">{o.buyer_name}</td>
                        <td className="p-3 text-emerald-300 whitespace-nowrap">{o.church_city}</td>
                        <td className="p-3 font-mono">
                          {cleanWa ? (
                            <a
                              href={`https://wa.me/${cleanWa}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" /> {o.whatsapp}
                            </a>
                          ) : (
                            o.whatsapp
                          )}
                        </td>
                        <td className="p-3 font-semibold text-[#D4AF37] whitespace-nowrap">{o.item_type}</td>
                        <td className="p-3 font-mono">
                          {o.size ? (
                            <span className="bg-white/10 px-2 py-0.5 rounded text-white font-bold">
                              {o.size}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="p-3 font-bold text-center font-mono">{o.quantity} Pcs</td>
                        <td className="p-3 text-gray-300 italic max-w-xs truncate">{o.notes || "-"}</td>
                        <td className="p-3 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteOrder(o.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-950/40 h-7 text-[11px]"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#022c22] border border-[#D4AF37]/40 p-6 shadow-2xl space-y-5 text-[#FDFBF7] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-[#D4AF37] flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
                {editingProduct ? "Edit Produk Merchandise" : "Tambah Produk Merchandise Baru"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Product Photo Upload */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-200">Foto Produk *</Label>
                <div className="flex items-center gap-4 p-3 bg-black/50 rounded-xl border border-white/10">
                  <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-black/60 border border-[#D4AF37]/40 shrink-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-500">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 text-xs">
                    <input
                      type="file"
                      accept="image/*"
                      id="product-img-input"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                          const reader = new FileReader();
                          reader.onload = (ev) => setImagePreview(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label
                      htmlFor="product-img-input"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] font-semibold rounded-lg cursor-pointer hover:bg-[#D4AF37]/30 transition-all"
                    >
                      <ImageIcon className="w-3.5 h-3.5" /> Pilih File Foto
                    </label>
                    <p className="text-[10px] text-gray-400">Format: JPG, PNG, WEBP (Max 5MB)</p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="p-name" className="text-xs font-semibold text-gray-200">
                  Nama Produk / Item *
                </Label>
                <Input
                  id="p-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Kaos Merchandise Edisi HUT 16"
                  className="bg-black/50 border-white/20 text-white"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="p-desc" className="text-xs font-semibold text-gray-200">
                  Deskripsi &amp; Detail Spesifikasi *
                </Label>
                <textarea
                  id="p-desc"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan bahan, spesifikasi, dan keunggulan produk..."
                  className="w-full rounded-md border border-white/20 bg-black/50 p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none resize-none"
                  required
                />
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="p-price" className="text-xs font-semibold text-gray-200">
                    Estimasi Harga / Kontribusi (Rp) *
                  </Label>
                  <Input
                    id="p-price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Contoh: 100000"
                    className="bg-black/50 border-white/20 text-white font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="p-stock" className="text-xs font-semibold text-gray-200">
                    Stok Tersedia (Pcs) *
                  </Label>
                  <Input
                    id="p-stock"
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="Contoh: 100"
                    className="bg-black/50 border-white/20 text-white font-mono"
                    required
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 p-3 bg-black/40 rounded-xl border border-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasSize}
                    onChange={(e) => setHasSize(e.target.checked)}
                    className="accent-[#D4AF37] h-4 w-4"
                  />
                  <span className="text-xs font-semibold text-white">Memiliki Ukuran Kaos</span>
                </label>

                <label className="flex items-center gap-2 p-3 bg-black/40 rounded-xl border border-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="accent-[#D4AF37] h-4 w-4"
                  />
                  <span className="text-xs font-semibold text-white">Status Produk Aktif</span>
                </label>
              </div>

              {/* Submit Modal */}
              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#D4AF37] hover:bg-[#B3932D] text-black font-bold"
                >
                  {isSaving ? "Menyimpan..." : "Simpan Produk"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
