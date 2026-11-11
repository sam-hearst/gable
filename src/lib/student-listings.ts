import "server-only";
import {
  NEIGHBORHOODS,
  PHOTO_BUCKET,
  MAX_PHOTOS,
  ROOM_TYPES,
  nycToday,
  photoUrl,
  type ListingInput,
  type ListingStatus,
  type StudentListing,
} from "./student-listing-fields";
import { createClient, getCurrentUser } from "./supabase/server";
import type { RoomType } from "@/content/listings";

// Reading and saving real student listings. Everything runs as the visitor
// through row level security (supabase/student_listings.sql): signed-out
// visitors only ever get approved listings, without the lister's email.

// Columns anyone may read. contact_email is added for signed-in visitors only;
// selecting it as anon is refused by the database.
const PUBLIC_COLUMNS =
  "id, status, title, description, neighborhood, cross_streets, room_type, sleeps, price, available_from, available_to, furnished, photos, first_name, school, checked";

type Row = {
  id: string;
  status: ListingStatus;
  title: string;
  description: string;
  neighborhood: string;
  cross_streets: string;
  room_type: RoomType;
  sleeps: number;
  price: number;
  available_from: string;
  available_to: string;
  furnished: boolean;
  photos: string[];
  first_name: string;
  school: string;
  checked: string[];
  contact_email?: string;
};

function toListing(r: Row): StudentListing {
  return {
    kind: "student",
    id: r.id,
    status: r.status,
    title: r.title,
    description: r.description,
    neighborhood: r.neighborhood,
    crossStreets: r.cross_streets,
    roomType: r.room_type,
    sleeps: r.sleeps,
    price: r.price,
    availableFrom: r.available_from,
    availableTo: r.available_to,
    furnished: r.furnished,
    photos: r.photos.map((path, i) => ({
      src: photoUrl(path),
      alt: `Photo ${i + 1} of ${r.photos.length} of ${r.first_name}'s place in ${r.neighborhood}`,
    })),
    lister: { firstName: r.first_name, school: r.school },
    checked: r.checked,
    contactEmail: r.contact_email ?? null,
  };
}

const today = nycToday;

// Approved listings that are still available, newest first. Empty (and a
// server warning) if Supabase isn't set up or the table doesn't exist yet, so
// search still shows the samples.
export async function getApprovedListings(): Promise<StudentListing[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("student_listings")
    .select(PUBLIC_COLUMNS)
    .eq("status", "approved")
    .gte("available_to", today())
    .order("created_at", { ascending: false });
  if (error) {
    console.warn("[listings] couldn't load approved listings:", error.message);
    return [];
  }
  return (data as Row[]).map(toListing);
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// One listing for /sublet/[id]: approved ones for everyone, plus the lister's
// own pending or rejected ones for them. `isOwner` lets the page say so.
export async function getStudentListing(id: string): Promise<{ listing: StudentListing; isOwner: boolean; signedIn: boolean } | null> {
  if (!UUID.test(id)) return null;
  const supabase = await createClient();
  if (!supabase) return null;
  const user = await getCurrentUser(supabase);
  const columns = user ? `${PUBLIC_COLUMNS}, contact_email, user_id` : PUBLIC_COLUMNS;
  const { data, error } = await supabase.from("student_listings").select(columns).eq("id", id).maybeSingle();
  if (error) console.warn("[listings] couldn't load listing:", error.message);
  if (!data) return null;
  const row = data as unknown as Row & { user_id?: string };
  return { listing: toListing(row), isOwner: Boolean(user && row.user_id === user.id), signedIn: Boolean(user) };
}

// The signed-in person's own listings, any status, newest first.
export async function getMyListings(): Promise<StudentListing[]> {
  const supabase = await createClient();
  const user = supabase ? await getCurrentUser(supabase) : null;
  if (!supabase || !user) return [];
  const { data, error } = await supabase
    .from("student_listings")
    .select(PUBLIC_COLUMNS)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) {
    console.warn("[listings] couldn't load your listings:", error.message);
    return [];
  }
  return (data as Row[]).map(toListing);
}

// ---------- Saving ----------

export type SaveResult = { ok: true; id: string; live: boolean } | { ok: false; error: string; signedOut?: boolean };

const isDate = (v: unknown): v is string =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`));

const text = (v: unknown, min: number, max: number) => {
  const s = typeof v === "string" ? v.trim().replace(/\s+/g, " ") : "";
  return s.length >= min && s.length <= max ? s : null;
};

// Checks every field the form sent. The database checks them again, but this
// gives the lister a plain message instead of a constraint name.
export function validateListing(input: unknown, userId: string): { error: string } | { row: Record<string, unknown> } {
  const o = (input && typeof input === "object" ? input : {}) as Partial<Record<keyof ListingInput, unknown>>;

  const title = text(o.title, 3, 80);
  if (!title) return { error: "Give your listing a short title (3 to 80 characters)." };
  const description = typeof o.description === "string" ? o.description.trim() : "";
  if (description.length < 20 || description.length > 1000)
    return { error: "Describe the place in 20 to 1,000 characters." };
  if (typeof o.neighborhood !== "string" || !NEIGHBORHOODS.includes(o.neighborhood))
    return { error: "Pick a neighborhood from the list." };
  const crossStreets = text(o.crossStreets, 3, 80);
  if (!crossStreets) return { error: "Add the address, like 535 W 113th St." };
  if (!ROOM_TYPES.includes(o.roomType as RoomType)) return { error: "Pick what kind of space it is." };
  const sleeps = Number(o.sleeps);
  if (!Number.isInteger(sleeps) || sleeps < 1 || sleeps > 4) return { error: "Say how many people it fits (1 to 4)." };
  const price = Number(o.price);
  if (!Number.isInteger(price) || price < 300 || price > 10000)
    return { error: "Enter the monthly rent in whole dollars, between $300 and $10,000." };
  if (!isDate(o.availableFrom) || !isDate(o.availableTo)) return { error: "Add the dates it's available." };
  if (o.availableTo <= o.availableFrom) return { error: "The end date needs to be after the start date." };
  if (o.availableTo < today()) return { error: "Those dates are already over." };
  if (typeof o.furnished !== "boolean") return { error: "Say whether it comes furnished." };
  const photos = Array.isArray(o.photos) ? o.photos : [];
  if (photos.length < 1 || photos.length > MAX_PHOTOS) return { error: `Add 1 to ${MAX_PHOTOS} photos.` };
  if (!photos.every((p) => typeof p === "string" && p.startsWith(`${userId}/`) && !p.includes("..")))
    return { error: "Something went wrong with your photos. Add them again." };
  const firstName = text(o.firstName, 1, 40);
  if (!firstName) return { error: "Add your first name." };
  const school = text(o.school, 2, 60);
  if (!school) return { error: "Add your school." };
  if (o.agreeToContact !== true) return { error: "Agree to let signed-in students email you, so renters can reach you." };

  return {
    row: {
      title,
      description,
      neighborhood: o.neighborhood,
      cross_streets: crossStreets,
      room_type: o.roomType,
      sleeps,
      price,
      available_from: o.availableFrom,
      available_to: o.availableTo,
      furnished: o.furnished,
      photos,
      first_name: firstName,
      school,
    },
  };
}

// Saves a new listing as pending for the signed-in user. The contact email is
// their account email, read here, never sent by the browser.
export async function createListing(input: unknown): Promise<SaveResult> {
  const supabase = await createClient();
  const user = supabase ? await getCurrentUser(supabase) : null;
  if (!supabase || !user) return { ok: false, error: "Sign in to post your room.", signedOut: true };
  if (!user.email) return { ok: false, error: "Your account has no email address, so renters couldn't reach you." };

  const checked = validateListing(input, user.id);
  if ("error" in checked) return { ok: false, error: checked.error };

  const { data, error } = await supabase
    .from("student_listings")
    .insert({ ...checked.row, user_id: user.id, contact_email: user.email })
    .select("id")
    .single();
  if (error || !data) {
    console.warn("[listings] couldn't save:", error?.message);
    return { ok: false, error: "We couldn't save your listing. Try again in a minute." };
  }
  return { ok: true, id: data.id as string, live: (data as { status?: string }).status === "approved" };
}

// Removes one of the signed-in user's listings and its photos.
export async function deleteListing(id: string): Promise<"ok" | "error"> {
  if (!UUID.test(id)) return "error";
  const supabase = await createClient();
  const user = supabase ? await getCurrentUser(supabase) : null;
  if (!supabase || !user) return "error";

  const { data, error } = await supabase
    .from("student_listings")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("photos")
    .maybeSingle();
  if (error || !data) {
    if (error) console.warn("[listings] couldn't remove:", error.message);
    return "error";
  }
  const { error: photoError } = await supabase.storage.from(PHOTO_BUCKET).remove(data.photos as string[]);
  if (photoError) console.warn("[listings] couldn't remove photos:", photoError.message);
  return "ok";
}
