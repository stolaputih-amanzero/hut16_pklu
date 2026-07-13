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

    revalidatePath("/admin/guestbook");
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

    revalidatePath("/admin/guestbook");
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

    revalidatePath("/admin/guestbook");
    revalidatePath("/ucapan");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menghapus ucapan" };
  }
}

export async function updateGuestbookMessage(formData: FormData) {
  try {
    console.log("=== updateGuestbookMessage Server Action Started ===");
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const church_city = formData.get("church_city") as string;
    const message = formData.get("message") as string;
    const avatarFile = formData.get("avatar") as File | null;
    const removeAvatar = formData.get("removeAvatar") === "true";

    console.log("Server params:", { id, name, church_city, messageLength: message?.length, removeAvatar, hasAvatarFile: !!avatarFile });

    if (!id || !name || !church_city || !message) {
      console.warn("Server validation failed: Missing fields");
      return { success: false, error: "Semua field wajib diisi." };
    }

    const updates: any = {
      name,
      church_city,
      message,
    };

    if (removeAvatar) {
      console.log("Flagged to remove avatar. Setting avatar_url to null.");
      updates.avatar_url = null;
    } else if (avatarFile && avatarFile.size > 0 && avatarFile.name !== "undefined") {
      console.log("New avatar file detected. Starting upload:", avatarFile.name, "Size:", avatarFile.size);
      const ext = avatarFile.name.split(".").pop() || "jpg";
      const fileName = `guestbook/avatar_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      
      const arrayBuffer = await avatarFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadErr } = await supabaseAdmin.storage
        .from("registrations")
        .upload(fileName, buffer, { 
          contentType: avatarFile.type || "image/jpeg", 
          upsert: true 
        });

      if (!uploadErr) {
        const { data: urlData } = supabaseAdmin.storage
          .from("registrations")
          .getPublicUrl(fileName);
        updates.avatar_url = urlData.publicUrl;
        console.log("Avatar upload successful. URL:", updates.avatar_url);
      } else {
        console.error("Upload Avatar Error:", uploadErr);
        return { success: false, error: `Gagal mengunggah foto: ${uploadErr.message}` };
      }
    }

    console.log("Sending updates to database for ID:", id, updates);
    const { error } = await supabaseAdmin
      .from("guestbook_messages")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Database update error:", error);
      return { success: false, error: error.message };
    }

    console.log("Database update successful. Revalidating paths.");
    revalidatePath("/admin/guestbook");
    revalidatePath("/ucapan");
    
    return { 
      success: true, 
      avatar_url: updates.avatar_url !== undefined ? updates.avatar_url : undefined,
      avatarRemoved: removeAvatar
    };
  } catch (err: any) {
    console.error("Uncaught exception in updateGuestbookMessage action:", err);
    return { success: false, error: err.message || "Gagal mengedit ucapan" };
  }
}
