import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";
import { ListingForm } from "@/components/listing/ListingForm";
import { RemoveListingButton } from "@/components/listing/RemoveListingButton";
import { money, shortDate } from "@/lib/format";
import type { ListingStatus } from "@/lib/student-listing-fields";
import { getMyListings } from "@/lib/student-listings";
import { supabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/supabase/server";
import "./sublet.css";

export const metadata: Metadata = {
  title: "List your room | Gable",
  description: "Away for the summer or a semester? Post your sublet and cover your rent while you're away.",
};

const STATUS: Record<ListingStatus, string> = {
  pending: "Waiting for our check",
  approved: "Live in search",
  rejected: "Not approved",
};

// The signed-in part of the page: the form and your listings so far. Reads
// the session cookie, so it renders per request inside Suspense.
async function ForLister() {
  // Per-request work (see /search): the Supabase call uses Date.now().
  await connection();
  if (!supabaseConfigured) {
    return (
      <div className="list-card">
        <h2>Posting isn&apos;t set up here yet</h2>
        <p>Sign-in isn&apos;t set up on this copy of Gable, so you can&apos;t post a room from it.</p>
      </div>
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="list-card">
        <h2>Sign in to post your room</h2>
        <p>
          Renters reach you by the email on your account, and we check that listers are students, so use your school
          email.
        </p>
        <Link className="btn" href="/signin?next=/sublet-your-room">
          Sign in or create an account
        </Link>
      </div>
    );
  }

  const mine = await getMyListings();
  return (
    <>
      <div className="list-card">
        <h2>Tell us about the place</h2>
        <p>It takes about five minutes. Nobody sees it until we&apos;ve checked it.</p>
        <ListingForm userId={user.id} email={user.email} />
      </div>

      {mine.length > 0 && (
        <section className="mine" aria-labelledby="mine-head">
          <h2 id="mine-head">Your listings</h2>
          <ul>
            {mine.map((l) => (
              <li key={l.id}>
                <span className="mine-title">
                  <Link href={`/sublet/${l.id}`}>{l.title}</Link>
                  <small>
                    {money(l.price)}/month · {shortDate(l.availableFrom)} – {shortDate(l.availableTo)}
                  </small>
                </span>
                <span className={`status status-${l.status}`}>{STATUS[l.status]}</span>
                <RemoveListingButton id={l.id} title={l.title} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

// Demo site only: src/proxy.ts sends the waitlist site home, and next.config.ts
// keeps the old redirect there.
export default function SubletYourRoom() {
  return (
    <>
      <SiteHeader current="list" />
      <main>
        <section className="section">
          <div className="wrap list-wrap">
            <div className="list-head">
              <span className="eyebrow">For students subletting</span>
              <h1>List your room</h1>
              <p>
                Away for the summer or a semester? Cover your rent while you&apos;re away. Students searching on Gable
                see your room once we&apos;ve checked it.
              </p>
            </div>
            <ol className="list-steps">
              <li>Tell us about the place: dates, rent, photos, and a few lines in your own words.</li>
              <li>
                We check it by hand. We&apos;ll email you to confirm you&apos;re a student and ask for proof you&apos;re
                on the lease.
              </li>
              <li>
                It goes live in search, marked Real listing, with what we checked. Students reply to you by email.
              </li>
            </ol>

            <Suspense fallback={null}>
              <ForLister />
            </Suspense>
          </div>
        </section>
      </main>
      <SiteFooter current="/sublet-your-room" />
    </>
  );
}
