"use client";

import { useMemo, useState } from "react";
import { downloadBlob } from "@/lib/idcard/download";
import { BYE, DEFAULT_POINTS, fixtures, matchCount, table, type Score } from "@/lib/roundrobin";

const EXAMPLE = "Konkan Kings\nPune Phantoms\nMumbai Mavericks\nNashik Ninjas\nGoa Gamers";
const num = (v: string): number | null => { if (v.trim() === "") return null; const n = Math.floor(Number(v)); return Number.isFinite(n) && n >= 0 ? n : null; };

/** Free round-robin fixtures and league table. Everything is worked out in the browser. */
export default function RoundRobin() {
  const [text, setText] = useState(EXAMPLE);
  const [double, setDouble] = useState(false);
  const [pts, setPts] = useState(DEFAULT_POINTS);
  const [scores, setScores] = useState<Record<string, Score>>({});

  const teams = useMemo(() => { const seen = new Set<string>(); return text.split("\n").map((t) => t.trim()).filter((t) => t && !seen.has(t.toLowerCase()) && seen.add(t.toLowerCase())); }, [text]);
  const rounds = useMemo(() => fixtures(teams, double), [teams, double]);
  const grid = useMemo(() => rounds.map((rd, ri) => rd.map((_, fi) => scores[`${ri}-${fi}`] ?? { a: null, b: null })), [rounds, scores]);
  const rows = useMemo(() => table(teams, rounds, grid, pts), [teams, rounds, grid, pts]);
  const setScore = (ri: number, fi: number, side: "a" | "b", v: string) => setScores((s) => ({ ...s, [`${ri}-${fi}`]: { ...(s[`${ri}-${fi}`] ?? { a: null, b: null }), [side]: num(v) } }));
  const tooMany = teams.length > 40;

  const csv = (kind: "fixtures" | "table") => {
    const q = (c: unknown) => `"${String(c).replace(/"/g, '""')}"`;
    const lines = kind === "fixtures"
      ? [["Round", "Team A", "Team B"], ...rounds.flatMap((rd, ri) => rd.map((f) => [ri + 1, f.a, f.b]))]
      : [["Rank", "Team", "Played", "Won", "Drawn", "Lost", "For", "Against", "Difference", "Points"], ...rows.map((r) => [r.rank, r.team, r.played, r.won, r.drawn, r.lost, r.for, r.against, r.diff, r.points])];
    downloadBlob(new Blob([lines.map((l) => l.map(q).join(",")).join("\r\n")], { type: "text/csv" }), `round-robin-${kind}.csv`);
  };

  return (
    <div className="space-y-6">
      <section className="card space-y-4" aria-label="Teams and points">
        <h3 className="font-display text-lg font-bold text-white">1. Teams</h3>
        <label className="block text-sm text-zinc-200">One team per line<textarea className="field mt-1 min-h-36 py-2 font-mono text-sm" value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} /></label>
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex items-center gap-2 text-sm text-zinc-200"><input type="checkbox" checked={double} onChange={(e) => setDouble(e.target.checked)} className="h-5 w-5 accent-cyan" />Play everyone twice (home and away)</label>
          {(["win", "draw", "loss"] as const).map((k) => (
            <label key={k} className="text-sm text-zinc-200">Points for a {k}<input className="field mt-1 !w-24" type="number" min={0} value={pts[k]} onChange={(e) => setPts({ ...pts, [k]: Math.max(0, Math.floor(Number(e.target.value) || 0)) })} /></label>
          ))}
        </div>
        <p className="text-sm text-zinc-300" aria-live="polite">{teams.length < 2 ? "Enter at least two teams." : tooMany ? "That is a lot of teams for a round robin. Try groups instead (see the formats guide)." : `${teams.length} teams, ${rounds.length} rounds, ${matchCount(teams.length, double)} matches${teams.length % 2 ? ". With an odd number of teams one team has a bye each round." : "."}`}</p>
        <div className="flex flex-wrap gap-2"><button type="button" className="chip" onClick={() => { setText(EXAMPLE); setScores({}); }}>Load the example</button><button type="button" className="chip" onClick={() => setScores({})}>Clear all scores</button></div>
      </section>

      {rounds.length > 0 && !tooMany && (
        <>
          <section className="card space-y-4" aria-label="Fixtures">
            <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-display text-lg font-bold text-white">2. Fixtures and results</h3><button type="button" className="btn-ghost !min-h-9 px-3 text-sm" onClick={() => csv("fixtures")}>Download fixtures (CSV)</button></div>
            <p className="text-xs text-zinc-400">Type each score as the match finishes. A match counts in the table once both scores are filled in.</p>
            <div className="grid gap-4 md:grid-cols-2">
              {rounds.map((rd, ri) => (
                <fieldset key={ri} className="min-w-0 rounded-xl border border-white/[0.14] bg-[#0f1013] p-3">
                  <legend className="px-2 font-display text-sm font-bold text-white">Round {ri + 1}</legend>
                  <ul className="space-y-2">
                    {rd.map((f, fi) => f.a === BYE || f.b === BYE
                      ? <li key={fi} className="text-sm text-zinc-400">{f.a === BYE ? f.b : f.a} has a bye</li>
                      : (
                        <li key={fi} className="flex items-center gap-2 text-sm">
                          <span className="min-w-0 flex-1 truncate text-right text-zinc-100">{f.a}</span>
                          <input aria-label={`Round ${ri + 1}, ${f.a} score`} className="field !min-h-9 !w-14 !px-1 text-center" inputMode="numeric" value={grid[ri]![fi]!.a ?? ""} onChange={(e) => setScore(ri, fi, "a", e.target.value)} />
                          <span aria-hidden="true" className="text-zinc-500">–</span>
                          <input aria-label={`Round ${ri + 1}, ${f.b} score`} className="field !min-h-9 !w-14 !px-1 text-center" inputMode="numeric" value={grid[ri]![fi]!.b ?? ""} onChange={(e) => setScore(ri, fi, "b", e.target.value)} />
                          <span className="min-w-0 flex-1 truncate text-zinc-100">{f.b}</span>
                        </li>
                      ))}
                  </ul>
                </fieldset>
              ))}
            </div>
          </section>

          <section className="card space-y-3" aria-label="League table" aria-live="polite">
            <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-display text-lg font-bold text-white">3. League table</h3><button type="button" className="btn-ghost !min-h-9 px-3 text-sm" onClick={() => csv("table")}>Download table (CSV)</button></div>
            <div role="region" aria-label="League table" tabIndex={0} className="overflow-x-auto outline-none focus-visible:ring-2 focus-visible:ring-cyan">
              <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
                <thead><tr className="bg-[#0f1013] text-zinc-200">{["#", "Team", "P", "W", "D", "L", "For", "Against", "Diff", "Pts"].map((h) => <th key={h} scope="col" className="px-3 py-2">{h}</th>)}</tr></thead>
                <tbody>{rows.map((r) => <tr key={r.team} className="border-t border-white/[0.08]"><th scope="row" className="px-3 py-2 font-bold text-cyan">{r.rank}</th><td className="px-3 py-2 font-medium text-white">{r.team}</td><td className="px-3 py-2 text-zinc-300">{r.played}</td><td className="px-3 py-2 text-zinc-300">{r.won}</td><td className="px-3 py-2 text-zinc-300">{r.drawn}</td><td className="px-3 py-2 text-zinc-300">{r.lost}</td><td className="px-3 py-2 text-zinc-300">{r.for}</td><td className="px-3 py-2 text-zinc-300">{r.against}</td><td className="px-3 py-2 text-zinc-300">{r.diff > 0 ? `+${r.diff}` : r.diff}</td><td className="px-3 py-2 font-bold text-white">{r.points}</td></tr>)}</tbody>
              </table>
            </div>
            <p className="text-xs text-zinc-400">Order: points, then score difference, then scores for, then wins, then team name. Write your own tie-breakers in your rules before the event.</p>
          </section>
        </>
      )}
    </div>
  );
}
