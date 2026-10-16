"use server";

import { redirect } from "next/navigation";
import { saveSignup } from "@/lib/signups";

export type JoinState = { error: string | null };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function field(formData: FormData, name: string, max: number) {
  const value = String(formData.get(name) ?? "").trim().slice(0, max);
  return value || null;
}

export async function joinWaitlist(
  _prev: JoinState,
  formData: FormData,
): Promise<JoinState> {
  const email = field(formData, "email", 254)?.toLowerCase();
  if (!email || !EMAIL.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  const page = field(formData, "page", 40) ?? "home";

  try {
    await saveSignup({
      email,
      looking_for: field(formData, "looking_for", 500),
      page,
      utm_source: field(formData, "utm_source", 100),
      utm_medium: field(formData, "utm_medium", 100),
      utm_campaign: field(formData, "utm_campaign", 100),
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    return { error: "Something went wrong on our end. Please try again." };
  }

  redirect(`/thanks?page=${encodeURIComponent(page)}`);
}
