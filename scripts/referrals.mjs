// Lists who brought whom: every signup that came through a friend's share link
// (utm_campaign=ref_<code>), next to the person whose code it is. Use it to
// match friends to sublets for two.
//
//   npm run referrals            (needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local)
//
// The code must match src/lib/referral.ts.
import { createHash } from "node:crypto";

const SALT = "gable-referral-v1";
const code = (email) => createHash("sha256").update(SALT + email.trim().toLowerCase()).digest("hex").slice(0, 10);

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (for example in .env.local).");
  process.exit(1);
}

const res = await fetch(`${url}/rest/v1/signups?select=email,utm_campaign,created_at&order=created_at.asc`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});
if (!res.ok) {
  console.error(`Supabase said ${res.status}: ${await res.text()}`);
  process.exit(1);
}
const signups = await res.json();

const byCode = new Map(signups.map((s) => [code(s.email), s.email]));
const pairs = new Map();
for (const s of signups) {
  const m = /^ref_([a-f0-9]{10})$/.exec(s.utm_campaign ?? "");
  if (!m) continue;
  const from = byCode.get(m[1]) ?? `unknown code ${m[1]}`;
  if (!pairs.has(from)) pairs.set(from, []);
  pairs.get(from).push(`${s.email} (${s.created_at.slice(0, 10)})`);
}

if (!pairs.size) {
  console.log(`No referred signups yet (${signups.length} signups in total).`);
} else {
  for (const [from, friends] of pairs) console.log(`${from}\n  brought: ${friends.join(", ")}`);
}
