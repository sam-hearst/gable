import "server-only";
import type { PreviewMessage } from "@/components/listing/ChatPreview";
import { createClient } from "./supabase/server";

// What the listing page shows about a group chat: how many students are in it,
// and (for signed-in students) the last few messages. Null count means the chat
// tables aren't set up yet (supabase/listing_chats.sql), so the page leaves the
// number out.
export async function getChatPeek(listingId: string): Promise<{ count: number | null; messages: PreviewMessage[] }> {
  const supabase = await createClient();
  if (!supabase) return { count: null, messages: [] };
  const [count, preview] = await Promise.all([
    supabase.rpc("chat_member_count", { l: listingId }),
    supabase.rpc("chat_preview", { l: listingId }),
  ]);
  const rows = (preview.data ?? []) as { display_name: string; role: string; body: string }[];
  return {
    count: count.error || typeof count.data !== "number" ? null : count.data,
    messages: preview.error ? [] : rows.map((r) => ({ name: r.display_name, host: r.role === "host", body: r.body })),
  };
}
