import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BookedDetails } from "@/components/booking/BookedDetails";
import { findListing, SAMPLE_LISTINGS } from "@/content/listings";
import "@/components/booking/booking.css";

export const metadata: Metadata = { title: "Booked | Gable", robots: { index: false } };

export function generateStaticParams() {
  return SAMPLE_LISTINGS.map((l) => ({ id: l.id }));
}

// Booking confirmation. Demo site only (src/proxy.ts).
export default async function BookedPage({ params }: PageProps<"/booked/[id]">) {
  const l = findListing((await params).id);
  if (!l) notFound();

  return (
    <AppShell current="none">
      <main>
        <section className="section">
          <div className="wrap">
            <div className="demo-note" style={{ justifyContent: "center" }}>
              <span className="badge">
                <span className="dot" />
                Demo booking
              </span>
              <p>No real payment was made and no message was sent.</p>
            </div>
            <Suspense>
              <BookedDetails l={l} />
            </Suspense>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
