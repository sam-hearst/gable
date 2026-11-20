import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/app/AppShell";
import { MessagesMock } from "@/components/circles/MessagesMock";
import { MessagesList } from "@/components/listing/MessagesList";
import { MessagesPane } from "@/components/listing/MessagesPane";
import { MyChats } from "@/components/listing/MyChats";
import { showSamples } from "@/lib/mode";
import "@/components/circles/circles.css";
import "@/components/listing/listing-chat.css";

export const metadata: Metadata = {
  title: "Messages | Gable",
  description: "Group chats for each listing you're interested in, and private messages with listers.",
};

// Production: your real conversations. The list is on the left (Listing groups,
// then Direct messages) and the one you pick opens on the right, like the design.
// Staging also shows the sample mockup under your real chats.
export default function MessagesPage({ searchParams }: PageProps<"/messages">) {
  return (
    <AppShell current="messages">
      <main>
        {showSamples ? (
          <>
            <MyChats />
            <Suspense>
              <MessagesMock />
            </Suspense>
          </>
        ) : (
          <div className="cm">
            <Suspense>
              <MessagesList />
            </Suspense>
            <section className="cm-chat" aria-label="Conversation">
              <Suspense fallback={null}>
                {searchParams.then((q) => (
                  <MessagesPane c={typeof q.c === "string" ? q.c : null} />
                ))}
              </Suspense>
            </section>
          </div>
        )}
      </main>
    </AppShell>
  );
}
