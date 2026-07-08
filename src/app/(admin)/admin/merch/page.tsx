"use client";

import { useEffect, useState } from "react";
import { fetchMerchProducts, saveMerchProduct, deleteMerchProduct, fetchMerchOrders, deleteMerchOrder, updateMerchOrderStatus } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSizeSurcharge, splitItemType } from "@/lib/utils";
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
  Users,
  Eye,
  FileText
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
  registration_code?: string | null;
  payment_proof_url?: string | null;
  payment_status: string;
  payment_date?: string | null;
  admin_notes?: string | null;
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
  const [selectedOrder, setSelectedOrder] = useState<MerchOrder | null>(null);

  // Order Verification Panel States
  const [adminPaymentStatus, setAdminPaymentStatus] = useState("pending");
  const [adminNotesText, setAdminNotesText] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);

  const handleSelectOrder = (o: MerchOrder) => {
    setSelectedOrder(o);
    setAdminPaymentStatus(o.payment_status || "pending");
    setAdminNotesText(o.admin_notes || "");
  };

  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

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
      const cleaned = res.data.map((p: any) => ({
        ...p,
        name: p.name
          ?.replaceAll("&amp;", "&")
          .replaceAll("Pouch & Goodie Bag Edisi Spesial", "Pouch & Bag Edisi Spesial")
          .replaceAll("Pouch & Googie Bag Edisi Spesial", "Pouch & Bag Edisi Spesial"),
        description: p.description?.replaceAll("&amp;", "&"),
      }));
      setProducts(cleaned);
    }
    setLoadingProducts(false);
  };

  const loadOrders = async () => {
    setLoadingOrders(true);
    const res = await fetchMerchOrders();
    if (res.success) {
      const cleaned = res.data.map((o: any) => ({
        ...o,
        buyer_name: o.buyer_name?.replaceAll("&amp;", "&"),
        church_city: o.church_city?.replaceAll("&amp;", "&"),
        item_type: o.item_type
          ?.replaceAll("&amp;", "&")
          .replaceAll("Pouch & Goodie Bag Edisi Spesial", "Pouch & Bag Edisi Spesial")
          .replaceAll("Pouch & Googie Bag Edisi Spesial", "Pouch & Bag Edisi Spesial"),
        size: o.size
          ?.replaceAll("&amp;", "&")
          .replaceAll("Pouch & Goodie Bag Edisi Spesial", "Pouch & Bag Edisi Spesial")
          .replaceAll("Pouch & Googie Bag Edisi Spesial", "Pouch & Bag Edisi Spesial"),
        notes: o.notes?.replaceAll("&amp;", "&"),
      }));
      setOrders(cleaned);
    }
    setLoadingOrders(false);
  };

  const parseOrderItems = (itemTypeStr: string) => {
    return splitItemType(itemTypeStr).map((part) => {
      const qtyMatch = part.match(/\s+x(\d+)$/);
      const quantity = qtyMatch ? parseInt(qtyMatch[1]) : 1;
      let cleanItemName = qtyMatch ? part.replace(/\s+x\d+$/, "") : part;

      const sizeMatch = cleanItemName.match(/\(Ukuran\s+([^)]+)\)/i);
      const size = sizeMatch ? sizeMatch[1] : null;
      if (sizeMatch) {
        cleanItemName = cleanItemName.replace(/\s*\(Ukuran\s+[^)]+\)/i, "").trim();
      }

      const matchedProduct = products.find(
        (p) => p.name.toLowerCase().trim() === cleanItemName.toLowerCase().trim()
      );

      return {
        raw: part,
        name: cleanItemName,
        size: size || (matchedProduct?.has_size ? "Standard" : null),
        quantity,
        product: matchedProduct,
      };
    });
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
    if (!confirm("Apakah Anda yakin ingin menghapus pembelian ini?")) return;
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
            Kelola katalog foto produk dan rekap seluruh pembelian merchandise cenderamata tambahan dari pembeli.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 bg-black/60 p-1.5 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === "catalog"
              ? "bg-[#D4AF37] text-black shadow"
              : "text-gray-300 hover:text-white"
              }`}
          >
            <Package className="w-3.5 h-3.5" /> Katalog Produk ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === "orders"
              ? "bg-[#D4AF37] text-black shadow"
              : "text-gray-300 hover:text-white"
              }`}
          >
            <ListFilter className="w-3.5 h-3.5" /> Rekap Pembelian ({orders.length})
          </button>
        </div>
      </div>

      {/* TAB 1: KATALOG PRODUK */}
      {activeTab === "catalog" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-base font-bold text-[#D4AF37]">Katalog Produk</h2>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
              <Button
                size="sm"
                variant="outline"
                onClick={loadCatalog}
                disabled={loadingProducts}
                className="border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 text-xs flex-1 sm:flex-initial"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loadingProducts ? "animate-spin" : ""}`} /> Refresh
              </Button>
              <Button
                size="sm"
                onClick={handleOpenAdd}
                className="bg-[#D4AF37] hover:bg-[#B3932D] text-black font-bold text-xs flex-1 sm:flex-initial"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Produk Baru
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
                    <div
                      onClick={() => setPreviewProduct(item)}
                      className="relative h-48 w-full bg-black/60 overflow-hidden cursor-pointer"
                    >
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur border ${item.is_active
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
                        <h3
                          onClick={() => setPreviewProduct(item)}
                          className="font-bold text-white text-sm leading-snug cursor-pointer hover:text-[#D4AF37] transition-colors"
                        >
                          {item.name}
                        </h3>
                        <span className="font-mono font-extrabold text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-2 py-0.5 rounded text-xs shrink-0">
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
                          <span className="bg-red-500/20 text-red-300 border-red-500/40 px-2 py-0.5 rounded font-bold">
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
                      onClick={() => setPreviewProduct(item)}
                      className="border-white/20 text-white hover:bg-white/10 h-8 text-xs font-semibold rounded-lg"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEdit(item)}
                      className="border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10 h-8 text-xs font-semibold rounded-lg"
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteProduct(item.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-950/40 h-8 text-xs font-semibold"
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

      {/* TAB 2: REKAP PEMBELIAN MERCH */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-black/60 rounded-xl border border-[#D4AF37]/30 flex items-center justify-between text-xs">
              <div>
                <p className="text-gray-400">Total Pembelian</p>
                <p className="text-2xl font-black text-white font-mono">{orders.length}</p>
              </div>
              <div className="p-3 bg-[#D4AF37]/10 rounded-xl text-[#D4AF37]">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="p-4 bg-black/60 rounded-xl border border-[#D4AF37]/30 flex items-center justify-between text-xs">
              <div>
                <p className="text-gray-400">Total Item Pcs Dibeli</p>
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
                placeholder="Cari pembeli, jemaat, WA, item..."
                className="pl-9 bg-black/50 border-white/20 text-white text-xs h-10"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={loadOrders}
                disabled={loadingOrders}
                className="border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 text-xs flex-1 sm:flex-initial h-10"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loadingOrders ? "animate-spin" : ""}`} /> Refresh Rekap
              </Button>
              <a
                href={`/api/reports/merch-orders?q=${encodeURIComponent(searchQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial"
              >
                <Button
                  size="sm"
                  className="bg-[#022c22] border border-[#D4AF37]/45 hover:bg-[#033B2B] text-[#D4AF37] text-xs font-bold h-10 w-full"
                >
                  <FileText className="w-3.5 h-3.5 mr-1" /> Laporan PDF
                </Button>
              </a>
            </div>
          </div>

          {/* Orders Table */}
          {loadingOrders ? (
            <div className="p-12 text-center text-gray-400 bg-black/40 rounded-xl border border-white/10 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#D4AF37]" />
              Memuat data pembelian merchandise...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-400 bg-black/40 rounded-xl border border-white/10 text-xs">
              Belum ada data pembelian merchandise yang sesuai.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto rounded-xl border border-white/10 bg-black/50">
                <table className="w-full text-left text-xs text-[#FDFBF7]">
                  <thead className="bg-white/5 text-[11px] uppercase tracking-wider text-gray-400 border-b border-white/10">
                    <tr>
                      <th className="p-3">Waktu</th>
                      <th className="p-3">Nama Pembeli</th>
                      <th className="p-3">Asal Jemaat</th>
                      <th className="p-3">WhatsApp</th>
                      <th className="p-3">Item Merch</th>
                      <th className="p-3">Ukuran</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredOrders.map((o) => {
                      const cleanWa = (o.whatsapp || "").replace(/^0/, "62").replace(/\D/g, "");
                      return (
                        <tr
                          key={o.id}
                          onClick={() => handleSelectOrder(o)}
                          className="hover:bg-white/5 transition-colors cursor-pointer"
                        >
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
                                onClick={(e) => e.stopPropagation()}
                                className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
                              >
                                <Phone className="w-3.5 h-3.5" /> {o.whatsapp}
                              </a>
                            ) : (
                              o.whatsapp
                            )}
                          </td>
                          <td className="p-3 font-semibold text-[#D4AF37] whitespace-nowrap">
                            {o.item_type}
                          </td>
                          <td className="p-3">
                            {o.size ? (
                              (() => {
                                const sizeVal = o.size.includes(":") ? o.size.split(":").pop()?.trim() || "" : o.size;
                                const sizeUpper = sizeVal.toUpperCase();
                                const isSmallMed = ["S", "M", "XS"].some(s => sizeUpper.includes(s)) && !sizeUpper.includes("XL") && !sizeUpper.includes("XXL");
                                const isLarge = sizeUpper === "L" || (sizeUpper.includes("L") && !sizeUpper.includes("X"));
                                const displayColor = isSmallMed
                                  ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                                  : isLarge
                                    ? "bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40"
                                    : "bg-red-500/20 text-red-300 border-red-500/40";
                                return (
                                  <span className={`inline-block px-2.5 py-0.5 rounded font-mono font-black text-xs border ${displayColor}`}>
                                    {sizeVal}
                                  </span>
                                );
                              })()
                            ) : (
                              <span className="text-gray-500 font-mono">-</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full font-bold font-mono text-xs border ${o.quantity > 1
                              ? "bg-amber-500/25 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                              : "bg-white/5 text-gray-300 border-white/10"
                              }`}>
                              {o.quantity} Pcs
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {o.payment_status === "pending" && (
                              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                                Pending
                              </span>
                            )}
                            {o.payment_status === "verified" && (
                              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                                Lunas
                              </span>
                            )}
                            {o.payment_status === "rejected" && (
                              <span className="bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                                Ditolak
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteOrder(o.id);
                              }}
                              className="text-red-400 hover:text-red-300 hover:bg-red-950/40 h-7 text-[11px]"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="block md:hidden space-y-3">
                {filteredOrders.map((o) => {
                  const cleanWa = (o.whatsapp || "").replace(/^0/, "62").replace(/\D/g, "");
                  return (
                    <div
                      key={o.id}
                      onClick={() => handleSelectOrder(o)}
                      className="p-4 bg-black/50 rounded-xl border border-white/10 hover:border-[#D4AF37]/50 transition-all cursor-pointer space-y-3 relative group"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-white text-sm">{o.buyer_name}</div>
                          <div className="text-emerald-300 text-[11px] font-medium">{o.church_city}</div>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {new Date(o.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                        <span className="font-semibold text-[#D4AF37] text-xs">
                          {o.item_type}
                        </span>
                        {o.size && (
                          <span className="px-1.5 py-0.5 rounded font-mono font-black text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                            {o.size.includes(":") ? o.size.split(":").pop()?.trim() || "" : o.size}
                          </span>
                        )}
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full font-bold font-mono text-[10px] bg-white/5 text-gray-300 border border-white/10">
                          {o.quantity} Pcs
                        </span>
                        {o.payment_status === "pending" && (
                          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold">
                            Pending
                          </span>
                        )}
                        {o.payment_status === "verified" && (
                          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold">
                            Lunas
                          </span>
                        )}
                        {o.payment_status === "rejected" && (
                          <span className="bg-red-500/20 text-red-400 border border-red-500/40 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold">
                            Ditolak
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5 gap-2">
                        <div>
                          {cleanWa && (
                            <a
                              href={`https://wa.me/${cleanWa}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-emerald-400 font-bold hover:underline flex items-center gap-1 text-[11px]"
                            >
                              <Phone className="w-3.5 h-3.5" /> Chat WA
                            </a>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteOrder(o.id);
                          }}
                          className="text-red-400 hover:text-red-300 hover:bg-red-950/40 h-7 px-2 text-[11px] shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#022c22] border border-[#D4AF37]/40 p-4 sm:p-6 shadow-2xl space-y-5 text-[#FDFBF7] max-h-[90vh] overflow-y-auto">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="p-price" className="text-xs font-semibold text-gray-200">
                    Estimasi Harga Jual (Rp) *
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
                  <p className="text-[10px] text-[#D4AF37] font-bold mt-1">
                    Format: Rp {Number(price || 0).toLocaleString("id-ID")}
                  </p>
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
                  <p className="text-[10px] text-emerald-400 font-bold mt-1">
                    Format: {Number(stock || 0).toLocaleString("id-ID")} Pcs
                  </p>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#022c22] border border-[#D4AF37]/40 p-4 sm:p-6 shadow-2xl space-y-5 text-[#FDFBF7] max-h-[92vh] md:max-h-[85vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-base font-bold text-[#D4AF37] flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
                Detail Pembelian Merchandise
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4 text-xs">

              {/* Buyer Info */}
              <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] uppercase text-gray-400 font-bold tracking-wider mb-0.5">Nama Pembeli</div>
                    <div className="text-sm font-extrabold text-white">{selectedOrder.buyer_name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-gray-400 font-bold tracking-wider mb-0.5">Asal Jemaat / Kota</div>
                    <div className="text-xs text-emerald-300 font-semibold">{selectedOrder.church_city}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-gray-400 font-bold tracking-wider mb-0.5">WhatsApp / No. HP</div>
                  <div className="text-xs font-mono font-bold text-white">
                    {selectedOrder.whatsapp ? (
                      (() => {
                        const cleanWa = selectedOrder.whatsapp.replace(/^0/, "62").replace(/\D/g, "");
                        return (
                          <a
                            href={`https://wa.me/${cleanWa}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-400 hover:underline inline-flex items-center gap-1 py-1"
                          >
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            {selectedOrder.whatsapp}
                          </a>
                        );
                      })()
                    ) : (
                      "-"
                    )}
                  </div>
                </div>
              </div>

              {/* Order Item Info */}
              <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-3">
                <div className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Rincian Item Dibeli</div>
                <div className="space-y-3 divide-y divide-white/5">
                  {(() => {
                    const parsedItems = parseOrderItems(selectedOrder.item_type);
                    let computedGrandTotal = 0;
                    return (
                      <>
                        {parsedItems.map((item, idx) => {
                          const surcharge = item.product?.has_size ? getSizeSurcharge(item.size) : 0;
                          const effectivePrice = item.product ? item.product.price + surcharge : 0;
                          const subtotal = effectivePrice * item.quantity;
                          computedGrandTotal += subtotal;
                          return (
                            <div key={idx} className={`pt-2.5 first:pt-0 flex items-start gap-3 text-xs`}>
                              {/* Product Image Thumbnail */}
                              <div
                                className="relative h-12 w-12 rounded-lg overflow-hidden border border-white/20 bg-black shrink-0 cursor-zoom-in"
                                onClick={() => {
                                  if (item.product?.image_url) {
                                    setLightboxImage(item.product.image_url);
                                  }
                                }}
                              >
                                {item.product?.image_url ? (
                                  <img src={item.product.image_url} alt={item.name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-gray-500 bg-gray-800">
                                    <ShoppingBag className="w-5 h-5 text-gray-600" />
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="font-bold text-white leading-tight truncate">
                                  {item.name}
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                                  {item.size && (
                                    <span className="px-1.5 py-0.2 rounded font-mono font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                      Size: {item.size}
                                    </span>
                                  )}
                                  <span className="text-gray-400">
                                    Qty: <strong className="text-white font-mono">{item.quantity} pcs</strong>
                                  </span>
                                </div>
                                {item.product && (
                                  <div className="flex justify-between items-center text-[10px] text-gray-400 pt-0.5">
                                    <span>Rp {effectivePrice.toLocaleString("id-ID")} / pcs</span>
                                    <span className="font-mono font-bold text-emerald-400">
                                      Subtotal: Rp {subtotal.toLocaleString("id-ID")}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Calculated Grand Total */}
                        {computedGrandTotal > 0 && (
                          <div className="flex justify-between items-center pt-2.5 border-t border-white/10 text-xs">
                            <span className="font-bold text-gray-400 uppercase text-[10px]">Total Pembelian:</span>
                            <span className="font-mono font-extrabold text-sm text-[#D4AF37]">
                              Rp {computedGrandTotal.toLocaleString("id-ID")}
                            </span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Notes */}
              <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-1">
                <div className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Catatan Tambahan</div>
                <div className="text-xs text-gray-300 italic whitespace-pre-wrap leading-relaxed">
                  {selectedOrder.notes || "Tidak ada catatan."}
                </div>
              </div>

              {/* Order Meta */}
              <div className="flex items-center gap-1.5 px-1 text-[10px] text-gray-400">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>Dibeli pada:</span>
                <span className="font-mono font-bold">
                  {new Date(selectedOrder.created_at).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>

              {/* Payment Verification Panel */}
              <div className="bg-black/50 p-4 rounded-xl border border-[#D4AF37]/35 space-y-4">
                <div className="text-[10px] uppercase text-[#D4AF37] font-bold tracking-wider flex items-center gap-1.5">
                  <Package className="w-4 h-4" />
                  Verifikasi Pembayaran &amp; Catatan
                </div>

                {/* Uploaded Payment Proof */}
                {selectedOrder.payment_proof_url ? (
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-gray-400 block font-semibold">Bukti Transfer Pendaftar:</span>
                    <div className="flex gap-3 items-center">
                      <div
                        className="relative h-20 w-20 rounded-lg overflow-hidden border border-white/20 bg-black cursor-zoom-in group shrink-0"
                        onClick={() => setLightboxImage(selectedOrder.payment_proof_url || null)}
                      >
                        <img src={selectedOrder.payment_proof_url} alt="Bukti Transfer" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] text-gray-300">
                          Tanggal Transfer: <strong className="text-white">{selectedOrder.payment_date ? new Date(selectedOrder.payment_date).toLocaleDateString("id-ID", { dateStyle: "medium" }) : "-"}</strong>
                        </p>
                        <a
                          href={selectedOrder.payment_proof_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex text-[10px] text-blue-400 hover:text-blue-300 underline font-semibold"
                        >
                          Buka Gambar di Tab Baru ↗
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-amber-400 text-[11px] italic">⚠️ Belum ada bukti transfer terunggah.</p>
                )}

                {/* Status Selection */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-gray-300">Status Verifikasi:</Label>
                  <select
                    value={adminPaymentStatus}
                    onChange={(e) => setAdminPaymentStatus(e.target.value)}
                    className="w-full rounded-md border border-white/20 bg-black p-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="pending">PENDING (Menunggu Verifikasi)</option>
                    <option value="verified">VERIFIED (Lunas &amp; Valid)</option>
                    <option value="rejected">REJECTED (Ditolak / Salah)</option>
                  </select>
                </div>

                {/* Admin Notes */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-gray-300">Catatan Panitia (Terlihat oleh User):</Label>
                  <textarea
                    rows={2}
                    value={adminNotesText}
                    onChange={(e) => setAdminNotesText(e.target.value)}
                    placeholder="Masukkan catatan panitia (misal: 'Baju siap diambil', atau 'Bukti transfer blur, mohon upload ulang')"
                    className="w-full rounded-md border border-white/20 bg-black p-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none resize-none"
                  />
                </div>

                {/* Action button inside verification panel */}
                <Button
                  type="button"
                  onClick={async () => {
                    setSavingStatus(true);
                    const res = await updateMerchOrderStatus(selectedOrder.id, adminPaymentStatus, adminNotesText);
                    setSavingStatus(false);
                    if (res.success) {
                      alert("Status pembelian berhasil diperbarui!");
                      loadOrders();
                      setSelectedOrder((prev) => prev ? { ...prev, payment_status: adminPaymentStatus, admin_notes: adminNotesText } : null);
                    } else {
                      alert(res.error || "Gagal memperbarui status.");
                    }
                  }}
                  disabled={savingStatus}
                  className="w-full bg-[#D4AF37] hover:bg-[#B3932D] text-black font-bold h-9 text-xs transition-all shadow-[0_0_10px_rgba(212,175,55,0.2)]"
                >
                  {savingStatus ? "Menyimpan..." : "Simpan Status & Catatan"}
                </Button>
              </div>

            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-white/10 text-xs">
              {selectedOrder.whatsapp && (
                <a
                  href={`https://wa.me/${selectedOrder.whatsapp.replace(/^0/, "62").replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-900/30 h-10"
                >
                  <Phone className="w-4 h-4" /> Hubungi WhatsApp
                </a>
              )}
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  if (confirm("Apakah Anda yakin ingin menghapus pembelian ini?")) {
                    handleDeleteOrder(selectedOrder.id);
                    setSelectedOrder(null);
                  }
                }}
                className="w-full sm:w-auto text-red-400 hover:text-red-300 hover:bg-red-950/40 font-bold rounded-xl h-10 px-4"
              >
                <Trash2 className="w-4 h-4 mr-1 shrink-0" /> Hapus
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedOrder(null)}
                className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 font-bold rounded-xl h-10 px-4"
              >
                Tutup
              </Button>
            </div>

          </div>
        </div>
      )}
      {/* Product Preview Modal */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#022c22] border border-[#D4AF37]/40 p-5 md:p-6 shadow-2xl space-y-5 text-[#FDFBF7] max-h-[92vh] md:max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-base font-bold text-[#D4AF37] flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
                Spesifikasi Detail Produk
              </h2>
              <button
                type="button"
                onClick={() => setPreviewProduct(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo */}
            <div
              onClick={() => setLightboxImage(previewProduct.image_url)}
              className="relative h-60 w-full rounded-xl overflow-hidden border border-[#D4AF37]/30 shadow-lg bg-black cursor-zoom-in group/img"
            >
              <img
                src={previewProduct.image_url}
                alt={previewProduct.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover/img:scale-105"
              />
              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-black/70 px-3 py-1.5 rounded-lg border border-[#D4AF37]/40 text-xs font-semibold text-[#D4AF37] flex items-center gap-1.5 shadow-lg">
                  <Eye className="w-4 h-4" /> Lihat Gambar Penuh
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-white/10 pb-2.5">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white leading-tight">{previewProduct.name}</h3>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${previewProduct.is_active
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-red-500/20 text-red-300 border-red-500/30"
                      }`}>
                      {previewProduct.is_active ? "Aktif di Publik" : "Disembunyikan"}
                    </span>
                    <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded">
                      {previewProduct.has_size ? "Memiliki Pilihan Ukuran" : "All Size"}
                    </span>
                  </div>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-lg font-mono font-black text-[#D4AF37] block">
                    Rp {previewProduct.price.toLocaleString("id-ID")}
                  </span>
                  <span className={`inline-block text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border mt-1 ${previewProduct.stock <= 0
                    ? "bg-red-500/20 text-red-300 border-red-500/30"
                    : previewProduct.stock <= 10
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    }`}>
                    Stok: {previewProduct.stock} pcs
                  </span>
                </div>
              </div>

              <div className="space-y-1 bg-black/40 p-4 rounded-xl border border-white/10">
                <span className="text-gray-400 font-semibold block">Deskripsi &amp; Spesifikasi:</span>
                <p className="text-gray-200 leading-relaxed whitespace-pre-line text-xs">
                  {previewProduct.description}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPreviewProduct(null);
                  handleOpenEdit(previewProduct);
                }}
                className="border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10 text-xs font-bold rounded-xl h-10 px-4"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit Produk
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPreviewProduct(null)}
                className="border-white/20 text-white hover:bg-white/10 text-xs font-bold rounded-xl h-10 px-4"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Lightbox */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md cursor-zoom-out animate-in fade-in duration-200"
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 p-2.5 rounded-full hover:bg-white/20 transition-all z-10"
            title="Tutup Preview"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative w-full h-full max-w-5xl max-h-[85vh] flex items-center justify-center select-none">
            <img
              src={lightboxImage}
              alt="Merchandise Preview Full"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
