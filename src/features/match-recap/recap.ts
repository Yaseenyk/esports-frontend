import type { Payload } from "@/lib/display";
import { footerLine } from "@/lib/share-cards";

/**
 * Auto match recap (flag v3.recaps). DETERMINISTIC TEMPLATES, no AI: every sentence is filled only from results the organiser entered (battle royale
 * rows, head-to-head scores) and, for standings, from the organiser's own points rules. Without points rules there are no points or standings lines.
 * Pure: no network, no React, so the unit tests can pin every sentence.
 */
export interface Scoring { title: string; scale: number[]; perKill: number; winPts: number; drawPts: number; lossPts: number }
export interface BrFact { matchNo: number; team: string; placement: number; kills: number; corrected: boolean }
export interface H2hFact { id: string; stage: string; round: number; slot: number; teamA: string; teamB: string; status: string; scoreA: number | null; scoreB: number | null; winner: string | null; corrected: boolean }
export interface RecapFacts { event: { id: string; name: string; game: string }; publicPath: string | null; scoring: Scoring | null; matches: H2hFact[]; battleRoyale: BrFact[] }

export type RecapTarget = { kind: "br"; matchNo: number } | { kind: "h2h"; id: string };
export interface Recap { title: string; lines: string[]; text: string; payload: Payload; footer: string; path: string }

export const plural = (n: number, one: string, many = `${one}s`): string => `${n} ${n === 1 ? one : many}`;
export function ordinal(n: number): string {
  const t = n % 100;
  if (t >= 11 && t <= 13) return `${n}th`;
  return `${n}${n % 10 === 1 ? "st" : n % 10 === 2 ? "nd" : n % 10 === 3 ? "rd" : "th"}`;
}
/** "A", "A and B", "A, B and C". */
export function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
const round2 = (n: number) => Math.round(n * 100) / 100;
const key = (team: string) => team.trim().toLowerCase();

/** Every match that can be recapped, newest battle royale match first, then finished head-to-head matches. */
export function recapTargets(f: RecapFacts): { target: RecapTarget; label: string }[] {
  const nos = [...new Set(f.battleRoyale.map((r) => r.matchNo))].sort((a, b) => b - a);
  const br = nos.map((n) => ({ target: { kind: "br", matchNo: n } as RecapTarget, label: `Match ${n}` }));
  const h2h = f.matches.filter(decided).map((m) => ({ target: { kind: "h2h", id: m.id } as RecapTarget, label: `${m.teamA} vs ${m.teamB} (${roundName(m)})` }));
  return [...br, ...h2h];
}
const decided = (m: H2hFact) => (m.status === "finished" || m.status === "forfeit") && (m.winner === "a" || m.winner === "b" || m.winner === "draw");

export const brPoints = (r: { placement: number; kills: number }, s: Scoring): number => round2((s.scale[r.placement - 1] ?? 0) + r.kills * s.perKill);

export interface Standing { team: string; points: number; kills: number; matches: number; rank: number }
/** The table after match `upTo` (inclusive): points, then kills, then name. Equal points and kills share a rank. */
export function standingsAfter(rows: readonly BrFact[], s: Scoring, upTo: number): Standing[] {
  const by = new Map<string, Standing>();
  for (const r of rows) {
    if (r.matchNo > upTo) continue;
    const k = key(r.team);
    const cur = by.get(k) ?? { team: r.team.trim(), points: 0, kills: 0, matches: 0, rank: 0 };
    cur.points = round2(cur.points + brPoints(r, s));
    cur.kills += r.kills;
    cur.matches += 1;
    by.set(k, cur);
  }
  const list = [...by.values()].sort((a, b) => b.points - a.points || b.kills - a.kills || a.team.localeCompare(b.team));
  list.forEach((x, i) => { const prev = list[i - 1]; x.rank = prev && prev.points === x.points && prev.kills === x.kills ? prev.rank : i + 1; });
  return list;
}

function roundName(m: H2hFact): string {
  const stage = m.stage && m.stage !== "main" ? `${m.stage.charAt(0).toUpperCase()}${m.stage.slice(1)} ` : "";
  return `${stage}round ${m.round}`.replace(/^r/, "R");
}

function finish(f: RecapFacts, title: string, lines: string[], payload: Payload): Recap {
  const path = f.publicPath ?? "/";
  const footer = footerLine(path);
  return { title, lines, footer, path, payload, text: [title, "", ...lines, "", footer].join("\n") };
}

export function brRecap(f: RecapFacts, matchNo: number): Recap | null {
  const rows = f.battleRoyale.filter((r) => r.matchNo === matchNo).sort((a, b) => a.placement - b.placement || a.team.localeCompare(b.team));
  if (!rows.length) return null;
  const title = `${f.event.name}: Match ${matchNo} recap`;
  const lines: string[] = [];
  const winner = rows[0]!;
  lines.push(`${winner.team} won Match ${matchNo} with ${plural(winner.kills, "kill")}.`);
  const maxKills = Math.max(...rows.map((r) => r.kills));
  const top = rows.filter((r) => r.kills === maxKills).map((r) => r.team);
  if (maxKills > 0) {
    if (top.length === 1 && top[0] === winner.team) lines.push("That was the most kills in the match.");
    else if (top.length === 1) lines.push(`${top[0]} had the most kills (${maxKills}).`);
    else lines.push(`${joinNames(top)} shared the most kills (${maxKills} each).`);
  }
  const second = rows.find((r) => r.placement === 2);
  if (second && second.team !== winner.team) lines.push(`${second.team} came 2nd with ${plural(second.kills, "kill")}.`);
  if (rows.some((r) => r.corrected)) lines.push("Some results in this match were corrected after a dispute.");

  const s = f.scoring;
  let payload: Payload;
  if (s) {
    const played = [...new Set(f.battleRoyale.map((r) => r.matchNo))].filter((n) => n <= matchNo).sort((a, b) => a - b);
    const now = standingsAfter(f.battleRoyale, s, matchNo);
    const prevNo = played.filter((n) => n < matchNo).pop();
    const before = prevNo === undefined ? null : standingsAfter(f.battleRoyale, s, prevNo);
    const leader = now[0]!;
    const sharedTop = now.filter((x) => x.rank === 1).length > 1;
    const after = `after ${plural(played.length, "match", "matches")}`;
    if (sharedTop) lines.push(`${joinNames(now.filter((x) => x.rank === 1).map((x) => x.team))} share the lead on ${leader.points} points ${after}.`);
    else if (before && before[0] && key(before[0].team) !== key(leader.team)) lines.push(`${leader.team} took the lead on ${leader.points} points ${after}.`);
    else lines.push(`${leader.team} lead the table on ${leader.points} points ${after}.`);
    if (before) {
      const was = new Map(before.map((x) => [key(x.team), x.rank]));
      const climbers = now.filter((x) => x.rank > 1 && x.rank <= 3 && was.has(key(x.team)) && was.get(key(x.team))! > x.rank).slice(0, 2);
      for (const c of climbers) lines.push(`${c.team} climbed to ${ordinal(c.rank)} (from ${ordinal(was.get(key(c.team))!)}).`);
    }
    payload = { v: "table", d: { title: f.event.name, subtitle: `Standings after Match ${matchNo}`, head: ["#", "Team", "Kills", "Pts"], strong: 3, rows: now.slice(0, 16).map((x) => [String(x.rank), x.team, String(x.kills), String(x.points)]) } };
  } else {
    payload = { v: "table", d: { title: f.event.name, subtitle: `Match ${matchNo} result`, head: ["#", "Team", "Kills"], strong: 2, rows: rows.slice(0, 16).map((r) => [String(r.placement), r.team, String(r.kills)]) } };
  }
  return finish(f, title, lines, payload);
}

export function h2hRecap(f: RecapFacts, id: string): Recap | null {
  const m = f.matches.find((x) => x.id === id);
  if (!m || !decided(m)) return null;
  const rn = roundName(m);
  const title = `${f.event.name}: ${m.teamA} vs ${m.teamB}`;
  const lines: string[] = [];
  const sa = m.scoreA ?? 0, sb = m.scoreB ?? 0;
  const [w, l, ws, ls] = m.winner === "b" ? [m.teamB, m.teamA, sb, sa] : [m.teamA, m.teamB, sa, sb];
  if (m.winner === "draw") lines.push(`${m.teamA} and ${m.teamB} drew ${sa}-${sb} in ${rn.toLowerCase()}.`);
  else if (m.status === "forfeit") lines.push(`${w} went through by forfeit against ${l} in ${rn.toLowerCase()}.`);
  else lines.push(`${w} beat ${l} ${ws}-${ls} in ${rn.toLowerCase()}.`);
  if (m.corrected) lines.push("This result was corrected after a dispute.");
  const rowsOut = m.winner === "draw" ? [["1", m.teamA, String(sa)], ["1", m.teamB, String(sb)]] : [["1", w, m.status === "forfeit" && m.scoreA === null ? "W" : String(ws)], ["2", l, m.status === "forfeit" && m.scoreA === null ? "L" : String(ls)]];
  const payload: Payload = { v: "table", d: { title: f.event.name, subtitle: rn, head: ["#", "Team", "Score"], strong: 2, rows: rowsOut } };
  return finish(f, title, lines, payload);
}

export const buildRecap = (f: RecapFacts, t: RecapTarget): Recap | null => (t.kind === "br" ? brRecap(f, t.matchNo) : h2hRecap(f, t.id));
