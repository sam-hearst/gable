"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { LeafletContext, createLeafletContext, type LeafletContextInterface } from "@react-leaflet/core";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { CircleCheck } from "@/components/landing/icons";
import { Photo } from "@/components/landing/Photo";
import { CityMap, type MapPlace } from "@/components/map/CityMap";
import { toMapPlace } from "@/components/map/places";
import type { SampleListing } from "@/content/listings";
import { money, shortDate } from "@/lib/format";
import { Heart, HeartButton } from "./HeartButton";

// A price tag pin in the accent green; the highlighted one turns dark green.
function pricePin(price: number, active: boolean) {
  return L.divIcon({
    className: "price-pin-wrap",
    html: `<span class="price-pin${active ? " is-active" : ""}">${money(price)}</span>`,
    iconSize: [80, 36],
    iconAnchor: [40, 36],
    popupAnchor: [0, -34],
  });
}

// Stands in for react-leaflet's MapContainer. Next keeps a page you navigate
// away from alive but hidden; MapContainer removes its map when hidden and then
// reuses the removed map when you come back, which crashed /favorites. This one
// keeps the map while its div is still on the page and removes it only once
// the div is gone for good.
function LeafletMap({ onReady, children }: { onReady: (map: L.Map) => void; children: ReactNode }) {
  const [context, setContext] = useState<LeafletContextInterface | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const attach = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;
      if (mapRef.current) {
        // Back from hidden: the div may have changed size while it was away.
        mapRef.current.invalidateSize();
      } else {
        const map = L.map(node, { scrollWheelZoom: false }).setView([40.8075, -73.9626], 13);
        mapRef.current = map;
        setContext(createLeafletContext(map));
        onReady(map);
      }
      return () => {
        setTimeout(() => {
          if (node.isConnected || !mapRef.current) return;
          mapRef.current.remove();
          mapRef.current = null;
        });
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  return (
    <div ref={attach} style={{ height: "100%", width: "100%" }}>
      {context && <LeafletContext value={context}>{children}</LeafletContext>}
    </div>
  );
}

// Zooms to show every saved pin; refits when a pin is added or removed.
function FitToPins({ listings }: { listings: SampleListing[] }) {
  const map = useMap();
  const key = listings.map((l) => l.id).join(",");
  useEffect(() => {
    if (listings.length === 1) {
      map.setView([listings[0].lat, listings[0].lng], 15);
    } else if (listings.length > 1) {
      map.fitBounds(L.latLngBounds(listings.map((l) => [l.lat, l.lng])), { padding: [48, 48], maxZoom: 15 });
    }
    // Refit only when the set of saved listings changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key]);
  return null;
}

export default function FavoritesMap({ listings }: { listings: SampleListing[] }) {
  const [active, setActive] = useState<string | null>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const markers = useRef<Record<string, L.Marker>>({});
  const items = useRef<Record<string, HTMLLIElement | null>>({});
  const list = useRef<HTMLUListElement>(null);

  // Keep the highlighted listing in view inside the list (only scrolls the
  // list itself, never the page, so the map stays put on phones).
  useEffect(() => {
    const ul = list.current;
    const li = active ? items.current[active] : null;
    if (ul && li && ul.scrollHeight > ul.clientHeight) ul.scrollTo({ top: li.offsetTop - 8, behavior: "smooth" });
  }, [active]);

  const places: MapPlace[] = listings.map(toMapPlace);

  function focusListing(l: SampleListing) {
    setActive(l.id);
    map?.panTo([l.lat, l.lng]);
    markers.current[l.id]?.openPopup();
  }

  return (
    <div className="fav-map-layout">
      <div className="fav-map">
        <CityMap
          places={places}
          activeId={active}
          onSelect={setActive}
          showPanel={false}
          fallback={
            // The flat map, if the 3D one has no key or can't load.
              <LeafletMap onReady={setMap}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitToPins listings={listings} />
                {listings.map((l) => (
                  <Marker
                    key={l.id}
                    position={[l.lat, l.lng]}
                    icon={pricePin(l.price, l.id === active)}
                    zIndexOffset={l.id === active ? 1000 : 0}
                    title={`${l.title}, ${money(l.price)} a month`}
                    ref={(m) => {
                      if (m) markers.current[l.id] = m;
                      else delete markers.current[l.id];
                    }}
                    eventHandlers={{ click: () => setActive(l.id) }}
                  >
                    <Popup>
                      <div className="pin-popup">
                        <b>{l.title}</b>
                        <div className="pin-popup-meta">
                          {money(l.price)} / month · {shortDate(l.availableFrom)} – {shortDate(l.availableTo)}
                        </div>
                        <ul>
                          {l.checked.map((c) => (
                            <li key={c}>
                              <CircleCheck size={13} />
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </LeafletMap>
          }
        />
      </div>

      {!listings.length && (
        <div className="fav-empty fav-empty-side">
          <Heart size={28} />
          <p>Heart a few places to see them here.</p>
          <Link className="btn btn-sm" href="/explore">
            Start a search
          </Link>
        </div>
      )}
      <ul className="fav-list" ref={list} aria-label="Your saved places" hidden={!listings.length}>
        {listings.map((l) => (
          <li
            key={l.id}
            ref={(el) => {
              items.current[l.id] = el;
            }}
            className={l.id === active ? "is-active" : undefined}
          >
            <button type="button" className="fav-item" aria-current={l.id === active || undefined} onClick={() => focusListing(l)}>
              <Photo id={l.photo.id} width={600} alt={l.photo.alt} className="fav-photo" />
              <span className="fav-price">{money(l.price)}</span>
              <span className="fav-title">{l.title}</span>
              <span className="fav-meta">
                {l.neighborhood} · {shortDate(l.availableFrom)} – {shortDate(l.availableTo)}
              </span>
            </button>
            <HeartButton id={l.id} title={l.title} className="heart-btn heart-btn-sm fav-heart" />
          </li>
        ))}
      </ul>
    </div>
  );
}
