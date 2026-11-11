/**
 * Season leaderboard: pure functions that work out a table across days from head-to-head matches (win, draw, loss points) and battle royale
 * results (a placement scale plus points per kill). No browser or network code, so all of it is unit tested.
 *
 * Match numbers (used to say "Day 1 = matches 1 to 6"): a battle royale game uses its own game number; head-to-head matches are counted
 * in list order (stage, round, slot), starting at 1. An event that mixes both should use one kind or check the numbers in the panel.
 */
import { EXAMPLE_SCALE, matchPoints } from "./points";
import { groupByStage, isDone, winnerOf, type BrResult, type PublicMatch } from "./matches";

export interface LeagueDay { label: string; fromMatch: number; toMatch: number; date?: string }
export interface LeagueSettings { title: string; scale: number[]; perKill: number; winPts: number; drawPts: number; lossPts: number; days: LeagueDay[] }
/** What the public page gets from the server. */
export interface PublicLeague {
  title: string;
  event: { name: string; date: string; venue: string };
  settings: Omit<LeagueSettings, "title">;
  matches: PublicMatch[];
  br: BrResult[];
  updatedAt: string | null;
}
/** What the organiser's panel gets from the server. */
export interface LeagueState extends LeagueSettings { slug: string | null; published: boolean; updatedAt: string | null }

export const MAX_DAYS = 31;
export const MAX_MATCH_NO = 9999;
export const DEFAULT_SETTINGS: LeagueSettings = { title: "", scale: [], perKill: 1, winPts: 3, drawPts: 1, lossPts: 0, days: [] };
/** A commonly used battle royale scale for custom rooms. Official events publish their own: always match your rulebook. */
export const COMMON_SCALE: number[] = [...EXAMPLE_SCALE.placement];

/** The order teams are separated in when points are level, in words, for the page and the panel. */
export const TIEBREAKS = ["more points", "more wins (match wins plus first places)", "better score difference (goals or rounds for minus against)", "more kills", "team name, A to Z"] as const;
export const tieBreakText = (): string => `When teams are level, the order is decided by: ${TIEBREAKS.map((t, i) => `${i + 1}) ${t}`).join(", ")}. Teams that are level on all of these share a rank.`;

export type FormKind = "W" | "D" | "L" | "P";
export interface FormItem { kind: FormKind; /** Short text for display, for example "W" or "3rd". */ short: string; /** Words for screen readers. */ label: string }
export interface DayInfo { index: number; label: string; fromMatch: number; toMatch: number; date?: string; /** True for the day made automatically for matches outside every day you set. */ auto?: boolean }
export interface LeagueRow {
  team: string;
  rank: number;
  /** True when another team has the same rank (level on every tie-break). */
  tied: boolean;
  points: number;
  /** Points scored on this day only. */
  dayPoints: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  /** Battle royale games won (first place). */
  firsts: number;
  kills: number;
  diff: number;
  /** Places gained since the previous day: positive is up, negative is down, 0 is no change, null when it cannot be compared. */
  movement: number | null;
  /** Last five results up to and including this day, oldest first. */
  form: FormItem[];
}
export interface LeagueTable { day: DayInfo; rows: LeagueRow[]; /** Matches or games with a result counted on this day. */ results: number }
export interface League { days: DayInfo[]; tables: LeagueTable[]; /** Index of the last day with a result; 0 when there is none yet. */ latest: number; teams: string[]; empty: boolean }

// ---------- settings ----------

const num = (v: unknown, d: number): number => (typeof v === "number" && Number.isFinite(v) ? v : d);

/** Turns whatever the server sent into settings that are safe to use: wrong types fall back to the defaults, days are put in order. */
export function parseSettings(x: unknown): LeagueSettings {
  const o = (typeof x === "object" && x !== null ? x : {}) as Record<string, unknown>;
  const scale = Array.isArray(o.scale) ? o.scale.filter((n): n is number => typeof n === "number" && Number.isFinite(n) && n >= 0).slice(0, 100) : [];
  const days: LeagueDay[] = [];
  if (Array.isArray(o.days)) {
    for (const d of o.days.slice(0, MAX_DAYS)) {
      const r = (typeof d === "object" && d !== null ? d : {}) as Record<string, unknown>;
      const from = Math.trunc(num(r.fromMatch, 0)), to = Math.trunc(num(r.toMatch, 0));
      if (from < 1 || to < from || from > MAX_MATCH_NO) continue;
      const day: LeagueDay = { label: typeof r.label === "string" && r.label.trim() ? r.label.trim().slice(0, 40) : `Day ${days.length + 1}`, fromMatch: from, toMatch: Math.min(to, MAX_MATCH_NO) };
      if (typeof r.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(r.date)) day.date = r.date;
      days.push(day);
    }
  }
  return {
    title: typeof o.title === "string" ? o.title.trim().slice(0, 80) : "",
    scale, perKill: num(o.perKill, DEFAULT_SETTINGS.perKill), winPts: num(o.winPts, DEFAULT_SETTINGS.winPts), drawPts: num(o.drawPts, DEFAULT_SETTINGS.drawPts), lossPts: num(o.lossPts, DEFAULT_SETTINGS.lossPts),
    days: normalizeDays(days),
  };
}

/** Puts days in order without sharing matches: each day starts after the one before and ends no earlier than it starts. */
export function normalizeDays(days: LeagueDay[]): LeagueDay[] {
  const out: LeagueDay[] = [];
  let prev = 0;
  for (const d of days.slice(0, MAX_DAYS)) {
    const from = Math.min(MAX_MATCH_NO, Math.max(d.fromMatch, prev + 1));
    const to = Math.min(MAX_MATCH_NO, Math.max(d.toMatch, from));
    if (from > MAX_MATCH_NO || prev >= MAX_MATCH_NO) break;
    out.push({ ...d, fromMatch: from, toMatch: to });
    prev = to;
  }
  return out;
}

/** The next day to add: it starts right after the last one and is as long as the last one (or 5 matches for the first). */
export function addDay(days: LeagueDay[]): LeagueDay[] {
  if (days.length >= MAX_DAYS) return days;
  const last = days[days.length - 1];
  const from = last ? last.toMatch + 1 : 1;
  const size = last ? last.toMatch - last.fromMatch + 1 : 5;
  if (from > MAX_MATCH_NO) return days;
  return normalizeDays([...days, { label: `Day ${days.length + 1}`, fromMatch: from, toMatch: Math.min(MAX_MATCH_NO, from + size - 1) }]);
}

export const removeDay = (days: LeagueDay[], i: number): LeagueDay[] => normalizeDays(days.filter((_, k) => k !== i));

/** Changes one day. Later days move along so nothing overlaps. */
export function updateDay(days: LeagueDay[], i: number, patch: Partial<LeagueDay>): LeagueDay[] {
  return normalizeDays(days.map((d, k) => (k === i ? { ...d, ...patch } : d)));
}

/** The first thing wrong with a list of days, in plain words, or null. The server applies the same rules. */
export function daysProblem(days: LeagueDay[]): string | null {
  let prev = 0;
  for (let i = 0; i < days.length; i++) {
    const d = days[i]!;
    if (!d.label.trim()) return `Day ${i + 1} needs a name.`;
    if (d.label.trim().length > 40) return `The name of day ${i + 1} is too long (40 characters at most).`;
    if (!Number.isInteger(d.fromMatch) || !Number.isInteger(d.toMatch) || d.fromMatch < 1 || d.toMatch > MAX_MATCH_NO) return `Day ${i + 1} needs whole match numbers from 1 to ${MAX_MATCH_NO}.`;
    if (d.toMatch < d.fromMatch) return `Day ${i + 1} ends before it starts.`;
    if (d.fromMatch <= prev) return `Day ${i + 1} shares matches with the day before. Days must be in order.`;
    prev = d.toMatch;
  }
  return null;
}

/** "Day 1 = matches 1 to 6", or "Day 3 = match 12" for a single match. */
export const dayRangeText = (d: Pick<LeagueDay, "label" | "fromMatch" | "toMatch">): string => `${d.label} = ${d.fromMatch === d.toMatch ? `match ${d.fromMatch}` : `matches ${d.fromMatch} to ${d.toMatch}`}`;

const fmt = (n: number): string => (Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100));
export const ordinal = (n: number): string => { const v = n % 100; return `${n}${v >= 11 && v <= 13 ? "th" : (["th", "st", "nd", "rd"][n % 10] ?? "th")}`; };

/** The scoring rules as plain sentences, shown on the page and in the panel so nobody has to guess. */
export function scoringText(s: Pick<LeagueSettings, "scale" | "perKill" | "winPts" | "drawPts" | "lossPts">): string[] {
  const out = [`In head-to-head matches a win is ${fmt(s.winPts)} points, a draw is ${fmt(s.drawPts)} and a loss is ${fmt(s.lossPts)}.`];
  if (s.scale.length || s.perKill) {
    const places = s.scale.slice(0, 8).map((p, i) => `${ordinal(i + 1)} place scores ${fmt(p)}`).join(", ");
    const placing = s.scale.length ? `${places}${s.scale.length > 8 ? ", and so on down the list" : ""}. Any lower place scores 0.` : "placement scores nothing.";
    out.push(`In battle royale games, ${placing} Each kill is worth ${fmt(s.perKill)}.`);
  }
  return out;
}

export const leagueUrl = (origin: string, slug: string): string => `${origin.replace(/\/$/, "")}/league/?s=${encodeURIComponent(slug)}`;

// ---------- numbering ----------

/** Match number of every head-to-head match: 1, 2, 3 in list order (stage, round, slot). */
export function numberMatches(matches: PublicMatch[]): Map<string, number> {
  const out = new Map<string, number>();
  let n = 0;
  for (const s of groupByStage(matches)) for (const r of s.rounds) for (const m of r.matches) out.set(m.id, ++n);
  return out;
}

// ---------- the table ----------

interface Entry {
  team: string; day: number; no: number; order: number;
  pts: number; kind: FormKind; short: string; label: string;
  won: number; drawn: number; lost: number; firsts: number; kills: number; diff: number;
}

const clean = (t: unknown): string => (typeof t === "string" ? t.replace(/\s+/g, " ").trim() : "");

/** Movement as an arrow plus words, so it never relies on colour or a symbol alone. */
export function movementInfo(m: number | null): { arrow: string; text: string } {
  if (m === null) return { arrow: "•", text: "New" };
  if (m > 0) return { arrow: "▲", text: `Up ${m} ${m === 1 ? "place" : "places"}` };
  if (m < 0) return { arrow: "▼", text: `Down ${-m} ${m === -1 ? "place" : "places"}` };
  return { arrow: "–", text: "No change" };
}

const better = (a: Agg, b: Agg): number => b.points - a.points || b.wins - a.wins || b.diff - a.diff || b.kills - a.kills;
interface Agg { team: string; points: number; dayPoints: number; played: number; won: number; drawn: number; lost: number; firsts: number; kills: number; diff: number; wins: number }

/**
 * Works out the table after each day. Table `i` counts every day up to and including day `i`; `dayPoints` is only that day.
 * With no days set there is one day called "Season". Matches that fall outside every day you set go into an extra last day, "Other matches".
 * Only finished or forfeited matches with two named, different teams count; battle royale rows need a team name and a placement of 1 or more.
 * Teams with a name but no result yet still appear (at 0 points). Team names match ignoring case and spacing.
 */
export function buildLeague(input: { matches: PublicMatch[]; br: BrResult[]; settings: LeagueSettings }): League {
  const { matches, settings } = input;
  const br = Array.isArray(input.br) ? input.br : [];
  const canon = new Map<string, string>();
  const name = (t: unknown): string => { const c = clean(t); if (!c) return ""; const k = c.toLowerCase(); if (!canon.has(k)) canon.set(k, c); return canon.get(k)!; };

  const set = parseSettings(settings);
  const configured: DayInfo[] = set.days.length
    ? set.days.map((d, i) => ({ index: i, label: d.label, fromMatch: d.fromMatch, toMatch: d.toMatch, ...(d.date ? { date: d.date } : {}) }))
    : [{ index: 0, label: "Season", fromMatch: 1, toMatch: MAX_MATCH_NO }];
  const OTHER = configured.length;
  const dayOf = (no: number): number => { const i = configured.findIndex((d) => no >= d.fromMatch && no <= d.toMatch); return i < 0 ? OTHER : i; };

  const numbers = numberMatches(matches);
  const entries: Entry[] = [];
  const counted = new Set<string>();

  for (const m of matches) { name(m.a); name(m.b); }
  for (const r of br) name(r.team);

  for (const m of matches) {
    const a = name(m.a), b = name(m.b);
    if (!a || !b || a.toLowerCase() === b.toLowerCase() || !isDone(m)) continue;
    const w = winnerOf(m);
    if (w === null) continue;
    let sa = m.scoreA ?? null, sb = m.scoreB ?? null;
    if ((sa === null || sb === null) && m.status === "forfeit" && (w === "a" || w === "b")) { sa = w === "a" ? 1 : 0; sb = w === "b" ? 1 : 0; }
    const no = numbers.get(m.id) ?? 0;
    const day = dayOf(no);
    const diffA = sa !== null && sb !== null ? sa - sb : 0;
    const mk = (team: string, mine: "a" | "b"): Entry => {
      const res: FormKind = w === "draw" ? "D" : w === mine ? "W" : "L";
      const pts = res === "W" ? set.winPts : res === "D" ? set.drawPts : set.lossPts;
      return { team, day, no, order: 0, pts, kind: res, short: res, label: res === "W" ? "Won" : res === "D" ? "Drew" : "Lost", won: res === "W" ? 1 : 0, drawn: res === "D" ? 1 : 0, lost: res === "L" ? 1 : 0, firsts: 0, kills: 0, diff: mine === "a" ? diffA : -diffA };
    };
    entries.push(mk(a, "a"), mk(b, "b"));
    counted.add(`h:${m.id}`);
  }

  const seenBr = new Set<string>();
  for (const r of br) {
    const team = name(r.team);
    const p = r?.placement, mn = r?.matchNo;
    if (!team || !Number.isInteger(p) || p < 1 || !Number.isInteger(mn) || mn < 1) continue;
    const key = `${mn}|${team.toLowerCase()}`;
    if (seenBr.has(key)) continue;
    seenBr.add(key);
    const kills = Number.isFinite(r.kills) && r.kills > 0 ? Math.trunc(r.kills) : 0;
    const pts = matchPoints({ placement: p, kills }, { placement: set.scale, perKill: set.perKill });
    entries.push({ team, day: dayOf(mn), no: mn, order: 1, pts, kind: "P", short: ordinal(p), label: `${ordinal(p)} place`, won: 0, drawn: 0, lost: 0, firsts: p === 1 ? 1 : 0, kills, diff: 0 });
    counted.add(`b:${mn}`);
  }

  const hasOther = entries.some((e) => e.day === OTHER);
  const days: DayInfo[] = hasOther ? [...configured, { index: OTHER, label: "Other matches", fromMatch: 0, toMatch: 0, auto: true }] : configured;
  const teams = [...canon.values()];
  entries.sort((x, y) => x.day - y.day || x.no - y.no || x.order - y.order);

  const tables: LeagueTable[] = [];
  let prevRank = new Map<string, { rank: number; played: number }>();
  for (const day of days) {
    const aggs = new Map<string, Agg>(teams.map((t) => [t, { team: t, points: 0, dayPoints: 0, played: 0, won: 0, drawn: 0, lost: 0, firsts: 0, kills: 0, diff: 0, wins: 0 }]));
    const forms = new Map<string, FormItem[]>(teams.map((t) => [t, []]));
    let results = 0;
    const dayKeys = new Set<string>();
    for (const e of entries) {
      if (e.day > day.index) continue;
      const g = aggs.get(e.team)!;
      g.points += e.pts; g.played++; g.won += e.won; g.drawn += e.drawn; g.lost += e.lost; g.firsts += e.firsts; g.kills += e.kills; g.diff += e.diff;
      if (e.day === day.index) { g.dayPoints += e.pts; dayKeys.add(`${e.kind === "P" ? "b" : "h"}:${e.no}`); }
      forms.get(e.team)!.push({ kind: e.kind, short: e.short, label: e.label });
    }
    results = dayKeys.size;
    const list = [...aggs.values()].map((g) => ({ ...g, wins: g.won + g.firsts })).sort((a, b) => better(a, b) || a.team.localeCompare(b.team, undefined, { sensitivity: "base" }) || (a.team < b.team ? -1 : 1));
    const ranks: number[] = [];
    list.forEach((g, i) => { ranks.push(i > 0 && better(list[i - 1]!, g) === 0 ? ranks[i - 1]! : i + 1); });
    const rows: LeagueRow[] = list.map((g, i) => {
      const rank = ranks[i]!;
      const prev = prevRank.get(g.team);
      const movement = day.index > 0 && g.played > 0 && prev && prev.played > 0 ? prev.rank - rank : null;
      return {
        team: g.team, rank, tied: ranks.filter((r) => r === rank).length > 1, points: g.points, dayPoints: g.dayPoints, played: g.played, won: g.won, drawn: g.drawn, lost: g.lost,
        firsts: g.firsts, kills: g.kills, diff: g.diff, movement, form: forms.get(g.team)!.slice(-5),
      };
    });
    tables.push({ day, rows, results });
    prevRank = new Map(rows.map((r) => [r.team, { rank: r.rank, played: r.played }]));
  }

  let latest = 0;
  tables.forEach((t, i) => { if (t.results > 0) latest = i; });
  return { days, tables, latest, teams, empty: entries.length === 0 };
}

/** The table to show for a chosen day (clamped), or null when there are no tables. */
export const tableFor = (l: League, day: number): LeagueTable | null => l.tables[Math.min(Math.max(0, day), l.tables.length - 1)] ?? null;

/** The row of one team in a table, matching ignoring case and spacing. */
export const rowFor = (t: LeagueTable | null, team: string): LeagueRow | null => {
  const k = clean(team).toLowerCase();
  return k ? t?.rows.find((r) => r.team.toLowerCase() === k) ?? null : null;
};

/** A one-line description of a row for screen readers and the share text. */
export function rowText(r: LeagueRow): string {
  const mv = movementInfo(r.movement).text;
  return `${ordinal(r.rank)}${r.tied ? " (shared)" : ""}: ${r.team}, ${fmt(r.points)} ${r.points === 1 ? "point" : "points"}, ${fmt(r.dayPoints)} on this day, ${mv}.`;
}

export const pointsText = fmt;
