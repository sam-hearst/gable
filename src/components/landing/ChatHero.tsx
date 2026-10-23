"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { ArrowUp, ShieldCheck } from "./icons";
import { px } from "./Photo";
import { SignupForm } from "./SignupForm";

export type HeroMode = { id: string; label: string; prompts: string[] };
export type CollageItem = { id: number; badge?: string; bold?: string; text: string };
export type StripItem = { id: number; badge: string };

type ChatHeroProps = {
  source: string;
  announce?: boolean;
  badge?: string;
  title: React.ReactNode;
  sub: string;
  modes?: HeroMode[];
  modesLabel?: string;
  prompts?: string[];
  meta: string;
  chips: string[];
  collage: CollageItem[];
  strip: StripItem[];
  modal: { title: string; lead: string; button: string; placeholder?: string };
  searchOnSend?: boolean;
};

// The Daydream-style hero: describe what you want in one chat box. Sending a
// request opens a popup that asks for an email and saves what they typed, or,
// with searchOnSend, goes to /search with what they typed.
export function ChatHero({
  source,
  announce = false,
  badge,
  title,
  sub,
  modes,
  modesLabel = "What are you looking for?",
  prompts = [],
  meta,
  chips,
  collage,
  strip,
  modal,
  searchOnSend = false,
}: ChatHeroProps) {
  const router = useRouter();
  const [mode, setMode] = useState(modes?.[0]?.id);
  const [value, setValue] = useState("");
  const [placeholder, setPlaceholder] = useState<string | null>(null);
  const [request, setRequest] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activePrompts = modes?.find((m) => m.id === mode)?.prompts ?? prompts;

  // Types each example prompt into the placeholder, then deletes it. With
  // reduced motion it doesn't animate and the first prompt shows as-is.
  useEffect(() => {
    if (!activePrompts.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let p = 0;
    let i = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const text = activePrompts[p];
      if (!deleting) {
        i++;
        setPlaceholder(text.slice(0, i));
        if (i === text.length) {
          deleting = true;
          timer = setTimeout(tick, 1800);
          return;
        }
        timer = setTimeout(tick, 38);
      } else {
        i--;
        setPlaceholder(text.slice(0, i));
        if (i === 0) {
          deleting = false;
          p = (p + 1) % activePrompts.length;
          timer = setTimeout(tick, 300);
          return;
        }
        timer = setTimeout(tick, 16);
      }
    };
    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, [activePrompts]);

  function send(e?: React.FormEvent) {
    e?.preventDefault();
    const q = value.trim() || activePrompts[0] || "";
    setRequest(q);
    trackEvent("chat_request", { page_variant: source, mode: mode ?? "" });
    if (searchOnSend) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
      return;
    }
    dialogRef.current?.showModal();
  }

  return (
    <section className="hero">
      <div className="collage" aria-hidden="true">
        {collage.map((c, n) => (
          <div key={c.id} className={`float f${n + 1}`}>
            {c.badge && (
              <span className="badge">
                <span className="dot" />
                {c.badge}
              </span>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={px(c.id, 400)} alt="" />
            <div className="cap">
              {c.bold && <b>{c.bold}</b>}
              <span>{c.text}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="wrap">
        {announce && (
          <a className="announce" href="#join">
            <span className="new">NEW</span>
            <span className="pulse" />
            Early access for Columbia students
          </a>
        )}
        {badge && (
          <span className="badge" style={{ marginBottom: 18 }}>
            <span className="dot" />
            {badge}
          </span>
        )}
        <h1>{title}</h1>
        <p className="sub">{sub}</p>

        {modes && (
          <div className="segmented" role="group" aria-label={modesLabel}>
            {modes.map((m) => (
              <button key={m.id} type="button" aria-pressed={m.id === mode} onClick={() => setMode(m.id)}>
                {m.label}
              </button>
            ))}
          </div>
        )}

        <div className="chat-stage">
          <form className="chat-box" aria-label="Describe what you want" onSubmit={send}>
            <label htmlFor={`ask-${source}`} className="sr-only">
              Describe what you want
            </label>
            <textarea
              id={`ask-${source}`}
              ref={textareaRef}
              rows={2}
              value={value}
              placeholder={placeholder ?? activePrompts[0]}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) send(e);
              }}
            />
            <div className="chat-row">
              <span className="chat-meta">
                <ShieldCheck />
                {meta}
              </span>
              <button className="send" type="submit" aria-label="Send">
                <ArrowUp />
              </button>
            </div>
          </form>
        </div>

        <div className="chips" aria-label="Try one of these">
          {chips.map((chip) => (
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

        <div className="photo-strip" aria-hidden="true">
          {strip.map((s) => (
            <figure key={s.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={px(s.id, 300)} alt="" />
              <span className="badge">
                <span className="dot" />
                {s.badge}
              </span>
            </figure>
          ))}
        </div>
      </div>

      <dialog
        className="modal"
        ref={dialogRef}
        aria-labelledby={`modal-title-${source}`}
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <div className="modal-inner">
          <button className="modal-close" type="button" aria-label="Close" onClick={() => dialogRef.current?.close()}>
            &times;
          </button>
          <h2 id={`modal-title-${source}`}>{modal.title}</h2>
          <div className="echo">{request}</div>
          <p className="lead">{modal.lead}</p>
          <SignupForm source={source} mode={mode} request={request} button={modal.button} placeholder={modal.placeholder} stacked />
        </div>
      </dialog>
    </section>
  );
}
