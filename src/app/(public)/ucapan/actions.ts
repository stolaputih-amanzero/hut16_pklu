"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

function sanitizeText(str: string): string {
  if (!str) return "";
  return str
    .replace(/<[^>]*>?/gm, "")
    .trim();
}


async function ensureBucket() {
  try {
    await supabaseAdmin.storage.createBucket("registrations", {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
    });
  } catch (err) {
    // Bucket already exists
  }
}

export async function submitGuestbookMessage(formData: FormData) {
  try {
    await ensureBucket();

    // 1. Honeypot check
    const hp_website = (formData.get("hp_website") as string) || "";
    if (hp_website.length > 0) {
      console.log("Spam bot detected via honeypot field");
      return { success: true, data: null };
    }

    // 2. Extract & Sanitize inputs
    const rawName = (formData.get("name") as string) || "";
    const rawChurchCity = (formData.get("church_city") as string) || "";
    const rawMessage = (formData.get("message") as string) || "";
    const avatarFile = formData.get("avatar") as File | null;

    const cleanName = sanitizeText(rawName);
    const cleanChurchCity = sanitizeText(rawChurchCity);
    const cleanMessage = sanitizeText(rawMessage);

    if (!cleanName || !cleanChurchCity || !cleanMessage) {
      return { success: false, error: "Semua field wajib diisi." };
    }

    if (cleanMessage.length > 300) {
      return { success: false, error: "Ucapan maksimal 300 karakter." };
    }

    // 3. Upload avatar image if provided
    let avatar_url: string | null = null;

    if (avatarFile && avatarFile.size > 0 && avatarFile.name !== "undefined") {
      try {
        const ext = avatarFile.name.split(".").pop() || "jpg";
        const fileName = `guestbook/avatar_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
        
        // Convert Web File to Node Buffer for reliable Supabase Storage upload
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
          avatar_url = urlData.publicUrl;
        } else {
          console.error("Upload Avatar Error:", uploadErr);
        }
      } catch (errUpload) {
        console.error("Exception uploading avatar:", errUpload);
      }
    }

    // 4. Insert into Supabase DB
    const { data, error } = await supabaseAdmin
      .from("guestbook_messages")
      .insert({
        name: cleanName,
        church_city: cleanChurchCity,
        message: cleanMessage,
        avatar_url,
        is_approved: false, // Default false, pending admin review
      })
      .select()
      .single();

    if (error) {
      console.error("Insert Guestbook Error:", error);
      return { success: false, error: `Gagal mengirim ucapan: ${error.message}` };
    }

    // 5. Revalidate cache
    revalidatePath("/ucapan");
    revalidatePath("/admin/guestbook");

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || "Terjadi kesalahan server" };
  }
}

export async function getApprovedMessagesAction(offset: number, limit = 20) {
  try {
    const { data, error, count } = await supabaseAdmin
      .from("guestbook_messages")
      .select("*", { count: "exact" })
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching more messages:", error);
      return { success: false, messages: [], totalCount: 0 };
    }

    return { 
      success: true, 
      messages: data || [], 
      totalCount: count || 0,
      hasMore: offset + (data?.length || 0) < (count || 0)
    };
  } catch (err: any) {
    return { success: false, messages: [], totalCount: 0, hasMore: false };
  }
}
