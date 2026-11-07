import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { FavoritesProvider } from "@/components/search/FavoritesProvider";
import { SavedCount } from "@/components/search/HeartButton";
import { ChatThread } from "@/components/search/ChatThread";
import { ResultCard } from "@/components/search/ResultCard";
import { SearchSession } from "@/components/search/SearchSession";
import { getFavorites } from "@/lib/favorites";
import { search } from "@/lib/search";
import { getApprovedListings } from "@/lib/student-listings";
import { SAMPLE_LISTINGS, type SampleListing } from "@/content/listings";
import type { MapPlace } from "@/components/map/CityMap";
import { toMapPlace } from "@/components/map/places";
import { ResultsWithMap } from "@/components/search/ResultsWithMap";
import { isStudentListing } from "@/lib/student-listing-fields";
import "./search.css";

export const metadata: Metadata = {
  title: "Your search | Gable",
  description: "Places that fit what you asked for, and what we checked about each one.",
};

function GableSays({ children, busy = false }: { children: React.ReactNode; busy?: boolean }) {
  return (
    <div className="search-msg search-msg-gable" role="status" aria-busy={busy || undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="search-msg-icon" src="/logo/gable-favicon.svg" alt="Gable" width={28} height={28} />
      <p>{children}</p>
    </div>
  );
}

// Left column under the chat: what these listings are, and a way to start over.
function SideNotes() {
  return (
    <>
      <p className="search-fine">
        Places marked Real listing were posted by students and checked by our team. The rest are samples for our
        demo. <Link href="/sublet-your-room">List your room</Link>
      </p>
      <Link className="search-new" href="/explore">
        Start a new search
      </Link>
    </>
  );
}

// The conversation so far: every ?q= in order (the first request, then
// follow-ups), trimmed, at most the last 10.
function readMessages(raw: string | string[] | undefined) {
  const all = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return all
    .map((m) => m.trim().slice(0, 500))
    .filter(Boolean)
    .slice(-10);
}

// Everything that depends on the conversation (?q=). It sits in Suspense so
// the rest of the page is prerendered and this streams in once Claude (or the
// keyword fallback) has read it.
async function Results({ searchParams }: { searchParams: PageProps<"/search">["searchParams"] }) {
  const messages = readMessages((await searchParams).q);
  // Calling Claude is per-request work: without this, Next.js also runs it
  // during its prerender check, which errors on the SDK's Date.now() and
  // makes a second, aborted API call.
  await connection();
  // Real student listings (approved only) are searched next to the samples.
  // If they can't be read, search goes on with the samples alone.
  const [real, favorites] = await Promise.all([getApprovedListings(), getFavorites()]);
  const { reply, results, matched } = await search(messages, [...real, ...SAMPLE_LISTINGS]);
  // Only the sample listings have map coordinates (student posts give cross streets, not an address).
  const mapPlaces: MapPlace[] = results
    .map((r) => r.listing)
    .filter((l): l is SampleListing => !isStudentListing(l))
    .map(toMapPlace);

  return (
    <FavoritesProvider initialIds={favorites.ids} signedIn={Boolean(favorites.user)}>
      <SearchSession messages={messages}>
        <div className="search-side">
          <ChatThread reply={reply} />
          <SideNotes />
        </div>

        <div className="search-results">
          <ResultsWithMap
            places={mapPlaces}
            top={
              <>
                {!matched && <h2 className="closest-head">Closest options</h2>}
                <SavedCount />
              </>
            }
          >
            {results.map((r) => (
              <div key={r.listing.id} data-place-id={r.listing.id}>
                <ResultCard l={r.listing} misses={r.misses} />
              </div>
            ))}
          </ResultsWithMap>
        </div>
      </SearchSession>
    </FavoritesProvider>
  );
}

function Loading() {
  return (
    <div className="search-layout">
      <div className="search-side">
        <div className="search-thread">
          <GableSays busy>Reading your request…</GableSays>
        </div>
        <SideNotes />
      </div>
    </div>
  );
}

export default function Search({ searchParams }: PageProps<"/search">) {
  return (
    <AppShell current="explore">
      <main>
        <section className="search-main">
          <div className="search-wrap">
            <Suspense fallback={<Loading />}>
              <Results searchParams={searchParams} />
            </Suspense>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
