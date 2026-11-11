import { fitText, FOOTER_TEXT, gradientLine, parseBg, whatsappLink, withAlpha } from "./share-cards";
import { fontCss, themeById, type DisplayTheme } from "./display-themes";

/**
 * Tournament posters: the event name, date, venue, prize line, organiser and up to two sponsor logos drawn as a PNG, in the colours and fonts of
 * a display design. The first half is pure layout maths (what fits, where each block goes, the WhatsApp text) and is unit tested in node.
 * The second half draws on a canvas and needs a browser. It reuses the helpers of the share cards (text fitting, backgrounds, the footer line).
 * Nothing is added to what the organiser types: no dates, prizes or claims are made up.
 */
export type PosterFormat = "poster" | "story" | "square";
export const POSTER_SIZES: Record<PosterFormat, { w: number; h: number; label: string }> = {
  poster: { w: 1080, h: 1350, label: "Poster (4:5)" },
  story: { w: 1080, h: 1920, label: "Story (9:16)" },
  square: { w: 1080, h: 1080, label: "Square post" },
};
export const POSTER_FORMATS = Object.keys(POSTER_SIZES) as PosterFormat[];
export const MAX_POSTER_SPONSORS = 2;

export interface PosterSponsor { name: string; logo?: string }
export interface PosterData { event: string; date: string; venue: string; game: string; prize: string; organiser: string; sponsors: PosterSponsor[] }
export const EMPTY_POSTER: PosterData = { event: "", date: "", venue: "", game: "", prize: "", organiser: "", sponsors: [] };

/** A template is a look: a display design (its colours and font) and the game name it suggests. The designs are the same ones the TV screens use. */
export interface PosterTemplate { id: string; name: string; game: string; theme: string }
export const POSTER_TEMPLATES: PosterTemplate[] = [
  { id: "free-fire", name: "Free Fire", game: "Free Fire", theme: "carbon" },
  { id: "bgmi", name: "BGMI", game: "BGMI", theme: "royal" },
  { id: "valorant", name: "Valorant", game: "Valorant", theme: "crimson" },
  { id: "cricket", name: "Cricket", game: "Cricket", theme: "pitch" },
  { id: "football", name: "Football", game: "Football", theme: "stadium" },
];
export const templateById = (id: string | null | undefined): PosterTemplate => POSTER_TEMPLATES.find((t) => t.id === id) ?? POSTER_TEMPLATES[0]!;

// ---------------------------------------------------------------- pure helpers

const LIMITS = { event: 60, date: 40, venue: 70, game: 30, prize: 70, organiser: 60, sponsorName: 40 } as const;
const one = (s: string, n: number) => s.replace(/\s+/g, " ").trim().slice(0, n);

/** Trims every field to a length that fits on a poster, and keeps at most two sponsors. */
export function cleanPoster(d: PosterData): PosterData {
  return {
    event: one(d.event, LIMITS.event), date: one(d.date, LIMITS.date), venue: one(d.venue, LIMITS.venue), game: one(d.game, LIMITS.game),
    prize: one(d.prize, LIMITS.prize), organiser: one(d.organiser, LIMITS.organiser),
    sponsors: d.sponsors.slice(0, MAX_POSTER_SPONSORS).map((s) => ({ name: one(s.name, LIMITS.sponsorName), ...(s.logo ? { logo: s.logo } : null) })),
  };
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/** "2026-12-05" as "5 December 2026". Anything else the organiser typed is kept as it is. */
export function formatPosterDate(v: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v.trim());
  if (!m) return v.trim();
  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  const real = new Date(Date.UTC(y, mo - 1, d));
  if (mo < 1 || mo > 12 || real.getUTCMonth() !== mo - 1 || real.getUTCDate() !== d) return v.trim();
  return `${d} ${MONTHS[mo - 1]} ${y}`;
}

/** Breaks text into lines no wider than `max`, at spaces. Over `maxLines`, the last line is cut with an ellipsis. A single word that is too wide is cut too. */
export function wrapLines(text: string, max: number, measure: (s: string) => number, maxLines = 4): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length || max <= 0) return [];
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (measure(next) <= max) { cur = next; continue; }
    if (cur) lines.push(cur);
    cur = w;
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const rest = lines.slice(maxLines - 1).join(" ");
    return [...lines.slice(0, maxLines - 1), fitText(rest, max, measure)].map((l) => fitText(l, max, measure));
  }
  return lines.map((l) => fitText(l, max, measure));
}

/** The largest type size (px) at which the event name fits the box in at most `maxLines` lines, and the lines at that size. */
export function fitTitle(text: string, w: number, h: number, measureAt: (s: string, size: number) => number, o: { max?: number; min?: number; maxLines?: number; lineHeight?: number } = {}): { size: number; lines: string[] } {
  const max = o.max ?? 190, min = o.min ?? 56, maxLines = o.maxLines ?? 4, lh = o.lineHeight ?? 1.04;
  for (let size = max; size >= min; size -= 6) {
    const lines = wrapLines(text, w, (s) => measureAt(s, size), maxLines + 1);
    // Fits only if no line was cut and the whole block is inside the box. A cut line ends with an ellipsis.
    if (lines.length <= maxLines && lines.length * size * lh <= h && !lines.some((l) => l.endsWith("…"))) return { size, lines };
  }
  const lines = wrapLines(text, w, (s) => measureAt(s, min), maxLines);
  return { size: min, lines };
}

export interface Rect { x: number; y: number; w: number; h: number }
export interface PosterLayout { w: number; h: number; m: number; tag: Rect; title: Rect; info: Rect | null; prize: Rect | null; organiser: Rect | null; sponsors: Rect | null; footer: Rect }
const GAP = 36;
/**
 * Where each block goes. A stack from the top (the game tag), the title in the space that is left, then the date and venue, the prize,
 * the organiser, the sponsor strip and the footer line at the bottom. Blocks with nothing in them take no room, so the title grows instead.
 */
export function posterLayout(format: PosterFormat, has: { info: boolean; prize: boolean; organiser: boolean; sponsors: boolean }): PosterLayout {
  const { w, h } = POSTER_SIZES[format], m = 72, inner = w - 2 * m;
  const tag: Rect = { x: m, y: m, w: inner, h: 56 };
  const footer: Rect = { x: m, y: h - m - 30, w: inner, h: 30 };
  let bottom = footer.y - GAP;
  const stack = (on: boolean, hh: number): Rect | null => { if (!on) return null; const r = { x: m, y: bottom - hh, w: inner, h: hh }; bottom -= hh + GAP; return r; };
  const sponsors = stack(has.sponsors, 120);
  const organiser = stack(has.organiser, 44);
  const prize = stack(has.prize, format === "square" ? 120 : 150);
  const info = stack(has.info, format === "square" ? 110 : 140);
  const top = tag.y + tag.h + GAP;
  const title: Rect = { x: m, y: top, w: inner, h: Math.max(0, bottom + GAP - top - GAP) };
  return { w, h, m, tag, title, info, prize, organiser, sponsors, footer };
}

/** The boxes for the sponsor logos along a strip: equal width, at most 300 px each, left aligned with the poster margin. */
export function sponsorBoxes(count: number, strip: Rect, gap = 24): Rect[] {
  if (count <= 0) return [];
  const bw = Math.min(300, (strip.w - gap * (count - 1)) / count);
  return Array.from({ length: count }, (_, i) => ({ x: strip.x + i * (bw + gap), y: strip.y, w: bw, h: strip.h }));
}

/** The message for WhatsApp: only what was typed, one line per fact, and the same footer as the pictures. */
export function posterText(d: PosterData): string {
  const c = cleanPoster(d);
  const lines = [c.event, c.game, c.date && formatPosterDate(c.date), c.venue, c.prize && `Prize: ${c.prize}`, c.organiser && `Organised by ${c.organiser}`, c.sponsors.filter((s) => s.name).length ? `Sponsors: ${c.sponsors.map((s) => s.name).filter(Boolean).join(", ")}` : "", FOOTER_TEXT];
  return lines.filter(Boolean).join("\n");
}
export const posterWhatsappLink = (d: PosterData) => whatsappLink(posterText(d));

/** A safe file name, for example "spring-cup-poster.png". */
export function posterFileName(event: string, format: PosterFormat): string {
  const slug = event.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
  return `${slug || "tournament"}-${format === "poster" ? "poster" : format}.png`;
}

// ---------------------------------------------------------------- drawing (browser only)

interface Cx { g: CanvasRenderingContext2D; t: DisplayTheme; fam: string }

async function loadFamily(t: DisplayTheme, fontClass?: string): Promise<string> {
  let fam: string = fontCss(t);
  try {
    const probe = document.createElement("div");
    if (fontClass) probe.className = fontClass;
    probe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none";
    const span = document.createElement("span"); span.textContent = "Aa"; span.style.fontFamily = fontCss(t);
    probe.appendChild(span); document.body.appendChild(probe);
    fam = getComputedStyle(span).fontFamily || fam;
    probe.remove();
    await Promise.all([800, 500].map((wt) => document.fonts.load(`${wt} 40px ${fam}`, "Aa0").catch(() => [])));
    await document.fonts.ready;
  } catch { /* the system fallback fonts in the list are used */ }
  return fam;
}

const loadImage = (src: string) => new Promise<HTMLImageElement | null>((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });

function roundRect(g: CanvasRenderingContext2D, r: Rect, rad: number) {
  const k = Math.max(0, Math.min(rad, r.w / 2, r.h / 2));
  g.beginPath(); g.moveTo(r.x + k, r.y); g.arcTo(r.x + r.w, r.y, r.x + r.w, r.y + r.h, k); g.arcTo(r.x + r.w, r.y + r.h, r.x, r.y + r.h, k); g.arcTo(r.x, r.y + r.h, r.x, r.y, k); g.arcTo(r.x, r.y, r.x + r.w, r.y, k); g.closePath();
}

function background(c: Cx, w: number, h: number) {
  const { g, t } = c, plan = parseBg(t.bg, t.base);
  g.fillStyle = t.base; g.fillRect(0, 0, w, h);
  if (plan.kind === "linear") {
    const l = gradientLine(plan.angle, w, h), grad = g.createLinearGradient(l.x0, l.y0, l.x1, l.y1);
    plan.stops.forEach((s, i) => grad.addColorStop(i / (plan.stops.length - 1), s));
    g.fillStyle = grad; g.fillRect(0, 0, w, h);
  } else if (plan.kind === "radial") {
    const grad = g.createRadialGradient(w / 2, 0, 0, w / 2, 0, Math.max(w, h) * 0.8);
    plan.stops.forEach((s, i) => grad.addColorStop(i / (plan.stops.length - 1), s));
    g.fillStyle = grad; g.fillRect(0, 0, w, h);
  }
  // Flat shapes in the design's two accent colours: a slanted band across the top corner and a thin rule above the footer. No glow.
  g.fillStyle = withAlpha(t.accent, 0.16); g.beginPath(); g.moveTo(w, 0); g.lineTo(w, h * 0.22); g.lineTo(w - w * 0.38, 0); g.closePath(); g.fill();
  g.fillStyle = withAlpha(t.accent2, 0.12); g.beginPath(); g.moveTo(0, h); g.lineTo(0, h - h * 0.12); g.lineTo(w * 0.3, h); g.closePath(); g.fill();
}

/** Draws the poster as a PNG: 1080x1350 (4:5), 1080x1920 (story) or 1080x1080 (square), in the template's colours and font. */
export async function renderPoster(data: PosterData, opts: { format: PosterFormat; template: string; fontClass?: string }): Promise<Blob> {
  const d = cleanPoster(data), tpl = templateById(opts.template), t = themeById(tpl.theme), { w, h } = POSTER_SIZES[opts.format];
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const g = canvas.getContext("2d");
  if (!g) throw new Error("The picture could not be made in this browser.");
  const c: Cx = { g, t, fam: await loadFamily(t, opts.fontClass) };
  const f = (px: number, weight = 800) => { g.font = `${weight} ${Math.round(px)}px ${c.fam}`; };
  const T = (s: string) => (t.upper ? s.toUpperCase() : s);
  const W = (s: string) => g.measureText(s).width;
  const date = d.date ? formatPosterDate(d.date) : "";
  const hasInfo = Boolean(date || d.venue), sponsors = d.sponsors.filter((s) => s.name || s.logo);
  const L = posterLayout(opts.format, { info: hasInfo, prize: Boolean(d.prize), organiser: Boolean(d.organiser), sponsors: sponsors.length > 0 });
  background(c, w, h);
  g.textAlign = "left"; g.textBaseline = "middle";

  // Game tag: a block in the accent colour.
  const gameText = T(d.game || tpl.game);
  f(30, 800); const tagW = Math.min(L.tag.w, W(gameText) + 56);
  g.fillStyle = t.accent; roundRect(g, { x: L.tag.x, y: L.tag.y, w: tagW, h: L.tag.h }, 10); g.fill();
  g.fillStyle = t.on; g.fillText(fitText(gameText, tagW - 40, W), L.tag.x + 28, L.tag.y + L.tag.h / 2 + 2);

  // Event name: as large as fits.
  const name = T(d.event || "Your tournament name");
  const fit = fitTitle(name, L.title.w, L.title.h, (s, size) => { f(size, 800); return W(s); });
  f(fit.size, 800); g.textBaseline = "top"; g.fillStyle = t.fg;
  const block = fit.lines.length * fit.size * 1.04, ty = L.title.y + Math.max(0, (L.title.h - block) / 2);
  fit.lines.forEach((ln, i) => g.fillText(ln, L.title.x, ty + i * fit.size * 1.04));
  g.fillStyle = t.accent; g.fillRect(L.title.x, Math.min(L.title.y + L.title.h + 4, ty + block + 12), 160, 10);

  // Date and venue.
  if (L.info) {
    const rows = [date, d.venue].filter(Boolean), size = Math.min(60, (L.info.h - 10) / rows.length * 0.78);
    g.textBaseline = "middle";
    rows.forEach((row, i) => { f(size, i === 0 ? 800 : 500); g.fillStyle = i === 0 ? t.fg : t.soft; g.fillText(fitText(T(row), L.info!.w, W), L.info!.x, L.info!.y + (L.info!.h / rows.length) * (i + 0.5)); });
  }
  // Prize line in an accent box.
  if (L.prize) {
    g.fillStyle = t.accent; roundRect(g, L.prize, 18); g.fill();
    f(Math.min(58, L.prize.h * 0.4), 800); g.fillStyle = t.on; g.textBaseline = "middle";
    const prize = fitText(T(d.prize), L.prize.w - 64, W); g.fillText(prize, L.prize.x + 32, L.prize.y + L.prize.h / 2 + 2);
  }
  if (L.organiser) { f(30, 600); g.fillStyle = t.soft; g.textBaseline = "middle"; g.fillText(fitText(T(`Organised by ${d.organiser}`), L.organiser.w, W), L.organiser.x, L.organiser.y + L.organiser.h / 2); }
  // Sponsor logos on white tiles so any logo stays readable; a sponsor with no logo shows its name.
  if (L.sponsors) {
    const boxes = sponsorBoxes(sponsors.length, L.sponsors), imgs = await Promise.all(sponsors.map((s) => (s.logo ? loadImage(s.logo) : Promise.resolve(null))));
    sponsors.forEach((s, i) => {
      const b = boxes[i]!, im = imgs[i];
      if (im) {
        g.fillStyle = "rgba(255,255,255,.96)"; roundRect(g, b, 16); g.fill();
        const k = Math.min((b.w - 28) / im.width, (b.h - 28) / im.height);
        g.drawImage(im, b.x + (b.w - im.width * k) / 2, b.y + (b.h - im.height * k) / 2, im.width * k, im.height * k);
      } else {
        g.fillStyle = t.row; roundRect(g, b, 16); g.fill(); g.strokeStyle = t.line; g.lineWidth = 2; roundRect(g, { x: b.x + 1, y: b.y + 1, w: b.w - 2, h: b.h - 2 }, 16); g.stroke();
        f(30, 800); g.fillStyle = t.fg; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(fitText(s.name, b.w - 28, W), b.x + b.w / 2, b.y + b.h / 2 + 2); g.textAlign = "left";
      }
    });
  }
  // Footer line.
  g.fillStyle = withAlpha(t.fg, 0.25); g.fillRect(L.footer.x, L.footer.y - 14, L.footer.w, 2);
  f(24, 500); g.fillStyle = t.soft; g.textAlign = "right"; g.textBaseline = "middle"; g.fillText(FOOTER_TEXT, L.footer.x + L.footer.w, L.footer.y + L.footer.h / 2); g.textAlign = "left";

  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("The picture could not be made in this browser."))), "image/png"));
}
