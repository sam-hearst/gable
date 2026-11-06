"use server";

import { refresh } from "next/cache";
import { createListing, deleteListing } from "@/lib/student-listings";

// Called by the "List your room" form after its photos are uploaded. Saves the
// listing as pending; the team approves it by hand before anyone else sees it.
export async function submitListing(input: unknown) {
  const result = await createListing(input);
  if (result.ok) refresh();
  return result;
}

// Removes one of your own listings (any status) and its photos.
export async function removeListing(id: string) {
  const result = await deleteListing(id);
  if (result === "ok") refresh();
  return result;
}
