"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import "@/components/listing/listing-chat.css";

// The Messages page: "Group chats" on top (every listing chat you're in, newest
// first) and "Direct messages" below (your one-to-one threads), each with how
// many messages you haven't read yet. With neither it shows nothing, or the
// empty message when `showEmpty` is set.

type Chat = {
  listing_id: string;
  title: string;
  host_name: string;
  ended: boolean;
  last_body: string | null;
  last_at: string;
  unread: number;
};

type Dm = {
  dm_id: string;
  listing_id: string;
  title: string;
  other_name: string;
  as_lister: boolean;
  last_body: string | null;
  last_at: string;
  unread: number;
};

const when = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" }).format(new Date(iso));

export function MyChats({ showEmpty = false }: { showEmpty?: boolean }) {
  const [chats, setChats] = useState<Chat[] | null>(null);
  const [dms, setDms] = useState<Dm[]>([]);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Supabase isn't set up: nothing to load
      setChats([]);
      return;
    }
    let live = true;
    const load = async () => {
      const [chatRes, dmRes] = await Promise.all([supabase.rpc("my_chats"), supabase.rpc("my_dms")]);
      if (!live) return;
      // Either set of tables may not exist yet (chat_unread.sql, listing_dms.sql): show what's there.
      setDms(dmRes.error ? [] : ((dmRes.data ?? []) as Dm[]));
      setChats(chatRes.error ? [] : ((chatRes.data ?? []) as Chat[]));
    };
    load();
    const timer = setInterval(() => document.visibilityState === "visible" && load(), 30000);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, []);

  if (!chats) return null;
  if (chats.length === 0 && dms.length === 0) {
    return showEmpty ? (
      <div className="messages-empty">
        <h1>No messages yet</h1>
        <p>When you message a lister or join a listing&apos;s group chat, it shows up here.</p>
        <Link className="btn btn-sm" href="/explore">
          Find a sublet
        </Link>
      </div>
    ) : null;
  }

  // Two sections: group chats on top, direct messages (one-to-one with a lister
  // or renter) below.
  return (
    <>
      <section className="mc" aria-label="Your group chats">
        <h1>Group chats</h1>
        {chats.length > 0 ? (
          <ul>
            {chats.map((c) => (
              <li key={c.listing_id}>
                <Link href={`/sublet/${c.listing_id}/chat`} className={c.unread > 0 ? "is-unread" : undefined}>
                  <span className="mc-main">
                    <b>{c.title}</b>
                    <small>
                      {c.ended ? "Ended · " : ""}
                      {c.last_body ?? `Chat with ${c.host_name}. No messages yet.`}
                    </small>
                  </span>
                  <span className="mc-side">
                    <small>{when(c.last_at)}</small>
                    {c.unread > 0 && <span className="app-badge">{c.unread > 9 ? "9+" : c.unread}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mc-none">Join a listing&apos;s group chat and it shows up here.</p>
        )}
      </section>

      <section className="mc" aria-label="Your direct messages">
        <h2>Direct messages</h2>
        {dms.length > 0 ? (
          <ul>
            {dms.map((d) => (
              <li key={d.dm_id}>
                <Link
                  href={`/sublet/${d.listing_id}/message${d.as_lister ? `?t=${d.dm_id}` : ""}`}
                  className={d.unread > 0 ? "is-unread" : undefined}
                >
                  <span className="mc-main">
                    <b>
                      {d.other_name} · {d.title}
                    </b>
                    <small>{d.last_body ?? "No messages yet."}</small>
                  </span>
                  <span className="mc-side">
                    <small>{when(d.last_at)}</small>
                    {d.unread > 0 && <span className="app-badge">{d.unread > 9 ? "9+" : d.unread}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mc-none">Message a lister from their listing and it shows up here.</p>
        )}
      </section>
    </>
  );
}
