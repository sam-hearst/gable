import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/app/AppShell";
import { MessagesMock } from "@/components/circles/MessagesMock";
import { MyChats } from "@/components/listing/MyChats";
import { showSamples } from "@/lib/mode";

export const metadata: Metadata = {
  title: "Messages | Gable",
  description: "Group chats for each listing you're interested in, and direct messages with listers.",
};

// Staging: a design mockup with sample chats (listing group chats and direct
// messages, trust on every person, LinkedIn / Instagram cards). Production has
// no messaging yet, so it says so plainly.
export default function MessagesPage() {
  return (
    <AppShell current="messages">
      <main>
        {/* Your real group chats, with unread counts. Production shows only these. */}
        <MyChats showEmpty={!showSamples} />
        {showSamples && (
          <Suspense>
            <MessagesMock />
          </Suspense>
        )}
      </main>
    </AppShell>
  );
}
