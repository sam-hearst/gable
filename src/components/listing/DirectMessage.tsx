"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar } from "./Avatar";
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
      <div className="gc-card cm-pane-card">
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

  // A time label under a message when the next one is 30+ minutes later (or it's the last).
  const stamped = new Set<string>();
  messages.forEach((m, i) => {
    const next = messages[i + 1];
    if (!next || new Date(next.created_at).getTime() - new Date(m.created_at).getTime() > 30 * 60 * 1000) stamped.add(m.id);
  });

  return (
    <>
      <header className="cm-chat-head">
        <div>
          <h2>{missing ? "We couldn't find this message" : otherName}</h2>
          <p>About {listingTitle}</p>
        </div>
        {isLister ? (
          <span className="cm-closes">Private</span>
        ) : (
          <Link className="cm-closes" href={listingHref}>
            View listing
          </Link>
        )}
      </header>

      {!missing && (
        <>
          <div className="cm-thread" role="log" aria-live="polite" aria-label="Messages">
            <p className="cm-system">
              Only you and {otherName} can read this. Your email stays private.
              {!isLister && " Share your address or payment details only once you've seen the place and the lease."}
            </p>
            {!isLister && (
              <div className="cm-msg">
                <Avatar name={listerName} />
                <div className="cm-msg-body">
                  <Link className="cm-post" href={listingHref}>
                    {preview.photo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={preview.photo} alt={preview.photoAlt} />
                    )}
                    <span className="cm-post-body">
                      <span className="cm-post-label">Listing</span>
                      <span className="cm-post-title">{listingTitle}</span>
                      <span className="cm-post-when">{preview.line}</span>
                      <span className="cm-post-link">View listing</span>
                    </span>
                  </Link>
                </div>
              </div>
            )}
            {messages.map((m) => {
              const mine = m.user_id === userId;
              return (
                <div key={m.id} className={`cm-msg${mine ? " is-mine" : ""}`}>
                  {!mine && <Avatar name={otherName} />}
                  <div className="cm-msg-body">
                    <p className="cm-bubble">{m.body}</p>
                    {stamped.has(m.id) && <span className="cm-time">{time(m.created_at)}</span>}
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          <form className="cm-composer" onSubmit={send}>
            <div className="cm-input">
              <input
                aria-label="Message"
                placeholder={`Message ${otherName}…`}
                maxLength={1000}
                disabled={busy}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <button type="submit" disabled={busy || !draft.trim()} aria-label="Send">
                ↑
              </button>
            </div>
          </form>
        </>
      )}

      {error && (
        <p className="gc-error cm-pane-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
