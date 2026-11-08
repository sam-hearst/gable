import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AppShell } from "@/components/app/AppShell";
import { MessagesMock } from "@/components/circles/MessagesMock";
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
        {showSamples ? (
          <Suspense>
            <MessagesMock />
          </Suspense>
        ) : (
          <div className="messages-empty">
            <h1>No messages yet</h1>
            <p>When you ask about a place or a student messages you, the conversation shows up here.</p>
            <Link className="btn btn-sm" href="/explore">
              Find a sublet
            </Link>
          </div>
        )}
      </main>
    </AppShell>
  );
}
