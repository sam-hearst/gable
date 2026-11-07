"use client";

import { type ReactNode, useState } from "react";
import { CityMap, type MapPlace } from "@/components/map/CityMap";

// Search results as a list (the cards) or on the 3D city map.
export function ResultsWithMap({ places, top, children }: { places: MapPlace[]; top: ReactNode; children: ReactNode }) {
  const [view, setView] = useState<"list" | "map">("list");
  const [active, setActive] = useState<string | null>(null);

  return (
    <>
      <div className="search-results-top">
        <div className="view-switch" role="group" aria-label="Show results as">
          <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")}>
            List
          </button>
          <button type="button" aria-pressed={view === "map"} onClick={() => setView("map")} disabled={!places.length}>
            Map
          </button>
        </div>
        {top}
      </div>
      {view === "map" ? (
        <div className="search-map">
          <CityMap places={places} activeId={active} onSelect={setActive} />
        </div>
      ) : (
        children
      )}
    </>
  );
}
