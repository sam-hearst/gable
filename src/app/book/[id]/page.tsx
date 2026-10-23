import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/booking/BookingForm";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";
import { findListing, SAMPLE_LISTINGS } from "@/content/listings";
import "@/components/booking/booking.css";

export const metadata: Metadata = { title: "Request to book | Gable" };

export function generateStaticParams() {
  return SAMPLE_LISTINGS.map((l) => ({ id: l.id }));
}

// Booking step for one sublet. Demo site only (src/proxy.ts).
export default async function BookPage({ params }: PageProps<"/book/[id]">) {
  const l = findListing((await params).id);
  if (!l) notFound();

  return (
    <>
      <SiteHeader current="none" />
      <main>
        <section className="section">
          <div className="wrap">
            <Link className="back-link" href={`/listing/${l.id}`}>
              &larr; Back to the listing
            </Link>
            <div className="demo-note">
              <span className="badge">
                <span className="dot" />
                Demo booking
              </span>
              <p>This shows how booking will work. No real payment is taken and nothing is sent to the lister.</p>
            </div>
            <BookingForm l={l} />
          </div>
        </section>
      </main>
      <SiteFooter current="/book" />
    </>
  );
}
