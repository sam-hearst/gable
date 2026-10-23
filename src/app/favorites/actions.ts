"use server";

import { getFavorites, writeFavorite } from "@/lib/favorites";

// Called by the heart buttons. Returns "signed-out" so the button can send the
// person to sign in instead of failing silently.
export async function setFavorite(listingId: string, saved: boolean) {
  return writeFavorite(listingId, saved);
}

// The signed-in user's saved listing ids, straight from the database (null
// when signed out). Pages call this when they open, so a copy of the page the
// browser kept from earlier can't show an out-of-date list.
export async function listFavorites() {
  const { user, ids } = await getFavorites();
  return user ? ids : null;
}
