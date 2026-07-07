"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Multi-layered security helper: verify the requester has a valid session and the super_user role
async function verifySuperUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  // 1. Securely fetch user session and re-verify JWT on Supabase Auth Servers
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali.");
  }

  // 2. Fetch the requester's role from the admin_profiles table
  const { data: profile, error: dbError } = await supabaseAdmin
    .from("admin_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (dbError || !profile || profile.role !== "super_user") {
    throw new Error("Akses ditolak. Tindakan ini memerlukan wewenang Super User.");
  }

  return user;
}

// 1. Fetch all admin users (admin_profiles JOIN auth.users information)
export async function getUsers(search?: string) {
  try {
    await verifySuperUser();

    // Fetch all admin profiles from database
    let query = supabaseAdmin
      .from("admin_profiles")
      .select("id, full_name, role, created_at")
      .order("created_at", { ascending: false });

    if (search) {
      query = query.ilike("full_name", `%${search}%`);
    }

    const { data: profiles, error: dbError } = await query;
    if (dbError) throw dbError;

    // Fetch all auth users via service role client to retrieve emails
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    const authUsers = authData.users || [];
    const userMap = new Map(authUsers.map((u) => [u.id, u.email]));

    // Perform JS-level join matching database profiles with auth emails
    let joined = (profiles || []).map((p) => ({
      id: p.id,
      full_name: p.full_name,
      role: p.role,
      created_at: p.created_at,
      email: userMap.get(p.id) || "",
    }));

    // If search is defined, filter results case-insensitively by email as well
    if (search) {
      const lowerSearch = search.toLowerCase();
      joined = joined.filter(
        (u) =>
          u.full_name.toLowerCase().includes(lowerSearch) ||
          u.email.toLowerCase().includes(lowerSearch)
      );
    }

    return { success: true, data: joined };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengambil data user." };
  }
}

// 2. Create a new admin user
export async function createUser(data: {
  email: string;
  full_name: string;
  password: string;
  role: "admin" | "super_user";
}) {
  try {
    await verifySuperUser();

    if (!data.email?.trim() || !data.full_name?.trim() || !data.password || !data.role) {
      return { success: false, error: "Semua data wajib diisi." };
    }

    if (data.password.length < 8) {
      return { success: false, error: "Sandi minimal harus 8 karakter." };
    }

    // Verify if email is already registered in auth.users
    const { data: authData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const emailExists = authData.users.some(
      (u) => u.email?.toLowerCase() === data.email.trim().toLowerCase()
    );

    if (emailExists) {
      return { success: false, error: "Email sudah terdaftar di dalam sistem." };
    }

    // Create user within Supabase Auth (confirmed_at is set to auto-confirm)
    const { data: newUserData, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email.trim(),
      password: data.password,
      user_metadata: { full_name: data.full_name.trim() },
      email_confirm: true,
    });

    if (createAuthError || !newUserData?.user) {
      throw createAuthError || new Error("Gagal mendaftarkan user baru.");
    }

    // Insert user details into the admin_profiles database table
    const { error: profileError } = await supabaseAdmin.from("admin_profiles").insert({
      id: newUserData.user.id,
      full_name: data.full_name.trim(),
      role: data.role,
    });

    if (profileError) {
      // Transaction rollback: delete the created auth user if the database profile insert fails
      await supabaseAdmin.auth.admin.deleteUser(newUserData.user.id);
      throw profileError;
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menambahkan admin baru." };
  }
}

// 3. Update an existing admin's profile
export async function updateUser(
  id: string,
  data: {
    full_name: string;
    role: "admin" | "super_user";
    password?: string;
  }
) {
  try {
    const requester = await verifySuperUser();

    if (!data.full_name?.trim() || !data.role) {
      return { success: false, error: "Semua data wajib diisi." };
    }

    // Prevent Lockout: prevent self-demotion from super_user to admin role
    if (id === requester.id && data.role !== "super_user") {
      return {
        success: false,
        error: "Anda tidak dapat menghapus wewenang Super User Anda sendiri demi keamanan.",
      };
    }

    // Update password via admin auth SDK if provided
    if (data.password && data.password.trim()) {
      if (data.password.length < 8) {
        return { success: false, error: "Sandi minimal harus 8 karakter." };
      }
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, {
        password: data.password.trim(),
      });
      if (authError) throw authError;
    }

    const { error } = await supabaseAdmin
      .from("admin_profiles")
      .update({
        full_name: data.full_name.trim(),
        role: data.role,
      })
      .eq("id", id);

    if (error) throw error;

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal memperbarui profil admin." };
  }
}

// 4. Delete an admin user
export async function deleteUser(id: string) {
  try {
    const requester = await verifySuperUser();

    // Prevent self-deletion
    if (id === requester.id) {
      return { success: false, error: "Anda tidak dapat menghapus akun Anda sendiri." };
    }

    // Deleting from auth.users will automatically cascade delete from public.admin_profiles
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (error) throw error;

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menghapus admin." };
  }
}
