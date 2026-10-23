import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { SiteFooter } from "@/components/landing/SiteChrome";
import { FavoritesProvider } from "@/components/search/FavoritesProvider";
import { SavedCount } from "@/components/search/HeartButton";
import { ChatThread } from "@/components/search/ChatThread";
import { ResultCard } from "@/components/search/ResultCard";
import { SearchHeader } from "@/components/search/SearchHeader";
import { SearchSession } from "@/components/search/SearchSession";
import { getFavorites } from "@/lib/favorites";
import { search } from "@/lib/search";
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
      <p className="search-fine">These are sample places for our demo, not real listings yet.</p>
      <Link className="search-new" href="/">
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
  const [{ reply, results, matched }, favorites] = await Promise.all([search(messages), getFavorites()]);

  return (
    <FavoritesProvider initialIds={favorites.ids} signedIn={Boolean(favorites.user)}>
      <SearchSession messages={messages}>
        <div className="search-side">
          <ChatThread reply={reply} />
          <SideNotes />
        </div>

        <div className="search-results">
          <div className="search-results-top">
            {!matched && <h2 className="closest-head">Closest options</h2>}
            <SavedCount />
          </div>
          <div className="results">
            {results.map((r) => (
              <ResultCard key={r.listing.id} l={r.listing} misses={r.misses} />
            ))}
          </div>
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
    <>
      <SearchHeader />
      <main>
        <section className="search-main">
          <div className="search-wrap">
            <Suspense fallback={<Loading />}>
              <Results searchParams={searchParams} />
            </Suspense>
          </div>
        </section>
      </main>
      <SiteFooter current="/search" />
    </>
  );
}
