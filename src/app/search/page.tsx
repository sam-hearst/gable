import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { FavoritesProvider } from "@/components/search/FavoritesProvider";
import { SavedCount } from "@/components/search/HeartButton";
import { ResultCard } from "@/components/search/ResultCard";
import { ChatThread } from "@/components/search/ChatThread";
import { SearchSession } from "@/components/search/SearchSession";
import { getFavorites } from "@/lib/favorites";
import { search } from "@/lib/search";
import { getApprovedListings } from "@/lib/student-listings";
import { SAMPLE_LISTINGS } from "@/content/listings";
import { showSamples } from "@/lib/mode";
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
  // Real student listings (approved only), plus the samples on staging.
  const [real, favorites] = await Promise.all([getApprovedListings(), getFavorites()]);
  const { reply, results, matched } = await search(messages, [...real, ...(showSamples ? SAMPLE_LISTINGS : [])]);

  return (
    <FavoritesProvider initialIds={favorites.ids} signedIn={Boolean(favorites.user)}>
      <SearchSession messages={messages}>
        {/* Chat on the left (what you asked, Gable's answer, refine box); places on the right. */}
        {/* The chat lives in its own panel: header, messages, refine box at the bottom. */}
        <aside className="search-side chat-panel" aria-label="Your search">
          <div className="chat-panel-head">
            <span>Your search</span>
            <Link className="chat-panel-new" href="/explore">
              New search
            </Link>
          </div>
          <ChatThread reply={reply} />
        </aside>

        <div className="search-results">
          <div className="search-results-top">
            {!matched && <h2 className="closest-head">Closest options</h2>}
            <SavedCount />
          </div>
          {results.length ? (
            <div className="results">
              {results.map((r) => (
                <ResultCard key={r.listing.id} l={r.listing} misses={r.misses} />
              ))}
            </div>
          ) : (
            <div className="results-empty">
              <h2>No sublets here yet</h2>
              <p>Every place on Gable is posted by a student and checked by our team, and the first ones are on their way. Your search is saved in the chat, so check back soon.</p>
              <Link className="btn btn-sm" href="/sublet-your-room">
                List your room
              </Link>
            </div>
          )}
          <p className="search-fine search-fine-under">
            {showSamples
              ? "Places marked Real listing were posted by students and checked by our team. The rest are samples for our demo. "
              : "Every place here was posted by a student and checked by our team. "}
            <Link href="/sublet-your-room">List your room</Link>
          </p>
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
          <div className="search-msg search-msg-gable" role="status" aria-busy="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="search-msg-icon" src="/logo/gable-favicon.svg" alt="Gable" width={28} height={28} />
            <p>Reading your request…</p>
          </div>
        </div>
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
