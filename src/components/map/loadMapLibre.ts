// Loads MapLibre GL (free, open source) from the CDN the first time a map
// opens, instead of bundling it.
const VERSION = "5.6.0";
const BASE = `https://unpkg.com/maplibre-gl@${VERSION}/dist/`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MapLibreNS = any;

let loading: Promise<MapLibreNS> | null = null;

export function loadMapLibre(): Promise<MapLibreNS> {
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const w = window as unknown as { maplibregl?: MapLibreNS };
    if (w.maplibregl) return resolve(w.maplibregl);
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = `${BASE}maplibre-gl.css`;
    document.head.appendChild(css);
    const s = document.createElement("script");
    s.src = `${BASE}maplibre-gl.js`;
    s.async = true;
    s.onload = () => (w.maplibregl ? resolve(w.maplibregl) : reject(new Error("MapLibre missing")));
    s.onerror = () => {
      loading = null;
      reject(new Error("Couldn't load the map"));
    };
    document.head.appendChild(s);
  });
  return loading;
}
