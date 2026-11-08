import Link from "next/link";
import { searchHref, showSamples } from "@/lib/mode";
import { ChatHero } from "./ChatHero";
import { Photo } from "./Photo";
import { Mark, SectionHead } from "./blocks";

// The homepage's top two sections, shared with /explore so signing in doesn't
// change what you see: the chat hero, then "What are you looking for?".

// Gable is sublets only for now. Each category runs a search.
const CATEGORIES = [
  { q: "Summer sublet near Columbia, June to August", page: "/summer", tone: "cat-green", kicker: "10 to 12 weeks", title: "Summer sublets", photos: [20053927, 31687845, 33693815] },
  { q: "Semester sublet near campus, January to May", page: "/verified", tone: "cat-deep", kicker: "Jan to May", title: "Semester sublets", photos: [545025, 7045991, 8089268] },
  { q: "Furnished sublet near Columbia", page: "/verified", tone: "cat-sun", kicker: "Move-in ready", title: "Furnished sublets", photos: [6890400, 6447384, 6969990] },
  { q: "Sublet for two friends near campus", page: "/together", tone: "cat-ink", kicker: "Bring a friend", title: "Sublets for two", photos: [7045991, 6890400, 6782426] },
  { q: "Sublet near Columbia that allows pets", page: "#join", tone: "cat-warm", kicker: "Dogs and cats", title: "Pet-friendly sublets", photos: [545025, 39982785, 5390049] },
].map(({ q, ...c }) => ({ ...c, href: searchHref(q) }));

export function HomeHero({ source = "home" }: { source?: string }) {
  return (
    <ChatHero
      source={source}
      announce={false}
      searchOnSend
      title={
        <>
          Tell us the place you{" "}
          <span style={{ whiteSpace: "nowrap" }}>
            <Mark>want</Mark>.
          </span>
        </>
      }
      sub="We'll find the few places that fit, and tell you which ones are real."
      prompts={[
        "Summer sublet near campus, June 1 to Aug 15, under $1,800",
        "Furnished sublet for the spring semester, Jan to May",
        "A sublet I can lock in before I fly in for my internship",
      ]}
      meta="Verified sublets only"
      chips={[
        "Summer sublet near Columbia under $1,800",
        "Sublet for two, Sept to Dec",
        "Furnished sublet, 3 months, starts June 1",
        "Sublet that allows dogs",
        "Quiet sublet near the 1 train",
      ]}
      // The floating cards carry made-up prices and checks: staging only.
      collage={!showSamples ? [] : [
        { id: 33693815, badge: "Tenant verified", bold: "$1,650", text: "W 112th St" },
        { id: 6969990, text: "Replies in ~2h" },
        { id: 8089268, badge: "Photos checked", bold: "$1,500", text: "Amsterdam Ave" },
        { id: 39982785, text: "Pets OK" },
      ]}
      strip={!showSamples ? [] : [
        { id: 33693815, badge: "Verified" },
        { id: 8089268, badge: "Verified" },
        { id: 6969990, badge: "Verified" },
        { id: 39982785, badge: "Pets OK" },
        { id: 6782426, badge: "Verified" },
      ]}
      modal={{
        title: "We're on it.",
        lead: "Gable is opening to Columbia students first. Leave your email and we'll send you verified matches for this search.",
        button: "Send me my matches",
      }}
    />
  );
}

export function BrowseSection() {
  return (
    <section className="section">
      <div className="wrap">
        <SectionHead eyebrow="Browse" title="What are you looking for?" />
        <div className="rail reveal">
          {CATEGORIES.map((c) => (
            <Link key={c.title} className={`cat ${c.tone}`} href={c.href}>
              <div>
                <div className="cat-kicker">{c.kicker}</div>
                <h3>{c.title}</h3>
              </div>
              <div className="fan" aria-hidden="true">
                {c.photos.map((id) => (
                  <Photo key={id} id={id} width={300} />
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
