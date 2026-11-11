"use client";

import { useMemo, useState } from "react";
import { groupByStage, isDone, scoreText, startText, statusLabel, winnerOf, type PublicMatch } from "@/lib/matches";

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
const BADGE: Record<string, string> = { live: "border-emerald-300 text-emerald-300", ready: "border-cyan text-cyan", finished: "border-zinc-500 text-zinc-300", forfeit: "border-amber-300 text-amber-200", scheduled: "border-zinc-600 text-zinc-300" };

/** Every match, grouped by stage and round, as a phone-first list. Team names are shown as plain text. The chosen team's matches are marked in words as well as colour. */
export default function MatchesView({ matches, team }: { matches: PublicMatch[]; team: string }) {
  const [onlyMine, setOnlyMine] = useState(false);
  const shown = useMemo(() => (onlyMine && team ? matches.filter((m) => same(m.a, team) || same(m.b, team)) : matches), [matches, onlyMine, team]);
  const groups = useMemo(() => groupByStage(shown), [shown]);
  const name = (t: string, win: boolean) => (t.trim() ? <span className={`min-w-0 break-words ${win ? "font-bold text-white" : "text-zinc-100"}`}>{t}{win && <span className="sr-only"> (winner)</span>}</span> : <span className="text-zinc-400">To be decided</span>);
  return (
    <div className="space-y-5" aria-label="Matches">
      {team && <label className="flex min-h-11 items-center gap-3 text-[15px] text-zinc-100"><input type="checkbox" className="h-5 w-5 accent-cyan" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} />Show only {team}&apos;s matches</label>}
      {groups.length === 0 && <p role="status" className="card text-zinc-300">{team ? `${team} has no matches yet.` : "No matches yet."}</p>}
      {groups.map((g) => (
        <section key={g.stage} aria-label={g.label} className="space-y-3">
          <h2 className="font-display text-lg font-bold text-white">{g.label}</h2>
          {g.rounds.map((r) => (
            <div key={r.round} className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Round {r.round}</h3>
              <ul className="space-y-2">
                {r.matches.map((m) => {
                  const mine = !!team && (same(m.a, team) || same(m.b, team));
                  const w = winnerOf(m), t = startText(m);
                  return (
                    <li key={m.id} data-mine={mine ? "true" : undefined} data-status={m.status} className={`rounded-xl bg-[#0a0b0d] p-3 ${mine ? "border-2 border-cyan" : "border border-white/10"}`}>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className={`rounded-full border px-2.5 py-0.5 font-bold uppercase tracking-wider ${BADGE[m.status] ?? BADGE.scheduled}`}>{statusLabel(m.status)}</span>
                        {t && !isDone(m) && <span className="text-zinc-300">Starts {t}</span>}
                        {mine && <span className="font-bold uppercase tracking-wider text-cyan">Your team</span>}
                      </div>
                      <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-base">
                        <span className="flex min-w-0 justify-end text-right">{name(m.a, w === "a")}</span>
                        <span className="rounded-lg bg-white/10 px-2.5 py-1 text-center font-display font-bold tabular-nums text-white" aria-label={scoreText(m) === "vs" ? "versus" : `score ${scoreText(m)}`}>{scoreText(m)}</span>
                        <span className="flex min-w-0">{name(m.b, w === "b")}</span>
                      </div>
                      {m.status === "forfeit" && <p className="mt-1 text-center text-xs text-amber-200">One team did not play.</p>}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
