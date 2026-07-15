"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getAllRegistrations() {
  try {
    const { data, error } = await supabaseAdmin
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching registrations:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message || "Terjadi kesalahan" };
  }
}

export async function deleteRegistration(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from("registrations")
      .delete()
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menghapus data" };
  }
}

export async function updateRegistrationPaymentStatus(id: string, status: "pending" | "verified") {
  try {
    const { error } = await supabaseAdmin
      .from("registrations")
      .update({ payment_status: status })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal memperbarui status pembayaran" };
  }
}

