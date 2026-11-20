import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { DirectMessage } from "@/components/listing/DirectMessage";
import { getStudentListing } from "@/lib/student-listings";
import { getCurrentUser } from "@/lib/supabase/server";
import "@/components/booking/booking.css";
import "@/components/listing/listing-chat.css";

export const metadata: Metadata = {
  title: "Private message | Gable",
  robots: { index: false },
};

// Same placeholder as the listing page: Cache Components needs one param to
// prerender the shell, and it 404s like any unknown id.
export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// A private thread about one approved real listing. A renter has one thread per
// listing (this page); the lister opens a specific renter's thread with ?t=<id>
// from /messages. Signed-in students only; the thread itself talks to Supabase
// from the browser (see DirectMessage).
async function Thread({ id, t }: { id: string; t: string | null }) {
  await connection();
  const user = await getCurrentUser();
  if (!user) redirect(`/signin?next=${encodeURIComponent(`/sublet/${id}/message`)}`);
  const found = await getStudentListing(id);
  if (!found || found.listing.status !== "approved") notFound();
  const { listing: l, isOwner } = found;
  if (isOwner && !(t && UUID.test(t))) redirect("/messages");
  const guess = (user.email ?? "").split("@")[0].split(/[._\d-]/)[0];
  const defaultName = guess ? guess[0].toUpperCase() + guess.slice(1) : "";

  return (
    <DirectMessage
      listingId={l.id}
      listingTitle={l.title}
      listerName={l.lister.firstName}
      isLister={isOwner}
      threadId={isOwner ? t : null}
      userId={user.id}
      defaultName={defaultName}
    />
  );
}

export default function DirectMessagePage({ params, searchParams }: PageProps<"/sublet/[id]/message">) {
  return (
    <AppShell current="none">
      <main>
        <section className="section">
          <div className="wrap">
            <Suspense fallback={null}>
              {Promise.all([params, searchParams]).then(([{ id }, q]) => (
                <Thread id={id} t={typeof q.t === "string" ? q.t : null} />
              ))}
            </Suspense>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
