"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { parseSizeStocks, serializeSizeStocksToArray } from "@/lib/utils";
import { adjustProductStockFromItems } from "@/app/(admin)/admin/merch/actions";

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch (e) {
    // Ignore in non-request contexts
  }
}

function sanitizeText(str: string): string {
  if (!str) return "";
  return str
    .replace(/<[^>]*>?/gm, "")
    .trim();
}



export async function lookupRegistrationForMerch(code: string) {
  try {
    const cleanCode = (code || "").trim().toUpperCase();
    if (!cleanCode) return { success: false };

    const { data, error } = await supabaseAdmin
      .from("registrations")
      .select("id, registration_code, full_name, name, contact_person_name, leader_name, pic_name, whatsapp_number, church_name, mupel")
      .eq("registration_code", cleanCode)
      .maybeSingle();

    if (error || !data) {
      return { success: false };
    }

    const name = data.name || data.full_name || data.contact_person_name || data.leader_name || data.pic_name || "";
    return {
      success: true,
      data: {
        name,
        whatsapp: data.whatsapp_number || "",
        church_name: data.church_name || "",
        mupel: data.mupel || "",
      },
    };
  } catch (err) {
    return { success: false };
  }
}

export type CartItemInput = {
  productId?: string;
  name: string;
  price: number;
  size?: string;
  quantity: number;
};

export type SubmitMerchInput = {
  buyer_name: string;
  church_city: string;
  whatsapp: string;
  items: CartItemInput[];
  notes?: string;
  registration_code?: string;
  payment_date?: string;
};

export async function submitMerchOrder(formData: FormData) {
  try {
    // 1. Extract inputs
    const buyer_name = (formData.get("buyer_name") as string) || "";
    const church_city = (formData.get("church_city") as string) || "";
    const whatsapp = (formData.get("whatsapp") as string) || "";
    const registration_code = (formData.get("registration_code") as string) || null;
    const itemsJson = (formData.get("items") as string) || "[]";
    const notes = (formData.get("notes") as string) || "";
    const payment_date = (formData.get("payment_date") as string) || "";
    const paymentProofFile = formData.get("payment_proof") as File | null;

    // Sanitize & Clean inputs
    const cleanName = sanitizeText(buyer_name);
    const cleanChurchCity = sanitizeText(church_city);
    const cleanWa = sanitizeText(whatsapp);
    const cleanNotes = sanitizeText(notes) || null;
    const cleanRegCode = registration_code ? sanitizeText(registration_code) : null;
    const cleanPaymentDate = payment_date ? sanitizeText(payment_date) : null;

    if (!cleanName || !cleanChurchCity || !cleanWa) {
      return { success: false, error: "Nama Pembeli, Asal Jemaat, dan WhatsApp wajib diisi." };
    }

    if (!paymentProofFile || paymentProofFile.size === 0 || paymentProofFile.name === "undefined") {
      return { success: false, error: "Bukti bayar wajib diunggah." };
    }

    const items: CartItemInput[] = JSON.parse(itemsJson);
    if (!items || items.length === 0) {
      return { success: false, error: "Silakan pilih minimal 1 item merchandise." };
    }

    // 2. Fetch active products for strict stock validation
    const { data: allProducts, error: prodErr } = await supabaseAdmin
      .from("merch_products")
      .select("*")
      .eq("is_active", true);

    if (prodErr || !allProducts) {
      return { success: false, error: "Gagal memverifikasi stok merchandise." };
    }

    // 3. Validate stock availability for each item
    for (const item of items) {
      const cleanItemName = sanitizeText(item.name).toLowerCase().trim();
      const product = allProducts.find(
        (p) => (item.productId && p.id === item.productId) || p.name.toLowerCase().trim() === cleanItemName
      );

      if (!product) {
        return { success: false, error: `Produk "${item.name}" tidak ditemukan atau sudah tidak aktif.` };
      }

      const q = Math.max(1, Math.min(50, item.quantity || 1));

      if (product.has_size) {
        if (!item.size) {
          return { success: false, error: `Ukuran untuk produk "${product.name}" wajib dipilih.` };
        }
        const cleanSize = item.size.trim().toUpperCase();
        const sizeStocks = parseSizeStocks(product.available_sizes, product.stock, (product as any).size_stocks);
        const availableForSize = sizeStocks[cleanSize] ?? 0;

        if (availableForSize <= 0) {
          return { success: false, error: `Maaf, stok "${product.name}" untuk ukuran ${cleanSize} saat ini telah habis.` };
        }
        if (availableForSize < q) {
          return { success: false, error: `Maaf, stok "${product.name}" ukuran ${cleanSize} hanya tersisa ${availableForSize} pcs (Anda memesan ${q} pcs).` };
        }
      } else {
        const availableStock = product.stock ?? 0;
        if (availableStock <= 0) {
          return { success: false, error: `Maaf, stok untuk "${product.name}" saat ini telah habis.` };
        }
        if (availableStock < q) {
          return { success: false, error: `Maaf, stok "${product.name}" hanya tersisa ${availableStock} pcs (Anda memesan ${q} pcs).` };
        }
      }
    }

    // 4. Build multi-item summary strings
    const itemSummaries: string[] = [];
    const sizesList: string[] = [];
    let totalQty = 0;
    let totalPrice = 0;

    items.forEach((item) => {
      const q = Math.max(1, Math.min(50, item.quantity || 1));
      totalQty += q;
      totalPrice += (item.price || 0) * q;

      const sizeStr = item.size ? ` (Ukuran ${item.size})` : "";
      itemSummaries.push(`${sanitizeText(item.name)}${sizeStr} x${q}`);

      if (item.size) {
        sizesList.push(`${sanitizeText(item.name)}: ${item.size}`);
      }
    });

    const cleanItemType = itemSummaries.join("; ");
    const cleanSize = sizesList.length > 0 ? sizesList.join("; ") : null;

    // 5. Upload Payment Proof
    let payment_proof_url: string | null = null;
    try {
      const ext = paymentProofFile.name.split(".").pop() || "jpg";
      const fileName = `merch_receipts/receipt_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

      const arrayBuffer = await paymentProofFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadErr } = await supabaseAdmin.storage
        .from("registrations")
        .upload(fileName, buffer, {
          contentType: paymentProofFile.type || "image/jpeg",
          upsert: true,
        });

      if (!uploadErr) {
        const { data: urlData } = supabaseAdmin.storage
          .from("registrations")
          .getPublicUrl(fileName);
        payment_proof_url = urlData.publicUrl;
      } else {
        console.error("Upload receipt error:", uploadErr);
        return { success: false, error: `Gagal mengunggah bukti bayar: ${uploadErr.message}` };
      }
    } catch (errUpload) {
      console.error("Exception uploading receipt:", errUpload);
      return { success: false, error: "Terjadi kesalahan saat mengunggah bukti bayar." };
    }

    // 6. Deduct stocks across individual items and bundles
    await adjustProductStockFromItems(cleanItemType, "deduct");

    // 7. Insert into Supabase DB merch_orders
    const { data, error } = await supabaseAdmin
      .from("merch_orders")
      .insert({
        buyer_name: cleanName,
        church_city: cleanChurchCity,
        whatsapp: cleanWa,
        registration_code: cleanRegCode,
        item_type: cleanItemType,
        size: cleanSize,
        quantity: totalQty,
        notes: cleanNotes,
        payment_proof_url,
        payment_status: "pending",
        payment_date: cleanPaymentDate,
      })
      .select()
      .single();

    if (error) {
      console.error("Insert Merch Order Error:", error);
      // Rollback stocks on insert failure
      await adjustProductStockFromItems(cleanItemType, "restore");
      return { success: false, error: `Gagal menyimpan pembelian: ${error.message}` };
    }

    safeRevalidate("/merch");
    safeRevalidate("/admin/merch");

    return {
      success: true,
      data: {
        id: data.id,
        buyer_name: data.buyer_name,
        church_city: data.church_city,
        item_type: data.item_type,
        size: data.size,
        quantity: data.quantity,
        whatsapp: data.whatsapp,
        payment_proof_url: data.payment_proof_url,
      },
      notice: "Pembelian Merchandise Tambahan Anda telah berhasil dicatat! Harap diingat bahwa pembelian ini TERPISAH dari paket pendaftaran acara Anda.",
    };
  } catch (err: any) {
    console.error("submitMerchOrder critical error:", err);
    return {
      success: false,
      error: err.message || "Terjadi kesalahan sistem saat memproses pesanan.",
      notice: undefined,
    };
  }
}

export async function getMerchOrderByCodeOrWa(query: string) {
  try {
    const clean = query.trim().toUpperCase();
    if (!clean) return { success: false, data: [] };

    const { data: allOrders, error } = await supabaseAdmin
      .from("merch_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch Merch Order Error:", error);
      return { success: false, data: [] };
    }

    const cleanQuery = clean.replace("#", "").replace("MB-", "");

    const filtered = (allOrders || []).filter((order) => {
      const orderIdShort = order.id.slice(0, 6).toUpperCase();
      const orderIdFull = order.id.toUpperCase();
      const matchesId = orderIdShort === cleanQuery || orderIdFull === cleanQuery;

      const matchesWa = order.whatsapp === cleanQuery || (order.whatsapp || "").replace(/^0/, "62") === cleanQuery;
      const matchesRegCode = order.registration_code?.toUpperCase() === cleanQuery;

      return matchesId || matchesWa || matchesRegCode;
    });

    return { success: true, data: filtered };
  } catch (err) {
    return { success: false, data: [] };
  }
}
