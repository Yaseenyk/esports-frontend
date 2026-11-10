"use client";

import { Fragment, useMemo, useState } from "react";
import { EXAMPLE_SCALE, parsePlacement, standings, type TeamEntry } from "@/lib/points";
import ScreenButtons from "@/components/display/ScreenButtons";
import { pointsView } from "@/lib/display-views";
import { downloadBlob } from "@/lib/idcard/download";

const EXAMPLE: TeamEntry[] = [
  { name: "Alpha", matches: [{ placement: 1, kills: 5 }, { placement: 4, kills: 2 }, { placement: 2, kills: 3 }] },
  { name: "Bravo", matches: [{ placement: 2, kills: 6 }, { placement: 1, kills: 4 }, { placement: 5, kills: 1 }] },
  { name: "Charlie", matches: [{ placement: 3, kills: 2 }, { placement: 2, kills: 7 }, { placement: 1, kills: 4 }] },
  { name: "Delta", matches: [{ placement: 4, kills: 3 }, { placement: 3, kills: 1 }, { placement: 3, kills: 6 }] },
];
const num = (v: string) => { const n = Math.floor(Number(v)); return Number.isFinite(n) && n >= 0 ? n : 0; };

/** Free battle royale points table calculator. Everything is worked out in the browser; nothing is sent anywhere. */
export default function PointsTable() {
  const [scaleText, setScaleText] = useState(EXAMPLE_SCALE.placement.join(", "));
  const [perKill, setPerKill] = useState(String(EXAMPLE_SCALE.perKill));
  const [matches, setMatches] = useState(3);
  const [teams, setTeams] = useState<TeamEntry[]>(EXAMPLE);

  const placement = parsePlacement(scaleText);
  const kill = Math.max(0, Number(perKill) || 0);
  const normalised = useMemo(() => teams.map((t) => ({ ...t, matches: Array.from({ length: matches }, (_, i) => t.matches[i] ?? { placement: 0, kills: 0 }) })), [teams, matches]);
  const table = useMemo(() => (placement ? standings(normalised.filter((t) => t.name.trim()), { placement, perKill: kill }) : []), [normalised, placement, kill]);

  const screen = useMemo(() => (table.length ? pointsView(table, matches) : null), [table, matches]);
  const setCell = (ti: number, mi: number, key: "placement" | "kills", v: string) =>
    setTeams(normalised.map((t, i) => (i === ti ? { ...t, matches: t.matches.map((m, j) => (j === mi ? { ...m, [key]: num(v) } : m)) } : t)));
  const csv = () => {
    const head = ["Rank", "Team", ...Array.from({ length: matches }, (_, i) => `Match ${i + 1}`), "Placement points", "Kill points", "Total"];
    const rows = table.map((s) => [s.rank, s.name, ...s.perMatch, s.placementPoints, s.killPoints, s.total]);
    downloadBlob(new Blob([[head, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n")], { type: "text/csv" }), "points-table.csv");
  };

  return (
    <div className="space-y-6">
      <section className="card space-y-4" aria-label="Points scale">
        <h3 className="font-display text-lg font-bold text-white">1. Points scale</h3>
        <div className="grid gap-4 sm:grid-cols-[1fr_9rem_9rem]">
          <label className="block text-sm text-zinc-200">Placement points, 1st place first<input className="field mt-1 font-mono" value={scaleText} onChange={(e) => setScaleText(e.target.value)} aria-invalid={!placement} aria-describedby="scale-help" /></label>
          <label className="block text-sm text-zinc-200">Points per kill<input className="field mt-1" type="number" min={0} step={0.5} value={perKill} onChange={(e) => setPerKill(e.target.value)} /></label>
          <label className="block text-sm text-zinc-200">Matches played<input className="field mt-1" type="number" min={1} max={12} value={matches} onChange={(e) => setMatches(Math.min(12, Math.max(1, num(e.target.value) || 1)))} /></label>
        </div>
        <p id="scale-help" className={`text-xs ${placement ? "text-zinc-400" : "text-red-300"}`} role={placement ? undefined : "alert"}>{placement ? "Separate the numbers with commas. A team placed below the end of the list gets 0 placement points. The numbers shown are an example: use your own rulebook's scale." : "Enter numbers only, separated by commas, for example 10, 6, 5, 4, 3, 2, 1, 1."}</p>
      </section>

      <section className="card space-y-3" aria-label="Results entry">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-lg font-bold text-white">2. Enter each team&apos;s placement and kills</h3>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="chip" onClick={() => setTeams([...normalised, { name: `Team ${normalised.length + 1}`, matches: [] }])}>Add a team</button>
            <button type="button" className="chip" onClick={() => setTeams(normalised.map((t) => ({ ...t, matches: t.matches.map(() => ({ placement: 0, kills: 0 })) })))}>Clear results</button>
            <button type="button" className="chip" onClick={() => { setTeams(EXAMPLE); setMatches(3); setScaleText(EXAMPLE_SCALE.placement.join(", ")); setPerKill("1"); }}>Load the example</button>
          </div>
        </div>
        <ul className="space-y-3">
          {normalised.map((t, ti) => (
            <li key={ti} className="rounded-xl border border-white/[0.14] bg-[#0f1013] p-3">
              <div className="flex items-center gap-2">
                <input aria-label={`Team ${ti + 1} name`} className="field !min-h-10 min-w-0 flex-1 font-semibold" value={t.name} onChange={(e) => setTeams(normalised.map((x, i) => (i === ti ? { ...x, name: e.target.value } : x)))} />
                <button type="button" className="chip !min-h-10 shrink-0" aria-label={`Remove ${t.name || `team ${ti + 1}`}`} onClick={() => setTeams(normalised.filter((_, i) => i !== ti))}>Remove</button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {t.matches.map((m, mi) => (
                  <fieldset key={mi} className="min-w-0 rounded-lg border border-white/[0.1] p-2">
                    <legend className="px-1 text-xs font-medium text-zinc-300">Match {mi + 1}</legend>
                    <div className="flex gap-2">
                      <label className="block min-w-0 flex-1 text-[11px] text-zinc-400">Place<input aria-label={`${t.name || `Team ${ti + 1}`}, match ${mi + 1}, placement`} className="field !min-h-9 mt-0.5 !px-2 text-center" inputMode="numeric" value={m.placement || ""} onChange={(e) => setCell(ti, mi, "placement", e.target.value)} /></label>
                      <label className="block min-w-0 flex-1 text-[11px] text-zinc-400">Kills<input aria-label={`${t.name || `Team ${ti + 1}`}, match ${mi + 1}, kills`} className="field !min-h-9 mt-0.5 !px-2 text-center" inputMode="numeric" value={m.kills || ""} onChange={(e) => setCell(ti, mi, "kills", e.target.value)} /></label>
                    </div>
                  </fieldset>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="card space-y-3" aria-label="Standings" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-display text-lg font-bold text-white">3. Standings</h3><button type="button" className="btn-ghost !min-h-9 px-3 text-sm" disabled={!table.length} onClick={csv}>Download as CSV</button></div>
        {table.length === 0 ? <p className="text-sm text-zinc-400">Fix the points scale above to see the table.</p> : (
          <div role="region" aria-label="Standings table" tabIndex={0} className="overflow-x-auto outline-none focus-visible:ring-2 focus-visible:ring-cyan">
            <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
              <thead><tr className="bg-[#0f1013] text-zinc-200"><th scope="col" className="px-3 py-2">Rank</th><th scope="col" className="px-3 py-2">Team</th>{Array.from({ length: matches }, (_, i) => <th key={i} scope="col" className="px-3 py-2">M{i + 1}</th>)}<th scope="col" className="px-3 py-2">Kills</th><th scope="col" className="px-3 py-2">Wins</th><th scope="col" className="px-3 py-2">Total</th></tr></thead>
              <tbody>{table.map((s) => <tr key={s.name + s.rank} className="border-t border-white/[0.08]"><th scope="row" className="px-3 py-2 font-bold text-cyan">{s.rank}</th><td className="px-3 py-2 font-medium text-white">{s.name}{s.tied && <span className="ml-2 text-xs text-amber-300" title="Same points as another team; the tie-breakers decided the order">tie-break</span>}</td>{s.perMatch.map((p, i) => <td key={i} className="px-3 py-2 text-zinc-300">{p}</td>)}<td className="px-3 py-2 text-zinc-300">{s.kills}</td><td className="px-3 py-2 text-zinc-300">{s.wins}</td><td className="px-3 py-2 font-bold text-white">{s.total}</td></tr>)}</tbody>
            </table>
          </div>
        )}
        <p className="text-xs text-zinc-400">Ties are broken by most wins, then most kills, then the better placement in the last match, then team name. Put your own tie-breakers in your rules before the event.</p>
      </section>
      <ScreenButtons payload={screen} what="standings" />
    </div>
  );
}
