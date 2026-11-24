import type { Payload } from "@/lib/display";
import { BYE, table as roundRobinTable, type Round, type Score } from "@/lib/roundrobin";

/**
 * A league table for 5v5 match games decided by rounds on maps (the Valorant page). Teams meet in round robin fixtures (lib/roundrobin);
 * each match is a best of 1, 3 or 5, and each map is won by the team with more rounds.
 *
 * Order: points (a win is 3 and a loss 0 by default, both editable), then map difference, then round difference, then head-to-head points
 * between the teams still level, then team name. This is common league practice, not a rule of any publisher, and the page says so.
 *
 * Wins, losses, maps and points come from the round robin table (each finished match is fed in as its map score), so the two tools count the
 * same way; this file adds the rounds and the head-to-head step. Pure functions, unit tested.
 */
export type BestOf = 1 | 3 | 5;
export const BEST_OF: BestOf[] = [1, 3, 5];
/** Rounds won on one map by team A and team B. Null is an empty box. */
export interface MapScore { a: number | null; b: number | null }
export interface MapLeagueSettings { bestOf: BestOf; win: number; loss: number }
export const DEFAULT_MAP_LEAGUE: MapLeagueSettings = { bestOf: 1, win: 3, loss: 0 };
export const MAX_ROUNDS = 99;

/** Maps a team needs to win the match: 1 of 1, 2 of 3, 3 of 5. */
export const mapsToWin = (bestOf: BestOf): number => Math.floor(bestOf / 2) + 1;

export type MatchStatus = "empty" | "partial" | "level" | "done";
export interface MatchOutcome {
  status: MatchStatus;
  winner: "a" | "b" | null;
  mapsA: number; mapsB: number;
  roundsA: number; roundsB: number;
  /** How many map rows to show: the maps played so far plus the next one, never past the decider or the best-of. */
  showMaps: number;
}

/**
 * Reads a match's maps in order. A map counts when both boxes are filled and one team has more rounds. A level map stops the reading
 * (a map needs a winner), as does an empty or half-filled one. Maps typed after the match was already won are ignored.
 */
export function matchOutcome(maps: MapScore[], bestOf: BestOf): MatchOutcome {
  const need = mapsToWin(bestOf);
  let mapsA = 0, mapsB = 0, roundsA = 0, roundsB = 0, status: MatchStatus = "empty", i = 0;
  for (; i < bestOf; i++) {
    const m = maps[i];
    const a = m?.a ?? null, b = m?.b ?? null;
    if (a === null && b === null) { if (i > 0) status = "partial"; break; }
    if (a === null || b === null) { status = "partial"; break; }
    if (a === b) { status = "level"; break; }
    roundsA += a; roundsB += b;
    if (a > b) mapsA++; else mapsB++;
    if (mapsA === need || mapsB === need) { status = "done"; i++; break; }
  }
  const winner = status === "done" ? (mapsA > mapsB ? "a" : "b") : null;
  const showMaps = status === "done" ? i : Math.min(bestOf, i + 1);
  return { status, winner, mapsA, mapsB, roundsA, roundsB, showMaps };
}

export type TieRule = "maps" | "rounds" | "head-to-head" | "name";
export interface MapLeagueRow {
  rank: number; team: string;
  played: number; won: number; lost: number;
  mapsWon: number; mapsLost: number; mapDiff: number;
  roundsWon: number; roundsLost: number; roundDiff: number;
  points: number;
  /** Set when another team has the same points: the rule that put this team in its place. */
  tieBreak: TieRule | null;
}

const isBye = (f: { a: string; b: string }) => f.a === BYE || f.b === BYE;

/**
 * The standings from the results entered so far. `results[round][fixture]` holds the maps of that fixture. Only finished matches count.
 */
export function mapLeagueTable(teams: string[], rounds: Round[], results: MapScore[][][], s: MapLeagueSettings = DEFAULT_MAP_LEAGUE): MapLeagueRow[] {
  const outcomes = rounds.map((rd, ri) => rd.map((f, fi) => (isBye(f) ? null : matchOutcome(results[ri]?.[fi] ?? [], s.bestOf))));
  // Finished matches go into the round robin table as their map score (2-1, or 1-0 for a best of 1), which gives played, won, lost, maps and points.
  const asScores: Score[][] = outcomes.map((rd) => rd.map((o) => (o?.status === "done" ? { a: o.mapsA, b: o.mapsB } : { a: null, b: null })));
  const base = roundRobinTable(teams, rounds, asScores, { win: s.win, draw: 0, loss: s.loss });
  const rounds2 = new Map(base.map((r) => [r.team, { won: 0, lost: 0 }]));
  // Points each team took from each other team, for head-to-head.
  const h2h = new Map<string, number>();
  const hk = (x: string, y: string) => `${x}\u0001${y}`;
  rounds.forEach((rd, ri) => rd.forEach((f, fi) => {
    const o = outcomes[ri]?.[fi];
    if (!o || o.status !== "done") return;
    const A = rounds2.get(f.a), B = rounds2.get(f.b);
    if (!A || !B) return;
    A.won += o.roundsA; A.lost += o.roundsB; B.won += o.roundsB; B.lost += o.roundsA;
    const [wa, wb] = o.winner === "a" ? [s.win, s.loss] : [s.loss, s.win];
    h2h.set(hk(f.a, f.b), (h2h.get(hk(f.a, f.b)) ?? 0) + wa);
    h2h.set(hk(f.b, f.a), (h2h.get(hk(f.b, f.a)) ?? 0) + wb);
  }));
  const rows = base.map((r) => {
    const rr = rounds2.get(r.team)!;
    return { team: r.team, played: r.played, won: r.won, lost: r.lost, mapsWon: r.for, mapsLost: r.against, mapDiff: r.for - r.against, roundsWon: rr.won, roundsLost: rr.lost, roundDiff: rr.won - rr.lost, points: r.points };
  });
  type R = (typeof rows)[number];
  const level = (x: R, y: R) => x.points === y.points && x.mapDiff === y.mapDiff && x.roundDiff === y.roundDiff;
  // Head-to-head points of a team against the other teams of its level group.
  const h2hIn = (t: R, group: R[]) => group.reduce((n, o) => (o === t ? n : n + (h2h.get(hk(t.team, o.team)) ?? 0)), 0);
  const groupOf = (t: R) => rows.filter((o) => level(o, t));
  const sorted = [...rows].sort((x, y) => y.points - x.points || y.mapDiff - x.mapDiff || y.roundDiff - x.roundDiff
    || (level(x, y) ? h2hIn(y, groupOf(y)) - h2hIn(x, groupOf(x)) : 0) || x.team.localeCompare(y.team));
  const unique = <T,>(v: T, all: T[]) => all.filter((w) => w === v).length === 1;
  return sorted.map((r, i) => {
    let tieBreak: TieRule | null = null;
    const samePts = rows.filter((o) => o.points === r.points);
    if (samePts.length > 1) {
      const sameMaps = samePts.filter((o) => o.mapDiff === r.mapDiff);
      const sameRounds = sameMaps.filter((o) => o.roundDiff === r.roundDiff);
      if (sameMaps.length === 1) tieBreak = "maps";
      else if (sameRounds.length === 1) tieBreak = "rounds";
      else tieBreak = unique(h2hIn(r, sameRounds), sameRounds.map((o) => h2hIn(o, sameRounds))) ? "head-to-head" : "name";
    }
    return { rank: i + 1, ...r, tieBreak };
  });
}

/** Number of finished matches, out of the real (non-bye) fixtures. */
export function progress(rounds: Round[], results: MapScore[][][], bestOf: BestOf): { done: number; total: number } {
  let done = 0, total = 0;
  rounds.forEach((rd, ri) => rd.forEach((f, fi) => { if (isBye(f)) return; total++; if (matchOutcome(results[ri]?.[fi] ?? [], bestOf).status === "done") done++; }));
  return { done, total };
}

const signed = (n: number) => (n > 0 ? `+${n}` : String(n));

/** The standings as a screen and share picture. Map difference is shown only for a best of 3 or 5, where it can differ from wins. */
export function mapLeagueView(rows: MapLeagueRow[], bestOf: BestOf, title = "League table"): Payload {
  const maps = bestOf > 1;
  const head = ["#", "Team", "P", "W", "L", ...(maps ? ["Maps"] : []), "Rounds", "Pts"];
  return {
    v: "table",
    d: {
      title, subtitle: `Best of ${bestOf}`, head, strong: head.length - 1,
      rows: rows.map((r) => [String(r.rank), r.team, String(r.played), String(r.won), String(r.lost), ...(maps ? [signed(r.mapDiff)] : []), signed(r.roundDiff), String(r.points)]),
    },
  };
}

/** Words for each tie-break rule, for the table and the legend. */
export const TIE_WORDS: Record<TieRule, string> = { maps: "map difference", rounds: "round difference", "head-to-head": "head-to-head", name: "team name" };
