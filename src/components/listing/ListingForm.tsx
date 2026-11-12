"use client";

import { useEffect, useRef, useState } from "react";
import { submitListing } from "@/app/sublet-your-room/actions";
import { ImagePlus, X } from "@/components/landing/icons";
import { AddressAutofill } from "@/components/listing/AddressAutofill";
import type { AddressSuggestion } from "@/lib/nyc-geosearch";
import {
  MAX_PHOTOS,
  MAX_PHOTO_BYTES,
  NEIGHBORHOOD_GROUPS,
  PHOTO_BUCKET,
  PHOTO_TYPES,
  nycToday,
  type ListingInput,
} from "@/lib/student-listing-fields";
import { createClient } from "@/lib/supabase/client";

type Fields = {
  title: string;
  description: string;
  neighborhood: string;
  crossStreets: string;
  roomType: string;
  sleeps: string;
  price: string;
  availableFrom: string;
  availableTo: string;
  furnished: "" | "yes" | "no";
  firstName: string;
  school: string;
  agreeToContact: boolean;
};

const EMPTY: Fields = {
  title: "",
  description: "",
  neighborhood: "",
  crossStreets: "",
  roomType: "private room",
  sleeps: "1",
  price: "",
  availableFrom: "",
  availableTo: "",
  furnished: "",
  firstName: "",
  school: "Columbia",
  agreeToContact: false,
};

// "70 Morningside Drive, New York, NY" from a picked suggestion.
const fullAddress = (s: AddressSuggestion) =>
  [s.main, s.secondary.replace(/,?\s*USA$/, "")].filter(Boolean).join(", ").slice(0, 80);

type Picked = { file: File; preview: string };

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

// The "List your room" form. Photos go straight from the browser to Supabase
// Storage, into the lister's own folder (the bucket's policies allow nothing
// else); then the server action checks everything and saves the listing as
// pending. If saving fails, the photos just uploaded are removed again.
export function ListingForm({ userId, email }: { userId: string; email: string | null }) {
  const [f, setF] = useState<Fields>(EMPTY);
  const [photos, setPhotos] = useState<Picked[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<false | "live" | "pending">(false);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const today = nycToday();

  // Free the preview URLs when photos are removed or the form goes away.
  const previews = useRef<string[]>([]);
  useEffect(() => {
    previews.current = photos.map((p) => p.preview);
  }, [photos]);
  useEffect(() => () => previews.current.forEach((url) => URL.revokeObjectURL(url)), []);

  const set = <K extends keyof Fields>(key: K) => (value: Fields[K]) => setF((prev) => ({ ...prev, [key]: value }));

  function fail(message: string) {
    setError(message);
    setBusy(false);
    requestAnimationFrame(() => errorRef.current?.focus());
  }

  function addPhotos(files: FileList | null) {
    if (!files) return;
    setError("");
    const next = [...photos];
    for (const file of Array.from(files)) {
      if (next.length >= MAX_PHOTOS) {
        setError(`Up to ${MAX_PHOTOS} photos. The rest weren't added.`);
        break;
      }
      if (!PHOTO_TYPES.includes(file.type)) {
        setError(`${file.name} isn't a JPEG, PNG or WebP photo.`);
        continue;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        setError(`${file.name} is over 5 MB. Try a smaller copy.`);
        continue;
      }
      next.push({ file, preview: URL.createObjectURL(file) });
    }
    setPhotos(next);
  }

  function removePhoto(i: number) {
    URL.revokeObjectURL(photos[i].preview);
    setPhotos(photos.filter((_, j) => j !== i));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!photos.length) return fail("Add at least one photo of the room.");
    if (!f.furnished) return fail("Say whether it comes furnished.");
    if (f.availableFrom && f.availableTo && f.availableTo <= f.availableFrom)
      return fail("The end date needs to be after the start date.");
    const supabase = createClient();
    if (!supabase) return fail("Posting isn't set up on this copy of Gable yet.");
    setBusy(true);

    const uploaded: string[] = [];
    for (const { file } of photos) {
      const path = `${userId}/${crypto.randomUUID()}.${EXT[file.type] ?? "jpg"}`;
      const { error: uploadError } = await supabase.storage
        .from(PHOTO_BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) {
        console.warn("[listings] photo upload failed:", uploadError.message);
        if (uploaded.length) await supabase.storage.from(PHOTO_BUCKET).remove(uploaded);
        return fail("One of your photos didn't upload. Check your connection and try again.");
      }
      uploaded.push(path);
    }

    const input: ListingInput = {
      title: f.title,
      description: f.description,
      neighborhood: f.neighborhood,
      crossStreets: f.crossStreets,
      roomType: f.roomType,
      sleeps: Number(f.sleeps),
      price: Number(f.price.replace(/[$,\s]/g, "")),
      availableFrom: f.availableFrom,
      availableTo: f.availableTo,
      furnished: f.furnished === "yes",
      photos: uploaded,
      firstName: f.firstName,
      school: f.school,
      agreeToContact: f.agreeToContact,
    };
    const result = await submitListing(input).catch(() => null);
    if (!result?.ok) {
      await supabase.storage.from(PHOTO_BUCKET).remove(uploaded);
      return fail(result?.error ?? "We couldn't save your listing. Try again in a minute.");
    }

    photos.forEach((p) => URL.revokeObjectURL(p.preview));
    setPhotos([]);
    setF(EMPTY);
    setBusy(false);
    setDone(result.live ? "live" : "pending");
  }

  if (done) {
    return (
      <div className="list-form">
        <p className="list-notice" role="status">
          {done === "live" ? (
            "Your listing is live. Students can find it in search and join its group chat. We may still email you to confirm you're on the lease."
          ) : (
            <>
              Thanks, it&apos;s in. Your listing stays hidden until we&apos;ve checked it. We&apos;ll email
              {email ? ` ${email}` : " you"} to ask for proof you&apos;re on the lease, usually within a day.
            </>
          )}
        </p>
        <button type="button" className="btn btn-secondary" onClick={() => setDone(false)}>
          List another room
        </button>
      </div>
    );
  }

  return (
    <form className="list-form" onSubmit={submit}>
      <div className="list-field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          required
          minLength={3}
          maxLength={80}
          placeholder="Sunny room two blocks from campus"
          value={f.title}
          onChange={(e) => set("title")(e.target.value)}
        />
      </div>

      <div className="list-row">
        <div className="list-field">
          <label htmlFor="cross">Address</label>
          <AddressAutofill
            id="cross"
            value={f.crossStreets}
            onChange={set("crossStreets")}
            onPick={(s) =>
              setF((prev) => ({
                ...prev,
                crossStreets: fullAddress(s),
                neighborhood: s.neighborhood ?? prev.neighborhood,
              }))
            }
            onGuess={(s) => setF((prev) => ({ ...prev, neighborhood: prev.neighborhood || (s.neighborhood ?? "") }))}
          />
          <small id="cross-hint">Search your address and pick it. We fill in the neighborhood.</small>
        </div>
        <div className="list-field">
          <label htmlFor="neighborhood">Neighborhood</label>
          <select id="neighborhood" required value={f.neighborhood} onChange={(e) => set("neighborhood")(e.target.value)}>
            <option value="" disabled>
              Pick one
            </option>
            {NEIGHBORHOOD_GROUPS.map((g) => (
              <optgroup key={g.borough} label={g.borough}>
                {g.areas.map((n) => (
                  <option key={n} value={n}>
                    {n === g.borough ? `Somewhere else in ${g.borough}` : n.replace(`, ${g.borough}`, "")}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <small>Fills in from the address. You can change it.</small>
        </div>
      </div>

      <div className="list-row">
        <div className="list-field">
          <label htmlFor="from">Available from</label>
          <input id="from" type="date" required min={today} value={f.availableFrom} onChange={(e) => set("availableFrom")(e.target.value)} />
        </div>
        <div className="list-field">
          <label htmlFor="to">Available until</label>
          <input
            id="to"
            type="date"
            required
            min={f.availableFrom || today}
            value={f.availableTo}
            onChange={(e) => set("availableTo")(e.target.value)}
          />
        </div>
      </div>

      <div className="list-row">
        <div className="list-field">
          <label htmlFor="price">Monthly rent</label>
          <input
            id="price"
            inputMode="numeric"
            required
            pattern="\$?\s?[0-9][0-9,]*"
            placeholder="$1,450"
            value={f.price}
            onChange={(e) => set("price")(e.target.value)}
          />
        </div>
        <div className="list-field">
          <label htmlFor="room-type">What kind of space</label>
          <select id="room-type" value={f.roomType} onChange={(e) => set("roomType")(e.target.value)}>
            <option value="private room">Private room</option>
            <option value="studio">Studio</option>
            <option value="shared">Shared room</option>
          </select>
        </div>
      </div>

      <div className="list-row">
        <div className="list-field">
          <fieldset>
            <legend>Furnished?</legend>
            {(["yes", "no"] as const).map((v) => (
              <label key={v} className="list-choice">
                <input
                  type="radio"
                  name="furnished"
                  required
                  checked={f.furnished === v}
                  onChange={() => set("furnished")(v)}
                />
                {v === "yes" ? "Yes" : "No"}
              </label>
            ))}
          </fieldset>
        </div>
        <div className="list-field">
          <label htmlFor="sleeps">How many people it fits</label>
          <select id="sleeps" value={f.sleeps} onChange={(e) => set("sleeps")(e.target.value)}>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="list-field">
        <label htmlFor="description">Describe it in your own words</label>
        <textarea
          id="description"
          required
          minLength={20}
          maxLength={1000}
          placeholder="What the room and roommates are like, laundry, pets, how far to campus or the train."
          value={f.description}
          onChange={(e) => set("description")(e.target.value)}
        />
      </div>

      <div className="list-field">
        <span id="photos-label" style={{ fontSize: 14, fontWeight: 700 }}>
          Photos
        </span>
        <small id="photos-hint">
          1 to {MAX_PHOTOS} photos of the actual room, up to 5 MB each. Anyone with the link can see them, so
          don&apos;t upload your lease or anything personal here.
        </small>
        {photos.length > 0 && (
          <div className="list-photos">
            {photos.map((p, i) => (
              <div className="list-photo" key={p.preview}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.preview} alt={`Photo ${i + 1}: ${p.file.name}`} />
                <button type="button" onClick={() => removePhoto(i)} aria-label={`Remove photo ${i + 1}`}>
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
        {photos.length < MAX_PHOTOS && (
          <label className="list-add">
            <ImagePlus size={20} />
            {photos.length ? "Add more photos" : "Add photos"}
            <input
              type="file"
              accept={PHOTO_TYPES.join(",")}
              multiple
              aria-labelledby="photos-label"
              aria-describedby="photos-hint"
              onChange={(e) => {
                addPhotos(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>

      <div className="list-row">
        <div className="list-field">
          <label htmlFor="first-name">Your first name</label>
          <input
            id="first-name"
            required
            maxLength={40}
            autoComplete="given-name"
            value={f.firstName}
            onChange={(e) => set("firstName")(e.target.value)}
          />
        </div>
        <div className="list-field">
          <label htmlFor="school">Your school</label>
          <input id="school" required minLength={2} maxLength={60} value={f.school} onChange={(e) => set("school")(e.target.value)} />
        </div>
      </div>

      <label className="list-agree">
        <input
          type="checkbox"
          required
          checked={f.agreeToContact}
          onChange={(e) => set("agreeToContact")(e.target.checked)}
        />
        <span>
          Students signed in to Gable can see my email{email ? ` (${email})` : ""} so they can reach me about this
          room.
        </span>
      </label>

      {error && (
        <p className="list-error" role="alert" tabIndex={-1} ref={errorRef}>
          {error}
        </p>
      )}

      <button className="btn" type="submit" disabled={busy}>
        {busy ? "Sending…" : "Send for checking"}
      </button>
    </form>
  );
}
