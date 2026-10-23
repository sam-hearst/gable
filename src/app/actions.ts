"use server";

import { referralCode } from "@/lib/referral";
import { saveSignup } from "@/lib/signups";

export type SignupInput = {
  email: string;
  source: string; // which page: home | verified | summer | sublet | blog | search
  mode?: string; // the hero toggle the visitor picked, e.g. "intern"
  request?: string; // what they typed in the chat box
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

// `ref` is the signup's own share code, for the link on /thanks.
export type SignupResult = { ok: true; ref: string } | { ok: false; error: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value: unknown, max: number) {
  const s = typeof value === "string" ? value.trim().slice(0, max) : "";
  return s || null;
}

export async function joinWaitlist(input: SignupInput): Promise<SignupResult> {
  const email = text(input.email, 254)?.toLowerCase();
  if (!email || !EMAIL.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const source = text(input.source, 24) ?? "home";
  const mode = text(input.mode, 15);

  try {
    await saveSignup({
      email,
      looking_for: text(input.request, 500),
      page: mode ? `${source}/${mode}` : source,
      utm_source: text(input.utm_source, 100),
      utm_medium: text(input.utm_medium, 100),
      utm_campaign: text(input.utm_campaign, 100),
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    return { ok: false, error: "Something went wrong saving your email. Please try again." };
  }
  return { ok: true, ref: referralCode(email) };
}
