import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { CirclesMock } from "@/components/circles/CirclesMock";

export const metadata: Metadata = {
  title: "Circles | Gable",
  description: "Small groups around a real place or plan, where everyone shows how they're connected to you.",
};

// Design mockup (sample data): structured group chats with trust built in.
export default function CirclesPage() {
  return (
    <AppShell current="circles">
      <main>
        <CirclesMock />
      </main>
    </AppShell>
  );
}
