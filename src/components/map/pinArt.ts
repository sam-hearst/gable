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
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  if (opts.ring) {
    ctx.fillStyle = opts.ring;
    roundRect(ctx, x - 3, y - 3, bodyW + 6, height + 6, r + 3);
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

export function priceArt(price: string, walk: string, active: boolean) {
  return pill({
    parts: [
      { text: price, weight: 700, size: 15 },
      { text: walk, weight: 500, size: 12, alpha: 0.85 },
    ],
    bg: active ? ACCENT_DARK : ACCENT,
    fg: CREAM,
    ring: "rgba(255,252,246,0.95)",
    stem: { color: "rgba(255,252,246,0.95)", length: 28 },
  });
}

export function campusArt() {
  return pill({
    parts: [
      { text: "★", weight: 700, size: 14 },
      { text: "Columbia University", weight: 700, size: 14 },
    ],
    bg: INK,
    fg: CREAM,
    ring: "rgba(242,166,90,0.95)",
    radius: 12,
    height: 34,
    stem: { color: SUN, length: 38 },
  });
}

export function ringArt(text: string) {
  return pill({ parts: [{ text, weight: 700, size: 12 }], bg: "rgba(43,122,75,0.9)", fg: "#fff", height: 24, padX: 9 });
}

// A subway stop: line bullets in MTA colors, then the stop name.
export function stopArt(name: string, lines: [string, string][]) {
  const height = 26;
  const bullet = 18;
  const { ctx: measure } = canvas(1, 1);
  measure.font = `700 11px ${family()}`;
  const nameW = measure.measureText(name).width;
  const w = 4 + lines.length * (bullet + 3) + 4 + nameW + 9;
  const pad = 6;
  const { c, ctx } = canvas(w + pad * 2, height + pad * 2);
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = "rgba(15,21,18,0.82)";
  roundRect(ctx, pad, pad, w, height, height / 2);
  ctx.fill();
  ctx.restore();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 11px ${family()}`;
  lines.forEach(([line, color], i) => {
    const cx = pad + 4 + i * (bullet + 3) + bullet / 2;
    const cy = pad + height / 2;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, bullet / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText(line, cx, cy + 1);
  });
  ctx.textAlign = "left";
  ctx.fillStyle = "#fff";
  ctx.fillText(name, pad + 4 + lines.length * (bullet + 3) + 4, pad + height / 2 + 1);
  return c;
}

export function labelFont(size: number, weight = 700) {
  return `${weight} ${size}px ${family()}`;
}
