"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { SAMPLE_LISTINGS, type SampleListing } from "@/content/listings";
import { useFavorites } from "./FavoritesProvider";
import { Heart } from "./HeartButton";

// Leaflet touches `window`, so the map only loads in the browser.
const FavoritesMap = dynamic(() => import("./FavoritesMap"), {
  ssr: false,
  loading: () => <div className="fav-map-loading">Loading map…</div>,
});

// The /favorites page body: every saved listing, on a map and in a list.
// Unhearting one removes it right away.
export function FavoritesView({ email }: { email: string | null }) {
  const { ids } = useFavorites();
  const saved = ids
    .map((id) => SAMPLE_LISTINGS.find((l) => l.id === id))
    .filter((l): l is SampleListing => Boolean(l));

  return (
    <>
      <div className="fav-head">
        <div>
          <div className="eyebrow">Favorites</div>
          <h1>Places you&apos;ve saved</h1>
        </div>
        <span className="saved-count" aria-live="polite">
          <Heart filled size={16} />
          {saved.length} saved
        </span>
      </div>
      <form className="fav-account" action="/auth/signout" method="post">
        {email ? `Signed in as ${email}` : "Signed in"}
        <button type="submit">Sign out</button>
      </form>

      {saved.length ? (
        <FavoritesMap listings={saved} />
      ) : (
        <div className="fav-empty">
          <Heart size={28} />
          <p>Heart a few places to see them on a map.</p>
          <Link className="btn btn-sm" href="/">
            Start a search
          </Link>
        </div>
      )}
    </>
  );
}
