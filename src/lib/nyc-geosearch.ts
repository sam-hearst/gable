// Address autofill for "List your room". Uses Google Places autocomplete when
// the Google key allows it (it forgives typos and shows a main line plus a
// secondary line), and falls back to NYC GeoSearch (NYC Planning Labs: free, no
// key, New York City only, exact spelling) when it doesn't. Both return the
// neighborhood, so the area dropdown fills itself. Browser-safe: the Google key
// is a public, referrer-restricted browser key, like the map's.

import { NEIGHBORHOODS } from "./student-listing-fields";

export type AddressSuggestion = {
  id: string;
  main: string; // "535 West 113th Street"
  secondary: string; // "New York, NY, USA" or the neighborhood
  street: string; // "West 113th Street", no house number: this is what we show publicly
  neighborhood: string | null; // one of NEIGHBORHOODS, or null if it isn't one we list yet
  placeId?: string; // Google results: street and neighborhood arrive in resolveSuggestion
};

type Feature = {
  properties: { gid?: string; label?: string; name?: string; housenumber?: string; street?: string; borough?: string; neighbourhood?: string };
};

const ORDINAL = (n: string) => {
  const last = n.slice(-2);
  if (["11", "12", "13"].includes(last)) return `${n}th`;
  return `${n}${({ "1": "st", "2": "nd", "3": "rd" } as Record<string, string>)[n.slice(-1)] ?? "th"}`;
};

// "WEST 113 STREET" -> "West 113th Street"
export function prettyStreet(raw: string) {
  return raw
    .toLowerCase()
    .replace(/\b[a-z]/g, (c) => c.toUpperCase())
    .replace(/\b(\d+)(?=\s+(?:Street|St|Avenue|Ave|Place|Pl|Road|Rd)\b)/g, (n) => ORDINAL(n));
}

// NYC's neighborhood names -> the areas Gable lists. Anything else is left for
// the lister to pick from the dropdown.
export function toGableArea(neighbourhood: string | undefined, borough: string | undefined): string | null {
  const n = (neighbourhood ?? "").toLowerCase();
  const exact = NEIGHBORHOODS.find((a) => a.toLowerCase() === n);
  if (exact) return exact;
  if (/manhattan valley|upper west side|lincoln square|west side/.test(n)) return "Upper West Side";
  if (/harlem|east harlem|spanish harlem/.test(n)) return "Harlem";
  if (/hamilton heights|sugar hill|manhattanville/.test(n)) return "Hamilton Heights";
  if (/midtown|hell's kitchen|clinton|murray hill|garment|theater/.test(n)) return "Midtown";
  if (borough === "Brooklyn" && /williamsburg/.test(n)) return "Williamsburg, Brooklyn";
  if (borough === "Brooklyn" && /prospect heights/.test(n)) return "Prospect Heights, Brooklyn";
  return null;
}

const STREET_WORDS = /^(street|st|avenue|ave|place|pl|road|rd|drive|dr|boulevard|blvd|lane|ln|court|ct|terrace|way)$/i;

export function stripHouseNumber(name: string) {
  const m = name.match(/^\d+[-\d]*[a-z]?\s+(.+)$/i);
  return m && !STREET_WORDS.test(m[1]) ? m[1] : name;
}

async function searchGeoSearch(text: string, signal?: AbortSignal): Promise<AddressSuggestion[]> {
  const res = await fetch(
    `https://geosearch.planninglabs.nyc/v2/autocomplete?size=6&text=${encodeURIComponent(text)}`,
    { signal },
  );
  if (!res.ok) throw new Error(`geosearch ${res.status}`);
  const data = (await res.json()) as { features?: Feature[] };
  const seen = new Set<string>();
  const out: AddressSuggestion[] = [];
  for (const { properties: p } of data.features ?? []) {
    const name = p.name ?? p.street;
    if (!name) continue;
    // Some results carry the street and house number separately, others only
    // "70 MORNINGSIDE DRIVE" in the name. Either way the street is what's left
    // without the number ("5 AVENUE" and "113 STREET" are street names, so they stay).
    const street = prettyStreet(p.street ?? stripHouseNumber(name));
    const addressLine = p.housenumber ? `${p.housenumber} ${street}` : prettyStreet(name);
    const area = toGableArea(p.neighbourhood, p.borough);
    if (seen.has(addressLine)) continue;
    seen.add(addressLine);
    out.push({
      id: p.gid ?? addressLine,
      main: addressLine,
      secondary: [p.neighbourhood, p.borough].filter(Boolean).join(", "),
      street,
      neighborhood: area,
    });
  }
  return out;
}

// ---------- Google Places (New) ----------

const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
// Once Google refuses (Places API not enabled on the key, or over quota), stop
// asking for this page view and use NYC search instead.
let googleRefused = false;

type GooglePrediction = {
  placePrediction?: {
    placeId: string;
    text?: { text: string };
    structuredFormat?: { mainText?: { text: string }; secondaryText?: { text: string } };
  };
};

async function searchGoogle(text: string, signal?: AbortSignal): Promise<AddressSuggestion[]> {
  const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": GOOGLE_KEY! },
    body: JSON.stringify({
      input: text,
      includedRegionCodes: ["us"],
      includedPrimaryTypes: ["street_address", "premise", "subpremise", "route"],
      // Only New York City's five boroughs, where every listing is.
      locationRestriction: { rectangle: { low: { latitude: 40.477, longitude: -74.26 }, high: { latitude: 40.918, longitude: -73.7 } } },
    }),
    signal,
  });
  if (!res.ok) {
    googleRefused = true;
    throw new Error(`google ${res.status}`);
  }
  const data = (await res.json()) as { suggestions?: GooglePrediction[] };
  return (data.suggestions ?? []).flatMap(({ placePrediction: p }) => {
    if (!p) return [];
    // The rectangle around the five boroughs also catches a bit of New Jersey.
    if (!/, NY\b/.test(p.structuredFormat?.secondaryText?.text ?? "")) return [];
    const main = p.structuredFormat?.mainText?.text ?? p.text?.text ?? "";
    if (!main) return [];
    return [
      {
        id: p.placeId,
        placeId: p.placeId,
        main,
        secondary: p.structuredFormat?.secondaryText?.text ?? "",
        // Filled in by resolveSuggestion once they pick it.
        street: prettyStreet(stripHouseNumber(main)),
        neighborhood: null,
      },
    ];
  });
}

type AddressComponent = { longText?: string; types?: string[] };

// Google often has no neighborhood for an address (just "Manhattan" and a ZIP),
// so look the coordinates up in NYC's own neighborhood data.
async function neighborhoodAt(lat: number, lon: number, signal?: AbortSignal): Promise<string | null> {
  const res = await fetch(`https://geosearch.planninglabs.nyc/v2/reverse?size=1&point.lat=${lat}&point.lon=${lon}`, { signal });
  if (!res.ok) return null;
  const f = ((await res.json()) as { features?: Feature[] }).features?.[0];
  return f ? toGableArea(f.properties.neighbourhood, f.properties.borough) : null;
}

// Google's suggestion only has text. Picking one asks for the details, which
// carry the street and the neighborhood. Other suggestions are already complete.
export async function resolveSuggestion(s: AddressSuggestion, signal?: AbortSignal): Promise<AddressSuggestion> {
  if (!s.placeId || !GOOGLE_KEY) return s;
  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(s.placeId)}`, {
      headers: { "X-Goog-Api-Key": GOOGLE_KEY, "X-Goog-FieldMask": "addressComponents,location" },
      signal,
    });
    if (!res.ok) return s;
    const place = (await res.json()) as { addressComponents?: AddressComponent[]; location?: { latitude: number; longitude: number } };
    const parts = place.addressComponents ?? [];
    const named = (type: string) => parts.find((c) => c.types?.includes(type))?.longText;
    const route = named("route");
    const borough = named("sublocality_level_1") ?? named("sublocality");
    const hood = named("neighborhood");
    return {
      ...s,
      street: route ? prettyStreet(route) : s.street,
      neighborhood:
        toGableArea(hood, borough) ??
        (place.location ? await neighborhoodAt(place.location.latitude, place.location.longitude, signal).catch(() => null) : null),
    };
  } catch {
    return s;
  }
}

export async function searchAddresses(text: string, signal?: AbortSignal): Promise<AddressSuggestion[]> {
  if (GOOGLE_KEY && !googleRefused) {
    try {
      return await searchGoogle(text, signal);
    } catch (e) {
      if (signal?.aborted) throw e;
      // fall through to NYC search
    }
  }
  return searchGeoSearch(text, signal);
}
