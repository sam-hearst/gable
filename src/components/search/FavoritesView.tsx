"use client";

import dynamic from "next/dynamic";
import { SAMPLE_LISTINGS } from "@/content/listings";
import { useFavorites } from "./FavoritesProvider";
import type { StudentListing } from "@/lib/student-listing-fields";
import { Heart } from "./HeartButton";
import { realPin, samplePin } from "@/components/map/pins";

// Leaflet touches `window`, so the map only loads in the browser.
const FavoritesMap = dynamic(() => import("./FavoritesMap"), {
  ssr: false,
  loading: () => <div className="fav-map-loading">Loading map…</div>,
});

// The /favorites page body: every saved listing, on a map and in a list.
// Unhearting one removes it right away. Your account and Sign out are in the sidebar.
export function FavoritesView({ real = [], coords = {} }: { real?: StudentListing[]; coords?: Record<string, [number, number] | null> }) {
  const { ids } = useFavorites();
  // In the order they were saved. Real listings pin to their neighborhood.
  const pins = ids.flatMap((id) => {
    const sample = SAMPLE_LISTINGS.find((l) => l.id === id);
    if (sample) return [samplePin(sample)];
    const found = real.find((l) => l.id === id);
    return found ? [realPin(found, coords[found.id])] : [];
  });

  return (
    <>
      <div className="fav-head">
        <div>
          <div className="eyebrow">Favorites</div>
          <h1>Places you&apos;ve saved</h1>
        </div>
        <span className="saved-count" aria-live="polite">
          <Heart filled size={16} />
          {pins.length} saved
        </span>
      </div>

      {/* The map always shows; with nothing saved it's just the neighborhood, no pins. */}
      <FavoritesMap listings={pins} />
      {pins.some((p) => p.approximate) && (
        <p className="fine" style={{ marginTop: 12 }}>
          We couldn&apos;t find the exact address for some listings, so their pins sit in the middle of the neighborhood.
        </p>
      )}
    </>
  );
}
