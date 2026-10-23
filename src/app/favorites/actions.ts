"use server";

import { writeFavorite } from "@/lib/favorites";

// Called by the heart buttons. Returns "signed-out" so the button can send the
// person to sign in instead of failing silently.
export async function setFavorite(listingId: string, saved: boolean) {
  return writeFavorite(listingId, saved);
}
