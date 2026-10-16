import { saveSignup } from "@/lib/signups";

// Waitlist signups from the static pages in public/ (see public/app.js).
// Body is JSON: { email, source, mode?, request?, utm_source?, utm_medium?, utm_campaign? }.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value: unknown, max: number) {
  const s = typeof value === "string" ? value.trim().slice(0, max) : "";
  return s || null;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = text(body.email, 254)?.toLowerCase();
  if (!email || !EMAIL.test(email)) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  // "summer/intern": which landing page, plus the toggle the visitor picked.
  const source = text(body.source, 24) ?? "home";
  const mode = text(body.mode, 15);
  const page = mode ? `${source}/${mode}` : source;

  try {
    await saveSignup({
      email,
      looking_for: text(body.request, 500),
      page,
      utm_source: text(body.utm_source, 100),
      utm_medium: text(body.utm_medium, 100),
      utm_campaign: text(body.utm_campaign, 100),
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Something went wrong on our end. Please try again." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
