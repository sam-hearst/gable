import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { ListingChat } from "@/components/listing/ListingChat";
import { getStudentListing } from "@/lib/student-listings";
import { getCurrentUser } from "@/lib/supabase/server";
import "@/components/booking/booking.css";
import "@/components/listing/listing-chat.css";

export const metadata: Metadata = {
  title: "Group chat | Gable",
  robots: { index: false },
};

// Same placeholder as the listing page: Cache Components needs one param to
// prerender the shell, and it 404s like any unknown id.
export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

// The chat for one approved real listing. Signed-in students only; the chat
// itself talks to Supabase from the browser (see ListingChat).
async function Chat({ id }: { id: string }) {
  await connection();
  const user = await getCurrentUser();
  if (!user) redirect(`/signin?next=${encodeURIComponent(`/sublet/${id}/chat`)}`);
  const found = await getStudentListing(id);
  if (!found || found.listing.status !== "approved") notFound();
  const { listing: l, isOwner } = found;
  const guess = (user.email ?? "").split("@")[0].split(/[._\d-]/)[0];
  const defaultName = guess ? guess[0].toUpperCase() + guess.slice(1) : "";

  return (
    <ListingChat
      listingId={l.id}
      listingTitle={l.title}
      hostName={l.lister.firstName}
      isHost={isOwner}
      userId={user.id}
      defaultName={defaultName}
    />
  );
}

export default function ListingChatPage({ params }: PageProps<"/sublet/[id]/chat">) {
  return (
    <AppShell current="none">
      <main>
        <section className="section">
          <div className="wrap">
            <Suspense fallback={null}>{params.then(({ id }) => <Chat id={id} />)}</Suspense>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
