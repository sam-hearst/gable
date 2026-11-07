// The area around campus, for the 3D map: Columbia, nearby subway stops (with
// MTA line colors) and neighborhood names. Coordinates are approximate.

export type LngLat = [number, number];

export const CAMPUS: LngLat = [-73.9626, 40.8075]; // Low Library steps

const RED = "#EE352E";
const BLUE = "#0039A6";
const ORANGE = "#FF6319";

export const STOPS: { name: string; at: LngLat; lines: [string, string][] }[] = [
  { name: "116 St–Columbia", at: [-73.9641, 40.8078], lines: [["1", RED]] },
  { name: "110 St", at: [-73.9668, 40.8041], lines: [["1", RED]] },
  { name: "125 St", at: [-73.9585, 40.8158], lines: [["1", RED]] },
  { name: "103 St", at: [-73.9682, 40.7994], lines: [["1", RED]] },
  { name: "116 St", at: [-73.9548, 40.8051], lines: [["B", ORANGE], ["C", BLUE]] },
  { name: "110 St", at: [-73.9581, 40.8008], lines: [["B", ORANGE], ["C", BLUE]] },
  { name: "125 St", at: [-73.9524, 40.8111], lines: [["A", BLUE], ["B", ORANGE], ["C", BLUE], ["D", ORANGE]] },
  { name: "116 St", at: [-73.9497, 40.802], lines: [["2", RED], ["3", RED]] },
];

export const HOODS: { name: string; at: LngLat; water?: boolean }[] = [
  { name: "Morningside Heights", at: [-73.961, 40.811] },
  { name: "Harlem", at: [-73.946, 40.812] },
  { name: "Manhattanville", at: [-73.956, 40.8185] },
  { name: "Manhattan Valley", at: [-73.964, 40.7975] },
  { name: "Central Park", at: [-73.957, 40.7955] },
  { name: "Riverside Park", at: [-73.9705, 40.806] },
  { name: "Hudson River", at: [-73.98, 40.809], water: true },
];

function meters([a, b]: LngLat, [c, d]: LngLat) {
  const r = Math.PI / 180;
  const h = Math.sin(((d - b) * r) / 2) ** 2 + Math.cos(b * r) * Math.cos(d * r) * Math.sin(((c - a) * r) / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
}

// A rough walk: straight-line distance × 1.25 for the street grid, at 80 m a minute.
export function walkMinutes(from: LngLat, to: LngLat) {
  return Math.max(1, Math.round((meters(from, to) * 1.25) / 80));
}

export function nearestStop(at: LngLat) {
  return STOPS.map((s) => ({ stop: s, minutes: walkMinutes(at, s.at) })).sort((a, b) => a.minutes - b.minutes)[0];
}
