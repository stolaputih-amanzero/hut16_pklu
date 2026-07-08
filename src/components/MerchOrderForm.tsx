"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSizeSurcharge, splitItemType } from "@/lib/utils";
import { fetchMerchProducts } from "@/app/(admin)/admin/merch/actions";
import { submitMerchOrder, CartItemInput, getMerchOrderByCodeOrWa } from "@/app/(public)/merch/actions";
import { QRCodeSVG } from "qrcode.react";
import {
  AlertTriangle,
  ShoppingBag,
  Info,
  BookOpen,
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
  ShoppingCart,
  ChevronDown,
  Download,
  Camera,
  Copy,
  Search
} from "lucide-react";

export const merchSchema = z.object({
  buyer_name: z.string().min(2, "Nama pembeli minimal 2 karakter").max(100, "Maksimal 100 karakter"),
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

const SHIRT_SIZES = ["S", "M", "L", "XL", "XXL", "3XL", "4XL"];

interface MerchOrderFormProps {
  churches: ChurchItem[];
}

export function MerchOrderForm({ churches }: MerchOrderFormProps) {
  const [products, setProducts] = useState<MerchProductItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"info" | "panduan" | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(true);
  const [isGuideOpen, setIsGuideOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // If mobile state changes, reset active tab
  useEffect(() => {
    if (isMobile) {
      setActiveTab(null); // Collapsed by default on mobile
    }
  }, [isMobile]);

  // Status check modal states
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusSearchQuery, setStatusSearchQuery] = useState("");
  const [statusLookupLoading, setStatusLookupLoading] = useState(false);
  const [statusLookupResults, setStatusLookupResults] = useState<any[] | null>(null);
  const [statusLookupError, setStatusLookupError] = useState("");

  const handleStatusSearch = async () => {
    const q = statusSearchQuery.trim();
    if (!q) return;
    setStatusLookupLoading(true);
    setStatusLookupError("");
    setStatusLookupResults(null);

    const res = await getMerchOrderByCodeOrWa(q);
    setStatusLookupLoading(false);

    if (res.success && res.data && res.data.length > 0) {
      setStatusLookupResults(res.data);
    } else {
      setStatusLookupError("Pembelian tidak ditemukan. Periksa kembali No WhatsApp atau Kode Pembelian Anda.");
    }
  };

  // Ref & State for Receipt Downloader
  const receiptRef = useRef<HTMLDivElement>(null);
  const [downloadingImage, setDownloadingImage] = useState(false);

  const handleDownloadReceipt = async () => {
    if (!receiptRef.current || !successData) return;
    try {
      setDownloadingImage(true);
      const dataUrl = await toPng(receiptRef.current, {
        cacheBust: true,
        backgroundColor: "#011c15",
        style: {
          transform: "scale(1)",
        }
      });
      const link = document.createElement("a");
      link.download = `Bukti-Pembelian-Merch-${successData.id.slice(0, 6).toUpperCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Gagal menyimpan bukti:", err);
      toast.error("Gagal menyimpan gambar bukti pembelian. Silakan lakukan screenshot pada layar Anda.");
    } finally {
      setDownloadingImage(false);
    }
  };

  // Payment states
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (window.innerWidth < 768) {
      setIsGuideOpen(false);
    }
  }, []);

  // Multi-Select Cart State
  const [cartItems, setCartItems] = useState<CartItemState[]>([]);

  // Modal Detail Product Preview State
  const [previewProduct, setPreviewProduct] = useState<MerchProductItem | null>(null);
  const [previewSize, setPreviewSize] = useState<string>("L");
  const [previewQty, setPreviewQty] = useState<number>(1);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Reset preview selections when preview product changes
  useEffect(() => {
    if (previewProduct) {
      setPreviewSize("L");
      setPreviewQty(1);
    }
  }, [previewProduct]);

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

  const handleAddFromPreview = () => {
    if (!previewProduct) return;

    setCartItems((prev) => {
      if (previewProduct.has_size) {
        // Check if same size already exists
        const existsIdx = prev.findIndex(
          (ci) => ci.productId === previewProduct.id && ci.size === previewSize
        );
        if (existsIdx > -1) {
          return prev.map((ci, idx) =>
            idx === existsIdx
              ? { ...ci, quantity: Math.min(50, ci.quantity + previewQty) }
              : ci
          );
        }
      } else {
        const existsIdx = prev.findIndex((ci) => ci.productId === previewProduct.id);
        if (existsIdx > -1) {
          return prev.map((ci, idx) =>
            idx === existsIdx
              ? { ...ci, quantity: Math.min(50, ci.quantity + previewQty) }
              : ci
          );
        }
      }

      // Add new
      return [
        ...prev,
        {
          cartItemId: `cart_${previewProduct.id}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          productId: previewProduct.id,
          name: previewProduct.name,
          image_url: previewProduct.image_url,
          price: previewProduct.price,
          has_size: previewProduct.has_size,
          size: previewProduct.has_size ? previewSize : "L",
          quantity: previewQty,
        },
      ];
    });

    setPreviewProduct(null);
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
  const grandTotalPrice = cartItems.reduce((sum, item) => {
    const effectivePrice = item.price + (item.has_size ? getSizeSurcharge(item.size) : 0);
    return sum + effectivePrice * item.quantity;
  }, 0);

  const onSubmit = async (data: MerchFormValues) => {
    if (cartItems.length === 0) {
      setErrorMsg("Silakan pilih minimal 1 item produk.");
      return;
    }

    if (!paymentProofFile) {
      setErrorMsg("Bukti transfer wajib diunggah.");
      return;
    }

    if (!paymentDate) {
      setErrorMsg("Tanggal transfer wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const payloadItems = cartItems.map((item) => ({
      name: item.name,
      price: item.price + (item.has_size ? getSizeSurcharge(item.size) : 0),
      size: item.has_size ? item.size : undefined,
      quantity: item.quantity,
    }));

    const fd = new FormData();
    fd.append("buyer_name", data.buyer_name);
    fd.append("church_city", data.church_city);
    fd.append("whatsapp", data.whatsapp);

    fd.append("items", JSON.stringify(payloadItems));
    if (data.notes) {
      fd.append("notes", data.notes);
    }
    fd.append("payment_date", paymentDate);
    fd.append("payment_proof", paymentProofFile);

    const res = await submitMerchOrder(fd);
    setIsSubmitting(false);

    if (res.success && res.data) {
      setSuccessData({
        ...res.data,
        notice: res.notice,
      });
    } else {
      setErrorMsg(res.error || "Gagal menyimpan pembelian.");
    }
  };

  const handleResetForm = () => {
    setSuccessData(null);
    setSelectedMupel("");
    setSelectedJemaat("");
    setCustomChurch("");

    setPaymentDate("");
    setPaymentProofFile(null);
    setPaymentProofPreview(null);

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
    const waMessage = `Halo%20Marsya%20Theresia%20(Seksi%20Dana%20HUT%20PKLU),%20saya%20${encodeURIComponent(successData.buyer_name)}%20(${encodeURIComponent(successData.church_city)})%20sudah%20memesan%20Merchandise%20(${encodeURIComponent(successData.item_type)}).%20Total:%20Rp%20${(successData.totalPrice || 0).toLocaleString("id-ID")}.%20Mohon%20informasi%20pembayaran.`;

    return (
      <div className="space-y-6 rounded-2xl border-2 border-emerald-500/40 bg-black/60 p-6 md:p-8 backdrop-blur-xl text-[#FDFBF7] shadow-[0_0_30px_rgba(16,185,129,0.15)] animate-in fade-in">

        {/* Printable Receipt Card Container */}
        <div
          ref={receiptRef}
          className="p-5 md:p-6 rounded-xl border border-[#D4AF37]/35 bg-[#011c15] text-[#FDFBF7] space-y-4 shadow-inner"
        >
          <div className="text-center space-y-2 pb-4 border-b border-white/10">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <PackageCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold text-emerald-400 leading-tight">Bukti Pembelian Merchandise</h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">HUT 16 PKLU GPIB BEKASI</p>
          </div>

          {/* 📍 VENUE CLAIM NOTICE BOX IN SUCCESS VIEW */}
          <div className="rounded-xl border border-amber-500/45 bg-amber-500/10 p-3.5 text-amber-200 text-[11px] leading-relaxed space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>CATATAN PENGAMBILAN MERCHANDISE:</span>
            </div>
            <p>
              Seluruh Merchandise yang Anda beli dapat diambil di <strong>Meja Pengambilan Merchandise</strong> pada Hari-H Acara (<strong>Senin, 12 Oktober 2026</strong> di venue <strong>Bekasi Convention Center</strong>) dengan menunjukkan bukti QR Code / Nama Pembeli.
            </p>
          </div>

          {/* Explicit Separation Notice Box */}
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-blue-200 text-[11px] leading-relaxed">
            <p>{successData.notice}</p>
          </div>

          {/* Order Summary Details */}
          <div className="space-y-4 bg-black/40 p-4 rounded-xl border border-white/5 text-[11px]">
            <h3 className="font-bold text-[#D4AF37] border-b border-white/10 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold">
                <ShoppingBag className="w-3.5 h-3.5 text-[#D4AF37]" /> Ringkasan Pembelian #MB-{successData.id.slice(0, 6).toUpperCase()}
              </span>
              <span className="font-mono text-emerald-400 font-bold text-xs">
                Total: Rp {(successData.totalPrice || 0).toLocaleString("id-ID")}
              </span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-gray-400 block">Nama Pembeli:</span>
                <span className="font-bold text-white">{successData.buyer_name}</span>
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
              <div className="col-span-2 pt-2 border-t border-white/5">
                <span className="text-gray-400 block mb-1">Status Pembelian:</span>
                <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider">
                  Tercatat, Menunggu Konfirmasi
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 space-y-1.5">
              <span className="text-gray-400 font-semibold block">Rincian Item yang Dibeli:</span>
              <div className="bg-black/40 p-3 rounded-lg border border-white/5 space-y-1.5 font-mono text-[10px] text-gray-200">
                {splitItemType(successData.item_type).map((item: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#D4AF37] shrink-0">•</span>
                    <span className="text-white font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {successData.notes && (
              <div className="pt-2 border-t border-white/10">
                <span className="text-gray-400 block">Catatan Tambahan:</span>
                <p className="italic text-gray-200">{successData.notes}</p>
              </div>
            )}
          </div>

          {/* QR Code Status Check Section */}
          <div className="bg-black/40 p-4 rounded-xl border border-[#D4AF37]/35 flex flex-col items-center justify-center space-y-2.5 text-center">
            <div className="bg-white p-2.5 rounded-lg flex items-center justify-center">
              <QRCodeSVG
                value={`${window.location.origin}/cek?merch_id=${successData.id}`}
                size={120}
                level="H"
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#D4AF37]">QR Code Status Pembelian</p>
              <p className="text-[9px] text-gray-400 max-w-xs leading-normal">
                Scan atau simpan QR Code di atas untuk memantau status persetujuan pembayaran dan notes/catatan dari panitia.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            type="button"
            onClick={handleDownloadReceipt}
            disabled={downloadingImage}
            className="w-full bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 border border-[#D4AF37]/60 text-[#D4AF37] font-bold h-auto py-4 px-4 text-sm sm:text-base whitespace-normal rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {downloadingImage ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Menyiapkan Gambar Bukti...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Simpan Bukti sebagai Gambar</span>
              </>
            )}
          </Button>

          <a
            href={`https://wa.me/6281219964142?text=${waMessage}`}
            target="_blank"
            rel="noreferrer"
            className="block w-full"
          >
            <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-auto py-4 px-4 text-sm sm:text-base whitespace-normal rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
              <MessageSquare className="w-5 h-5 shrink-0" />
              <span>Konfirmasi via WhatsApp</span>
            </Button>
          </a>

          <Button
            type="button"
            variant="outline"
            onClick={handleResetForm}
            className="w-full border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 h-auto py-4 px-4 text-xs sm:text-sm font-semibold rounded-xl whitespace-normal flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4 mr-2 shrink-0" />
            <span>Buat Pembelian Baru</span>
          </Button>
        </div>
      </div>
    );
  }

  const renderInfoContent = () => (
    <div className="space-y-4 pt-2">
      {/* 👤 CONTACT PERSON SEKSI DANA CARD */}
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4 text-[#FDFBF7] text-xs flex flex-col gap-3 shadow-md backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-300 text-sm shrink-0 shadow-inner">
            MT
          </div>
          <div className="space-y-0.5 text-left">
            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 block">
              Seksi Dana Panitia
            </span>
            <p className="font-extrabold text-white text-sm">Marsya Theresia</p>
          </div>
        </div>

        <p className="text-[11px] text-emerald-200/80 leading-relaxed text-left">
          Hubungi panitia untuk informasi produk &amp; pembelian
        </p>

        <a
          href="https://wa.me/6281219964142?text=Halo%20Marsya%20Theresia%20(Seksi%20Dana%20HUT%20PKLU),%20saya%20ingin%20bertanya%20mengenai%20pembelian%20merchandise"
          target="_blank"
          rel="noreferrer"
          className="w-full"
        >
          <Button type="button" size="sm" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all active:scale-[0.98] py-2.5 px-3.5 flex items-center justify-center gap-1.5 cursor-pointer">
            <MessageSquare className="w-3.5 h-3.5 shrink-0" /> Chat WA (081219964142)
          </Button>
        </a>
      </div>

      {/* 📍 VENUE CLAIM BANNER NOTICE */}
      <div className="rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-4 text-amber-200 text-xs space-y-1.5 shadow-md text-left font-normal leading-relaxed">
        <div className="flex items-center gap-2 font-bold text-[#D4AF37] text-xs">
          <Calendar className="w-4 h-4 text-[#D4AF37] shrink-0" />
          📌 CATATAN PENGAMBILAN MERCHANDISE:
        </div>
        <p className="leading-relaxed">
          Seluruh barang merchandise yang Anda beli dapat diambil di <strong>Meja Khusus Pengambilan Merchandise</strong> pada Hari-H Acara (<strong>Senin, 12 Oktober 2026</strong> di venue <strong>Bekasi Convention Center</strong>).
        </p>
      </div>
    </div>
  );

  const renderPanduanContent = () => (
    <div className="space-y-4 pt-2 text-left font-normal leading-relaxed">
      <ol className="list-decimal list-inside space-y-3 text-xs text-gray-300 leading-relaxed font-semibold">
        <li>
          <span className="font-bold text-[#D4AF37]">Pilih Produk Merchandise:</span>
          <p className="pl-5 text-[11px] text-gray-300 font-normal leading-relaxed mt-1">Pilih produk yang Anda inginkan dari daftar produk di bawah, atur ukuran (bila ada) dan jumlah (quantity), lalu klik <strong>"Tambahkan ke Pembelian"</strong>.</p>
        </li>
        <li>
          <span className="font-bold text-[#D4AF37]">Isi Formulir Data Pembeli:</span>
          <p className="pl-5 text-[11px] text-gray-300 font-normal leading-relaxed mt-1">Lengkapi Nama Lengkap, pilih asal jemaat GPIB (Mupel &amp; Jemaat) atau pilih kategori Umum/Lainnya, serta masukkan nomor WhatsApp aktif.</p>
        </li>
        <li>
          <span className="font-bold text-[#D4AF37]">Transfer Biaya Pembelian:</span>
          <p className="pl-5 text-[11px] text-gray-300 font-normal leading-relaxed mt-1">Lakukan pembayaran via transfer ke rekening panitia: <strong>Bank BTN 00179-01-88-000447-9 a.n. Panitia MUPEL GPIB BEKASI</strong> sesuai total tagihan belanja Anda.</p>
        </li>
        <li>
          <span className="font-bold text-[#D4AF37]">Unggah Bukti Pembayaran:</span>
          <p className="pl-5 text-[11px] text-gray-300 font-normal leading-relaxed mt-1">Isi Tanggal Transfer, unggah foto/screenshot bukti transfer, lalu klik tombol <strong>"Kirim Formulir Pembelian"</strong>.</p>
        </li>
        <li>
          <span className="font-bold text-[#D4AF37]">Simpan Tanda Terima &amp; QR Code:</span>
          <p className="pl-5 text-[11px] text-gray-300 font-normal leading-relaxed mt-1">Setelah sukses, simpan gambar tiket bukti pembelian dan scan/tunjukkan QR Code tersebut ke meja pengambilan pada hari H acara.</p>
        </li>
      </ol>
    </div>
  );

  // FORM INPUT VIEW
  return (
    <div className="space-y-6">
      {/* Top Banner Status Button */}
      <div className="text-center pb-2">
        <button
          type="button"
          onClick={() => setIsStatusModalOpen(true)}
          className="inline-flex items-center text-xs font-semibold text-[#D4AF37] hover:underline bg-[#D4AF37]/10 px-3 py-1.5 rounded-full border border-[#D4AF37]/30 transition-all hover:scale-[1.02] cursor-pointer"
        >
          Sudah pernah melakukan Pembelian? Cek Status / QR Code Pembelian →
        </button>
      </div>

      {/* Info & Panduan Blocks (Desktop Side-by-Side, Mobile Responsive Tabs) */}
      {isMobile ? (
        <div className="space-y-4">
          {/* Mobile Side-by-Side Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === "info" ? null : "info")}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-bold transition-all duration-300 cursor-pointer ${activeTab === "info"
                ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                : "bg-black/60 text-gray-300 border-white/10 hover:bg-black/85"
                }`}
            >
              <Info className="w-4 h-4 shrink-0" />
              Info
            </button>

            <button
              type="button"
              onClick={() => setActiveTab(activeTab === "panduan" ? null : "panduan")}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-bold transition-all duration-300 cursor-pointer ${activeTab === "panduan"
                ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                : "bg-black/60 text-gray-300 border-white/10 hover:bg-black/85"
                }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              Panduan
            </button>
          </div>

          {/* Collapsible Panel Content */}
          <div
            className={`transition-all duration-300 overflow-hidden ${activeTab !== null
              ? "max-h-[1200px] opacity-100 p-4 sm:p-5 border border-[#D4AF37]/30 bg-black/60 rounded-2xl shadow-inner mt-2"
              : "max-h-0 opacity-0 pointer-events-none"
              }`}
          >
            {activeTab === "info" && renderInfoContent()}
            {activeTab === "panduan" && renderPanduanContent()}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Info */}
          <div className="rounded-2xl border border-white/10 bg-black/45 p-4 sm:p-5 md:p-6 text-sm text-[#FDFBF7] space-y-4 shadow-lg">
            <button
              type="button"
              onClick={() => setIsInfoOpen(!isInfoOpen)}
              className="w-full flex items-center justify-between text-[#D4AF37] text-left cursor-pointer focus:outline-none group/btn"
            >
              <h2 className="text-sm sm:text-base font-bold flex items-center gap-2">
                <Info className="w-5 h-5 text-[#D4AF37] shrink-0" />
                Informasi &amp; Kontak Panitia
              </h2>
              <ChevronDown
                className={`w-5 h-5 text-[#D4AF37] transition-transform duration-300 shrink-0 ml-2 group-hover/btn:translate-y-0.5 ${isInfoOpen ? "rotate-180" : ""
                  }`}
              />
            </button>
            <div
              className={`transition-all duration-300 overflow-hidden ${isInfoOpen ? "max-h-[1000px] opacity-100 mt-4" : "max-h-0 opacity-0 pointer-events-none"
                }`}
            >
              {renderInfoContent()}
            </div>
          </div>

          {/* Card Panduan */}
          <div className="rounded-2xl border border-white/10 bg-black/45 p-4 sm:p-5 md:p-6 text-sm text-[#FDFBF7] space-y-4 shadow-lg">
            <button
              type="button"
              onClick={() => setIsGuideOpen(!isGuideOpen)}
              className="w-full flex items-center justify-between text-[#D4AF37] text-left cursor-pointer focus:outline-none group/btn"
            >
              <h2 className="text-sm sm:text-base font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#D4AF37] shrink-0" />
                Tata Cara / Panduan Pembelian
              </h2>
              <ChevronDown
                className={`w-5 h-5 text-[#D4AF37] transition-transform duration-300 shrink-0 ml-2 group-hover/btn:translate-y-0.5 ${isGuideOpen ? "rotate-180" : ""
                  }`}
              />
            </button>
            <div
              className={`transition-all duration-300 overflow-hidden ${isGuideOpen ? "max-h-[1200px] opacity-100 mt-4" : "max-h-0 opacity-0 pointer-events-none"
                }`}
            >
              {renderPanduanContent()}
            </div>
          </div>
        </div>
      )}

      {/* 1. MODAL DETAIL PRODUCT PREVIEW */}
      {previewProduct && (() => {
        const isOutOfStock = (previewProduct.stock ?? 100) <= 0;
        return mounted ? createPortal(
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="w-full max-w-md rounded-2xl bg-[#022c22] border border-[#D4AF37]/50 p-5 shadow-2xl space-y-4 text-[#FDFBF7] my-auto">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <h2 className="text-sm font-bold text-[#D4AF37] flex items-center gap-2">
                  <ShoppingBag className="w-4.5 h-4.5 text-[#D4AF37]" />
                  Detail Spesifikasi Produk
                </h2>
                <button
                  type="button"
                  onClick={() => setPreviewProduct(null)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Photo */}
              <div
                onClick={() => setLightboxImage(previewProduct.image_url)}
                className="relative h-44 w-full rounded-xl overflow-hidden border border-[#D4AF37]/30 shadow-lg bg-black cursor-zoom-in group/img shrink-0"
              >
                <Image
                  src={previewProduct.image_url}
                  alt={previewProduct.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-cover transition-transform duration-300 group-hover/img:scale-105"
                />
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-black/70 px-3 py-1.5 rounded-lg border border-[#D4AF37]/40 text-[10px] font-semibold text-[#D4AF37] flex items-center gap-1.5 shadow-lg">
                    <Eye className="w-3.5 h-3.5" /> Lihat Gambar Penuh
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white leading-tight">{previewProduct.name}</h3>
                    <div className="flex items-center gap-2">
                      {isOutOfStock ? (
                        <span className="text-[9px] text-red-400 font-bold bg-red-500/20 px-2 py-0.5 rounded border border-red-500/30">
                          Habis
                        </span>
                      ) : (
                        <span
                          className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border ${previewProduct.stock <= 10
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            }`}
                        >
                          Stok: {previewProduct.stock} pcs
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-base font-mono font-black text-[#D4AF37] shrink-0">
                    {previewProduct.price > 0 
                      ? `Rp ${(previewProduct.price + (previewProduct.has_size ? getSizeSurcharge(previewSize) : 0)).toLocaleString("id-ID")}` 
                      : "Cenderamata"}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-gray-400">Deskripsi &amp; Bahan Spesifikasi:</p>
                  <p className="text-[11px] text-gray-200 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/10 whitespace-pre-line">
                    {previewProduct.description}
                  </p>
                </div>

                {/* Size Selector in Modal */}
                {!isOutOfStock && previewProduct.has_size && (
                  <div className="space-y-2 p-2.5 bg-purple-500/5 rounded-xl border border-purple-500/20">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-purple-300 flex items-center gap-1.5">
                        <Shirt className="w-3.5 h-3.5 text-purple-400 shrink-0" /> Pilih Ukuran Kaos:
                      </span>
                      <button
                        type="button"
                        onClick={() => setLightboxImage("/sizechart.jpeg")}
                        className="text-[10px] text-purple-400 hover:text-purple-300 underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Lihat Size Chart
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {SHIRT_SIZES.map((sz) => {
                        const surcharge = getSizeSurcharge(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setPreviewSize(sz)}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all border cursor-pointer ${previewSize === sz
                              ? "bg-purple-600 text-white border-purple-500 shadow ring-1 ring-purple-300"
                              : "bg-white/5 text-gray-400 hover:bg-white/10 border-white/10"
                              }`}
                          >
                            {sz}{surcharge > 0 ? ` (+${surcharge / 1000}k)` : ""}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-2.5 overflow-hidden rounded-xl border border-purple-500/10 bg-black/40">
                      <div className="p-2 border-b border-purple-500/10 text-[9px] text-gray-400 font-semibold flex justify-between items-center bg-purple-950/20">
                        <span>Pratinjau Ukuran Kaos (Size Chart)</span>
                        <button
                          type="button"
                          onClick={() => setLightboxImage("/sizechart.jpeg")}
                          className="text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-0.5 text-[9px]"
                        >
                          Perbesar 🔍
                        </button>
                      </div>
                      <div className="relative h-44 w-full cursor-zoom-in overflow-hidden" onClick={() => setLightboxImage("/sizechart.jpeg")}>
                        <Image
                          src="/sizechart.jpeg"
                          alt="Size Chart"
                          fill
                          sizes="(max-width: 768px) 100vw, 400px"
                          className="object-contain p-1"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Quantity Stepper in Modal */}
                {!isOutOfStock && (
                  <div className="flex items-center justify-between gap-4 p-2.5 bg-black/40 rounded-xl border border-white/10">
                    <span className="text-[11px] font-semibold text-gray-300">
                      Jumlah Pembelian (Pcs):
                    </span>
                    <div className="flex items-center border border-white/20 rounded-lg bg-black/60 overflow-hidden shrink-0 h-8">
                      <button
                        type="button"
                        onClick={() => setPreviewQty((q) => Math.max(1, q - 1))}
                        className="px-2.5 bg-white/5 hover:bg-white/10 text-white font-bold h-full flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 font-mono font-bold text-white text-xs h-full flex items-center justify-center min-w-[28px] text-center">
                        {previewQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPreviewQty((q) => Math.min(50, q + 1))}
                        className="px-2.5 bg-white/5 hover:bg-white/10 text-white font-bold h-full flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Show items already in cart */}
                {(() => {
                  const itemsInCart = cartItems.filter((ci) => ci.productId === previewProduct.id);
                  if (itemsInCart.length > 0) {
                    return (
                      <div className="space-y-1 p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-[10px]">
                        <div className="font-semibold text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Sudah dalam Pembelian:
                        </div>
                        <div className="space-y-0.5">
                          {itemsInCart.map((ci) => (
                            <div key={ci.cartItemId} className="flex justify-between items-center text-gray-300 pl-4">
                              <span>
                                {ci.has_size ? `Ukuran ${ci.size}` : "All Size"} x{ci.quantity} pcs
                              </span>
                              <button
                                type="button"
                                onClick={() => removeCartRow(ci.cartItemId)}
                                className="text-red-400 hover:text-red-300 hover:underline ml-2 cursor-pointer"
                              >
                                Hapus
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
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
                {isOutOfStock ? (
                  <Button
                    type="button"
                    disabled
                    className="w-2/3 bg-gray-700 text-gray-400 cursor-not-allowed text-xs font-bold"
                  >
                    Stok Habis
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleAddFromPreview}
                    className="w-2/3 bg-[#D4AF37] hover:bg-[#B3932D] text-black font-bold text-xs cursor-pointer"
                  >
                    <Check className="w-4 h-4 mr-1 inline" /> Tambahkan ke Pembelian
                  </Button>
                )}
              </div>
            </div>
          </div>,
          document.body
        ) : null;
      })()}

      {/* 2. FORM INPUT CONTAINER */}
      <div className="space-y-6 text-[#FDFBF7]">
        <div className="pb-1">
          <h2 className="text-lg sm:text-xl font-bold text-[#D4AF37] flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#D4AF37]" />
            Pembelian Merchandise
          </h2>
          <p className="text-xs text-gray-300">Isi identitas pembeli dan pilih beberapa item/ukuran souvenir di bawah ini.</p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/20 border border-red-500/40 p-4 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">


          {/* Section: Data Pembeli */}
          <div className="space-y-4 p-5 md:p-6 bg-black/45 rounded-2xl border border-white/10 shadow-lg">
            <h3 className="text-xs sm:text-sm font-bold text-[#D4AF37] border-b border-white/5 pb-2.5 flex items-center gap-1.5">
              <Church className="w-4 h-4 text-[#D4AF37]" /> Data Lengkap Pembeli
            </h3>

            {/* Field: Nama Pembeli */}
            <div className="space-y-1.5">
              <Label htmlFor="merch-name" className="text-xs font-bold text-gray-300 block">
                Nama Lengkap Pembeli *
              </Label>
              <Input
                id="merch-name"
                placeholder="Masukkan nama pembeli"
                className="bg-black/60 border-white/10 hover:border-white/20 text-white text-xs sm:text-sm h-11 focus-visible:ring-1 focus-visible:ring-[#D4AF37]/40 focus-visible:border-[#D4AF37]/40 rounded-xl transition-all"
                {...register("buyer_name")}
              />
              {errors.buyer_name && <p className="text-xs text-red-400 mt-1">{errors.buyer_name.message}</p>}
            </div>

            {/* Field: Asal Jemaat / Mupel (GPIB vs Umum) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 pb-1">
                <span className="text-xs font-bold text-gray-300">Asal Jemaat *</span>

                {/* Modern Pill Toggle */}
                <div className="flex p-0.5 bg-black/60 rounded-xl border border-white/10 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsGpibMember(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${isGpibMember
                      ? "bg-[#D4AF37] text-black shadow-md"
                      : "text-gray-400 hover:text-white"
                      }`}
                  >
                    GPIB
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsGpibMember(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${!isGpibMember
                      ? "bg-[#D4AF37] text-black shadow-md"
                      : "text-gray-400 hover:text-white"
                      }`}
                  >
                    Umum
                  </button>
                </div>
              </div>

              {isGpibMember ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Select Mupel */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-gray-400 block font-medium">Pilih Mupel GPIB:</span>
                    <div className="relative">
                      <select
                        value={selectedMupel}
                        onChange={(e) => {
                          setSelectedMupel(e.target.value);
                          setSelectedJemaat("");
                        }}
                        className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 focus:outline-none h-11 appearance-none cursor-pointer pr-10 transition-all hover:border-white/20"
                      >
                        <option value="">-- Pilih Mupel --</option>
                        {mupelList.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Select Jemaat */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-gray-400 block font-medium">Pilih Jemaat GPIB:</span>
                    <div className="relative">
                      <select
                        value={selectedJemaat}
                        disabled={!selectedMupel}
                        onChange={(e) => setSelectedJemaat(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 focus:outline-none h-11 appearance-none cursor-pointer pr-10 transition-all hover:border-white/20 disabled:opacity-50"
                      >
                        <option value="">-- Pilih Jemaat --</option>
                        {availableJemaatList.map((j) => (
                          <option key={j} value={j}>
                            {j}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <span className="text-[11px] text-gray-400 block font-medium">Nama Gereja / Instansi / Umum:</span>
                  <Input
                    value={customChurch}
                    onChange={(e) => setCustomChurch(e.target.value)}
                    placeholder="Contoh: GKI Kebayoran / Umum"
                    className="bg-black/60 border-white/10 hover:border-white/20 text-white text-xs sm:text-sm h-11 focus-visible:ring-1 focus-visible:ring-[#D4AF37]/40 focus-visible:border-[#D4AF37]/40 rounded-xl transition-all"
                  />
                </div>
              )}

              {errors.church_city && <p className="text-xs text-red-400 mt-1">{errors.church_city.message}</p>}
            </div>

            {/* Field: WhatsApp */}
            <div className="space-y-1.5">
              <Label htmlFor="merch-wa" className="text-xs font-bold text-gray-300 block">
                Nomor WhatsApp Pembeli *
              </Label>
              <Input
                id="merch-wa"
                placeholder="Contoh: 08123456789"
                className="bg-black/60 border-white/10 hover:border-white/20 text-white text-xs sm:text-sm h-11 focus-visible:ring-1 focus-visible:ring-[#D4AF37]/40 focus-visible:border-[#D4AF37]/40 rounded-xl transition-all font-mono"
                {...register("whatsapp")}
              />
              {errors.whatsapp && <p className="text-xs text-red-400 mt-1">{errors.whatsapp.message}</p>}
            </div>
          </div>

          {/* 🛍️ MULTI-ITEM SELECTION CARDS */}
          <div className="space-y-3">
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((p) => {
                  const isSelected = cartItems.some((ci) => ci.productId === p.id);
                  const countVariants = cartItems.filter((ci) => ci.productId === p.id).length;
                  const isOutOfStock = (p.stock ?? 100) <= 0;

                  return (
                    <div
                      key={p.id}
                      onClick={() => setPreviewProduct(p)}
                      className={`group relative flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer ${isOutOfStock
                        ? "border-red-500/25 bg-black/40 opacity-60 hover:border-red-500/40"
                        : isSelected
                          ? "border-[#D4AF37] bg-[#D4AF37]/5 shadow-[0_0_20px_rgba(212,175,55,0.15)] ring-1 ring-[#D4AF37]/50"
                          : "border-white/10 bg-black/40 hover:border-[#D4AF37]/40 hover:bg-black/60 shadow-lg"
                        }`}
                    >
                      {/* Floating Checkbox */}
                      <div
                        className="absolute top-2.5 left-2.5 z-20 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isOutOfStock) toggleCartProduct(p);
                        }}
                      >
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors shadow-md ${isOutOfStock
                            ? "border-gray-600 bg-gray-800"
                            : isSelected
                              ? "bg-[#D4AF37] border-[#D4AF37] text-black"
                              : "border-white/40 bg-black/60 hover:border-[#D4AF37]"
                            }`}
                        >
                          {isSelected && !isOutOfStock && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Visual Product Image */}
                      <div className="relative aspect-square w-full overflow-hidden bg-black/80 border-b border-white/5 shrink-0">
                        <Image
                          src={p.image_url}
                          alt={p.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-black/75 flex items-center justify-center text-xs font-bold text-red-400 tracking-wider">
                            HABIS
                          </div>
                        )}
                      </div>

                      {/* Details Area */}
                      <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-grow space-y-2">
                        <div className="space-y-1">
                          <h4 className="font-bold text-white text-[11px] sm:text-xs line-clamp-2 leading-snug group-hover:text-[#D4AF37] transition-colors">
                            {p.name}
                          </h4>
                          <span className="font-mono text-xs sm:text-sm text-[#D4AF37] font-black block">
                            {p.price > 0 ? `Rp ${p.price.toLocaleString("id-ID")}` : "Cenderamata"}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 border-t border-white/5">
                          <div className="flex items-center gap-1">
                            {/* Stock Badge */}
                            {isOutOfStock ? (
                              <span className="text-[9px] text-red-400 font-semibold bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                                Habis
                              </span>
                            ) : (
                              <span
                                className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded border ${p.stock <= 10
                                  ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                                  : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                                  }`}
                              >
                                {p.stock} Pcs
                              </span>
                            )}

                            {isSelected && countVariants > 1 && (
                              <span className="text-[9px] text-purple-300 font-semibold bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                                {countVariants} Var
                              </span>
                            )}
                          </div>

                          <span className="text-[9px] text-gray-400 flex items-center gap-0.5 group-hover:text-[#D4AF37] transition-colors font-medium">
                            <Info className="w-3 h-3" /> Detail
                          </span>
                        </div>
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
              <div className="flex flex-col gap-1 border-b border-white/10 pb-3">
                <h3 className="font-bold text-sm text-[#D4AF37] flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-[#D4AF37]" />
                  Rincian Keranjang
                </h3>
                <span className="text-[11px] text-gray-400 pl-6">
                  {grandTotalQty} Pcs Item Dipilih
                </span>
              </div>

              {/* Grouped Products List */}
              <div className="space-y-4 divide-y divide-white/10">
                {groupedCartByProduct.map(({ product, items }) => (
                  <div key={product.id} className="pt-4 first:pt-0 space-y-3">
                    {/* Header Product Card */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
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
                          className="w-full sm:w-auto px-3 py-2 sm:py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all"
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
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-black/40 p-3.5 rounded-xl border border-white/10 text-xs"
                        >
                          {/* Size selector if shirt */}
                          {cartItem.has_size ? (
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                                <span className="text-[11px] text-purple-300 font-semibold flex items-center gap-1 shrink-0">
                                  <Shirt className="w-3.5 h-3.5" /> Ukuran Kaos:
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setLightboxImage("/sizechart.jpeg")}
                                  className="text-[10px] text-purple-400 hover:text-purple-300 underline font-semibold flex items-center gap-0.5 ml-auto sm:hidden cursor-pointer"
                                >
                                  <Eye className="w-3 h-3" /> Size Chart
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {SHIRT_SIZES.map((sz) => {
                                  const surcharge = getSizeSurcharge(sz);
                                  return (
                                    <button
                                      key={sz}
                                      type="button"
                                      onClick={() => updateCartSize(cartItem.cartItemId, sz)}
                                      className={`px-2.5 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-mono font-bold transition-all border cursor-pointer ${cartItem.size === sz
                                        ? "bg-purple-600 text-white border-purple-500 shadow-md ring-1 ring-purple-300"
                                        : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                                        }`}
                                    >
                                      {sz}{surcharge > 0 ? ` (+${surcharge / 1000}k)` : ""}
                                    </button>
                                  );
                                })}
                              </div>
                              <button
                                type="button"
                                onClick={() => setLightboxImage("/sizechart.jpeg")}
                                className="hidden sm:inline-flex text-[10px] text-purple-400 hover:text-purple-300 underline font-semibold items-center gap-0.5 ml-1 cursor-pointer"
                              >
                                <Eye className="w-3 h-3" /> Size Chart
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-gray-400 italic">Ukuran All Size / Standar</span>
                          )}

                          {/* Quantity Stepper & Remove */}
                          <div className="flex items-center justify-between sm:justify-end gap-3.5 w-full sm:w-auto pt-3 sm:pt-0 border-t border-white/5 sm:border-t-0">
                            <div className="flex items-center border border-white/15 rounded-lg bg-black/60 overflow-hidden h-9">
                              <button
                                type="button"
                                onClick={() => updateCartQty(cartItem.cartItemId, -1)}
                                className="px-3 bg-white/5 hover:bg-white/10 text-white font-bold h-full flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-3.5 font-mono font-bold text-white text-xs h-full flex items-center justify-center min-w-[32px] text-center">
                                {cartItem.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateCartQty(cartItem.cartItemId, 1)}
                                className="px-3 bg-white/5 hover:bg-white/10 text-white font-bold h-full flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="flex items-center gap-3.5">
                              <span className="font-mono font-black text-emerald-400 text-xs min-w-[70px] text-right">
                                Rp {((cartItem.price + (cartItem.has_size ? getSizeSurcharge(cartItem.size) : 0)) * cartItem.quantity).toLocaleString("id-ID")}
                              </span>

                              <button
                                type="button"
                                onClick={() => removeCartRow(cartItem.cartItemId)}
                                className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-950/40 cursor-pointer transition-colors"
                                title="Hapus baris ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
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
                  <span className="text-gray-400 block text-[11px]">Total Pembelian:</span>
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

          {cartItems.length > 0 && (
            <div className="space-y-4 rounded-xl border border-[#D4AF37]/30 bg-black/40 p-4">
              <h3 className="text-xs font-bold text-[#D4AF37] border-b border-white/10 pb-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#D4AF37]" /> Informasi Pembayaran
              </h3>

              <div className="rounded-lg bg-[#D4AF37]/10 p-3.5 border border-[#D4AF37]/30 text-xs leading-relaxed space-y-1">
                <span className="text-gray-300 block">Silakan transfer biaya pembelian Anda ke rekening panitia:</span>
                <div className="flex items-center gap-2 my-1.5 bg-black/40 p-2 rounded w-fit border border-[#D4AF37]/20">
                  <span className="font-mono text-[#D4AF37] font-semibold text-xs">Bank BTN 00179-01-88-000447-9</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText("0017901880004479");
                      toast.success("Nomor rekening berhasil disalin!");
                    }}
                    className="p-1 hover:bg-[#D4AF37]/20 rounded text-[#D4AF37] transition-colors"
                    title="Copy Rekening"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                Atas nama: <strong>Panitia MUPEL GPIB BEKASI</strong><br />
                Total Tagihan: <strong className="text-emerald-400 font-mono">Rp {grandTotalPrice.toLocaleString("id-ID")}</strong>
              </div>

              {/* Tanggal Bayar */}
              <div className="space-y-1.5">
                <Label htmlFor="payment-date" className="text-xs font-semibold text-gray-200">
                  Tanggal Transfer *
                </Label>
                <Input
                  id="payment-date"
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="bg-black/50 border-white/20 text-white cursor-pointer"
                  style={{ colorScheme: "dark" }}
                />
              </div>

              {/* Bukti Bayar */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-200">
                  Unggah Bukti Bayar (Format: JPG, PNG, WEBP, Maks 5MB) *
                </Label>

                <input
                  type="file"
                  accept="image/*"
                  id="merch-proof-input"
                  className="hidden"
                  required={!paymentProofFile}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error("File maksimal 5MB.");
                        return;
                      }
                      setPaymentProofFile(file);
                      const reader = new FileReader();
                      reader.onload = (ev) => setPaymentProofPreview(ev.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />

                {paymentProofPreview ? (
                  <div className="relative group rounded-xl overflow-hidden border border-[#D4AF37]/40 bg-black/60 p-3.5 flex flex-col sm:flex-row items-center gap-4 animate-in fade-in duration-300">
                    <div className="relative h-24 w-24 rounded-lg overflow-hidden border border-white/10 bg-black shrink-0">
                      <img src={paymentProofPreview} alt="Bukti Transfer" className="h-full w-full object-cover" />
                    </div>
                    <div className="text-xs space-y-1.5 flex-1 w-full text-center sm:text-left">
                      <p className="font-semibold text-white">Bukti transfer terpilih:</p>
                      <p className="text-gray-400 truncate max-w-xs mx-auto sm:mx-0 font-mono text-[10px]">
                        {paymentProofFile?.name || "receipt.png"}
                      </p>
                      <div className="flex justify-center sm:justify-start gap-2 pt-1">
                        <label
                          htmlFor="merch-proof-input"
                          className="px-3 py-1.5 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#D4AF37] font-semibold rounded-lg cursor-pointer transition-all text-[10px]"
                        >
                          Ganti File
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentProofFile(null);
                            setPaymentProofPreview(null);
                          }}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold rounded-lg transition-all text-[10px] cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="merch-proof-input"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-white/15 hover:border-[#D4AF37]/50 bg-black/35 hover:bg-black/60 rounded-xl p-6 text-center cursor-pointer transition-all duration-300 group shadow-inner"
                  >
                    <div className="p-3 rounded-full bg-white/5 border border-white/10 group-hover:bg-[#D4AF37]/10 group-hover:border-[#D4AF37]/30 transition-colors mb-3">
                      <ShoppingBag className="w-6 h-6 text-gray-400 group-hover:text-[#D4AF37] transition-colors" />
                    </div>
                    <span className="text-xs font-semibold text-white group-hover:text-[#D4AF37] transition-colors">
                      Pilih Bukti Pembayaran
                    </span>
                    <span className="text-[10px] text-gray-500 mt-1 max-w-[240px] leading-normal">
                      Tekan untuk memilih gambar dari galeri/penyimpanan perangkat Anda (Format JPG, PNG, WEBP, Maks 5MB)
                    </span>
                  </label>
                )}
              </div>
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
            className="w-full bg-[#D4AF37] hover:bg-[#B3932D] text-black font-bold h-auto py-3.5 px-4 text-sm whitespace-normal rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                <span>Memproses Pembelian...</span>
              </span>
            ) : (
              <div className="flex items-center justify-between w-full sm:px-1 gap-2">
                <span className="flex items-center gap-2 text-xs sm:text-sm">
                  <Send className="w-4 h-4 shrink-0" />
                  <span>Kirim Pembelian</span>
                </span>
                <span className="bg-black/10 text-black/85 text-[10px] sm:text-xs px-2.5 py-1 rounded-lg font-mono font-black shrink-0">
                  {grandTotalQty} Pcs • Rp {grandTotalPrice.toLocaleString("id-ID")}
                </span>
              </div>
            )}
          </Button>
        </form>
      </div>

      {/* 3. FULLSCREEN IMAGE LIGHTBOX */}
      {lightboxImage && mounted && createPortal(
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md cursor-zoom-out animate-in fade-in duration-200"
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 p-2.5 rounded-full hover:bg-white/20 transition-all z-10 cursor-pointer"
            title="Tutup Preview"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative w-full h-full max-w-5xl max-h-[85vh] flex items-center justify-center select-none">
            <img
              src={lightboxImage}
              alt="Merchandise Preview Full"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
            />
          </div>
        </div>,
        document.body
      )}

      {/* 5. STATUS CHECK MODAL POPUP */}
      {isStatusModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#022c22] border border-[#D4AF37]/45 p-5 md:p-6 shadow-2xl space-y-5 text-[#FDFBF7] max-h-[85vh] overflow-y-auto relative">
            <button
              onClick={() => {
                setIsStatusModalOpen(false);
                setStatusSearchQuery("");
                setStatusLookupResults(null);
                setStatusLookupError("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1.5 pr-8 border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-[#D4AF37] flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
                Cek Status Pembelian
              </h3>
              <p className="text-[11px] text-gray-300 leading-normal">
                Masukkan nomor WhatsApp Anda atau Kode Pembelian (Contoh: 89C571) untuk mengecek status pembelian merchandise Anda.
              </p>
            </div>

            {/* Search Input Box */}
            <form onSubmit={(e) => { e.preventDefault(); handleStatusSearch(); }} className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Contoh: 08123456789 atau 89C571"
                value={statusSearchQuery}
                onChange={(e) => setStatusSearchQuery(e.target.value)}
                className="bg-black/50 text-white border-[#D4AF37]/30 py-3.5 px-4 h-11 text-xs focus-visible:ring-1 focus-visible:ring-[#D4AF37]/50 rounded-xl"
              />
              <Button
                type="submit"
                disabled={statusLookupLoading || !statusSearchQuery.trim()}
                className="bg-[#D4AF37] hover:bg-[#B3932D] text-black font-bold h-11 py-2 px-5 shrink-0 rounded-xl transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-1.5 cursor-pointer text-xs"
              >
                {statusLookupLoading ? "Mencari..." : <><Search className="w-4 h-4" /> Cari</>}
              </Button>
            </form>

            {statusLookupError && (
              <p className="text-xs text-amber-400 font-medium bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                ⚠️ {statusLookupError}
              </p>
            )}

            {/* Results Block */}
            {statusLookupResults && statusLookupResults.length > 0 && (
              <div className="space-y-6 pt-1">
                {statusLookupResults.map((order) => {
                  const isPending = order.payment_status === "pending";
                  const isVerified = order.payment_status === "verified";
                  const isRejected = order.payment_status === "rejected";
                  const orderCode = `MB-${order.id.slice(0, 6).toUpperCase()}`;

                  return (
                    <div
                      key={order.id}
                      id={`ticket-merch-${order.id}`}
                      className="rounded-xl border border-[#D4AF37]/45 bg-[#0B0904] p-4 sm:p-5 space-y-5 shadow-[0_0_20px_rgba(212,175,55,0.15)] relative overflow-hidden"
                    >
                      {/* Ticket Header */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-3.5 gap-3">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-gray-400 block mb-0.5">Kode Pembelian</span>
                          <h2 className="text-xl font-black text-[#D4AF37] font-mono tracking-wider">#{orderCode}</h2>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isPending && (
                            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2.5 py-1 rounded-full font-semibold text-[9px] uppercase tracking-wider">
                              Tercatat, Menunggu Konfirmasi
                            </span>
                          )}
                          {isVerified && (
                            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-full font-semibold text-[9px] uppercase tracking-wider">
                              Confirmed (Lunas &amp; Terverifikasi)
                            </span>
                          )}
                          {isRejected && (
                            <span className="bg-red-500/20 text-red-400 border border-red-500/40 px-2.5 py-1 rounded-full font-semibold text-[9px] uppercase tracking-wider">
                              Pembayaran Ditolak
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Details Grid (exactly matching registrations display details / cek style) */}
                      <div className="space-y-2.5 text-[11px] sm:text-xs">
                        <div className="flex justify-between py-1.5 border-b border-white/5 gap-2">
                          <span className="text-gray-400 shrink-0">Nama Pembeli:</span>
                          <span className="font-semibold text-white text-right">{order.buyer_name}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-white/5 gap-2">
                          <span className="text-gray-400 shrink-0">Asal Jemaat:</span>
                          <span className="font-semibold text-emerald-300 text-right">{order.church_city}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-white/5 gap-2">
                          <span className="text-gray-400 shrink-0">No WhatsApp:</span>
                          <span className="font-semibold text-white font-mono text-right">{order.whatsapp}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-white/5 gap-2">
                          <span className="text-gray-400 shrink-0">Tanggal Bayar:</span>
                          <span className="font-semibold text-white text-right">
                            {order.payment_date ? new Date(order.payment_date).toLocaleDateString("id-ID", { dateStyle: "long" }) : "-"}
                          </span>
                        </div>
                      </div>

                      {/* Rincian Item list */}
                      <div className="pt-2 border-t border-white/5">
                        <span className="text-gray-400 block mb-1.5 font-semibold text-[10px] uppercase tracking-wider">Rincian Item Pembelian:</span>
                        <div className="bg-black/40 p-3 rounded-lg border border-white/5 space-y-1.5 font-mono text-[10px] text-gray-200">
                          {splitItemType(order.item_type).map((item: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-1.5">
                              <span className="text-[#D4AF37] shrink-0">•</span>
                              <span className="text-white font-semibold">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {order.admin_notes && (
                        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-amber-200 italic text-[11px] leading-relaxed">
                          <strong className="text-[#D4AF37] not-italic block mb-1 font-bold">Catatan Panitia:</strong>
                          "{order.admin_notes}"
                        </div>
                      )}

                      {order.payment_status === "verified" && (
                        <div className="pt-3 border-t border-white/5 no-export">
                          <a
                            href={`/api/merch/invoice?id=${order.id}`}
                            onClick={() => {
                              toast.success("Memulai pengunduhan Invoice PDF...");
                            }}
                            className="block w-full"
                          >
                            <Button
                              type="button"
                              className="w-full bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/40 text-white font-bold text-xs h-10 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Download className="w-4 h-4" /> Unduh Invoice Resmi (PDF)
                            </Button>
                          </a>
                        </div>
                      )}

                      {/* QR Code and Save Button (Exactly styled like registration check status) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-3.5 border-t border-white/10 no-export">
                        <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl text-black space-y-1">
                          <QRCodeSVG
                            value={`${window.location.origin}/cek?merch_id=${order.id}`}
                            size={95}
                            level="H"
                          />
                          <p className="text-[9px] font-bold text-gray-600 text-center tracking-tight uppercase">Status Verifikasi</p>
                        </div>

                        <Button
                          type="button"
                          onClick={async () => {
                            const ticketEl = document.getElementById(`ticket-merch-${order.id}`);
                            if (!ticketEl) return;
                            try {
                              const dataUrl = await toPng(ticketEl, {
                                cacheBust: true,
                                backgroundColor: "#0B0904",
                                style: { transform: "scale(1)" }
                              });
                              const link = document.createElement("a");
                              link.download = `Bukti-Pembelian-Merch-${orderCode}.png`;
                              link.href = dataUrl;
                              link.click();
                              toast.success("Gambar bukti pembelian berhasil disimpan!");
                            } catch (err) {
                              console.error("Gagal menyimpan gambar:", err);
                              toast.error("Gagal menyimpan gambar bukti pembelian.");
                            }
                          }}
                          className="w-full bg-[#D4AF37] hover:bg-[#B3932D] text-black font-bold text-xs h-10 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-4 h-4" /> Simpan Gambar
                        </Button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
