// SAMPLE link cards for the staging demo, so the "Elsewhere on the web" row
// can be seen and tested before anyone shares a real one. Everything here is
// made up: the links go to example.com, not to a real listing, and the photos
// are Pexels stock photos (docs/style_guide.md, Imagery). Production never
// shows these (src/lib/mode.ts, showSamples).

import { px } from "@/components/landing/Photo";
import type { ExternalListing } from "@/lib/external-listing-fields";

export const SAMPLE_EXTERNAL_LISTINGS: ExternalListing[] = [
  {
    kind: "external",
    id: "sample-ext-1",
    url: "https://example.com/sample-sublet-1",
    source: "Sample site",
    title: "Furnished room in a 3BR near the 1 train",
    description: "Sample card for the demo. Shared kitchen, laundry in the building.",
    imageUrl: px(5425123),
    neighborhood: "Morningside Heights",
    roomType: "private room",
    sleeps: 1,
    price: 1500,
    availableFrom: "2027-06-01",
    availableTo: "2027-08-20",
    furnished: true,
    addedOn: "2026-11-18",
    sample: true,
  },
  {
    kind: "external",
    id: "sample-ext-2",
    url: "https://example.com/sample-sublet-2",
    source: "Sample site",
    title: "Studio for the summer, Hamilton Heights",
    description: "Sample card for the demo. Small studio with a kitchenette.",
    imageUrl: px(6447377),
    neighborhood: "Hamilton Heights",
    roomType: "studio",
    sleeps: 1,
    price: 1750,
    availableFrom: "2027-05-25",
    availableTo: "2027-08-25",
    furnished: true,
    addedOn: "2026-11-19",
    sample: true,
  },
  {
    kind: "external",
    id: "sample-ext-3",
    url: "https://example.com/sample-sublet-3",
    source: "Sample site",
    title: "Two rooms in a Harlem apartment, fall semester",
    description: "Sample card for the demo. Good for two friends looking together.",
    imageUrl: px(6969990),
    neighborhood: "Harlem",
    roomType: "private room",
    sleeps: 2,
    price: 1250,
    availableFrom: "2027-09-01",
    availableTo: "2027-12-20",
    furnished: false,
    addedOn: "2026-11-20",
    sample: true,
  },
];
