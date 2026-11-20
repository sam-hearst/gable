import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { FavoritesProvider } from "@/components/search/FavoritesProvider";
import { FavoritesView } from "@/components/search/FavoritesView";
import { getFavorites } from "@/lib/favorites";
import { getApprovedListings } from "@/lib/student-listings";

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
  const real = (await getApprovedListings()).filter((l) => ids.includes(l.id));
  return (
    <FavoritesProvider initialIds={ids} signedIn>
      <FavoritesView real={real} />
    </FavoritesProvider>
  );
}

export default function Favorites() {
  return (
    <AppShell current="favorites">
      <main>
        <section className="section">
          <div className="wrap">
            <Suspense fallback={<p className="fine">Loading your favorites…</p>}>
              <Saved />
            </Suspense>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
