import type { Metadata } from "next";
import { ChatHero } from "@/components/landing/ChatHero";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";
import { Checklist, CtaPhoto, Listing, Mark, Marquee, Quotes, SectionHead, Steps } from "@/components/landing/blocks";

// Landing page 3: two students looking for a sublet together (persona Theo,
// who needs a fall room for himself and a friend). Pairs with the share card on
// /thanks, which asks people to bring the friend they're moving in with.
export const metadata: Metadata = {
  title: "Gable: sublets for two near Columbia",
  description:
    "Looking for a sublet with a friend? Tell Gable both of your dates and budgets, and see only verified sublets that work for two.",
};

export default function TogetherPage() {
  return (
    <>
      <SiteHeader current="none" />
      <main>
        <ChatHero
          source="together"
          badge="For two students looking together"
          title={
            <>
              Find a sublet for <Mark>two</Mark>, with dates that work for both of you.
            </>
          }
          sub="Most sublets fit one person. Tell Gable about both of you, and see only verified sublets with room for two: your dates, your budgets, two rooms or one shared."
          modesLabel="How do you want to live?"
          modes={[
            {
              id: "two-rooms",
              label: "Two rooms",
              prompts: [
                "Two rooms near campus for me and a friend, Sept to Dec",
                "Sublet with two bedrooms, June 1 to Aug 15, under $1,500 each",
                "Me and my roommate need two rooms for the spring semester",
              ],
            },
            {
              id: "shared-room",
              label: "One shared room",
              prompts: [
                "Shared room for two friends near the 1 train, summer",
                "Room with two beds near Columbia, under $1,000 each",
                "Two of us, one big room, June to August",
              ],
            },
          ]}
          meta="Only sublets that sleep two"
          chips={["Two rooms, Sept to Dec", "Shared room for the summer", "Under $1,500 each", "We both start June 1"]}
          collage={[
            { id: 6969990, badge: "Sleeps 2", bold: "$2,700", text: "$1,350 each" },
            { id: 7647755, text: "Moving in together" },
            { id: 8089268, badge: "Both your dates", bold: "$2,300", text: "Sept to Dec" },
            { id: 545025, text: "Two rooms" },
          ]}
          strip={[
            { id: 6969990, badge: "Sleeps 2" },
            { id: 8089268, badge: "Verified" },
            { id: 7647755, badge: "Together" },
            { id: 545025, badge: "Two rooms" },
          ]}
          modal={{
            title: "Got it, a place for two.",
            lead: "Leave your email and we'll send sublets that fit both of you. Then share your link so your friend can join too.",
            button: "Send us matches",
            placeholder: "you@school.edu",
          }}
        />

        <Marquee words={["Sleeps two", "Two bedrooms", "Both your dates", "Your share of the rent", "Verified tenants", "No Zelle"]} />

        <section className="section tint">
          <div className="wrap">
            <SectionHead eyebrow="The problem" title="Most sublets fit one person. You're two.">
              One of you finds a place, the dates don&apos;t work for the other, and you start over. Twice the messages, twice the
              chances of a lister who never replies.
            </SectionHead>
            <Quotes
              quotes={[
                {
                  text: "The only thing i’m worried about with subletting is that i won’t be able to get the right dates and/or my roommate won’t be able to live with me",
                  cite: "r/nyu",
                },
                {
                  text: "I messaged probably like twenty people and half of them never answered.",
                  cite: "Columbia student we interviewed",
                },
                { text: "It really is a full time job trying to find a place in NYC.", cite: "r/NYCapartments" },
              ]}
            />
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <SectionHead eyebrow="How Gable handles it" title="One search for both of you." />
            <Steps
              steps={[
                {
                  title: "Tell us about both of you",
                  body: "Each of your dates and budgets, and whether you want two rooms or one shared room.",
                },
                {
                  title: "Only places for two",
                  body: "We only show sublets that sleep two and cover both of your dates, with the rent shown as each person's share.",
                },
                {
                  title: "Both of you see what we checked",
                  body: "Share one short list. Every lister is a verified student tenant, with photos checked and the address confirmed.",
                },
              ]}
            />
          </div>
        </section>

        <section className="section tint">
          <div className="wrap">
            <div className="split reveal">
              <div className="callout">
                <h3>Search together, decide together</h3>
                <p>Every sublet for two shows you:</p>
                <Checklist
                  icon="check"
                  items={[
                    "Your share of the rent, not just the total",
                    "Dates that cover both of you",
                    "Two beds or two rooms, confirmed with the tenant",
                    "Who the tenant is, and how fast they reply",
                  ]}
                />
                <p style={{ marginTop: 18, fontSize: 15 }}>
                  <b>Found a place on your own?</b> Your friend can join with your link, and we&apos;ll match the two of you.
                </p>
              </div>
              <div>
                <Listing
                  l={{
                    photo: 6969990,
                    alt: "Apartment with a brick wall, orange sofa and wooden dining table",
                    price: "$2,700",
                    where: "Sublet · 2 rooms in a 3BR, W 112th St",
                    meta: "Sep 1 to Dec 20 · $1,350 each · furnished",
                    tags: ["Sleeps 2", "Both your dates", "Lease allows sublet"],
                  }}
                />
                <p className="fine" style={{ marginTop: 10 }}>
                  Example listing. Listings shown are illustrations while we&apos;re in early access.
                </p>
              </div>
            </div>
          </div>
        </section>

        <CtaPhoto
          photo={7647755}
          source="together"
          title="Get early access for the two of you."
          body="Leave your email and we'll send sublets for two that cover your dates. Then share your link so your friend can join."
          button="Get early access"
          placeholder="you@school.edu"
          fine="No spam. One email when your matches are ready."
        />
      </main>
      <SiteFooter current="/together" />
    </>
  );
}
