import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CtaPhoto } from "@/components/landing/blocks";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";
import { ResultCard } from "@/components/search/ResultCard";
import { SAMPLE_LISTINGS } from "@/content/listings";

export const metadata: Metadata = {
  title: "Your search | Gable",
  description: "Places that fit what you asked for, and what we checked about each one.",
};

// The request from the homepage chat box (?q=). It's the only part of the page
// that reads the URL, so it sits in Suspense and the rest can be prerendered.
async function Request({ searchParams }: { searchParams: PageProps<"/search">["searchParams"] }) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? "";
  return <RequestHeading q={q} />;
}

function RequestHeading({ q }: { q: string }) {
  return (
    <>
      <div className="eyebrow">{q ? "You asked for" : "Search"}</div>
      <h1>{q ? `“${q}”` : "Tell us the place you want."}</h1>
    </>
  );
}

// Results for what someone typed into the homepage chat box. For the demo it
// shows every sample listing; matching to the request comes next.
export default function Search({ searchParams }: PageProps<"/search">) {
  return (
    <>
      <SiteHeader current="none" />
      <main>
        <section className="section search-head">
          <div className="wrap">
            <Suspense fallback={<RequestHeading q="" />}>
              <Request searchParams={searchParams} />
            </Suspense>
            <div className="search-note">
              <span className="badge">
                <span className="dot" />
                Sample listings
              </span>
              <p>
                These {SAMPLE_LISTINGS.length} places are samples for our demo, not real listings yet. For now we show all
                of them; soon this list will only show places that fit what you asked for.
              </p>
            </div>
            <Link className="btn btn-secondary btn-sm" href="/">
              New search
            </Link>
          </div>
        </section>

        <section className="section results-section">
          <div className="wrap">
            <div className="results">
              {SAMPLE_LISTINGS.map((l) => (
                <ResultCard key={l.id} l={l} />
              ))}
            </div>
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
