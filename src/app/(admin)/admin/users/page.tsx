import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUsers } from "./actions";
import { UsersManager } from "@/components/admin/UsersManager";
import { ShieldAlert } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function ManageUsersPage({ searchParams }: PageProps) {
  const headerList = await headers();
  const userId = headerList.get("x-user-id");
  const userRole = headerList.get("x-user-role");

  if (!userId || !userRole) {
    redirect("/admin/login");
  }

  if (userRole !== "super_user") {
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
        currentUserId={userId || ""}
        searchResolved={searchResolved}
      />
    </div>
  );
}
