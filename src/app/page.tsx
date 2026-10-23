import type { Metadata } from "next";
import Link from "next/link";
import { ChatHero } from "@/components/landing/ChatHero";
import { CircleCheck } from "@/components/landing/icons";
import { Photo } from "@/components/landing/Photo";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";
import { CtaPhoto, Listing, Mark, Marquee, SectionHead, SpotTheScam } from "@/components/landing/blocks";
import { isDemo, searchHref } from "@/lib/mode";

export const metadata: Metadata = {
  title: "Gable: real sublets near Columbia, through one chat",
  description:
    "Tell Gable what you need and get sublets near Columbia where every listing is checked and every lister is a verified tenant.",
};

// Gable is sublets only for now. On the demo site each category runs a search;
// on the waitlist site it opens the matching landing page.
const CATEGORIES = [
  { q: "Summer sublet near Columbia, June to August", page: "/summer", tone: "cat-green", kicker: "10 to 12 weeks", title: "Summer sublets", photos: [20053927, 31687845, 33693815] },
  { q: "Semester sublet near campus, January to May", page: "/verified", tone: "cat-deep", kicker: "Jan to May", title: "Semester sublets", photos: [545025, 7045991, 8089268] },
  { q: "Furnished sublet near Columbia", page: "/verified", tone: "cat-sun", kicker: "Move-in ready", title: "Furnished sublets", photos: [6890400, 6447384, 6969990] },
  { q: "Sublet for two friends near campus", page: "/verified", tone: "cat-ink", kicker: "Bring a friend", title: "Sublets for two", photos: [7045991, 6890400, 6782426] },
  { q: "Sublet near Columbia that allows pets", page: "#join", tone: "cat-warm", kicker: "Dogs and cats", title: "Pet-friendly sublets", photos: [545025, 39982785, 5390049] },
].map(({ q, page, ...c }) => ({ ...c, href: isDemo ? searchHref(q) : page }));

const DOORS = [
  {
    href: isDemo ? searchHref("Semester sublet near campus, lister who replies") : "/verified",
    photo: 2773484,
    alt: "New York apartment buildings with fire escapes",
    title: "Already at Columbia?",
    body: "Need a semester or summer sublet and tired of messaging people who don't reply, or aren't real.",
    go: "Only real listings",
  },
  {
    href: isDemo ? searchHref("Summer sublet near Columbia for my internship, June to August") : "/summer",
    photo: 7647755,
    alt: "Two people carrying moving boxes and a plant into a new home",
    title: "Coming to NYC for the summer?",
    body: "Internship or a new program, and you can't fly in to see places first.",
    go: "Checked before you pay",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader current="home" showVerify />
      <main>
        <ChatHero
          source="home"
          announce={!isDemo}
          searchOnSend={isDemo}
          title={
            <>
              Find a <Mark>real</Mark> place near Columbia through one chat.
            </>
          }
          sub="Tell Gable what you need. We pull sublets from everywhere students look, and only show you the ones we've checked."
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
          collage={[
            { id: 33693815, badge: "Tenant verified", bold: "$1,650", text: "W 112th St" },
            { id: 6969990, text: "Replies in ~2h" },
            { id: 8089268, badge: "Photos checked", bold: "$1,500", text: "Amsterdam Ave" },
            { id: 39982785, text: "Pets OK" },
          ]}
          strip={[
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

        <Marquee
          words={[
            "Morningside Heights",
            "Manhattan Valley",
            "Hamilton Heights",
            "Upper West Side",
            "Harlem",
            "Manhattanville",
            "Washington Heights",
          ]}
        />

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

        <section className="section tint">
          <div className="wrap">
            <SectionHead eyebrow="Refine any search" title="Ask like you'd ask a friend who knows housing.">
              Change dates, budget or who&apos;s moving in, and Gable updates the list. Every result shows where it came from
              and what we checked.
            </SectionHead>
            <div className="demo">
              <div className="thread reveal" aria-label="Example conversation">
                <div className="msg me">Need a summer sublet near Columbia, June 1 to Aug 15, under $1,800</div>
                <div className="msg gable">
                  Found <b>14 listings</b> across Facebook groups, Listings Project and Columbia housing.{" "}
                  <b>6 passed our checks.</b> Here are the best 3.
                </div>
                <div className="msg me">Only ones with a lister who actually replies</div>
                <div className="msg gable">
                  Done. These 3 tenants usually reply <b>within 4 hours.</b>
                </div>
              </div>
              <div className="listings reveal">
                <Listing
                  l={{
                    photo: 33693815,
                    alt: "Sunlit bedroom with white curtains and plants on the windowsill",
                    price: "$1,650",
                    where: "Sublet · private room, W 112th St",
                    meta: "Jun 1 to Aug 15 · Furnished · 6 min to campus",
                    src: "Found in a Columbia Facebook group · Photos checked · Replies in ~2h",
                  }}
                />
                <Listing
                  l={{
                    photo: 6969990,
                    alt: "Apartment with a brick wall, orange sofa and wooden dining table",
                    price: "$1,500",
                    where: "Sublet · room in a 3BR, Amsterdam Ave",
                    meta: "May 28 to Aug 20 · 2 grad roommates",
                    src: "Found on Listings Project · Lease allows sublet · Replies in ~4h",
                  }}
                />
                <Listing
                  l={{
                    photo: 6782426,
                    alt: "Bright studio apartment with a bed near a white kitchen",
                    price: "$1,780",
                    where: "Sublet · studio, Morningside Dr",
                    meta: "Jun 1 to Aug 31 · Laundry in building",
                    src: "Listed on Gable by a Columbia student · Checked in person",
                  }}
                />
              </div>
            </div>
            <p className="fine" style={{ marginTop: 16 }}>
              {isDemo
                ? "Example search. Listings shown are illustrations."
                : "Example search. Listings shown are illustrations while we're in early access."}
            </p>
          </div>
        </section>

        <SpotTheScam title="The hard part was never finding listings. It's knowing which ones are real." />

        <section className="section">
          <div className="wrap">
            <SectionHead eyebrow="How we check" title="Every listing earns its badge before you see it.">
              Three checks, done by people, on every place. Here&apos;s what that looks like.
            </SectionHead>
            <div className="bento">
              <div className="tile photo span-4 row-2 reveal">
                <Photo id={2773484} width={1200} alt="New York apartment buildings with fire escapes" />
                <div>
                  <div className="k">Check 1</div>
                  <h3 style={{ fontSize: "clamp(24px,2.6vw,34px)", maxWidth: "16ch", marginTop: 8 }}>
                    We confirm the tenant with the building.
                  </h3>
                  <p>Before a listing goes up, we check that the lister actually lives there and is allowed to sublet.</p>
                </div>
                <div style={{ maxWidth: 360 }}>
                  {["Tenant is on the lease", "Lease allows subletting", "Address exists"].map((t) => (
                    <div key={t} className="check-row">
                      <CircleCheck size={16} strokeWidth={2.6} />
                      {t}
                      <span className="t">Confirmed</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="tile green span-2 reveal">
                <div className="k">From our interviews</div>
                <div>
                  <div className="big">4 of 5</div>
                  <p>students we talked to brought up scams or fake listings on their own.</p>
                </div>
              </div>
              <div className="tile dark span-2 reveal">
                <div>
                  <div className="k">Check 3</div>
                  <h3 style={{ marginTop: 8 }}>Listers who actually reply</h3>
                </div>
                <div className="reply-ui" aria-label="Example reply times">
                  {[
                    ["M", "Maya, W 112th", "~1h"],
                    ["D", "Daniel, Amsterdam", "~3h"],
                    ["L", "Lena, 109th", "~5h"],
                  ].map(([av, who, t]) => (
                    <div key={who} className="row">
                      <span className="av">{av}</span>
                      <b>{who}</b>
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="tile sun span-3 reveal">
                <div className="k">From Reddit</div>
                <div>
                  <div className="big">95%</div>
                  <p>
                    of Facebook group housing posts are scams, one student on r/nyu guessed. Every sublet on Gable is checked
                    before you see it.
                  </p>
                </div>
              </div>
              <div className="tile photo span-3 reveal" style={{ minHeight: 260 }}>
                <Photo id={545025} width={900} alt="Bed with patterned pillows and glasses on a book" />
                <div className="k">Check 2</div>
                <div>
                  <h3>Every photo gets a reverse image search.</h3>
                  <p>Stolen StreetEasy photos don&apos;t make it in.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section tint">
          <div className="wrap">
            <SectionHead eyebrow="Start here" title="Which one are you?" />
            <div className="doors reveal">
              {DOORS.map((d) => (
                <Link key={d.href} className="door" href={d.href}>
                  <Photo id={d.photo} alt={d.alt} />
                  <div className="door-body">
                    <h3>{d.title}</h3>
                    <p>{d.body}</p>
                    <span className="go">{d.go} &rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {isDemo ? (
          <CtaPhoto
            photo={30775151}
            source="home"
            title="Find your sublet."
            body="Tell Gable your dates and budget, and see the sublets that fit, with what we checked about each one."
            button="Start a search"
            href="/search"
          />
        ) : (
          <CtaPhoto
            photo={30775151}
            source="home"
            title="Be first in when Gable opens."
            body="We're opening to Columbia students first. Leave your email and we'll send your first verified sublets."
            button="Get early access"
            fine="No spam. One email when your matches are ready."
          />
        )}
      </main>
      <SiteFooter current="/" />
    </>
  );
}
