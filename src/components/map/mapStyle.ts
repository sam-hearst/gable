// The look of the map: a clean, model-like city. Real OpenStreetMap streets,
// parks, water and building footprints at their real heights (OpenFreeMap:
// free, no key), drawn in soft colors on cream, lit like a model.

export function cityStyle() {
  return {
    version: 8,
    glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
    sky: {
      "sky-color": "#CFE6F5", "horizon-color": "#F6EEDF", "fog-color": "#F2EADB",
      "sky-horizon-blend": 0.6, "horizon-fog-blend": 0.6, "fog-ground-blend": 0.25,
    },
    light: { anchor: "map", position: [1.3, 200, 40], color: "#ffffff", intensity: 0.42 },
    sources: {
      omt: { type: "vector", url: "https://tiles.openfreemap.org/planet" },
    },
    layers: [
      { id: "bg", type: "background", paint: { "background-color": "#EFE8DA" } },
      { id: "landuse", type: "fill", source: "omt", "source-layer": "landuse",
        filter: ["in", ["get", "class"], ["literal", ["residential", "commercial", "retail"]]], paint: { "fill-color": "#EAE2D2" } },
      { id: "green", type: "fill", source: "omt", "source-layer": "landcover",
        filter: ["in", ["get", "class"], ["literal", ["grass", "wood", "farmland"]]], paint: { "fill-color": "#B9DDA4" } },
      { id: "park-lift", type: "fill-extrusion", source: "omt", "source-layer": "park",
        paint: { "fill-extrusion-color": "#A8D493", "fill-extrusion-height": 2.5, "fill-extrusion-opacity": 1 } },
      { id: "water", type: "fill", source: "omt", "source-layer": "water", paint: { "fill-color": "#A9D6EA" } },
      { id: "water-edge", type: "line", source: "omt", "source-layer": "water", paint: { "line-color": "#93C8E0", "line-width": 1.2 } },
      { id: "roads-minor", type: "line", source: "omt", "source-layer": "transportation",
        filter: ["in", ["get", "class"], ["literal", ["minor", "service"]]], layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#FBF8F1", "line-width": ["interpolate", ["exponential", 1.6], ["zoom"], 13, 0.5, 18, 10] } },
      { id: "roads-major", type: "line", source: "omt", "source-layer": "transportation",
        filter: ["in", ["get", "class"], ["literal", ["primary", "secondary", "tertiary", "trunk", "motorway"]]],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#FFFFFF", "line-width": ["interpolate", ["exponential", 1.6], ["zoom"], 12, 1, 18, 18] } },
      { id: "buildings", type: "fill-extrusion", source: "omt", "source-layer": "building", minzoom: 13,
        paint: {
          // A few soft tones, one per building, at its real height.
          "fill-extrusion-color": ["match", ["%", ["to-number", ["id"], 0], 5], 0, "#F7F0E2", 1, "#F1E3D0", 2, "#E4ECE0", 3, "#E9E4DA", "#F4E9DA"],
          "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 13, 0, 14.2, ["coalesce", ["get", "render_height"], 12]],
          "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
          "fill-extrusion-opacity": 1,
          "fill-extrusion-vertical-gradient": true,
        } },
      { id: "street-names", type: "symbol", source: "omt", "source-layer": "transportation_name", minzoom: 16,
        layout: { "symbol-placement": "line", "text-field": ["get", "name"], "text-font": ["Noto Sans Regular"], "text-size": 11 },
        paint: { "text-color": "#7A847D", "text-halo-color": "#FFFFFF", "text-halo-width": 1.2 } },
      { id: "hoods", type: "symbol", source: "omt", "source-layer": "place", maxzoom: 16.5,
        filter: ["in", ["get", "class"], ["literal", ["suburb", "neighbourhood", "quarter"]]],
        layout: { "text-field": ["upcase", ["get", "name"]], "text-font": ["Noto Sans Bold"], "text-size": 11, "text-letter-spacing": 0.14 },
        paint: { "text-color": "#5A6A60", "text-halo-color": "#FFFCF6", "text-halo-width": 1.6 } },
    ],
  };
}
