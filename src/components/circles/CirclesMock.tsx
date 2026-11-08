"use client";

import { useState } from "react";
import "./circles.css";

// DESIGN MOCKUP of Circles: small, structured group chats built around a real
// thing (a building, a move-in window, a search with a friend) that close when
// they're no longer useful. Every person shows WHY you can trust them (their
// Trust Path to you, their role, vouches). Sample data only: nothing is saved
// or sent.

type Person = {
  id: string;
  name: string;
  initial: string;
  school: string;
  role: string; // their tie to this circle, e.g. "Lives here since Jan '26"
  path: string[]; // the Trust Path from you to them
  pathNote: string;
  vouches: { by: string; note: string }[];
  facts: string[]; // follow-through, shown as plain facts
  color: string;
};

type Message =
  | { kind: "text"; from: string; text: string; time: string }
  | { kind: "question"; from: string; text: string; time: string; answers: { from: string; text: string; helpful: number }[] }
  | { kind: "system"; text: string };

type Circle = {
  id: string;
  group: "Buildings" | "Move-in windows" | "Searching together";
  name: string;
  who: string; // who can join
  members: number;
  closes: string;
  last: string;
  unread?: number;
  pinned?: { title: string; facts: string[] };
  messages: Message[];
};

const PEOPLE: Record<string, Person> = {
  you: { id: "you", name: "You", initial: "M", school: "Columbia", role: "Looking for a summer sublet", path: [], pathNote: "", vouches: [], facts: [], color: "#2B7A4B" },
  daniel: {
    id: "daniel", name: "Daniel K.", initial: "D", school: "Columbia SEAS '27", role: "Lives here since Jan '26",
    path: ["You", "Priya S.", "Daniel K."], pathNote: "Priya is in your Lit Hum section and lived with Daniel last year.",
    vouches: [
      { by: "Priya S.", note: "Lived with him for a year. Honest, pays on time." },
      { by: "Jordan T.", note: "Sublet his room last summer. Exactly like the photos." },
    ],
    facts: ["Replies in ~2h (based on 14 chats)", "Showed up to 5 of 5 video tours", "No cancelled sublets"],
    color: "#C4622D",
  },
  amara: {
    id: "amara", name: "Amara O.", initial: "A", school: "Barnard '26", role: "Lives here since Sep '25",
    path: ["You", "Amara O."], pathNote: "You're both in SHPE.",
    vouches: [{ by: "Lena W.", note: "Great roommate, very clear about the lease." }],
    facts: ["Replies in ~4h (based on 6 chats)", "Lease on file"],
    color: "#1D5C37",
  },
  kenji: {
    id: "kenji", name: "Kenji R.", initial: "K", school: "Columbia GSAS", role: "Moved out Aug '26 · lived here 2 years",
    path: ["You", "Sam H.", "Kenji R."], pathNote: "Sam is on your Startup Studio team.",
    vouches: [], facts: ["Former resident, verified by lease"], color: "#5A6A60",
  },
  maya: {
    id: "maya", name: "Maya L.", initial: "M", school: "Columbia CC '27", role: "Your search partner",
    path: ["You", "Maya L."], pathNote: "Friends on Gable · same floor in Carman, Fall '24.",
    vouches: [], facts: ["Budget up to $1,600", "Moving in Sep 1"], color: "#F2A65A",
  },
};

const CIRCLES: Circle[] = [
  {
    id: "535",
    group: "Buildings",
    name: "535 W 112th St",
    who: "Verified residents, past residents and people with a saved place here",
    members: 9,
    closes: "Open while you have a saved place here",
    last: "Daniel: Super usually replies same day.",
    unread: 2,
    pinned: {
      title: "What we know about this building",
      facts: ["0 open HPD violations", "Super replies in ~1 day (from 7 residents)", "Laundry in the basement", "2 sublets checked by Gable this year"],
    },
    messages: [
      { kind: "system", text: "You joined because you saved a place here. Residents see your Trust Path too." },
      {
        kind: "question", from: "you", time: "2:14 PM", text: "How loud is it at night? The room I saved faces Broadway.",
        answers: [
          { from: "daniel", text: "Broadway side gets bus noise until ~11pm. Windows are double-paned, so it's fine with them shut.", helpful: 6 },
          { from: "kenji", text: "Lived on the Broadway side 2 years. Earplugs for the first week, then you stop noticing.", helpful: 4 },
        ],
      },
      { kind: "text", from: "amara", time: "2:31 PM", text: "Heads up: the elevator is out for maintenance June 3 to 5, if you're moving in then." },
      { kind: "text", from: "daniel", time: "2:40 PM", text: "Super usually replies same day. His number is on the board in the lobby." },
    ],
  },
  {
    id: "summer27",
    group: "Move-in windows",
    name: "Summer '27 near Columbia",
    who: "Columbia and Barnard students moving in June to August",
    members: 48,
    closes: "Closes Sep 1",
    last: "Amara: Anyone want to split a 2BR on 109th?",
    messages: [
      { kind: "system", text: "Everyone here is moving in between June and August 2027." },
      { kind: "text", from: "amara", time: "11:02 AM", text: "Anyone want to split a 2BR on 109th? $1,450 each, June 1 to Aug 15." },
      { kind: "text", from: "maya", time: "11:20 AM", text: "Interested! I start an internship in Midtown June 2." },
    ],
  },
  {
    id: "maya",
    group: "Searching together",
    name: "You + Maya: 2BR for Sept",
    who: "Just the two of you",
    members: 2,
    closes: "Closes when you sign",
    last: "Maya: I saved two more on Morningside Ave",
    messages: [
      { kind: "system", text: "A shared search: places either of you saves show up here for both." },
      { kind: "text", from: "maya", time: "Yesterday", text: "I saved two more on Morningside Ave. Both under $1,600 each." },
    ],
  },
];

function Avatar({ p, size = 32 }: { p: Person; size?: number }) {
  return (
    <span className="cm-avatar" style={{ width: size, height: size, background: p.color, fontSize: size * 0.42 }} aria-hidden="true">
      {p.initial}
    </span>
  );
}

// "Why you can trust them" in one line, shown on every message.
function TrustChip({ p, onOpen }: { p: Person; onOpen: () => void }) {
  if (p.id === "you") return null;
  const hops = p.path.length - 1;
  return (
    <button type="button" className="cm-trust" onClick={onOpen} title="See why you can trust them">
      <span className="cm-trust-dot" aria-hidden="true" />
      {hops === 1 ? "Direct connection" : `Via ${p.path[1]}`} · {p.role}
    </button>
  );
}

export function CirclesMock() {
  const [circleId, setCircleId] = useState(CIRCLES[0].id);
  const [personId, setPersonId] = useState<string | null>("daniel");
  const [helpful, setHelpful] = useState<Record<string, boolean>>({});
  const circle = CIRCLES.find((c) => c.id === circleId)!;
  const person = personId ? PEOPLE[personId] : null;
  const groups = ["Buildings", "Move-in windows", "Searching together"] as const;

  return (
    <div className="cm">
      {/* 1. Your circles */}
      <aside className="cm-list" aria-label="Your circles">
        <div className="cm-list-head">
          <h1>Circles</h1>
          <p>Small groups around a real place or plan. They close when you&apos;re done.</p>
        </div>
        {groups.map((g) => (
          <section key={g}>
            <h2 className="cm-group">{g}</h2>
            {CIRCLES.filter((c) => c.group === g).map((c) => (
              <button
                key={c.id}
                type="button"
                className="cm-row"
                aria-current={c.id === circleId ? "true" : undefined}
                onClick={() => setCircleId(c.id)}
              >
                <span className="cm-row-top">
                  <span className="cm-row-name">{c.name}</span>
                  {c.unread ? <span className="cm-badge">{c.unread}</span> : null}
                </span>
                <span className="cm-row-last">{c.last}</span>
                <span className="cm-row-meta">
                  {c.members} people · {c.closes}
                </span>
              </button>
            ))}
          </section>
        ))}
        <button type="button" className="cm-new">+ Start a circle</button>
      </aside>

      {/* 2. The conversation */}
      <section className="cm-chat" aria-label={circle.name}>
        <header className="cm-chat-head">
          <div>
            <h2>{circle.name}</h2>
            <p>{circle.who}</p>
          </div>
          <span className="cm-closes">{circle.closes}</span>
        </header>

        {circle.pinned && (
          <div className="cm-pinned">
            <span className="cm-pinned-title">{circle.pinned.title}</span>
            <ul>
              {circle.pinned.facts.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="cm-thread">
          {circle.messages.map((m, i) => {
            if (m.kind === "system") return <p key={i} className="cm-system">{m.text}</p>;
            const from = PEOPLE[m.from];
            const mine = m.from === "you";
            return (
              <div key={i} className={`cm-msg${mine ? " is-mine" : ""}`}>
                {!mine && (
                  <button type="button" className="cm-avatar-btn" onClick={() => setPersonId(from.id)} aria-label={`About ${from.name}`}>
                    <Avatar p={from} />
                  </button>
                )}
                <div className="cm-msg-body">
                  {!mine && (
                    <div className="cm-msg-who">
                      <button type="button" className="cm-name" onClick={() => setPersonId(from.id)}>
                        {from.name}
                      </button>
                      <TrustChip p={from} onOpen={() => setPersonId(from.id)} />
                    </div>
                  )}
                  {m.kind === "question" ? (
                    <div className="cm-question">
                      <span className="cm-q-label">Question for residents</span>
                      <p>{m.text}</p>
                      <div className="cm-answers">
                        {m.answers.map((a, j) => {
                          const by = PEOPLE[a.from];
                          const key = `${i}-${j}`;
                          return (
                            <div key={j} className="cm-answer">
                              <div className="cm-msg-who">
                                <button type="button" className="cm-name" onClick={() => setPersonId(by.id)}>
                                  {by.name}
                                </button>
                                <TrustChip p={by} onOpen={() => setPersonId(by.id)} />
                              </div>
                              <p>{a.text}</p>
                              <button
                                type="button"
                                className="cm-helpful"
                                aria-pressed={Boolean(helpful[key])}
                                onClick={() => setHelpful((h) => ({ ...h, [key]: !h[key] }))}
                              >
                                Helpful · {a.helpful + (helpful[key] ? 1 : 0)}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="cm-bubble">{m.text}</p>
                  )}
                  <span className="cm-time">{m.time}</span>
                </div>
              </div>
            );
          })}
        </div>

        <form className="cm-composer" onSubmit={(e) => e.preventDefault()}>
          <div className="cm-chips">
            {circle.group === "Buildings" ? (
              <>
                <button type="button">Ask residents</button>
                <button type="button">Share a heads-up</button>
              </>
            ) : (
              <>
                <button type="button">Find a roommate</button>
                <button type="button">Share a place</button>
              </>
            )}
          </div>
          <div className="cm-input">
            <input placeholder={circle.group === "Buildings" ? "Ask the building…" : "Message the circle…"} aria-label="Message" />
            <button type="submit" aria-label="Send">↑</button>
          </div>
        </form>
      </section>

      {/* 3. Why you can trust them */}
      <aside className="cm-person" aria-label="About this person">
        {person ? (
          <>
            <div className="cm-person-head">
              <Avatar p={person} size={56} />
              <div>
                <h3>{person.name}</h3>
                <p>{person.school}</p>
                <span className="cm-role">{person.role}</span>
              </div>
            </div>

            <h4>How you&apos;re connected</h4>
            <ol className="cm-path">
              {person.path.map((n, i) => (
                <li key={n}>
                  <span className={`cm-path-node${i === 0 ? " is-you" : i === person.path.length - 1 ? " is-them" : ""}`}>{n}</span>
                </li>
              ))}
            </ol>
            <p className="cm-path-note">{person.pathNote}</p>

            <h4>Vouched for by</h4>
            {person.vouches.length ? (
              <ul className="cm-vouches">
                {person.vouches.map((v) => (
                  <li key={v.by}>
                    <b>{v.by}</b>
                    <span>&ldquo;{v.note}&rdquo;</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="cm-empty">No vouches yet. That&apos;s shown honestly, not hidden.</p>
            )}

            <h4>Track record</h4>
            <ul className="cm-facts">
              {person.facts.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>

            <div className="cm-person-actions">
              <button type="button" className="cm-primary">Message {person.name.split(" ")[0]}</button>
              {person.path.length > 2 && <button type="button" className="cm-secondary">Ask {person.path[1].split(" ")[0]} to introduce you</button>}
            </div>
          </>
        ) : (
          <p className="cm-empty">Tap anyone to see how you&apos;re connected.</p>
        )}
      </aside>
    </div>
  );
}
