"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// Helper to extract code or merch_id from scanned URLs or return original string
function parseScannedInput(input: string): { type: "code" | "merch_id" | "generic"; value: string } {
  const cleanInput = (input || "").trim();
  if (!cleanInput) return { type: "generic", value: "" };

  try {
    // Check if it's a URL
    if (cleanInput.startsWith("http://") || cleanInput.startsWith("https://")) {
      const url = new URL(cleanInput);
      const code = url.searchParams.get("code");
      if (code) {
        return { type: "code", value: code.trim() };
      }
      const merchId = url.searchParams.get("merch_id");
      if (merchId) {
        return { type: "merch_id", value: merchId.trim() };
      }
    }
  } catch (e) {
    // Fail-safe, treat as plain text search
  }

  // Check if it looks like a registration code directly
  if (/^PKLU-[A-Z0-9]+$/i.test(cleanInput)) {
    return { type: "code", value: cleanInput.toUpperCase() };
  }

  // Check if it looks like a UUID (merch order id)
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanInput)) {
    return { type: "merch_id", value: cleanInput.toLowerCase() };
  }

  return { type: "generic", value: cleanInput };
}

export async function fetchCheckInData(searchQuery: string) {
  try {
    const parsed = parseScannedInput(searchQuery);
    
    let registrations: any[] = [];
    let merchOrders: any[] = [];

    if (parsed.type === "code") {
      // Direct registration code search
      const { data: regData, error: regErr } = await supabaseAdmin
        .from("registrations")
        .select("*")
        .eq("registration_code", parsed.value);

      if (regErr) throw regErr;
      registrations = regData || [];

      // Also search merch orders linked to this registration code
      const { data: merchData, error: merchErr } = await supabaseAdmin
        .from("merch_orders")
        .select("*")
        .eq("registration_code", parsed.value);

      if (merchErr) throw merchErr;
      merchOrders = merchData || [];

    } else if (parsed.type === "merch_id") {
      // Direct merch order UUID search
      const { data: merchData, error: merchErr } = await supabaseAdmin
        .from("merch_orders")
        .select("*")
        .eq("id", parsed.value);

      if (merchErr) throw merchErr;
      merchOrders = merchData || [];

      // If we found a merch order and it has a registration code, fetch that registration
      if (merchOrders.length > 0 && merchOrders[0].registration_code) {
        const { data: regData, error: regErr } = await supabaseAdmin
          .from("registrations")
          .select("*")
          .eq("registration_code", merchOrders[0].registration_code);

        if (regErr) throw regErr;
        registrations = regData || [];
      }

    } else {
      // Generic query search (by name, pic, whatsapp, church, etc.)
      const q = `%${parsed.value}%`;
      const qLower = parsed.value.toLowerCase();

      // Search registrations
      let regQuery = supabaseAdmin.from("registrations").select("*");
      if (parsed.value) {
        regQuery = regQuery.or(
          `full_name.ilike.${q},pic_name.ilike.${q},whatsapp_number.like.${q},church_name.ilike.${q},mupel.ilike.${q},registration_code.ilike.${q}`
        );
      }
      const { data: regData, error: regErr } = await regQuery.order("created_at", { ascending: false });
      if (regErr) throw regErr;
      registrations = regData || [];

      // Search merch orders
      let merchQuery = supabaseAdmin.from("merch_orders").select("*");
      if (parsed.value) {
        merchQuery = merchQuery.or(
          `buyer_name.ilike.${q},whatsapp.like.${q},registration_code.ilike.${q},item_type.ilike.${q},church_city.ilike.${q}`
        );
      }
      const { data: merchData, error: merchErr } = await merchQuery.order("created_at", { ascending: false });
      if (merchErr) throw merchErr;
      merchOrders = merchData || [];
    }

    return { success: true, registrations, merchOrders };
  } catch (err: any) {
    console.error("fetchCheckInData error:", err);
    return { success: false, error: err.message || "Gagal memuat data" };
  }
}

export async function submitCheckIn(
  id: string,
  participants: number,
  companions: number
) {
  try {
    if (!id) return { success: false, error: "ID Registrasi tidak valid" };

    const { data, error } = await supabaseAdmin
      .from("registrations")
      .update({
        checked_in: true,
        checked_in_at: new Date().toISOString(),
        checked_in_participants: participants,
        checked_in_companions: companions,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/checkin");
    return { success: true, data };
  } catch (err: any) {
    console.error("submitCheckIn error:", err);
    return { success: false, error: err.message || "Gagal melakukan cek in" };
  }
}

export async function undoCheckIn(id: string) {
  try {
    if (!id) return { success: false, error: "ID Registrasi tidak valid" };

    const { data, error } = await supabaseAdmin
      .from("registrations")
      .update({
        checked_in: false,
        checked_in_at: null,
        checked_in_participants: 0,
        checked_in_companions: 0,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/checkin");
    return { success: true, data };
  } catch (err: any) {
    console.error("undoCheckIn error:", err);
    return { success: false, error: err.message || "Gagal membatalkan cek in" };
  }
}

export async function submitMerchCollection(id: string) {
  try {
    if (!id) return { success: false, error: "ID Pembelian tidak valid" };

    const { data, error } = await supabaseAdmin
      .from("merch_orders")
      .update({
        merch_collected: true,
        collected_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/checkin");
    return { success: true, data };
  } catch (err: any) {
    console.error("submitMerchCollection error:", err);
    return { success: false, error: err.message || "Gagal mencatat pengambilan" };
  }
}

export async function undoMerchCollection(id: string) {
  try {
    if (!id) return { success: false, error: "ID Pembelian tidak valid" };

    const { data, error } = await supabaseAdmin
      .from("merch_orders")
      .update({
        merch_collected: false,
        collected_at: null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/checkin");
    return { success: true, data };
  } catch (err: any) {
    console.error("undoMerchCollection error:", err);
    return { success: false, error: err.message || "Gagal membatalkan pengambilan" };
  }
}

export async function getCheckedInList() {
  try {
    const { data, error } = await supabaseAdmin
      .from("registrations")
      .select("*")
      .eq("checked_in", true)
      .order("checked_in_at", { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err: any) {
    console.error("getCheckedInList error:", err);
    return { success: false, error: err.message || "Gagal mengambil daftar hadir" };
  }
}

export async function getCollectedMerchList() {
  try {
    const { data, error } = await supabaseAdmin
      .from("merch_orders")
      .select("*")
      .eq("merch_collected", true)
      .order("collected_at", { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err: any) {
    console.error("getCollectedMerchList error:", err);
    return { success: false, error: err.message || "Gagal mengambil daftar pengambilan souvenir" };
  }
}
