import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { FavoritesProvider } from "@/components/search/FavoritesProvider";
import { SavedCount } from "@/components/search/HeartButton";
import { ResultCard } from "@/components/search/ResultCard";
import { RefineBar } from "@/components/search/RefineBar";
import { SearchSession } from "@/components/search/SearchSession";
import { getFavorites } from "@/lib/favorites";
import { search } from "@/lib/search";
import { getApprovedListings } from "@/lib/student-listings";
import { SAMPLE_LISTINGS } from "@/content/listings";
import "./search.css";

export const metadata: Metadata = {
  title: "Your search | Gable",
  description: "Places that fit what you asked for, and what we checked about each one.",
};



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

  return (
    <FavoritesProvider initialIds={favorites.ids} signedIn={Boolean(favorites.user)}>
      <SearchSession messages={messages}>
        {/* Results first: Gable's answer as one line, then the places. */}
        <header className="search-head">
          <div>
            <p className="search-eyebrow">{matched ? `${results.length} ${results.length === 1 ? "place fits" : "places fit"}` : "Closest options"}</p>
            <h1 className="search-summary" role="status">
              {reply}
            </h1>
          </div>
          <div className="search-head-actions">
            <SavedCount />
            <Link className="search-new-btn" href="/explore">
              New search
            </Link>
          </div>
        </header>

        <div className="search-results">
          <div className="results">
            {results.map((r) => (
              <ResultCard key={r.listing.id} l={r.listing} misses={r.misses} />
            ))}
          </div>
          <p className="search-fine">
            Places marked Real listing were posted by students and checked by our team. The rest are samples for our
            demo. <Link href="/sublet-your-room">List your room</Link>
          </p>
        </div>

        <RefineBar />
      </SearchSession>
    </FavoritesProvider>
  );
}

function Loading() {
  return (
    <header className="search-head">
      <div>
        <p className="search-eyebrow">Your search</p>
        <p className="search-summary" role="status" aria-busy="true">
          Reading your request…
        </p>
      </div>
    </header>
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
