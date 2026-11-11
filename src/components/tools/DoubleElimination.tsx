"use client";

import { useMemo, useState } from "react";
import ScreenButtons from "@/components/display/ScreenButtons";
import { doubleElimView } from "@/lib/display-views";
import { build, champion as championOf, isPlayable, slots, type Match, type Slot } from "@/lib/doubleelim";

const EXAMPLE = "Konkan Kings\nPune Phantoms\nMumbai Mavericks\nNashik Ninjas\nGoa Gamers\nThane Titans";
const label = (s: Slot) => (s.kind === "team" ? s.name : s.kind === "bye" ? "Bye" : s.label);
const roundTitle = (m: Match, rounds: number) => (m.bracket === "F" ? (m.round === 1 ? "Grand final" : "Reset final") : m.bracket === "W" ? (m.round === rounds ? "Winners final" : `Winners round ${m.round}`) : `Losers round ${m.round}`);

/** Free double elimination bracket: winners and losers brackets, a grand final and a reset final. Click a team to say it won. */
export default function DoubleElimination() {
  const [text, setText] = useState(EXAMPLE);
  const [picks, setPicks] = useState<Record<string, 0 | 1 | undefined>>({});
  const teams = useMemo(() => { const seen = new Set<string>(); return text.split("\n").map((t) => t.trim()).filter((t) => t && !seen.has(t.toLowerCase()) && seen.add(t.toLowerCase())); }, [text]);
  const bracket = useMemo(() => build(teams), [teams]);
  const pick = (id: string, side: 0 | 1) => setPicks((p) => ({ ...p, [id]: p[id] === side ? undefined : side }));

  const group = (kind: "W" | "L") => {
    const ms = bracket!.matches.filter((m) => m.bracket === kind);
    const rounds = Math.max(...ms.map((m) => m.round));
    return Array.from({ length: rounds }, (_, i) => ms.filter((m) => m.round === i + 1));
  };
  const rowOf = (m: Match, wRounds: number) => {
    const s = slots(bracket!, m, picks);
    const played = isPlayable(s);
    const bye = s[0].kind === "bye" || s[1].kind === "bye";
    return (
      <li key={m.id} className="rounded-lg border border-white/[0.14] bg-[#0f1013] p-2 text-sm">
        <p className="mb-1 text-[11px] font-medium text-zinc-400">{m.id} · {roundTitle(m, wRounds)}</p>
        {[0, 1].map((side) => {
          const slot = s[side]!;
          const won = picks[m.id] === side && played;
          return (
            <button key={side} type="button" disabled={!played || bye} aria-pressed={won} onClick={() => pick(m.id, side as 0 | 1)}
              className={`mt-1 flex w-full items-center justify-between gap-2 rounded-md border px-2 py-1.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan ${won ? "border-cyan bg-[#0c1d27] text-white" : "border-white/10 text-zinc-200"} ${!played ? "cursor-default text-zinc-400" : "hover:border-white/30"}`}>
              <span className="truncate">{label(slot)}</span>{slot.kind === "team" && <span className="shrink-0 text-[11px] text-zinc-400">#{slot.seed}</span>}
            </button>
          );
        })}
      </li>
    );
  };

  const champion = bracket ? championOf(bracket, picks) : null;
  const screen = useMemo(() => (bracket ? doubleElimView(bracket, picks) : null), [bracket, picks]);
  const wRounds = bracket ? Math.max(...bracket.matches.filter((m) => m.bracket === "W").map((m) => m.round)) : 0;
  const resetNeeded = picks["GF"] === 1;

  return (
    <div className="space-y-6">
      <section className="card space-y-3" aria-label="Teams">
        <h3 className="font-display text-lg font-bold text-white">1. Teams, best seed first</h3>
        <label className="block text-sm text-zinc-200">One team per line (3 to 64)<textarea className="field mt-1 min-h-32 py-2 font-mono text-sm" value={text} onChange={(e) => { setText(e.target.value); setPicks({}); }} spellCheck={false} /></label>
        <p className="text-sm text-zinc-300" aria-live="polite">{!bracket ? "Enter between 3 and 64 different teams." : `${teams.length} teams. A bracket for ${bracket.size} places, so ${bracket.size - teams.length} bye${bracket.size - teams.length === 1 ? "" : "s"}. Up to ${2 * teams.length - 2} matches, or ${2 * teams.length - 1} if the reset final is played.`}</p>
        <div className="flex flex-wrap gap-2"><button type="button" className="chip" onClick={() => { setText(EXAMPLE); setPicks({}); }}>Load the example</button><button type="button" className="chip" onClick={() => setPicks({})}>Clear all results</button></div>
      </section>

      {bracket && (
        <>
          <ScreenButtons payload={screen} what="bracket" />
          {champion && <p role="status" className="rounded-xl border border-emerald-400/40 bg-[#0a0b0d] p-4 text-center font-display text-xl font-bold text-white">Champion: {champion.name}</p>}
          {(["W", "L"] as const).map((kind) => (
            <section key={kind} className="card space-y-3" aria-label={kind === "W" ? "Winners bracket" : "Losers bracket"}>
              <h3 className="font-display text-lg font-bold text-white">{kind === "W" ? "2. Winners bracket" : "3. Losers bracket"}</h3>
              <p className="text-xs text-zinc-400">{kind === "W" ? "Click a team after its match to say it won. Teams that lose drop to the losers bracket." : "Teams here have lost once. Lose again and you are out."}</p>
              <div role="region" aria-label={`${kind === "W" ? "Winners" : "Losers"} bracket rounds`} tabIndex={0} className="overflow-x-auto outline-none focus-visible:ring-2 focus-visible:ring-cyan">
                <div className="flex gap-4 pb-2">
                  {group(kind).map((ms, i) => <ul key={i} className="w-56 shrink-0 space-y-2">{ms.map((m) => rowOf(m, wRounds))}</ul>)}
                </div>
              </div>
            </section>
          ))}
          <section className="card space-y-3" aria-label="Grand final">
            <h3 className="font-display text-lg font-bold text-white">4. Grand final</h3>
            <p className="text-xs text-zinc-400">The winners-bracket champion has not lost yet, so if the losers-bracket team wins the first final, the final is played once more (the reset).</p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {rowOf(bracket.matches.find((m) => m.id === "GF")!, wRounds)}
              {resetNeeded ? rowOf(bracket.matches.find((m) => m.id === "GF2")!, wRounds) : <li className="rounded-lg border border-dashed border-white/10 p-2 text-sm text-zinc-400">Reset final: only played if the losers-bracket team wins the grand final.</li>}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
