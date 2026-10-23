// Booking math for the demo flow (listing -> book -> booked). Dates are
// YYYY-MM-DD strings, handled in UTC so a time zone can't shift a day.

const DAY = 24 * 60 * 60 * 1000;
const utc = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};

export const isIsoDate = (s: string | null): s is string => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);

export function nightsBetween(from: string, to: string) {
  return Math.round((utc(to) - utc(from)) / DAY);
}

// Rent for the stay, prorated by day from the monthly price, plus a one-month
// deposit that Gable holds until move-in.
export function stayCost(monthly: number, from: string, to: string) {
  const nights = Math.max(0, nightsBetween(from, to));
  const months = nights / 30;
  return { nights, months, rent: Math.round(monthly * months), deposit: monthly };
}

// A short, stable reference like "GB-7K2Q9" for the confirmation page.
export function bookingRef(...parts: string[]) {
  let h = 2166136261;
  for (const c of parts.join("|")) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  return `GB-${h.toString(36).toUpperCase().padStart(5, "0").slice(0, 5)}`;
}
