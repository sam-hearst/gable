import type { Metadata } from "next";
import { ChatHero } from "@/components/landing/ChatHero";
import { Photo } from "@/components/landing/Photo";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";
import { Checklist, CtaPhoto, Mark, Marquee, Quotes, SectionHead, Steps } from "@/components/landing/blocks";

// Landing page 2: out-of-town interns and incoming students who can't tour first.
export const metadata: Metadata = {
  title: "Gable: summer sublets in NYC, checked before you pay",
  description:
    "Coming to NYC for an internship or program? Find a real 10 to 12 week sublet near Columbia with exact dates, checked in person by our team before you pay.",
};

export default function SummerPage() {
  return (
    <>
      <SiteHeader current="summer" />
      <main>
        <ChatHero
          source="summer"
          badge="Summer 2027 · Interns and incoming students"
          title={
            <>
              Your summer room in NYC, <Mark>checked</Mark> before you pay.
            </>
          }
          sub="Real 10 to 12 week sublets near Columbia with exact dates. Someone on our team sees every place in person, so you don't have to fly in first."
          modesLabel="Who's searching?"
          modes={[
            {
              id: "intern",
              label: "I'm an intern",
              prompts: [
                "Summer internship in Midtown, need a room June 1 to Aug 15",
                "Furnished sublet for 10 weeks, under $1,800, near the subway",
                "First time in NYC, need somewhere safe for the summer",
              ],
            },
            {
              id: "incoming",
              label: "Incoming student",
              prompts: [
                "Starting at Columbia in the fall, need a sublet until my lease starts",
                "Room near campus for July and August before student housing opens",
                "Short sublet for my summer program, June to August",
              ],
            },
            {
              id: "parent",
              label: "I'm a parent",
              prompts: [
                "My daughter has an internship in NYC, she needs a safe room for the summer",
                "Furnished room near Columbia for my son, June 1 to Aug 20",
                "We can't visit before move-in. What can we trust?",
              ],
            },
          ]}
          meta="Every place checked in person"
          chips={["June 1 to Aug 15, furnished", "10 weeks, under $1,800", "Near the 1 train to Midtown", "Before my fall lease starts"]}
          collage={[
            { id: 31687845, badge: "Checked in person", bold: "$1,700", text: "Jun 1 to Aug 15" },
            { id: 7647755, text: "Move-in day" },
            { id: 33693815, badge: "Exact dates", bold: "$1,650", text: "10 weeks" },
            { id: 5928131, text: "12 min to Midtown" },
          ]}
          strip={[
            { id: 31687845, badge: "Checked" },
            { id: 33693815, badge: "Exact dates" },
            { id: 7647755, badge: "Move-in" },
            { id: 5928131, badge: "Near the 1" },
          ]}
          modal={{
            title: "Got it. We'll start looking.",
            lead: "Leave your email and we'll send summer sublets that cover your dates, each one checked in person.",
            button: "Send me summer matches",
            placeholder: "you@school.edu",
          }}
        />

        <Marquee
          words={["June 1 to August 15", "Furnished", "10 to 12 weeks", "Checked in person", "No Zelle", "No wires", "No money orders"]}
        />

        <section className="section tint">
          <div className="wrap">
            <SectionHead
              eyebrow="The catch-22"
              title={<>Everyone says &ldquo;never rent sight unseen.&rdquo; You can&apos;t fly in to look.</>}
            >
              Leasing offices won&apos;t do three months, so a summer in NYC means a sublet. And sublets are where the scams are.
            </SectionHead>
            <Quotes
              quotes={[
                {
                  text: "have never been to NYC before; as such, I fear I am a prime target for scams",
                  cite: "Incoming grad student, r/columbia",
                },
                { text: "It is too far away to just swing by for a visit.", cite: "Parent of a summer intern, r/Scams" },
                {
                  text: "it's basically impossible to lease a furnished apartment for only 3 months from a leasing company",
                  cite: "r/Scams",
                },
              ]}
            />
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <SectionHead eyebrow="How Gable handles it" title="We do the visit, so you don't have to." />
            <Steps
              steps={[
                {
                  title: "Tell us your exact dates",
                  body: "Internship start and end, budget, and where you'll commute. We only show places that cover your whole summer.",
                },
                {
                  title: "We see it in person",
                  body: "A Columbia student on our team visits, confirms the tenant lives there, and takes fresh photos that day.",
                },
                {
                  title: "Pay safely, not by Zelle",
                  body: "We're building payments that hold your rent until you move in. No wires, no money orders, no gift payments.",
                },
              ]}
            />
          </div>
        </section>

        <section className="section tint">
          <div className="wrap">
            <div className="split reveal">
              <div className="callout">
                <h3>For parents</h3>
                <p>
                  You can&apos;t visit before move-in, and you shouldn&apos;t have to take a stranger&apos;s word for it. For every
                  listing, you&apos;ll see:
                </p>
                <Checklist
                  icon="check"
                  items={[
                    "Who checked the place, and when",
                    "That the lister is the real tenant and is allowed to sublet",
                    "Exact move-in and move-out dates in writing",
                    "How the money is handled before move-in day",
                  ]}
                />
                <p style={{ marginTop: 18, fontSize: 15 }}>
                  <b>And no pressure tactics.</b> No &ldquo;only 2 left,&rdquo; no &ldquo;too good to be true&rdquo; deals, and no
                  deposit before anyone has seen the place.
                </p>
              </div>
              <div className="photo-panel">
                <Photo id={31687845} width={900} alt="Small vintage bedroom lit by a sunny window" />
                <div className="overlay-card">
                  <span className="badge">
                    <span className="dot" />
                    Checked in person
                  </span>
                  <b style={{ marginTop: 8 }}>Visited Mar 14 by a Columbia student on our team</b>
                  Tenant confirmed, and fresh photos taken that day.
                </div>
              </div>
            </div>
          </div>
        </section>

        <CtaPhoto
          photo={5928131}
          source="summer"
          title="Get early access for summer 2027."
          body="Leave your email and we'll send checked places that cover your exact dates as soon as we open."
          button="Get early access"
          placeholder="you@school.edu"
          fine="Parents welcome too. No spam, just your matches."
        />
      </main>
      <SiteFooter current="/summer" />
    </>
  );
}
