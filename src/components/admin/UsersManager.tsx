"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { CreateUserModal } from "./CreateUserModal";
import { EditUserModal } from "./EditUserModal";

interface User {
  id: string;
  full_name: string;
  role: string;
  created_at: string;
  email: string;
}

interface UsersManagerProps {
  users: User[];
  currentUserId: string;
  searchResolved: string;
}

export function UsersManager({ users, currentUserId, searchResolved }: UsersManagerProps) {
  const router = useRouter();
  const [search, setSearch] = useState(searchResolved);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/admin/users?search=${encodeURIComponent(search.trim())}`);
  };

  const formatDate = (isoString: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(isoString));
  };

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau email..."
            className="flex-1 px-4 py-2.5 bg-black/40 border border-[#D4AF37]/25 focus:border-[#D4AF37]/60 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/40 transition-all placeholder-gray-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-[#D4AF37] hover:bg-[#B3932D] text-black font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-md"
          >
            Cari
          </button>
        </form>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-2.5 px-4 bg-[#D4AF37] hover:bg-[#B3932D] text-black font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-md"
        >
          <Plus className="w-4.5 h-4.5" />
          Tambah Admin
        </button>
      </div>

      {/* Empty State */}
      {users.length === 0 ? (
        <div className="py-16 text-center border border-[#D4AF37]/20 bg-black/40 rounded-2xl select-none">
          <p className="text-gray-400 text-sm">Tidak ada admin yang ditemukan.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-[#D4AF37]/20 bg-black/40 backdrop-blur-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#D4AF37]/20 text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider bg-black/25">
                  <th className="py-4 px-6">Nama Lengkap</th>
                  <th className="py-4 px-6">Alamat Email</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Tanggal Dibuat</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-bold text-[#FDFBF7]">{u.full_name}</td>
                    <td className="py-4 px-6 text-gray-300">{u.email}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-extrabold ${
                          u.role === "super_user"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {u.role === "super_user" ? "Super User" : "Admin"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-400">{formatDate(u.created_at)}</td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => setEditUser(u)}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-[#D4AF37] transition-colors cursor-pointer"
                        title="Edit Admin"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        disabled={u.id === currentUserId}
                        onClick={() => setDeleteUser(u)}
                        className={`p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer ${
                          u.id === currentUserId ? "opacity-25 cursor-not-allowed text-gray-500" : "text-red-400"
                        }`}
                        title={u.id === currentUserId ? "Anda tidak bisa menghapus diri sendiri" : "Hapus Admin"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-4">
            {users.map((u) => (
              <div
                key={u.id}
                className="bg-black/45 border border-[#D4AF37]/20 rounded-2xl p-5 space-y-4 shadow-lg"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#FDFBF7]">{u.full_name}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-extrabold ${
                      u.role === "super_user"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    {u.role === "super_user" ? "Super User" : "Admin"}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-white/5 text-[10px] text-gray-400">
                  <span>Dibuat: {formatDate(u.created_at)}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditUser(u)}
                      className="p-1 text-[#D4AF37] hover:bg-white/10 rounded cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      disabled={u.id === currentUserId}
                      onClick={() => setDeleteUser(u)}
                      className={`p-1 cursor-pointer ${
                        u.id === currentUserId ? "opacity-20 cursor-not-allowed text-gray-500" : "text-red-400"
                      }`}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modals and Dialogs */}
      {isCreateOpen && <CreateUserModal onClose={() => setIsCreateOpen(false)} />}
      {editUser && <EditUserModal user={editUser} currentUserId={currentUserId} onClose={() => setEditUser(null)} />}
      {/* {deleteUser && <DeleteUserDialog user={deleteUser} onClose={() => setDeleteUser(null)} />} */}
    </div>
  );
}
