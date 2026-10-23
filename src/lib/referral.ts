import "server-only";
import { createHash } from "node:crypto";

// A short, stable code for each signup's share link. It's made from the email,
// so nothing new has to be stored, and the link doesn't reveal the email.
// scripts/referrals.mjs makes the same code to match friends to who sent them;
// keep the two in sync.
const SALT = "gable-referral-v1";

export function referralCode(email: string) {
  return createHash("sha256").update(SALT + email.trim().toLowerCase()).digest("hex").slice(0, 10);
}
