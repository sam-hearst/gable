import type { Metadata } from "next";
import { ChatHero } from "@/components/landing/ChatHero";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";
import { Checklist, CtaPhoto, Mark, Marquee, Quotes, SectionHead, Steps } from "@/components/landing/blocks";

// Landing page 3: the supply side, students subletting their own room.
export const metadata: Metadata = {
  title: "Gable: sublet your room to a verified student",
  description:
    "Going abroad or away for the summer? Gable sends you a short list of Columbia-verified students who match your dates, instead of 40 random messages.",
};

const SHORTLIST = [
  { initial: "M", tone: "", name: "Maya R.", school: "GSAS, 2nd-year PhD", needs: "Needs Jan 2 to May 28 · Non-smoker · No pets", fit: "Covers all your dates · Replies in ~1h" },
  { initial: "D", tone: " sun", name: "Daniel K.", school: "SIPA, visiting student", needs: "Needs Jan 5 to May 20 · Quiet, early riser", fit: "Covers your dates · Replies in ~3h" },
  { initial: "L", tone: " deep", name: "Lena S.", school: "Law School, LLM", needs: "Needs Jan 3 to May 25 · Has a guarantor", fit: "Exact match · Replies in ~5h" },
];

export default function SubletYourRoomPage() {
  return (
    <>
      <SiteHeader current="sublet" cta="List your room" />
      <main>
        <ChatHero
          source="sublet"
          badge="For students subletting their place"
          title={
            <>
              Sublet your room to a <Mark>verified</Mark> student, not 40 strangers.
            </>
          }
          sub="Tell us about your room and your dates. We send you a short list of Columbia-verified students who fit. You pick one."
          modesLabel="Why are you subletting?"
          modes={[
            {
              id: "abroad",
              label: "Going abroad",
              prompts: [
                "My room in a 3BR on W 113th, Jan to May while I'm abroad, $1,450",
                "Studying abroad in the spring, want a grad student who'll respect the place",
                "Furnished room near campus, Jan 3 to May 25, rent-stabilized",
              ],
            },
            {
              id: "summer-away",
              label: "Away for summer",
              prompts: [
                "Away for the summer, room free June 1 to Aug 20, $1,600",
                "Internship in another city, subletting my Morningside room for 10 weeks",
                "Room in a 2BR with one roommate, summer only, furnished",
              ],
            },
            {
              id: "leaving",
              label: "Leaving early",
              prompts: [
                "Moving out early, need someone to take over my lease from March",
                "Graduating in May, want a student to take my room until August",
                "Leaving NYC, 4 months left on my lease near Columbia",
              ],
            },
          ]}
          meta="Free during early access"
          chips={["Spring semester abroad, Jan to May", "Summer only, June to August", "Prefer a grad student", "Rent-stabilized, need someone reliable"]}
          collage={[
            { id: 8089268, badge: "Your room", bold: "$1,450", text: "Jan to May" },
            { id: 4554351, text: "Maya, verified" },
            { id: 6447384, badge: "3 matches", bold: "Shortlist", text: "this week" },
            { id: 6612086, text: "Move-in Jan 3" },
          ]}
          strip={[
            { id: 8089268, badge: "Your room" },
            { id: 4554351, badge: "Verified" },
            { id: 6447384, badge: "3 matches" },
            { id: 6612086, badge: "Move-in" },
          ]}
          modal={{
            title: "Sounds like a great room.",
            lead: "Leave your email and we'll reach out to set up your listing and send your first shortlist of verified students.",
            button: "List my room",
          }}
        />

        <Marquee
          words={[
            "Only verified students",
            "Your exact dates",
            "A shortlist, not an inbox",
            "Sublease agreement",
            "Rent through Gable",
            "Free during early access",
          ]}
        />

        <section className="section tint">
          <div className="wrap">
            <SectionHead eyebrow="Your shortlist" title="Three people worth answering, not an inbox you can't keep up with.">
              Every person on your shortlist is a verified student whose dates match yours. You see who they are before you
              reply.
            </SectionHead>
            <div className="demo">
              <div className="thread reveal" aria-label="Example conversation">
                <div className="msg me">My room on W 113th, Jan 3 to May 25, $1,450. Prefer a grad student.</div>
                <div className="msg gable">
                  <b>27 students</b> asked about rooms like yours this week. <b>3 match</b> your exact dates and preferences.
                </div>
                <div className="msg me">Who replies fastest?</div>
                <div className="msg gable">
                  Maya usually answers <b>within an hour.</b> Want me to set up a call?
                </div>
              </div>
              <div className="listings reveal">
                {SHORTLIST.map((p) => (
                  <article key={p.name} className="listing">
                    <div className="body">
                      <span className="badge">
                        <span className="dot" />
                        Columbia verified
                      </span>
                      <div className="person">
                        <span className={`avatar${p.tone}`}>{p.initial}</span>
                        <div className="price">{p.name}</div>
                      </div>
                      <div className="where">{p.school}</div>
                      <div className="meta">{p.needs}</div>
                      <div className="src">{p.fit}</div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <p className="fine" style={{ marginTop: 16 }}>
              Example shortlist. People shown are illustrations while we&apos;re in early access.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <SectionHead eyebrow="We hear you" title="Subletting shouldn't feel like a gamble." />
            <Quotes
              tinted
              quotes={[
                { text: "I listed my own room last week and I got over 40 replies.", cite: "r/NYCapartments" },
                { text: "worried about finding a reliable, honest sub letter for my rent stabilized apartment", cite: "r/AskNYC" },
                { text: "(Preferably college students / 20 somethings)", cite: "A room listing on r/NYCapartments" },
              ]}
            />
          </div>
        </section>

        <section className="section tint">
          <div className="wrap">
            <div className="split reveal">
              <div>
                <div className="eyebrow">What you get</div>
                <h2 style={{ fontSize: "clamp(26px,3.4vw,36px)", marginTop: 6 }}>Protect your room and your lease.</h2>
                <Checklist
                  items={[
                    <>
                      <b>Only verified students.</b> Everyone who reaches you has a confirmed school email.
                    </>,
                    <>
                      <b>Dates fixed upfront.</b> Move-in and move-out are agreed in writing, so nobody overstays.
                    </>,
                    <>
                      <b>A simple sublease agreement.</b> A plain-English template, plus a reminder to check your lease allows
                      subletting.
                    </>,
                    <>
                      <b>Rent on time.</b> We&apos;re building rent collection through Gable, so you&apos;re not chasing Venmo
                      requests from abroad.
                    </>,
                  ]}
                />
              </div>
              <Steps
                column
                steps={[
                  { title: "Describe your room", body: "Dates, rent, roommates, and who you'd like living there." },
                  { title: "Get your shortlist", body: "3 to 5 verified students whose dates match. No flood of messages." },
                  { title: "Pick one and sign", body: "Meet them, use our agreement, and head off knowing your place is in good hands." },
                ]}
              />
            </div>
          </div>
        </section>

        <CtaPhoto
          photo={7647755}
          source="sublet"
          title="List your room. Free during early access."
          body="Leave your email and we'll reach out to set up your listing and send your first shortlist."
          button="List my room"
          fine="No spam. We'll only email you about your listing."
        />
      </main>
      <SiteFooter current="/sublet-your-room" />
    </>
  );
}
