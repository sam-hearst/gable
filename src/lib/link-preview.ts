import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import Anthropic from "@anthropic-ai/sdk";
import type { RoomType } from "@/content/listings";
import { sourceName, type LinkPreview } from "./external-listing-fields";
import { NEIGHBORHOODS, ROOM_TYPES } from "./student-listing-fields";

// Reads the link preview of ONE page someone pasted on /share-a-listing, the
// way a chat app does: the page's Open Graph tags (og:title, og:image,
// og:description), which sites publish so their links look good when shared.
// No crawling: one request per pasted link, nothing else on the site is read.
// Then Claude (or a keyword fallback) guesses the search fields from that
// preview for the sharer to check.
//
// Safety: only public http(s) addresses on the normal ports. Every hop of a
// redirect is checked again, so a link can't point Gable's server at itself or
// at a private network. Pages are cut off at 1 MB and 5 seconds.

const FETCH_TIMEOUT_MS = 5000;
const MAX_BYTES = 1_000_000;
const MAX_REDIRECTS = 3;
const USER_AGENT = "GableLinkPreview/1.0 (+https://www.gable.fit; link previews for links our users share)";

const MODEL = "claude-haiku-5-5";
const CLAUDE_TIMEOUT_MS = 6000;

// ---------- Address checks ----------

function privateV4(ip: string) {
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 192 && b === 0) || (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function privateV6(ip: string) {
  const v = ip.toLowerCase();
  if (v === "::" || v === "::1") return true;
  const mapped = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return privateV4(mapped[1]);
  return /^(fc|fd|fe8|fe9|fea|feb|ff)/.test(v);
}

const isPrivate = (ip: string) => (isIP(ip) === 4 ? privateV4(ip) : privateV6(ip));

// Throws a plain message the form can show.
async function assertPublic(url: URL) {
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Paste a link that starts with https://.");
  if (url.username || url.password) throw new Error("That link has a login in it. Paste the plain listing link.");
  if (url.port && url.port !== "80" && url.port !== "443") throw new Error("That link uses an unusual port, so we can't read it.");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) throw new Error("That isn't a public website.");
  const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true }).catch(() => []);
  if (!addresses.length) throw new Error("We couldn't find that website. Check the link.");
  if (addresses.some((a) => isPrivate(a.address))) throw new Error("That isn't a public website.");
}

// ---------- Fetching ----------

async function fetchPage(start: string): Promise<{ html: string; finalUrl: string }> {
  let url = new URL(start);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublic(url);
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        redirect: "manual",
        signal: abort.signal,
        headers: { "user-agent": USER_AGENT, accept: "text/html,application/xhtml+xml" },
      });
      if (res.status >= 300 && res.status < 400) {
        const next = res.headers.get("location");
        if (!next) throw new Error("That page sent us nowhere.");
        url = new URL(next, url);
        continue;
      }
      if (!res.ok) throw new Error(`That page answered with an error (${res.status}). It may be private or removed.`);
      const type = res.headers.get("content-type") ?? "";
      if (!type.includes("html")) throw new Error("That link isn't a web page.");
      // Read at most MAX_BYTES; the preview tags are in the <head>.
      const reader = res.body?.getReader();
      if (!reader) return { html: "", finalUrl: url.toString() };
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (size < MAX_BYTES) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        size += value.byteLength;
      }
      await reader.cancel().catch(() => {});
      return { html: new TextDecoder().decode(Buffer.concat(chunks)), finalUrl: url.toString() };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") throw new Error("That page took too long to answer.");
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error("That link redirected too many times.");
}

// ---------- Reading the preview tags ----------

const decode = (s: string) =>
  s
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ").trim();

function meta(html: string, names: string[]): string | null {
  const head = html.slice(0, 200_000);
  for (const name of names) {
    // <meta property="og:title" content="..."> in either attribute order
    const a = new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]*content=["']([^"']*)["']`, "i").exec(head);
    const b = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${name}["']`, "i").exec(head);
    const v = a?.[1] ?? b?.[1];
    if (v && decode(v)) return decode(v);
  }
  return null;
}

export function readPreviewTags(html: string, pageUrl: string) {
  const title = meta(html, ["og:title", "twitter:title"]) ?? decode(/<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1] ?? "");
  const description = meta(html, ["og:description", "twitter:description", "description"]) ?? "";
  let imageUrl: string | null = null;
  const image = meta(html, ["og:image:secure_url", "og:image", "twitter:image"]);
  if (image) {
    try {
      const abs = new URL(image, pageUrl);
      if (abs.protocol === "https:") imageUrl = abs.toString().slice(0, 600);
    } catch {}
  }
  return { title: title.slice(0, 120), description: description.slice(0, 300), imageUrl };
}

// ---------- Guessing the search fields ----------

type Guess = LinkPreview["guess"];
const NO_GUESS: Guess = {
  price: null, availableFrom: null, availableTo: null, neighborhood: null, roomType: null, furnished: null, sleeps: null,
};

const nullable = (type: string) => ({ anyOf: [{ type }, { type: "null" }] });
const SCHEMA = {
  type: "object",
  properties: {
    price: nullable("number"),
    availableFrom: nullable("string"),
    availableTo: nullable("string"),
    neighborhood: { anyOf: [{ type: "string", enum: NEIGHBORHOODS }, { type: "null" }] },
    roomType: { anyOf: [{ type: "string", enum: ROOM_TYPES }, { type: "null" }] },
    furnished: nullable("boolean"),
    sleeps: nullable("number"),
  },
  required: ["price", "availableFrom", "availableTo", "neighborhood", "roomType", "furnished", "sleeps"],
  additionalProperties: false,
};

const SYSTEM = `You read the link preview of one NYC sublet listing (its title, description and URL) and pull out facts for a search index. Only use what the text says; never guess. Use null for anything not stated.
- price: monthly rent in US dollars, a whole number. If a weekly price is given, leave it null.
- availableFrom / availableTo: YYYY-MM-DD. Assume the next occurrence of a month after today (${new Date().toISOString().slice(0, 10)}).
- neighborhood: one of ${NEIGHBORHOODS.join(", ")}, only if the text names it or a street clearly in it (for example W 110th St is Morningside Heights). Otherwise null.
- roomType: "private room", "studio" or "shared".
- furnished: true or false only if stated.
- sleeps: how many people it fits, only if stated.`;

function validateGuess(raw: unknown): Guess {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const date = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);
  const price = typeof o.price === "number" && o.price >= 300 && o.price <= 10000 ? Math.round(o.price) : null;
  const sleeps = typeof o.sleeps === "number" && o.sleeps >= 1 && o.sleeps <= 4 ? Math.round(o.sleeps) : null;
  let availableFrom = date(o.availableFrom);
  let availableTo = date(o.availableTo);
  if (availableFrom && availableTo && availableTo <= availableFrom) availableFrom = availableTo = null;
  return {
    price,
    availableFrom,
    availableTo,
    neighborhood: typeof o.neighborhood === "string" && NEIGHBORHOODS.includes(o.neighborhood) ? o.neighborhood : null,
    roomType: ROOM_TYPES.includes(o.roomType as RoomType) ? (o.roomType as RoomType) : null,
    furnished: typeof o.furnished === "boolean" ? o.furnished : null,
    sleeps,
  };
}

async function guessWithClaude(text: string): Promise<Guess | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: CLAUDE_TIMEOUT_MS, maxRetries: 0 });
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 300,
      thinking: { type: "disabled" },
      output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA } },
      system: SYSTEM,
      messages: [{ role: "user", content: text }],
    });
    if (response.stop_reason !== "end_turn") return null;
    const out = response.content.find((b) => b.type === "text")?.text;
    return out ? validateGuess(JSON.parse(out)) : null;
  } catch (error) {
    console.warn("[link-preview] Claude call failed, using keywords:", error instanceof Error ? error.message : error);
    return null;
  }
}

// Keyword fallback: just the obvious ones.
export function guessWithKeywords(text: string): Guess {
  const t = text.toLowerCase();
  const g: Guess = { ...NO_GUESS };
  const money = /\$\s?(\d{1,2},?\d{3})(?!\s*(?:\/|per)\s*(?:wk|week|night))/.exec(t);
  if (money) {
    const v = Number(money[1].replace(",", ""));
    if (v >= 300 && v <= 10000) g.price = v;
  }
  if (/\bstudio\b/.test(t)) g.roomType = "studio";
  else if (/\bshared room\b|\bshare a room\b/.test(t)) g.roomType = "shared";
  else if (/\b(private )?room\b|\bbedroom\b/.test(t)) g.roomType = "private room";
  if (/\bunfurnished\b/.test(t)) g.furnished = false;
  else if (/\bfurnished\b/.test(t)) g.furnished = true;
  for (const n of NEIGHBORHOODS) {
    const short = n.split(",")[0].toLowerCase();
    if (t.includes(short)) {
      g.neighborhood = n;
      break;
    }
  }
  if (!g.neighborhood && /\bmorningside|columbia\b/.test(t)) g.neighborhood = "Morningside Heights";
  if (!g.neighborhood && /\buws\b|upper west/.test(t)) g.neighborhood = "Upper West Side";
  return g;
}

// ---------- Putting it together ----------

export async function readLink(raw: string): Promise<{ ok: true; preview: LinkPreview } | { ok: false; error: string }> {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return { ok: false, error: "That doesn't look like a link. Paste the whole address, starting with https://." };
  }
  if (url.toString().length > 600) return { ok: false, error: "That link is too long." };
  try {
    const { html, finalUrl } = await fetchPage(url.toString());
    const tags = readPreviewTags(html, finalUrl);
    const text = `URL: ${finalUrl}\nTitle: ${tags.title}\nDescription: ${tags.description}`;
    const guess = (await guessWithClaude(text)) ?? guessWithKeywords(`${tags.title} ${tags.description}`);
    return {
      ok: true,
      preview: {
        url: url.toString(), // keep the link they pasted; it's the listing they meant
        source: sourceName(finalUrl),
        title: tags.title || "Sublet listing",
        description: tags.description,
        imageUrl: tags.imageUrl,
        guess,
      },
    };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "We couldn't read that page." };
  }
}
