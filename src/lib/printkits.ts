/**
 * Pure layout maths for the printable kits (score sheets, referee sheets, gate signs, bracket poster).
 * No drawing here: everything returns plain numbers and text, in millimetres, so it can be tested and so the preview and the PDF
 * are drawn from exactly the same description of each page.
 */
import { seedOrder, uniqueTeams } from "./seeding";

export type Paper = "A4" | "A3";
export type Orient = "portrait" | "landscape";
export type KitKind = "match" | "br" | "referee" | "signs" | "bracket";

export const PAPER_MM: Record<Paper, { w: number; h: number }> = { A4: { w: 210, h: 297 }, A3: { w: 297, h: 420 } };
export const MAX_PAGES = 40;
export const MAX_TEAMS = 200;
export const MAX_BRACKET_TEAMS = 32;
export const MAX_NAME = 60;

/** Page size in millimetres for a paper and orientation. Anything unknown falls back to A4 portrait. */
export function pageMm(paper: Paper, orient: Orient): { w: number; h: number } {
  const p = PAPER_MM[paper] ?? PAPER_MM.A4;
  return orient === "landscape" ? { w: p.h, h: p.w } : { w: p.w, h: p.h };
}

/** One layout unit: 1 on the short side of A4 (210 mm). Everything is sized in units so A3 is a clean enlargement. */
export const unitOf = (w: number, h: number) => Math.min(w, h) / 210;

export function clampInt(n: unknown, min: number, max: number, fallback = min): number {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(v)));
}

/** Cleans pasted team names: no control characters, one space between words, no repeats, at most `max` names, each at most 60 characters. */
export function cleanTeams(text: string, max = MAX_TEAMS): string[] {
  const lines = text.split(/\r?\n/).map((l) => l.replace(/[\u0000-\u001f\u007f]/g, " "));
  return uniqueTeams(lines, max).map((t) => Array.from(t).slice(0, MAX_NAME).join(""));
}

/** Splits a list into pages of `per` items (at least 1). An empty list gives no pages. */
export function chunk<T>(items: readonly T[], per: number): T[][] {
  const n = Math.max(1, Math.floor(per) || 1);
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += n) out.push(items.slice(i, i + n));
  return out;
}

/** How many rows of height `rowH` fit in `avail` (never less than 1). */
export const rowsCapacity = (avail: number, rowH: number) => Math.max(1, Math.floor(avail / Math.max(0.1, rowH)));

/* ---------- text fitting ---------- */

/** Measures a text at a size and returns its width in the same units as the size (millimetres). */
export type Measure = (text: string, size: number) => number;

/** Cuts a text to fit `maxW` and ends it with an ellipsis. Works on whole characters, so Devanagari and emoji are not split in half. */
export function truncateToFit(measure: Measure, text: string, maxW: number, size: number): string {
  if (measure(text, size) <= maxW) return text;
  const chars = Array.from(text);
  let lo = 0, hi = chars.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (measure(`${chars.slice(0, mid).join("").trimEnd()}…`, size) <= maxW) lo = mid; else hi = mid - 1;
  }
  return lo === 0 ? "…" : `${chars.slice(0, lo).join("").trimEnd()}…`;
}

/** One line of text: the biggest size from `maxSize` down to `minSize` that fits `maxW`; if even the smallest does not fit the text is cut with an ellipsis. */
export function fitText(measure: Measure, text: string, maxW: number, maxSize: number, minSize: number): { text: string; size: number; shrunk: boolean; cut: boolean } {
  const lo = Math.min(minSize, maxSize);
  if (!text) return { text, size: maxSize, shrunk: false, cut: false };
  let size = maxSize;
  const w = measure(text, size);
  if (w <= maxW) return { text, size, shrunk: false, cut: false };
  size = Math.max(lo, maxSize * (maxW / w));
  while (size > lo && measure(text, size) > maxW) size = Math.max(lo, size - 0.25);
  if (measure(text, size) <= maxW) return { text, size, shrunk: true, cut: false };
  return { text: truncateToFit(measure, text, maxW, size), size, shrunk: true, cut: true };
}

/** Wraps a text into lines no wider than `maxW`. Breaks at spaces; a single word that is too wide is broken between characters. */
export function wrapLines(measure: Measure, text: string, maxW: number, size: number): string[] {
  const out: string[] = [];
  let line = "";
  const push = () => { if (line) out.push(line); line = ""; };
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (measure(next, size) <= maxW) { line = next; continue; }
    push();
    if (measure(word, size) <= maxW) { line = word; continue; }
    let part = "";
    for (const ch of Array.from(word)) {
      if (part && measure(part + ch, size) > maxW) { out.push(part); part = ch; } else part += ch;
    }
    line = part;
  }
  push();
  return out;
}

/** A block of wrapped text: the biggest size that fits both `maxW` and `maxH` (lines times line height). */
export function fitBlock(measure: Measure, text: string, maxW: number, maxH: number, maxSize: number, minSize: number, lineHeight = 1.15): { size: number; lines: string[]; cut: boolean } {
  let size = Math.max(minSize, maxSize);
  for (let i = 0; i < 200; i++) {
    const lines = wrapLines(measure, text, maxW, size);
    if (lines.length * size * lineHeight <= maxH) return { size, lines, cut: false };
    if (size <= minSize) break;
    size = Math.max(minSize, size * 0.94);
  }
  const lines = wrapLines(measure, text, maxW, size);
  const room = Math.max(1, Math.floor(maxH / (size * lineHeight)));
  if (lines.length <= room) return { size, lines, cut: false };
  const kept = lines.slice(0, room);
  kept[room - 1] = truncateToFit(measure, `${kept[room - 1]} ${lines.slice(room).join(" ")}`, maxW, size);
  return { size, lines: kept, cut: true };
}

/* ---------- gate signs ---------- */

export interface SignPreset { id: string; en: string; hi?: string; mr?: string }

/**
 * The common gate words. Hindi and Marathi are given only where the word is plain and well known; the rest are English only on purpose.
 * Have a Hindi or Marathi reader look at a printed sign once before the event.
 */
export const SIGN_PRESETS: SignPreset[] = [
  { id: "registration", en: "Registration", hi: "पंजीकरण", mr: "नोंदणी" },
  { id: "checkin", en: "Check-in" },
  { id: "players", en: "Players only", hi: "केवल खिलाड़ी", mr: "फक्त खेळाडू" },
  { id: "captains", en: "Team captains" },
  { id: "volunteers", en: "Volunteers", hi: "स्वयंसेवक", mr: "स्वयंसेवक" },
  { id: "press", en: "Press", hi: "प्रेस", mr: "प्रेस" },
  { id: "toilets", en: "Toilets", hi: "शौचालय", mr: "शौचालय" },
  { id: "stage", en: "Stage", hi: "मंच" },
];

export interface SignText { en: string; hi?: string; mr?: string }

/** The signs to print: the chosen presets in the order of the list, then one sign per custom line. Custom text is English only (whatever the person typed). */
export function signTexts(ids: readonly string[], custom: string, langs: { hi: boolean; mr: boolean }): SignText[] {
  const out: SignText[] = [];
  for (const p of SIGN_PRESETS) {
    if (!ids.includes(p.id)) continue;
    out.push({ en: p.en, hi: langs.hi ? p.hi : undefined, mr: langs.mr ? p.mr : undefined });
  }
  for (const raw of custom.split(/\r?\n/)) {
    const t = raw.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
    if (t) out.push({ en: Array.from(t).slice(0, 80).join("") });
  }
  return out;
}

/* ---------- bracket ---------- */

export interface BracketBox { round: number; index: number; x: number; y: number; w: number; h: number; a: string; b: string; aBye: boolean; bBye: boolean; aAuto: boolean; bAuto: boolean }
export interface BracketGeo {
  size: number; rounds: number; teams: number; byes: number;
  boxes: BracketBox[];
  /** Elbow lines from the right of a box to the left of the next one: [x1, y1, xMid, x2, y2]. */
  links: { x1: number; y1: number; xm: number; x2: number; y2: number }[];
  champion: { x: number; y: number; w: number; h: number };
  roundNames: { name: string; x: number; w: number }[];
}

export const nextPow2 = (n: number) => { let p = 2; while (p < n) p *= 2; return p; };

export function roundName(round: number, rounds: number, size: number): string {
  const left = rounds - round; // 1 = final
  if (left === 1) return "Final";
  if (left === 2) return "Semi-finals";
  if (left === 3) return "Quarter-finals";
  return `Round of ${size / 2 ** round}`;
}

/**
 * Single elimination bracket for 2 to 32 teams inside `area`. The team count is rounded up to a power of two and the missing opponents
 * are byes (a bye box is drawn as "Bye" and the team that gets it is already written into round 2). Seeding follows the order of the list:
 * line 1 is seed 1. Returns null for fewer than 2 teams. More than 32 teams are cut to 32.
 */
export function bracketGeometry(teamsIn: readonly string[], area: { x: number; y: number; w: number; h: number }): BracketGeo | null {
  const teams = teamsIn.slice(0, MAX_BRACKET_TEAMS);
  if (teams.length < 2) return null;
  const size = nextPow2(teams.length), rounds = Math.log2(size), half = size / 2;
  const conn = 0.18;
  const colW = area.w / (rounds + 1 + conn * rounds), connW = colW * conn;
  const band1 = area.h / half;
  const boxH = Math.min(band1 * 0.82, colW * 0.62);
  const order = seedOrder(size);
  const boxes: BracketBox[] = [];
  const xOf = (r: number) => area.x + r * (colW + connW);
  const centreOf = (r: number, i: number) => area.y + band1 * 2 ** r * (i + 0.5);
  for (let r = 0; r < rounds; r++) {
    const count = half / 2 ** r;
    for (let i = 0; i < count; i++) {
      boxes.push({ round: r, index: i, x: xOf(r), y: centreOf(r, i) - boxH / 2, w: colW, h: boxH, a: "", b: "", aBye: false, bBye: false, aAuto: false, bAuto: false });
    }
  }
  const at = (r: number, i: number) => boxes.find((b) => b.round === r && b.index === i)!;
  for (let i = 0; i < half; i++) {
    const m = at(0, i);
    const sa = order[2 * i]!, sb = order[2 * i + 1]!;
    const ta = teams[sa - 1], tb = teams[sb - 1];
    m.a = ta ?? "Bye"; m.b = tb ?? "Bye"; m.aBye = ta === undefined; m.bBye = tb === undefined;
    if ((ta === undefined) !== (tb === undefined) && rounds > 1) {
      const nxt = at(1, Math.floor(i / 2));
      const winner = (ta ?? tb)!;
      if (i % 2 === 0) { nxt.a = winner; nxt.aAuto = true; } else { nxt.b = winner; nxt.bAuto = true; }
    }
  }
  const links: BracketGeo["links"] = [];
  for (let r = 0; r < rounds - 1; r++) {
    for (let i = 0; i < half / 2 ** r; i++) {
      const from = at(r, i), to = at(r + 1, Math.floor(i / 2));
      const yTo = to.y + to.h * (i % 2 === 0 ? 0.25 : 0.75);
      links.push({ x1: from.x + from.w, y1: from.y + from.h / 2, xm: from.x + from.w + connW / 2, x2: to.x, y2: yTo });
    }
  }
  const last = at(rounds - 1, 0);
  const champion = { x: xOf(rounds), y: last.y, w: colW, h: boxH };
  links.push({ x1: last.x + last.w, y1: last.y + last.h / 2, xm: last.x + last.w + connW / 2, x2: champion.x, y2: champion.y + champion.h / 2 });
  const roundNames = Array.from({ length: rounds }, (_, r) => ({ name: roundName(r, rounds, size), x: xOf(r), w: colW }));
  return { size, rounds, teams: teams.length, byes: size - teams.length, boxes, links, champion, roundNames };
}

/* ---------- page descriptions ---------- */

export const REFEREE_SECTIONS: { title: string; items: string[] }[] = [
  { title: "Before the match", items: [
    "Check that the place is ready and that every team is here.",
    "Confirm the team names and the number of players with the organiser.",
    "Tell both captains the rules and how points are counted.",
    "Check that the game settings are the ones the organiser agreed.",
    "Write down the start time.",
    "Agree with the captains how a problem should be raised.",
  ] },
  { title: "During the match", items: [
    "Watch for anything that breaks the rules. Write down the time and the team.",
    "Write each unusual event in the incident log, not later from memory.",
    "Tell the captains about any pause or delay and how long it will be.",
    "Keep the score or the placements as they happen.",
  ] },
  { title: "After the match", items: [
    "Write the final score, or the placement and kills of every team.",
    "Ask each captain to check the result and say if they agree.",
    "Write any problem that is still open in the incident log.",
    "Sign the sheet and give it to the organiser.",
  ] },
];

export const REFEREE_NOTE = "These are general reminders, not official rules. Write your own tournament rules below and tell the captains before the first match.";
export const INCIDENT_COLUMNS = ["No.", "Time", "Team", "What happened", "What was decided", "Initials"];
export const INCIDENT_WEIGHTS = [0.07, 0.1, 0.18, 0.31, 0.26, 0.08];

interface PageBase { w: number; h: number; event: string; date: string; label: string }
export type KitPage = PageBase & (
  | { type: "match"; rows: { no: number; a: string; b: string }[] }
  | { type: "br"; game: number; games: number; rows: { no: number; team: string }[]; rowH: number }
  | { type: "referee" }
  | { type: "incident"; rows: number; rowH: number; start: number }
  | { type: "sign"; sign: SignText }
  | { type: "bracket"; geo: BracketGeo | null; area: { x: number; y: number; w: number; h: number } }
);

export interface KitOptions {
  kind: KitKind; event: string; date: string; paper: Paper; orient: Orient;
  teams: string[]; /** matches for a match sheet; games for battle royale; copies for the rest */ count: number;
  signIds: string[]; custom: string; hi: boolean; mr: boolean;
}

/** The orientation a kit starts with: only the bracket poster is wide. */
export const defaultOrient = (k: KitKind): Orient => (k === "bracket" ? "landscape" : "portrait");

const HEAD = 38, FOOT_MATCH = 26, FOOT_BR = 16, MARGIN = 12;

export function matchCapacity(w: number, h: number) {
  const u = unitOf(w, h);
  return rowsCapacity(h - 2 * MARGIN * u - HEAD * u - FOOT_MATCH * u, 24 * u);
}
export function brLayout(w: number, h: number, rows: number) {
  const u = unitOf(w, h), avail = h - 2 * MARGIN * u - HEAD * u - FOOT_BR * u - 10 * u;
  const cap = rowsCapacity(avail, 9 * u);
  const per = Math.min(rows, cap);
  return { cap, rowH: Math.min(15 * u, Math.max(9 * u, avail / Math.max(1, per))) };
}
export function incidentLayout(w: number, h: number) {
  const u = unitOf(w, h), avail = h - 2 * MARGIN * u - HEAD * u - FOOT_BR * u - 10 * u;
  const rowH = 16 * u;
  return { rows: rowsCapacity(avail, rowH), rowH };
}

/** Everything that will be printed, page by page. At most MAX_PAGES pages. */
export function buildKit(o: KitOptions): KitPage[] {
  const { w, h } = pageMm(o.paper, o.orient);
  const base = { w, h, event: o.event.trim(), date: o.date.trim() };
  const pages: KitPage[] = [];
  const n = clampInt(o.count, 1, 200);
  const teams = o.teams.slice(0, MAX_TEAMS);
  if (o.kind === "match") {
    const total = Math.max(n, Math.ceil(teams.length / 2));
    const rows = Array.from({ length: total }, (_, i) => ({ no: i + 1, a: teams[2 * i] ?? "", b: teams[2 * i + 1] ?? "" }));
    for (const part of chunk(rows, matchCapacity(w, h))) pages.push({ ...base, type: "match", rows: part, label: "Match score sheet" });
  } else if (o.kind === "br") {
    const names = teams.length ? teams : Array.from({ length: 12 }, () => "");
    const rows = names.map((team, i) => ({ no: i + 1, team }));
    const lay = brLayout(w, h, rows.length);
    const games = clampInt(o.count, 1, 30);
    for (let g = 1; g <= games; g++) for (const part of chunk(rows, lay.cap)) pages.push({ ...base, type: "br", game: g, games, rows: part, rowH: brLayout(w, h, part.length).rowH, label: "Battle royale score sheet" });
  } else if (o.kind === "referee") {
    const lay = incidentLayout(w, h);
    for (let c = 0; c < clampInt(o.count, 1, 20); c++) {
      pages.push({ ...base, type: "referee", label: "Referee sheet" });
      pages.push({ ...base, type: "incident", rows: lay.rows, rowH: lay.rowH, start: 1, label: "Incident log" });
    }
  } else if (o.kind === "signs") {
    const signs = signTexts(o.signIds, o.custom, { hi: o.hi, mr: o.mr });
    for (const s of signs) for (let c = 0; c < clampInt(o.count, 1, 5); c++) pages.push({ ...base, type: "sign", sign: s, label: s.en });
  } else {
    const u = unitOf(w, h), m = 12 * u, top = m + 40 * u;
    const area = { x: m, y: top, w: w - 2 * m, h: h - top - m - 8 * u };
    const geo = bracketGeometry(teams, area);
    for (let c = 0; c < clampInt(o.count, 1, 5); c++) pages.push({ ...base, type: "bracket", geo, area, label: "Bracket" });
  }
  return pages.slice(0, MAX_PAGES);
}
