"use client";

import { useState } from "react";
import { ArrowUp, Mic } from "@/components/landing/icons";
import { useVoiceInput } from "@/components/landing/useVoiceInput";
import { useSearchSession } from "./SearchSession";

// The chat, at the bottom of the screen like Messages: what you've asked so
// far as small chips, and a box (or the mic) to keep refining. Sending updates
// the places above it.
export function RefineBar() {
  const { messages, pending, send } = useSearchSession();
  const [draft, setDraft] = useState("");
  const voice = useVoiceInput(setDraft);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!draft.trim() || pending) return;
    voice.stop();
    send(draft);
    setDraft("");
  }

  const asked = pending ? [...messages, pending] : messages;

  return (
    <div className="refine-dock">
      <div className="refine-bar">
        {asked.length > 0 && (
          <ol className="refine-asked" aria-label="What you've asked">
            {asked.map((m, i) => (
              <li key={i} className={pending && i === asked.length - 1 ? "is-pending" : undefined}>
                {m}
              </li>
            ))}
          </ol>
        )}
        <form className="refine-form" onSubmit={submit} aria-label="Refine your search">
          <label htmlFor="refine-input" className="sr-only">
            Refine your search
          </label>
          <input
            id="refine-input"
            value={draft}
            autoComplete="off"
            placeholder={pending ? "Updating your places…" : "Refine it: cheaper, only Harlem, starts July 1…"}
            onChange={(e) => setDraft(e.target.value)}
          />
          {voice.supported && (
            <button
              type="button"
              className={`refine-mic${voice.listening ? " listening" : ""}`}
              aria-label={voice.listening ? "Stop listening" : "Say it instead"}
              aria-pressed={voice.listening}
              onClick={() => (voice.listening ? voice.stop() : voice.start(draft))}
            >
              <Mic size={18} />
            </button>
          )}
          <button className="refine-send" type="submit" aria-label="Refine" disabled={!draft.trim() || Boolean(pending)}>
            <ArrowUp size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
