// Pictures for the 3D map's pins and labels, drawn on a canvas so the map can
// place them itself. They then move exactly with the city (HTML laid over the
// map lagged a frame behind and looked shaky). Drawn at 2× for sharp text;
// the map shows them at half size.

export const ART_SCALE = 2;

const ACCENT = "#2B7A4B";
const ACCENT_DARK = "#1D5C37";
const CREAM = "#FFFCF6";
const INK = "#1E2B24";
const SUN = "#F2A65A";

function family() {
  return typeof document === "undefined" ? "sans-serif" : getComputedStyle(document.body).fontFamily || "sans-serif";
}

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = Math.ceil(w * ART_SCALE);
  c.height = Math.ceil(h * ART_SCALE);
  const ctx = c.getContext("2d")!;
  ctx.scale(ART_SCALE, ART_SCALE);
  return { c, ctx };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

// A pill with an optional thin "stem" pointing down at the spot.
function pill(opts: {
  parts: { text: string; weight: number; size: number; alpha?: number }[];
  bg: string;
  fg: string;
  ring?: string;
  radius?: number;
  stem?: { color: string; length: number };
  padX?: number;
  height?: number;
  ringWidth?: number;
}) {
  const padX = opts.padX ?? 12;
  const height = opts.height ?? 32;
  const gap = 6;
  const pad = 8; // room for the ring and shadow
  const { ctx: measure } = canvas(1, 1);
  const widths = opts.parts.map((p) => {
    measure.font = `${p.weight} ${p.size}px ${family()}`;
    return measure.measureText(p.text).width;
  });
  const bodyW = padX * 2 + widths.reduce((a, b) => a + b, 0) + gap * (opts.parts.length - 1);
  const stemLen = opts.stem?.length ?? 0;
  const { c, ctx } = canvas(bodyW + pad * 2, height + pad * 2 + stemLen);
  const x = pad;
  const y = pad;
  const r = opts.radius ?? height / 2;

  if (opts.stem) {
    const g = ctx.createLinearGradient(0, y + height, 0, y + height + stemLen);
    g.addColorStop(0, opts.stem.color);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x + bodyW / 2 - 1, y + height, 2, stemLen);
  }

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.22)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  if (opts.ring) {
    const rw = opts.ringWidth ?? 2;
    ctx.fillStyle = opts.ring;
    roundRect(ctx, x - rw, y - rw, bodyW + rw * 2, height + rw * 2, r + rw);
    ctx.fill();
  }
  ctx.restore();
  ctx.fillStyle = opts.bg;
  roundRect(ctx, x, y, bodyW, height, r);
  ctx.fill();

  let tx = x + padX;
  ctx.textBaseline = "middle";
  opts.parts.forEach((p, i) => {
    ctx.font = `${p.weight} ${p.size}px ${family()}`;
    ctx.globalAlpha = p.alpha ?? 1;
    ctx.fillStyle = opts.fg;
    ctx.fillText(p.text, tx, y + height / 2 + 1);
    tx += widths[i] + gap;
  });
  ctx.globalAlpha = 1;
  return c;
}

// Slim price pin: price, then the walk to campus in lighter type.
export function priceArt(price: string, walk: string, active: boolean) {
  return pill({
    parts: [
      { text: price, weight: 700, size: 13 },
      { text: walk, weight: 500, size: 11, alpha: 0.8 },
    ],
    bg: active ? ACCENT_DARK : ACCENT,
    fg: CREAM,
    ring: "rgba(255,252,246,0.95)",
    ringWidth: 1.5,
    height: 26,
    padX: 10,
    stem: { color: "rgba(255,252,246,0.9)", length: 14 },
  });
}

// Columbia: a slim dark label with a thin gold edge.
export function campusArt() {
  return pill({
    parts: [
      { text: "★", weight: 700, size: 12 },
      { text: "Columbia", weight: 700, size: 13 },
    ],
    bg: INK,
    fg: CREAM,
    ring: "rgba(242,166,90,0.9)",
    ringWidth: 1.5,
    height: 26,
    padX: 10,
    stem: { color: SUN, length: 18 },
  });
}



// A subway stop: small line bullets in MTA colors, plus the stop name when
// `name` is given (only shown up close, to keep the map quiet).
export function stopArt(name: string | null, lines: [string, string][]) {
  const height = 20;
  const bullet = 14;
  const { ctx: measure } = canvas(1, 1);
  measure.font = `600 10px ${family()}`;
  const nameW = name ? measure.measureText(name).width + 4 : 0;
  const w = 3 + lines.length * (bullet + 2) - 2 + 3 + nameW + (name ? 6 : 0);
  const pad = 6;
  const { c, ctx } = canvas(w + pad * 2, height + pad * 2);
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.2)";
  ctx.shadowBlur = 5;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = "rgba(15,21,18,0.72)";
  roundRect(ctx, pad, pad, w, height, height / 2);
  ctx.fill();
  ctx.restore();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 9px ${family()}`;
  lines.forEach(([line, color], i) => {
    const cx = pad + 3 + i * (bullet + 2) + bullet / 2;
    const cy = pad + height / 2;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, bullet / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText(line, cx, cy + 1);
  });
  if (name) {
    ctx.textAlign = "left";
    ctx.fillStyle = "#fff";
    ctx.font = `600 10px ${family()}`;
    ctx.fillText(name, pad + 3 + lines.length * (bullet + 2) + 4, pad + height / 2 + 1);
  }
  return c;
}

export function labelFont(size: number, weight = 700) {
  return `${weight} ${size}px ${family()}`;
}

// Several places too close to tell apart: one bubble with the count.
export function clusterArt(count: number) {
  return pill({
    parts: [
      { text: String(count), weight: 700, size: 15 },
      { text: "places", weight: 500, size: 12, alpha: 0.85 },
    ],
    bg: ACCENT,
    fg: CREAM,
    ring: "rgba(255,252,246,0.95)",
    stem: { color: "rgba(255,252,246,0.95)", length: 22 },
  });
}

// Columbia from far away: just a small star, so it doesn't cover the pins.
export function campusDotArt() {
  const size = 26;
  const pad = 6;
  const { c, ctx } = canvas(size + pad * 2, size + pad * 2);
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.22)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = SUN;
  ctx.beginPath();
  ctx.arc(pad + size / 2, pad + size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(pad + size / 2, pad + size / 2, size / 2 - 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = SUN;
  ctx.font = `700 13px ${family()}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("★", pad + size / 2, pad + size / 2 + 1);
  return c;
}
