"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useState, useTransition } from "react";
import { trackEvent } from "@/lib/analytics";

type Session = {
  messages: string[];
  pending: string | null; // a follow-up that's been sent but not answered yet
  send: (message: string) => void;
};

const SessionContext = createContext<Session>({ messages: [], pending: null, send: () => {} });

export const useSearchSession = () => useContext(SessionContext);

// The URL for a conversation: every message as its own ?q=, oldest first, so a
// refresh keeps the thread and Back undoes the last follow-up.
export function searchUrl(messages: string[]) {
  const params = new URLSearchParams();
  messages.forEach((m) => params.append("q", m));
  return `/search?${params.toString()}`;
}

// Wraps the two-column layout. Sending a follow-up goes to the same page with
// one more message; until the answer arrives, the new message shows in the
// chat and the cards are dimmed.
export function SearchSession({ messages, children }: { messages: string[]; children: React.ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pending, setPending] = useState<string | null>(null);

  function send(message: string) {
    const text = message.trim().slice(0, 500);
    if (!text) return;
    trackEvent("chat_request", { page_variant: "search_followup", mode: "" });
    setPending(text);
    startTransition(() => router.push(searchUrl([...messages, text]), { scroll: false }));
  }

  return (
    <SessionContext.Provider value={{ messages, pending: isPending ? pending : null, send }}>
      <div className="search-layout" data-pending={isPending || undefined}>
        {children}
      </div>
    </SessionContext.Provider>
  );
}
