const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "2027-06-01" -> "Jun 1". Parsed by hand so the time zone can't shift the day.
export function shortDate(iso: string) {
  const [, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}

export const money = (n: number) => `$${n.toLocaleString("en-US")}`;
