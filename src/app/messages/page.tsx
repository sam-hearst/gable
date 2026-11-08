import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/app/AppShell";
import { MessagesMock } from "@/components/circles/MessagesMock";

export const metadata: Metadata = {
  title: "Messages | Gable",
  description: "Group chats for each listing you're interested in, and direct messages with listers.",
};

// Design mockup (sample data): listing group chats and direct messages, with
// trust shown on every person and LinkedIn / Instagram cards you can attach.
export default function MessagesPage() {
  return (
    <AppShell current="messages">
      <main>
        <Suspense>
          <MessagesMock />
        </Suspense>
      </main>
    </AppShell>
  );
}
