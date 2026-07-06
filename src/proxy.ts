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

  // The prefetch bypass was removed because Next.js caches prefetch responses.
  // If we skip injecting headers during prefetch, Server Components will issue a redirect to login,
  // which gets cached and causes an infinite loop upon router.push().

  // 2. Initialize Supabase client and response from our utility
  const { supabase, response } = createMiddlewareClient(request);

  let user;
  try {
    // 3. Retrieve user session (getUser securely re-validates the JWT with Supabase auth servers)
    const {
      data: { user: userData },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !userData) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    user = userData;
  } catch (authError) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  try {
    // 4. Verify user exists in the admin_profiles table
    const { data: profile, error: dbError } = await supabase
      .from("admin_profiles")
      .select("id, role, full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (dbError || !profile) {
      return NextResponse.redirect(new URL("/admin/unauthorized", request.url));
    }

    // 5. Inject verified user ID, role, and name to request headers for instant downstream access
    request.headers.set("x-user-id", user.id);
    request.headers.set("x-user-role", profile.role);
    request.headers.set("x-user-name", profile.full_name);

    // Create a new response to forward the updated request headers to Next.js components
    const finalResponse = NextResponse.next({
      request: {
        headers: new Headers(request.headers),
      },
    });

    // Copy cookies set by Supabase client (e.g. refreshed session token) to the final response
    response.cookies.getAll().forEach((cookie) => {
      finalResponse.cookies.set(cookie.name, cookie.value);
    });

    return finalResponse;
  } catch (dbError) {
    // DB timeout/error saat cek admin_profiles -> default redirect ke /admin/unauthorized (fail-safe)
    return NextResponse.redirect(new URL("/admin/unauthorized", request.url));
  }
}

export const config = {
  // Performance optimization: Matcher only triggers this middleware on admin paths
  matcher: ["/admin/:path*"],
};
