import "server-only";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

export type Signup = {
  email: string;
  looking_for: string | null;
  page: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
};

// Saves a waitlist signup. With SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set,
// it inserts into the `signups` table over Supabase's REST API. Without them,
// local dev appends to .data/signups.jsonl so the form works before Supabase
// exists. Production without Supabase fails loudly instead of dropping emails.
export async function saveSignup(signup: Signup): Promise<void> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && key) {
    const res = await fetch(`${url}/rest/v1/signups`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(signup),
    });
    if (!res.ok) {
      throw new Error(`Supabase insert failed: ${res.status} ${await res.text()}`);
    }
    return;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Signups are not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  }

  const dir = path.join(process.cwd(), ".data");
  await mkdir(dir, { recursive: true });
  await appendFile(path.join(dir, "signups.jsonl"), JSON.stringify(signup) + "\n");
}
