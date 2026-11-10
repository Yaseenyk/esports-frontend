"use client";

import { AnimatePresence, m as motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useXp } from "@/components/XpProvider";

const SAMPLE = ["Sample Squad A", "Sample Squad B", "Sample Squad C", "Sample Squad D", "Sample Squad E", "Sample Squad F", "Sample Squad G", "Sample Squad H"].join("\n");

/** Standard seeding: 1 meets the lowest seed first, and the top seeds can only meet late. Size must be a power of two. */
export function seedOrder(n: number): number[] {
  let order = [1];
  while (order.length < n) { const m = order.length * 2 + 1; order = order.flatMap((s) => [s, m - s]); }
  return order;
}
const roundName = (r: number, rounds: number) => (r === rounds - 1 ? "Final" : r === rounds - 2 ? "Semi-finals" : r === rounds - 3 ? "Quarter-finals" : `Round ${r + 1}`);

type Slot = string | null;

export default function BracketMaker() {
  const { award } = useXp();
  const [text, setText] = useState(SAMPLE);
  const [picks, setPicks] = useState<Record<string, 0 | 1>>({});
  const teams = useMemo(() => Array.from(new Set(text.split(/\r?\n/).map((t) => t.trim()).filter(Boolean))).slice(0, 64), [text]);

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
  useEffect(() => { if (champion && teams.length >= 4) award("bracket-boss", 20, "Bracket boss: crowned a champion"); }, [champion, teams.length, award]);

  const choose = (r: number, m: number, side: 0 | 1) => {
    setPicks((p) => {
      const n = { ...p, [`${r}-${m}`]: side };
      // Changing a result invalidates later picks that depended on it.
      for (let rr = r + 1; rr < rounds.length - 1; rr++) delete n[`${rr}-${Math.floor(m / 2 ** (rr - r))}`];
      return n;
    });
  };

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[18rem_1fr]">
      <aside className="card no-print h-fit space-y-3">
        <label className="block text-sm font-medium text-zinc-300" htmlFor="teams">Teams (one per line, best seed first)</label>
        <textarea id="teams" className="field min-h-56 py-2" value={text} onChange={(e) => { setText(e.target.value); setPicks({}); }} />
        <p className="text-xs text-zinc-400">{teams.length} {teams.length === 1 ? "team" : "teams"} · bracket of {size}{teams.length > size ? "" : ""}{teams.length >= 64 ? " (max 64)" : ""}</p>
        <div className="flex gap-2">
          <button type="button" className="btn-ghost flex-1 !min-h-10 text-sm" onClick={() => { const a = [...teams]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } setText(a.join("\n")); setPicks({}); }}>Shuffle seeds</button>
          <button type="button" className="btn-ghost flex-1 !min-h-10 text-sm" onClick={() => setPicks({})}>Clear results</button>
        </div>
        <button type="button" className="btn w-full" onClick={() => window.print()}>Print bracket</button>
      </aside>

      <div className="overflow-x-auto pb-4">
        {teams.length < 2 ? <p className="card text-zinc-400">Add at least two teams.</p> : (
          <div className="flex min-w-max gap-6">
            {rounds.slice(0, -1).map((round, r) => (
              <div key={r} className="flex w-52 flex-col">
                <h2 className="mb-3 text-center font-display text-sm font-bold uppercase tracking-wider text-zinc-400">{roundName(r, rounds.length - 1)}</h2>
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
                            <button key={side} type="button" disabled={!a || !b || bye} onClick={() => choose(r, m, side as 0 | 1)}
                              className={`flex min-h-11 w-full items-center justify-between gap-2 px-3 text-left text-sm outline-none transition-colors focus-visible:bg-white/10 ${side ? "border-t border-white/10" : ""} ${winner ? "bg-cyan/15 font-semibold text-white" : lost ? "text-zinc-600 line-through" : "text-zinc-200 hover:bg-white/5"} disabled:cursor-default`}>
                              <span className="truncate">{t ?? (bye ? "Bye" : "TBD")}</span>
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
              <h2 className="mb-3 text-center font-display text-sm font-bold uppercase tracking-wider text-purple-400">Champion</h2>
              <div className="flex flex-1 items-center">
                <AnimatePresence mode="wait">
                  <motion.div key={champion ?? "none"} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    className={`w-full rounded-2xl border p-4 text-center ${champion ? "border-cyan/50 bg-gradient-to-br from-cyan/20 to-purple/20" : "border-white/10 bg-white/[0.02]"}`}>
                    <p className="text-3xl" aria-hidden="true">{champion ? "🏆" : "·"}</p>
                    <p className="mt-1 font-display font-bold text-white">{champion ?? "To be decided"}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
