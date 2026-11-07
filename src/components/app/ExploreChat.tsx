"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowUp, Mic, ShieldCheck } from "@/components/landing/icons";
import { useVoiceInput } from "@/components/landing/useVoiceInput";

const CHIPS = [
  "Summer sublet near Columbia under $1,800",
  "Furnished sublet for the spring semester",
  "Sublet for two, Sept to Dec",
  "Sublet that allows dogs",
  "Quiet sublet near the 1 train",
];

// The signed-in home: one chat box. Sending it opens /search, which shows the
// conversation on one side and the places that fit on the other.
export function ExploreChat() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const voice = useVoiceInput(setValue);

  function send(e?: React.FormEvent) {
    e?.preventDefault();
    const q = value.trim();
    if (!q) {
      textareaRef.current?.focus();
      return;
    }
    voice.stop();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="explore">
      <h1>What are you looking for?</h1>
      <p className="explore-sub">Tell Gable your dates, budget and what matters. We&apos;ll show sublets that fit.</p>

      <form className="chat-box" aria-label="Describe what you want" onSubmit={send}>
        <label htmlFor="explore-ask" className="sr-only">
          Describe what you want
        </label>
        <textarea
          id="explore-ask"
          ref={textareaRef}
          rows={2}
          autoFocus
          value={value}
          placeholder="Furnished sublet near campus, June 1 to Aug 15, under $1,800"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) send(e);
          }}
        />
        <div className="chat-row">
          <span className="chat-meta">
            <ShieldCheck />
            Verified sublets only
          </span>
          <div className="chat-buttons">
            {voice.supported && (
              <button
                className={`mic${voice.listening ? " listening" : ""}`}
                type="button"
                aria-label={voice.listening ? "Stop listening" : "Say what you need"}
                aria-pressed={voice.listening}
                onClick={() => (voice.listening ? voice.stop() : voice.start(value))}
              >
                <Mic />
              </button>
            )}
            <button className="send" type="submit" aria-label="Search">
              <ArrowUp />
            </button>
          </div>
        </div>
      </form>
      {(voice.listening || voice.error) && (
        <p className="voice-status" role="status">
          {voice.listening ? "Listening… say what you need." : voice.error}
        </p>
      )}

      <div className="chips" aria-label="Try one of these">
        {CHIPS.map((chip) => (
          <button
            key={chip}
            className="chip"
            type="button"
            onClick={() => {
              setValue(chip);
              textareaRef.current?.focus();
            }}
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}
