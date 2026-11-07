"use client";

import { type ReactNode, useRef, useState } from "react";
import { CityMap, type MapPlace } from "@/components/map/CityMap";

// Search results like Airbnb: the 3D map on the left, the listings (photo
// cards) on the right. Tapping a pin highlights its card and scrolls to it;
// clicking a card opens the listing. Each card is wrapped by the page in an
// element with data-place-id.
export function ResultsWithMap({ places, top, children }: { places: MapPlace[]; top: ReactNode; children: ReactNode }) {
  const [active, setActive] = useState<string | null>(null);
  const list = useRef<HTMLDivElement>(null);

  function select(id: string | null) {
    setActive(id);
    const card = id ? list.current?.querySelector<HTMLElement>(`[data-place-id="${CSS.escape(id)}"]`) : null;
    card?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest" });
  }

  return (
    <>
      <div className="search-results-top">{top}</div>
      <div className="results-split">
        <div className="results-split-map">
          {places.length > 0 ? (
            <CityMap places={places} activeId={active} onSelect={select} showPanel={false} />
          ) : (
            <div className="city-map-empty">No places to show on the map for this search.</div>
          )}
        </div>
        <div className="results-split-list" ref={list} data-active={active ?? undefined}>
          {children}
        </div>
      </div>
      {/* Highlight the card whose pin is selected. */}
      {active && <style>{`.results-split-list [data-place-id="${active.replace(/"/g, "")}"] .result { outline: 2px solid var(--accent); outline-offset: 3px; }`}</style>}
    </>
  );
}
