import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Can be ignored if handled by middleware session refreshes
          }
        },
      },
    }
  );

  // 2. Fetch the authenticated user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // 3. Retrieve user profile (full name, role)
  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/admin/unauthorized");
  }

  return (
    <div className="min-h-screen bg-[#022c22] text-[#FDFBF7] flex flex-col md:flex-row relative overflow-x-hidden selection:bg-[#D4AF37] selection:text-[#022c22]">
      {/* Premium ambient glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 print:hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] bg-[#D4AF37]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-[#047857]/20 rounded-full blur-[150px]" />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
      </div>

      {/* Sidebar (Client Component) */}
      <Sidebar fullName={profile.full_name} role={profile.role} />

      {/* Content wrapper: margin-left offsets sidebar on desktop, full-width on mobile */}
      <main className="flex-1 min-w-0 p-4 md:p-6 pt-20 md:pt-6 md:ml-64 min-h-screen relative flex flex-col">
        {children}
      </main>
    </div>
  );
}