import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUsers } from "./actions";
import { UsersManager } from "@/components/admin/UsersManager";
import { ShieldAlert } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function ManageUsersPage({ searchParams }: PageProps) {
  const cookieStore = await cookies();

  // 1. Initialize Supabase server client configured for Next.js cookies
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

  // 2. Double-check Server-side authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // 3. Double-check Server-side role authorization (Super User exclusive access)
  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "super_user") {
    redirect("/admin/unauthorized");
  }

  // 4. Fetch the users using the getUsers server action
  const searchResolved = (await searchParams)?.search || "";
  const usersResult = await getUsers(searchResolved);
  const usersList = usersResult.success ? usersResult.data || [] : [];

  return (
    <div className="container mx-auto max-w-6xl py-4 space-y-6">
      {/* Title Section */}
      <div className="flex items-center gap-3 select-none">
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl shadow-md">
          <ShieldAlert className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#FDFBF7] tracking-tight">
            Manage Users
          </h1>
          <p className="text-xs text-gray-400">
            Kelola akun administrator panitia dan hak akses khusus Super User.
          </p>
        </div>
      </div>

      {/* Main Client Shell for Interactions */}
      <UsersManager
        users={usersList}
        currentUserId={user.id}
        searchResolved={searchResolved}
      />
    </div>
  );
}
