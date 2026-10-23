"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "@/components/landing/icons";
import { Photo } from "@/components/landing/Photo";
import type { SampleListing } from "@/content/listings";
import { nightsBetween, stayCost } from "@/lib/booking";
import { money, shortDate } from "@/lib/format";

// The booking step: dates inside the listing's availability, how many people,
// a note to the lister, then confirm. Demo only: nothing is charged or sent.
export function BookingForm({ l }: { l: SampleListing }) {
  const router = useRouter();
  const [from, setFrom] = useState(l.availableFrom);
  const [to, setTo] = useState(l.availableTo);
  const [people, setPeople] = useState(1);
  const [note, setNote] = useState(
    `Hi ${l.lister.firstName}! I'm a student looking for a sublet for these dates. I'm quiet, tidy and happy to hop on a quick video call.`,
  );
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");

  const nights = nightsBetween(from, to);
  const datesOk = from >= l.availableFrom && to <= l.availableTo && nights >= 7;
  const cost = stayCost(l.price, from, to);

  function confirm(e: React.FormEvent) {
    e.preventDefault();
    if (!datesOk) {
      setError(`Pick dates between ${shortDate(l.availableFrom)} and ${shortDate(l.availableTo)}, at least a week long.`);
      return;
    }
    if (!agree) {
      setError("Please agree to the sublease terms to continue.");
      return;
    }
    setError("");
    router.push(`/booked/${l.id}?from=${from}&to=${to}&people=${people}`);
  }

  return (
    <form className="book-grid" onSubmit={confirm}>
      <div>
        <h1>Request to book</h1>

        <div className="book-section">
          <h2>Your dates</h2>
          <p className="hint">
            {l.lister.firstName}&apos;s place is free {shortDate(l.availableFrom)} – {shortDate(l.availableTo)}.
          </p>
          <div className="field-row">
            <div className="field">
              <label htmlFor="from">Move in</label>
              <input id="from" type="date" value={from} min={l.availableFrom} max={l.availableTo} onChange={(e) => setFrom(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="to">Move out</label>
              <input id="to" type="date" value={to} min={from} max={l.availableTo} onChange={(e) => setTo(e.target.value)} required />
            </div>
          </div>
        </div>

        <div className="book-section">
          <h2>Who&apos;s moving in</h2>
          <div className="field-row">
            <div className="field">
              <label htmlFor="people">People</label>
              <select id="people" value={people} onChange={(e) => setPeople(Number(e.target.value))}>
                {Array.from({ length: l.sleeps }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n === 1 ? "Just me" : `${n} people`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="book-section">
          <h2>Message to {l.lister.firstName}</h2>
          <p className="hint">Say who you are and why you&apos;re in the city. Tenants pick the person they trust most.</p>
          <div className="field" style={{ marginTop: 12 }}>
            <label htmlFor="note" className="sr-only">
              Message
            </label>
            <textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={600} />
          </div>
        </div>

        <div className="book-section">
          <h2>Payment</h2>
          <div className="pay-option">
            <span className="card">DEMO</span>
            <div>
              <b>Demo card •••• 4242</b>
              <small>For the demo only. No real card, no real charge.</small>
            </div>
          </div>
          <div className="safe-note">
            <ShieldCheck size={18} />
            <span>
              You pay through Gable, never Zelle, Venmo or wire. Your deposit is held by Gable until you move in, and rent goes
              to {l.lister.firstName} monthly after that.
            </span>
          </div>
        </div>

        <label className="agree">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span>
            I agree to the sublease terms: the dates above, the rent and deposit shown, and the house rules {l.lister.firstName}{" "}
            shares before move-in.
          </span>
        </label>
        {error && (
          <p className="form-err" role="alert">
            {error}
          </p>
        )}
        <button className="btn cta-full" type="submit">
          Confirm booking
        </button>
        <p className="under-cta">Demo booking: no money moves and no message is sent.</p>
      </div>

      <aside className="summary" aria-label="Booking summary">
        <div className="summary-head">
          <Photo id={l.photo.id} width={300} alt={l.photo.alt} />
          <div>
            <b>{l.title}</b>
            <small>
              Sublet · {l.crossStreets} · hosted by {l.lister.firstName}
            </small>
          </div>
        </div>
        <div className="lines">
          <div className="line">
            <span>Dates</span>
            <span>{datesOk ? `${shortDate(from)} – ${shortDate(to)}` : "Pick your dates"}</span>
          </div>
          <div className="line">
            <span>Length</span>
            <span>{datesOk ? `${nights} nights (about ${cost.months.toFixed(1)} months)` : "—"}</span>
          </div>
          <div className="line">
            <span>Rent</span>
            <span>{money(l.price)} / month</span>
          </div>
          <div className="line">
            <span>Rent for your stay</span>
            <span>{datesOk ? money(cost.rent) : "—"}</span>
          </div>
          <div className="line total">
            <span>Due today</span>
            <span>{money(cost.deposit)}</span>
          </div>
          <div className="line">
            <span>Security deposit, held by Gable until you move in</span>
            <span />
          </div>
        </div>
      </aside>
    </form>
  );
}
