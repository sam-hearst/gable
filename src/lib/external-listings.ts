import "server-only";
import type { RoomType } from "@/content/listings";
import { SAMPLE_EXTERNAL_LISTINGS } from "@/content/external-samples";
import { showSamples } from "./mode";
import { sourceName, type ExternalListing, type ExternalListingInput } from "./external-listing-fields";
import { NEIGHBORHOODS, ROOM_TYPES, nycToday } from "./student-listing-fields";
import { createClient, getCurrentUser } from "./supabase/server";

// Link cards (supabase/external_listings.sql): sublets someone found elsewhere
// and shared. Read and written as the visitor, so row level security decides
// what they see: approved, unexpired cards for everyone, plus your own.

const COLUMNS =
  "id, url, source, title, description, image_url, neighborhood, room_type, sleeps, price, available_from, available_to, furnished, created_at";

type Row = {
  id: string;
  url: string;
  source: string;
  title: string;
  description: string;
  image_url: string | null;
  neighborhood: string;
  room_type: RoomType;
  sleeps: number;
  price: number;
  available_from: string;
  available_to: string;
  furnished: boolean;
  created_at: string;
};

const toCard = (r: Row): ExternalListing => ({
  kind: "external",
  id: r.id,
  url: r.url,
  source: r.source,
  title: r.title,
  description: r.description,
  imageUrl: r.image_url,
  neighborhood: r.neighborhood,
  roomType: r.room_type,
  sleeps: r.sleeps,
  price: r.price,
  availableFrom: r.available_from,
  availableTo: r.available_to,
  furnished: r.furnished,
  addedOn: r.created_at.slice(0, 10),
});

// Approved, unexpired cards whose dates haven't passed, newest first, plus the
// made-up samples on staging. Empty (with a server warning) if the table isn't
// set up yet, so search still works.
export async function getApprovedExternalListings(): Promise<ExternalListing[]> {
  const samples = showSamples ? SAMPLE_EXTERNAL_LISTINGS : [];
  const supabase = await createClient();
  if (!supabase) return samples;
  const { data, error } = await supabase
    .from("external_listings")
    .select(COLUMNS)
    .eq("status", "approved")
    .gte("available_to", nycToday())
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    console.warn("[link cards] couldn't load approved cards:", error.message);
    return samples;
  }
  return [...(data as Row[]).map(toCard), ...samples];
}

// ---------- Sharing ----------

export type ShareResult = { ok: true } | { ok: false; error: string; signedOut?: boolean };

const isDate = (v: unknown): v is string =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`));
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, max) : "");

export function validateExternal(input: unknown): { error: string } | { row: Record<string, unknown> } {
  const o = (input && typeof input === "object" ? input : {}) as Partial<Record<keyof ExternalListingInput, unknown>>;

  let url: URL;
  try {
    url = new URL(String(o.url ?? ""));
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
  } catch {
    return { error: "Paste the listing's link, starting with https://." };
  }
  const title = clean(o.title, 120);
  if (title.length < 3) return { error: "Give it a short title (3 to 120 characters)." };
  if (typeof o.neighborhood !== "string" || !NEIGHBORHOODS.includes(o.neighborhood)) return { error: "Pick the neighborhood." };
  if (!ROOM_TYPES.includes(o.roomType as RoomType)) return { error: "Pick what kind of space it is." };
  const sleeps = Number(o.sleeps);
  if (!Number.isInteger(sleeps) || sleeps < 1 || sleeps > 4) return { error: "Say how many people it fits (1 to 4)." };
  const price = Number(o.price);
  if (!Number.isInteger(price) || price < 300 || price > 10000)
    return { error: "Enter the monthly rent in whole dollars, between $300 and $10,000. Check the listing if the preview didn't show it." };
  if (!isDate(o.availableFrom) || !isDate(o.availableTo)) return { error: "Add the dates it's available, from the listing." };
  if (o.availableTo <= o.availableFrom) return { error: "The end date needs to be after the start date." };
  if (o.availableTo < nycToday()) return { error: "Those dates are already over." };
  if (typeof o.furnished !== "boolean") return { error: "Say whether it comes furnished." };
  let imageUrl: string | null = null;
  if (typeof o.imageUrl === "string" && o.imageUrl.startsWith("https://") && o.imageUrl.length <= 600) imageUrl = o.imageUrl;

  return {
    row: {
      url: url.toString().slice(0, 600),
      source: sourceName(url.toString()),
      title,
      description: clean(o.description, 300),
      image_url: imageUrl,
      neighborhood: o.neighborhood,
      room_type: o.roomType,
      sleeps,
      price,
      available_from: o.availableFrom,
      available_to: o.availableTo,
      furnished: o.furnished,
    },
  };
}

// Saves a card as pending for the signed-in user. The team approves it by hand.
export async function createExternalListing(input: unknown): Promise<ShareResult> {
  const supabase = await createClient();
  const user = supabase ? await getCurrentUser(supabase) : null;
  if (!supabase || !user) return { ok: false, error: "Sign in to share a listing.", signedOut: true };
  const checked = validateExternal(input);
  if ("error" in checked) return { ok: false, error: checked.error };
  const { error } = await supabase.from("external_listings").insert(checked.row);
  if (error) {
    if (error.code === "23505") return { ok: false, error: "Someone already shared that listing. Thanks anyway!" };
    console.warn("[link cards] couldn't save a card:", error.message);
    return { ok: false, error: "We couldn't save that just now. Try again in a minute." };
  }
  return { ok: true };
}
