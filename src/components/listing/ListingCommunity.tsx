"use client";

import Link from "next/link";
import { useState } from "react";

// DESIGN MOCKUP (sample data, nothing saved): the social part of a listing.
// "I'm interested", the group chat of everyone interested, and public
// questions the lister answers once for everyone. Unanswered questions stay
// visible and marked, because that's honest.

type QA = { q: string; by: string; via: string; a?: string; aBy?: string; helpful: number };

const SEEDED: string[] = ["Still available", "Utilities included", "Furnished", "Lease on file"];

const QUESTIONS: QA[] = [
  { q: "Are utilities included in the rent?", by: "Amara O.", via: "Direct connection", a: "Yes, utilities and wifi are included.", aBy: "Daniel (lister)", helpful: 9 },
  { q: "Is it okay to move in a day early, May 31?", by: "Lena W.", via: "Via Maya L.", a: "Should be fine. I move out May 30.", aBy: "Daniel (lister)", helpful: 4 },
  { q: "How's the noise from Frederick Douglass Blvd at night?", by: "Jordan T.", via: "Sublet this room Summer '26", a: "Quiet after 11pm. The bedroom faces the back.", aBy: "Jordan T. (lived here)", helpful: 6 },
  { q: "Is there a dishwasher?", by: "Kenji R.", via: "Via Sam H.", helpful: 1 },
];

export function ListingCommunity({ interested = 12, lister = "Daniel" }: { interested?: number; lister?: string }) {
  const [isInterested, setInterested] = useState(false);
  const [helpful, setHelpful] = useState<Record<number, boolean>>({});

  return (
    <section className="lc" aria-label="People and questions">
      <div className="lc-top">
        <div className="lc-faces" aria-hidden="true">
          {["A", "L", "J", "K"].map((c, i) => (
            <span key={c} style={{ background: ["#1D5C37", "#2B7A4B", "#5A6A60", "#C4622D"][i] }}>{c}</span>
          ))}
        </div>
        <p>
          <b>{interested + (isInterested ? 1 : 0)} people are interested</b>
          <span>Including Amara, who you know from SHPE</span>
        </p>
      </div>
      <div className="lc-actions">
        <button type="button" className={`lc-btn${isInterested ? " is-on" : ""}`} aria-pressed={isInterested} onClick={() => setInterested((v) => !v)}>
          {isInterested ? "✓ You're interested" : "I'm interested"}
        </button>
        <Link className="lc-btn lc-btn-ghost" href="/messages?chat=w118">
          Join the group chat
        </Link>
        <Link className="lc-btn lc-btn-ghost" href="/messages?chat=dm-daniel">
          Message {lister}
        </Link>
      </div>

      <h2 className="lc-h">Questions</h2>
      <p className="lc-sub">Asked by students, answered once for everyone. Addresses and payments stay in private messages.</p>
      <ul className="lc-seeded" aria-label="Already answered">
        {SEEDED.map((s) => (
          <li key={s}>✓ {s}</li>
        ))}
      </ul>

      <ol className="lc-qs">
        {QUESTIONS.map((x, i) => (
          <li key={i} className="lc-q">
            <p className="lc-q-text">{x.q}</p>
            <p className="lc-meta">
              {x.by} · <span className="lc-via">{x.via}</span>
            </p>
            {x.a ? (
              <div className="lc-a">
                <b>{x.aBy}</b>
                <p>{x.a}</p>
              </div>
            ) : (
              <p className="lc-unanswered">Not answered yet</p>
            )}
            <button type="button" className="lc-helpful" aria-pressed={Boolean(helpful[i])} onClick={() => setHelpful((h) => ({ ...h, [i]: !h[i] }))}>
              Helpful · {x.helpful + (helpful[i] ? 1 : 0)}
            </button>
          </li>
        ))}
      </ol>

      <form className="lc-ask" onSubmit={(e) => e.preventDefault()}>
        <input placeholder={`Ask ${lister} a question…`} aria-label="Ask a question" />
        <button type="submit" className="lc-btn">Ask</button>
      </form>
    </section>
  );
}
