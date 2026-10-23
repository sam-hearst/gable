"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { SampleListing } from "@/content/listings";
import { bookingRef, isIsoDate, stayCost } from "@/lib/booking";
import { money, shortDate } from "@/lib/format";

// The confirmation: what was booked, a reference, and what happens next. The
// dates come from the booking step's URL; anything off falls back to the
// listing's full availability.
export function BookedDetails({ l }: { l: SampleListing }) {
  const params = useSearchParams();
  const qFrom = params.get("from");
  const qTo = params.get("to");
  const from = isIsoDate(qFrom) && qFrom >= l.availableFrom ? qFrom : l.availableFrom;
  const to = isIsoDate(qTo) && qTo <= l.availableTo && qTo > from ? qTo : l.availableTo;
  const people = Math.min(Math.max(Number(params.get("people")) || 1, 1), l.sleeps);
  const cost = stayCost(l.price, from, to);
  const ref = bookingRef(l.id, from, to, String(people));

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Gable//Demo booking//EN",
    "BEGIN:VEVENT",
    `UID:${ref}@gable.fit`,
    `DTSTART;VALUE=DATE:${from.replaceAll("-", "")}`,
    `DTEND;VALUE=DATE:${to.replaceAll("-", "")}`,
    `SUMMARY:Sublet: ${l.title}`,
    `LOCATION:${l.crossStreets}, ${l.neighborhood}, New York`,
    `DESCRIPTION:Gable demo booking ${ref}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return (
    <>
      <div className="booked-hero">
        <div className="booked-check" aria-hidden="true">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h1>Booked.</h1>
        <p className="sub">
          Your sublet on {l.crossStreets} is yours from {shortDate(from)} to {shortDate(to)}. We&apos;ve let{" "}
          {l.lister.firstName} know, and your deposit is held by Gable until you move in.
        </p>
      </div>

      <div className="booked-card">
        <div className="lines" style={{ marginTop: 0 }}>
          <div className="line">
            <span>Booking</span>
            <span>{ref}</span>
          </div>
          <div className="line">
            <span>Sublet</span>
            <span>{l.title}</span>
          </div>
          <div className="line">
            <span>Dates</span>
            <span>
              {shortDate(from)} – {shortDate(to)} · {cost.nights} nights
            </span>
          </div>
          <div className="line">
            <span>Who</span>
            <span>{people === 1 ? "Just you" : `${people} people`}</span>
          </div>
          <div className="line">
            <span>Rent</span>
            <span>{money(l.price)} / month, about {money(cost.rent)} for your stay</span>
          </div>
          <div className="line total">
            <span>Paid today (deposit, held by Gable)</span>
            <span>{money(cost.deposit)}</span>
          </div>
        </div>
      </div>

      <div className="next-steps">
        <h2>What happens next</h2>
        <ol>
          <li>
            {l.lister.firstName} confirms within a day ({l.replySpeed.toLowerCase()}).
          </li>
          <li>You both sign the sublease in Gable, with your dates, rent and deposit.</li>
          <li>Pick up the keys on {shortDate(from)}. Your deposit stays with Gable until you&apos;ve moved in.</li>
        </ol>
      </div>

      <div className="booked-actions">
        <a className="btn" href={`data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`} download="gable-sublet.ics">
          Add to calendar
        </a>
        <Link className="btn btn-secondary" href={`/listing/${l.id}`}>
          View the listing
        </Link>
        <Link className="btn btn-secondary" href="/search">
          Back to search
        </Link>
      </div>
    </>
  );
}
