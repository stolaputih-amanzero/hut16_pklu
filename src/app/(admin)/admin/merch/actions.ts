"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function ensureBucket() {
  try {
    await supabaseAdmin.storage.createBucket("registrations", {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
    });
  } catch (err) {
    // ignore if exists
  }
}

export async function fetchMerchProducts(onlyActive = false) {
  try {
    let query = supabaseAdmin.from("merch_products").select("*").order("created_at", { ascending: true });
    if (onlyActive) {
      query = query.eq("is_active", true);
    }
    const { data, error } = await query;
    if (error) {
      console.error("Fetch merch products error:", error);
      return { success: false, data: [] };
    }
    const cleaned = (data || []).map((p: any) => ({
      ...p,
      name: p.name
        ?.replaceAll("&amp;", "&")
        .replaceAll("Pouch & Goodie Bag Edisi Spesial", "Pouch & Bag Edisi Spesial")
        .replaceAll("Pouch & Googie Bag Edisi Spesial", "Pouch & Bag Edisi Spesial"),
      description: p.description?.replaceAll("&amp;", "&"),
    }));
    return { success: true, data: cleaned };
  } catch (err) {
    return { success: false, data: [] };
  }
}

export async function saveMerchProduct(formData: FormData) {
  try {
    await ensureBucket();

    const id = (formData.get("id") as string) || null;
    const name = (formData.get("name") as string) || "";
    const description = (formData.get("description") as string) || "";
    const price = parseInt((formData.get("price") as string) || "0");
    const stock = parseInt((formData.get("stock") as string) || "100");
    const has_size = formData.get("has_size") === "true";
    const is_active = formData.get("is_active") === "true";
    const imageFile = formData.get("image") as File | null;
    let image_url = (formData.get("existing_image_url") as string) || "";

    if (!name || !description) {
      return { success: false, error: "Nama dan Deskripsi Produk wajib diisi." };
    }

    // Handle Image Upload if new file provided
    if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
      const ext = imageFile.name.split(".").pop() || "jpg";
      const fileName = `merch/product_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadErr } = await supabaseAdmin.storage
        .from("registrations")
        .upload(fileName, buffer, { contentType: imageFile.type || "image/jpeg", upsert: true });

      if (!uploadErr) {
        const { data: urlData } = supabaseAdmin.storage
          .from("registrations")
          .getPublicUrl(fileName);
        image_url = urlData.publicUrl;
      } else {
        console.error("Upload Product Image Error:", uploadErr);
      }
    }

    if (!image_url) {
      image_url = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80";
    }

    const payload = {
      name,
      description,
      price,
      stock: Math.max(0, stock),
      has_size,
      is_active,
      image_url,
    };

    let result;
    if (id) {
      result = await supabaseAdmin
        .from("merch_products")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
    } else {
      result = await supabaseAdmin
        .from("merch_products")
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    revalidatePath("/merch");
    revalidatePath("/admin/merch");

    return { success: true, data: result.data };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menyimpan produk." };
  }
}

export async function deleteMerchProduct(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from("merch_products")
      .delete()
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/merch");
    revalidatePath("/admin/merch");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menghapus produk." };
  }
}

export async function fetchMerchOrders() {
  try {
    const { data, error } = await supabaseAdmin
      .from("merch_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch merch orders error:", error);
      return { success: false, data: [] };
    }
    const cleaned = (data || []).map((o: any) => ({
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
    return { success: true, data: cleaned };
  } catch (err) {
    return { success: false, data: [] };
  }
}

export async function deleteMerchOrder(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from("merch_orders")
      .delete()
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/merch");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menghapus pesanan." };
  }
}

export async function updateMerchOrderStatus(id: string, status: string, notes: string) {
  try {
    const cleanStatus = (status || "").trim();
    const cleanNotes = (notes || "").trim() || null;

    if (!id) return { success: false, error: "ID pesanan tidak valid." };
    if (!["pending", "verified", "rejected"].includes(cleanStatus)) {
      return { success: false, error: "Status pembayaran tidak valid." };
    }

    const { data, error } = await supabaseAdmin
      .from("merch_orders")
      .update({
        payment_status: cleanStatus,
        admin_notes: cleanNotes,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update Merch Order Status Error:", error);
      return { success: false, error: `Gagal mengupdate pesanan: ${error.message}` };
    }

    revalidatePath("/admin/merch");
    revalidatePath("/merch");
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || "Terjadi kesalahan server" };
  }
}
