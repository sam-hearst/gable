import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { CtaPhoto } from "@/components/landing/blocks";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";
import { ResultCard } from "@/components/search/ResultCard";
import { search } from "@/lib/search";
import "./search.css";

export const metadata: Metadata = {
  title: "Your search | Gable",
  description: "Places that fit what you asked for, and what we checked about each one.",
};

// Everything that depends on the request (?q=). It sits in Suspense so the
// rest of the page is prerendered and this streams in once Claude (or the
// keyword fallback) has read the request.
async function Results({ searchParams }: { searchParams: PageProps<"/search">["searchParams"] }) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim().slice(0, 500) ?? "";
  // Calling Claude is per-request work: without this, Next.js also runs it
  // during its prerender check, which errors on the SDK's Date.now() and
  // makes a second, aborted API call.
  await connection();
  const { reply, results, matched } = await search(q);

  return (
    <>
      <div className="search-thread">
        {q && (
          <div className="search-msg search-msg-you">
            <h1>{q}</h1>
          </div>
        )}
        <div className="search-msg search-msg-gable" role="status">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="search-avatar" src="/logo/gable-favicon.svg" alt="Gable" width={32} height={32} />
          <p>{reply}</p>
        </div>
      </div>
      {!q && <h1 className="sr-only">Search</h1>}

      {!matched && <h2 className="closest-head">Closest options</h2>}
      <div className="results">
        {results.map((r) => (
          <ResultCard key={r.listing.id} l={r.listing} misses={r.misses} />
        ))}
      </div>
    </>
  );
}

function Loading() {
  return (
    <div className="search-thread" aria-busy="true">
      <div className="search-msg search-msg-gable">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="search-avatar" src="/logo/gable-favicon.svg" alt="Gable" width={32} height={32} />
        <p>Reading your request…</p>
      </div>
    </div>
  );
}

export default function Search({ searchParams }: PageProps<"/search">) {
  return (
    <>
      <SiteHeader current="none" />
      <main>
        <section className="section search-head">
          <div className="wrap">
            <div className="search-top">
              <div className="eyebrow">Your search</div>
              <Link className="btn btn-secondary btn-sm" href="/">
                New search
              </Link>
            </div>
            <div className="search-note">
              <span className="badge">
                <span className="dot" />
                Sample listings
              </span>
              <p>These are sample places for our demo, not real listings yet.</p>
            </div>
            <Suspense fallback={<Loading />}>
              <Results searchParams={searchParams} />
            </Suspense>
          </div>
        </section>

        <CtaPhoto
          photo={30775151}
          source="search"
          title="Want real listings like these?"
          body="We're opening to Columbia students first. Leave your email and we'll send your first checked matches."
          button="Get early access"
          fine="No spam. One email when your matches are ready."
        />
      </main>
      <SiteFooter current="/search" />
    </>
  );
}
