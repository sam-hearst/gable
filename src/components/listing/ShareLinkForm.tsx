"use client";

import { useState } from "react";
import { previewLink, shareListing } from "@/app/share-a-listing/actions";
import { ExternalCard } from "@/components/search/ExternalCard";
import type { RoomType } from "@/content/listings";
import type { ExternalListing, LinkPreview } from "@/lib/external-listing-fields";
import { NEIGHBORHOODS, ROOM_TYPES } from "@/lib/student-listing-fields";

type Fields = {
  title: string;
  neighborhood: string;
  roomType: RoomType | "";
  sleeps: number;
  price: string;
  availableFrom: string;
  availableTo: string;
  furnished: "" | "yes" | "no";
};

const fromGuess = (p: LinkPreview): Fields => ({
  title: p.title,
  neighborhood: p.guess.neighborhood ?? "",
  roomType: p.guess.roomType ?? "",
  sleeps: p.guess.sleeps ?? 1,
  price: p.guess.price ? String(p.guess.price) : "",
  availableFrom: p.guess.availableFrom ?? "",
  availableTo: p.guess.availableTo ?? "",
  furnished: p.guess.furnished === null ? "" : p.guess.furnished ? "yes" : "no",
});

// Share a sublet you found on another site: paste the link, Gable reads that
// page's preview and fills in what it can, you check it against the listing,
// and the team approves the card before it shows in search.
export function ShareLinkForm() {
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<LinkPreview | null>(null);
  const [f, setF] = useState<Fields | null>(null);
  const [busy, setBusy] = useState<"" | "reading" | "sending">("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const set = <K extends keyof Fields>(k: K) => (v: Fields[K]) => setF((cur) => (cur ? { ...cur, [k]: v } : cur));

  async function read(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy("reading");
    const result = await previewLink(url).catch(() => null);
    setBusy("");
    if (!result) return setError("We couldn't read that link just now. Try again.");
    if (!result.ok) return setError(result.error);
    setPreview(result.preview);
    setF(fromGuess(result.preview));
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!preview || !f) return;
    setError("");
    setBusy("sending");
    const result = await shareListing({
      url: preview.url,
      source: preview.source,
      title: f.title,
      description: preview.description,
      imageUrl: preview.imageUrl,
      neighborhood: f.neighborhood,
      roomType: f.roomType,
      sleeps: f.sleeps,
      price: Number(f.price),
      availableFrom: f.availableFrom,
      availableTo: f.availableTo,
      furnished: f.furnished === "" ? null : f.furnished === "yes",
    }).catch(() => null);
    setBusy("");
    if (!result) return setError("We couldn't save that just now. Try again.");
    if (!result.ok) return setError(result.error);
    setDone(true);
  }

  if (done) {
    return (
      <div className="list-card">
        <h2>Thanks, we got it</h2>
        <p>We&apos;ll take a look, and once it&apos;s approved it shows in search under &ldquo;Elsewhere on the web&rdquo; for about three weeks.</p>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setDone(false);
            setPreview(null);
            setF(null);
            setUrl("");
          }}
        >
          Share another
        </button>
      </div>
    );
  }

  // What the card will look like, live as they edit.
  const card: ExternalListing | null =
    preview && f
      ? {
          kind: "external",
          id: "preview",
          url: preview.url,
          source: preview.source,
          title: f.title || preview.title,
          description: preview.description,
          imageUrl: preview.imageUrl,
          neighborhood: f.neighborhood || "Neighborhood?",
          roomType: (f.roomType || "private room") as RoomType,
          sleeps: f.sleeps,
          price: Number(f.price) || 0,
          availableFrom: f.availableFrom || new Date().toISOString().slice(0, 10),
          availableTo: f.availableTo || new Date().toISOString().slice(0, 10),
          furnished: f.furnished === "yes",
          addedOn: new Date().toISOString().slice(0, 10),
        }
      : null;

  return (
    <div className="list-card">
      <h2>{preview ? "Check the details" : "Paste the listing's link"}</h2>
      <p>
        {preview
          ? "We filled in what the link's preview said. Open the listing and fix anything that's missing or wrong: search matches on these."
          : "From Ohana, Listings Project, a Facebook group or anywhere else. We read only that page's preview, the same thing a chat app shows when you send a link."}
      </p>

      <form className="list-form" onSubmit={read}>
        <div className="list-field">
          <label htmlFor="share-url">Link</label>
          <input
            id="share-url"
            type="url"
            required
            inputMode="url"
            placeholder="https://"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        {!preview && (
          <button className="btn" type="submit" disabled={busy !== ""}>
            {busy === "reading" ? "Reading the link…" : "Read the link"}
          </button>
        )}
      </form>

      {preview && f && card && (
        <form className="list-form share-check" onSubmit={send}>
          <div className="share-preview">
            <ExternalCard l={card} />
          </div>
          <div className="share-fields">
            <div className="list-field">
              <label htmlFor="share-title">Title</label>
              <input id="share-title" required minLength={3} maxLength={120} value={f.title} onChange={(e) => set("title")(e.target.value)} />
            </div>
            <div className="list-row share-two">
              <div className="list-field">
                <label htmlFor="share-price">Monthly rent ($)</label>
                <input id="share-price" type="number" required min={300} max={10000} step={1} value={f.price} onChange={(e) => set("price")(e.target.value)} />
              </div>
              <div className="list-field">
                <label htmlFor="share-hood">Neighborhood</label>
                <select id="share-hood" required value={f.neighborhood} onChange={(e) => set("neighborhood")(e.target.value)}>
                  <option value="">Pick one</option>
                  {NEIGHBORHOODS.map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="list-row share-two">
              <div className="list-field">
                <label htmlFor="share-from">Available from</label>
                <input id="share-from" type="date" required value={f.availableFrom} onChange={(e) => set("availableFrom")(e.target.value)} />
              </div>
              <div className="list-field">
                <label htmlFor="share-to">Until</label>
                <input id="share-to" type="date" required value={f.availableTo} onChange={(e) => set("availableTo")(e.target.value)} />
              </div>
            </div>
            <div className="list-row share-two">
              <div className="list-field">
                <label htmlFor="share-type">Kind of space</label>
                <select id="share-type" required value={f.roomType} onChange={(e) => set("roomType")(e.target.value as RoomType)}>
                  <option value="">Pick one</option>
                  {ROOM_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t[0].toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="list-field">
                <label htmlFor="share-sleeps">Fits</label>
                <select id="share-sleeps" value={f.sleeps} onChange={(e) => set("sleeps")(Number(e.target.value))}>
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n === 1 ? "1 person" : `${n} people`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="list-field">
              <span className="share-legend">Furnished?</span>
              <fieldset>
                <legend className="sr-only">Furnished?</legend>
                {(["yes", "no"] as const).map((v) => (
                  <label key={v} className="list-choice">
                    <input type="radio" name="share-furnished" required checked={f.furnished === v} onChange={() => set("furnished")(v)} />
                    {v === "yes" ? "Yes" : "No"}
                  </label>
                ))}
              </fieldset>
            </div>
            <div className="share-actions">
              <button className="btn" type="submit" disabled={busy !== ""}>
                {busy === "sending" ? "Sending…" : "Share it"}
              </button>
              <button
                type="button"
                className="mine-remove"
                onClick={() => {
                  setPreview(null);
                  setF(null);
                  setError("");
                }}
              >
                Use a different link
              </button>
            </div>
          </div>
        </form>
      )}

      {error && (
        <p className="list-error" role="alert" style={{ marginTop: 16 }}>
          {error}
        </p>
      )}
    </div>
  );
}
