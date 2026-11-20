"use server";

import { createExternalListing } from "@/lib/external-listings";
import { readLink } from "@/lib/link-preview";
import { supabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/supabase/server";

// Reads one pasted link's preview and guesses the search fields. Signed-in
// people only (where sign-in is set up), so Gable's server can't be used as a
// free page fetcher by anyone on the internet.
export async function previewLink(url: string) {
  if (typeof url !== "string") return { ok: false as const, error: "Paste a link." };
  if (supabaseConfigured && !(await getCurrentUser())) {
    return { ok: false as const, error: "Sign in to share a listing.", signedOut: true };
  }
  return readLink(url);
}

// Saves the card as pending. The team approves it by hand before it shows.
export async function shareListing(input: unknown) {
  return createExternalListing(input);
}
