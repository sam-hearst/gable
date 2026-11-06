// Real sublets posted by students on /sublet-your-room (supabase/student_listings.sql).
// Shared by the server (saving, reading) and the browser (the form, photo
// uploads), so nothing here may read a secret.

import type { RoomType, SampleListing } from "@/content/listings";
import { SUPABASE_URL } from "./supabase/config";

export const PHOTO_BUCKET = "listing-photos";
export const MAX_PHOTOS = 6;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

// The areas search knows, spelled like the sample listings so the same
// filters match. Kept in step with the check in supabase/student_listings.sql.
export const NEIGHBORHOODS = [
  "Morningside Heights",
  "Upper West Side",
  "Harlem",
  "Hamilton Heights",
  "Midtown",
  "Williamsburg, Brooklyn",
  "Prospect Heights, Brooklyn",
];

export const ROOM_TYPES: RoomType[] = ["private room", "studio", "shared"];

export type ListingStatus = "pending" | "approved" | "rejected";

export type StudentListing = {
  kind: "student";
  id: string;
  status: ListingStatus;
  title: string;
  description: string;
  neighborhood: string;
  crossStreets: string;
  roomType: RoomType;
  sleeps: number;
  price: number; // per month, USD
  availableFrom: string; // YYYY-MM-DD
  availableTo: string; // YYYY-MM-DD
  furnished: boolean;
  photos: { src: string; alt: string }[];
  lister: { firstName: string; school: string };
  checked: string[]; // filled in by the team when they approve
  contactEmail: string | null; // only read for signed-in visitors
};

// Anything search can show: a made-up sample or a real student listing.
export type AnyListing = SampleListing | StudentListing;

export const isStudentListing = (l: AnyListing): l is StudentListing => "kind" in l && l.kind === "student";

// What the form sends to the server action. Checked again on the server.
export type ListingInput = {
  title: string;
  description: string;
  neighborhood: string;
  crossStreets: string;
  roomType: string;
  sleeps: number;
  price: number;
  availableFrom: string;
  availableTo: string;
  furnished: boolean;
  photos: string[]; // paths in PHOTO_BUCKET, under the lister's own folder
  firstName: string;
  school: string;
  agreeToContact: boolean;
};

export const photoUrl = (path: string) =>
  `${SUPABASE_URL}/storage/v1/object/public/${PHOTO_BUCKET}/${path.split("/").map(encodeURIComponent).join("/")}`;
