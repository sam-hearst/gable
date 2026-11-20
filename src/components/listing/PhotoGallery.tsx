"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Photo = { src: string; alt: string };

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

// Photos for one real listing: a big photo with arrows (and the left and right
// arrow keys, and swipe on a phone) to flip through them, a row of thumbnails,
// and a full-screen view you can zoom in and out of with the + and - buttons,
// a double tap, or the keyboard. Esc closes it.
export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const touchX = useRef<number | null>(null);
  const many = photos.length > 1;

  const go = useCallback(
    (step: number) => {
      setIndex((i) => (i + step + photos.length) % photos.length);
      setZoom(1);
    },
    [photos.length],
  );
  const zoomBy = useCallback((step: number) => setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +(z + step).toFixed(2)))), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      else if (e.key === "ArrowRight" && many) go(1);
      else if (e.key === "ArrowLeft" && many) go(-1);
      else if (e.key === "+" || e.key === "=") zoomBy(0.5);
      else if (e.key === "-") zoomBy(-0.5);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, many, go, zoomBy]);

  const swipe = {
    onTouchStart: (e: React.TouchEvent) => {
      touchX.current = e.touches[0].clientX;
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (touchX.current === null || !many) return;
      const dx = e.changedTouches[0].clientX - touchX.current;
      touchX.current = null;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    },
  };

  const photo = photos[index];

  return (
    <div className="gallery">
      <div className="gallery-main" {...swipe}>
        <button type="button" className="gallery-open" onClick={() => setOpen(true)} aria-label="Open photo full screen to zoom">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.src} alt={photo.alt} />
        </button>
        {many && (
          <>
            <button type="button" className="gallery-arrow gallery-prev" onClick={() => go(-1)} aria-label="Previous photo">
              &#8249;
            </button>
            <button type="button" className="gallery-arrow gallery-next" onClick={() => go(1)} aria-label="Next photo">
              &#8250;
            </button>
            <span className="gallery-count" aria-live="polite">
              {index + 1} / {photos.length}
            </span>
          </>
        )}
      </div>

      {many && (
        <div className="gallery-thumbs">
          {photos.map((p, i) => (
            <button
              key={p.src}
              type="button"
              className={i === index ? "is-current" : undefined}
              onClick={() => {
                setIndex(i);
                setZoom(1);
              }}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {open && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo, full screen" {...swipe}>
          <div className="lightbox-bar">
            <span>
              {index + 1} / {photos.length}
            </span>
            <div className="lightbox-tools">
              <button type="button" onClick={() => zoomBy(-0.5)} disabled={zoom <= MIN_ZOOM} aria-label="Zoom out">
                &minus;
              </button>
              <button type="button" onClick={() => zoomBy(0.5)} disabled={zoom >= MAX_ZOOM} aria-label="Zoom in">
                +
              </button>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close">
                &times;
              </button>
            </div>
          </div>
          <div className="lightbox-stage" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={photo.alt}
              style={zoom > 1 ? { width: `${zoom * 100}%`, maxWidth: "none", maxHeight: "none" } : undefined}
              onDoubleClick={() => setZoom((z) => (z > 1 ? 1 : 2))}
              draggable={false}
            />
          </div>
          {many && (
            <>
              <button type="button" className="gallery-arrow gallery-prev" onClick={() => go(-1)} aria-label="Previous photo">
                &#8249;
              </button>
              <button type="button" className="gallery-arrow gallery-next" onClick={() => go(1)} aria-label="Next photo">
                &#8250;
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
