"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { CAMPUS, HOODS, type LngLat, STOPS, nearestStop, walkMinutes } from "@/content/morningside";
import { money } from "@/lib/format";
import { type CesiumNS, loadCesium } from "./loadCesium";
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
};

// Google Maps key with Map Tiles API on, limited to Gable's sites. Public by
// design: the browser asks Google for the 3D tiles directly.
const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "";
const FLY_IN_DONE = "gable-map-flyin";

type Anchor = { key: string; at: LngLat; lift: number; bottom: boolean };

const reduceMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// The real city in 3D (Google Photorealistic 3D Tiles, drawn with CesiumJS):
// Columbia, 5 and 10 minute walking zones painted on the streets, subway stops,
// neighborhood names, and a price pin for each place. Tapping a pin flies to it
// and opens a card. `activeId`/`onSelect` let a list beside the map drive it.
// Without a key, or if the 3D map can't load, it shows `fallback` instead.
export function CityMap({
  places,
  activeId,
  onSelect,
  fallback,
}: {
  places: MapPlace[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
  fallback?: ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const flyRef = useRef<(id: string) => void>(() => {});
  const [failed, setFailed] = useState(!KEY);
  const [subway, setSubway] = useState(true);

  const placesKey = places.map((p) => p.id).join(",");

  useEffect(() => {
    if (!KEY || !box.current) return;
    let viewer: CesiumNS = null;
    let cancelled = false;

    loadCesium()
      .then(async (Cesium) => {
        if (cancelled || !box.current) return;
        Cesium.GoogleMaps.defaultApiKey = KEY;
        viewer = new Cesium.Viewer(box.current.querySelector(".city-canvas"), {
          globe: false, baseLayer: false, baseLayerPicker: false, geocoder: false, homeButton: false, sceneModePicker: false,
          navigationHelpButton: false, animation: false, timeline: false, fullscreenButton: false, infoBox: false,
          selectionIndicator: false,
        });
        const scene = viewer.scene;
        scene.skyAtmosphere.show = true;
        // Sharp on Retina screens, smooth edges, and no zooming in past where it blurs.
        viewer.useBrowserRecommendedResolution = false;
        viewer.resolutionScale = 1;
        scene.postProcessStages.fxaa.enabled = true;
        scene.screenSpaceCameraController.minimumZoomDistance = 150;
        scene.screenSpaceCameraController.maximumZoomDistance = 9000;

        let tileset: CesiumNS;
        try {
          tileset = await Cesium.createGooglePhotorealistic3DTileset(undefined, {
            maximumScreenSpaceError: 6,
            cacheBytes: 1024 * 1024 * 1024,
          });
        } catch {
          if (!cancelled) setFailed(true);
          return;
        }
        if (cancelled) return;
        scene.primitives.add(tileset);

        // Walking zones, painted onto the buildings and streets themselves.
        for (const [radius, alpha] of [[800, 0.16], [400, 0.22]]) {
          viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(...CAMPUS),
            ellipse: {
              semiMajorAxis: radius,
              semiMinorAxis: radius,
              material: Cesium.Color.fromCssColorString("#34C27A").withAlpha(alpha),
              classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
            },
          });
        }

        // Labels and pins are HTML, placed over their spot in the city every frame.
        const anchors: Anchor[] = [
          { key: "ring5", at: [CAMPUS[0], CAMPUS[1] - 400 / 110540], lift: 6, bottom: false },
          { key: "ring10", at: [CAMPUS[0], CAMPUS[1] - 800 / 110540], lift: 6, bottom: false },
          { key: "campus", at: CAMPUS, lift: 70, bottom: true },
          ...HOODS.map((h, i) => ({ key: `hood${i}`, at: h.at, lift: 120, bottom: false })),
          ...STOPS.map((s, i) => ({ key: `stop${i}`, at: s.at, lift: 8, bottom: false })),
          ...places.map((p) => ({ key: `pin:${p.id}`, at: [p.lng, p.lat] as LngLat, lift: 40, bottom: true })),
        ];
        const positions = anchors.map((a) => Cesium.Cartesian3.fromDegrees(a.at[0], a.at[1], 40 + a.lift));

        // Once the city has loaded, set each label on the real ground or rooftop below it.
        tileset.initialTilesLoaded.addEventListener(async () => {
          try {
            const ground = await scene.clampToHeightMostDetailed(anchors.map((a) => Cesium.Cartesian3.fromDegrees(a.at[0], a.at[1], 400)));
            ground.forEach((p: CesiumNS, i: number) => {
              if (!p) return;
              const c = Cesium.Cartographic.fromCartesian(p);
              positions[i] = Cesium.Cartesian3.fromRadians(c.longitude, c.latitude, c.height + anchors[i].lift);
            });
          } catch {}
        });

        // Look each label up by its data-anchor name (cached after the first find).
        const els: Record<string, HTMLElement | null> = {};
        const find = (key: string) =>
          els[key]?.isConnected ? els[key] : (els[key] = box.current?.querySelector<HTMLElement>(`[data-anchor="${CSS.escape(key)}"]`) ?? null);
        const toWindow = Cesium.SceneTransforms.worldToWindowCoordinates ?? Cesium.SceneTransforms.wgs84ToWindowCoordinates;
        const spot = new Cesium.Cartesian2();
        scene.postRender.addEventListener(() => {
          const cam = scene.camera.positionWC;
          anchors.forEach((a, i) => {
            const el = find(a.key);
            if (!el) return;
            const p = toWindow(scene, positions[i], spot);
            if (!p || Cesium.Cartesian3.distance(cam, positions[i]) > 8000) {
              el.style.visibility = "hidden";
              return;
            }
            el.style.visibility = "";
            el.style.transform = `translate(${p.x - el.offsetWidth / 2}px, ${p.y - (a.bottom ? el.offsetHeight : el.offsetHeight / 2)}px)`;
          });
        });

        // Camera: look at a spot from a distance, at a downward angle. `aimLeft`
        // (meters) aims left of the spot, so it lands right of the card.
        const look = (at: LngLat, range: number, pitch: number, duration: number, aimLeft = 0) => {
          const target = Cesium.Cartesian3.fromDegrees(at[0], at[1], 40);
          if (aimLeft) {
            const left = Cesium.Cartesian3.multiplyByScalar(viewer.camera.rightWC, -aimLeft, new Cesium.Cartesian3());
            Cesium.Cartesian3.add(target, left, target);
          }
          viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(target, 1), {
            offset: new Cesium.HeadingPitchRange(viewer.camera.heading, Cesium.Math.toRadians(pitch), range),
            duration,
          });
        };
        flyRef.current = (id) => {
          const p = places.find((x) => x.id === id);
          if (p) look([p.lng, p.lat], 420, -32, reduceMotion() ? 0 : 1.6, 130);
        };

        // First time this visit: fly in from above Midtown, so the area makes sense.
        const home: LngLat = [CAMPUS[0], CAMPUS[1] - 0.002];
        const homeOffset = new Cesium.HeadingPitchRange(Cesium.Math.toRadians(205), Cesium.Math.toRadians(-28), 1250);
        let seen = false;
        try {
          seen = sessionStorage.getItem(FLY_IN_DONE) === "1";
          sessionStorage.setItem(FLY_IN_DONE, "1");
        } catch {}
        const homeSphere = new Cesium.BoundingSphere(Cesium.Cartesian3.fromDegrees(home[0], home[1], 40), 1);
        if (seen || reduceMotion()) {
          viewer.camera.viewBoundingSphere(homeSphere, homeOffset);
          viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        } else {
          viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(-73.985, 40.735, 5200),
            orientation: { heading: Cesium.Math.toRadians(20), pitch: Cesium.Math.toRadians(-38) },
          });
          viewer.camera.flyToBoundingSphere(homeSphere, { offset: homeOffset, duration: 6.5 });
        }
      })
      .catch(() => !cancelled && setFailed(true));

    return () => {
      cancelled = true;
      flyRef.current = () => {};
      if (viewer && !viewer.isDestroyed()) viewer.destroy();
    };
    // Rebuild only when the set of places changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placesKey]);

  // The list beside the map (or a pin) picked a place: fly there.
  useEffect(() => {
    if (activeId) flyRef.current(activeId);
  }, [activeId]);

  if (failed) return <>{fallback ?? <div className="city-map-empty">The 3D map isn&apos;t available right now.</div>}</>;

  const active = places.find((p) => p.id === activeId);

  return (
    <div className={`city-map${subway ? "" : " city-map-no-subway"}`} ref={box}>
      <div className="city-canvas" />
      <div className="city-overlay">
        <div className="city-tag city-ring" data-anchor="ring5">5 min walk</div>
        <div className="city-tag city-ring" data-anchor="ring10">10 min walk</div>
        <div className="city-tag city-campus" data-anchor="campus">
          <span className="city-campus-tag">
            <span aria-hidden="true">★</span> Columbia University
          </span>
          <span className="city-stem" />
        </div>
        {HOODS.map((h, i) => (
          <div key={h.name + i} className={`city-tag city-hood${h.water ? " is-water" : ""}`} data-anchor={`hood${i}`}>
            {h.name}
          </div>
        ))}
        {STOPS.map((s, i) => (
          <div key={s.name + i} className="city-tag city-stop" data-anchor={`stop${i}`}>
            {s.lines.map(([line, color]) => (
              <span key={line} className="city-bullet" style={{ background: color }}>
                {line}
              </span>
            ))}
            {s.name}
          </div>
        ))}
        {places.map((p) => {
          const walk = walkMinutes([p.lng, p.lat], CAMPUS);
          return (
            <button
              key={p.id}
              type="button"
              className={`city-tag city-pin${p.id === activeId ? " is-active" : ""}`}
              data-anchor={`pin:${p.id}`}
              aria-label={`${money(p.price)} a month, ${walk} minute walk to campus: ${p.title}`}
              onClick={() => onSelect(p.id)}
            >
              <span className="city-pin-tag">
                {money(p.price)}
                <small>{walk} min</small>
              </span>
              <span className="city-stem" />
            </button>
          );
        })}
      </div>

      <div className="city-controls">
        <button type="button" className="city-chip" aria-pressed={subway} onClick={() => setSubway((s) => !s)}>
          Subway
        </button>
      </div>

      {active && <PlaceCard place={active} onClose={() => onSelect(null)} />}
    </div>
  );
}

function PlaceCard({ place, onClose }: { place: MapPlace; onClose: () => void }) {
  const at: LngLat = [place.lng, place.lat];
  const near = nearestStop(at);
  return (
    <div className="city-card" role="dialog" aria-label={place.title}>
      <button type="button" className="city-card-close" aria-label="Close" onClick={onClose}>
        ×
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={place.photo.src} alt={place.photo.alt} />
      <div className="city-card-body">
        <div className="city-card-price">
          {money(place.price)} <small>/ month</small>
        </div>
        <h3>{place.title}</h3>
        <ul>
          <li>
            <b>{walkMinutes(at, CAMPUS)} min walk</b> to campus
          </li>
          <li>
            {near.stop.name} ({near.stop.lines.map(([l]) => l).join(", ")}) · {near.minutes} min walk
          </li>
          {place.checked.length > 0 && <li>{place.checked.join(" · ")}</li>}
        </ul>
        <Link className="btn btn-sm" href={place.href}>
          See the place
        </Link>
      </div>
    </div>
  );
}
