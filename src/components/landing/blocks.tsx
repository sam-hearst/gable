// Server-rendered building blocks shared by the landing pages.

import { Fragment } from "react";
import { Check, CircleCheck } from "./icons";
import { Photo } from "./Photo";
import { SignupForm } from "./SignupForm";

// The hand-drawn sun underline under the key word of a headline.
export function Mark({ children }: { children: React.ReactNode }) {
  return (
    <span className="mark">
      <em>{children}</em>
      <svg viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden="true">
        <path d="M3 14 C 50 4, 120 4, 197 11" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function Marquee({ words }: { words: string[] }) {
  const run = (
    <span>
      {words.map((w) => (
        <Fragment key={w}>
          {w} <i />
        </Fragment>
      ))}
    </span>
  );
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {run}
        {run}
      </div>
    </div>
  );
}

export function SectionHead({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="section-head reveal">
      <div className="eyebrow">{eyebrow}</div>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}

export type Quote = { text: string; cite: string };

export function Quotes({ quotes, tinted = false }: { quotes: Quote[]; tinted?: boolean }) {
  return (
    <div className="quotes reveal">
      {quotes.map((q) => (
        <figure key={q.text} className="quote" style={{ margin: 0, ...(tinted ? { background: "var(--sage)" } : {}) }}>
          <p>&ldquo;{q.text}&rdquo;</p>
          <cite>{q.cite}</cite>
        </figure>
      ))}
    </div>
  );
}

export type Step = { title: string; body: string };

export function Steps({ steps, column = false }: { steps: Step[]; column?: boolean }) {
  return (
    <div className="steps reveal" style={column ? { gridTemplateColumns: "1fr" } : undefined}>
      {steps.map((s) => (
        <div key={s.title} className="step">
          <h3>{s.title}</h3>
          <p>{s.body}</p>
        </div>
      ))}
    </div>
  );
}

export function Checklist({ items, icon = "circle" }: { items: React.ReactNode[]; icon?: "circle" | "check" }) {
  return (
    <ul className="checklist">
      {items.map((item, i) => (
        <li key={i}>
          {icon === "circle" ? <CircleCheck /> : <Check />}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export type ListingData = {
  photo: number;
  alt: string;
  price: string;
  where: string;
  meta?: string;
  tags?: string[];
  src?: string;
};

export function Listing({ l, style }: { l: ListingData; style?: React.CSSProperties }) {
  return (
    <article className="listing" style={style}>
      <div className="photo">
        <Photo id={l.photo} width={600} alt={l.alt} />
        <span className="badge">
          <span className="dot" />
          Tenant verified
        </span>
      </div>
      <div className="body">
        <div className="price">
          {l.price} <span>/ month</span>
        </div>
        <div className="where">{l.where}</div>
        {l.meta && <div className="meta">{l.meta}</div>}
        {l.tags && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {l.tags.map((t) => (
              <span key={t} className="badge badge-green">
                {t}
              </span>
            ))}
          </div>
        )}
        {l.src && <div className="src">{l.src}</div>}
      </div>
    </article>
  );
}

// Sketchy Facebook post vs a verified Gable listing, on a dark section.
export function SpotTheScam({ title }: { title: string }) {
  return (
    <section className="section dark">
      <div className="wrap">
        <SectionHead eyebrow="Spot the difference" title={title} />
        <div className="versus">
          <div className="post reveal">
            <div className="post-head">
              <span className="avatar">J</span>
              <div>
                <b>Jess Rentals</b>
                <small>Columbia Housing (Sublets) · 2h</small>
              </div>
            </div>
            <p className="body">
              Beautiful 1BR near campus, $900/mo all utilities!! I&apos;m abroad right now so can&apos;t show it. Send the
              deposit by Zelle to hold <span className="flag-inline">Zelle, zero protection</span>
            </p>
            <div className="shot">
              <Photo id={6890400} alt="Glossy staged studio apartment photo" />
              <span className="flag a">Photo found on StreetEasy</span>
              <span className="flag b">&ldquo;Can&apos;t show it, I&apos;m abroad&rdquo;</span>
            </div>
          </div>
          <div className="vs-chip reveal">vs</div>
          <div className="good reveal">
            <div className="stamp" aria-hidden="true">
              <svg viewBox="0 0 100 100">
                <defs>
                  <path id="ring" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
                </defs>
                <circle cx="50" cy="50" r="49" fill="#FFFCF6" stroke="#CFE0C8" />
                <text fontSize="10.5" fontWeight="700" letterSpacing="2.2" fill="#1D5C37">
                  <textPath href="#ring">VERIFIED · TENANT CONFIRMED · </textPath>
                </text>
              </svg>
              <div className="core">
                <Check size={22} strokeWidth={2.6} />
              </div>
            </div>
            <Listing
              l={{
                photo: 8089268,
                alt: "Bedroom with a brick accent wall and a blue bedspread",
                price: "$1,550",
                where: "Private room in a 2BR, W 109th St",
                tags: ["Photos are theirs", "Lease allows sublet", "Pay through Gable"],
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// Final call to action on a darkened photo.
export function CtaPhoto({
  photo,
  title,
  body,
  button,
  fine,
  source,
  placeholder,
}: {
  photo: number;
  title: string;
  body: string;
  button: string;
  fine: string;
  source: string;
  placeholder?: string;
}) {
  return (
    <section className="cta cta-photo" id="join">
      <Photo id={photo} width={1600} />
      <div className="wrap reveal">
        <h2>{title}</h2>
        <p>{body}</p>
        <SignupForm source={source} button={button} placeholder={placeholder} />
        <p className="fine">{fine}</p>
      </div>
    </section>
  );
}
