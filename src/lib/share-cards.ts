import type { BracketData, Extras, Payload } from "./display";
import { remaining } from "./display";
import { contrast, fontCss, themeById, type DisplayTheme } from "./display-themes";

/**
 * Share cards: a standings table, schedule, bracket or countdown (or a winners poster) drawn as a PNG for WhatsApp, Instagram and the like.
 * The file has two halves. The top is pure layout maths (what fits, which columns, which rounds, the plain-text version) and is unit tested in node.
 * The bottom draws on a canvas and needs a browser.
 */
export type ShareFormat = "square" | "story";
export const SIZES: Record<ShareFormat, { w: number; h: number }> = { square: { w: 1080, h: 1080 }, story: { w: 1080, h: 1920 } };
export const FOOTER_TEXT = "Made with Esports Hub";

// ---------------------------------------------------------------- pure helpers

/** Shortens text with an ellipsis until `measure` says it fits in `max` pixels. */
export function fitText(text: string, max: number, measure: (s: string) => number): string {
  if (max <= 0) return "";
  if (measure(text) <= max) return text;
  let lo = 0, hi = text.length;
  while (lo < hi) { const mid = Math.ceil((lo + hi) / 2); if (measure(text.slice(0, mid).trimEnd() + "…") <= max) lo = mid; else hi = mid - 1; }
  return lo > 0 ? text.slice(0, lo).trimEnd() + "…" : "…";
}

export interface RowPlan { /** Height of each row in pixels. */ rowH: number; /** How many rows are drawn. */ shown: number; /** How many are left out (a "+N more" line takes the last slot). */ more: number }
/**
 * How many rows fit in `avail` pixels. Rows grow up to `maxRow` when there are few; below `minRow` the table is cut and the last slot says "+N more".
 */
export function planRows(total: number, avail: number, o: { minRow?: number; maxRow?: number; gap?: number } = {}): RowPlan {
  const minRow = o.minRow ?? 64, maxRow = o.maxRow ?? 104, gap = o.gap ?? 12;
  if (total <= 0 || avail <= 0) return { rowH: minRow, shown: 0, more: Math.max(0, total) };
  const fit = Math.max(1, Math.floor((avail + gap) / (minRow + gap)));
  if (total <= fit) return { rowH: Math.max(minRow, Math.min(maxRow, Math.floor((avail + gap) / total - gap))), shown: total, more: 0 };
  const shown = Math.max(1, fit - 1);
  return { rowH: minRow, shown, more: total - shown };
}

/** Which columns of a table to draw on a narrow card: the rank and name, then the last few figures, always including the highlighted one. Returns column indexes. */
export function pickColumns(head: string[], strong: number | undefined, maxValues = 5): number[] {
  const values = head.map((_, i) => i).slice(2);
  if (values.length <= maxValues) return [0, 1, ...values];
  let keep = values.slice(values.length - maxValues);
  if (strong !== undefined && strong >= 2 && !keep.includes(strong)) keep = [strong, ...keep.slice(1)].sort((a, b) => a - b);
  return [0, 1, ...keep];
}

/** The round columns to draw. Up to `limit` teams: every round. More: only the last three rounds of each section, plus a note that says so. */
export function roundColumns(d: BracketData, limit = 16): { sections: BracketData["sections"]; note?: string } {
  const first = d.sections[0]?.rounds[0]?.matches.length ?? 0;
  if (first * 2 <= limit) return { sections: d.sections };
  return { sections: d.sections.map((s) => ({ ...s, rounds: s.rounds.slice(-3) })), note: "Showing the last 3 rounds" };
}

/** Vertical centres for `count` boxes spread evenly down a column that starts at `top` and is `height` tall (the way a bracket round lines up). */
export function matchCentres(count: number, top: number, height: number): number[] {
  return Array.from({ length: count }, (_, i) => top + (height / Math.max(1, count)) * (i + 0.5));
}

/** Pixel position of the two ends of a CSS linear-gradient angle (0deg points up, 180deg down) across a w x h box. */
export function gradientLine(angleDeg: number, w: number, h: number): { x0: number; y0: number; x1: number; y1: number } {
  const a = (angleDeg * Math.PI) / 180, dx = Math.sin(a), dy = -Math.cos(a);
  const len = Math.abs(w * dx) + Math.abs(h * dy);
  return { x0: w / 2 - (dx * len) / 2, y0: h / 2 - (dy * len) / 2, x1: w / 2 + (dx * len) / 2, y1: h / 2 + (dy * len) / 2 };
}

export interface BgPlan { kind: "solid" | "linear" | "radial"; angle: number; stops: string[] }
/** Reads a design's CSS background into something a canvas can draw: a flat colour, or the colours of a linear or radial gradient. */
export function parseBg(bg: string, base: string): BgPlan {
  const colors = bg.match(/#[0-9a-fA-F]{6}\b/g) ?? [];
  const lin = /^linear-gradient\(\s*(-?\d+(?:\.\d+)?)deg/.exec(bg);
  if (lin && colors.length >= 2) return { kind: "linear", angle: Number(lin[1]), stops: colors };
  if (bg.startsWith("radial-gradient") && colors.length >= 2) return { kind: "radial", angle: 0, stops: colors };
  return { kind: "solid", angle: 0, stops: [colors[0] ?? base] };
}

/** "#rrggbb" as an rgba() string with the given opacity. Anything else is returned as it is. */
export function withAlpha(hex: string, a: number): string {
  const m = /^#([0-9a-fA-F]{6})$/.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1]!, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** A safe file name for a card, for example "league-table-square.png". */
export function shareFileName(title: string, format: ShareFormat): string {
  const slug = title.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
  return `${slug || "esports-hub"}-${format}.png`;
}

const AWARD_CLEAN = (s: string) => s.replace(/[|:]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
/**
 * The link that opens the certificate maker with the winners filled in: ?awards=Winner:Team A|Runner-up:Team B|Third place:Team C.
 * The pipe and the colon separate the parts, so they are removed from the names.
 */
export function certificatesHref(w: { first: string; second?: string; third?: string }): string {
  const rows: [string, string | undefined][] = [["Winner", w.first], ["Runner-up", w.second], ["Third place", w.third]];
  const parts = rows.map(([award, name]) => [award, AWARD_CLEAN(name ?? "")] as const).filter(([, name]) => name).map(([award, name]) => `${award}:${name}`);
  return `/tools/certificates/?awards=${encodeURIComponent(parts.join("|"))}`;
}

const flat = (s: string) => s.replace(/\s+/g, " ").trim();
const countdownWords = (at: string, now: number) => {
  const r = remaining(at, now);
  if (r.done) return "starting now";
  return [r.days ? `${r.days} day${r.days === 1 ? "" : "s"}` : "", r.hours ? `${r.hours} hour${r.hours === 1 ? "" : "s"}` : "", !r.days && r.minutes ? `${r.minutes} min` : ""].filter(Boolean).join(" ") || "under a minute";
};

/**
 * A plain-text version of a view, ready to paste into WhatsApp: a bold title (the asterisks WhatsApp understands), one line per row,
 * at most one trophy. Long tables stop after `maxRows` with a "+N more" line.
 */
export function shareText(p: Payload, o: { title?: string; extras?: Extras; now?: number; maxRows?: number } = {}): string {
  const maxRows = o.maxRows ?? 16, lines: string[] = [];
  const title = flat(o.title ?? p.d.title ?? "");
  if (p.v === "table") {
    lines.push(`🏆 *${title}*`);
    if (p.d.subtitle) lines.push(flat(p.d.subtitle));
    lines.push("");
    const nameCol = 1, strong = p.d.strong ?? p.d.head.length - 1;
    const unit = /^(total|pts|points)$/i.test(p.d.head[strong] ?? "") ? "pts" : (p.d.head[strong] ?? "").toLowerCase();
    p.d.rows.slice(0, maxRows).forEach((r, i) => lines.push(`${r[0] || i + 1}. ${flat(r[nameCol] ?? "")} - ${r[strong] ?? ""}${unit ? ` ${unit}` : ""}`));
    if (p.d.rows.length > maxRows) lines.push(`+${p.d.rows.length - maxRows} more`);
  } else if (p.v === "schedule") {
    lines.push(`📅 *${title}*`);
    if (p.d.date) lines.push(p.d.date);
    lines.push("");
    p.d.slots.slice(0, 24).forEach((s) => lines.push(`Round ${s.n}: ${s.start} to ${s.end} - ${flat(s.label)}`));
    if (p.d.slots.length > 24) lines.push(`+${p.d.slots.length - 24} more rounds`);
  } else if (p.v === "countdown") {
    lines.push(`⏳ *${title}*`);
    if (p.d.subtitle) lines.push(flat(p.d.subtitle));
    lines.push(`Starts in ${countdownWords(p.d.at, o.now ?? Date.now())}`);
  } else {
    lines.push(`🏆 *${title}*`);
    lines.push("");
    for (const s of p.d.sections) {
      if (s.name) lines.push(`*${flat(s.name)}*`);
      for (const r of s.rounds) {
        lines.push(`${flat(r.name)}:`);
        for (const m of r.matches) lines.push(`${m.w === 0 ? `${flat(m.a)} (won)` : flat(m.a)} vs ${m.w === 1 ? `${flat(m.b)} (won)` : flat(m.b)}`);
      }
    }
    if (p.d.champion) { lines.push(""); lines.push(`Champion: ${flat(p.d.champion)}`); }
  }
  const x = o.extras ?? p.x;
  if (x?.ticker?.length) { lines.push(""); x.ticker.forEach((t) => lines.push(flat(t))); }
  if (x?.sponsors?.length) { lines.push(""); lines.push(`Sponsors: ${x.sponsors.map((s) => flat(s.name)).join(", ")}`); }
  lines.push(""); lines.push(FOOTER_TEXT);
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** The WhatsApp link that opens a chat picker with the text already typed. */
export const whatsappLink = (text: string) => `https://wa.me/?text=${encodeURIComponent(text.slice(0, 3500))}`;

export interface WinnersData { title: string; first: string; second?: string; third?: string; event?: string }
/** The winners as a plain-text message. */
export function winnersText(d: WinnersData): string {
  return [`🏆 *${flat(d.title)}*`, d.event ? flat(d.event) : "", "", `1st: ${flat(d.first)}`, d.second ? `2nd: ${flat(d.second)}` : "", d.third ? `3rd: ${flat(d.third)}` : "", "", FOOTER_TEXT].filter((l, i, a) => l !== "" || (i > 0 && a[i - 1] !== "")).join("\n").trim();
}

// ---------------------------------------------------------------- drawing (browser only)

interface Opts { format: ShareFormat; theme: string; title?: string; extras?: Extras; /** A class that defines the font variables (the card fonts), so the right fonts can be found. */ fontClass?: string }
interface Cx { g: CanvasRenderingContext2D; t: DisplayTheme; W: number; H: number; m: number; fam: string; vmin: number }

const medalInk = (medal: string) => (contrast(medal, "#0b0b0b") >= 4.5 ? "#0b0b0b" : "#ffffff");

/** The font family list for the design, with the CSS variables resolved (a canvas cannot read var()), and the fonts loaded. */
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
    await Promise.all([800, 500].map((w) => document.fonts.load(`${w} 40px ${fam}`, "Aa0").catch(() => [])));
    await document.fonts.ready;
  } catch { /* the system fallback fonts in the list are used */ }
  return fam;
}

const font = (c: Cx, px: number, weight = 800) => { c.g.font = `${weight} ${Math.round(px)}px ${c.fam}`; };
const txt = (c: Cx, s: string) => (c.t.upper ? s.toUpperCase() : s);
const width = (c: Cx, s: string) => c.g.measureText(s).width;

function rr(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const k = Math.max(0, Math.min(r, w / 2, h / 2));
  g.beginPath(); g.moveTo(x + k, y); g.arcTo(x + w, y, x + w, y + h, k); g.arcTo(x + w, y + h, x, y + h, k); g.arcTo(x, y + h, x, y, k); g.arcTo(x, y, x + w, y, k); g.closePath();
}

function drawBackground(c: Cx) {
  const { g, t, W, H } = c, plan = parseBg(t.bg, t.base);
  g.fillStyle = t.base; g.fillRect(0, 0, W, H);
  if (plan.kind === "linear") {
    const l = gradientLine(plan.angle, W, H), grad = g.createLinearGradient(l.x0, l.y0, l.x1, l.y1);
    plan.stops.forEach((s, i) => grad.addColorStop(plan.stops.length === 1 ? 0 : i / (plan.stops.length - 1), s));
    g.fillStyle = grad; g.fillRect(0, 0, W, H);
  } else if (plan.kind === "radial") {
    const grad = g.createRadialGradient(W / 2, 0, 0, W / 2, 0, Math.max(W, H) * 0.8);
    plan.stops.forEach((s, i) => grad.addColorStop(i / (plan.stops.length - 1), s));
    g.fillStyle = grad; g.fillRect(0, 0, W, H);
  } else { g.fillStyle = plan.stops[0]!; g.fillRect(0, 0, W, H); }
}

/** One row box in the design's own shape (pill, slab, slant, outline, glass or stripe). */
function drawRow(c: Cx, i: number, x: number, y: number, w: number, h: number) {
  const { g, t } = c, r = t.radius * c.vmin * 1.2;
  switch (t.rows) {
    case "slab": g.fillStyle = t.row; rr(g, x, y, w, h, r); g.fill(); g.fillStyle = t.accent; g.fillRect(x, y, 10, h); break;
    case "slant": g.fillStyle = t.row; g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y); g.lineTo(x + w - 22, y + h); g.lineTo(x, y + h); g.closePath(); g.fill(); g.fillStyle = t.accent; g.fillRect(x, y, 6, h); break;
    case "outline": g.strokeStyle = t.line; g.lineWidth = 3; rr(g, x + 1.5, y + 1.5, w - 3, h - 3, r); g.stroke(); break;
    case "glass": g.fillStyle = t.row; rr(g, x, y, w, h, r); g.fill(); g.strokeStyle = t.line; g.lineWidth = 2; rr(g, x + 1, y + 1, w - 2, h - 2, r); g.stroke(); break;
    case "stripe": if (i % 2 === 0) { g.fillStyle = t.row; g.fillRect(x, y, w, h); } g.fillStyle = t.line; g.fillRect(x, y + h - 2, w, 2); break;
    default: g.fillStyle = t.row; rr(g, x, y, w, h, r); g.fill(); if (i < 3) { g.fillStyle = t.medals[i]!; g.fillRect(x, y + h * 0.18, 8, h * 0.64); }
  }
}

/** The rank marker in the design's style: a block, a circle or plain figures; the top three use the medal colours. */
function drawRank(c: Cx, i: number, label: string, x: number, y: number, size: number) {
  const { g, t } = c, medal = i < 3 ? t.medals[i]! : null;
  g.textBaseline = "middle"; g.textAlign = "center"; font(c, size * 0.5);
  if (t.rank === "block") {
    g.fillStyle = medal ?? t.accent; rr(g, x, y, size, size, Math.min(t.radius, 0.8) * c.vmin); g.fill();
    g.fillStyle = medal ? medalInk(medal) : t.on; g.fillText(label, x + size / 2, y + size / 2 + 2);
  } else if (t.rank === "circle") {
    g.beginPath(); g.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    g.fillStyle = medal ?? t.row; g.fill();
    if (!medal) { g.strokeStyle = t.line; g.lineWidth = 2; g.stroke(); }
    g.fillStyle = medal ? medalInk(medal) : t.fg; g.fillText(label, x + size / 2, y + size / 2 + 2);
  } else { g.fillStyle = medal ?? t.soft; g.fillText(label, x + size / 2, y + size / 2 + 2); }
  g.textAlign = "left";
}

/** The title in the design's heading style. Returns the y below it. */
function drawHeader(c: Cx, title: string, subtitle?: string): number {
  const { g, t, W, m } = c;
  let size = c.H > c.W ? 76 : 68;
  const maxW = W - 2 * m - (t.head === "bar" ? 80 : 0);
  font(c, size); while (size > 40 && width(c, txt(c, title)) > maxW) { size -= 4; font(c, size); }
  const text = fitText(txt(c, title), maxW, (s) => width(c, s)), tw = width(c, text);
  let y = m;
  g.textBaseline = "top"; g.textAlign = "left";
  if (t.head === "bar") {
    const grad = g.createLinearGradient(m, 0, m + tw + 80, 0); grad.addColorStop(0, t.accent); grad.addColorStop(1, t.accent2);
    g.fillStyle = grad; g.beginPath(); g.moveTo(m, y); g.lineTo(m + tw + 80, y); g.lineTo(m + tw + 56, y + size * 1.3); g.lineTo(m, y + size * 1.3); g.closePath(); g.fill();
    g.fillStyle = t.on; g.fillText(text, m + 28, y + size * 0.15);
  } else {
    g.fillStyle = t.fg; g.fillText(text, m, y);
    if (t.head === "underline") { g.fillStyle = t.accent; g.fillRect(m, y + size * 1.12, Math.min(tw, W - 2 * m), 8); }
  }
  y += size * 1.3 + 14;
  if (subtitle) { font(c, 32, 500); g.fillStyle = t.soft; g.fillText(fitText(txt(c, subtitle), W - 2 * m, (s) => width(c, s)), m, y); y += 52; }
  return y + 14;
}

const loadImage = (src: string) => new Promise<HTMLImageElement | null>((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });

/** Draws the ticker line, the sponsors and the footer at the bottom. Returns the y where the body must stop. */
async function drawBottom(c: Cx, x?: Extras): Promise<number> {
  const { g, t, W, H, m } = c;
  let y = H - m;
  font(c, 24, 500); g.fillStyle = t.soft; g.textAlign = "right"; g.textBaseline = "bottom"; g.fillText(FOOTER_TEXT, W - m, y); g.textAlign = "left";
  y -= 38;
  const sponsors = x?.sponsors ?? [];
  if (sponsors.length) {
    const h = 92, boxW = Math.min(230, (W - 2 * m - 20 * (sponsors.length - 1)) / sponsors.length), imgs = await Promise.all(sponsors.map((s) => (s.logo ? loadImage(s.logo) : Promise.resolve(null))));
    sponsors.forEach((s, i) => {
      const bx = m + i * (boxW + 20), by = y - h, im = imgs[i];
      if (im) {
        g.fillStyle = "rgba(255,255,255,.94)"; rr(g, bx, by, boxW, h, 14); g.fill();
        const k = Math.min((boxW - 20) / im.width, (h - 20) / im.height), iw = im.width * k, ih = im.height * k;
        g.drawImage(im, bx + (boxW - iw) / 2, by + (h - ih) / 2, iw, ih);
      } else {
        g.fillStyle = t.row; rr(g, bx, by, boxW, h, 14); g.fill(); g.strokeStyle = t.line; g.lineWidth = 2; rr(g, bx + 1, by + 1, boxW - 2, h - 2, 14); g.stroke();
        font(c, 28); g.fillStyle = t.fg; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(fitText(s.name, boxW - 24, (q) => width(c, q)), bx + boxW / 2, by + h / 2); g.textAlign = "left";
      }
    });
    y -= h + 18;
  }
  const ticker = x?.ticker ?? [];
  if (ticker.length) {
    const h = 64; font(c, 30);
    const line = fitText(ticker.join("   •   "), W - 2 * m - 48, (s) => width(c, s));
    g.fillStyle = t.accent; rr(g, m, y - h, W - 2 * m, h, 14); g.fill();
    g.fillStyle = t.on; g.textBaseline = "middle"; g.fillText(line, m + 24, y - h / 2 + 2);
    y -= h + 18;
  }
  return y;
}

function drawTable(c: Cx, d: Extract<Payload, { v: "table" }>["d"], top: number, bottom: number) {
  const { g, t, W, m } = c, cols = pickColumns(d.head, d.strong), inner = W - 2 * m;
  const plan = planRows(d.rows.length, bottom - top - 44, { minRow: 64, maxRow: 100 });
  const valueCols = cols.slice(2), valW = Math.min(inner * 0.5 / Math.max(1, valueCols.length), 150), rankW = Math.min(plan.rowH - 16, 64);
  // Column heads.
  font(c, 22, 600); g.fillStyle = t.soft; g.textBaseline = "middle"; g.textAlign = "right";
  valueCols.forEach((ci, k) => g.fillText(txt(c, d.head[ci] ?? ""), W - m - 24 - (valueCols.length - 1 - k) * valW, top + 18));
  g.textAlign = "left"; g.fillText(txt(c, d.head[1] ?? ""), m + 24 + rankW + 20, top + 18);
  let y = top + 44;
  const fs = Math.max(26, Math.min(44, plan.rowH * 0.42));
  d.rows.slice(0, plan.shown).forEach((r, i) => {
    drawRow(c, i, m, y, inner, plan.rowH);
    drawRank(c, i, r[0] ?? String(i + 1), m + 20, y + (plan.rowH - rankW) / 2, rankW);
    g.textBaseline = "middle"; g.textAlign = "left"; font(c, fs);
    g.fillStyle = t.fg; g.fillText(fitText(txt(c, r[1] ?? ""), inner - 40 - rankW - 20 - valueCols.length * valW - 16, (s) => width(c, s)), m + 20 + rankW + 20, y + plan.rowH / 2 + 2);
    g.textAlign = "right";
    valueCols.forEach((ci, k) => { const strong = ci === d.strong; font(c, fs * (strong ? 1.05 : 0.85), strong ? 800 : 500); g.fillStyle = strong ? t.accent : t.soft; g.fillText(r[ci] ?? "", W - m - 24 - (valueCols.length - 1 - k) * valW, y + plan.rowH / 2 + 2); });
    g.textAlign = "left"; y += plan.rowH + 12;
  });
  if (plan.more > 0) { font(c, 30, 600); g.fillStyle = t.soft; g.textBaseline = "middle"; g.fillText(`+${plan.more} more`, m + 20, y + plan.rowH / 2); }
}

function drawSchedule(c: Cx, d: Extract<Payload, { v: "schedule" }>["d"], top: number, bottom: number) {
  const { g, t, W, m } = c, inner = W - 2 * m, plan = planRows(d.slots.length, bottom - top, { minRow: 64, maxRow: 96 });
  let y = top; const fs = Math.max(26, Math.min(40, plan.rowH * 0.42));
  d.slots.slice(0, plan.shown).forEach((s, i) => {
    drawRow(c, i, m, y, inner, plan.rowH);
    g.textBaseline = "middle"; g.textAlign = "left"; font(c, fs); g.fillStyle = t.accent; g.fillText(`R${s.n}`, m + 24, y + plan.rowH / 2 + 2);
    font(c, fs); g.fillStyle = t.fg; const tw = fs * 6.6; g.fillText(`${s.start}-${s.end}`, m + 24 + fs * 2.4, y + plan.rowH / 2 + 2);
    font(c, fs * 0.9, 500); g.fillStyle = t.soft;
    g.fillText(fitText(s.label + (s.breakAfter ? `  (break ${s.breakAfter} min)` : ""), inner - 48 - fs * 2.4 - tw, (q) => width(c, q)), m + 24 + fs * 2.4 + tw, y + plan.rowH / 2 + 2);
    y += plan.rowH + 12;
  });
  if (plan.more > 0) { font(c, 30, 600); g.fillStyle = t.soft; g.textBaseline = "middle"; g.fillText(`+${plan.more} more rounds`, m + 20, y + plan.rowH / 2); }
}

function drawCountdown(c: Cx, d: Extract<Payload, { v: "countdown" }>["d"], top: number, bottom: number) {
  const { g, t, W, m } = c, r = remaining(d.at), mid = (top + bottom) / 2;
  g.textAlign = "center"; g.textBaseline = "middle";
  if (r.done) { font(c, 150, 900); g.fillStyle = t.accent; g.fillText("LIVE NOW", W / 2, mid); g.textAlign = "left"; return; }
  const cells: [number, string][] = [...(r.days > 0 ? ([[r.days, "days"]] as [number, string][]) : []), [r.hours, "hours"], [r.minutes, "minutes"], [r.seconds, "seconds"]];
  const gap = 20, cw = (W - 2 * m - gap * (cells.length - 1)) / cells.length, ch = Math.min(cw * 1.25, bottom - top), cy = mid - ch / 2;
  cells.forEach(([n, label], i) => {
    const x = m + i * (cw + gap);
    drawRow(c, 0, x, cy, cw, ch);
    font(c, cw * 0.56, 800); g.fillStyle = t.fg; g.fillText(String(n).padStart(2, "0"), x + cw / 2, cy + ch * 0.45);
    font(c, 26, 600); g.fillStyle = t.soft; g.fillText(txt(c, label), x + cw / 2, cy + ch * 0.86);
  });
  g.textAlign = "left";
}

function drawBracket(c: Cx, d: BracketData, top: number, bottom: number) {
  const { g, t, W, m } = c, { sections, note } = roundColumns(d);
  const cols = Math.max(...sections.map((s) => s.rounds.length)) + (d.champion !== undefined ? 1 : 0), gap = 16;
  const colW = (W - 2 * m - gap * (cols - 1)) / cols;
  let avail = bottom - top - (note ? 40 : 0);
  const weights = sections.map((s) => Math.max(1, ...s.rounds.map((r) => r.matches.length))), totalW = weights.reduce((a, b) => a + b, 0);
  const headH = (s: (typeof sections)[number]) => (s.name ? 34 : 0) + 30;
  avail -= sections.reduce((a, s) => a + headH(s), 0) + 18 * (sections.length - 1);
  let y = top;
  sections.forEach((s, si) => {
    const secH = Math.max(60, (avail * weights[si]!) / totalW);
    if (s.name) { font(c, 24); g.fillStyle = t.accent2; g.textBaseline = "top"; g.textAlign = "left"; g.fillText(txt(c, s.name), m, y); y += 34; }
    const bodyTop = y + 30, lineH = Math.max(22, Math.min(46, secH / (weights[si]! * 2.5)));
    s.rounds.forEach((r, ri) => {
      const x = m + ri * (colW + gap);
      font(c, 20, 600); g.fillStyle = t.soft; g.textAlign = "center"; g.textBaseline = "top"; g.fillText(fitText(txt(c, r.name), colW, (q) => width(c, q)), x + colW / 2, y + 2);
      matchCentres(r.matches.length, bodyTop, secH).forEach((cyy, mi) => {
        const match = r.matches[mi]!, bh = Math.min(lineH * 2, secH / r.matches.length - 6), by = cyy - bh / 2;
        g.fillStyle = t.row; rr(g, x, by, colW, bh, 8); g.fill(); g.strokeStyle = t.line; g.lineWidth = 2; rr(g, x + 1, by + 1, colW - 2, bh - 2, 8); g.stroke();
        [match.a, match.b].forEach((nm, side) => {
          const won = match.w === side, lost = match.w !== undefined && match.w !== side, ly = by + (bh / 2) * side;
          if (won) { g.fillStyle = withAlpha(t.accent, 0.28); g.fillRect(x + 3, ly + 2, colW - 6, bh / 2 - 3); }
          font(c, Math.min(lineH * 0.58, bh * 0.3), won ? 800 : 500); g.textAlign = "left"; g.textBaseline = "middle";
          g.fillStyle = lost ? t.soft : t.fg; g.globalAlpha = lost ? 0.6 : 1;
          g.fillText(fitText(nm, colW - 16, (q) => width(c, q)), x + 8, ly + bh / 4 + 1); g.globalAlpha = 1;
        });
      });
    });
    if (si === sections.length - 1 && d.champion !== undefined) {
      const x = m + s.rounds.length * (colW + gap);
      font(c, 20, 600); g.fillStyle = t.accent2; g.textAlign = "center"; g.textBaseline = "top"; g.fillText("CHAMPION", x + colW / 2, y + 2);
      const bh = Math.min(150, secH * 0.5), by = bodyTop + secH / 2 - bh / 2;
      g.fillStyle = withAlpha(t.accent, 0.22); rr(g, x, by, colW, bh, 16); g.fill(); g.strokeStyle = t.accent; g.lineWidth = 4; rr(g, x + 2, by + 2, colW - 4, bh - 4, 16); g.stroke();
      font(c, 28); g.fillStyle = t.fg; g.textBaseline = "middle"; g.fillText(fitText(d.champion || "To be decided", colW - 16, (q) => width(c, q)), x + colW / 2, by + bh / 2);
    }
    y = bodyTop + secH + 18;
  });
  g.textAlign = "left";
  if (note) { font(c, 24, 500); g.fillStyle = t.soft; g.textBaseline = "top"; g.fillText(note, m, bottom - 30); }
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("The picture could not be made in this browser."))), "image/png"));
}

async function begin(format: ShareFormat, themeId: string, fontClass?: string): Promise<{ c: Cx; canvas: HTMLCanvasElement }> {
  const t = themeById(themeId), { w, h } = SIZES[format], canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const g = canvas.getContext("2d");
  if (!g) throw new Error("The picture could not be made in this browser.");
  const c: Cx = { g, t, W: w, H: h, m: 64, fam: await loadFamily(t, fontClass), vmin: Math.min(w, h) / 100 };
  drawBackground(c);
  return { c, canvas };
}

/** Draws a view (table, schedule, bracket or countdown) as a PNG in the chosen design. 1080x1080 for a post, 1080x1920 for a story. */
export async function renderShareCard(payload: Payload, opts: Opts): Promise<Blob> {
  const { c, canvas } = await begin(opts.format, opts.theme, opts.fontClass);
  const x = opts.extras ?? payload.x;
  const title = opts.title ?? payload.d.title ?? "";
  const subtitle = payload.v === "table" ? payload.d.subtitle : payload.v === "schedule" ? payload.d.date : payload.v === "countdown" ? payload.d.subtitle : undefined;
  const top = drawHeader(c, title || "Esports Hub", subtitle || undefined);
  const bottom = (await drawBottom(c, x)) - 10;
  if (payload.v === "table") drawTable(c, payload.d, top, bottom);
  else if (payload.v === "schedule") drawSchedule(c, payload.d, top, bottom);
  else if (payload.v === "countdown") drawCountdown(c, payload.d, top, bottom);
  else drawBracket(c, payload.d, top, bottom);
  return toBlob(canvas);
}

/** Draws the winners poster: the champion large, then second and third. */
export async function renderWinnersCard(data: WinnersData, opts: { format: ShareFormat; theme: string; fontClass?: string }): Promise<Blob> {
  const { c, canvas } = await begin(opts.format, opts.theme, opts.fontClass);
  const { g, t, W, m } = c;
  const top = drawHeader(c, data.title || "Winners", data.event);
  const bottom = (await drawBottom(c, undefined)) - 10;
  const places = [data.first, data.second, data.third].map((n, i) => ({ n, i })).filter((p): p is { n: string; i: number } => Boolean(p.n));
  const gap = 24, heights = places.map((p) => (p.i === 0 ? 1.7 : 1)), unit = (bottom - top - gap * (places.length - 1)) / heights.reduce((a, b) => a + b, 0);
  let y = top; const inner = W - 2 * m;
  places.forEach((p) => {
    const h = Math.min(unit * (p.i === 0 ? 1.7 : 1), p.i === 0 ? 360 : 220);
    drawRow(c, p.i, m, y, inner, h);
    const size = Math.min(h * 0.5, 140), medal = t.medals[p.i]!;
    drawRank(c, p.i, String(p.i + 1), m + 28, y + (h - size) / 2, size);
    g.textAlign = "left"; g.textBaseline = "middle";
    font(c, p.i === 0 ? 30 : 24, 600); g.fillStyle = medal; g.fillText(txt(c, p.i === 0 ? "Winner" : p.i === 1 ? "Runner-up" : "Third place"), m + 28 + size + 28, y + h / 2 - (p.i === 0 ? 46 : 32));
    let fs = p.i === 0 ? 72 : 48; font(c, fs); const maxW = inner - 56 - size - 28;
    while (fs > 28 && width(c, txt(c, p.n)) > maxW) { fs -= 4; font(c, fs); }
    g.fillStyle = t.fg; g.fillText(fitText(txt(c, p.n), maxW, (q) => width(c, q)), m + 28 + size + 28, y + h / 2 + (p.i === 0 ? 20 : 14));
    y += h + gap;
  });
  return toBlob(canvas);
}
