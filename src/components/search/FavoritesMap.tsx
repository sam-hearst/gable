"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { CircleCheck } from "@/components/landing/icons";
import type { SampleListing } from "@/content/listings";
import { money, shortDate } from "@/lib/format";
import { HeartButton } from "./HeartButton";

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

  function focusListing(l: SampleListing) {
    setActive(l.id);
    map?.panTo([l.lat, l.lng]);
    markers.current[l.id]?.openPopup();
  }

  return (
    <div className="fav-map-layout">
      <div className="fav-map">
        <MapContainer ref={setMap} center={[40.8075, -73.9626]} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
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
        </MapContainer>
      </div>

      <ul className="fav-list" ref={list} aria-label="Your saved places">
        {listings.map((l) => (
          <li
            key={l.id}
            ref={(el) => {
              items.current[l.id] = el;
            }}
            className={l.id === active ? "is-active" : undefined}
          >
            <button type="button" className="fav-item" aria-current={l.id === active || undefined} onClick={() => focusListing(l)}>
              <span className="fav-price">{money(l.price)}</span>
              <span className="fav-title">{l.title}</span>
              <span className="fav-meta">
                {l.neighborhood} · {shortDate(l.availableFrom)} – {shortDate(l.availableTo)}
              </span>
            </button>
            <HeartButton id={l.id} title={l.title} className="heart-btn heart-btn-sm" />
          </li>
        ))}
      </ul>
    </div>
  );
}
