import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { ExploreChat } from "@/components/app/ExploreChat";

export const metadata: Metadata = {
  title: "Explore | Gable",
  description: "Tell Gable what you need and see sublets near Columbia that fit.",
};

// Where signed-in people land (the homepage sends them here): the sidebar and
// one chat box in the middle of the page.
export default function ExplorePage() {
  return (
    <AppShell current="explore">
      <main className="explore-main">
        <ExploreChat />
      </main>
    </AppShell>
  );
}
