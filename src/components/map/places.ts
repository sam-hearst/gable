import { px } from "@/components/landing/Photo";
import type { SampleListing } from "@/content/listings";
import type { MapPlace } from "./CityMap";

// A listing as the 3D map needs it: where it is, plus everything the side
// panel shows when you tap its pin.
export function toMapPlace(l: SampleListing): MapPlace {
  return {
    id: l.id,
    title: l.title,
    price: l.price,
    lat: l.lat,
    lng: l.lng,
    photo: { src: px(l.photo.id, 900), alt: l.photo.alt },
    checked: l.checked,
    href: `/listing/${l.id}`,
    details: {
      neighborhood: l.neighborhood,
      crossStreets: l.crossStreets,
      availableFrom: l.availableFrom,
      availableTo: l.availableTo,
      roomType: l.roomType,
      furnished: l.furnished,
      sleeps: l.sleeps,
      lister: l.lister,
      replySpeed: l.replySpeed,
      goodFor: l.goodFor,
    },
  };
}
