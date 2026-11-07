import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { HomeHero } from "@/components/landing/HomeSections";

export const metadata: Metadata = {
  title: "Explore | Gable",
  description: "Tell Gable what you need and see sublets near Columbia that fit.",
};

// Where signed-in people land (the homepage sends them here). It's the
// homepage's search, centered, with the sidebar.
export default function ExplorePage() {
  return (
    <AppShell current="explore">
      {/* Just the search, centered on the page. */}
      <main className="explore-main">
        <HomeHero source="explore" />
      </main>
    </AppShell>
  );
}
