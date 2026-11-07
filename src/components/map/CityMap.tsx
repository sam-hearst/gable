"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { CAMPUS, type LngLat, STOPS, nearestStop, walkMinutes } from "@/content/morningside";
import { money, shortDate } from "@/lib/format";
import { HeartButton } from "@/components/search/HeartButton";
import { type MapLibreNS, loadMapLibre } from "./loadMapLibre";
import { pillImage } from "./mapArt";
import { cityStyle } from "./mapStyle";
import "./city-map.css";

export type MapPlace = {
  id: string;
  title: string;
  price: number;
  lat: number;
  lng: number;
  photo: { src: string; alt: string };
  checked: string[];
  href: string;
  // Shown in the side panel when the pin is tapped.
  details?: {
    neighborhood: string;
    crossStreets: string;
    availableFrom: string;
    availableTo: string;
    roomType: string;
    furnished: boolean;
    sleeps: number;
    lister: { firstName: string; school: string };
    replySpeed: string;
    goodFor: string;
  };
};

const FLY_IN_DONE = "gable-map-flyin";
const HOME = { center: [-73.9605, 40.8055] as LngLat, zoom: 15.4, pitch: 58, bearing: -28 };
const PIN = "#2B7A4B";
const PIN_ON = "#1D5C37";

const reduceMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// The 3D map: a clean, model-like city (real streets and buildings at their
// real heights, in soft colors) drawn with MapLibre from free OpenStreetMap
// data. Price pins with walk time, "N places" bubbles that zoom in when tapped,
// subway dots, 5 and 10 minute walking zones, and Google Maps-style controls.
// Tapping a pin selects it; with `showPanel`, the whole listing opens on the right.
// If the map can't load, it shows `fallback` instead.
export function CityMap({
  places,
  activeId,
  onSelect,
  fallback,
  showPanel = true,
}: {
  places: MapPlace[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
  fallback?: ReactNode;
  // Off where a list beside the map already shows each place (Favorites).
  showPanel?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreNS>(null);
  const onSelectRef = useRef(onSelect);
  const showPanelRef = useRef(showPanel);
  const [ready, setReady] = useState(false);
  const [flat, setFlat] = useState(false);
  const [failed, setFailed] = useState(false);
  const [subway, setSubway] = useState(true);

  const placesKey = places.map((p) => p.id).join(",");

  useEffect(() => {
    onSelectRef.current = onSelect;
    showPanelRef.current = showPanel;
  });

  useEffect(() => {
    const canvas = box.current?.querySelector<HTMLElement>(".city-canvas");
    if (!canvas) return;
    let map: MapLibreNS = null;
    let cancelled = false;

    loadMapLibre()
      .then(async (maplibregl) => {
        if (cancelled) return;
        let seen = false;
        try {
          seen = sessionStorage.getItem(FLY_IN_DONE) === "1";
          sessionStorage.setItem(FLY_IN_DONE, "1");
        } catch {}
        const flyIn = !seen && !reduceMotion();
        map = new maplibregl.Map({
          container: canvas,
          style: cityStyle(CAMPUS),
          ...(flyIn ? { center: [-73.975, 40.77], zoom: 12.2, pitch: 30, bearing: 0 } : HOME),
          maxPitch: 75,
          attributionControl: false,
          cooperativeGestures: false,
        });
        mapRef.current = map;
        map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");
        map.on("error", () => {});

        await new Promise((r) => map.once("load", r));
        await document.fonts?.ready;
        if (cancelled) return;

        // Pins and bubbles are images in the map, so they move exactly with it.
        places.forEach((p) => {
          const walk = `${walkMinutes([p.lng, p.lat], CAMPUS)} min`;
          const add = (name: string, color: string) => {
            const { image, pixelRatio } = pillImage(money(p.price), walk, color);
            map.addImage(name, image, { pixelRatio });
          };
          add(`pin-${p.id}`, PIN);
          add(`pin-on-${p.id}`, PIN_ON);
        });
        for (let n = 2; n <= 20; n++) {
          const { image, pixelRatio } = pillImage(n === 20 ? "20+" : String(n), "places", PIN);
          map.addImage(`group-${n}`, image, { pixelRatio });
        }

        map.addSource("places", {
          type: "geojson",
          cluster: true,
          clusterRadius: 38,
          clusterMaxZoom: 16,
          data: {
            type: "FeatureCollection",
            features: places.map((p) => ({ type: "Feature", properties: { id: p.id }, geometry: { type: "Point", coordinates: [p.lng, p.lat] } })),
          },
        });
        map.addSource("stops", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: STOPS.map((s) => ({
              type: "Feature",
              properties: { name: s.name, color: s.lines[0][1], lines: s.lines.map(([l]) => l).join(" ") },
              geometry: { type: "Point", coordinates: s.at },
            })),
          },
        });
        // Subway: small dots in the line's color; the station name only up close.
        map.addLayer({ id: "stops-dot", type: "circle", source: "stops", minzoom: 13.5,
          paint: {
            "circle-color": ["get", "color"],
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 13.5, 3, 17, 7],
            "circle-stroke-color": "#ffffff", "circle-stroke-width": 1.5, "circle-pitch-alignment": "viewport",
          } });
        map.addLayer({ id: "stops-name", type: "symbol", source: "stops", minzoom: 15.5,
          layout: { "text-field": ["concat", ["get", "name"], "  ", ["get", "lines"]], "text-font": ["Noto Sans Bold"], "text-size": 11,
            "text-offset": [0, 1.2], "text-anchor": "top" },
          paint: { "text-color": "#1E2B24", "text-halo-color": "#FFFCF6", "text-halo-width": 1.6 } });
        map.addLayer({ id: "groups", type: "symbol", source: "places", filter: ["has", "point_count"],
          layout: { "icon-image": ["concat", "group-", ["to-string", ["min", ["get", "point_count"], 20]]], "icon-anchor": "bottom", "icon-allow-overlap": true } });
        map.addLayer({ id: "pins", type: "symbol", source: "places", filter: ["!", ["has", "point_count"]],
          layout: { "icon-image": ["concat", "pin-", ["get", "id"]], "icon-anchor": "bottom", "icon-allow-overlap": true } });

        map.on("click", "pins", (e: MapLibreNS) => onSelectRef.current(e.features[0].properties.id));
        map.on("click", "groups", async (e: MapLibreNS) => {
          const f = e.features[0];
          const zoom = await map.getSource("places").getClusterExpansionZoom(f.properties.cluster_id);
          map.easeTo({ center: f.geometry.coordinates, zoom: zoom + 0.4, duration: reduceMotion() ? 0 : 900 });
        });
        for (const layer of ["pins", "groups"]) {
          map.on("mouseenter", layer, () => (map.getCanvas().style.cursor = "pointer"));
          map.on("mouseleave", layer, () => (map.getCanvas().style.cursor = ""));
        }

        // The compass turns with the map; the 2D/3D button follows the tilt.
        const needle = box.current?.querySelector<HTMLElement>(".city-compass-needle");
        const sync = () => {
          if (needle) needle.style.transform = `rotate(${-map.getBearing()}deg)`;
        };
        map.on("rotate", sync);
        map.on("pitchend", () => setFlat(map.getPitch() < 10));
        sync();

        if (flyIn) map.flyTo({ ...HOME, duration: 4500, curve: 1.4, essential: true });
        setReady(true);
      })
      .catch(() => !cancelled && setFailed(true));

    return () => {
      cancelled = true;
      mapRef.current = null;
      setReady(false);
      map?.remove();
    };
    // Rebuild only when the set of places changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placesKey]);

  // A place was picked (pin or list): darken its pin and fly there.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !map.getLayer("pins")) return;
    map.setLayoutProperty(
      "pins",
      "icon-image",
      activeId ? ["case", ["==", ["get", "id"], activeId], `pin-on-${activeId}`, ["concat", "pin-", ["get", "id"]]] : ["concat", "pin-", ["get", "id"]],
    );
    const p = places.find((x) => x.id === activeId);
    const right = activeId && showPanelRef.current ? 360 : 0;
    if (p) map.easeTo({ center: [p.lng, p.lat], zoom: Math.max(map.getZoom(), 16.2), pitch: Math.max(map.getPitch(), 50), padding: { right }, duration: reduceMotion() ? 0 : 1100 });
    else map.easeTo({ padding: { right: 0 }, duration: reduceMotion() ? 0 : 500 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    for (const l of ["stops-dot", "stops-name"]) if (map.getLayer(l)) map.setLayoutProperty(l, "visibility", subway ? "visible" : "none");
  }, [subway, ready]);

  const ease = reduceMotion() ? 0 : 500;
  const controls = {
    north: () => mapRef.current?.easeTo({ bearing: 0, duration: ease }),
    rotate: (deg: number) => mapRef.current?.easeTo({ bearing: (mapRef.current?.getBearing() ?? 0) + deg, duration: ease }),
    tilt: () => mapRef.current?.easeTo({ pitch: flat ? 58 : 0, duration: ease }),
    zoom: (by: number) => mapRef.current?.easeTo({ zoom: (mapRef.current?.getZoom() ?? 15) + by, duration: ease }),
  };

  if (failed) return <>{fallback ?? <div className="city-map-empty">The map isn&apos;t available right now.</div>}</>;

  const active = showPanel ? places.find((p) => p.id === activeId) : undefined;

  return (
    <div className={`city-map${active ? " has-panel" : ""}`} ref={box}>
      <div className="city-canvas" />
      {/* The pins are drawn in the map; these buttons give keyboard and screen reader users the same choices. */}
      <ul className="sr-only" aria-label="Places on the map">
        {places.map((p) => (
          <li key={p.id}>
            <button type="button" onClick={() => onSelect(p.id)}>
              {money(p.price)} a month, {walkMinutes([p.lng, p.lat], CAMPUS)} minute walk to campus: {p.title}
            </button>
          </li>
        ))}
      </ul>

      <div className="city-controls">
        <button type="button" className="city-chip" aria-pressed={subway} onClick={() => setSubway((s) => !s)}>
          Subway
        </button>
      </div>

      {/* Like Google Maps: compass (tap to face north), turn, tilt, zoom. */}
      <div className="city-nav" aria-label="Map controls">
        <button type="button" className="city-nav-btn city-compass" aria-label="Face north" title="Face north" onClick={controls.north}>
          <svg className="city-compass-needle" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2 15 12H9z" fill="#C4622D" />
            <path d="M12 22 9 12h6z" fill="currentColor" opacity="0.45" />
          </svg>
        </button>
        <div className="city-nav-group">
          <button type="button" className="city-nav-btn" aria-label="Turn left" title="Turn left" onClick={() => controls.rotate(-45)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
          </button>
          <button type="button" className="city-nav-btn" aria-label="Turn right" title="Turn right" onClick={() => controls.rotate(45)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" /></svg>
          </button>
        </div>
        <button
          type="button"
          className="city-nav-btn city-nav-text"
          aria-pressed={!flat}
          title={flat ? "Tilt to 3D" : "Look straight down"}
          onClick={controls.tilt}
        >
          {flat ? "3D" : "2D"}
        </button>
        <div className="city-nav-group">
          <button type="button" className="city-nav-btn" aria-label="Zoom in" title="Zoom in" onClick={() => controls.zoom(1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          </button>
          <button type="button" className="city-nav-btn" aria-label="Zoom out" title="Zoom out" onClick={() => controls.zoom(-1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14" /></svg>
          </button>
        </div>
      </div>

      {active && <PlacePanel key={active.id} place={active} onClose={() => onSelect(null)} />}
    </div>
  );
}

const ROOM: Record<string, string> = { "private room": "Private room", studio: "Studio", shared: "Shared room" };

// The whole listing, in a panel on the right of the map (a sheet from the
// bottom on narrow screens). Opens when a pin is tapped.
function PlacePanel({ place, onClose }: { place: MapPlace; onClose: () => void }) {
  const at: LngLat = [place.lng, place.lat];
  const near = nearestStop(at);
  const d = place.details;
  return (
    <aside className="city-panel" role="dialog" aria-label={place.title}>
      <button type="button" className="city-card-close" aria-label="Close" onClick={onClose}>
        ×
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={place.photo.src} alt={place.photo.alt} />
      <div className="city-panel-body">
        <div className="city-panel-top">
          <div className="city-card-price">
            {money(place.price)} <small>/ month</small>
          </div>
          <HeartButton id={place.id} title={place.title} className="heart-btn heart-btn-sm" />
        </div>
        <h3>{place.title}</h3>
        {d && (
          <p className="city-panel-where">
            {ROOM[d.roomType] ?? d.roomType} · {d.neighborhood}, {d.crossStreets}
          </p>
        )}

        <dl className="city-facts">
          {d && (
            <>
              <dt>Dates</dt>
              <dd>
                {shortDate(d.availableFrom)} – {shortDate(d.availableTo)}
              </dd>
              <dt>Space</dt>
              <dd>
                {d.furnished ? "Furnished" : "Unfurnished"} · sleeps {d.sleeps}
              </dd>
            </>
          )}
          <dt>Campus</dt>
          <dd>{walkMinutes(at, CAMPUS)} min walk</dd>
          <dt>Subway</dt>
          <dd>
            {near.stop.name} ({near.stop.lines.map(([l]) => l).join(", ")}) · {near.minutes} min walk
          </dd>
          {d && (
            <>
              <dt>Lister</dt>
              <dd>
                {d.lister.firstName}, {d.lister.school} · {d.replySpeed}
              </dd>
            </>
          )}
        </dl>

        {place.checked.length > 0 && (
          <ul className="city-checks" aria-label="What we checked">
            {place.checked.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        )}
        {d?.goodFor && <p className="city-panel-good">{d.goodFor}</p>}

        <Link className="btn city-panel-cta" href={place.href}>
          See the place
        </Link>
      </div>
    </aside>
  );
}
