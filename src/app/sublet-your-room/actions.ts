"use server";

import { refresh } from "next/cache";
import { MAX_POST_CHARS, readPost } from "@/lib/paste-post";
import { createListing, deleteListing } from "@/lib/student-listings";
import { getCurrentUser } from "@/lib/supabase/server";

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

// "Paste your post": reads a sublet post the student already wrote and returns
// the fields it states, to prefill the form. Saves nothing. Signed-in listers
// only, so the Claude key can't be used by anyone who finds this endpoint.
// null means "couldn't read it" and the form stays as it is.
export async function readPastedPost(post: unknown) {
  if (typeof post !== "string" || !post.trim() || post.length > MAX_POST_CHARS) return null;
  if (!(await getCurrentUser())) return null;
  return readPost(post);
}
