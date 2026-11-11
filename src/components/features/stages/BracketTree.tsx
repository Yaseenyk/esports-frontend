"use client";

import type { PlayedMatch } from "@/lib/stages";

/** The knockout as columns of matches. With `onPick` each team is a button (tap the winner, tap again to undo); without it the bracket is read only. */
export default function BracketTree({ matches, roundNames, champion, onPick, label = "Knockout bracket" }: {
  matches: PlayedMatch[]; roundNames: string[]; champion: string | null; onPick?: (id: string, side: "a" | "b") => void; label?: string;
}) {
  return (
    <div className="overflow-x-auto pb-2 outline-none focus-visible:ring-2 focus-visible:ring-cyan" role="region" aria-label={label} tabIndex={0}>
      <div className="flex min-w-max gap-6">
        {roundNames.map((name, i) => {
          const ms = matches.filter((m) => m.round === i + 1);
          if (ms.length === 0) return null;
          return (
            <div key={name + i} className="flex w-52 flex-col">
              <h4 className="mb-3 text-center font-display text-sm font-bold uppercase tracking-wider text-zinc-300">{name}</h4>
              <div className="flex flex-1 flex-col justify-around gap-3">
                {ms.map((m) => (
                  <div key={m.id} className="overflow-hidden rounded-xl border border-white/[0.14] bg-[#0a0b0d]">
                    {(["a", "b"] as const).map((side) => {
                      const t = m[side];
                      const won = m.winner === side, lost = m.winner !== null && !won;
                      return (
                        <button key={side} type="button" disabled={!onPick || !m.a || !m.b} onClick={() => onPick?.(m.id, side)} aria-pressed={onPick && m.a && m.b ? won : undefined}
                          aria-label={t && m.a && m.b && onPick ? `${t} wins this match${won ? " (selected, tap to undo)" : ""}` : undefined}
                          className={`flex min-h-11 w-full items-center justify-between gap-2 px-3 text-left text-sm outline-none transition-colors focus-visible:bg-white/10 ${side === "b" ? "border-t border-white/10" : ""} ${won ? "bg-cyan/15 font-semibold text-white" : lost ? "text-zinc-400 line-through" : "text-zinc-200 enabled:hover:bg-white/5"} disabled:cursor-default`}>
                          <span className="truncate">{t || "To be decided"}</span>
                          {won && <span aria-hidden="true" className="text-cyan">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        <div className="flex w-52 flex-col">
          <h4 className="mb-3 text-center font-display text-sm font-bold uppercase tracking-wider text-purple-300">Champion</h4>
          <div className="flex flex-1 items-center">
            <div className={`w-full rounded-2xl border p-4 text-center ${champion ? "border-cyan/50 bg-gradient-to-br from-cyan/20 to-purple/20" : "border-white/10 bg-white/[0.02]"}`}>
              <p className="text-3xl" aria-hidden="true">{champion ? "🏆" : "·"}</p>
              <p className="mt-1 font-display font-bold text-white">{champion ?? "Decided in the final"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
