"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { px } from "@/components/landing/Photo";
import "./circles.css";

// DESIGN MOCKUP of Messages, sample data only (nothing is saved or sent):
// - Listing groups: one group chat per listing with everyone interested in
//   it and the lister, with the lister's FAQ pinned on top.
// - Direct messages: one-on-one, when you reach out to show interest.
// Every person shows how they're connected to you, and anyone can attach
// their LinkedIn or Instagram as a card so people can see who they are.

type Social = { kind: "linkedin" | "instagram"; handle: string; line: string };

type Person = {
  id: string;
  name: string;
  initial: string;
  school: string;
  role: string;
  path: string[];
  pathNote: string;
  vouches: { by: string; note: string }[];
  facts: string[];
  socials: Social[];
  color: string;
};

type Message =
  | { kind: "text"; from: string; text: string; time: string }
  | { kind: "profile"; from: string; social: Social; time: string }
  | { kind: "system"; text: string };

type Chat = {
  id: string;
  group: "Listing groups" | "Direct messages";
  title: string;
  sub: string;
  photo?: number; // listing photo for listing groups
  person?: string; // the other person, for direct messages
  last: string;
  unread?: number;
  pinned?: { title: string; facts: string[] };
  messages: Message[];
};

const PEOPLE: Record<string, Person> = {
  you: {
    id: "you", name: "You", initial: "M", school: "Columbia", role: "", path: [], pathNote: "", vouches: [], facts: [],
    socials: [{ kind: "linkedin", handle: "Michelle Mai", line: "Columbia Engineering · CharacterQuilt" }], color: "#2B7A4B",
  },
  daniel: {
    id: "daniel", name: "Daniel K.", initial: "D", school: "Columbia SEAS '27", role: "Lister · on the lease",
    path: ["You", "Priya S.", "Daniel K."], pathNote: "Priya is in your Lit Hum section and lived with Daniel last year.",
    vouches: [
      { by: "Priya S.", note: "Lived with him for a year. Honest, pays on time." },
      { by: "Jordan T.", note: "Sublet his room last summer. Exactly like the photos." },
    ],
    facts: ["Replies in ~2h (based on 14 chats)", "Showed up to 5 of 5 video tours", "No cancelled sublets"],
    socials: [
      { kind: "linkedin", handle: "Daniel Kim", line: "Columbia SEAS · Software intern at Stripe" },
      { kind: "instagram", handle: "@danielk.nyc", line: "1.2k followers · followed by priya.s and 2 others" },
    ],
    color: "#C4622D",
  },
  amara: {
    id: "amara", name: "Amara O.", initial: "A", school: "Barnard '26", role: "Interested",
    path: ["You", "Amara O."], pathNote: "You're both in SHPE.",
    vouches: [{ by: "Lena W.", note: "Great roommate, very clear about the lease." }],
    facts: ["Moving in Jun 1", "Looking for one roommate"],
    socials: [{ kind: "linkedin", handle: "Amara Okafor", line: "Barnard · Incoming analyst at Goldman Sachs" }],
    color: "#1D5C37",
  },
  jordan: {
    id: "jordan", name: "Jordan T.", initial: "J", school: "Columbia CC '26", role: "Sublet this room Summer '26",
    path: ["You", "Jordan T."], pathNote: "You both listed Columbia Startup Studio.",
    vouches: [], facts: ["Past subletter, verified by Gable"], socials: [], color: "#5A6A60",
  },
  maya: {
    id: "maya", name: "Maya L.", initial: "M", school: "Columbia CC '27", role: "Searching with you",
    path: ["You", "Maya L."], pathNote: "Friends on Gable · same floor in Carman, Fall '24.",
    vouches: [], facts: ["Budget up to $1,600", "Moving in Sep 1"],
    socials: [{ kind: "instagram", handle: "@maya.lin", line: "followed by you" }], color: "#F2A65A",
  },
};

const CHATS: Chat[] = [
  {
    id: "w118",
    group: "Listing groups",
    title: "$1,250 · Private room, Harlem",
    sub: "W 118th & Frederick Douglass · Jun 1 – Aug 31",
    photo: 8089268,
    last: "Daniel: Yes, utilities are included.",
    unread: 3,
    pinned: {
      title: "From Daniel, the lister",
      facts: ["Still available", "Utilities included", "Lease on file", "Video tours Tue/Thu evenings"],
    },
    messages: [
      { kind: "system", text: "12 people are interested in this place. Daniel, the lister, is here and answers questions for everyone." },
      { kind: "text", from: "amara", time: "10:12 AM", text: "Are utilities included in the $1,250?" },
      { kind: "text", from: "daniel", time: "10:20 AM", text: "Yes, utilities are included. Wifi too." },
      { kind: "text", from: "jordan", time: "10:34 AM", text: "I sublet this room last summer. The photos are accurate and Daniel was easy to work with." },
      { kind: "text", from: "amara", time: "10:41 AM", text: "Is anyone looking to share? I'd want a roommate for the 2nd room." },
    ],
  },
  {
    id: "barnard",
    group: "Listing groups",
    title: "$1,450 · Room near Barnard",
    sub: "Claremont Ave & W 120th · Jun 1 – Aug 15",
    photo: 33693815,
    last: "Lena: Is the room still free for June?",
    messages: [
      { kind: "system", text: "5 people are interested in this place." },
      { kind: "text", from: "amara", time: "Yesterday", text: "Is the room still free for June?" },
    ],
  },
  {
    id: "dm-daniel",
    group: "Direct messages",
    title: "Daniel K.",
    sub: "About: $1,250 · Private room, Harlem",
    person: "daniel",
    last: "You: Thanks! Could we do a video tour Thursday?",
    messages: [
      { kind: "system", text: "You showed interest in Daniel's room. Keep money on Gable: never pay by Zelle or Venmo." },
      { kind: "text", from: "you", time: "11:02 AM", text: "Hi Daniel! I'm interested in your room for the summer. A bit about me:" },
      { kind: "profile", from: "you", time: "11:02 AM", social: PEOPLE.you.socials[0] },
      { kind: "text", from: "daniel", time: "11:30 AM", text: "Nice to meet you! Here's mine so you know who you're talking to." },
      { kind: "profile", from: "daniel", time: "11:30 AM", social: PEOPLE.daniel.socials[0] },
      { kind: "text", from: "you", time: "11:41 AM", text: "Thanks! Could we do a video tour Thursday?" },
    ],
  },
  {
    id: "dm-maya",
    group: "Direct messages",
    title: "Maya L.",
    sub: "Searching for a 2BR together",
    person: "maya",
    last: "Maya: I saved two more on Morningside Ave",
    messages: [{ kind: "text", from: "maya", time: "Yesterday", text: "I saved two more on Morningside Ave. Both under $1,600 each." }],
  },
];

function Avatar({ p, size = 32 }: { p: Person; size?: number }) {
  return (
    <span className="cm-avatar" style={{ width: size, height: size, background: p.color, fontSize: size * 0.42 }} aria-hidden="true">
      {p.initial}
    </span>
  );
}

function TrustChip({ p, onOpen }: { p: Person; onOpen: () => void }) {
  if (p.id === "you") return null;
  return (
    <button type="button" className="cm-trust" onClick={onOpen} title="See why you can trust them">
      <span className="cm-trust-dot" aria-hidden="true" />
      {p.path.length === 2 ? "Direct connection" : `Via ${p.path[1]}`} · {p.role}
    </button>
  );
}

// A LinkedIn or Instagram card attached in a chat.
function SocialCard({ s }: { s: Social }) {
  return (
    <div className={`cm-social is-${s.kind}`}>
      <span className="cm-social-logo" aria-hidden="true">
        {s.kind === "linkedin" ? "in" : "IG"}
      </span>
      <span className="cm-social-text">
        <b>{s.handle}</b>
        <span>{s.line}</span>
        <small>{s.kind === "linkedin" ? "LinkedIn" : "Instagram"} · linked by its owner</small>
      </span>
    </div>
  );
}

export function MessagesMock() {
  const asked = useSearchParams().get("chat");
  const [chatId, setChatId] = useState(CHATS.some((c) => c.id === asked) ? (asked as string) : CHATS[0].id);
  const chat = CHATS.find((c) => c.id === chatId)!;
  const [personId, setPersonId] = useState<string | null>(chat.person ?? "daniel");
  const [attachOpen, setAttachOpen] = useState(false);
  const person = personId ? PEOPLE[personId] : null;
  const groups = ["Listing groups", "Direct messages"] as const;

  function open(c: Chat) {
    setChatId(c.id);
    setPersonId(c.person ?? "daniel");
    setAttachOpen(false);
  }

  return (
    <div className="cm">
      {/* 1. Chats */}
      <aside className="cm-list" aria-label="Your chats">
        <div className="cm-list-head">
          <h1>Messages</h1>
          <p>A group for each place you&apos;re interested in, and one-on-one chats with listers.</p>
        </div>
        {groups.map((g) => (
          <section key={g}>
            <h2 className="cm-group">{g}</h2>
            {CHATS.filter((c) => c.group === g).map((c) => {
              const other = c.person ? PEOPLE[c.person] : null;
              return (
                <button key={c.id} type="button" className="cm-row cm-row-media" aria-current={c.id === chatId ? "true" : undefined} onClick={() => open(c)}>
                  {c.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="cm-thumb" src={px(c.photo, 160)} alt="" />
                  ) : other ? (
                    <Avatar p={other} size={44} />
                  ) : null}
                  <span className="cm-row-text">
                    <span className="cm-row-top">
                      <span className="cm-row-name">{c.title}</span>
                      {c.unread ? <span className="cm-badge">{c.unread}</span> : null}
                    </span>
                    <span className="cm-row-last">{c.last}</span>
                  </span>
                </button>
              );
            })}
          </section>
        ))}
      </aside>

      {/* 2. The conversation */}
      <section className="cm-chat" aria-label={chat.title}>
        <header className="cm-chat-head">
          <div>
            <h2>{chat.title}</h2>
            <p>{chat.sub}</p>
          </div>
          {chat.group === "Listing groups" ? (
            <Link className="cm-closes" href="/listing/w118-fdb">
              View listing
            </Link>
          ) : (
            <span className="cm-closes">Private</span>
          )}
        </header>

        {chat.pinned && (
          <div className="cm-pinned">
            <span className="cm-pinned-title">{chat.pinned.title}</span>
            <ul>
              {chat.pinned.facts.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="cm-thread">
          {chat.messages.map((m, i) => {
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
                  {m.kind === "profile" ? <SocialCard s={m.social} /> : <p className="cm-bubble">{m.text}</p>}
                  <span className="cm-time">{m.time}</span>
                </div>
              </div>
            );
          })}
        </div>

        <form className="cm-composer" onSubmit={(e) => e.preventDefault()}>
          {attachOpen && (
            <div className="cm-attach-menu" role="menu">
              <button type="button" role="menuitem">
                <span className="cm-social-logo is-linkedin" aria-hidden="true">in</span>
                Attach your LinkedIn
              </button>
              <button type="button" role="menuitem">
                <span className="cm-social-logo is-instagram" aria-hidden="true">IG</span>
                Attach your Instagram
              </button>
              <button type="button" role="menuitem">Share a listing</button>
            </div>
          )}
          <div className="cm-input">
            <button type="button" className="cm-attach" aria-label="Attach" aria-expanded={attachOpen} onClick={() => setAttachOpen((o) => !o)}>
              +
            </button>
            <input placeholder={chat.group === "Listing groups" ? "Ask the group or the lister…" : `Message ${chat.title.split(" ")[0]}…`} aria-label="Message" />
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
                {person.role && <span className="cm-role">{person.role}</span>}
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

            {person.socials.length > 0 && (
              <>
                <h4>Linked profiles</h4>
                <div className="cm-socials">
                  {person.socials.map((s) => (
                    <SocialCard key={s.kind} s={s} />
                  ))}
                </div>
              </>
            )}

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

            {person.id !== "you" && chat.person !== person.id && (
              <div className="cm-person-actions">
                <button type="button" className="cm-primary">Message {person.name.split(" ")[0]} directly</button>
                {person.path.length > 2 && <button type="button" className="cm-secondary">Ask {person.path[1].split(" ")[0]} to introduce you</button>}
              </div>
            )}
          </>
        ) : null}
      </aside>
    </div>
  );
}
