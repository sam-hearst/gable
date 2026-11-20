// Paste-to-list: a student pastes the sublet post they already wrote
// (Facebook, Instagram, a group chat) and Claude pulls out the fields the
// "List your room" form needs. Server only (see src/lib/claude.ts).
//
// Nothing is saved here. The form is prefilled and the student checks and
// edits every field before sending it. Anything the post doesn't say stays
// blank: Claude is told not to guess, and every field is checked again below.

import type { RoomType } from "@/content/listings";
import { askClaudeForJson } from "./claude";
import { NEIGHBORHOODS, ROOM_TYPES, nycToday } from "./student-listing-fields";

export const MAX_POST_CHARS = 4000;
const TIMEOUT_MS = 8000;

export type PostFields = {
  availableFrom: string | null; // YYYY-MM-DD
  availableTo: string | null;
  price: number | null; // monthly rent, USD
  neighborhood: string | null; // one of NEIGHBORHOODS
  roomType: RoomType | null;
  furnished: boolean | null;
  address: string | null;
  description: string | null;
};

const system = (today: string) => `You read sublet posts that students wrote for Facebook, Instagram or a group chat, and pull out the details for a listing form on Gable, a sublet search for students in New York.

Today is ${today}.

The one rule that matters most: only fill a field when the post says it. If the post doesn't state something, use null. Never guess, never fill in a typical value, never work one field out from another (no neighborhood from an address, no "furnished" because it mentions a bed).

Fields:
- availableFrom, availableTo: when the room is free, as month (1 to 12), day and year, each exactly as the post says it. Leave day null if they give only a month ("June to August"), and year null unless they write the year. Seasons and vague times ("this summer", "spring semester") are not dates: use null. If they give only one date, fill only that one.
- price: the monthly rent in US dollars, as a number. If they only give a weekly, nightly or total price, use null.
- neighborhood: only if they name the area, and only one of: ${NEIGHBORHOODS.join(", ")}. "UWS" is Upper West Side, "Morningside" is Morningside Heights, "Williamsburg" is "Williamsburg, Brooklyn", "Prospect Heights" is "Prospect Heights, Brooklyn". "Near Columbia" alone is not a neighborhood: use null. Any other area: null.
- roomType: "private room", "studio" or "shared" (a room shared with someone else), only if they say which. Their own room in an apartment with roommates ("my room in a 3br") is a private room.
- furnished: true or false, only if they say so.
- address: the street address or cross streets exactly as written ("W 113th & Broadway"), or null.
- description: the post in their own words, ready for the listing. Keep their wording and line breaks; don't rewrite, add to or polish it. Remove phone numbers, emails, social handles, payment handles (Venmo, Zelle, Cash App) and "DM me" lines, since renters reach them through Gable. Null if nothing is left.`;

const nullable = (type: string) => ({ anyOf: [{ type }, { type: "null" }] });

// A date as the post wrote it. The year is worked out in code, not by Claude.
const POST_DATE = {
  anyOf: [
    {
      type: "object",
      properties: { month: { type: "integer" }, day: nullable("integer"), year: nullable("integer") },
      required: ["month", "day", "year"],
      additionalProperties: false,
    },
    { type: "null" },
  ],
};

const SCHEMA = {
  type: "object",
  properties: {
    availableFrom: POST_DATE,
    availableTo: POST_DATE,
    price: nullable("number"),
    neighborhood: { anyOf: [{ type: "string", enum: NEIGHBORHOODS }, { type: "null" }] },
    roomType: { anyOf: [{ type: "string", enum: ROOM_TYPES }, { type: "null" }] },
    furnished: nullable("boolean"),
    address: nullable("string"),
    description: nullable("string"),
  },
  required: ["availableFrom", "availableTo", "price", "neighborhood", "roomType", "furnished", "address", "description"],
  additionalProperties: false,
};

// Returns null when Claude isn't set up, fails or takes over 8 seconds.
export async function readPost(post: string): Promise<PostFields | null> {
  const text = post.trim().slice(0, MAX_POST_CHARS);
  if (!text) return null;
  const today = nycToday();
  const raw = await askClaudeForJson({
    system: system(today),
    schema: SCHEMA,
    content: text,
    timeoutMs: TIMEOUT_MS,
    maxTokens: 1500,
    label: "[paste-to-list]",
  });
  return raw ? validate(raw, today) : null;
}

// Structured outputs should already match SCHEMA; this checks each field
// again so a bad value becomes a blank field, never a wrong one. The rules
// match what the form itself accepts.
function validate(raw: unknown, today: string): PostFields {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const str = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);
  // The start date is the next one on or after today; the end date the next
  // one after the start. A past or impossible date stays blank.
  const availableFrom = resolveDate(o.availableFrom, "start", today);
  let availableTo = resolveDate(o.availableTo, "end", availableFrom ?? today);
  if (availableTo && availableTo <= (availableFrom ?? today)) availableTo = null;

  const price = typeof o.price === "number" && Number.isFinite(o.price) && o.price >= 300 && o.price <= 10000 ? Math.round(o.price) : null;
  const description = str(o.description, 1000);

  return {
    availableFrom,
    availableTo,
    price,
    neighborhood: NEIGHBORHOODS.includes(o.neighborhood as string) ? (o.neighborhood as string) : null,
    roomType: ROOM_TYPES.includes(o.roomType as RoomType) ? (o.roomType as RoomType) : null,
    furnished: typeof o.furnished === "boolean" ? o.furnished : null,
    address: str(o.address, 80),
    // The form needs at least 20 characters; shorter is no help.
    description: description && description.length >= 20 ? description : null,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");
const lastDay = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate();

const DAY_MS = 86_400_000;
const daysBetween = (a: string, b: string) => (Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY_MS;

// {month: 6, day: null, year: null} -> "2027-06-01" (start) or "2027-06-30"
// (end). With no year, it's this year's date when that's on or after `after`
// (YYYY-MM-DD); next year's when this year's is long past ("June", read in
// November); and blank when it's only just past ("Nov 1", read on Nov 20),
// since rolling that into next year would be a believable wrong date.
export function resolveDate(v: unknown, side: "start" | "end", after: string): string | null {
  if (!v || typeof v !== "object") return null;
  const { month, day, year } = v as { month?: unknown; day?: unknown; year?: unknown };
  if (typeof month !== "number" || !Number.isInteger(month) || month < 1 || month > 12) return null;
  const toIso = (y: number) => {
    const last = lastDay(y, month);
    const d = typeof day === "number" ? day : side === "start" ? 1 : last;
    if (!Number.isInteger(d) || d < 1 || d > last) return null;
    return `${y}-${pad(month)}-${pad(d)}`;
  };
  const from = Number(after.slice(0, 4));
  if (typeof year === "number") {
    const y = year < 100 ? 2000 + year : year; // "6/1/27"
    if (!Number.isInteger(y) || y < from || y > from + 2) return null;
    const iso = toIso(y);
    return iso && iso >= after ? iso : null;
  }
  const thisYear = toIso(from);
  if (thisYear && thisYear >= after) return thisYear;
  if (thisYear && daysBetween(thisYear, after) < 60) return null;
  const nextYear = toIso(from + 1);
  return nextYear && nextYear >= after ? nextYear : null;
}
