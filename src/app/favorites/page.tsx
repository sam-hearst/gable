import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { FavoritesProvider } from "@/components/search/FavoritesProvider";
import { FavoritesView } from "@/components/search/FavoritesView";
import { getFavorites } from "@/lib/favorites";
import { geocodeAddress } from "@/lib/geocode";
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
  // Where each saved real listing is, from its street address.
  const coords = Object.fromEntries(await Promise.all(real.map(async (l) => [l.id, await geocodeAddress(l.crossStreets)] as const)));
  return (
    <FavoritesProvider initialIds={ids} signedIn>
      <FavoritesView real={real} coords={coords} />
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
