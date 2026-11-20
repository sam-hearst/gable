import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { AppShell } from "@/components/app/AppShell";
import { ShareLinkForm } from "@/components/listing/ShareLinkForm";
import { supabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/supabase/server";
import "../sublet-your-room/sublet.css";
import "../search/search.css";

export const metadata: Metadata = {
  title: "Share a sublet you found | Gable",
  description: "Found a sublet on another site? Share the link and it shows in Gable's search, labeled as not checked by us.",
};

// Signed in: the form. Signed out: a sign-in card (sharing needs an account).
// Without Supabase (local development) the form shows so it can be tried.
async function ForSharer() {
  await connection();
  if (supabaseConfigured && !(await getCurrentUser())) {
    return (
      <div className="list-card">
        <h2>Sign in to share a listing</h2>
        <p>So we know who shared it, and so nobody can flood search with links.</p>
        <Link className="btn" href="/signin?next=/share-a-listing">
          Sign in or create an account
        </Link>
      </div>
    );
  }
  return <ShareLinkForm />;
}

export default function ShareAListing() {
  return (
    <AppShell current="none">
      <main>
        <section className="section">
          <div className="wrap list-wrap">
            <div className="list-head">
              <span className="eyebrow">Found a place somewhere else?</span>
              <h1>Share a sublet you found</h1>
              <p>
                Paste the link and it shows in Gable&apos;s search for about three weeks, under &ldquo;Elsewhere on the
                web,&rdquo; so other students looking for the same dates find it. Subletting your own room?{" "}
                <Link href="/sublet-your-room">List it on Gable</Link> instead.
              </p>
            </div>
            <ol className="list-steps">
              <li>Paste the link. We read that page&apos;s preview and fill in the rent, dates and area where it says them.</li>
              <li>Check the details against the listing and fix anything that&apos;s off.</li>
              <li>
                Once we approve it, it shows in search with a clear label: it&apos;s on another site, and Gable didn&apos;t
                check it. People contact the lister there.
              </li>
            </ol>
            <Suspense fallback={null}>
              <ForSharer />
            </Suspense>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
