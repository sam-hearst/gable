"use client";

import { useRef, useState } from "react";
import { readPastedPost } from "@/app/sublet-your-room/actions";
import { trackEvent } from "@/lib/analytics";
import type { PostFields } from "@/lib/paste-post";

const MAX_CHARS = 4000; // same as MAX_POST_CHARS on the server

// What each field is called in the note under the box, in form order.
const LABELS: [keyof PostFields, string][] = [
  ["address", "address"],
  ["neighborhood", "neighborhood"],
  ["availableFrom", "start date"],
  ["availableTo", "end date"],
  ["price", "rent"],
  ["roomType", "kind of space"],
  ["furnished", "furnished"],
  ["description", "description"],
];

const list = (items: string[]) =>
  items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

// "Paste your post" at the top of List your room. Sends the post to the
// server, which asks Claude for the fields it states, then hands them to the
// form. Nothing is saved: the student checks every field and sends the form
// themselves. If reading fails, the form just stays empty.
export function PastePost({ onFill }: { onFill: (fields: PostFields) => void }) {
  const [post, setPost] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const noteRef = useRef<HTMLParagraphElement>(null);

  function show(message: string) {
    setNote(message);
    setBusy(false);
    requestAnimationFrame(() => noteRef.current?.focus());
  }

  async function read() {
    if (!post.trim() || busy) return;
    setBusy(true);
    setNote("");
    const fields = await readPastedPost(post).catch(() => null);
    if (!fields) {
      trackEvent("listing_post_pasted", { result: "failed", fields: "0" });
      return show("We couldn't read your post just now. Fill in the form below, or try again in a minute.");
    }
    const found = LABELS.filter(([k]) => fields[k] !== null).map(([, label]) => label);
    const missing = LABELS.filter(([k]) => fields[k] === null).map(([, label]) => label);
    trackEvent("listing_post_pasted", { result: found.length ? "filled" : "empty", fields: String(found.length) });
    if (!found.length) {
      return show("We couldn't find dates, rent or other details in that post. Fill in the form below.");
    }
    onFill(fields);
    show(
      `Filled in from your post: ${list(found)}.` +
        (missing.length ? ` We couldn't fill in the ${list(missing)} from it, so fill ${missing.length === 1 ? "that" : "those"} in yourself.` : "") +
        " Add a title and photos, and check every field before you send it.",
    );
  }

  return (
    <div className="paste">
      <h3>Paste your post</h3>
      <p>
        Already posted it on Facebook, Instagram or a group chat? Paste it here and we&apos;ll fill in the form from it.
        Nothing is saved until you check every field and send the form.
      </p>
      <div className="list-field">
        <label htmlFor="paste-post">Your post</label>
        <textarea
          id="paste-post"
          maxLength={MAX_CHARS}
          placeholder="Subletting my room on W 112th, June 1 to Aug 15, $1,400/month, furnished…"
          value={post}
          onChange={(e) => setPost(e.target.value)}
        />
      </div>
      <button type="button" className="btn btn-secondary" onClick={read} disabled={busy || !post.trim()}>
        {busy ? "Reading your post…" : "Fill in the form"}
      </button>
      {note && (
        <p className="paste-note" role="status" tabIndex={-1} ref={noteRef}>
          {note}
        </p>
      )}
    </div>
  );
}
