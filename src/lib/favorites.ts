import "server-only";
import { SAMPLE_LISTINGS } from "@/content/listings";
import { showSamples } from "./mode";
import { createClient, getCurrentUser, type CurrentUser } from "./supabase/server";

// What can be hearted: the sample listings (staging only) and real student
// listings, whose ids are UUIDs. writeFavorite checks that a real one exists.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isSampleId = (id: string) => showSamples && SAMPLE_LISTINGS.some((l) => l.id === id);
export const isListingId = (id: unknown): id is string => typeof id === "string" && (isSampleId(id) || UUID.test(id));

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

  // A real listing has to exist (approved, or the signed-in user's own).
  if (saved && !isSampleId(listingId)) {
    const { data } = await supabase.from("student_listings").select("id").eq("id", listingId).maybeSingle();
    if (!data) return "error";
  }

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
