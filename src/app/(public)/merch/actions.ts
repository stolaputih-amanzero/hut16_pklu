"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

function sanitizeText(str: string): string {
  if (!str) return "";
  return str
    .replace(/<[^>]*>?/gm, "")
    .replace(/[&<>"']/g, (m) => {
      switch (m) {
        case "&": return "&amp;";
        case "<": return "&lt;";
        case ">": return "&gt;";
        case '"': return "&quot;";
        case "'": return "&#039;";
        default: return m;
      }
    })
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
};

export async function submitMerchOrder(input: SubmitMerchInput) {
  try {
    // 1. Sanitize & Clean inputs
    const cleanName = sanitizeText(input.buyer_name || "");
    const cleanChurchCity = sanitizeText(input.church_city || "");
    const cleanWa = sanitizeText(input.whatsapp || "");
    const cleanNotes = sanitizeText(input.notes || "") || null;

    if (!cleanName || !cleanChurchCity || !cleanWa) {
      return { success: false, error: "Nama Pemesan, Asal Jemaat, dan WhatsApp wajib diisi." };
    }

    if (!input.items || input.items.length === 0) {
      return { success: false, error: "Silakan pilih minimal 1 item merchandise." };
    }

    // 2. Build multi-item summary strings
    const itemSummaries: string[] = [];
    const sizesList: string[] = [];
    let totalQty = 0;
    let totalPrice = 0;

    input.items.forEach((item) => {
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

    // 3. Insert into Supabase DB merch_orders
    const { data, error } = await supabaseAdmin
      .from("merch_orders")
      .insert({
        buyer_name: cleanName,
        church_city: cleanChurchCity,
        whatsapp: cleanWa,
        item_type: cleanItemType,
        size: cleanSize,
        quantity: totalQty,
        notes: cleanNotes,
      })
      .select()
      .single();

    if (error) {
      console.error("Insert Merch Order Error:", error);
      return { success: false, error: `Gagal menyimpan pesanan: ${error.message}` };
    }

    revalidatePath("/merch");

    return {
      success: true,
      data: {
        ...data,
        totalPrice,
        itemsList: input.items,
      },
      notice: "Pesanan Merchandise Tambahan Anda telah berhasil dicatat! Harap diingat bahwa pesanan ini TERPISAH dari paket kontribusi pendaftaran acara Anda.",
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Terjadi kesalahan server" };
  }
}
