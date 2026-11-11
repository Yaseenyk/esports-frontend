/**
 * Groups, then knockout: the format most college fests run. Pure functions, no browser or network code, so all of it is unit tested.
 *
 *  1. splitGroups: N teams into G groups, as evenly as possible, dealt in order or by pots (snake).
 *  2. groupFixtures: every team plays every other team in its group once (the circle method from roundrobin.ts).
 *  3. standings: win 3, draw 1, loss 0. Tie-breaks, in this order: points, score difference, scores for, head-to-head, then team name.
 *  4. qualifiers: the top K of each group, plus the best teams that finished just below (the "best third-placed teams").
 *  5. buildKnockout: a single-elimination bracket where teams from the same group do not meet in the first round when that can be avoided.
 *     Teams that get a bye are put straight into round 2, so no match is ever created against an empty seat.
 */
import type { Payload } from "./display";
import { BYE, DEFAULT_POINTS, fixtures, type Points, type Round, type Row } from "./roundrobin";
import { seedOrder, uniqueTeams } from "./seeding";

export const MIN_TEAMS = 4;
export const MAX_TEAMS = 64;
export const MIN_GROUPS = 2;
export const MAX_GROUPS = 8;
export const MAX_ADVANCE = 4;
export const KNOCKOUT_STAGE = "knockout";

export const groupName = (i: number): string => String.fromCharCode(65 + i);
export const groupStage = (name: string): string => `group:${name}`;

// ---------- 1. splitting into groups ----------

export interface Group { name: string; teams: string[] }
export type SplitMode = "deal" | "snake";

/** The most groups that still leave at least two teams in each (and never more than 8). */
export const maxGroups = (n: number): number => Math.max(0, Math.min(MAX_GROUPS, Math.floor(n / 2)));

/**
 * Splits teams into `groups` groups whose sizes differ by at most one (bigger groups come first: A, then B, and so on).
 * "deal": team 1 to group A, team 2 to B, and so on round and round.
 * "snake" (pots): the list is read best team first. The first G teams are pot 1 and go one into each group, the next G are pot 2 and go in
 * the opposite direction, and so on, so the strongest teams are spread out and the groups come out balanced.
 * Repeated names are dropped, and at most 64 teams are used.
 */
export function splitGroups(teams: string[], groups: number, mode: SplitMode = "deal"): Group[] {
  const list = uniqueTeams(teams, MAX_TEAMS);
  if (list.length < MIN_TEAMS) return [];
  const g = Math.max(MIN_GROUPS, Math.min(Math.floor(groups) || MIN_GROUPS, maxGroups(list.length)));
  const out: Group[] = Array.from({ length: g }, (_, i) => ({ name: groupName(i), teams: [] }));
  list.forEach((t, i) => {
    const row = Math.floor(i / g), pos = i % g;
    out[mode === "snake" && row % 2 === 1 ? g - 1 - pos : pos]!.teams.push(t);
  });
  return out;
}

export interface StageSettings { groups: number; advance: number; thirds: number; mode: SplitMode }

/** Sensible starting numbers for n teams: groups of about four, the top two of each group go through. */
export function defaultSettings(n: number): StageSettings {
  const groups = Math.max(MIN_GROUPS, Math.min(maxGroups(n) || MIN_GROUPS, Math.round(n / 4)));
  return clampSettings(n, { groups, advance: 2, thirds: 0, mode: "deal" });
}

/** Keeps every setting inside what is possible for n teams (groups of at least two, advance no more than the smallest group). */
export function clampSettings(n: number, s: StageSettings): StageSettings {
  const groups = Math.max(MIN_GROUPS, Math.min(Math.floor(s.groups) || MIN_GROUPS, maxGroups(n) || MIN_GROUPS));
  const smallest = Math.floor(n / groups);
  const advance = Math.max(1, Math.min(Math.floor(s.advance) || 1, MAX_ADVANCE, Math.max(1, smallest)));
  // Best third-placed (more exactly: best of the teams just below the cut) only makes sense when every group has one.
  const thirds = smallest > advance ? Math.max(0, Math.min(Math.floor(s.thirds) || 0, groups - 1)) : 0;
  return { groups, advance, thirds, mode: s.mode === "snake" ? "snake" : "deal" };
}

// ---------- 2. fixtures ----------

/** The rounds of one group, with the empty seat of an odd-sized group removed (that team simply has a free round). */
export function groupFixtures(g: Group): Round[] {
  return fixtures(g.teams).map((rd) => rd.filter((f) => f.a !== BYE && f.b !== BYE));
}

/** How many matches a group of n teams plays. */
export const groupMatchCount = (n: number): number => (n * (n - 1)) / 2;

/** A match ready to send to the server. Ids are optional (the server makes them); the knockout supplies its own so the winners can move on. */
export interface PlannedMatch { id?: string; stage: string; round: number; slot: number; a: string; b: string; nextId?: string | null; nextSide?: "a" | "b" | null }

/** Every group match, in the shape of the match model: stage `group:A`, round and slot counted from 1. */
export function groupMatches(groups: Group[]): PlannedMatch[] {
  return groups.flatMap((g) => groupFixtures(g).flatMap((rd, ri) => rd.map((f, fi) => ({ stage: groupStage(g.name), round: ri + 1, slot: fi + 1, a: f.a, b: f.b }))));
}

// ---------- 3. standings ----------

export interface GroupResult { a: string; b: string; scoreA: number | null; scoreB: number | null }
type Stat = { team: string; played: number; won: number; drawn: number; lost: number; for: number; against: number; points: number };

function tally(teams: string[], results: GroupResult[], pts: Points): Map<string, Stat> {
  const rows = new Map<string, Stat>(teams.map((t) => [t, { team: t, played: 0, won: 0, drawn: 0, lost: 0, for: 0, against: 0, points: 0 }]));
  for (const r of results) {
    if (r.scoreA === null || r.scoreB === null || r.a === r.b) continue;
    const A = rows.get(r.a), B = rows.get(r.b);
    if (!A || !B) continue;
    A.played++; B.played++; A.for += r.scoreA; A.against += r.scoreB; B.for += r.scoreB; B.against += r.scoreA;
    if (r.scoreA > r.scoreB) { A.won++; B.lost++; A.points += pts.win; B.points += pts.loss; }
    else if (r.scoreA < r.scoreB) { B.won++; A.lost++; B.points += pts.win; A.points += pts.loss; }
    else { A.drawn++; B.drawn++; A.points += pts.draw; B.points += pts.draw; }
  }
  return rows;
}

const byName = (x: string, y: string) => (x < y ? -1 : x > y ? 1 : 0);
const primary = (x: Stat, y: Stat) => y.points - x.points || (y.for - y.against) - (x.for - x.against) || y.for - x.for;

/** The words that explain the order of a group table. Show this next to every table. */
export const TIE_BREAK_TEXT = "Teams are ordered by points. When points are equal: score difference, then scores for, then the result of the matches between the teams that are still level (head-to-head), then team name.";

/**
 * A group table. A match counts only when both scores are filled in. Order: points, score difference, scores for, head-to-head
 * (a small table from only the matches between the teams still level), then team name, so the same results always give the same table.
 */
export function standings(teams: string[], results: GroupResult[], pts: Points = DEFAULT_POINTS): Row[] {
  const list = uniqueTeams(teams);
  const all = [...tally(list, results, pts).values()].sort((x, y) => primary(x, y) || byName(x.team.toLowerCase(), y.team.toLowerCase()) || byName(x.team, y.team));
  const ordered: Stat[] = [];
  for (let i = 0; i < all.length;) {
    let j = i + 1;
    while (j < all.length && primary(all[i]!, all[j]!) === 0) j++;
    const block = all.slice(i, j);
    if (block.length > 1) {
      const names = new Set(block.map((b) => b.team));
      const h2h = tally([...names], results.filter((r) => names.has(r.a) && names.has(r.b)), pts);
      block.sort((x, y) => primary(h2h.get(x.team)!, h2h.get(y.team)!) || byName(x.team.toLowerCase(), y.team.toLowerCase()) || byName(x.team, y.team));
    }
    ordered.push(...block);
    i = j;
  }
  return ordered.map((r, k) => ({ ...r, diff: r.for - r.against, rank: k + 1 }));
}

// ---------- reading the match model ----------

/** The part of a match these functions need (the API's Match has all of it). */
export interface StageMatch { stage: string; round: number; slot: number; a: string; b: string; status: string; scoreA: number | null; scoreB: number | null; winner?: string | null }

const isGroup = (stage: string) => /^group\s*:\s*\S/i.test(stage.trim());
const groupOf = (stage: string) => stage.replace(/^group\s*:\s*/i, "").trim();

/** A forfeit with no scores entered counts as a 1-0 win for the winner; every other match counts only with both scores. */
export function toResult(m: StageMatch): GroupResult {
  if (m.status === "forfeit" && (m.scoreA === null || m.scoreB === null) && (m.winner === "a" || m.winner === "b")) return { a: m.a, b: m.b, scoreA: m.winner === "a" ? 1 : 0, scoreB: m.winner === "b" ? 1 : 0 };
  const done = m.status === "finished" || m.status === "forfeit";
  return { a: m.a, b: m.b, scoreA: done ? m.scoreA : null, scoreB: done ? m.scoreB : null };
}

export interface GroupState { group: Group; results: GroupResult[]; rows: Row[]; total: number; done: number }

/** Rebuilds the groups, their results and their tables from an event's matches (stages named group:A, group:B and so on). */
export function groupsFromMatches(matches: StageMatch[], pts: Points = DEFAULT_POINTS): GroupState[] {
  const by = new Map<string, StageMatch[]>();
  for (const m of matches) if (isGroup(m.stage)) by.set(groupOf(m.stage), [...(by.get(groupOf(m.stage)) ?? []), m]);
  return [...by.keys()].sort((x, y) => x.localeCompare(y, undefined, { numeric: true })).map((name) => {
    const ms = by.get(name)!.slice().sort((x, y) => x.round - y.round || x.slot - y.slot);
    const teams = uniqueTeams(ms.flatMap((m) => [m.a, m.b]));
    const results = ms.map(toResult);
    return { group: { name, teams }, results, rows: standings(teams, results, pts), total: ms.length, done: results.filter((r) => r.scoreA !== null && r.scoreB !== null).length };
  });
}

// ---------- 4. who goes through ----------

export interface Qualifier { team: string; group: string; place: number; points: number; diff: number; for: number }

const cmpQ = (x: Qualifier, y: Qualifier) => x.place - y.place || y.points - x.points || y.diff - x.diff || y.for - x.for || byName(x.team.toLowerCase(), y.team.toLowerCase()) || byName(x.team, y.team);

/**
 * The top `advance` teams of every group, then `thirds` more: the best of the teams that finished directly below the cut (compared on points,
 * score difference, scores for, then name). `advance` is kept between 1 and the size of the smallest group; `thirds` cannot be more than the number of groups.
 * The result is in seed order: all group winners first (best first), then all runners-up, and so on, with the extra teams last.
 */
export function qualifiers(tables: { name: string; rows: Row[] }[], advance: number, thirds = 0): Qualifier[] {
  if (tables.length === 0) return [];
  const smallest = Math.min(...tables.map((t) => t.rows.length));
  const k = Math.max(1, Math.min(Math.floor(advance) || 1, MAX_ADVANCE, smallest));
  const q = (t: { name: string; rows: Row[] }, r: Row): Qualifier => ({ team: r.team, group: t.name, place: r.rank, points: r.points, diff: r.diff, for: r.for });
  const direct = tables.flatMap((t) => t.rows.filter((r) => r.rank <= k).map((r) => q(t, r)));
  const next = tables.flatMap((t) => t.rows.filter((r) => r.rank === k + 1).map((r) => q(t, r)));
  const extra = next.sort(cmpQ).slice(0, Math.max(0, Math.min(Math.floor(thirds) || 0, next.length)));
  return [...direct.sort(cmpQ), ...extra];
}

// ---------- 5. the knockout ----------

export interface KoMatch { id: string; stage: typeof KNOCKOUT_STAGE; round: number; slot: number; a: string; b: string; nextId: string | null; nextSide: "a" | "b" | null }
export interface Knockout { matches: KoMatch[]; size: number; byes: number; roundNames: string[]; sameGroupFirstRound: number }

export const roundTitle = (teamsLeft: number): string => (teamsLeft <= 2 ? "Final" : teamsLeft === 4 ? "Semi-finals" : teamsLeft === 8 ? "Quarter-finals" : `Round of ${teamsLeft}`);

/**
 * Builds the knockout bracket from the qualifiers (best seed first, as `qualifiers` returns them).
 * Standard seeding puts the best teams against the weakest and apart from each other. Then any first-round match between two teams of the
 * same group is repaired by swapping one of them with a team from another match, preferring a team of the same finishing place and the closest seed.
 * That always works when it can (a group with at most half of the teams that actually play in round 1); otherwise it makes as few such matches as possible.
 * With a number of teams that is not a power of two the best seeds get a bye: they are placed straight into round 2.
 * `idPrefix` makes the match ids unique across events (they are global): pass something short and random in the app.
 */
export function buildKnockout(qs: Qualifier[], idPrefix = "ko"): Knockout {
  const seeds = qs.slice(0, 64);
  const n = seeds.length;
  if (n < 2) return { matches: [], size: 0, byes: 0, roundNames: [], sameGroupFirstRound: 0 };
  const size = 2 ** Math.ceil(Math.log2(n));
  const rounds = Math.log2(size);
  const order = seedOrder(size);
  const at: (number | null)[] = order.map((s) => (s <= n ? s - 1 : null)); // position -> index into seeds

  const clash = (arr: (number | null)[], pair: number): boolean => {
    const x = arr[pair * 2], y = arr[pair * 2 + 1];
    return x != null && y != null && seeds[x]!.group === seeds[y]!.group;
  };
  const cost = (arr: (number | null)[]): number => { let c = 0; for (let p = 0; p < size / 2; p++) if (clash(arr, p)) c++; return c; };
  const real = (arr: (number | null)[], pos: number): boolean => arr[pos] != null && arr[pos ^ 1] != null;

  for (let guard = 0; guard < 500; guard++) {
    const cur = cost(at);
    if (cur === 0) break;
    let best: { a: number; b: number; cost: number; tier: number; gap: number } | null = null;
    for (let p = 0; p < size / 2; p++) {
      if (!clash(at, p)) continue;
      for (const a of [p * 2 + 1, p * 2]) {
        for (let b = 0; b < size; b++) {
          if ((b >> 1) === p || !real(at, b)) continue;
          const trial = at.slice();
          [trial[a], trial[b]] = [trial[b]!, trial[a]!];
          const c = cost(trial);
          if (c >= cur) continue;
          const sa = seeds[at[a]!]!, sb = seeds[at[b]!]!;
          const cand = { a, b, cost: c, tier: sa.place === sb.place ? 0 : 1, gap: Math.abs(at[a]! - at[b]!) };
          if (!best || cand.cost < best.cost || (cand.cost === best.cost && (cand.tier < best.tier || (cand.tier === best.tier && (cand.gap < best.gap || (cand.gap === best.gap && (cand.a < best.a || (cand.a === best.a && cand.b < best.b)))))))) best = cand;
        }
      }
    }
    if (!best) break; // nothing improves: the clash cannot be avoided
    [at[best.a], at[best.b]] = [at[best.b]!, at[best.a]!];
  }
  const sameGroupFirstRound = cost(at);

  // Nodes of the tree: a team (a bye or a winner still to be decided) or a match.
  type Node = { kind: "team"; name: string } | { kind: "match"; round: number; pos: number };
  const matches: KoMatch[] = [];
  const idOf = (r: number, pos: number) => `${idPrefix}-r${r}m${pos + 1}`;
  const byKey = new Map<string, KoMatch>();
  let prev: Node[] = [];
  for (let p = 0; p < size / 2; p++) {
    const x = at[p * 2], y = at[p * 2 + 1];
    if (x != null && y != null) {
      const m: KoMatch = { id: idOf(1, p), stage: KNOCKOUT_STAGE, round: 1, slot: 0, a: seeds[x]!.team, b: seeds[y]!.team, nextId: null, nextSide: null };
      matches.push(m); byKey.set(`1-${p}`, m); prev.push({ kind: "match", round: 1, pos: p });
    } else prev.push({ kind: "team", name: seeds[(x ?? y)!]!.team });
  }
  for (let r = 2; r <= rounds; r++) {
    const next: Node[] = [];
    for (let p = 0; p < prev.length / 2; p++) {
      const m: KoMatch = { id: idOf(r, p), stage: KNOCKOUT_STAGE, round: r, slot: 0, a: "", b: "", nextId: null, nextSide: null };
      ([prev[p * 2]!, prev[p * 2 + 1]!] as Node[]).forEach((node, i) => {
        const side = i === 0 ? "a" : "b";
        if (node.kind === "team") m[side] = node.name;
        else { const f = byKey.get(`${node.round}-${node.pos}`)!; f.nextId = m.id; f.nextSide = side; }
      });
      matches.push(m); byKey.set(`${r}-${p}`, m); next.push({ kind: "match", round: r, pos: p });
    }
    prev = next;
  }
  const counter = new Map<number, number>();
  for (const m of matches.sort((x, y) => x.round - y.round || x.id.localeCompare(y.id, undefined, { numeric: true }))) { const s = (counter.get(m.round) ?? 0) + 1; counter.set(m.round, s); m.slot = s; }
  const roundNames = Array.from({ length: rounds }, (_, i) => roundTitle(2 ** (rounds - i)));
  return { matches, size, byes: size - n, roundNames, sameGroupFirstRound };
}

// ---------- playing the knockout (for the free tool, where there is no server to advance winners) ----------

export type Picks = Record<string, "a" | "b">;
export interface PlayedMatch extends KoMatch { winner: "a" | "b" | null }

/** The bracket with the picked winners moved on. A pick only counts while both teams of that match are known. */
export function playKnockout(ms: KoMatch[], picks: Picks): { matches: PlayedMatch[]; champion: string | null } {
  const sorted = ms.slice().sort((x, y) => x.round - y.round || x.slot - y.slot);
  const out = new Map<string, PlayedMatch>();
  const feeders = new Map<string, { a?: string; b?: string }>();
  for (const m of sorted) {
    const f = feeders.get(m.id) ?? {};
    const a = m.a || f.a || "", b = m.b || f.b || "";
    const pick = picks[m.id];
    const winner = pick && a && b ? pick : null;
    const played: PlayedMatch = { ...m, a, b, winner };
    out.set(m.id, played);
    if (winner && m.nextId && m.nextSide) feeders.set(m.nextId, { ...(feeders.get(m.nextId) ?? {}), [m.nextSide]: winner === "a" ? a : b });
  }
  const list = sorted.map((m) => out.get(m.id)!);
  const final = list.filter((m) => !m.nextId).sort((x, y) => y.round - x.round)[0];
  return { matches: list, champion: final?.winner ? (final.winner === "a" ? final.a : final.b) : null };
}

/** Taps a winner: tapping the same team again takes it back. Picks of later matches that depended on this one are removed. */
export function togglePick(ms: KoMatch[], picks: Picks, id: string, side: "a" | "b"): Picks {
  const next: Picks = { ...picks };
  if (next[id] === side) delete next[id]; else next[id] = side;
  const byId = new Map(ms.map((m) => [m.id, m]));
  for (let m = byId.get(id), hops = 0; m?.nextId && hops < 64; m = byId.get(m.nextId), hops++) delete next[m.nextId];
  return next;
}

// ---------- screens (TV and stream) ----------

/** The knockout as a bracket screen. Byes appear as names in round 2; an undecided slot reads TBD. */
export function knockoutView(ko: Knockout, picks: Picks, title = "Knockout"): Payload {
  const { matches, champion } = playKnockout(ko.matches, picks);
  const rounds = ko.roundNames.map((name, i) => ({
    name,
    matches: matches.filter((m) => m.round === i + 1).map((m) => ({ a: m.a || "TBD", b: m.b || "TBD", w: m.winner === "a" ? (0 as const) : m.winner === "b" ? (1 as const) : undefined })),
  })).filter((r) => r.matches.length > 0);
  return { v: "bracket", d: { title, sections: [{ name: "", rounds }], champion: champion ?? undefined } };
}

/** All group tables on one screen: a Group column, then the usual table columns. */
export function groupTablesView(tables: { name: string; rows: Row[] }[], title = "Group tables"): Payload {
  const rows = tables.flatMap((t) => t.rows.map((r) => [`Group ${t.name}`, String(r.rank), r.team, String(r.played), String(r.won), String(r.drawn), String(r.lost), r.diff > 0 ? `+${r.diff}` : String(r.diff), String(r.points)]));
  return { v: "table", d: { title, head: ["Group", "#", "Team", "P", "W", "D", "L", "Diff", "Pts"], rows, strong: 8 } };
}
