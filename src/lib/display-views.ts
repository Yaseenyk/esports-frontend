import type { Payload } from "./display";
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
