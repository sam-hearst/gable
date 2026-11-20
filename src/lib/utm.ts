// Remembers which ad or link brought a visitor (the utm_ tags in the link), so
// it can be saved on their account when they sign up. That way we can count
// sign-ups per campaign in Supabase, without depending on Google Analytics.
// Browser only. Everything is wrapped in try/catch because storage can be blocked.

const KEY = "gable:utm";
const FIELDS = ["utm_source", "utm_medium", "utm_campaign"] as const;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // a week is plenty for a sign-up

export type Utm = Partial<Record<(typeof FIELDS)[number], string>>;

// Call on every page load: when the link has utm_ tags, remember them.
export function rememberUtm() {
  try {
    const params = new URLSearchParams(window.location.search);
    const found: Utm = {};
    for (const f of FIELDS) {
      const v = params.get(f)?.trim().toLowerCase().slice(0, 100);
      if (v) found[f] = v;
    }
    if (Object.keys(found).length === 0) return;
    window.localStorage.setItem(KEY, JSON.stringify({ ...found, at: Date.now() }));
  } catch {
    // Storage blocked: the sign-up just won't carry a campaign.
  }
}

// The tags to save on the account: the ones remembered in the last week.
export function savedUtm(): Utm {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const d = JSON.parse(raw) as Utm & { at?: number };
    if (!d.at || Date.now() - d.at > MAX_AGE_MS) return {};
    const out: Utm = {};
    for (const f of FIELDS) if (typeof d[f] === "string") out[f] = d[f];
    return out;
  } catch {
    return {};
  }
}
