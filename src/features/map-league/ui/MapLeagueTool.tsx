"use client";

import { ScreenButtons, ShareResult, OverlayKitConnect } from "@/components/display/LazyResults";
import NumberField from "@/components/tools/NumberField";
import TeamsInput from "@/components/tools/TeamsInput";
import ToolStep from "@/components/tools/ToolStep";
import { downloadBlob } from "@/lib/idcard/download";
import { BYE } from "@/lib/roundrobin";
import { sendEvent } from "@/lib/track";
import { BEST_OF, TIE_WORDS, type MapLeagueRow } from "@/features/map-league/domain";
import { EXAMPLE_TEAMS, MAX_TEAMS, MIN_TEAMS, useMapLeague } from "@/features/map-league/hooks/useMapLeague";
import { OVERLAY_KIT } from "@/features/overlay-kit/flag";
import { useKitLeagueFeed } from "@/features/overlay-kit/hooks/useKitLeagueFeed";

const signed = (n: number) => (n > 0 ? `+${n}` : String(n));
const cell = "px-3 py-2 text-zinc-300 tabular-nums";
const box = "min-w-0 rounded-xl border border-white/10 bg-surface p-3";
const roundInput = "field w-16 px-1 text-center font-mono tabular-nums";

/**
 * A league table for 5v5 match games such as Valorant: round robin fixtures, rounds typed per map (best of 1, 3 or 5), standings by
 * points, map difference, round difference and head-to-head. Rendered in the browser only (see MapLeagueLazy); nothing is sent anywhere.
 */
export default function MapLeagueTool({ path, game = "Valorant" }: { /** The page the tool is on, for the address on share pictures. */ path: string; game?: string }) {
  const L = useMapLeague();
  const kitFeed = useKitLeagueFeed(OVERLAY_KIT && L.ready ? L.rows : null);
  const { bestOf } = L.settings;
  const maps = bestOf > 1;
  const finished = L.ready && L.count.total > 0 && L.count.done >= L.count.total;

  const csv = () => {
    const q = (c: unknown) => `"${String(c).replace(/"/g, '""')}"`;
    const head = ["Rank", "Team", "Played", "Won", "Lost", "Maps won", "Maps lost", "Map difference", "Rounds won", "Rounds lost", "Round difference", "Points", "Tie-break"];
    const lines = [head, ...L.rows.map((r) => [r.rank, r.team, r.played, r.won, r.lost, r.mapsWon, r.mapsLost, r.mapDiff, r.roundsWon, r.roundsLost, r.roundDiff, r.points, r.tieBreak ? TIE_WORDS[r.tieBreak] : ""])];
    downloadBlob(new Blob([lines.map((l) => l.map(q).join(",")).join("\r\n")], { type: "text/csv" }), `${game.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-league-table.csv`);
    sendEvent("tool_complete", "round-robin");
  };

  // data-clarity-mask and data-pulse-label keep team names and scores out of the page analytics (see the comment in PointsTable.tsx).
  return (
    <div className="space-y-5" data-clarity-mask="true">
      <ToolStep n={1} id="ml-teams" title="Add your teams" done={L.ready}
        hint="Every team plays every other team once (or twice), like a round robin. Type or paste the teams, one per line."
        status={L.ready ? <span><span>{L.teams.length}</span> teams, <span>{L.count.total}</span> matches</span> : undefined}>
        <TeamsInput value={L.text} onChange={L.changeTeams} min={MIN_TEAMS} max={MAX_TEAMS} example={EXAMPLE_TEAMS} label="One team per line" />
        <label className="flex min-h-11 items-center gap-2 text-sm text-zinc-100"><input type="checkbox" checked={L.double} onChange={(e) => L.setDouble(e.target.checked)} className="h-5 w-5 accent-cyan" />Play everyone twice</label>
      </ToolStep>

      <ToolStep n={2} id="ml-format" title="Choose best of and points" done={L.ready}
        hint="The defaults are a common league setup, not an official rule: a win is 3 points and a loss 0. Change them to match your rules.">
        <div role="group" aria-label="Best of" className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-zinc-100">Each match is a</span>
          {BEST_OF.map((b) => <button key={b} type="button" className="chip" aria-pressed={bestOf === b} onClick={() => L.setBestOf(b)}>Best of {b}</button>)}
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <NumberField label="Points for a win" value={L.settings.win} min={0} max={99} onChange={(n) => L.setPoints("win", n)} inputClassName="w-24" />
          <NumberField label="Points for a loss" value={L.settings.loss} min={0} max={99} onChange={(n) => L.setPoints("loss", n)} inputClassName="w-24" />
        </div>
        <p className="text-xs leading-5 text-zinc-400">A best of 3 is won by the first team to take 2 maps, a best of 5 by the first to take 3. Overtime rounds count like any other round: type the final score of the map.</p>
      </ToolStep>

      <ToolStep n={3} id="ml-results" title="Type the rounds won on each map" done={finished}
        hint="After each map, type how many rounds each team won. A match counts once a team has won enough maps. The next map box appears when it is needed."
        status={L.ready ? <span><span>{L.count.done}</span> of <span>{L.count.total}</span> matches finished</span> : undefined}
        actions={L.ready && L.count.done > 0 ? <button type="button" className="btn-ghost px-3 text-sm" onClick={L.clear}>Clear all results</button> : undefined}>
        {!L.ready ? <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-zinc-300">No fixtures yet. Add between {MIN_TEAMS} and {MAX_TEAMS} teams in step 1.</p> : (
          <div className="grid gap-4 md:grid-cols-2">
            {L.rounds.map((rd, ri) => (
              <fieldset key={ri} className={box}>
                <legend className="px-2 font-display text-sm font-bold text-zinc-100">Round {ri + 1}</legend>
                <ul className="space-y-3">
                  {rd.map((f, fi) => {
                    if (f.a === BYE || f.b === BYE) return <li key={fi} className="text-sm text-zinc-400"><span>{f.a === BYE ? f.b : f.a}</span> sits out this round</li>;
                    const o = L.outcome(ri, fi);
                    const label = `Round ${ri + 1}, ${f.a} against ${f.b}`;
                    return (
                      <li key={fi} className="space-y-2 border-t border-white/10 pt-3 first:border-t-0 first:pt-0" aria-label={label}>
                        <p className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                          <span className="font-semibold text-zinc-100"><span>{f.a}</span> <span className="text-zinc-400">vs</span> <span>{f.b}</span></span>
                          {o.status === "done" && <span className="text-success" data-testid="match-result"><span>{o.winner === "a" ? f.a : f.b}</span> won{maps ? <> <span className="font-mono tabular-nums"><span>{Math.max(o.mapsA, o.mapsB)}</span>–<span>{Math.min(o.mapsA, o.mapsB)}</span></span></> : null}</span>}
                        </p>
                        {Array.from({ length: o.showMaps }, (_, mi) => {
                          const m = L.grid[ri]?.[fi]?.[mi] ?? { a: null, b: null };
                          return (
                            <div key={mi} className="flex items-center gap-2 text-sm">
                              <span className="w-12 shrink-0 text-xs text-zinc-400">Map {mi + 1}</span>
                              <input data-pulse-label="rounds" aria-label={`${label}, map ${mi + 1}, rounds won by ${f.a}`} className={roundInput} inputMode="numeric" value={m.a ?? ""} onChange={(e) => L.setRounds(ri, fi, mi, "a", e.target.value)} />
                              <span aria-hidden="true" className="text-zinc-400">–</span>
                              <input data-pulse-label="rounds" aria-label={`${label}, map ${mi + 1}, rounds won by ${f.b}`} className={roundInput} inputMode="numeric" value={m.b ?? ""} onChange={(e) => L.setRounds(ri, fi, mi, "b", e.target.value)} />
                            </div>
                          );
                        })}
                        {o.status === "level" && <p role="alert" className="text-xs text-danger"><span aria-hidden="true">! </span>A map cannot end level. Check the rounds: one team must have more.</p>}
                      </li>
                    );
                  })}
                </ul>
              </fieldset>
            ))}
          </div>
        )}
      </ToolStep>

      <ToolStep n={4} id="ml-table" title="Read the standings" done={finished}
        hint="They update as you type. Nothing to press."
        status={L.ready && L.count.done > 0 && L.rows[0] ? <span>{finished ? "Winner" : "Leading"}: <span>{L.rows[0].team}</span></span> : undefined}
        actions={L.ready ? <button type="button" className="btn-ghost px-3 text-sm" onClick={csv}>Download table (CSV)</button> : undefined}>
        {!L.ready ? <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-zinc-300">No table yet. It appears once you have two teams.</p> : <>
          <section aria-label="Standings" aria-live="polite" className="space-y-3">
            {L.count.done === 0 && <p className="text-sm text-zinc-300">No finished matches yet, so every team is on 0 points.</p>}
            <div role="region" aria-label="Standings table" tabIndex={0} className="overflow-x-auto outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">
              <table className="w-full min-w-max border-collapse text-left text-sm">
                <thead><tr className="bg-surface text-zinc-100">{["#", "Team", "P", "W", "L", ...(maps ? ["Maps", "Map diff"] : []), "Rounds", "Round diff", "Pts"].map((h) => <th key={h} scope="col" className="px-3 py-2">{h}</th>)}</tr></thead>
                <tbody>{L.rows.map((r) => <Row key={r.team} r={r} maps={maps} />)}</tbody>
              </table>
            </div>
            <p className="text-xs leading-5 text-zinc-400">P = played, W = won, L = lost{maps ? ", Maps = maps won and lost, Map diff = maps won minus lost" : ""}, Rounds = rounds won and lost, Round diff = rounds won minus lost, Pts = points.</p>
            <p className="text-xs leading-5 text-zinc-400">Teams on the same points are ordered by {maps ? "map difference, then " : ""}round difference, then the points they took from each other (head-to-head), then team name. This is a common league order, not an official one: write your own in the rules before the first match.</p>
          </section>
          {L.count.done > 0 && <ShareResult payload={L.view} what="league table" path={path} />}
        </>}
      </ToolStep>

      <ScreenButtons payload={L.view} what="league table" step={5} path={path} />
      {OVERLAY_KIT && <OverlayKitConnect feed={kitFeed} />}
    </div>
  );
}

function Row({ r, maps }: { r: MapLeagueRow; maps: boolean }) {
  return (
    <tr className="border-t border-white/10">
      <th scope="row" className="px-3 py-2 font-bold text-cyan-400">{r.rank}</th>
      <td className="px-3 py-2 font-medium text-zinc-100"><span>{r.team}</span>{r.tieBreak && <span className="ml-2 text-xs text-warning">tie-break: <span>{TIE_WORDS[r.tieBreak]}</span></span>}</td>
      <td className={cell}>{r.played}</td>
      <td className={cell}>{r.won}</td>
      <td className={cell}>{r.lost}</td>
      {maps && <td className={cell}><span>{r.mapsWon}</span>–<span>{r.mapsLost}</span></td>}
      {maps && <td className={cell}>{signed(r.mapDiff)}</td>}
      <td className={cell}><span>{r.roundsWon}</span>–<span>{r.roundsLost}</span></td>
      <td className={cell}>{signed(r.roundDiff)}</td>
      <td className="px-3 py-2 font-bold text-zinc-100 tabular-nums">{r.points}</td>
    </tr>
  );
}
