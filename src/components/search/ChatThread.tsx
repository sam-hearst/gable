"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ArrowUp } from "@/components/landing/icons";
import { useSearchSession } from "./SearchSession";

// Earlier replies in this tab, so the whole conversation shows after each
// follow-up (the URL only holds what you typed). Keyed by the messages that
// led to each reply. Wrapped in try/catch in case storage is blocked.
const STORE = "gable:search-replies";

function readStore(): string | null {
  try {
    return window.sessionStorage.getItem(STORE);
  } catch {
    return null;
  }
}

function saveReply(messages: string[], reply: string) {
  try {
    const all: Record<string, string> = JSON.parse(window.sessionStorage.getItem(STORE) ?? "{}");
    all[JSON.stringify(messages)] = reply;
    const keys = Object.keys(all);
    for (const key of keys.slice(0, Math.max(0, keys.length - 50))) delete all[key];
    window.sessionStorage.setItem(STORE, JSON.stringify(all));
  } catch {
    // Storage blocked: earlier replies just won't show.
  }
}

const noSubscribe = () => () => {};

function GableBubble({ children, busy = false }: { children: React.ReactNode; busy?: boolean }) {
  return (
    <div className="search-msg search-msg-gable" aria-busy={busy || undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="search-msg-icon" src="/logo/gable-favicon.svg" alt="Gable" width={28} height={28} />
      <p>{children}</p>
    </div>
  );
}

// The chat on the left of /search: everything you've asked, Gable's replies,
// and a box to keep refining ("cheaper", "only Harlem").
export function ChatThread({ reply }: { reply: string }) {
  const { messages, pending, send } = useSearchSession();
  const [draft, setDraft] = useState("");
  const threadRef = useRef<HTMLDivElement>(null);

  const stored = useSyncExternalStore(noSubscribe, readStore, () => null);
  const earlier = useMemo(() => {
    try {
      return JSON.parse(stored ?? "{}") as Record<string, string>;
    } catch {
      return {};
    }
  }, [stored]);

  // Remember this reply for the next follow-up.
  useEffect(() => {
    if (messages.length) saveReply(messages, reply);
  }, [messages, reply]);

  // Keep the newest message in view inside the chat column.
  useEffect(() => {
    const el = threadRef.current;
    if (el && el.scrollHeight > el.clientHeight) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, pending]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || pending) return;
    send(draft);
    setDraft("");
  }

  return (
    <>
      <div className="search-thread" ref={threadRef}>
        <h1 className="sr-only">Your search</h1>
        {messages.map((m, i) => {
          const last = i === messages.length - 1;
          const earlierReply = last ? null : earlier[JSON.stringify(messages.slice(0, i + 1))];
          return (
            <div key={i} className="search-turn">
              <div className="search-msg search-msg-you">
                <p>{m}</p>
              </div>
              {last ? (
                <div role="status">
                  <GableBubble>{reply}</GableBubble>
                </div>
              ) : (
                earlierReply && <GableBubble>{earlierReply}</GableBubble>
              )}
            </div>
          );
        })}
        {!messages.length && (
          <div role="status">
            <GableBubble>{reply}</GableBubble>
          </div>
        )}
        {pending && (
          <div className="search-turn">
            <div className="search-msg search-msg-you">
              <p>{pending}</p>
            </div>
            <GableBubble busy>Reading your request…</GableBubble>
          </div>
        )}
      </div>

      <form className="search-followup" onSubmit={submit} aria-label="Refine your search">
        <label htmlFor="search-followup-input" className="sr-only">
          {messages.length ? "Refine your search" : "Describe the place you want"}
        </label>
        <textarea
          id="search-followup-input"
          rows={1}
          value={draft}
          placeholder={messages.length ? "Refine it: cheaper, only Harlem, starts July 1…" : "Describe the place you want"}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) submit(e);
          }}
        />
        <button className="search-send" type="submit" aria-label="Send" disabled={!draft.trim() || Boolean(pending)}>
          <ArrowUp />
        </button>
      </form>
    </>
  );
}
