import "server-only";
import { SAMPLE_LISTINGS } from "@/content/listings";
import { showSamples } from "./mode";
import { createClient, getCurrentUser, type CurrentUser } from "./supabase/server";

// Only sample listings can be hearted so far, and they exist on staging only,
// so on production (real data only) Favorites stays empty and saves are refused.
export const isListingId = (id: unknown): id is string =>
  showSamples && typeof id === "string" && SAMPLE_LISTINGS.some((l) => l.id === id);

// The signed-in user and the ids of the listings they've hearted, oldest first.
export async function getFavorites(): Promise<{ user: CurrentUser | null; ids: string[] }> {
  const supabase = await createClient();
  const user = supabase ? await getCurrentUser(supabase) : null;
  if (!supabase || !user) return { user: null, ids: [] };

  const { data, error } = await supabase.from("favorites").select("listing_id").order("created_at");
  if (error) {
    console.warn("[favorites] couldn't load:", error.message);
    return { user, ids: [] };
  }
  return { user, ids: data.map((row) => row.listing_id as string).filter(isListingId) };
}

// Saves or unsaves one listing for the signed-in user.
export async function writeFavorite(listingId: string, saved: boolean): Promise<"ok" | "signed-out" | "error"> {
  if (!isListingId(listingId)) return "error";
  const supabase = await createClient();
  const user = supabase ? await getCurrentUser(supabase) : null;
  if (!supabase || !user) return "signed-out";

  const { error } = saved
    ? await supabase
        .from("favorites")
        .upsert({ user_id: user.id, listing_id: listingId }, { onConflict: "user_id,listing_id", ignoreDuplicates: true })
    : await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", listingId);
  if (error) {
    console.warn("[favorites] couldn't save:", error.message);
    return "error";
  }
  return "ok";
}
