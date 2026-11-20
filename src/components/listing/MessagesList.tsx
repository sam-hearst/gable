"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "./Avatar";

// The left side of Messages: "Listing groups" (the group chat for every listing
// you're in) and "Direct messages" (your one-to-one threads), newest first, with
// unread counts. Tapping one opens it on the right (?c=group:<listing> or
// ?c=dm:<thread>).

type Chat = { listing_id: string; title: string; host_name: string; ended: boolean; last_body: string | null; last_at: string; unread: number };
type Dm = { dm_id: string; listing_id: string; title: string; other_name: string; as_lister: boolean; last_body: string | null; last_at: string; unread: number };

export function MessagesList() {
  const current = useSearchParams().get("c");
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
      // Either set of tables may not exist yet: show what's there.
      setDms(dmRes.error ? [] : ((dmRes.data ?? []) as Dm[]));
      setChats(chatRes.error ? [] : ((chatRes.data ?? []) as Chat[]));
    };
    load();
    const timer = setInterval(() => document.visibilityState === "visible" && load(), 15000);
    window.addEventListener("gable:chat-read", load);
    return () => {
      live = false;
      clearInterval(timer);
      window.removeEventListener("gable:chat-read", load);
    };
  }, []);

  return (
    <aside className="cm-list" aria-label="Your chats">
      <div className="cm-list-head">
        <h1>Messages</h1>
        <p>A group for each place you&apos;re interested in, and one-on-one chats with listers.</p>
      </div>

      <section>
        <h2 className="cm-group">Listing groups</h2>
        {chats?.map((c) => {
          const id = `group:${c.listing_id}`;
          return (
            <Link key={id} href={`/messages?c=${id}`} className="cm-row cm-row-media" aria-current={current === id ? "true" : undefined}>
              <Avatar name={c.host_name} size={44} />
              <span className="cm-row-text">
                <span className="cm-row-top">
                  <span className="cm-row-name">{c.title}</span>
                  {c.unread > 0 && <span className="cm-badge">{c.unread > 9 ? "9+" : c.unread}</span>}
                </span>
                <span className="cm-row-last">{c.ended ? "Ended · " : ""}{c.last_body ?? `Chat with ${c.host_name}. No messages yet.`}</span>
              </span>
            </Link>
          );
        })}
        {chats && chats.length === 0 && <p className="cm-list-none">Join a listing&apos;s group chat and it shows up here.</p>}
      </section>

      <section>
        <h2 className="cm-group">Direct messages</h2>
        {dms.map((d) => {
          const id = `dm:${d.dm_id}`;
          return (
            <Link key={id} href={`/messages?c=${id}`} className="cm-row cm-row-media" aria-current={current === id ? "true" : undefined}>
              <Avatar name={d.other_name} size={44} />
              <span className="cm-row-text">
                <span className="cm-row-top">
                  <span className="cm-row-name">{d.other_name}</span>
                  {d.unread > 0 && <span className="cm-badge">{d.unread > 9 ? "9+" : d.unread}</span>}
                </span>
                <span className="cm-row-last">{d.last_body ?? d.title}</span>
              </span>
            </Link>
          );
        })}
        {chats && dms.length === 0 && <p className="cm-list-none">Message a lister from their listing and it shows up here.</p>}
      </section>
    </aside>
  );
}
