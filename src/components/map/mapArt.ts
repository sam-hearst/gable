// Pin pictures for the map, drawn on a canvas and handed to MapLibre as
// images, so they're part of the map and move perfectly with it.

const SCALE = 2; // drawn at 2× for sharp text on Retina

function family() {
  return getComputedStyle(document.body).fontFamily || "sans-serif";
}

// A slim pill (price + walk, or count + "places") with a short stem to its spot.
export function pillImage(text: string, sub: string, bg: string) {
  const measure = document.createElement("canvas").getContext("2d")!;
  measure.font = `700 13px ${family()}`;
  const w1 = measure.measureText(text).width;
  measure.font = `500 11px ${family()}`;
  const w2 = sub ? measure.measureText(sub).width + 6 : 0;
  const w = w1 + w2 + 20;
  const h = 26;
  const pad = 6;
  const stem = 10;
  const c = document.createElement("canvas");
  c.width = Math.ceil((w + pad * 2) * SCALE);
  c.height = Math.ceil((h + pad * 2 + stem) * SCALE);
  const x = c.getContext("2d")!;
  x.scale(SCALE, SCALE);
  x.shadowColor = "rgba(30,43,36,0.22)";
  x.shadowBlur = 6;
  x.shadowOffsetY = 2;
  x.fillStyle = "#FFFCF6";
  x.beginPath();
  x.roundRect(pad - 1.5, pad - 1.5, w + 3, h + 3, h / 2 + 1.5);
  x.fill();
  x.shadowColor = "transparent";
  x.fillStyle = bg;
  x.beginPath();
  x.roundRect(pad, pad, w, h, h / 2);
  x.fill();
  x.fillStyle = "#FFFCF6";
  x.fillRect(pad + w / 2 - 1, pad + h, 2, stem);
  x.textBaseline = "middle";
  x.font = `700 13px ${family()}`;
  x.fillText(text, pad + 10, pad + h / 2 + 1);
  if (sub) {
    x.globalAlpha = 0.82;
    x.font = `500 11px ${family()}`;
    x.fillText(sub, pad + 10 + w1 + 6, pad + h / 2 + 1);
  }
  return { image: x.getImageData(0, 0, c.width, c.height), pixelRatio: SCALE };
}

// A subway stop: its lines as small MTA-style bullets (1, B C, A B C D…).
export function stopImage(lines: [string, string][]) {
  const d = 15;
  const gap = 2;
  const pad = 3;
  const w = lines.length * d + (lines.length - 1) * gap + pad * 2;
  const h = d + pad * 2;
  const c = document.createElement("canvas");
  c.width = Math.ceil(w * SCALE);
  c.height = Math.ceil(h * SCALE);
  const x = c.getContext("2d")!;
  x.scale(SCALE, SCALE);
  x.shadowColor = "rgba(30,43,36,0.25)";
  x.shadowBlur = 4;
  x.shadowOffsetY = 1;
  x.fillStyle = "#FFFFFF";
  x.beginPath();
  x.roundRect(0, 0, w, h, h / 2);
  x.fill();
  x.shadowColor = "transparent";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.font = `700 9.5px ${family()}`;
  lines.forEach(([line, color], i) => {
    const cx = pad + d / 2 + i * (d + gap);
    x.fillStyle = color;
    x.beginPath();
    x.arc(cx, h / 2, d / 2, 0, Math.PI * 2);
    x.fill();
    x.fillStyle = "#FFFFFF";
    x.fillText(line, cx, h / 2 + 0.5);
  });
  return { image: x.getImageData(0, 0, c.width, c.height), pixelRatio: SCALE };
}
