import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";
import { FavoritesProvider } from "@/components/search/FavoritesProvider";
import { FavoritesView } from "@/components/search/FavoritesView";
import { getFavorites } from "@/lib/favorites";

export const metadata: Metadata = {
  title: "Your favorites | Gable",
  description: "The places you've saved, on a map.",
};

// The signed-in user's saved places. Signed out, it sends you to sign in and
// back here afterwards.
async function Saved() {
  await connection();
  const { user, ids } = await getFavorites();
  if (!user) redirect("/signin?next=/favorites");
  return (
    <FavoritesProvider initialIds={ids} signedIn>
      <FavoritesView email={user.email} />
    </FavoritesProvider>
  );
}

export default function Favorites() {
  return (
    <>
      <SiteHeader current="favorites" />
      <main>
        <section className="section">
          <div className="wrap">
            <Suspense fallback={<p className="fine">Loading your favorites…</p>}>
              <Saved />
            </Suspense>
          </div>
        </section>
      </main>
      <SiteFooter current="/favorites" />
    </>
  );
}
