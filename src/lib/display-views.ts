import type { BracketData, Payload } from "./display";
import { champion, isPlayable, slots, type Bracket } from "./doubleelim";
import type { Standing } from "./points";
import type { Row } from "./roundrobin";
import type { Slot } from "./schedule";

/** Standings from the points table calculator, as a screen. */
export function pointsView(rows: Standing[], matches: number, title = "Standings"): Payload {
  return { v: "table", d: { title, subtitle: `After ${matches} match${matches === 1 ? "" : "es"}`, head: ["#", "Team", ...Array.from({ length: matches }, (_, i) => `M${i + 1}`), "Kills", "Total"], rows: rows.map((r) => [String(r.rank), r.name, ...r.perMatch.map(String), String(r.kills), String(r.total)]), strong: 2 + matches + 1 } };
}

/** The league table from the round robin generator, as a screen. */
export function leagueView(rows: Row[], title = "League table"): Payload {
  return { v: "table", d: { title, head: ["#", "Team", "P", "W", "D", "L", "Diff", "Pts"], rows: rows.map((r) => [String(r.rank), r.team, String(r.played), String(r.won), String(r.drawn), String(r.lost), r.diff > 0 ? `+${r.diff}` : String(r.diff), String(r.points)]), strong: 7 } };
}

/** The timed run-sheet, as a screen. `day` is yyyy-mm-dd; times are clock times on that day. */
export function scheduleView(slots: Slot[], title = "Match schedule", day?: string): Payload {
  return { v: "schedule", d: { title, date: day, slots: slots.map((s) => ({ n: s.slot, start: s.start, end: s.end, label: s.matches.map((m) => `M${m}`).join(", "), breakAfter: s.breakAfter })) } };
}

const clean = (x: string | null | undefined, fallback: string) => x ?? fallback;

/** A single elimination bracket (from the bracket maker) as a screen. `rounds[0]` is the first round, the last entry holds the champion. */
export function singleElimView(rounds: (string | null)[][], picks: Record<string, 0 | 1 | undefined>, names: string[], title = "Bracket"): Payload {
  const body = rounds.slice(0, -1).map((round, r) => ({
    name: names[r] ?? `Round ${r + 1}`,
    matches: Array.from({ length: round.length / 2 }, (_, m) => {
      const a = round[m * 2] ?? null, b = round[m * 2 + 1] ?? null;
      const bye = r === 0 && Boolean((!a && b) || (a && !b));
      return { a: clean(a, bye ? "Bye" : "TBD"), b: clean(b, bye ? "Bye" : "TBD"), w: bye ? (a ? (0 as const) : (1 as const)) : picks[`${r}-${m}`] };
    }),
  }));
  const data: BracketData = { title, sections: [{ name: "", rounds: body }], champion: rounds[rounds.length - 1]?.[0] ?? undefined };
  return { v: "bracket", d: data };
}

/** A double elimination bracket as a screen: winners, losers and the grand final. */
export function doubleElimView(bracket: Bracket, picks: Record<string, 0 | 1 | undefined>, title = "Double elimination"): Payload {
  const label = (s: ReturnType<typeof slots>[number]) => (s.kind === "team" ? s.name : s.kind === "bye" ? "Bye" : "TBD");
  const toMatch = (id: string) => {
    const m = bracket.matches.find((x) => x.id === id)!;
    const s = slots(bracket, m, picks);
    return { a: label(s[0]), b: label(s[1]), w: isPlayable(s) ? picks[m.id] : undefined };
  };
  const rounds = (kind: "W" | "L") => {
    const ms = bracket.matches.filter((m) => m.bracket === kind);
    const n = Math.max(...ms.map((m) => m.round));
    return Array.from({ length: n }, (_, i) => ({ name: `Round ${i + 1}`, matches: ms.filter((m) => m.round === i + 1).map((m) => toMatch(m.id)) }));
  };
  const finals = [{ name: "Grand final", matches: [toMatch("GF")] }, ...(picks["GF"] === 1 ? [{ name: "Reset final", matches: [toMatch("GF2")] }] : [])];
  return { v: "bracket", d: { title, sections: [{ name: "Winners bracket", rounds: rounds("W") }, { name: "Losers bracket", rounds: rounds("L") }, { name: "Grand final", rounds: finals }], champion: champion(bracket, picks)?.name } };
}
