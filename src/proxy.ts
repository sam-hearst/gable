import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isDemo } from "@/lib/mode";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabaseConfigured } from "@/lib/supabase/config";

// Refreshes the Supabase sign-in session before the routes that use it render,
// and writes the refreshed cookies back. The landing pages don't run this.
// On the waitlist site (production) these MVP routes don't exist: send
// visitors to the homepage instead (see src/lib/mode.ts).
//
// The homepage runs this too, but only to send signed-in people on the demo
// site to /explore (the app). Signed out, or on the waitlist site, it's the
// normal homepage.
export async function proxy(request: NextRequest) {
  const isHome = request.nextUrl.pathname === "/";
  if (!isDemo) return isHome ? NextResponse.next() : NextResponse.redirect(new URL("/", request.url));
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
  // The MVP routes ("/" only for the signed-in redirect). Booking (/listing, /book, /booked) and real student
  // listings (/sublet-your-room, /sublet) are demo only too.
  matcher: [
    "/",
    "/explore",
    "/refer",
    "/circles",
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
