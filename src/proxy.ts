import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { showSamples } from "@/lib/mode";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabaseConfigured } from "@/lib/supabase/config";

// Refreshes the Supabase sign-in session before the routes that use it render,
// and writes the refreshed cookies back. The landing pages don't run this.
// The sample booking flow (/listing, /book, /booked) only exists for the
// sample listings, so on production (real data only) it sends visitors to
// search instead (see src/lib/mode.ts).
//
// The homepage runs this too, but only to send signed-in people to /explore
// (the app). Signed out, it's the normal homepage.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isHome = pathname === "/";
  if (!showSamples && /^\/(listing|book|booked)\//.test(pathname)) {
    return NextResponse.redirect(new URL("/search", request.url));
  }
  let response = NextResponse.next({ request });
  if (!supabaseConfigured) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });
  const { data } = await supabase.auth.getClaims();
  if (isHome && data?.claims) {
    // Keep any refreshed sign-in cookies on the redirect.
    const toApp = NextResponse.redirect(new URL("/explore", request.url));
    response.cookies.getAll().forEach((c) => toApp.cookies.set(c));
    return toApp;
  }
  return response;
}

export const config = {
  // The app routes ("/" only for the signed-in redirect). The sample booking
  // flow (/listing, /book, /booked) is staging only.
  matcher: [
    "/",
    "/explore",
    "/refer",
    "/messages",
    "/search",
    "/favorites",
    "/signin",
    "/auth/:path*",
    "/listing/:path*",
    "/book/:path*",
    "/booked/:path*",
    "/sublet-your-room",
    "/sublet/:path*",
  ],
};
