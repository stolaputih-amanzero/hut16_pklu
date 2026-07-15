import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import DashboardClient from "@/components/admin/DashboardClient";
import Link from "next/link";

export default async function DashboardPage() {
  const headerList = await headers();
  const userId = headerList.get("x-user-id");
  const userRole = headerList.get("x-user-role");
  const userName = headerList.get("x-user-name");

  if (!userId || !userRole || !userName) {
    redirect("/admin/login");
  }

  const profile = {
    full_name: userName,
    role: userRole,
  };

  // 2. Fetch all necessary data lists in parallel
  let registrations: any[] = [];
  let merchOrders: any[] = [];
  let proposals: any[] = [];
  let merchProducts: any[] = [];
  let guestbookCount = 0;
  let hasError = false;

  try {
    const [regRes, merchRes, guestbookRes, proposalRes, productRes] = await Promise.all([
      supabaseAdmin.from("registrations").select("*"),
      supabaseAdmin.from("merch_orders").select("*"),
      supabaseAdmin
        .from("guestbook_messages")
        .select("id", { count: "exact", head: true })
        .eq("is_approved", false),
      supabaseAdmin.from("proposals").select("*"),
      supabaseAdmin.from("merch_products").select("*"),
    ]);

    if (regRes.error) throw regRes.error;
    if (merchRes.error) throw merchRes.error;
    if (guestbookRes.error) throw guestbookRes.error;
    if (proposalRes.error) throw proposalRes.error;
    if (productRes.error) throw productRes.error;

    registrations = regRes.data || [];
    merchOrders = (merchRes.data || []).map((o: any) => ({
      ...o,
      buyer_name: o.buyer_name?.replaceAll("&amp;", "&"),
      church_city: o.church_city?.replaceAll("&amp;", "&"),
      item_type: o.item_type
        ?.replaceAll("&amp;", "&")
        .replaceAll("Pouch & Goodie Bag Edisi Spesial", "Pouch & Bag Edisi Spesial")
        .replaceAll("Pouch & Googie Bag Edisi Spesial", "Pouch & Bag Edisi Spesial"),
      notes: o.notes?.replaceAll("&amp;", "&"),
    }));
    guestbookCount = guestbookRes.count || 0;
    proposals = proposalRes.data || [];
    merchProducts = (productRes.data || []).map((p: any) => ({
      ...p,
      name: p.name
        ?.replaceAll("&amp;", "&")
        .replaceAll("Pouch & Goodie Bag Edisi Spesial", "Pouch & Bag Edisi Spesial")
        .replaceAll("Pouch & Googie Bag Edisi Spesial", "Pouch & Bag Edisi Spesial"),
      description: p.description?.replaceAll("&amp;", "&"),
    }));
  } catch (error) {
    console.error("Dashboard stats parallel fetch error:", error);
    hasError = true;
  }

  return (
    <div className="container mx-auto max-w-6xl py-4">
      {/* Error Banner if database query fails */}
      {hasError && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <span>Gagal memuat beberapa data statistik terbaru. Silakan coba kembali.</span>
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold text-xs hover:bg-red-600 transition-colors shrink-0"
          >
            Coba Lagi
          </Link>
        </div>
      )}

      {/* Render interactive client-side Dashboard */}
      <DashboardClient
        profile={profile}
        registrations={registrations}
        merchOrders={merchOrders}
        proposals={proposals}
        merchProducts={merchProducts}
        pendingGuestbookCount={guestbookCount}
      />
    </div>
  );
}