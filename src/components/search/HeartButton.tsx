"use client";

import Link from "next/link";
import { useFavorites } from "./FavoritesProvider";
import "./favorites.css";

// Lucide "heart", 2px stroke; filled when saved.
export function Heart({ filled = false, size = 20 }: { filled?: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

export function HeartButton({ id, title, className = "heart-btn" }: { id: string; title: string; className?: string }) {
  const { ids, signedIn, toggle } = useFavorites();
  const saved = ids.includes(id);
  const label = !signedIn ? `Sign in to save ${title}` : saved ? `Remove ${title} from favorites` : `Save ${title}`;
  return (
    <button type="button" className={className} aria-pressed={saved} aria-label={label} title={label} onClick={() => toggle(id)}>
      <Heart filled={saved} />
    </button>
  );
}

// "♥ 3 saved", linking to the favorites page. Shown on /search when signed in.
export function SavedCount() {
  const { ids, signedIn } = useFavorites();
  if (!signedIn) return null;
  return (
    <Link className="saved-count" href="/favorites" aria-live="polite">
      <Heart filled size={16} />
      {ids.length} saved
      <span className="saved-count-go">See them on a map &rarr;</span>
    </Link>
  );
}
