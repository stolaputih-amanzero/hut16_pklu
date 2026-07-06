import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Exclude public admin routes (login, unauthorized, and auth callbacks) from validation
  const isExcluded =
    pathname === "/admin/login" ||
    pathname === "/admin/unauthorized" ||
    pathname.startsWith("/admin/api/auth/callback");

  if (isExcluded) {
    return NextResponse.next();
  }

  // 2. Initialize Supabase client and response from our utility
  const { supabase, response } = createMiddlewareClient(request);

  try {
    // 3. Retrieve user session (getUser securely re-validates the JWT with Supabase auth servers)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // 4. Verify user exists in the admin_profiles table
    const { data: profile, error: dbError } = await supabase
      .from("admin_profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (dbError || !profile) {
      return NextResponse.redirect(new URL("/admin/unauthorized", request.url));
    }

    // 5. Inject verified user ID to response headers (request scope caching for downstream components)
    response.headers.set("x-user-id", user.id);

    return response;
  } catch (error) {
    // 6. Generic redirect to login on exceptions (e.g. DB unreachable, session corrupt)
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
}

export const config = {
  // Performance optimization: Matcher only triggers this middleware on admin paths
  matcher: ["/admin/:path*"],
};
