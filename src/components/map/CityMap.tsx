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
  const controlsRef = useRef<{
    rotate: (deg: number) => void;
    north: () => void;
    tilt: () => boolean;
    zoom: (factor: number) => void;
  } | null>(null);
  const [flat, setFlat] = useState(false);
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
        // Sharp but smooth: up to 1.5× pixel density on Retina (full 2× drops frames),
        // smoothed edges, and no zooming in past where Google's model blurs.
        viewer.useBrowserRecommendedResolution = false;
        viewer.resolutionScale = Math.min(1, 1.5 / (window.devicePixelRatio || 1));
        scene.postProcessStages.fxaa.enabled = true;
        const ctrl = scene.screenSpaceCameraController;
        ctrl.minimumZoomDistance = 150;
        ctrl.maximumZoomDistance = 9000;
        // Like Google Maps: drag to move, right-drag (or Ctrl-drag) to tilt and turn, wheel or pinch to zoom.
        const E = Cesium.CameraEventType, K = Cesium.KeyboardEventModifier;
        ctrl.zoomEventTypes = [E.WHEEL, E.PINCH];
        ctrl.tiltEventTypes = [E.RIGHT_DRAG, E.MIDDLE_DRAG, E.PINCH, { eventType: E.LEFT_DRAG, modifier: K.CTRL }];

        let tileset: CesiumNS;
        try {
          tileset = await Cesium.createGooglePhotorealistic3DTileset(undefined, {
            maximumScreenSpaceError: 8,
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

        // Look each label up by its data-anchor name, and measure it once
        // (measuring every frame is what made the map stutter).
        const els: Record<string, { el: HTMLElement; w: number; h: number } | null> = {};
        const find = (key: string) => {
          const hit = els[key];
          if (hit?.el.isConnected) return hit;
          const el = box.current?.querySelector<HTMLElement>(`[data-anchor="${CSS.escape(key)}"]`);
          return (els[key] = el ? { el, w: el.offsetWidth, h: el.offsetHeight } : null);
        };
        const needle = box.current?.querySelector<HTMLElement>(".city-compass-needle");
        const toWindow = Cesium.SceneTransforms.worldToWindowCoordinates ?? Cesium.SceneTransforms.wgs84ToWindowCoordinates;
        const spot = new Cesium.Cartesian2();
        scene.postRender.addEventListener(() => {
          const cam = scene.camera.positionWC;
          if (needle) needle.style.transform = `rotate(${-Cesium.Math.toDegrees(scene.camera.heading)}deg)`;
          anchors.forEach((a, i) => {
            const hit = find(a.key);
            if (!hit) return;
            const { el, w, h } = hit;
            const p = toWindow(scene, positions[i], spot);
            if (!p || Cesium.Cartesian3.distance(cam, positions[i]) > 8000) {
              if (el.style.visibility !== "hidden") el.style.visibility = "hidden";
              return;
            }
            if (el.style.visibility) el.style.visibility = "";
            el.style.transform = `translate3d(${(p.x - w / 2).toFixed(1)}px, ${(p.y - (a.bottom ? h : h / 2)).toFixed(1)}px, 0)`;
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
        // The point in the middle of the view (on the city), used to turn and zoom around.
        const middle = () => {
          const c = scene.canvas;
          const at = new Cesium.Cartesian2(c.clientWidth / 2, c.clientHeight / 2);
          const hit = scene.pickPositionSupported ? scene.pickPosition(at) : undefined;
          if (hit) return hit;
          const ray = viewer.camera.getPickRay(at);
          const t = ray && Cesium.IntersectionTests.rayEllipsoid(ray, Cesium.Ellipsoid.WGS84);
          return t ? Cesium.Ray.getPoint(ray, t.start) : Cesium.Cartesian3.fromDegrees(...CAMPUS);
        };
        const orbit = (change: { heading?: number; pitch?: number; zoom?: number }) => {
          const target = middle();
          const cam = viewer.camera;
          const range = Cesium.Cartesian3.distance(cam.positionWC, target) * (change.zoom ?? 1);
          cam.flyToBoundingSphere(new Cesium.BoundingSphere(target, 1), {
            offset: new Cesium.HeadingPitchRange(
              change.heading ?? cam.heading,
              change.pitch ?? cam.pitch,
              Math.min(9000, Math.max(160, range)),
            ),
            duration: reduceMotion() ? 0 : 0.6,
          });
        };
        controlsRef.current = {
          rotate: (deg) => orbit({ heading: viewer.camera.heading + Cesium.Math.toRadians(deg) }),
          north: () => orbit({ heading: 0 }),
          tilt: () => {
            const flat = viewer.camera.pitch < Cesium.Math.toRadians(-70);
            orbit({ pitch: Cesium.Math.toRadians(flat ? -32 : -89) });
            return !flat;
          },
          zoom: (factor) => orbit({ zoom: factor }),
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
      controlsRef.current = null;
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

      {/* Like Google Maps: compass (tap to face north), turn, tilt, zoom. */}
      <div className="city-nav" aria-label="Map controls">
        <button type="button" className="city-nav-btn city-compass" aria-label="Face north" title="Face north" onClick={() => controlsRef.current?.north()}>
          <svg className="city-compass-needle" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2 15 12H9z" fill="#C4622D" />
            <path d="M12 22 9 12h6z" fill="currentColor" opacity="0.45" />
          </svg>
        </button>
        <div className="city-nav-group">
          <button type="button" className="city-nav-btn" aria-label="Turn left" title="Turn left" onClick={() => controlsRef.current?.rotate(-45)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
          </button>
          <button type="button" className="city-nav-btn" aria-label="Turn right" title="Turn right" onClick={() => controlsRef.current?.rotate(45)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" /></svg>
          </button>
        </div>
        <button
          type="button"
          className="city-nav-btn city-nav-text"
          aria-pressed={!flat}
          title={flat ? "Tilt to 3D" : "Look straight down"}
          onClick={() => {
            const nowFlat = controlsRef.current?.tilt();
            if (nowFlat !== undefined) setFlat(nowFlat);
          }}
        >
          {flat ? "3D" : "2D"}
        </button>
        <div className="city-nav-group">
          <button type="button" className="city-nav-btn" aria-label="Zoom in" title="Zoom in" onClick={() => controlsRef.current?.zoom(0.6)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          </button>
          <button type="button" className="city-nav-btn" aria-label="Zoom out" title="Zoom out" onClick={() => controlsRef.current?.zoom(1.6)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14" /></svg>
          </button>
        </div>
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
