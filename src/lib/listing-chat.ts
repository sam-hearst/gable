import "server-only";
import { createClient } from "./supabase/server";

// How many students are in a listing's group chat, for the listing page.
// Null if the chat tables aren't set up yet (supabase/listing_chats.sql), so
// the page just leaves the number out.
export async function getChatCount(listingId: string): Promise<number | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("chat_member_count", { l: listingId });
  if (error) return null;
  return typeof data === "number" ? data : null;
}
