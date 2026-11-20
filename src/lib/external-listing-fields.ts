import type { RoomType } from "@/content/listings";

// A link card: a sublet someone found on another site and shared with Gable.
// It has the same fields search filters on (price, dates, area, room type,
// furnished, sleeps), confirmed by the person who shared it, plus the page's
// own preview (title, image) and the link that opens the original listing.
// Gable never checked these, and the card says so.
export type ExternalListing = {
  kind: "external";
  id: string;
  url: string;
  source: string; // e.g. "Ohana"
  title: string;
  description: string;
  imageUrl: string | null; // the page's own preview image, shown from its site
  neighborhood: string;
  roomType: RoomType;
  sleeps: number;
  price: number; // per month, USD
  availableFrom: string; // YYYY-MM-DD
  availableTo: string; // YYYY-MM-DD
  furnished: boolean;
  addedOn: string; // YYYY-MM-DD
  sample?: boolean; // made-up demo card (staging only)
};

// What the share form sends. Checked again on the server and in the database.
export type ExternalListingInput = {
  url: string;
  source: string;
  title: string;
  description: string;
  imageUrl: string | null;
  neighborhood: string;
  roomType: string;
  sleeps: number;
  price: number;
  availableFrom: string;
  availableTo: string;
  furnished: boolean;
};

// What reading a pasted link gives back: the page's preview, plus Claude's (or
// the keyword fallback's) best guess at the search fields, for the sharer to
// check and fix before sending.
export type LinkPreview = {
  url: string;
  source: string;
  title: string;
  description: string;
  imageUrl: string | null;
  guess: {
    price: number | null;
    availableFrom: string | null;
    availableTo: string | null;
    neighborhood: string | null;
    roomType: RoomType | null;
    furnished: boolean | null;
    sleeps: number | null;
  };
};

// A friendly name for the site a link is on ("www.listingsproject.com" ->
// "Listings Project"). Unknown sites get their domain.
const KNOWN_SOURCES: [RegExp, string][] = [
  [/(^|\.)liveohana\.(ai|com)$|(^|\.)ohana\.(ai|com)$/, "Ohana"],
  [/(^|\.)listingsproject\.com$/, "Listings Project"],
  [/(^|\.)facebook\.com$|(^|\.)fb\.com$/, "Facebook"],
  [/(^|\.)craigslist\.org$/, "Craigslist"],
  [/(^|\.)streeteasy\.com$/, "StreetEasy"],
  [/(^|\.)zillow\.com$/, "Zillow"],
  [/(^|\.)leasebreak\.com$/, "Leasebreak"],
  [/(^|\.)spareroom\.com$/, "SpareRoom"],
  [/(^|\.)instagram\.com$/, "Instagram"],
];

export function sourceName(url: string): string {
  try {
    const host = new URL(url).hostname.toLowerCase();
    for (const [re, name] of KNOWN_SOURCES) if (re.test(host)) return name;
    return host.replace(/^www\./, "").slice(0, 40);
  } catch {
    return "Another site";
  }
}
