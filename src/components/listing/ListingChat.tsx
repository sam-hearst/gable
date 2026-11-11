"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// The group chat for one real listing: the host (the student subletting) and
// the students interested in the room. Everything goes straight to Supabase
// from the browser; row level security (supabase/listing_chats.sql) decides who
// can read, write, remove and end. New messages arrive by checking every few
// seconds, which is plenty for a chat this size.

type Member = { user_id: string; display_name: string; role: "host" | "member"; status: "active" | "removed" };
type Message = { id: string; user_id: string; body: string; created_at: string };
type Loaded = { chatExists: boolean; ended: boolean; members: Member[]; messages: Message[] };

const POLL_MS = 4000;
const time = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York" }).format(new Date(iso));

export function ListingChat({
  listingId,
  listingTitle,
  hostName,
  isHost,
  userId,
  defaultName,
}: {
  listingId: string;
  listingTitle: string;
  hostName: string;
  isHost: boolean;
  userId: string;
  defaultName: string;
}) {
  const [data, setData] = useState<Loaded | null>(null);
  const [notSetUp, setNotSetUp] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState(isHost ? hostName : defaultName);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const lastCount = useRef(0);

  const load = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) return setNotSetUp(true);
    const chat = await supabase.from("listing_chats").select("ended_at").eq("listing_id", listingId).maybeSingle();
    if (chat.error) {
      // The tables aren't there until supabase/listing_chats.sql has been run.
      if (/schema cache|does not exist|42P01|PGRST205/i.test(`${chat.error.code} ${chat.error.message}`)) setNotSetUp(true);
      else setError("We couldn't load the chat. Try again in a minute.");
      return;
    }
    if (!chat.data) return setData({ chatExists: false, ended: false, members: [], messages: [] });
    const [members, messages] = await Promise.all([
      supabase.from("listing_chat_members").select("user_id, display_name, role, status").eq("listing_id", listingId),
      supabase
        .from("listing_chat_messages")
        .select("id, user_id, body, created_at")
        .eq("listing_id", listingId)
        .order("created_at", { ascending: true })
        .limit(300),
    ]);
    setError("");
    setData({
      chatExists: true,
      ended: Boolean(chat.data.ended_at),
      members: (members.data ?? []) as Member[],
      messages: (messages.data ?? []) as Message[],
    });
  }, [listingId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- first load of the chat
    load();
  }, [load]);

  const me = data?.members.find((m) => m.user_id === userId);
  const isMember = me?.status === "active";

  // Reading the chat marks it read, and the sidebar's unread count updates.
  const messageCount = data?.messages.length ?? 0;
  useEffect(() => {
    if (!isMember) return;
    const supabase = createClient();
    supabase?.rpc("mark_chat_read", { l: listingId }).then(() => window.dispatchEvent(new Event("gable:chat-read")));
  }, [isMember, listingId, messageCount]);

  useEffect(() => {
    if (!isMember || data?.ended) return;
    const t = setInterval(() => document.visibilityState === "visible" && load(), POLL_MS);
    return () => clearInterval(t);
  }, [isMember, data?.ended, load]);

  useEffect(() => {
    const n = data?.messages.length ?? 0;
    if (n > lastCount.current) endRef.current?.scrollIntoView({ block: "end" });
    lastCount.current = n;
  }, [data?.messages.length]);

  async function run(action: () => PromiseLike<{ error: { code?: string; message: string } | null }>, failure: string) {
    setBusy(true);
    setError("");
    const { error: e } = await action();
    if (e) {
      console.warn("[chat]", e.message);
      setError(failure);
    }
    await load();
    setBusy(false);
    return !e;
  }

  async function join(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase) return;
    const display = name.trim().replace(/\s+/g, " ");
    if (!display) return setError("Add the first name the others will see.");
    setBusy(true);
    setError("");
    if (!data?.chatExists) {
      const made = await supabase.from("listing_chats").insert({ listing_id: listingId });
      // 23505: someone else just started it, which is fine.
      if (made.error && made.error.code !== "23505") {
        setBusy(false);
        return setError("This chat isn't open yet. Try again once the listing is live.");
      }
    }
    const joined = await supabase
      .from("listing_chat_members")
      .insert({ listing_id: listingId, user_id: userId, display_name: display.slice(0, 40) });
    if (joined.error) {
      setError(
        joined.error.code === "23505"
          ? "You can't join this chat."
          : "We couldn't add you. If the host has ended the chat, it's closed.",
      );
    }
    await load();
    setBusy(false);
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    const supabase = createClient();
    if (!supabase) return;
    setDraft("");
    const ok = await run(
      () => supabase.from("listing_chat_messages").insert({ listing_id: listingId, user_id: userId, body }),
      "That message didn't send. The chat may have ended.",
    );
    if (!ok) setDraft(body);
  }

  const supabase = createClient();
  const nameOf = (id: string) => data?.members.find((m) => m.user_id === id)?.display_name ?? "Someone";
  const active = data?.members.filter((m) => m.status === "active") ?? [];

  if (notSetUp)
    return (
      <div className="gc-card">
        <h2>Group chat isn&apos;t set up here yet</h2>
        <p>The team still needs to turn it on for this copy of Gable.</p>
      </div>
    );
  if (!data && !error) return <div className="gc-card" aria-busy="true" />;

  return (
    <div className="gc">
      <div className="gc-head">
        <div>
          <span className="eyebrow">Group chat</span>
          <h1>{listingTitle}</h1>
          <p>
            {hostName} (host) and the students interested in this room. {active.length > 0 && `${active.length} in the chat.`}
          </p>
        </div>
        {isHost && isMember && !data?.ended && (
          <button
            type="button"
            className="btn btn-secondary"
            disabled={busy}
            onClick={() => {
              if (confirm("End this chat? Nobody can send messages after it ends. You'll still see what was said."))
                run(
                  () =>
                    supabase!.from("listing_chats").update({ ended_at: new Date().toISOString() }).eq("listing_id", listingId),
                  "We couldn't end the chat. Try again.",
                );
            }}
          >
            End chat
          </button>
        )}
      </div>

      {data?.ended && (
        <p className="gc-ended" role="status">
          {isHost ? "You ended this chat." : `${hostName} ended this chat, so this room is taken.`} It&apos;s read-only now.
        </p>
      )}

      {!isMember ? (
        <form className="gc-join" onSubmit={join}>
          {data?.ended ? (
            <p>This chat has ended.</p>
          ) : (
            <>
              <h2>{isHost ? "Open the chat for your room" : "Join the chat for this room"}</h2>
              <p>
                {isHost
                  ? "Students who are interested will talk here. You can remove anyone and end the chat when the room is taken."
                  : `You'll be in a group with ${hostName}, who's subletting it, and other students interested. Questions about the room go here. Share your address or payment details only in a private message.`}
              </p>
              <label htmlFor="gc-name">First name the others will see</label>
              <input id="gc-name" maxLength={40} autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} />
              <button className="btn" type="submit" disabled={busy}>
                {busy ? "Joining…" : "Join the group chat"}
              </button>
            </>
          )}
        </form>
      ) : (
        <div className="gc-body">
          <div className="gc-thread" role="log" aria-live="polite" aria-label="Messages">
            {data!.messages.length === 0 && <p className="gc-empty">No messages yet. Say hi, or ask about the room.</p>}
            {data!.messages.map((m) => {
              const mine = m.user_id === userId;
              const author = data!.members.find((x) => x.user_id === m.user_id);
              return (
                <div key={m.id} className={`gc-msg${mine ? " is-mine" : ""}`}>
                  <div className="gc-bubble">
                    {!mine && (
                      <b>
                        {nameOf(m.user_id)}
                        {author?.role === "host" && <span className="gc-badge">Host</span>}
                      </b>
                    )}
                    <p>{m.body}</p>
                    <small>
                      {time(m.created_at)}
                      {(isHost || mine) && !data!.ended && (
                        <button
                          type="button"
                          onClick={() =>
                            run(() => supabase!.from("listing_chat_messages").delete().eq("id", m.id), "We couldn't delete that.")
                          }
                        >
                          Delete
                        </button>
                      )}
                    </small>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          <form className="gc-compose" onSubmit={send}>
            <input
              aria-label="Message"
              placeholder={data?.ended ? "This chat has ended" : "Write a message"}
              maxLength={1000}
              disabled={data?.ended || busy}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button className="btn" type="submit" disabled={data?.ended || busy || !draft.trim()}>
              Send
            </button>
          </form>

          <aside className="gc-people" aria-label="People in the chat">
            <h2>In this chat</h2>
            <ul>
              {active.map((m) => (
                <li key={m.user_id}>
                  <span>
                    {m.display_name}
                    {m.role === "host" && <span className="gc-badge">Host</span>}
                    {m.user_id === userId && <small> (you)</small>}
                  </span>
                  {isHost && m.role === "member" && !data?.ended && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        if (confirm(`Remove ${m.display_name}? They can't rejoin.`))
                          run(
                            () =>
                              supabase!
                                .from("listing_chat_members")
                                .update({ status: "removed" })
                                .eq("listing_id", listingId)
                                .eq("user_id", m.user_id),
                            "We couldn't remove them.",
                          );
                      }}
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {!isHost && !data?.ended && (
              <button
                type="button"
                className="gc-leave"
                disabled={busy}
                onClick={() =>
                  run(
                    () => supabase!.from("listing_chat_members").delete().eq("listing_id", listingId).eq("user_id", userId),
                    "We couldn't take you out of the chat.",
                  )
                }
              >
                Leave chat
              </button>
            )}
          </aside>
        </div>
      )}

      {error && (
        <p className="gc-error" role="alert">
          {error}
        </p>
      )}
      <Link className="back-link" href={`/sublet/${listingId}`}>
        &larr; Back to the listing
      </Link>
    </div>
  );
}
