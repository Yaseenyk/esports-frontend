"use client";

import { AnimatePresence, m as motion } from "framer-motion";
import { sendEvent } from "@/lib/track";
import { useEffect, useMemo, useState } from "react";
import { useXp } from "@/components/XpProvider";
import ScreenButtons from "@/components/display/ScreenButtons";
import WinnersBlock from "@/components/display/WinnersBlock";
import { singleElimView } from "@/lib/display-views";
import { seedOrder, uniqueTeams } from "@/lib/seeding";
import TeamsInput from "./TeamsInput";
import ToolStep from "./ToolStep";

const EXAMPLE = ["Sample Squad A", "Sample Squad B", "Sample Squad C", "Sample Squad D", "Sample Squad E", "Sample Squad F", "Sample Squad G", "Sample Squad H"];

const roundName = (r: number, rounds: number) => (r === rounds - 1 ? "Final" : r === rounds - 2 ? "Semi-finals" : r === rounds - 3 ? "Quarter-finals" : `Round ${r + 1}`);

type Slot = string | null;

/** Three steps: add the teams, pick the winners, print it. A fourth, optional step puts it on a TV. */
export default function BracketMaker() {
  const { award } = useXp();
  const [text, setText] = useState(EXAMPLE.join("\n"));
  const [picks, setPicks] = useState<Record<string, 0 | 1>>({});
  const all = useMemo(() => uniqueTeams(text.split(/\r?\n/)), [text]);
  const teams = useMemo(() => all.slice(0, 64), [all]);

  const { rounds, size } = useMemo(() => {
    const size = Math.max(2, 2 ** Math.ceil(Math.log2(Math.max(2, teams.length))));
    const total = Math.log2(size);
    const first: Slot[] = seedOrder(size).map((s) => teams[s - 1] ?? null);
    const rounds: Slot[][] = [first];
    for (let r = 0; r < total; r++) {
      const prev = rounds[r];
      const next: Slot[] = [];
      for (let m = 0; m < prev.length / 2; m++) {
        const a = prev[m * 2], b = prev[m * 2 + 1];
        const pick = picks[`${r}-${m}`];
        // A bye advances automatically.
        next.push(r === 0 && a && !b ? a : r === 0 && !a && b ? b : a && b && pick !== undefined ? (pick === 0 ? a : b) : null);
      }
      rounds.push(next);
    }
    return { rounds, size };
  }, [teams, picks]);

  const champion = rounds[rounds.length - 1][0];
  const ready = teams.length >= 2;
  const finalists = rounds.length > 1 ? rounds[rounds.length - 2] : undefined; // the two teams in the final
  const runnerUp = champion ? (finalists?.find((t) => t && t !== champion) ?? null) : null;
  const total = Math.max(0, teams.length - 1); // a knockout of n teams always has n - 1 matches to play
  const decided = Object.keys(picks).length;
  const screen = useMemo(() => (ready ? singleElimView(rounds, picks, rounds.slice(0, -1).map((_, r) => roundName(r, rounds.length - 1))) : null), [rounds, picks, ready]);
  useEffect(() => { if (champion && teams.length >= 4) award("bracket-boss", 20, "Bracket boss: crowned a champion"); }, [champion, teams.length, award]);

  const choose = (r: number, m: number, side: 0 | 1) => {
    setPicks((p) => {
      if (p[`${r}-${m}`] === side) { const n = { ...p }; delete n[`${r}-${m}`]; for (let rr = r + 1; rr < rounds.length - 1; rr++) delete n[`${rr}-${Math.floor(m / 2 ** (rr - r))}`]; return n; } // tap the winner again to undo
      const n = { ...p, [`${r}-${m}`]: side };
      // Changing a result invalidates later picks that depended on it.
      for (let rr = r + 1; rr < rounds.length - 1; rr++) delete n[`${rr}-${Math.floor(m / 2 ** (rr - r))}`];
      return n;
    });
  };

  const shuffle = () => { const a = [...all]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } setText(a.join("\n")); setPicks({}); };

  return (
    <div className="space-y-5">
      <div className="no-print">
        <ToolStep n={1} id="bk-teams" title="Add your teams" done={ready}
          hint="List the best team first. A knockout bracket keeps the strongest teams apart until the later rounds, so the order you type is the seeding."
          status={ready ? `Bracket of ${size}${size > teams.length ? `, ${size - teams.length} bye${size - teams.length === 1 ? "" : "s"}` : ""}` : undefined}>
          <TeamsInput value={text} onChange={(v) => { setText(v); setPicks({}); }} min={2} max={64} example={EXAMPLE} label="Team names" />
          {ready && (
            <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-300">
              <span>Not sure who is the best? </span>
              <button type="button" className="btn-ghost !min-h-10 px-4 text-sm" onClick={shuffle}>Shuffle the order</button>
              {size > teams.length && <span>A bye means a team goes straight to the next round without playing.</span>}
            </div>
          )}
        </ToolStep>
      </div>

      <ToolStep n={2} id="bk-pick" title="Pick the winners" className="print:border-0 print:p-0 print:shadow-none"
        hint={ready ? "After each match, tap the team that won. It moves on to the next round. Tapped the wrong one? Tap it again to undo." : "Your bracket appears here as soon as you add two teams in step 1."}
        status={ready ? (champion ? "Champion decided" : `${Math.min(decided, total)} of ${total} matches decided`) : undefined}
        done={Boolean(champion)}
        actions={ready && decided > 0 ? <button type="button" className="btn-ghost !min-h-10 px-3 text-sm no-print" onClick={() => setPicks({})}>Clear results</button> : undefined}>
        <p className="text-xs text-zinc-400 sm:hidden no-print">Swipe sideways to see every round.</p>
        <div className="overflow-x-auto pb-2 outline-none focus-visible:ring-2 focus-visible:ring-cyan" role="region" aria-label="Bracket" tabIndex={0}>
          {!ready ? <p className="rounded-xl border border-dashed border-white/15 p-6 text-center text-zinc-300">No bracket yet. Add at least two teams above.</p> : (
            <div className="flex min-w-max gap-6">
              {rounds.slice(0, -1).map((round, r) => (
                <div key={r} className="flex w-52 flex-col">
                  <h4 className="mb-3 text-center font-display text-sm font-bold uppercase tracking-wider text-zinc-300">{roundName(r, rounds.length - 1)}</h4>
                  <div className="flex flex-1 flex-col justify-around gap-3">
                    {Array.from({ length: round.length / 2 }, (_, m) => {
                      const a = round[m * 2], b = round[m * 2 + 1];
                      const won = picks[`${r}-${m}`];
                      const bye = r === 0 && Boolean((!a && b) || (a && !b));
                      return (
                        <div key={m} className="overflow-hidden rounded-xl border border-white/[0.14] bg-[#0a0b0d]">
                          {[a, b].map((t, side) => {
                            const winner = bye ? !!t : won === side;
                            const lost = !bye && won !== undefined && won !== side;
                            return (
                              <button key={side} type="button" disabled={!a || !b || bye} onClick={() => choose(r, m, side as 0 | 1)} aria-pressed={bye ? undefined : won === side}
                                aria-label={t && a && b && !bye ? `${t} wins this match${won === side ? " (selected, tap to undo)" : ""}` : undefined}
                                className={`flex min-h-11 w-full items-center justify-between gap-2 px-3 text-left text-sm outline-none transition-colors focus-visible:bg-white/10 ${side ? "border-t border-white/10" : ""} ${winner ? "bg-cyan/15 font-semibold text-white" : lost ? "text-zinc-400 line-through" : "text-zinc-200 hover:bg-white/5"} disabled:cursor-default`}>
                                <span className="truncate">{t ?? (bye ? "Bye" : "Waiting")}</span>
                                {winner && <span aria-hidden="true" className="text-cyan">✓</span>}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="flex w-52 flex-col">
                <h4 className="mb-3 text-center font-display text-sm font-bold uppercase tracking-wider text-purple-300">Champion</h4>
                <div className="flex flex-1 items-center">
                  <AnimatePresence mode="wait">
                    <motion.div key={champion ?? "none"} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }}
                      className={`w-full rounded-2xl border p-4 text-center ${champion ? "border-cyan/50 bg-gradient-to-br from-cyan/20 to-purple/20" : "border-white/10 bg-white/[0.02]"}`}>
                      <p className="text-3xl" aria-hidden="true">{champion ? "🏆" : "·"}</p>
                      <p className="mt-1 font-display font-bold text-white">{champion ?? "Decided in the final"}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}
        </div>
      </ToolStep>

      <div className="no-print">
        <ToolStep n={3} id="bk-print" title="Print it" hint="Prints the bracket on its own, without the buttons and instructions. Choose Save as PDF in the print window to keep a file instead.">
          <button type="button" className="btn px-5" disabled={!ready} onClick={() => { sendEvent("tool_complete", "brackets"); window.print(); }}>Print the bracket</button>
        </ToolStep>
      </div>

      {champion && ready && <WinnersBlock first={champion} second={runnerUp ?? undefined} />}

      <div className="no-print"><ScreenButtons payload={screen} what="bracket" step={4} /></div>
    </div>
  );
}
