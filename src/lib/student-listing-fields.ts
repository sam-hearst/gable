// Real sublets posted by students on /sublet-your-room (supabase/student_listings.sql).
// Shared by the server (saving, reading) and the browser (the form, photo
// uploads), so nothing here may read a secret.

import type { RoomType, SampleListing } from "@/content/listings";
import { SUPABASE_URL } from "./supabase/config";

export const PHOTO_BUCKET = "listing-photos";
export const MAX_PHOTOS = 6;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

// The neighborhoods a lister can pick, grouped by borough for the dropdown.
// Named the way StreetEasy names them, so they read the way New Yorkers
// search. Manhattan names stand alone; the others end in ", Borough" like the
// sample listings ("Williamsburg, Brooklyn"), so a search for "Brooklyn" still
// matches them. Each borough ends with the borough itself, for an address in
// a neighborhood that isn't listed here.
// Kept in step with the check in supabase/student_listings.sql.
const inBorough = (borough: string, names: string[]) => names.map((n) => `${n}, ${borough}`).concat(borough);

export const NEIGHBORHOOD_GROUPS: { borough: string; areas: string[] }[] = [
  {
    borough: "Manhattan",
    areas: [
      "Morningside Heights",
      "Upper West Side",
      "Manhattan Valley",
      "Lincoln Square",
      "Harlem",
      "West Harlem",
      "East Harlem",
      "Hamilton Heights",
      "Washington Heights",
      "Hudson Heights",
      "Inwood",
      "Upper East Side",
      "Yorkville",
      "Lenox Hill",
      "Carnegie Hill",
      "Roosevelt Island",
      "Midtown",
      "Midtown East",
      "Midtown South",
      "Hell's Kitchen",
      "Hudson Yards",
      "Murray Hill",
      "Kips Bay",
      "NoMad",
      "Gramercy Park",
      "Stuyvesant Town",
      "Flatiron",
      "Chelsea",
      "West Village",
      "Greenwich Village",
      "East Village",
      "NoHo",
      "SoHo",
      "Nolita",
      "Little Italy",
      "Lower East Side",
      "Chinatown",
      "Two Bridges",
      "Tribeca",
      "Financial District",
      "Battery Park City",
      "Manhattan",
    ],
  },
  {
    borough: "Brooklyn",
    areas: inBorough("Brooklyn", [
      "Williamsburg",
      "East Williamsburg",
      "Greenpoint",
      "Bushwick",
      "Bedford-Stuyvesant",
      "Clinton Hill",
      "Fort Greene",
      "Prospect Heights",
      "Crown Heights",
      "Prospect Lefferts Gardens",
      "Flatbush",
      "Ditmas Park",
      "Kensington",
      "Park Slope",
      "Windsor Terrace",
      "Gowanus",
      "Carroll Gardens",
      "Cobble Hill",
      "Boerum Hill",
      "Columbia Street Waterfront District",
      "Brooklyn Heights",
      "Downtown Brooklyn",
      "DUMBO",
      "Vinegar Hill",
      "Red Hook",
      "Sunset Park",
      "Bay Ridge",
      "Midwood",
    ]),
  },
  {
    borough: "Queens",
    areas: inBorough("Queens", [
      "Astoria",
      "Ditmars-Steinway",
      "Long Island City",
      "Sunnyside",
      "Woodside",
      "Jackson Heights",
      "Elmhurst",
      "Rego Park",
      "Forest Hills",
      "Kew Gardens",
      "Ridgewood",
      "Flushing",
    ]),
  },
  {
    borough: "Bronx",
    areas: inBorough("Bronx", ["Riverdale", "Kingsbridge", "Fordham", "Concourse", "Mott Haven", "Port Morris"]),
  },
  {
    borough: "Staten Island",
    areas: inBorough("Staten Island", ["St. George", "Tompkinsville", "Stapleton"]),
  },
];

export const NEIGHBORHOODS = NEIGHBORHOOD_GROUPS.flatMap((g) => g.areas);
export const BOROUGHS = NEIGHBORHOOD_GROUPS.map((g) => g.borough);

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

// Today's date (YYYY-MM-DD) in New York, where every listing is. Plain
// toISOString() is UTC, which is already tomorrow after about 8pm here.
export const nycToday = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());
