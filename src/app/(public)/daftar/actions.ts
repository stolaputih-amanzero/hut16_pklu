"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";

function generateRegistrationCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // tanpa O, 0, 1, I
  let randomStr = "";
  for (let i = 0; i < 5; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PKLU-${randomStr}`;
}

async function ensureBucket() {
  try {
    await supabaseAdmin.storage.createBucket("registrations", {
      public: true,
      fileSizeLimit: 2 * 1024 * 1024, // 2MB
    });
  } catch (err) {
    // Ignore error if bucket already exists
  }
}

const IS_REGISTRATION_OPEN = false;

export async function submitRegistration(formData: FormData) {
  if (!IS_REGISTRATION_OPEN) {
    return {
      success: false,
      error: "Mohon maaf, pendaftaran peserta telah ditutup karena kuota kapasitas telah terpenuhi. Silakan hubungi Humas/Panitia untuk informasi lebih lanjut.",
    };
  }

  try {
    await ensureBucket();

    const registration_mode = formData.get("registration_mode") as string;
    const category = formData.get("category") as string;
    const mupel = formData.get("mupel") as string;
    const church_name = formData.get("church_name") as string;
    const whatsapp_number = formData.get("whatsapp_number") as string;

    const proofFile = formData.get("proof_of_transfer") as File | null;
    const assignmentFile = formData.get("assignment_letter") as File | null;
    const listFile = formData.get("participant_list") as File | null;

    if (category !== "Tuan Rumah" && (!proofFile || !proofFile.size || proofFile.name === "undefined")) {
      return { success: false, error: "Bukti transfer wajib diunggah" };
    }

    const code = generateRegistrationCode();

    // 1. Upload Bukti Transfer (jika ada)
    let proof_of_transfer_url: string | null = null;
    if (proofFile && proofFile.size > 0 && proofFile.name !== "undefined") {
      const proofExt = proofFile.name.split(".").pop();
      const proofPath = `proofs/${code}_${Date.now()}.${proofExt}`;
      const { error: proofErr } = await supabaseAdmin.storage
        .from("registrations")
        .upload(proofPath, proofFile, {
          contentType: proofFile.type,
          upsert: true,
        });

      if (proofErr) {
        console.error("Upload proof error:", proofErr);
        return { success: false, error: `Gagal mengunggah bukti transfer: ${proofErr.message}` };
      }

      const { data: proofUrlData } = supabaseAdmin.storage
        .from("registrations")
        .getPublicUrl(proofPath);
      proof_of_transfer_url = proofUrlData.publicUrl;
    }

    // 2. Upload Surat Tugas (jika ada)
    let assignment_letter_url: string | null = null;
    if (assignmentFile && assignmentFile.size > 0 && assignmentFile.name !== "undefined") {
      const assignExt = assignmentFile.name.split(".").pop();
      const assignPath = `assignments/${code}_${Date.now()}.${assignExt}`;
      const { error: assignErr } = await supabaseAdmin.storage
        .from("registrations")
        .upload(assignPath, assignmentFile, {
          contentType: assignmentFile.type,
          upsert: true,
        });

      if (assignErr) {
        console.error("Upload assignment letter error:", assignErr);
        return { success: false, error: `Gagal mengunggah surat tugas: ${assignErr.message}` };
      }

      const { data: assignUrlData } = supabaseAdmin.storage
        .from("registrations")
        .getPublicUrl(assignPath);
      assignment_letter_url = assignUrlData.publicUrl;
    }

    // 3. Upload File Daftar Nama (jika rombongan)
    let participant_list_url: string | null = null;
    if (listFile && listFile.size > 0 && listFile.name !== "undefined") {
      const listExt = listFile.name.split(".").pop();
      const listPath = `lists/${code}_${Date.now()}.${listExt}`;
      const { error: listErr } = await supabaseAdmin.storage
        .from("registrations")
        .upload(listPath, listFile, {
          contentType: listFile.type,
          upsert: true,
        });

      if (!listErr) {
        const { data: listUrlData } = supabaseAdmin.storage
          .from("registrations")
          .getPublicUrl(listPath);
        participant_list_url = listUrlData.publicUrl;
      }
    }

    // 4. Siapkan payload Insert DB
    const payload: any = {
      registration_mode,
      category,
      mupel,
      church_name,
      whatsapp_number,
      proof_of_transfer_url,
      assignment_letter_url,
      participant_list_url,
    };

    if (registration_mode === "Mandiri") {
      payload.full_name = formData.get("full_name") as string;
      payload.type = formData.get("type") as string;
      payload.shirt_size = formData.get("shirt_size") as string || null;
      payload.role = formData.get("role") as string || null;
      payload.companion_for = formData.get("companion_for") as string || null;
    } else {
      payload.pic_name = formData.get("pic_name") as string;
      payload.participant_count = parseInt(formData.get("participant_count") as string || "0");
      payload.companion_count = parseInt(formData.get("companion_count") as string || "0");
      const shirtSizesJson = formData.get("shirt_sizes_summary") as string;
      if (shirtSizesJson) {
        payload.shirt_sizes_summary = JSON.parse(shirtSizesJson);
      }
    }

    // 5. Insert DB with Race Condition Retry Loop for Unique Registration Code
    let insertedData: any = null;
    let finalCode = "";
    let attempts = 0;

    while (!insertedData && attempts < 5) {
      attempts++;
      finalCode = generateRegistrationCode();
      payload.registration_code = finalCode;

      const { data: insertData, error: dbErr } = await supabaseAdmin
        .from("registrations")
        .insert(payload)
        .select()
        .single();

      if (!dbErr) {
        insertedData = insertData;
        break;
      }

      // If error is not a Postgres unique violation (23505), return error immediately
      if (dbErr.code !== "23505") {
        console.error("DB Insert Error:", dbErr);
        return { success: false, error: `Gagal menyimpan data registrasi: ${dbErr.message}` };
      }
    }

    if (!insertedData) {
      return { success: false, error: "Gagal me-generate kode registrasi unik. Silakan coba submit kembali." };
    }

    return {
      success: true,
      registration_code: finalCode,
      data: JSON.parse(JSON.stringify(insertedData)),
    };
  } catch (err: any) {
    console.error("Server Action Exception:", err);
    return { success: false, error: err.message || "Terjadi kesalahan pada server" };
  }
}

export async function getRegistrationByCode(codeOrWa: string) {
  try {
    const cleanQuery = codeOrWa.trim();
    if (!cleanQuery) return { success: false, error: "Masukkan Kode Registrasi atau No. WA" };

    const { data, error } = await supabaseAdmin
      .from("registrations")
      .select("*")
      .or(`registration_code.ilike.${cleanQuery},whatsapp_number.eq.${cleanQuery}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Lookup Error:", error);
      return { success: false, error: "Gagal mencari data pendaftaran" };
    }

    if (!data || data.length === 0) {
      return { success: false, error: "Data pendaftaran tidak ditemukan. Periksa kembali Kode atau No WA." };
    }

    return { success: true, registrations: JSON.parse(JSON.stringify(data)) };
  } catch (err: any) {
    return { success: false, error: err.message || "Terjadi kesalahan sistem" };
  }
}
