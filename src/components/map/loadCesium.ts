// Loads CesiumJS (free, open source) from the CDN the first time a 3D map
// opens, instead of bundling it: it's large and needs its own asset folder.
const VERSION = "1.123.1";
const BASE = `https://cdnjs.cloudflare.com/ajax/libs/cesium/${VERSION}/`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CesiumNS = any;

let loading: Promise<CesiumNS> | null = null;

export function loadCesium(): Promise<CesiumNS> {
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const w = window as unknown as { Cesium?: CesiumNS; CESIUM_BASE_URL?: string };
    if (w.Cesium) return resolve(w.Cesium);
    w.CESIUM_BASE_URL = BASE;
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = `${BASE}Widgets/widgets.css`;
    document.head.appendChild(css);
    const s = document.createElement("script");
    s.src = `${BASE}Cesium.js`;
    s.async = true;
    s.onload = () => (w.Cesium ? resolve(w.Cesium) : reject(new Error("Cesium missing")));
    s.onerror = () => {
      loading = null;
      reject(new Error("Couldn't load the 3D map"));
    };
    document.head.appendChild(s);
  });
  return loading;
}
