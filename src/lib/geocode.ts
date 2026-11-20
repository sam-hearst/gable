import "server-only";

// Finds where a street address is, with NYC GeoSearch (NYC Planning Labs: free,
// no key, the same service the address autofill falls back to). Used to place a
// real listing's pin on the Favorites map. Returns [lat, lng], or null if it
// can't be found or the service is slow, so the map falls back to the middle of
// the listing's neighborhood.
export async function geocodeAddress(address: string): Promise<[number, number] | null> {
  const text = address.trim();
  if (!text) return null;
  try {
    const res = await fetch(`https://geosearch.planninglabs.nyc/v2/search?size=1&text=${encodeURIComponent(text)}`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { features?: { geometry?: { coordinates?: [number, number] } }[] };
    const c = data.features?.[0]?.geometry?.coordinates;
    return c && Number.isFinite(c[0]) && Number.isFinite(c[1]) ? [c[1], c[0]] : null;
  } catch {
    return null;
  }
}
