// Address autofill for "List your room", from NYC GeoSearch (NYC Planning
// Labs): free, no API key, New York City only. It returns the neighborhood too,
// so the area dropdown can fill itself. Browser-safe: nothing here is secret.

import { NEIGHBORHOODS } from "./student-listing-fields";

export type AddressSuggestion = {
  id: string;
  full: string; // "535 West 113th Street, Manhattan"
  street: string; // "West 113th Street", no house number: this is what we show publicly
  neighborhood: string | null; // one of NEIGHBORHOODS, or null if it isn't one we list yet
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

export async function searchAddresses(text: string, signal?: AbortSignal): Promise<AddressSuggestion[]> {
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
    const full = [addressLine, p.borough].filter(Boolean).join(", ");
    const id = p.gid ?? full;
    if (seen.has(full)) continue;
    seen.add(full);
    out.push({ id, full, street, neighborhood: toGableArea(p.neighbourhood, p.borough) });
  }
  return out;
}
