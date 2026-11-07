import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { BrowseSection, HomeHero } from "@/components/landing/HomeSections";

export const metadata: Metadata = {
  title: "Explore | Gable",
  description: "Tell Gable what you need and see sublets near Columbia that fit.",
};

// Where signed-in people land (the homepage sends them here). It's the
// homepage's hero and Browse cards in the sidebar, minus the waitlist sign-up.
export default function ExplorePage() {
  return (
    <AppShell current="explore">
      <main>
        <HomeHero source="explore" />
        <BrowseSection />
      </main>
    </AppShell>
  );
}
