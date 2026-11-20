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
    "Every lister on Gable is a student we check by hand: a school email, proof they're on the lease, and photos that hold up. Opening to Columbia students first.",
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
          sub="Every lister on Gable signs in with a school email and shows us they're on the lease, and a person on our team looks at the photos and address before a room goes up. We're opening to Columbia students first."
          prompts={[
            "Spring semester sublet, Jan 5 to May 20, under $1,600",
            "Sublet for me and a friend near campus, Sept to Dec",
            "Summer sublet near the 1 train, June to August",
          ]}
          meta="Only checked listers"
          chips={["Spring semester, Jan to May", "Sublet for two near campus", "Under $1,500, furnished", "Furnished, near the 1 train"]}
          collage={[
            { id: 31687845, badge: "Columbia student", bold: "$1,550", text: "W 109th St" },
            { id: 545025, text: "Proof of lease" },
            { id: 7045991, badge: "Photos checked", bold: "$1,400", text: "Hamilton Hts" },
            { id: 2773484, text: "School email checked" },
          ]}
          strip={[
            { id: 31687845, badge: "Checked" },
            { id: 7045991, badge: "Columbia student" },
            { id: 545025, badge: "On the lease" },
            { id: 2773484, badge: "Photos checked" },
          ]}
          modal={{
            title: "We're on it.",
            lead: "Gable is opening to Columbia students first. Leave your email and we'll send you verified matches for this search.",
            button: "Send me my matches",
          }}
        />

        <Marquee
          words={["Columbia email checked", "Proof of lease", "Photos reviewed by hand", "Exact dates", "Listed by students"]}
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

        <SpotTheScam title="Can you spot the scam? We check the lister for you." />

        <section className="section">
          <div className="wrap">
            <div className="split reveal">
              <div>
                <div className="eyebrow">What &ldquo;verified&rdquo; means on Gable</div>
                <h2 style={{ fontSize: "clamp(26px,3.4vw,36px)", marginTop: 6 }}>What we check before a listing goes up.</h2>
                <Checklist
                  items={[
                    <>
                      <b>The lister is a student.</b> Joining Gable takes a school email, so you know who you&apos;re talking to.
                    </>,
                    <>
                      <b>They&apos;re on the lease.</b> They show us proof before their room goes up. That doesn&apos;t prove the
                      landlord allows subletting, so ask.
                    </>,
                    <>
                      <b>The photos hold up.</b> A person on our team looks at every photo and the address before the listing goes live.
                    </>,
                    <>
                      <b>You know who they are.</b> Each listing shows the lister&apos;s first name and school.
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
                  where: "Sublet · private room in a 2BR, W 109th St",
                  meta: "Jan 5 to May 20 · Furnished · 5 min to campus",
                  tags: ["School email", "On the lease", "Photos checked"],
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
                  body: "Students post their own rooms on Gable, and we check each one by hand before it goes up.",
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
      <SiteFooter />
    </>
  );
}
