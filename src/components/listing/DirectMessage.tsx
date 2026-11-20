"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, ChevronLeft } from "@/components/landing/icons";
import { createClient } from "@/lib/supabase/client";

// A private message thread between one renter and the lister of a real listing.
// Goes straight to Supabase from the browser; row level security
// (supabase/listing_dms.sql) lets only those two people read or write it. The
// renter's first message starts the thread. New messages arrive by checking
// every few seconds, like the group chat.

type Thread = { id: string; renter_id: string; lister_id: string; renter_name: string };
type Message = { id: string; user_id: string; body: string; created_at: string };

const POLL_MS = 4000;
const time = (iso: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  }).format(new Date(iso));

export function DirectMessage({
  listingId,
  listingTitle,
  listerName,
  isLister,
  threadId,
  userId,
  myName,
  preview,
}: {
  listingId: string;
  listingTitle: string;
  listerName: string;
  isLister: boolean;
  threadId: string | null; // the lister opens a specific thread; a renter has one per listing
  userId: string;
  myName: string; // your first name, from your account
  preview: { photo: string | null; photoAlt: string; line: string; dates: string };
}) {
  const [loaded, setLoaded] = useState(false);
  const [thread, setThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notSetUp, setNotSetUp] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const lastCount = useRef(0);
  const seeded = useRef(false);

  const load = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) return setNotSetUp(true);
    let q = supabase.from("listing_dms").select("id, renter_id, lister_id, renter_name").eq("listing_id", listingId);
    q = isLister ? q.eq("id", threadId ?? "") : q.eq("renter_id", userId);
    const found = await q.maybeSingle();
    if (found.error) {
      // The tables aren't there until supabase/listing_dms.sql has been run.
      if (/schema cache|does not exist|42P01|PGRST205/i.test(`${found.error.code} ${found.error.message}`)) setNotSetUp(true);
      else setError("We couldn't load this message. Try again in a minute.");
      return;
    }
    setError("");
    const t = found.data as Thread | null;
    setThread(t);
    // A renter who hasn't written yet starts with a friendly draft they can edit.
    if (!t && !isLister && !seeded.current) {
      seeded.current = true;
      setDraft(`Hi ${listerName}! Is your place still available for ${preview.dates}?`);
    }
    if (t) {
      const msgs = await supabase
        .from("listing_dm_messages")
        .select("id, user_id, body, created_at")
        .eq("dm_id", t.id)
        .order("created_at", { ascending: true })
        .limit(300);
      setMessages((msgs.data ?? []) as Message[]);
    }
    setLoaded(true);
  }, [listingId, isLister, threadId, userId, listerName, preview.dates]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- first load of the thread
    load();
  }, [load]);

  const threadKey = thread?.id;
  useEffect(() => {
    if (!threadKey) return;
    const t = setInterval(() => document.visibilityState === "visible" && load(), POLL_MS);
    return () => clearInterval(t);
  }, [threadKey, load]);

  // Reading the thread marks it read, and the sidebar's unread count updates.
  useEffect(() => {
    if (!threadKey) return;
    createClient()
      ?.rpc("mark_dm_read", { d: threadKey })
      .then(() => window.dispatchEvent(new Event("gable:chat-read")));
  }, [threadKey, messages.length]);

  useEffect(() => {
    if (messages.length > lastCount.current) endRef.current?.scrollIntoView({ block: "end" });
    lastCount.current = messages.length;
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    const supabase = createClient();
    if (!supabase) return;
    setBusy(true);
    setError("");
    let dmId = thread?.id;
    if (!dmId) {
      // First message from a renter: start the thread, then send.
      const display = myName.trim().replace(/\s+/g, " ") || "Renter";
      if (isLister) {
        setBusy(false);
        return setError("We couldn't find this message.");
      }
      const started = await supabase.rpc("start_dm", { l: listingId, name: display.slice(0, 40) });
      if (started.error || typeof started.data !== "string") {
        console.warn("[dm]", started.error?.message);
        setBusy(false);
        return setError("We couldn't start this message. The listing may no longer be open.");
      }
      dmId = started.data;
    }
    const sent = await supabase.from("listing_dm_messages").insert({ dm_id: dmId, user_id: userId, body });
    if (sent.error) {
      console.warn("[dm]", sent.error.message);
      setError("That message didn't send. Try again.");
    } else {
      setDraft("");
    }
    await load();
    setBusy(false);
  }

  if (notSetUp)
    return (
      <div className="gc-card">
        <h2>Messages aren&apos;t set up here yet</h2>
        <p>The team still needs to turn them on for this copy of Gable.</p>
        <Link className="back-link" href="/messages">
          &larr; Go to Messages
        </Link>
        <Link className="back-link" href={`/sublet/${listingId}`}>
          &larr; Back to the listing
        </Link>
      </div>
    );
  if (!loaded && !error) return <div className="gc-card" aria-busy="true" />;

  const otherName = isLister ? (thread?.renter_name ?? "A renter") : listerName;
  const missing = isLister && !thread && loaded;
  const listingHref = `/sublet/${listingId}`;

  // A time label above a message when it's the first, or 30+ minutes after the one before.
  const stamped = new Set<string>();
  messages.forEach((m, i) => {
    if (i === 0 || new Date(m.created_at).getTime() - new Date(messages[i - 1].created_at).getTime() > 30 * 60 * 1000)
      stamped.add(m.id);
  });

  return (
    <div className="dm">
      <header className="dm-top">
        <Link className="dm-back" href="/messages" aria-label="Back to Messages">
          <ChevronLeft size={22} />
        </Link>
        <span className="dm-avatar" aria-hidden="true">
          {otherName[0]?.toUpperCase()}
        </span>
        <div className="dm-who">
          <b>{missing ? "Message not found" : otherName}</b>
          <small>{listingTitle}</small>
        </div>
        {!isLister && (
          <Link className="dm-view" href={listingHref}>
            View listing
          </Link>
        )}
      </header>

      {!missing && (
        <>
          {!isLister && (
            <Link className="dm-listing" href={listingHref}>
              {preview.photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview.photo} alt={preview.photoAlt} />
              )}
              <span>
                <b>{listingTitle}</b>
                <small>{preview.line}</small>
              </span>
            </Link>
          )}

          <div className="dm-thread" role="log" aria-live="polite" aria-label="Messages">
            {messages.length === 0 && (
              <p className="dm-empty">
                {isLister
                  ? "No messages yet."
                  : `Only you and ${listerName} can read this. Your email stays private.`}
              </p>
            )}
            {messages.map((m) => {
              const mine = m.user_id === userId;
              return (
                <div key={m.id} className="dm-row">
                  {stamped.has(m.id) && <time className="dm-time">{time(m.created_at)}</time>}
                  <div className={`dm-bubble${mine ? " is-mine" : ""}`}>{m.body}</div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          <form className="dm-bar" onSubmit={send}>
            <input
              aria-label="Message"
              placeholder={`Message ${otherName}`}
              maxLength={1000}
              disabled={busy}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button className="dm-send" type="submit" disabled={busy || !draft.trim()} aria-label="Send">
              <ArrowUp size={20} />
            </button>
          </form>
          {!isLister && (
            <p className="dm-note">Share your address or payment details only once you&apos;ve seen the place and the lease.</p>
          )}
        </>
      )}

      {error && (
        <p className="gc-error dm-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
