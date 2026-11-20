import { px } from "@/components/landing/Photo";
import type { SampleListing } from "@/content/listings";
import type { StudentListing } from "@/lib/student-listing-fields";
import type { MapPlace } from "./CityMap";

// A saved listing as the Favorites map and list need it, whether it's one of
// the made-up samples or a real student listing.
export type PinListing = {
  id: string;
  title: string;
  price: number;
  lat: number;
  lng: number;
  availableFrom: string;
  availableTo: string;
  neighborhood: string;
  checked: string[];
  photoSrc: string;
  photoAlt: string;
  href: string;
  approximate: boolean; // the pin marks the neighborhood, not the address
};

export function samplePin(l: SampleListing): PinListing {
  return {
    id: l.id,
    title: l.title,
    price: l.price,
    lat: l.lat,
    lng: l.lng,
    availableFrom: l.availableFrom,
    availableTo: l.availableTo,
    neighborhood: l.neighborhood,
    checked: l.checked,
    photoSrc: px(l.photo.id, 600),
    photoAlt: l.photo.alt,
    href: `/listing/${l.id}`,
    approximate: false,
  };
}

// Real listings don't store coordinates, and we don't want to publish a
// student's exact address anyway, so the pin sits in the middle of their
// neighborhood, nudged a little (by the listing id) so two places in the same
// neighborhood don't stack on one spot.
const CENTERS: Record<string, [number, number]> = {
  "Morningside Heights": [40.8075, -73.9626],
  "Upper West Side": [40.787, -73.9754],
  Harlem: [40.8116, -73.9465],
  "Hamilton Heights": [40.8253, -73.9498],
  Midtown: [40.7549, -73.984],
  "Williamsburg, Brooklyn": [40.7081, -73.9571],
  "Prospect Heights, Brooklyn": [40.6775, -73.9692],
};
const NYC: [number, number] = [40.7831, -73.9712];

function nudge(id: string, salt: number) {
  let h = salt;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 1000;
  return (h / 1000 - 0.5) * 0.003; // within about 170 m
}

export function realPin(l: StudentListing): PinListing {
  const [lat, lng] = CENTERS[l.neighborhood] ?? NYC;
  return {
    id: l.id,
    title: l.title,
    price: l.price,
    lat: lat + nudge(l.id, 7),
    lng: lng + nudge(l.id, 13),
    availableFrom: l.availableFrom,
    availableTo: l.availableTo,
    neighborhood: l.neighborhood,
    checked: l.checked,
    photoSrc: l.photos[0]?.src ?? "",
    photoAlt: l.photos[0]?.alt ?? l.title,
    href: `/sublet/${l.id}`,
    approximate: true,
  };
}

// For the 3D map: where it is, plus what the pin's card shows.
export function pinToPlace(p: PinListing): MapPlace {
  return {
    id: p.id,
    title: p.title,
    price: p.price,
    lat: p.lat,
    lng: p.lng,
    photo: { src: p.photoSrc, alt: p.photoAlt },
    checked: p.checked,
    href: p.href,
  };
}
