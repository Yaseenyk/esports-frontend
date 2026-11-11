"use client";

import { useMemo, useState } from "react";
import ScreenButtons from "@/components/display/ScreenButtons";
import { leagueView } from "@/lib/display-views";
import { downloadBlob } from "@/lib/idcard/download";
import { BYE, BYE_LABEL, DEFAULT_POINTS, fixtures, matchCount, table, type Fixture, type Score } from "@/lib/roundrobin";
import { uniqueTeams } from "@/lib/seeding";
import NumberField from "./NumberField";
import TeamsInput from "./TeamsInput";
import ToolStep from "./ToolStep";

const EXAMPLE = ["Konkan Kings", "Pune Phantoms", "Mumbai Mavericks", "Nashik Ninjas", "Goa Gamers"];
const num = (v: string): number | null => { if (v.trim() === "") return null; const n = Math.floor(Number(v)); return Number.isFinite(n) && n >= 0 ? n : null; };

/** Five steps: add teams, set how points work, enter scores, read the table, optionally show it on a TV. Everything is worked out in the browser. */
export default function RoundRobin() {
  const [text, setText] = useState(EXAMPLE.join("\n"));
  const [double, setDouble] = useState(false);
  const [pts, setPts] = useState(DEFAULT_POINTS);
  const [scores, setScores] = useState<Record<string, Score>>({});

  const teams = useMemo(() => uniqueTeams(text.split(/\r?\n/)), [text]);
  const tooMany = teams.length > 40;
  const ready = teams.length >= 2 && !tooMany;
  const rounds = useMemo(() => (tooMany ? [] : fixtures(teams, double)), [teams, double, tooMany]);
  // Scores belong to a pairing, not to a position, so fixing a typo in a team name or adding a team never moves a score onto a different match.
  const keyOf = (f: Fixture, ri: number) => `${double && ri >= rounds.length / 2 ? 2 : 1}\u0001${f.a}\u0001${f.b}`;
  const grid = useMemo(() => rounds.map((rd, ri) => rd.map((f) => scores[keyOf(f, ri)] ?? { a: null, b: null })), [rounds, scores]); // eslint-disable-line react-hooks/exhaustive-deps
  const rows = useMemo(() => table(teams, rounds, grid, pts), [teams, rounds, grid, pts]);
  const setScore = (ri: number, fi: number, side: "a" | "b", v: string) => { const k = keyOf(rounds[ri]![fi]!, ri); setScores((s) => ({ ...s, [k]: { ...(s[k] ?? { a: null, b: null }), [side]: num(v) } })); };

  const total = ready ? matchCount(teams.length, double) : 0;
  const scored = grid.reduce((n, rd, ri) => n + rd.reduce((m, s, fi) => (rounds[ri]![fi]!.a === BYE || rounds[ri]![fi]!.b === BYE ? m : m + (s.a !== null && s.b !== null ? 1 : 0)), 0), 0);
  const finished = ready && total > 0 && scored >= total;
  const screen = useMemo(() => (rows.length && ready ? leagueView(rows) : null), [rows, ready]);

  const csv = (kind: "fixtures" | "table") => {
    const q = (c: unknown) => `"${String(c).replace(/"/g, '""')}"`;
    const lines = kind === "fixtures"
      ? [["Round", "Team A", "Team B"], ...rounds.flatMap((rd, ri) => rd.map((f) => [ri + 1, f.a === BYE ? BYE_LABEL : f.a, f.b === BYE ? BYE_LABEL : f.b]))]
      : [["Rank", "Team", "Played", "Won", "Drawn", "Lost", "For", "Against", "Difference", "Points"], ...rows.map((r) => [r.rank, r.team, r.played, r.won, r.drawn, r.lost, r.for, r.against, r.diff, r.points])];
    downloadBlob(new Blob([lines.map((l) => l.map(q).join(",")).join("\r\n")], { type: "text/csv" }), `round-robin-${kind}.csv`);
  };

  const th = "px-3 py-2";
  return (
    <div className="space-y-5">
      <ToolStep n={1} id="rr-teams" title="Add your teams" done={ready}
        hint="In a round robin every team plays every other team once. Type or paste your teams below, one per line."
        status={ready ? `${teams.length} teams, ${matchCount(teams.length, double)} matches` : undefined}>
        <TeamsInput value={text} onChange={(v) => { setText(v); setScores({}); }} min={2} max={40} example={EXAMPLE} label="One team per line" />
        <p className="text-sm text-zinc-300" aria-live="polite">
          {teams.length < 2 ? "Your fixtures appear as soon as you add two teams." : tooMany ? `${teams.length} teams is too many for a round robin (the limit is 40, and everyone would play ${teams.length - 1} matches). Try groups instead: see the formats guide.` : `${teams.length} teams, ${rounds.length} rounds, ${matchCount(teams.length, double)} matches${teams.length % 2 ? ". With an odd number of teams one team sits out each round (a bye)." : "."}`}
        </p>
      </ToolStep>

      <ToolStep n={2} id="rr-points" title="Set how points work" done={ready}
        hint="The usual rule already applies, so you can skip this step. Change it only if your rulebook says something different.">
        <p className="text-sm text-zinc-200">Right now: a win gives <b className="text-white">{pts.win}</b>, a draw <b className="text-white">{pts.draw}</b>, a loss <b className="text-white">{pts.loss}</b>. {double ? "Everyone plays each other twice (home and away)." : "Everyone plays each other once."}</p>
        <details className="group rounded-xl border border-white/10 bg-[#0a0b0d]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan [&::-webkit-details-marker]:hidden">
            <span>More options</span>
            <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 shrink-0 fill-none stroke-current text-zinc-400 transition-transform group-open:rotate-180" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6l5 5 5-5" /></svg>
          </summary>
          <div className="space-y-4 border-t border-white/10 p-4">
            <label className="flex min-h-11 items-center gap-2 text-sm text-zinc-200"><input type="checkbox" checked={double} onChange={(e) => setDouble(e.target.checked)} className="h-5 w-5 accent-cyan" />Play everyone twice (home and away)</label>
            <p className="-mt-2 text-xs leading-5 text-zinc-400">Home and away means every pairing is played two times, so each team meets every other team in two rounds.</p>
            <div className="flex flex-wrap items-end gap-4">
              {(["win", "draw", "loss"] as const).map((k) => (
                <NumberField key={k} className="block text-sm text-zinc-200" inputClassName="!w-24" label={`Points for a ${k}`} value={pts[k]} min={0} max={99} onChange={(n) => setPts((p) => ({ ...p, [k]: n }))} />
              ))}
            </div>
            <p className="text-xs leading-5 text-zinc-400">A draw is when both teams finish with the same score.</p>
          </div>
        </details>
      </ToolStep>

      <ToolStep n={3} id="rr-scores" title="Enter the scores as matches finish" done={finished}
        hint="Type each team's score next to its name when a match ends. A match counts in the table once both boxes are filled in."
        status={ready ? (finished ? "All matches have a score" : `${scored} of ${total} matches have a score`) : undefined}
        actions={ready ? <>
          <button type="button" className="btn-ghost !min-h-10 px-3 text-sm" onClick={() => csv("fixtures")}>Download fixtures (CSV)</button>
          {scored > 0 && <button type="button" className="btn-ghost !min-h-10 px-3 text-sm" onClick={() => setScores({})}>Clear all scores</button>}
        </> : undefined}>
        {!ready ? <p className="rounded-xl border border-dashed border-white/15 p-6 text-center text-zinc-300">No fixtures yet. Add at least two teams in step 1.</p> : (
          <div className="grid gap-4 md:grid-cols-2">
            {rounds.map((rd, ri) => (
              <fieldset key={ri} className="min-w-0 rounded-xl border border-white/[0.14] bg-[#0f1013] p-3">
                <legend className="px-2 font-display text-sm font-bold text-white">Round {ri + 1}</legend>
                <ul className="space-y-2">
                  {rd.map((f, fi) => f.a === BYE || f.b === BYE
                    ? <li key={fi} className="text-sm text-zinc-400">{f.a === BYE ? f.b : f.a} has a bye (sits out this round)</li>
                    : (
                      <li key={fi} className="flex items-center gap-2 text-sm">
                        <span className="min-w-0 flex-1 truncate text-right text-zinc-100">{f.a}</span>
                        <input aria-label={`Round ${ri + 1}, ${f.a} score`} className="field !min-h-11 !w-16 !px-1 text-center" inputMode="numeric" value={grid[ri]![fi]!.a ?? ""} onChange={(e) => setScore(ri, fi, "a", e.target.value)} />
                        <span aria-hidden="true" className="text-zinc-500">–</span>
                        <input aria-label={`Round ${ri + 1}, ${f.b} score`} className="field !min-h-11 !w-16 !px-1 text-center" inputMode="numeric" value={grid[ri]![fi]!.b ?? ""} onChange={(e) => setScore(ri, fi, "b", e.target.value)} />
                        <span className="min-w-0 flex-1 truncate text-zinc-100">{f.b}</span>
                      </li>
                    ))}
                </ul>
              </fieldset>
            ))}
          </div>
        )}
      </ToolStep>

      <ToolStep n={4} id="rr-table" title="Read the league table" done={finished}
        hint="It updates by itself every time you enter a score. Nothing to press."
        status={ready && rows.length ? (finished ? `Winner: ${rows[0]!.team}` : scored > 0 ? `Leading: ${rows[0]!.team}` : undefined) : undefined}
        actions={ready ? <button type="button" className="btn-ghost !min-h-10 px-3 text-sm" onClick={() => csv("table")}>Download table (CSV)</button> : undefined}>
        {!ready ? <p className="rounded-xl border border-dashed border-white/15 p-6 text-center text-zinc-300">No table yet. It appears once you have two teams.</p> : (
          <section aria-label="League table" aria-live="polite" className="space-y-3">
            {scored === 0 && <p className="text-sm text-zinc-300">No scores yet, so every team is on 0 points. Enter a score in step 3 to see it move.</p>}
            <div role="region" aria-label="League table" tabIndex={0} className="overflow-x-auto outline-none focus-visible:ring-2 focus-visible:ring-cyan">
              <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
                <thead><tr className="bg-[#0f1013] text-zinc-200">{["#", "Team", "P", "W", "D", "L", "For", "Against", "Diff", "Pts"].map((h) => <th key={h} scope="col" className={th}>{h}</th>)}</tr></thead>
                <tbody>{rows.map((r) => <tr key={r.team} className="border-t border-white/[0.08]"><th scope="row" className="px-3 py-2 font-bold text-cyan">{r.rank}</th><td className="px-3 py-2 font-medium text-white">{r.team}</td><td className="px-3 py-2 text-zinc-300">{r.played}</td><td className="px-3 py-2 text-zinc-300">{r.won}</td><td className="px-3 py-2 text-zinc-300">{r.drawn}</td><td className="px-3 py-2 text-zinc-300">{r.lost}</td><td className="px-3 py-2 text-zinc-300">{r.for}</td><td className="px-3 py-2 text-zinc-300">{r.against}</td><td className="px-3 py-2 text-zinc-300">{r.diff > 0 ? `+${r.diff}` : r.diff}</td><td className="px-3 py-2 font-bold text-white">{r.points}</td></tr>)}</tbody>
              </table>
            </div>
            <p className="text-xs leading-5 text-zinc-400">P = played, W = won, D = drawn, L = lost, For = scores made, Against = scores conceded, Diff = For minus Against, Pts = points.</p>
            <p className="text-xs leading-5 text-zinc-400">When teams have the same points, a tie-break decides the order: score difference, then scores for, then wins, then team name. Write your own tie-breakers in your rules before the event.</p>
          </section>
        )}
      </ToolStep>

      <ScreenButtons payload={screen} what="league table" step={5} />
    </div>
  );
}
