"use client";

import dynamic from "next/dynamic";
import { SAMPLE_LISTINGS, type SampleListing } from "@/content/listings";
import { useFavorites } from "./FavoritesProvider";
import type { StudentListing } from "@/lib/student-listing-fields";
import "@/app/search/search.css";
import { Heart } from "./HeartButton";
import { ResultCard } from "./ResultCard";

// Leaflet touches `window`, so the map only loads in the browser.
const FavoritesMap = dynamic(() => import("./FavoritesMap"), {
  ssr: false,
  loading: () => <div className="fav-map-loading">Loading map…</div>,
});

// The /favorites page body: every saved listing, on a map and in a list.
// Unhearting one removes it right away. Your account and Sign out are in the sidebar.
export function FavoritesView({ real = [] }: { real?: StudentListing[] }) {
  const { ids } = useFavorites();
  const saved = ids
    .map((id) => SAMPLE_LISTINGS.find((l) => l.id === id))
    .filter((l): l is SampleListing => Boolean(l));

  // Real listings have no map coordinates yet, so they show as cards under the
  // map. Unhearting one removes it from the list right away.
  const savedReal = real.filter((l) => ids.includes(l.id));
  return (
    <>
      <div className="fav-head">
        <div>
          <div className="eyebrow">Favorites</div>
          <h1>Places you&apos;ve saved</h1>
        </div>
        <span className="saved-count" aria-live="polite">
          <Heart filled size={16} />
          {saved.length + savedReal.length} saved
        </span>
      </div>

      {/* The map always shows; with nothing saved it's just the neighborhood, no pins. */}
      <FavoritesMap listings={saved} />

      {savedReal.length > 0 && (
        <div className="results" style={{ marginTop: 24 }}>
          {savedReal.map((l) => (
            <ResultCard key={l.id} l={l} />
          ))}
        </div>
      )}
    </>
  );
}
