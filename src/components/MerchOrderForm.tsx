"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchMerchProducts } from "@/app/(admin)/admin-merch/actions";
import { submitMerchOrder, CartItemInput } from "@/app/(public)/merch/actions";
import { 
  AlertTriangle, 
  ShoppingBag, 
  Info, 
  Loader2, 
  Shirt, 
  Send, 
  MessageSquare, 
  RefreshCw, 
  PackageCheck, 
  Eye, 
  X, 
  Sparkles, 
  Check, 
  Church, 
  Calendar,
  Plus,
  Minus,
  Trash2,
  ShoppingCart
} from "lucide-react";

export const merchSchema = z.object({
  buyer_name: z.string().min(2, "Nama pemesan minimal 2 karakter").max(100, "Maksimal 100 karakter"),
  church_city: z.string().min(2, "Asal Jemaat / Kota wajib diisi").max(100, "Maksimal 100 karakter"),
  whatsapp: z.string().min(8, "Nomor WhatsApp minimal 8 digit").max(20, "Nomor WhatsApp maksimal 20 digit"),
  notes: z.string().optional(),
});

export type MerchFormValues = z.infer<typeof merchSchema>;

type ChurchItem = {
  id: string;
  name: string;
  mupel: string;
};

type MerchProductItem = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  stock: number;
  has_size: boolean;
};

export type CartItemState = {
  cartItemId: string; // Unique cart row ID
  productId: string;
  name: string;
  image_url: string;
  price: number;
  has_size: boolean;
  size: string;
  quantity: number;
};

const SHIRT_SIZES = ["S", "M", "L", "XL", "XXL", "3XL"];

interface MerchOrderFormProps {
  churches: ChurchItem[];
}

export function MerchOrderForm({ churches }: MerchOrderFormProps) {
  const [products, setProducts] = useState<MerchProductItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Multi-Select Cart State
  const [cartItems, setCartItems] = useState<CartItemState[]>([]);

  // Modal Detail Product Preview State
  const [previewProduct, setPreviewProduct] = useState<MerchProductItem | null>(null);

  // Church Selection State (GPIB vs Non-GPIB/Umum)
  const [isGpibMember, setIsGpibMember] = useState(true);
  const [selectedMupel, setSelectedMupel] = useState("");
  const [selectedJemaat, setSelectedJemaat] = useState("");
  const [customChurch, setCustomChurch] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<MerchFormValues>({
    resolver: zodResolver(merchSchema),
    defaultValues: {
      buyer_name: "",
      church_city: "",
      whatsapp: "",
      notes: "",
    },
  });

  // Extract Mupel list
  const mupelList = useMemo(() => {
    const set = new Set<string>();
    churches.forEach((c) => {
      if (c.mupel) set.add(c.mupel);
    });
    return Array.from(set).sort();
  }, [churches]);

  // Extract Jemaat list based on selected Mupel
  const availableJemaatList = useMemo(() => {
    if (!selectedMupel) return [];
    return churches
      .filter((c) => c.mupel === selectedMupel)
      .map((c) => c.name)
      .sort();
  }, [churches, selectedMupel]);

  // Sync combined church string to form field `church_city`
  useEffect(() => {
    if (isGpibMember) {
      if (selectedJemaat && selectedMupel) {
        setValue("church_city", `${selectedJemaat} (${selectedMupel})`);
      } else {
        setValue("church_city", "");
      }
    } else {
      setValue("church_city", customChurch ? `${customChurch} (Umum)` : "");
    }
  }, [isGpibMember, selectedMupel, selectedJemaat, customChurch, setValue]);

  // Load Active Products from Database
  useEffect(() => {
    async function load() {
      setLoadingProducts(true);
      const res = await fetchMerchProducts(true);
      if (res.success && res.data.length > 0) {
        setProducts(res.data);
        // Default select first product into cart
        const p0 = res.data[0];
        setCartItems([
          {
            cartItemId: `cart_${p0.id}_${Date.now()}`,
            productId: p0.id,
            name: p0.name,
            image_url: p0.image_url,
            price: p0.price,
            has_size: p0.has_size,
            size: "L",
            quantity: 1,
          },
        ]);
      }
      setLoadingProducts(false);
    }
    load();
  }, [setValue]);

  // Toggle Product Card in Selection List
  const toggleCartProduct = (p: MerchProductItem) => {
    setCartItems((prev) => {
      const exists = prev.some((item) => item.productId === p.id);
      if (exists) {
        // Remove ALL size variants of this product
        return prev.filter((item) => item.productId !== p.id);
      } else {
        // Add default variant for this product
        return [
          ...prev,
          {
            cartItemId: `cart_${p.id}_${Date.now()}`,
            productId: p.id,
            name: p.name,
            image_url: p.image_url,
            price: p.price,
            has_size: p.has_size,
            size: "L",
            quantity: 1,
          },
        ];
      }
    });
  };

  // Add Another Size Variant Row for a Shirt Product
  const addSizeVariantRow = (p: MerchProductItem) => {
    // Find next available size not already selected for this product
    const existingSizes = cartItems.filter((i) => i.productId === p.id).map((i) => i.size);
    const nextSize = SHIRT_SIZES.find((sz) => !existingSizes.includes(sz)) || "XL";

    setCartItems((prev) => [
      ...prev,
      {
        cartItemId: `cart_${p.id}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        productId: p.id,
        name: p.name,
        image_url: p.image_url,
        price: p.price,
        has_size: p.has_size,
        size: nextSize,
        quantity: 1,
      },
    ]);
  };

  const updateCartQty = (cartItemId: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          const newQty = Math.max(1, Math.min(50, item.quantity + delta));
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const updateCartSize = (cartItemId: string, newSize: string) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          return { ...item, size: newSize };
        }
        return item;
      })
    );
  };

  const removeCartRow = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  // Group cart items by Product ID for clean grouping in the UI
  const groupedCartByProduct = useMemo(() => {
    const map = new Map<string, { product: MerchProductItem; items: CartItemState[] }>();
    cartItems.forEach((ci) => {
      const p = products.find((prod) => prod.id === ci.productId);
      if (p) {
        if (!map.has(p.id)) {
          map.set(p.id, { product: p, items: [] });
        }
        map.get(p.id)!.items.push(ci);
      }
    });
    return Array.from(map.values());
  }, [cartItems, products]);

  // Calculations
  const grandTotalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const grandTotalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const onSubmit = async (data: MerchFormValues) => {
    if (cartItems.length === 0) {
      setErrorMsg("Silakan pilih minimal 1 item merchandise.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const payloadItems: CartItemInput[] = cartItems.map((item) => ({
      name: item.name,
      price: item.price,
      size: item.has_size ? item.size : undefined,
      quantity: item.quantity,
    }));

    const res = await submitMerchOrder({
      buyer_name: data.buyer_name,
      church_city: data.church_city,
      whatsapp: data.whatsapp,
      notes: data.notes,
      items: payloadItems,
    });

    setIsSubmitting(false);

    if (res.success && res.data) {
      setSuccessData({
        ...res.data,
        notice: res.notice,
      });
    } else {
      setErrorMsg(res.error || "Gagal menyimpan pesanan.");
    }
  };

  const handleResetForm = () => {
    setSuccessData(null);
    setSelectedMupel("");
    setSelectedJemaat("");
    setCustomChurch("");
    if (products.length > 0) {
      const p0 = products[0];
      setCartItems([
        {
          cartItemId: `cart_${p0.id}_${Date.now()}`,
          productId: p0.id,
          name: p0.name,
          image_url: p0.image_url,
          price: p0.price,
          has_size: p0.has_size,
          size: "L",
          quantity: 1,
        },
      ]);
    } else {
      setCartItems([]);
    }
    reset();
  };

  // SUCCESS STATE VIEW
  if (successData) {
    const waMessage = `Halo%20Ibu%20Vicora%20Tulende%20(Seksi%20Dana%20HUT%20PKLU),%20saya%20${encodeURIComponent(successData.buyer_name)}%20(${encodeURIComponent(successData.church_city)})%20sudah%20memesan%20Merchandise%20(${encodeURIComponent(successData.item_type)}).%20Total:%20Rp%20${(successData.totalPrice || 0).toLocaleString("id-ID")}.%20Mohon%20informasi%20pembayaran.`;

    return (
      <div className="space-y-6 rounded-2xl border-2 border-emerald-500/40 bg-black/60 p-6 md:p-8 backdrop-blur-xl text-[#FDFBF7] shadow-[0_0_30px_rgba(16,185,129,0.15)] animate-in fade-in">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
            <PackageCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-emerald-400">Pesanan Merchandise Berhasil Dicatat!</h2>
          <p className="text-xs text-gray-300">Terima kasih atas pesanan souvenir Anda.</p>
        </div>

        {/* 📍 VENUE CLAIM NOTICE BOX IN SUCCESS VIEW */}
        <div className="rounded-xl border border-amber-500/50 bg-amber-500/15 p-4 text-amber-200 text-xs leading-relaxed space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-300">
            <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
            📌 CATATAN PENGAMBILAN MERCHANDISE:
          </div>
          <p>
            Seluruh barang merchandise/cenderamata yang Anda pesan dapat diambil di <strong>Meja Khusus Pengambilan Merchandise</strong> pada Hari-H Acara (<strong>Senin, 12 Oktober 2026</strong> di venue <strong>Bekasi Convention Center</strong>) dengan menunjukkan bukti WhatsApp / Nama Pemesan.
          </p>
        </div>

        {/* Explicit Separation Notice Box */}
        <div className="rounded-xl border border-blue-500/40 bg-blue-500/10 p-3.5 text-blue-200 text-xs leading-relaxed">
          <p>{successData.notice}</p>
        </div>

        {/* Order Details Summary Card */}
        <div className="space-y-4 bg-black/50 p-4 md:p-5 rounded-xl border border-white/10 text-xs">
          <h3 className="font-bold text-[#D4AF37] border-b border-white/10 pb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-[#D4AF37]" /> Ringkasan Pesanan #MB-{successData.id.slice(0, 6).toUpperCase()}
            </span>
            <span className="font-mono text-emerald-400 font-bold text-sm">
              Total: Rp {(successData.totalPrice || 0).toLocaleString("id-ID")}
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-gray-400 block">Nama Pemesan:</span>
              <span className="font-bold text-white text-sm">{successData.buyer_name}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Asal Jemaat / Kota:</span>
              <span className="font-semibold text-emerald-300">{successData.church_city}</span>
            </div>
            <div>
              <span className="text-gray-400 block">WhatsApp:</span>
              <span className="font-mono text-white">{successData.whatsapp}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Total Qty Pcs:</span>
              <span className="font-bold text-white font-mono">{successData.quantity} Pcs</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 space-y-2">
            <span className="text-gray-400 font-semibold block">Rincian Item yang Dipesan:</span>
            <div className="bg-black/40 p-3 rounded-lg border border-white/10 space-y-1.5 font-mono text-xs">
              <p className="text-white font-semibold">{successData.item_type}</p>
            </div>
          </div>

          {successData.notes && (
            <div className="pt-2 border-t border-white/10">
              <span className="text-gray-400 block">Catatan Tambahan:</span>
              <p className="italic text-gray-200">{successData.notes}</p>
            </div>
          )}
        </div>

        {/* Action Buttons to CP Vicora Tulende */}
        <div className="space-y-3 pt-2">
          <a
            href={`https://wa.me/6281284212250?text=${waMessage}`}
            target="_blank"
            rel="noreferrer"
            className="block w-full"
          >
            <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-5 text-sm rounded-xl transition-all shadow-lg">
              <MessageSquare className="w-4 h-4 mr-2" />
              Konfirmasi Pesanan ke Ibu Vicora Tulende (Seksi Dana)
            </Button>
          </a>

          <Button
            type="button"
            variant="outline"
            onClick={handleResetForm}
            className="w-full border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 py-5 text-xs font-semibold rounded-xl"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Buat Pesanan Merchandise Lainnya
          </Button>
        </div>
      </div>
    );
  }

  // FORM INPUT VIEW
  return (
    <div className="space-y-6">
      {/* 👤 CONTACT PERSON SEKSI DANA CARD */}
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-4 md:p-5 text-emerald-200 text-xs md:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" /> Contact Person Seksi Dana Panitia
          </span>
          <p className="font-bold text-white text-base">Ibu Vicora Tulende</p>
          <p className="text-xs text-emerald-300">Hubungi panitia untuk pertanyaan seputar pemesanan &amp; konfirmasi kontribusi merchandise.</p>
        </div>

        <a
          href="https://wa.me/6281284212250?text=Halo%20Ibu%20Vicora%20Tulende%20(Seksi%20Dana%20HUT%20PKLU),%20saya%20ingin%20bertanya%20mengenai%20pemesanan%20merchandise"
          target="_blank"
          rel="noreferrer"
          className="shrink-0"
        >
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow">
            <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Chat WA (081284212250)
          </Button>
        </a>
      </div>
      {/* 1. MODAL DETAIL PRODUCT PREVIEW */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#022c22] border border-[#D4AF37]/50 p-6 shadow-2xl space-y-5 text-[#FDFBF7] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-base font-bold text-[#D4AF37] flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
                Detail Spesifikasi Produk
              </h2>
              <button
                type="button"
                onClick={() => setPreviewProduct(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo */}
            <div className="relative h-64 w-full rounded-xl overflow-hidden border border-[#D4AF37]/30 shadow-lg bg-black">
              <img
                src={previewProduct.image_url}
                alt={previewProduct.name}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2">
                <h3 className="text-xl font-bold text-white">{previewProduct.name}</h3>
                <span className="text-lg font-mono font-black text-[#D4AF37]">
                  {previewProduct.price > 0 ? `Rp ${previewProduct.price.toLocaleString("id-ID")}` : "Cenderamata"}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-400">Deskripsi &amp; Bahan Spesifikasi:</p>
                <p className="text-xs text-gray-200 leading-relaxed bg-black/40 p-3.5 rounded-xl border border-white/10 whitespace-pre-line">
                  {previewProduct.description}
                </p>
              </div>

              {previewProduct.has_size && (
                <div className="flex items-center gap-2 text-xs text-purple-300 bg-purple-500/10 p-2.5 rounded-lg border border-purple-500/20">
                  <Shirt className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Tersedia pilihan ukuran kaos: <strong>S, M, L, XL, XXL, 3XL</strong></span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-white/10">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setPreviewProduct(null)}
                className="w-1/3 text-gray-400 hover:text-white"
              >
                Tutup
              </Button>
              <Button
                type="button"
                onClick={() => {
                  const exists = cartItems.some((ci) => ci.productId === previewProduct.id);
                  if (!exists) {
                    toggleCartProduct(previewProduct);
                  }
                  setPreviewProduct(null);
                }}
                className="w-2/3 bg-[#D4AF37] hover:bg-[#B3932D] text-black font-bold text-xs"
              >
                <Check className="w-4 h-4 mr-1" /> Tambahkan ke Pesanan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. FORM INPUT CONTAINER */}
      <div className="space-y-6 rounded-2xl border border-[#D4AF37]/30 bg-black/40 p-6 md:p-8 backdrop-blur-md text-[#FDFBF7] shadow-2xl">
        {/* 📍 VENUE CLAIM BANNER NOTICE */}
        <div className="rounded-xl border border-[#D4AF37]/50 bg-[#D4AF37]/15 p-4 text-amber-200 text-xs md:text-sm space-y-1.5 shadow-lg">
          <div className="flex items-center gap-2 font-bold text-[#D4AF37] text-sm md:text-base">
            <Calendar className="w-5 h-5 text-[#D4AF37] shrink-0" />
            📌 CATATAN PENGAMBILAN MERCHANDISE:
          </div>
          <p className="leading-relaxed">
            Seluruh barang merchandise/cenderamata yang Anda pesan dapat diambil di <strong>Meja Khusus Pengambilan Merchandise</strong> pada Hari-H Acara (<strong>Senin, 12 Oktober 2026</strong> di venue <strong>Bekasi Convention Center</strong>).
          </p>
        </div>

        {/* ⚠️ CRITICAL WARNING ALERT BANNER */}
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-amber-200 text-xs leading-relaxed space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            PERHATIAN PENTING:
          </div>
          <p>
            Formulir ini <strong>KHUSUS untuk Pemesanan Merchandise Tambahan (Cenderamata Opsional)</strong>. Ini BUKAN untuk Kaos Seragam Resmi Acara yang ukurannya sudah diisi saat pendaftaran.
          </p>
        </div>

        <div className="border-b border-white/10 pb-3">
          <h2 className="text-xl font-bold text-[#D4AF37] flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
            Form Pemesanan Merchandise Tambahan
          </h2>
          <p className="text-xs text-gray-300">Isi identitas pemesan dan pilih beberapa item/ukuran souvenir di bawah ini.</p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/20 border border-red-500/40 p-4 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Field: Nama Pemesan */}
          <div className="space-y-1.5">
            <Label htmlFor="merch-name" className="text-xs font-semibold text-gray-200">
              Nama Lengkap Pemesan *
            </Label>
            <Input
              id="merch-name"
              placeholder="Masukkan nama pemesan"
              className="bg-black/50 border-white/20 text-white"
              {...register("buyer_name")}
            />
            {errors.buyer_name && <p className="text-xs text-red-400">{errors.buyer_name.message}</p>}
          </div>

          {/* Field: Asal Jemaat / Mupel (GPIB vs Non-GPIB / Umum) */}
          <div className="space-y-3 p-4 bg-black/60 rounded-xl border border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <Label className="text-xs font-semibold text-[#D4AF37] flex items-center gap-1.5">
                <Church className="w-4 h-4 text-[#D4AF37]" /> Asal Jemaat / Gereja *
              </Label>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsGpibMember(true)}
                  className={`px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                    isGpibMember
                      ? "bg-[#D4AF37] text-black border-[#D4AF37]"
                      : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
                  }`}
                >
                  Jemaat GPIB
                </button>
                <button
                  type="button"
                  onClick={() => setIsGpibMember(false)}
                  className={`px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                    !isGpibMember
                      ? "bg-[#D4AF37] text-black border-[#D4AF37]"
                      : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
                  }`}
                >
                  Umum / Non-GPIB
                </button>
              </div>
            </div>

            {isGpibMember ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Select Mupel */}
                <div className="space-y-1">
                  <span className="text-[11px] text-gray-400 block">Pilih Mupel GPIB:</span>
                  <select
                    value={selectedMupel}
                    onChange={(e) => {
                      setSelectedMupel(e.target.value);
                      setSelectedJemaat("");
                    }}
                    className="w-full rounded-md border border-white/20 bg-black/80 p-2.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="">-- Pilih Mupel --</option>
                    {mupelList.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Jemaat */}
                <div className="space-y-1">
                  <span className="text-[11px] text-gray-400 block">Pilih Jemaat GPIB:</span>
                  <select
                    value={selectedJemaat}
                    disabled={!selectedMupel}
                    onChange={(e) => setSelectedJemaat(e.target.value)}
                    className="w-full rounded-md border border-white/20 bg-black/80 p-2.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none disabled:opacity-50"
                  >
                    <option value="">-- Pilih Jemaat --</option>
                    {availableJemaatList.map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-1 pt-1">
                <span className="text-[11px] text-gray-400 block">Nama Gereja / Instansi / Umum:</span>
                <Input
                  value={customChurch}
                  onChange={(e) => setCustomChurch(e.target.value)}
                  placeholder="Contoh: GKI Kebayoran / Umum"
                  className="bg-black/50 border-white/20 text-white text-xs"
                />
              </div>
            )}

            {errors.church_city && <p className="text-xs text-red-400">{errors.church_city.message}</p>}
          </div>

          {/* Field: WhatsApp */}
          <div className="space-y-1.5">
            <Label htmlFor="merch-wa" className="text-xs font-semibold text-gray-200">
              Nomor WhatsApp Pemesan *
            </Label>
            <Input
              id="merch-wa"
              placeholder="Contoh: 08123456789"
              className="bg-black/50 border-white/20 text-white font-mono"
              {...register("whatsapp")}
            />
            {errors.whatsapp && <p className="text-xs text-red-400">{errors.whatsapp.message}</p>}
          </div>

          {/* 🛍️ MULTI-ITEM SELECTION CARDS */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-[#D4AF37] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Pilih Produk Merchandise *
              </Label>
              <span className="text-[11px] text-gray-400">
                {cartItems.length} Variasi Dipilih
              </span>
            </div>

            {loadingProducts ? (
              <div className="p-6 text-center text-xs text-gray-400 bg-black/50 rounded-xl border border-white/10">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-[#D4AF37]" /> Memuat item merchandise...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.map((p) => {
                  const isSelected = cartItems.some((ci) => ci.productId === p.id);
                  const countVariants = cartItems.filter((ci) => ci.productId === p.id).length;
                  const isOutOfStock = (p.stock ?? 100) <= 0;

                  return (
                    <div
                      key={p.id}
                      onClick={() => !isOutOfStock && toggleCartProduct(p)}
                      className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        isOutOfStock
                          ? "border-red-500/30 bg-black/40 opacity-50 cursor-not-allowed"
                          : isSelected
                          ? "border-[#D4AF37] bg-[#D4AF37]/15 shadow-[0_0_15px_rgba(212,175,55,0.2)] ring-1 ring-[#D4AF37] cursor-pointer"
                          : "border-white/15 bg-black/60 hover:border-white/30 hover:bg-black/80 opacity-90 hover:opacity-100 cursor-pointer"
                      }`}
                    >
                      {/* Checkbox */}
                      <div className="shrink-0">
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                            isOutOfStock
                              ? "border-gray-600 bg-gray-800"
                              : isSelected
                              ? "bg-[#D4AF37] border-[#D4AF37] text-black"
                              : "border-gray-500 bg-black/40"
                          }`}
                        >
                          {isSelected && !isOutOfStock && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Small Thumbnail Photo */}
                      <div className="relative h-14 w-14 rounded-lg overflow-hidden border border-white/20 bg-black shrink-0">
                        <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-[9px] font-bold text-red-400">
                            HABIS
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewProduct(p);
                          }}
                          className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white text-[10px]"
                        >
                          <Eye className="w-4 h-4 text-[#D4AF37]" />
                        </button>
                      </div>

                      {/* Title, Price & Stock Badge */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <h4 className="font-bold text-white text-xs truncate">{p.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-[#D4AF37] font-extrabold">
                            {p.price > 0 ? `Rp ${p.price.toLocaleString("id-ID")}` : "Cenderamata"}
                          </span>

                          {/* Remaining Stock Badge */}
                          {isOutOfStock ? (
                            <span className="text-[10px] text-red-400 font-bold bg-red-500/20 px-1.5 py-0.5 rounded border border-red-500/30">
                              Habis
                            </span>
                          ) : (
                            <span
                              className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border ${
                                p.stock <= 10
                                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              }`}
                            >
                              Stok: {p.stock} pcs
                            </span>
                          )}
                        </div>

                        {isSelected && countVariants > 1 && (
                          <span className="inline-block text-[10px] text-purple-300 font-semibold bg-purple-500/20 px-1.5 py-0.5 rounded border border-purple-500/30">
                            {countVariants} Variasi Ukuran
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 🛒 MULTI-SIZE & MULTI-ITEM CART CONFIGURATOR */}
          {groupedCartByProduct.length > 0 ? (
            <div className="p-4 md:p-5 bg-black/60 rounded-2xl border border-[#D4AF37]/50 space-y-4 shadow-xl animate-in fade-in">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-bold text-sm text-[#D4AF37] flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-[#D4AF37]" />
                  Rincian Keranjang ({grandTotalQty} Pcs Item Dipilih):
                </h3>
              </div>

              {/* Grouped Products List */}
              <div className="space-y-4 divide-y divide-white/10">
                {groupedCartByProduct.map(({ product, items }) => (
                  <div key={product.id} className="pt-4 first:pt-0 space-y-3">
                    {/* Header Product Card */}
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover border border-white/20 shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-white text-sm">{product.name}</h4>
                          <span className="font-mono text-[#D4AF37]">
                            Rp {product.price.toLocaleString("id-ID")} / pcs
                          </span>
                        </div>
                      </div>

                      {/* Add Another Size Variant Button for Shirt Items */}
                      {product.has_size && (
                        <button
                          type="button"
                          onClick={() => addSizeVariantRow(product)}
                          className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" /> Tambah Ukuran Kaos Lain
                        </button>
                      )}
                    </div>

                    {/* Size Variants / Quantity Rows */}
                    <div className="space-y-2">
                      {items.map((cartItem) => (
                        <div
                          key={cartItem.cartItemId}
                          className="flex flex-wrap items-center justify-between gap-3 bg-black/40 p-3 rounded-xl border border-white/10 text-xs"
                        >
                          {/* Size selector if shirt */}
                          {cartItem.has_size ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-purple-300 font-semibold flex items-center gap-1">
                                <Shirt className="w-3.5 h-3.5" /> Ukuran Kaos:
                              </span>
                              <div className="flex gap-1">
                                {SHIRT_SIZES.map((sz) => (
                                  <button
                                    key={sz}
                                    type="button"
                                    onClick={() => updateCartSize(cartItem.cartItemId, sz)}
                                    className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                                      cartItem.size === sz
                                        ? "bg-purple-600 text-white shadow ring-1 ring-purple-300"
                                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                                    }`}
                                  >
                                    {sz}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <span className="text-[11px] text-gray-400 italic">Ukuran All Size / Standar</span>
                          )}

                          {/* Quantity Stepper & Remove */}
                          <div className="flex items-center gap-3 ml-auto">
                            <div className="flex items-center border border-white/20 rounded-lg bg-black/60 overflow-hidden">
                              <button
                                type="button"
                                onClick={() => updateCartQty(cartItem.cartItemId, -1)}
                                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white font-bold transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-3 font-mono font-bold text-white text-xs">
                                {cartItem.quantity} pcs
                              </span>
                              <button
                                type="button"
                                onClick={() => updateCartQty(cartItem.cartItemId, 1)}
                                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white font-bold transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="font-mono font-extrabold text-emerald-400 text-xs min-w-[70px] text-right">
                              Rp {(cartItem.price * cartItem.quantity).toLocaleString("id-ID")}
                            </span>

                            <button
                              type="button"
                              onClick={() => removeCartRow(cartItem.cartItemId)}
                              className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-950/40"
                              title="Hapus baris ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Summary Footer */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs md:text-sm">
                <div>
                  <span className="text-gray-400 block text-[11px]">Total Item Pcs:</span>
                  <span className="font-bold text-white font-mono">{grandTotalQty} Pcs</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 block text-[11px]">Total Estimasi Kontribusi:</span>
                  <span className="font-mono font-black text-xl text-[#D4AF37]">
                    Rp {grandTotalPrice.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/30 text-amber-300 text-xs text-center">
              ⚠️ Silakan beri tanda centang pada minimal 1 produk merchandise di atas.
            </div>
          )}

          {/* Field: Catatan */}
          <div className="space-y-1.5">
            <Label htmlFor="merch-notes" className="text-xs font-semibold text-gray-200">
              Catatan Tambahan <span className="text-gray-400 font-normal">(Opsional)</span>
            </Label>
            <textarea
              id="merch-notes"
              rows={2}
              placeholder="Contoh: Request khusus, atau catatan pengirim..."
              className="w-full rounded-md border border-white/20 bg-black/50 p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none resize-none"
              {...register("notes")}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || cartItems.length === 0}
            className="w-full bg-[#D4AF37] hover:bg-[#B3932D] text-black font-bold py-6 text-base rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Memproses Pesanan...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Send className="w-5 h-5" /> Kirim Pesanan ({grandTotalQty} Pcs - Rp {grandTotalPrice.toLocaleString("id-ID")})
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
