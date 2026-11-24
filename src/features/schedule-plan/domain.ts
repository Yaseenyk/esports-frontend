/**
 * Day-wise match plans: every match of a bracket (or a plain number of matches) placed on stations and days, so that no match starts
 * before the matches that feed it have finished, and no team plays two matches at once. Pure, unit tested.
 */
import { build as buildDouble, type Match as DeMatch, type Ref } from "@/lib/doubleelim";
import { BYE, fixtures } from "@/lib/roundrobin";
import { seedOrder } from "@/lib/seeding";
import { formatTime, parseTime } from "@/lib/schedule";

export type Source = "count" | "single" | "double" | "league";
export const SOURCES: readonly { id: Source; label: string }[] = [
  { id: "single", label: "Single elimination bracket" },
  { id: "double", label: "Double elimination bracket" },
  { id: "league", label: "Round robin (everyone plays everyone)" },
  { id: "count", label: "Just a number of matches" },
];

export interface PlanMatch {
  /** "M1", "M2"... in play order. */
  id: string;
  /** Who plays: "Seed 1 vs Seed 8", "Winner of M1 vs Winner of M2", "Team 3 vs Team 5". */
  label: string;
  stage: string;
  /** Matches that must be finished before this one can start. */
  after: string[];
  /** Only played if needed (the grand final reset). */
  optional?: boolean;
}

export const MAX_TEAMS = 64, MAX_COUNT = 500;

// ------------------------------------------------------------------ matches from a bracket

type SRef = { t: "seed"; seed: number } | { t: "winner"; of: string } | { t: "bye" };

function roundName(r: number, rounds: number): string {
  if (r === rounds) return "Final";
  if (r === rounds - 1) return "Semi-finals";
  if (r === rounds - 2) return "Quarter-finals";
  return `Round ${r}`;
}

/** Single elimination with byes: only real matches (a seed with a bye goes straight to round 2). */
export function singleElim(n: number): PlanMatch[] {
  if (!Number.isInteger(n) || n < 2 || n > MAX_TEAMS) return [];
  let size = 2;
  while (size < n) size *= 2;
  const rounds = Math.log2(size), order = seedOrder(size), out: PlanMatch[] = [];
  const desc = (r: SRef) => (r.t === "seed" ? `Seed ${r.seed}` : r.t === "winner" ? `Winner of ${r.of}` : "Bye");
  let prev: SRef[] = order.map((s) => (s <= n ? { t: "seed", seed: s } : { t: "bye" }));
  for (let r = 1; r <= rounds; r++) {
    const next: SRef[] = [];
    for (let i = 0; i < prev.length; i += 2) {
      const a = prev[i]!, b = prev[i + 1]!;
      if (a.t === "bye" || b.t === "bye") { next.push(a.t === "bye" ? b : a); continue; }
      const id = `M${out.length + 1}`;
      out.push({ id, label: `${desc(a)} vs ${desc(b)}`, stage: roundName(r, rounds), after: [a, b].filter((x): x is { t: "winner"; of: string } => x.t === "winner").map((x) => x.of) });
      next.push({ t: "winner", of: id });
    }
    prev = next;
  }
  return out;
}

/** Double elimination from the bracket tool's own structure, numbered in a playable order. The reset final is marked optional. */
export function doubleElim(n: number): PlanMatch[] {
  if (!Number.isInteger(n) || n < 3 || n > MAX_TEAMS) return [];
  const b = buildDouble(Array.from({ length: n }, (_, i) => `Seed ${i + 1}`));
  if (!b) return [];
  const byId = new Map(b.matches.map((m) => [m.id, m]));
  // A side is a bye when no team can ever arrive there.
  const isBye = (r: Ref): boolean => {
    if (r.t === "bye") return true;
    if (r.t === "team") return false;
    const m = byId.get(r.of)!;
    return r.t === "winner" ? isBye(m.a) && isBye(m.b) : isBye(m.a) || isBye(m.b);
  };
  const real = (m: DeMatch) => !isBye(m.a) && !isBye(m.b);
  // The real matches a side waits for (a bye match passes its one team through, so we look behind it).
  const feeders = (r: Ref): string[] => {
    if (r.t === "team" || r.t === "bye") return [];
    const m = byId.get(r.of)!;
    if (real(m)) return [m.id];
    return [...feeders(m.a), ...feeders(m.b)];
  };
  const kept = b.matches.filter(real);
  const depth = new Map<string, number>();
  const d = (m: DeMatch): number => {
    if (depth.has(m.id)) return depth.get(m.id)!;
    const f = [...feeders(m.a), ...feeders(m.b), ...(m.id === "GF2" ? ["GF"] : [])];
    const v = f.length ? 1 + Math.max(...f.map((x) => d(byId.get(x)!))) : 0;
    depth.set(m.id, v);
    return v;
  };
  const rank = { W: 0, L: 1, F: 2 } as const;
  const ordered = [...kept].sort((x, y) => d(x) - d(y) || rank[x.bracket] - rank[y.bracket] || x.round - y.round || b.matches.indexOf(x) - b.matches.indexOf(y));
  const num = new Map(ordered.map((m, i) => [m.id, `M${i + 1}`]));
  const wRounds = Math.max(...kept.filter((m) => m.bracket === "W").map((m) => m.round));
  const lRounds = Math.max(0, ...kept.filter((m) => m.bracket === "L").map((m) => m.round));
  const desc = (r: Ref): string => {
    if (r.t === "team") return r.name;
    if (r.t === "bye") return "Bye";
    const m = byId.get(r.of)!;
    if (real(m)) return `${r.t === "winner" ? "Winner" : "Loser"} of ${num.get(m.id)}`;
    return desc(isBye(m.a) ? m.b : m.a);
  };
  const stage = (m: DeMatch) => m.bracket === "F" ? (m.id === "GF2" ? "Grand final reset (only if needed)" : "Grand final")
    : m.bracket === "W" ? (m.round === wRounds ? "Winners final" : `Winners round ${m.round}`)
    : (m.round === lRounds ? "Losers final" : `Losers round ${m.round}`);
  return ordered.map((m) => ({
    id: num.get(m.id)!, label: `${desc(m.a)} vs ${desc(m.b)}`, stage: stage(m),
    after: [...new Set([...feeders(m.a), ...feeders(m.b), ...(m.id === "GF2" ? ["GF"] : [])])].map((x) => num.get(x)!),
    ...(m.id === "GF2" ? { optional: true } : {}),
  }));
}

/** Round robin: every pair once, in the rounds the round robin tool makes. A team's next match waits for its previous one. */
export function league(n: number): PlanMatch[] {
  if (!Number.isInteger(n) || n < 2 || n > MAX_TEAMS) return [];
  const names = Array.from({ length: n }, (_, i) => `Team ${i + 1}`), last = new Map<string, string>(), out: PlanMatch[] = [];
  fixtures(names).forEach((round, r) => round.forEach((f) => {
    if (f.a === BYE || f.b === BYE) return;
    const id = `M${out.length + 1}`;
    out.push({ id, label: `${f.a} vs ${f.b}`, stage: `Round ${r + 1}`, after: [last.get(f.a), last.get(f.b)].filter((x): x is string => Boolean(x)) });
    last.set(f.a, id); last.set(f.b, id);
  }));
  return out;
}

/** A plain number of matches with no order between them. */
export function countMatches(n: number): PlanMatch[] {
  if (!Number.isInteger(n) || n < 1 || n > MAX_COUNT) return [];
  return Array.from({ length: n }, (_, i) => ({ id: `M${i + 1}`, label: `Match ${i + 1}`, stage: "", after: [] }));
}

export function planMatches(source: Source, n: number): PlanMatch[] {
  return source === "single" ? singleElim(n) : source === "double" ? doubleElim(n) : source === "league" ? league(n) : countMatches(n);
}

// ------------------------------------------------------------------ placing matches on days and stations

export interface DayHours { start: string; end: string }
export interface DayPlanInput {
  duration: number;
  /** Minutes between two matches: on the same station, and before a team plays again. */
  gap: number;
  stations: number;
  days: DayHours[];
  /** A break every day (lunch), skipped when minutes is 0 or it falls outside a day. */
  breakAt: string;
  breakMinutes: number;
}
export interface Placed { match: PlanMatch; day: number; station: number; start: number; end: number; startText: string; endText: string }
export interface DayPlan { placed: Placed[]; unplaced: PlanMatch[]; days: { day: number; matches: number; first?: string; last?: string }[] }
export type DayPlanCheck = { ok: true; plan: DayPlan } | { ok: false; error: string };

export const MAX_DAYS = 14, MAX_STATIONS = 100;
const clock = (abs: number) => formatTime(abs % 1440);

/** The open windows of every day as absolute minutes (day index x 1440 + time), with the daily break cut out. */
export function windows(i: DayPlanInput): [number, number][] {
  const out: [number, number][] = [], b = parseTime(i.breakAt);
  i.days.forEach((d, k) => {
    const s = parseTime(d.start)!, e = parseTime(d.end)!, off = k * 1440;
    if (b !== null && i.breakMinutes > 0 && b > s && b < e) {
      out.push([off + s, off + b]);
      if (b + i.breakMinutes < e) out.push([off + b + i.breakMinutes, off + e]);
    } else out.push([off + s, off + e]);
  });
  return out;
}

/** The earliest start at or after `t` where a match of `len` minutes fits inside one window, or null. */
export function fit(t: number, len: number, ws: [number, number][]): number | null {
  for (const [a, b] of ws) { const s = Math.max(a, t); if (s + len <= b) return s; }
  return null;
}

export function validate(i: DayPlanInput): string | null {
  if (!Number.isInteger(i.duration) || i.duration < 1 || i.duration > 600) return "Minutes per match must be a whole number from 1 to 600.";
  if (!Number.isInteger(i.gap) || i.gap < 0 || i.gap > 240) return "The gap must be a whole number from 0 to 240 minutes.";
  if (!Number.isInteger(i.stations) || i.stations < 1 || i.stations > MAX_STATIONS) return `Stations must be from 1 to ${MAX_STATIONS}.`;
  if (i.days.length < 1 || i.days.length > MAX_DAYS) return `Plan 1 to ${MAX_DAYS} days.`;
  for (const [k, d] of i.days.entries()) {
    const s = parseTime(d.start), e = parseTime(d.end);
    if (s === null || e === null) return `Day ${k + 1}: type a start and an end time.`;
    if (e <= s) return `Day ${k + 1}: the end time must be after the start time.`;
  }
  if (i.breakMinutes > 0 && parseTime(i.breakAt) === null) return "Type the time the daily break starts, or set it to 0 minutes.";
  if (!Number.isInteger(i.breakMinutes) || i.breakMinutes < 0 || i.breakMinutes > 480) return "The break must be from 0 to 480 minutes.";
  return null;
}

/**
 * Places matches in their order: each goes to the station where it can start soonest, no earlier than `gap` minutes after every match it
 * waits for, inside a day window and outside the break. A match that does not fit in the days given is listed as not placed, and so is
 * every match that waits for it.
 */
export function planDays(matches: PlanMatch[], i: DayPlanInput): DayPlanCheck {
  const err = validate(i);
  if (err) return { ok: false, error: err };
  if (matches.length === 0) return { ok: false, error: "There are no matches to plan. Check the number of teams." };
  const ws = windows(i), free = Array.from({ length: i.stations }, () => ws[0]![0]), done = new Map<string, Placed>(), placed: Placed[] = [], unplaced: PlanMatch[] = [];
  for (const m of matches) {
    const before = m.after.map((a) => done.get(a));
    if (before.some((x) => !x)) { unplaced.push(m); continue; }
    const ready = Math.max(ws[0]![0], ...before.map((x) => x!.end + i.gap));
    let best: { s: number; st: number } | null = null;
    free.forEach((f, st) => { const s = fit(Math.max(f, ready), i.duration, ws); if (s !== null && (!best || s < best.s)) best = { s, st }; });
    if (!best) { unplaced.push(m); continue; }
    const { s, st } = best as { s: number; st: number };
    const p: Placed = { match: m, day: Math.floor(s / 1440) + 1, station: st + 1, start: s, end: s + i.duration, startText: clock(s), endText: clock(s + i.duration) };
    free[st] = p.end + i.gap; done.set(m.id, p); placed.push(p);
  }
  placed.sort((a, b) => a.start - b.start || a.station - b.station);
  const days = i.days.map((_, k) => { const here = placed.filter((p) => p.day === k + 1); return { day: k + 1, matches: here.length, first: here[0]?.startText, last: here.length ? clock(Math.max(...here.map((p) => p.end))) : undefined }; });
  return { ok: true, plan: { placed, unplaced, days } };
}

/** True when no placed match starts before every match it waits for has ended (plus the gap). Used by the tests. */
export function respectsOrder(plan: DayPlan, gap: number): boolean {
  const at = new Map(plan.placed.map((p) => [p.match.id, p]));
  return plan.placed.every((p) => p.match.after.every((a) => { const f = at.get(a); return f !== undefined && p.start >= f.end + gap; }));
}

/** The plan as CSV rows (header first). */
export function planCsv(plan: DayPlan): string[][] {
  return [["Day", "Start", "End", "Station", "Match", "Stage", "Teams"], ...plan.placed.map((p) => [String(p.day), p.startText, p.endText, String(p.station), p.match.id, p.match.stage, p.match.label])];
}
