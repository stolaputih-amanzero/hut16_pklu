"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function fetchAdminGuestbookMessages() {
  try {
    const { data, error } = await supabaseAdmin
      .from("guestbook_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch Admin Guestbook Error:", error);
      return { success: false, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (err: any) {
    return { success: false, data: [] };
  }
}

export async function approveGuestbookMessage(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from("guestbook_messages")
      .update({ is_approved: true })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin-ucapan");
    revalidatePath("/ucapan");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menyetujui ucapan" };
  }
}

export async function unapproveGuestbookMessage(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from("guestbook_messages")
      .update({ is_approved: false })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin-ucapan");
    revalidatePath("/ucapan");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal membatalkan persetujuan" };
  }
}

export async function deleteGuestbookMessage(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from("guestbook_messages")
      .delete()
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin-ucapan");
    revalidatePath("/ucapan");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menghapus ucapan" };
  }
}
