import type { Template } from "./types";

/** Picks the most striking colour in a picture, so a team's logo can set the colours of its card. Runs in the browser on a small copy. */
export async function dominantColour(src: string): Promise<string | null> {
  const img = new Image();
  img.src = src;
  try { await img.decode(); } catch { return null; }
  const cv = document.createElement("canvas"); cv.width = cv.height = 48;
  const ctx = cv.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, 48, 48);
  return pickColour(ctx.getImageData(0, 0, 48, 48).data);
}

/** Buckets pixels by colour and prefers vivid, mid-brightness colours over greys, whites and near-blacks. */
export function pickColour(d: ArrayLike<number>): string | null {
  const buckets = new Map<string, { n: number; r: number; g: number; b: number }>();
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 200) continue;
    const r = d[i], g = d[i + 1], b = d[i + 2];
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 510, s = max === min ? 0 : (max - min) / (255 - Math.abs(max + min - 255));
    if (s < 0.35 || l < 0.16 || l > 0.85) continue;
    const k = `${r >> 5}${g >> 5}${b >> 5}`;
    const e = buckets.get(k) ?? { n: 0, r: 0, g: 0, b: 0 };
    e.n++; e.r += r; e.g += g; e.b += b; buckets.set(k, e);
  }
  const best = [...buckets.values()].sort((a, b) => b.n - a.n)[0];
  if (!best) return null;
  const h = (v: number) => Math.round(v / best.n).toString(16).padStart(2, "0");
  return `#${h(best.r)}${h(best.g)}${h(best.b)}`;
}

const HEX = /^#[0-9a-f]{6}$/i;
const vivid = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 510, s = max === min ? 0 : (max - min) / (255 - Math.abs(max + min - 255));
  return s >= 0.4 && l >= 0.2 && l <= 0.85;
};

/** The accent colour of a design: the vivid colour used most often across its shapes, text and background. */
export function accentOf(t: Template): string | null {
  const count = new Map<string, number>();
  const see = (c?: string) => { if (c && HEX.test(c) && vivid(c)) { const k = c.toLowerCase(); count.set(k, (count.get(k) ?? 0) + 1); } };
  see(t.bg.a); see(t.bg.b); see(t.bg.pattern?.color);
  for (const e of t.els) { see(e.fill); see(e.fill2); see(e.color); see(e.stroke); see(e.sticker); }
  return [...count.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

/** Swaps the design's accent colour for another one everywhere it appears. */
export function recolour(t: Template, to: string): Template {
  const from = accentOf(t);
  if (!from) return t;
  const sw = (c?: string) => (c && c.toLowerCase() === from ? to : c);
  return {
    ...t,
    bg: { ...t.bg, a: sw(t.bg.a)!, b: sw(t.bg.b)!, pattern: t.bg.pattern ? { ...t.bg.pattern, color: sw(t.bg.pattern.color)! } : undefined },
    els: t.els.map((e) => ({ ...e, fill: sw(e.fill), fill2: sw(e.fill2), color: sw(e.color), stroke: sw(e.stroke), sticker: sw(e.sticker) })),
  };
}
