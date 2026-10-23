import { NextResponse, type NextRequest } from "next/server";
import { isListingId, writeFavorite } from "@/lib/favorites";
import { createClient } from "@/lib/supabase/server";

// Where the sign-in email's link lands. Swaps the one-time code for a session,
// saves the listing they hearted before signing in (if any), then sends them
// back to where they were.
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next") ?? "";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/favorites";
  const save = url.searchParams.get("save");

  const supabase = await createClient();
  if (!supabase || !code) return NextResponse.redirect(new URL("/signin?error=link", url.origin));

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL(`/signin?error=link&next=${encodeURIComponent(next)}`, url.origin));

  if (isListingId(save)) await writeFavorite(save, true);
  return NextResponse.redirect(new URL(next, url.origin));
}
