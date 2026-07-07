"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

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
      return { success: false, error: "Nama Pemesan, Asal Jemaat, dan WhatsApp wajib diisi." };
    }

    if (!paymentProofFile || paymentProofFile.size === 0 || paymentProofFile.name === "undefined") {
      return { success: false, error: "Bukti bayar wajib diunggah." };
    }

    const items: CartItemInput[] = JSON.parse(itemsJson);
    if (!items || items.length === 0) {
      return { success: false, error: "Silakan pilih minimal 1 item merchandise." };
    }

    // 2. Build multi-item summary strings
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

    const cleanItemType = itemSummaries.join(", ");
    const cleanSize = sizesList.length > 0 ? sizesList.join("; ") : null;

    // 3. Upload Payment Proof
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

    // 4. Insert into Supabase DB merch_orders
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
      return { success: false, error: `Gagal menyimpan pesanan: ${error.message}` };
    }

    revalidatePath("/merch");
    revalidatePath("/admin/merch");

    return {
      success: true,
      data: {
        ...data,
        totalPrice,
        itemsList: items,
      },
      notice: "Pesanan Merchandise Tambahan Anda telah berhasil dicatat! Harap diingat bahwa pesanan ini TERPISAH dari paket pendaftaran acara Anda.",
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Terjadi kesalahan server" };
  }
}

export async function getMerchOrderByCodeOrWa(query: string) {
  try {
    const clean = query.trim();
    if (!clean) return { success: false, data: [] };

    let queryBuilder = supabaseAdmin
      .from("merch_orders")
      .select("*");

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean);

    if (isUuid) {
      queryBuilder = queryBuilder.eq("id", clean);
    } else {
      queryBuilder = queryBuilder.or(`registration_code.ilike.${clean},whatsapp.eq.${clean}`);
    }

    const { data, error } = await queryBuilder.order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch Merch Order Error:", error);
      return { success: false, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, data: [] };
  }
}
