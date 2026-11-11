/**
 * Pure helpers for the shared match model (docs/usp2-contract.md): group matches by stage and round, work out standings from
 * head-to-head results, find a team's next match and name statuses in plain words. No browser or network code, so all of it is unit tested.
 */
import { DEFAULT_POINTS, table, type Points, type Round, type Row, type Score } from "./roundrobin";

export type MatchStatus = "scheduled" | "ready" | "live" | "finished" | "forfeit";
export type Side = "a" | "b";

/** One match as the organiser's API returns it. */
export interface Match {
  id: string;
  stage: string;
  round: number;
  slot: number;
  a: string;
  b: string;
  status: MatchStatus;
  scoreA: number | null;
  scoreB: number | null;
  winner: Side | "draw" | null;
  startsAt: string | null;
  nextId: string | null;
  nextSide: Side | null;
  updatedAt: string;
}

/** The public subset the live page gets (no winner, links or timestamps). */
export type PublicMatch = Pick<Match, "id" | "stage" | "round" | "slot" | "a" | "b" | "status" | "scoreA" | "scoreB" | "startsAt"> & Partial<Pick<Match, "winner">>;

/** One battle royale row: a team's placement and kills in one match. */
export interface BrResult { matchNo: number; team: string; placement: number; kills: number }

export const STATUS_LABEL: Record<MatchStatus, string> = { scheduled: "Scheduled", ready: "Ready to start", live: "Live now", finished: "Finished", forfeit: "Forfeit" };
export const statusLabel = (s: MatchStatus | string): string => STATUS_LABEL[s as MatchStatus] ?? "Scheduled";

/** A match whose result is in. */
export const isDone = (m: Pick<PublicMatch, "status">) => m.status === "finished" || m.status === "forfeit";

const same = (x: string, y: string) => x.trim().toLowerCase() === y.trim().toLowerCase();
const named = (t: string) => t.trim().length > 0;

/** "Group A" for "group:A", "Knockout", "League", "Matches" for the default "main" stage, otherwise the label with a capital letter. */
export function stageLabel(stage: string): string {
  const s = stage.trim();
  if (!s || s.toLowerCase() === "main") return "Matches";
  const g = /^group\s*:\s*(.+)$/i.exec(s);
  if (g) return `Group ${g[1]!.trim()}`;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Groups first, then league and main, then anything else, then knockout last. */
function stageRank(stage: string): number {
  const s = stage.trim().toLowerCase();
  if (s.startsWith("group")) return 0;
  if (s === "league" || s === "main" || s === "") return 1;
  if (s === "knockout") return 3;
  return 2;
}
const byStage = (x: string, y: string) => stageRank(x) - stageRank(y) || x.localeCompare(y, undefined, { numeric: true });
const byPosition = (x: PublicMatch, y: PublicMatch) => x.round - y.round || x.slot - y.slot || x.id.localeCompare(y.id);

export interface RoundGroup<T extends PublicMatch = Match> { round: number; matches: T[] }
export interface StageGroup<T extends PublicMatch = Match> { stage: string; label: string; rounds: RoundGroup<T>[] }

/** Stages in display order, each with its rounds in order and matches in slot order. */
export function groupByStage<T extends PublicMatch>(matches: T[]): StageGroup<T>[] {
  const stages = new Map<string, Map<number, T[]>>();
  for (const m of matches) {
    const rounds = stages.get(m.stage) ?? new Map<number, T[]>();
    rounds.set(m.round, [...(rounds.get(m.round) ?? []), m]);
    stages.set(m.stage, rounds);
  }
  return [...stages.keys()].sort(byStage).map((stage) => ({
    stage,
    label: stageLabel(stage),
    rounds: [...stages.get(stage)!.entries()].sort((x, y) => x[0] - y[0]).map(([round, ms]) => ({ round, matches: [...ms].sort(byPosition) })),
  }));
}

/** Who won, from the stored winner or else from the scores. Null while the match is not decided. */
export function winnerOf(m: PublicMatch): Side | "draw" | null {
  if (!isDone(m)) return null;
  if (m.winner) return m.winner;
  if (m.scoreA === null || m.scoreB === null || m.scoreA === undefined || m.scoreB === undefined) return null;
  return m.scoreA > m.scoreB ? "a" : m.scoreA < m.scoreB ? "b" : "draw";
}

/** "2 - 1" for a result, "vs" while there is none. */
export function scoreText(m: PublicMatch): string {
  return m.scoreA !== null && m.scoreA !== undefined && m.scoreB !== null && m.scoreB !== undefined ? `${m.scoreA} - ${m.scoreB}` : "vs";
}

/**
 * Standings from head-to-head results: win 3, draw 1, loss 0 and the same tie-breaks as the round-robin table
 * (points, score difference, scores for, wins, name). Only finished or forfeited matches with two named teams count.
 * A forfeit with no score entered counts as 1 - 0 to the side that did not forfeit. Team names match ignoring case and spacing.
 * Every named team appears, even before it has played. Pass `stage` to count one stage only (for example "group:A").
 */
export function standings(matches: PublicMatch[], opts: { stage?: string; points?: Points } = {}): Row[] {
  const pool = opts.stage === undefined ? matches : matches.filter((m) => m.stage === opts.stage);
  const canon = new Map<string, string>();
  const key = (t: string) => t.replace(/\s+/g, " ").trim();
  const canonical = (t: string) => { const k = key(t).toLowerCase(); if (!canon.has(k)) canon.set(k, key(t)); return canon.get(k)!; };
  const rounds: Round[] = [], scores: Score[][] = [];
  for (const m of pool) {
    if (!named(m.a) || !named(m.b)) continue;
    const a = canonical(m.a), b = canonical(m.b);
    if (a.toLowerCase() === b.toLowerCase() || !isDone(m)) continue;
    let sa = m.scoreA ?? null, sb = m.scoreB ?? null;
    if (sa === null || sb === null) {
      const w = winnerOf(m);
      if (m.status !== "forfeit" || (w !== "a" && w !== "b")) continue;
      sa = w === "a" ? 1 : 0; sb = w === "b" ? 1 : 0;
    }
    rounds.push([{ a, b }]); scores.push([{ a: sa, b: sb }]);
  }
  for (const m of pool) { if (named(m.a)) canonical(m.a); if (named(m.b)) canonical(m.b); }
  return table([...canon.values()], rounds, scores, opts.points ?? DEFAULT_POINTS);
}

const when = (m: PublicMatch) => { const t = m.startsAt ? Date.parse(m.startsAt) : NaN; return Number.isNaN(t) ? Infinity : t; };

/** The match this team plays next: one that is on now first, then the earliest not yet finished (by start time when known, else by stage, round and slot). Null when there is none. */
export function nextMatchFor<T extends PublicMatch>(matches: T[], team: string): T | null {
  if (!team.trim()) return null;
  const mine = matches.filter((m) => !isDone(m) && (same(m.a, team) || same(m.b, team)));
  if (!mine.length) return null;
  const live = mine.filter((m) => m.status === "live");
  if (live.length) return [...live].sort(byPosition)[0]!;
  return [...mine].sort((x, y) => when(x) - when(y) || byStage(x.stage, y.stage) || byPosition(x, y))[0]!;
}

/** Everything about the opponent, in words: "vs Bravo", or "opponent to be decided". */
export function opponentText(m: PublicMatch, team: string): string {
  const other = same(m.a, team) ? m.b : m.a;
  return named(other) ? `vs ${other.trim()}` : "opponent to be decided";
}

/** Every team name that appears in the matches, first-seen order, without duplicates. */
export function teamNames(matches: PublicMatch[]): string[] {
  const seen = new Map<string, string>();
  for (const m of matches) for (const t of [m.a, m.b]) { const n = t.replace(/\s+/g, " ").trim(); if (n && !seen.has(n.toLowerCase())) seen.set(n.toLowerCase(), n); }
  return [...seen.values()];
}

/** Counts for a short summary line. */
export function matchCounts(matches: PublicMatch[]): { total: number; done: number; live: number; left: number } {
  const done = matches.filter(isDone).length, live = matches.filter((m) => m.status === "live").length;
  return { total: matches.length, done, live, left: matches.length - done };
}

/** Time of day for a start time in the viewer's zone, or an empty string when unknown. */
export function startText(m: PublicMatch, o: { locale?: string; timeZone?: string } = {}): string {
  const t = m.startsAt ? Date.parse(m.startsAt) : NaN;
  if (Number.isNaN(t)) return "";
  return new Intl.DateTimeFormat(o.locale ?? "en-GB", { timeZone: o.timeZone, hour: "2-digit", minute: "2-digit", hour12: false }).format(t);
}
