import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Mail } from "@/components/landing/icons";
import { ChatPreview } from "@/components/listing/ChatPreview";
import { getChatPeek } from "@/lib/listing-chat";
import { money, shortDate } from "@/lib/format";
import { getStudentListing } from "@/lib/student-listings";
import "@/components/booking/booking.css";
import "../../sublet-your-room/sublet.css";
import "@/components/listing/listing-community.css";

const ROOM_LABEL = { "private room": "Private room", studio: "Studio", shared: "Shared room" };

export const metadata: Metadata = {
  title: "Real listing | Gable",
  robots: { index: false },
};

// Cache Components needs one param to prerender the page shell (the header
// reads the URL). It's not a real id, so it 404s like any unknown one.
export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

// One real student sublet. The listing itself reads the session cookie, so it
// renders on every request inside Suspense and is never cached: a listing
// disappears as soon as the team un-approves it. Row level
// security decides who sees it: approved listings for everyone, plus the
// lister's own pending ones for them. Demo site only (src/proxy.ts).
async function Listing({ id }: { id: string }) {
  // Per-request work: without this, Next.js also runs the Supabase call
  // during its prerender check, which errors on Date.now().
  await connection();
  const found = await getStudentListing(id);
  if (!found) notFound();
  const { listing: l, isOwner, signedIn } = found;
  const [cover, ...more] = l.photos;
  const peek = l.status === "approved" ? await getChatPeek(l.id) : { count: null, messages: [] };
  const chatHref = `/sublet/${l.id}/chat`;

  return (
    <>
      {l.status !== "approved" ? (
        <div className="demo-note">
          <span className={`status status-${l.status}`}>
            {l.status === "pending" ? "Waiting for our check" : "Not approved"}
          </span>
          <p>Only you can see this. It shows in search once we&apos;ve checked it.</p>
        </div>
      ) : (
        <div className="demo-note">
          <span className="badge badge-real">
            <span className="dot" />
            Real listing
          </span>
          <p>Posted by a student and checked by our team, not one of our demo samples.</p>
        </div>
      )}

      <div className="listing-detail">
        <div className="real-gallery">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover.src} alt={cover.alt} />
          {more.length > 0 && (
            <div className="more">
              {more.map((p) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={p.src} src={p.src} alt={p.alt} loading="lazy" />
              ))}
            </div>
          )}
        </div>

        <div className="listing-info">
          <div className="eyebrow">Sublet · {l.neighborhood}</div>
          <h1>{l.title}</h1>
          <div className="price">
            {money(l.price)} <span>/ month</span>
          </div>
          <div className="facts">
            <span className="fact">
              {shortDate(l.availableFrom)} – {shortDate(l.availableTo)}
            </span>
            <span className="fact">{ROOM_LABEL[l.roomType]}</span>
            <span className="fact">{l.furnished ? "Furnished" : "Unfurnished"}</span>
            <span className="fact">Sleeps {l.sleeps}</span>
            <span className="fact">{l.crossStreets}</span>
          </div>
          <p className="real-words">{l.description}</p>


          <div className="lister">
            <span className="av">{l.lister.firstName[0]}</span>
            <div>
              <b>
                {l.lister.firstName}, {l.lister.school}
              </b>
              <small>Student subletting their place</small>
            </div>
          </div>

          {l.status === "approved" && (
            <ChatPreview
              count={peek.count}
              messages={peek.messages}
              href={signedIn ? chatHref : `/signin?next=${encodeURIComponent(chatHref)}`}
              joinLabel={isOwner ? "Open your group chat" : signedIn ? "Join the group chat" : "Sign in to join the group chat"}
              hostName={l.lister.firstName}
              hint={
                isOwner
                  ? "You can remove anyone and end the chat once the room is taken."
                  : "Ask questions together. Share your address or payment details only in a private message."
              }
            />
          )}

          {isOwner ? null : signedIn && l.contactEmail ? (
            <a
              className="btn btn-secondary cta-full"
              href={`mailto:${l.contactEmail}?subject=${encodeURIComponent(`Your sublet on Gable: ${l.title}`)}`}
            >
              <Mail size={18} />
              Email {l.lister.firstName} privately
            </a>
          ) : (
            <Link className="btn btn-secondary cta-full" href={`/signin?next=${encodeURIComponent(`/sublet/${l.id}`)}`}>
              Sign in to contact {l.lister.firstName}
            </Link>
          )}
          <p className="under-cta">
            Gable can&apos;t take payment for real listings yet. See the place or video call, and ask to see the lease,
            before you pay anything.
          </p>
        </div>
      </div>
    </>
  );
}

export default function RealListingPage({ params }: PageProps<"/sublet/[id]">) {
  return (
    <AppShell current="none">
      <main>
        <section className="section">
          <div className="wrap">
            <Link className="back-link" href="/search">
              &larr; Back to results
            </Link>
            <Suspense fallback={null}>{params.then(({ id }) => <Listing id={id} />)}</Suspense>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
