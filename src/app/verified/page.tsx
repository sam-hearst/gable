import type { Metadata } from "next";
import { ChatHero } from "@/components/landing/ChatHero";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";
import {
  Checklist,
  CtaPhoto,
  Listing,
  Mark,
  Marquee,
  Quotes,
  SectionHead,
  SpotTheScam,
  Steps,
} from "@/components/landing/blocks";

// Landing page 1: current students who need a sublet and keep hitting scams.
export const metadata: Metadata = {
  title: "Gable: stop messaging scammers",
  description:
    "Every sublet on Gable comes from a verified student tenant, with photos checked and the address confirmed. Only message real people who reply.",
};

export default function VerifiedPage() {
  return (
    <>
      <SiteHeader current="none" />
      <main>
        <ChatHero
          source="verified"
          badge="For Columbia students looking for a sublet"
          title={
            <>
              Stop messaging <Mark>scammers.</Mark>
            </>
          }
          sub="Every sublet on Gable comes from a verified student tenant, with photos checked and the address confirmed. If it's on Gable, it's real, and the person on the other end replies."
          prompts={[
            "Spring semester sublet, Jan 5 to May 20, under $1,600",
            "Room for me and a friend near campus, Sept to Dec",
            "Summer room near the 1 train, lister who actually replies",
          ]}
          meta="Only verified tenants"
          chips={["Spring semester, Jan to May", "Room for two near campus", "Under $1,500, furnished", "Listers who reply within a day"]}
          collage={[
            { id: 31687845, badge: "Tenant verified", bold: "$1,550", text: "W 109th St" },
            { id: 545025, text: "Replies in ~3h" },
            { id: 7045991, badge: "Photos checked", bold: "$1,400", text: "Hamilton Hts" },
            { id: 2773484, text: "Address confirmed" },
          ]}
          strip={[
            { id: 31687845, badge: "Verified" },
            { id: 7045991, badge: "Verified" },
            { id: 545025, badge: "Replies fast" },
            { id: 2773484, badge: "Real address" },
          ]}
          modal={{
            title: "We're on it.",
            lead: "Gable is opening to Columbia students first. Leave your email and we'll send you verified matches for this search.",
            button: "Send me my matches",
          }}
        />

        <Marquee
          words={["Tenant confirmed", "Photos reverse-searched", "Address exists", "Lease allows sublet", "Listers who reply", "Exact dates"]}
        />

        <section className="section tint">
          <div className="wrap">
            <SectionHead eyebrow="The problem" title="Finding listings is easy. Finding real ones isn't.">
              We read hundreds of student posts and talked to Columbia students. The same thing came up again and again.
            </SectionHead>
            <Quotes
              quotes={[
                {
                  text: "the hardest part of subletting in nyc was never finding listings, it's figuring out which ones are real",
                  cite: "r/NYCapartments",
                },
                {
                  text: "I messaged probably like twenty people and half of them never answered. The other half I wasn't even sure were real.",
                  cite: "Columbia student we interviewed",
                },
                {
                  text: "half the photos are stolen from streeteasy and the person wants you to wire a deposit before you even see the place",
                  cite: "r/NYCapartments",
                },
              ]}
            />
          </div>
        </section>

        <SpotTheScam title="Can you spot the scam? We do it for you." />

        <section className="section">
          <div className="wrap">
            <div className="split reveal">
              <div>
                <div className="eyebrow">What &ldquo;verified&rdquo; means on Gable</div>
                <h2 style={{ fontSize: "clamp(26px,3.4vw,36px)", marginTop: 6 }}>Four checks before a listing reaches you.</h2>
                <Checklist
                  items={[
                    <>
                      <b>The lister is a student.</b> Joining Gable takes a school email, so you know who you&apos;re talking to.
                    </>,
                    <>
                      <b>They&apos;re the real tenant.</b> We confirm with the building or landlord that they live there and can
                      sublet.
                    </>,
                    <>
                      <b>The photos are theirs.</b> Every photo gets a reverse image search, and the address has to exist.
                    </>,
                    <>
                      <b>They actually reply.</b> Every listing shows how fast the lister usually answers. Ghosts drop off.
                    </>,
                  ]}
                />
              </div>
              <Listing
                style={{ background: "var(--sage)", maxWidth: 400, justifySelf: "center", width: "100%" }}
                l={{
                  photo: 6782426,
                  alt: "Bright studio apartment with a bed near a white kitchen",
                  price: "$1,550",
                  where: "Private room in a 2BR, W 109th St",
                  meta: "Jan 5 to May 20 · Furnished · 5 min to campus",
                  tags: ["Photos checked", "Lease allows sublet", "Replies in ~3h"],
                  src: "Listed by Alex, GSAS '26 · Example listing",
                }}
              />
            </div>
          </div>
        </section>

        <section className="section tint">
          <div className="wrap">
            <SectionHead eyebrow="How it works" title="Tell us once. Hear back from real people." />
            <Steps
              steps={[
                { title: "Describe what you need", body: "Dates, budget, roommates, how close to campus. One message, in your own words." },
                {
                  title: "Get verified matches",
                  body: "We pull from Facebook groups, Listings Project and Columbia housing, and only keep what passes our checks.",
                },
                {
                  title: "Message people who answer",
                  body: "Exact dates on every listing, and a reply time so you know who's worth messaging.",
                },
              ]}
            />
          </div>
        </section>

        <CtaPhoto
          photo={2773484}
          source="verified"
          title="Get early access to verified sublets."
          body="We're opening to Columbia students first. Leave your email and we'll send your first verified matches."
          button="Get early access"
          fine="No spam. One email when your matches are ready."
        />
      </main>
      <SiteFooter current="/verified" />
    </>
  );
}
