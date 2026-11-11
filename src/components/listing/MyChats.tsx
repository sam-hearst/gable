"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import "@/components/listing/listing-chat.css";

// "Your group chats" on the Messages page: every listing chat you're in, newest
// first, with how many messages you haven't read yet. With no chats it shows
// nothing, or the empty message when `showEmpty` is set.

type Chat = {
  listing_id: string;
  title: string;
  host_name: string;
  ended: boolean;
  last_body: string | null;
  last_at: string;
  unread: number;
};

const when = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" }).format(new Date(iso));

export function MyChats({ showEmpty = false }: { showEmpty?: boolean }) {
  const [chats, setChats] = useState<Chat[] | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Supabase isn't set up: nothing to load
      setChats([]);
      return;
    }
    let live = true;
    const load = async () => {
      const { data, error } = await supabase.rpc("my_chats");
      if (live) setChats(error ? [] : ((data ?? []) as Chat[]));
    };
    load();
    const timer = setInterval(() => document.visibilityState === "visible" && load(), 30000);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, []);

  if (!chats) return null;
  if (chats.length === 0) {
    return showEmpty ? (
      <div className="messages-empty">
        <h1>No messages yet</h1>
        <p>When you join a listing&apos;s group chat, it shows up here.</p>
        <Link className="btn btn-sm" href="/explore">
          Find a sublet
        </Link>
      </div>
    ) : null;
  }

  return (
    <section className="mc" aria-label="Your group chats">
      <h1>Your group chats</h1>
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
    </section>
  );
}
