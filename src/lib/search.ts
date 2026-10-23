// Turns what someone typed into the chat (their first request plus any
// follow-ups on /search) into filters, then filters and ranks the SAMPLE
// listings. Server only: it reads
// ANTHROPIC_API_KEY, which must never reach the browser (no NEXT_PUBLIC_).
//
// Claude reads the request when it can. If the key is missing, the call fails,
// or it takes over 5 seconds, a keyword parser takes over, so /search always
// shows results.

import Anthropic from "@anthropic-ai/sdk";
import { SAMPLE_LISTINGS, type RoomType, type SampleListing } from "@/content/listings";
import { money, shortDate } from "./format";

const MODEL = "claude-haiku-5-5";
const TIMEOUT_MS = 5000;

// Areas the sample listings cover. Brooklyn matches Williamsburg and
// Prospect Heights, since their neighborhood strings end in ", Brooklyn".
const AREAS = ["Morningside Heights", "Upper West Side", "Harlem", "Hamilton Heights", "Midtown", "Brooklyn"];
const NEAR_COLUMBIA = ["Morningside Heights", "Upper West Side", "Harlem"];
const ROOM_TYPES: RoomType[] = ["private room", "studio", "shared"];

const SEASONS = {
  spring: ["2027-01-01", "2027-05-31"],
  summer: ["2027-06-01", "2027-08-31"],
  fall: ["2027-09-01", "2027-12-31"],
} as const;

export type SearchFilters = {
  maxPrice: number | null;
  minPrice: number | null;
  moveIn: string | null; // YYYY-MM-DD
  moveOut: string | null;
  furnished: boolean | null;
  roomType: RoomType | null;
  neighborhoods: string[];
  wantsRoommate: boolean | null;
};

export type SearchResult = {
  listing: SampleListing;
  misses: string[]; // what doesn't fit, only for the closest options
};

export type SearchResponse = {
  reply: string;
  results: SearchResult[];
  matched: boolean; // false when we're showing the closest options instead
  source: "claude" | "keywords";
};

const NO_FILTERS: SearchFilters = {
  maxPrice: null,
  minPrice: null,
  moveIn: null,
  moveOut: null,
  furnished: null,
  roomType: null,
  neighborhoods: [],
  wantsRoommate: null,
};

// ---------- Reading the request with Claude ----------

const SYSTEM = `You read housing requests for Gable, a home search for students in New York. Turn the request into search filters.

Rules:
- All listings are dated 2027. "Summer" means 2027-06-01 to 2027-08-31, "fall" or "fall semester" means 2027-09-01 to 2027-12-31, "spring" or "spring semester" means 2027-01-01 to 2027-05-31. Months with no year are in 2027. A month with no day starts on the 1st and ends on its last day.
- Prices are monthly rent in US dollars. "Under $1,600" sets maxPrice to 1600.
- neighborhoods must come from: ${AREAS.join(", ")}. "Near Columbia" or "near campus" means ${NEAR_COLUMBIA.join(", ")}. Williamsburg and Prospect Heights are Brooklyn; Hell's Kitchen and Murray Hill are Midtown.
- roomType is "studio", "private room" or "shared". Set it only when they name one. If they want to live with a friend or partner, leave roomType null unless they say studio or shared.
- wantsRoommate is true when they're looking together with a friend, partner or roommate.
- Use null (or an empty list) for anything they didn't mention. Don't guess.
- They may refine their search over several messages, like a conversation. Combine them into the one search they want now: a later message replaces an earlier one on the same point (a new budget, area or dates), adds anything new, and keeps everything else. "Cheaper" or "less expensive" with no number lowers the current budget by about 10%, rounded to the nearest $50 (leave it alone if there's no budget yet). "Anywhere" clears the neighborhoods; "furnished or not" clears furnished.
- reply: one or two short sentences that say back what they're looking for now, in plain everyday words, like a friend who knows housing. No hype, no exclamation marks, no words like "perfect", "safe" or "guaranteed". Don't mention how many places match or promise anything about them; the app adds that after your reply. If their latest message changed something, lead with the change. Examples: "You're after a furnished sublet for your summer internship, June to August, under $1,600." / "Now under $1,450, still furnished for June to August."`;

const nullable = (type: string) => ({ anyOf: [{ type }, { type: "null" }] });

const SCHEMA = {
  type: "object",
  properties: {
    maxPrice: nullable("number"),
    minPrice: nullable("number"),
    moveIn: nullable("string"),
    moveOut: nullable("string"),
    furnished: nullable("boolean"),
    roomType: { anyOf: [{ type: "string", enum: ROOM_TYPES }, { type: "null" }] },
    neighborhoods: { type: "array", items: { type: "string", enum: AREAS } },
    wantsRoommate: nullable("boolean"),
    reply: { type: "string" },
  },
  required: [
    "maxPrice",
    "minPrice",
    "moveIn",
    "moveOut",
    "furnished",
    "roomType",
    "neighborhoods",
    "wantsRoommate",
    "reply",
  ],
  additionalProperties: false,
};

// One message as is; a conversation as a numbered list, oldest first.
function conversation(messages: string[]) {
  if (messages.length === 1) return messages[0];
  const lines = messages.map((m, i) => `${i + 1}. ${m}`).join("\n");
  return `Everything they've said so far, oldest first. Later messages change or add to earlier ones.\n\n${lines}`;
}

async function readWithClaude(messages: string[]): Promise<{ filters: SearchFilters; reply: string | null } | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: TIMEOUT_MS, maxRetries: 0 });
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), TIMEOUT_MS);
  try {
    const response = await client.messages.create(
      {
        model: MODEL,
        max_tokens: 400,
        thinking: { type: "disabled" },
        output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA } },
        system: SYSTEM,
        messages: [{ role: "user", content: conversation(messages) }],
      },
      { signal: abort.signal },
    );
    if (response.stop_reason !== "end_turn") return null;
    const text = response.content.find((b) => b.type === "text")?.text;
    if (!text) return null;
    return validate(JSON.parse(text));
  } catch (error) {
    // Logged on the server only; the page falls back to keywords.
    console.warn("[search] Claude call failed, using keywords:", error instanceof Error ? error.message : error);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Structured outputs should already match SCHEMA; this still checks every
// field so a bad value means "no preference" instead of a crash.
function validate(raw: unknown): { filters: SearchFilters; reply: string | null } {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v > 0 ? Math.round(v) : null);
  const bool = (v: unknown) => (typeof v === "boolean" ? v : null);
  const date = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);

  let moveIn = date(o.moveIn);
  let moveOut = date(o.moveOut);
  if (moveIn && moveOut && moveIn > moveOut) moveIn = moveOut = null;

  const filters = normalize({
    maxPrice: num(o.maxPrice),
    minPrice: num(o.minPrice),
    moveIn,
    moveOut,
    furnished: bool(o.furnished),
    roomType: ROOM_TYPES.includes(o.roomType as RoomType) ? (o.roomType as RoomType) : null,
    neighborhoods: Array.isArray(o.neighborhoods) ? o.neighborhoods.filter((n) => AREAS.includes(n as string)) : [],
    wantsRoommate: bool(o.wantsRoommate),
  });
  const reply = typeof o.reply === "string" && o.reply.trim() ? o.reply.trim().slice(0, 300) : null;
  return { filters, reply };
}

// Two people won't fit in one private room, so drop that when they're
// looking together.
function normalize(f: SearchFilters): SearchFilters {
  if (f.wantsRoommate && f.roomType === "private room") f.roomType = null;
  if (f.maxPrice && f.minPrice && f.minPrice > f.maxPrice) f.minPrice = null;
  return f;
}

// ---------- Keyword fallback ----------

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function iso(month: number, day: number) {
  return `2027-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function lastDay(month: number) {
  return new Date(Date.UTC(2027, month + 1, 0)).getUTCDate();
}

export function readWithKeywords(q: string): SearchFilters {
  const text = q.toLowerCase();
  const f: SearchFilters = { ...NO_FILTERS, neighborhoods: [] };

  // Money: "under $1,600", "$1600 max", "at least $1,200", "$1.5k"
  const amount = (s: string, k?: string) => Math.round(parseFloat(s.replace(/,/g, "")) * (k ? 1000 : 1));
  for (const m of text.matchAll(/(under|below|less than|up to|max(?:imum)?|at most|over|above|at least|min(?:imum)?)?\s*\$\s?(\d[\d,]*(?:\.\d+)?)\s?(k)?/g)) {
    const value = amount(m[2], m[3]);
    if (value < 300) continue;
    if (m[1] && /over|above|at least|min/.test(m[1])) f.minPrice = value;
    else f.maxPrice = value;
  }
  if (!f.maxPrice) {
    const m = text.match(/(?:under|below|less than|up to|max(?:imum)?)\s*(\d[\d,]{2,})/);
    if (m) f.maxPrice = amount(m[1]);
  }

  if (/\bunfurnished\b/.test(text)) f.furnished = false;
  else if (/\bfurnished\b/.test(text)) f.furnished = true;

  f.wantsRoommate = /\b(friend|roommate|partner|boyfriend|girlfriend|two of us|me and)\b/.test(text) || null;

  if (/\bstudio\b/.test(text)) f.roomType = "studio";
  else if (/\bshared\b/.test(text)) f.roomType = "shared";
  else if (/\broom\b/.test(text)) f.roomType = "private room";

  // Month names win over seasons: "june 1 to aug 15", "from june to august"
  const months = [...text.matchAll(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?(?:\s+(\d{1,2})(?:st|nd|rd|th)?)?\b/g)]
    .map((m) => ({ month: MONTHS.indexOf(m[1].slice(0, 3)), day: m[2] ? Number(m[2]) : null }))
    // "may" is also a verb; only count it with a day or next to another month
    .filter((m, _, all) => m.month !== 4 || m.day || all.length > 1);
  if (months.length) {
    const [start, end] = [months[0], months[months.length - 1]];
    f.moveIn = iso(start.month, Math.min(start.day ?? 1, lastDay(start.month)));
    if (months.length > 1) f.moveOut = iso(end.month, Math.min(end.day ?? lastDay(end.month), lastDay(end.month)));
  } else {
    const season = /\bsummer\b/.test(text) ? "summer" : /\b(fall|autumn)\b/.test(text) ? "fall" : /\bspring\b/.test(text) ? "spring" : null;
    if (season) [f.moveIn, f.moveOut] = SEASONS[season];
  }

  const areas: [RegExp, string[]][] = [
    [/columbia|campus|barnard/, NEAR_COLUMBIA],
    [/morningside/, ["Morningside Heights"]],
    [/upper west|\buws\b/, ["Upper West Side"]],
    [/hamilton heights/, ["Hamilton Heights"]],
    [/\bharlem\b/, ["Harlem"]],
    [/midtown|hell'?s kitchen|murray hill|times sq/, ["Midtown"]],
    [/brooklyn|williamsburg|prospect heights/, ["Brooklyn"]],
  ];
  for (const [re, names] of areas) if (re.test(text)) f.neighborhoods.push(...names);
  f.neighborhoods = [...new Set(f.neighborhoods)];

  return normalize(f);
}

// ---------- Matching and ranking ----------

const DAY = 86_400_000;
const time = (isoDate: string) => Date.parse(`${isoDate}T00:00:00Z`);

// Share of the requested dates the listing is free for (0 to 1).
function coverage(l: SampleListing, f: SearchFilters) {
  if (!f.moveIn || !f.moveOut) return 1;
  const start = Math.max(time(l.availableFrom), time(f.moveIn));
  const end = Math.min(time(l.availableTo), time(f.moveOut));
  return Math.max(0, end - start + DAY) / (time(f.moveOut) - time(f.moveIn) + DAY);
}

type Check = { pass: boolean; miss: string };

// One check per filter they gave. A listing matches when every check passes.
function checks(l: SampleListing, f: SearchFilters): Check[] {
  const out: Check[] = [];
  const free = `Free ${shortDate(l.availableFrom)} – ${shortDate(l.availableTo)}`;

  if (f.moveIn && f.moveOut) {
    const c = coverage(l, f);
    out.push({ pass: c >= 0.8, miss: c > 0 ? `${free}, only part of your dates` : `${free}, outside your dates` });
  } else if (f.moveIn) {
    const pass = time(l.availableFrom) <= time(f.moveIn) + 14 * DAY && time(l.availableTo) > time(f.moveIn);
    out.push({ pass, miss: `${free}, not around your move-in` });
  }
  if (f.maxPrice) {
    const over = l.price - f.maxPrice;
    out.push({ pass: over <= 0, miss: `${money(over)} over your budget` });
  }
  if (f.minPrice) {
    out.push({ pass: l.price >= f.minPrice, miss: `Under your ${money(f.minPrice)} minimum` });
  }
  if (f.furnished !== null) {
    out.push({ pass: l.furnished === f.furnished, miss: l.furnished ? "Comes furnished" : "Not furnished" });
  }
  if (f.roomType) {
    const label = { "private room": "A private room", studio: "A studio", shared: "A shared room" };
    out.push({ pass: l.roomType === f.roomType, miss: `${label[l.roomType]}, not ${label[f.roomType].toLowerCase()}` });
  }
  if (f.neighborhoods.length) {
    const pass = f.neighborhoods.some((n) => l.neighborhood.toLowerCase().includes(n.toLowerCase()));
    out.push({ pass, miss: `In ${l.neighborhood}, not where you asked` });
  }
  if (f.wantsRoommate) {
    out.push({ pass: l.sleeps >= 2, miss: "Fits one person" });
  }
  return out;
}

function hasFilters(f: SearchFilters) {
  return checks(SAMPLE_LISTINGS[0], f).length > 0;
}

export function rank(f: SearchFilters): { results: SearchResult[]; matched: boolean } {
  const scored = SAMPLE_LISTINGS.map((listing) => {
    const cs = checks(listing, f);
    const passed = cs.filter((c) => c.pass);
    return {
      listing,
      misses: cs.filter((c) => !c.pass).map((c) => c.miss),
      score: passed.length / Math.max(cs.length, 1),
      cover: coverage(listing, f),
    };
  });
  // Best fit first: most checks passed, most of the dates covered, then cheapest.
  scored.sort((a, b) => b.score - a.score || b.cover - a.cover || a.listing.price - b.listing.price);

  const matches = scored.filter((s) => s.misses.length === 0);
  if (matches.length) return { results: matches.map(({ listing }) => ({ listing, misses: [] })), matched: true };
  return { results: scored.slice(0, 3).map(({ listing, misses }) => ({ listing, misses })), matched: false };
}

// ---------- Putting it together ----------

// Plain summary of the filters, used when Claude didn't write a reply.
function describe(f: SearchFilters) {
  const adjective = f.furnished ? "furnished " : f.furnished === false ? "unfurnished " : "";
  const noun = f.roomType === "studio" ? "studio" : f.roomType === "shared" ? "shared room" : f.roomType ? "room" : "place";
  // "a studio in Brooklyn", then dates and budget after commas
  const head = [`${/^[aeiou]/.test(adjective + noun) ? "an" : "a"} ${adjective}${noun}`];
  if (f.wantsRoommate) head.push("for you and a friend");
  if (f.neighborhoods.length) {
    head.push(f.neighborhoods.join(",") === NEAR_COLUMBIA.join(",") ? "near Columbia" : `in ${f.neighborhoods.join(" or ")}`);
  }
  const tail: string[] = [];
  if (f.moveIn && f.moveOut) tail.push(`from ${shortDate(f.moveIn)} to ${shortDate(f.moveOut)}`);
  else if (f.moveIn) tail.push(`from ${shortDate(f.moveIn)}`);
  if (f.maxPrice) tail.push(`under ${money(f.maxPrice)}`);
  if (f.minPrice) tail.push(`from ${money(f.minPrice)} up`);
  return `You're looking for ${[head.join(" "), ...tail].join(", ")}.`;
}

// Keyword fallback for a conversation: read each message in order, and let a
// later message replace what an earlier one said on the same point.
export function readConversationWithKeywords(messages: string[]): SearchFilters {
  let f: SearchFilters = { ...NO_FILTERS, neighborhoods: [] };
  for (const message of messages) {
    const next = readWithKeywords(message);
    const cheaper = !next.maxPrice && /\b(cheaper|less expensive|lower (the )?(price|budget))\b/i.test(message);
    f = {
      maxPrice: next.maxPrice ?? (cheaper && f.maxPrice ? Math.max(50, Math.round((f.maxPrice * 0.9) / 50) * 50) : f.maxPrice),
      minPrice: next.minPrice ?? f.minPrice,
      // Dates change as a pair.
      moveIn: next.moveIn ? next.moveIn : f.moveIn,
      moveOut: next.moveIn ? next.moveOut : f.moveOut,
      furnished: /furnished or not|don'?t care (if|about) (it'?s )?furnished/i.test(message) ? null : (next.furnished ?? f.furnished),
      roomType: next.roomType ?? f.roomType,
      neighborhoods: next.neighborhoods.length
        ? next.neighborhoods
        : /\b(anywhere|any (area|neighborhood))\b/i.test(message)
          ? []
          : f.neighborhoods,
      wantsRoommate: next.wantsRoommate ?? f.wantsRoommate,
    };
  }
  return normalize(f);
}

// `messages` is everything they've typed, oldest first: the first request
// plus any follow-ups ("cheaper", "only Harlem").
export async function search(messages: string[]): Promise<SearchResponse> {
  const asked = messages.length > 0;
  const fromClaude = asked ? await readWithClaude(messages) : null;
  const filters = fromClaude?.filters ?? (asked ? readConversationWithKeywords(messages) : NO_FILTERS);
  const source = fromClaude ? "claude" : "keywords";

  if (!hasFilters(filters)) {
    return {
      reply: asked
        ? "I couldn't pick out dates, a budget or an area from that, so here's everything. Try something like \"furnished room near Columbia, June to August, under $1,600.\""
        : "Tell me the place you want: your dates, your budget, the area. For now, here's everything.",
      results: SAMPLE_LISTINGS.map((listing) => ({ listing, misses: [] })),
      matched: true,
      source,
    };
  }

  const { results, matched } = rank(filters);
  const said = fromClaude?.reply ?? describe(filters);
  const count = results.length === 1 ? "1 place fits" : `${results.length} places fit`;
  const reply = matched
    ? `${said} ${count}.`
    : `${said} Nothing here fits all of that yet, so here are the 3 closest, with what's different about each.`;
  return { reply, results, matched, source };
}
