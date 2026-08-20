"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { DEFAULT_SIZES, parseOrderItemType, parseSizeStocks, serializeSizeStocksToArray, SizeStockMap } from "@/lib/utils";

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
    const masterSizedProduct = (data || []).find(
      (p: any) => p.has_size && Array.isArray(p.available_sizes) && p.available_sizes.some((s: string) => typeof s === "string" && s.includes(":"))
    );
    const masterSizeStocks = masterSizedProduct
      ? parseSizeStocks(masterSizedProduct.available_sizes, masterSizedProduct.stock, (masterSizedProduct as any).size_stocks)
      : null;
    const masterTotalStock = masterSizeStocks
      ? Object.values(masterSizeStocks).reduce((a, b) => a + b, 0)
      : null;

    const cleaned = (data || []).map((p: any) => {
      let sizeStocks = {};
      let finalStock = p.stock;
      if (p.has_size) {
        if (masterSizeStocks) {
          sizeStocks = { ...masterSizeStocks };
          finalStock = masterTotalStock ?? p.stock;
        } else {
          sizeStocks = parseSizeStocks(p.available_sizes, p.stock, (p as any).size_stocks);
        }
      }
      return {
        ...p,
        stock: finalStock,
        name: p.name
          ?.replaceAll("&amp;", "&")
          .replaceAll("Pouch & Goodie Bag Edisi Spesial", "Pouch & Bag Edisi Spesial")
          .replaceAll("Pouch & Googie Bag Edisi Spesial", "Pouch & Bag Edisi Spesial"),
        description: p.description?.replaceAll("&amp;", "&"),
        size_stocks: sizeStocks,
      };
    });
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
    const size_stocks_raw = (formData.get("size_stocks") as string) || "{}";
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

    let finalStock = Math.max(0, stock);
    let available_sizes: string[] = [];

    if (has_size) {
      try {
        const parsedSizes = JSON.parse(size_stocks_raw) as SizeStockMap;
        const cleanSizeStocks: SizeStockMap = {};
        let computedTotal = 0;
        DEFAULT_SIZES.forEach((sz) => {
          const qty = Math.max(0, parseInt(String(parsedSizes[sz] ?? 0), 10) || 0);
          cleanSizeStocks[sz] = qty;
          computedTotal += qty;
        });
        finalStock = computedTotal;
        available_sizes = serializeSizeStocksToArray(cleanSizeStocks);
      } catch (e) {
        // Fallback to distribute stock
        available_sizes = DEFAULT_SIZES.map(sz => `${sz}:${Math.max(0, Math.floor(finalStock / DEFAULT_SIZES.length))}`);
      }
    }

    const payload: any = {
      name,
      description,
      price,
      stock: finalStock,
      has_size,
      available_sizes,
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

    // If has_size is true, synchronize size stocks to all other shirt/bundling products
    if (has_size) {
      const { data: otherSizedProducts } = await supabaseAdmin
        .from("merch_products")
        .select("id")
        .eq("has_size", true)
        .neq("id", result.data?.id || id);

      if (otherSizedProducts && otherSizedProducts.length > 0) {
        for (const op of otherSizedProducts) {
          await supabaseAdmin
            .from("merch_products")
            .update({
              stock: finalStock,
              available_sizes,
            })
            .eq("id", op.id);
        }
      }
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

export async function adjustProductStockFromItems(orderItemTypeStr: string, mode: "deduct" | "restore") {
  try {
    if (!orderItemTypeStr) return;
    const parsedItems = parseOrderItemType(orderItemTypeStr);
    if (!parsedItems || parsedItems.length === 0) return;

    const { data: allProducts } = await supabaseAdmin.from("merch_products").select("*");
    if (!allProducts || allProducts.length === 0) return;

    for (const item of parsedItems) {
      const cleanItemName = item.name.toLowerCase().trim();
      const product = allProducts.find(
        (p) => p.name.toLowerCase().trim() === cleanItemName
      );

      if (!product) continue;

      if (product.has_size && item.size) {
        const cleanSize = item.size.trim().toUpperCase();
        const currentSizeStocks = parseSizeStocks(product.available_sizes, product.stock, (product as any).size_stocks);

        if (mode === "deduct") {
          currentSizeStocks[cleanSize] = Math.max(0, (currentSizeStocks[cleanSize] || 0) - item.quantity);
        } else {
          currentSizeStocks[cleanSize] = (currentSizeStocks[cleanSize] || 0) + item.quantity;
        }

        const newStock = Object.values(currentSizeStocks).reduce((a, b) => a + b, 0);
        const newAvailableSizes = serializeSizeStocksToArray(currentSizeStocks);

        // Sync size stock across all shirt & bundling products with has_size = true
        const { data: allSizedProducts } = await supabaseAdmin
          .from("merch_products")
          .select("id")
          .eq("has_size", true);

        const targetList = allSizedProducts && allSizedProducts.length > 0 ? allSizedProducts : [{ id: product.id }];
        for (const sp of targetList) {
          await supabaseAdmin
            .from("merch_products")
            .update({
              stock: newStock,
              available_sizes: newAvailableSizes,
            })
            .eq("id", sp.id);
        }
      } else {
        let newStock = product.stock || 0;
        if (mode === "deduct") {
          newStock = Math.max(0, newStock - item.quantity);
        } else {
          newStock = newStock + item.quantity;
        }

        await supabaseAdmin
          .from("merch_products")
          .update({ stock: newStock })
          .eq("id", product.id);
      }
    }
  } catch (err) {
    console.error("Error in adjustProductStockFromItems:", err);
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
    const { data: order, error: fetchErr } = await supabaseAdmin
      .from("merch_orders")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr) return { success: false, error: fetchErr.message };
    if (!order) return { success: false, error: "Pesanan tidak ditemukan." };

    // If order was not rejected, rollback stock on deletion
    if (order.payment_status !== "rejected" && order.item_type) {
      await adjustProductStockFromItems(order.item_type, "restore");
    }

    const { error } = await supabaseAdmin
      .from("merch_orders")
      .delete()
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/merch");
    revalidatePath("/merch");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menghapus pembelian." };
  }
}

export async function updateMerchOrderStatus(id: string, status: string, notes: string) {
  try {
    const cleanStatus = (status || "").trim();
    const cleanNotes = (notes || "").trim() || null;

    if (!id) return { success: false, error: "ID pembelian tidak valid." };
    if (!["pending", "verified", "rejected"].includes(cleanStatus)) {
      return { success: false, error: "Status pembayaran tidak valid." };
    }

    const { data: existingOrder, error: fetchErr } = await supabaseAdmin
      .from("merch_orders")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr || !existingOrder) {
      return { success: false, error: "Data pesanan tidak ditemukan." };
    }

    const prevStatus = existingOrder.payment_status || "pending";

    // If changing to 'rejected' from non-rejected: RESTORE stock
    if (prevStatus !== "rejected" && cleanStatus === "rejected") {
      if (existingOrder.item_type) {
        await adjustProductStockFromItems(existingOrder.item_type, "restore");
      }
    }
    // If changing FROM 'rejected' to non-rejected: DEDUCT stock again
    else if (prevStatus === "rejected" && cleanStatus !== "rejected") {
      if (existingOrder.item_type) {
        await adjustProductStockFromItems(existingOrder.item_type, "deduct");
      }
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
      return { success: false, error: `Gagal mengupdate pembelian: ${error.message}` };
    }

    revalidatePath("/admin/merch");
    revalidatePath("/merch");
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || "Terjadi kesalahan server" };
  }
}

