import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";
import { CircleCheck } from "@/components/landing/icons";
import { Photo } from "@/components/landing/Photo";
import { findListing, SAMPLE_LISTINGS } from "@/content/listings";
import { money, shortDate } from "@/lib/format";
import "@/components/booking/booking.css";

const ROOM_LABEL = { "private room": "Private room", studio: "Studio", shared: "Shared room" };

export function generateStaticParams() {
  return SAMPLE_LISTINGS.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: PageProps<"/listing/[id]">): Promise<Metadata> {
  const l = findListing((await params).id);
  return { title: l ? `${l.title} | Gable` : "Sublet | Gable" };
}

// One sublet, with everything we checked about it and the way in to booking.
// Demo site only (src/proxy.ts sends the waitlist site home).
export default async function ListingPage({ params }: PageProps<"/listing/[id]">) {
  const l = findListing((await params).id);
  if (!l) notFound();

  return (
    <>
      <SiteHeader current="none" />
      <main>
        <section className="section">
          <div className="wrap">
            <Link className="back-link" href="/search">
              &larr; Back to results
            </Link>
            <div className="demo-note">
              <span className="badge">
                <span className="dot" />
                Sample listing
              </span>
              <p>A sample sublet for our demo, not a real listing yet.</p>
            </div>

            <div className="listing-detail">
              <div className="listing-photo">
                <Photo id={l.photo.id} width={1200} alt={l.photo.alt} />
                <span className="badge">
                  <span className="dot" />
                  {shortDate(l.availableFrom)} – {shortDate(l.availableTo)}
                </span>
              </div>

              <div className="listing-info">
                <div className="eyebrow">
                  Sublet · {l.neighborhood}
                </div>
                <h1>{l.title}</h1>
                <div className="price">
                  {money(l.price)} <span>/ month</span>
                </div>
                <div className="facts">
                  <span className="fact">{ROOM_LABEL[l.roomType]}</span>
                  <span className="fact">{l.furnished ? "Furnished" : "Unfurnished"}</span>
                  <span className="fact">Sleeps {l.sleeps}</span>
                  <span className="fact">{l.crossStreets}</span>
                  <span className="fact">{l.subway}</span>
                </div>
                <p className="good-fit">Good for: {l.goodFor}</p>

                <div className="check-box">
                  <div className="k">What we checked</div>
                  <ul>
                    {l.checked.map((c) => (
                      <li key={c}>
                        <CircleCheck size={16} />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="lister">
                  <span className="av">{l.lister.firstName[0]}</span>
                  <div>
                    <b>
                      {l.lister.firstName}, {l.lister.school}
                    </b>
                    <small>Tenant on the lease · {l.replySpeed}</small>
                  </div>
                </div>

                <Link className="btn cta-full" href={`/book/${l.id}`}>
                  Request to book
                </Link>
                <p className="under-cta">You won&apos;t pay anything until you confirm.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter current="/listing" />
    </>
  );
}
