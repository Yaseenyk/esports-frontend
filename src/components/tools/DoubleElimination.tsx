"use client";

import { useMemo, useState } from "react";
import ScreenButtons from "@/components/display/ScreenButtons";
import { doubleElimView } from "@/lib/display-views";
import { build, champion as championOf, isPlayable, setPick, slots, type Match, type Slot } from "@/lib/doubleelim";
import { uniqueTeams } from "@/lib/seeding";
import TeamsInput from "./TeamsInput";
import ToolStep from "./ToolStep";

const EXAMPLE = ["Konkan Kings", "Pune Phantoms", "Mumbai Mavericks", "Nashik Ninjas", "Goa Gamers", "Thane Titans"];
const label = (s: Slot) => (s.kind === "team" ? s.name : s.kind === "bye" ? "Bye" : s.label);
const roundTitle = (m: Match, rounds: number) => (m.bracket === "F" ? (m.round === 1 ? "Grand final" : "Reset final") : m.bracket === "W" ? (m.round === rounds ? "Winners final" : `Winners round ${m.round}`) : `Losers round ${m.round}`);

/** Three steps: add the teams, tap the winners, optionally show it on a TV. Double elimination: nobody is out until they lose twice. */
export default function DoubleElimination() {
  const [text, setText] = useState(EXAMPLE.join("\n"));
  const [picks, setPicks] = useState<Record<string, 0 | 1 | undefined>>({});
  const teams = useMemo(() => uniqueTeams(text.split(/\r?\n/)), [text]);
  const bracket = useMemo(() => build(teams), [teams]);
  // Clicking the winner again takes the result back. Either way, results that were built on this match are cleared, so they can never point at a different team.
  const pick = (id: string, side: 0 | 1) => setPicks((p) => (bracket ? setPick(bracket, p, id, p[id] === side ? undefined : side) : p));

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
              className={`mt-1 flex min-h-11 w-full items-center justify-between gap-2 rounded-md border px-2 py-1.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan ${won ? "border-cyan bg-[#0c1d27] text-white" : "border-white/10 text-zinc-200"} ${!played ? "cursor-default text-zinc-400" : "hover:border-white/30"}`}>
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
  const decided = Object.values(picks).filter((v) => v !== undefined).length;
  const byes = bracket ? bracket.size - teams.length : 0;

  return (
    <div className="space-y-5">
      <ToolStep n={1} id="de-teams" title="Add your teams" done={Boolean(bracket)}
        hint="List the best team first. The order you type is the seed (the starting rank): strong teams are kept apart until the later rounds."
        status={bracket ? `Bracket of ${bracket.size}${byes ? `, ${byes} bye${byes === 1 ? "" : "s"}` : ""}` : undefined}>
        <TeamsInput value={text} onChange={(v) => { setText(v); setPicks({}); }} min={3} max={64} example={EXAMPLE} label="One team per line" />
        <p className="text-sm text-zinc-300" aria-live="polite">
          {!bracket ? `Add between 3 and 64 different teams to see your bracket${teams.length > 64 ? ` (you have ${teams.length})` : ""}.` : `${teams.length} teams. A bracket for ${bracket.size} places, so ${byes} bye${byes === 1 ? "" : "s"}. Up to ${2 * teams.length - 2} matches, or ${2 * teams.length - 1} if the reset final is played.`}
        </p>
        <p className="text-xs leading-5 text-zinc-400">A bye means a team goes straight to the next round without playing. In double elimination a team is only out after losing twice.</p>
      </ToolStep>

      <ToolStep n={2} id="de-pick" title="Tap the team that won" done={Boolean(champion)}
        hint={bracket ? "After each match, tap the team that won. Winners move on and losers drop down. Tapped the wrong one? Tap it again to undo." : "Your bracket appears here as soon as you add three teams in step 1."}
        status={bracket ? (champion ? "Champion decided" : `${decided} result${decided === 1 ? "" : "s"} entered`) : undefined}
        actions={bracket && decided > 0 ? <button type="button" className="btn-ghost !min-h-10 px-3 text-sm" onClick={() => setPicks({})}>Clear all results</button> : undefined}>
        {!bracket ? <p className="rounded-xl border border-dashed border-white/15 p-6 text-center text-zinc-300">No bracket yet. Add at least three teams above.</p> : (
          <>
            {champion && <p role="status" className="rounded-xl border border-emerald-400/40 bg-[#0a0b0d] p-4 text-center font-display text-xl font-bold text-white">Champion: {champion.name}</p>}
            <p className="text-xs text-zinc-400 sm:hidden">Swipe sideways to see every round.</p>
            {(["W", "L"] as const).map((kind) => (
              <section key={kind} className="space-y-2" aria-label={kind === "W" ? "Winners bracket" : "Losers bracket"}>
                <h4 className="font-display text-base font-bold text-white">{kind === "W" ? "Winners bracket" : "Losers bracket"}</h4>
                <p className="text-sm text-zinc-300">{kind === "W" ? "Everyone starts here. Win and you stay up; lose and you drop to the losers bracket." : "Teams here have lost once. Lose again and you are out."}</p>
                <div role="region" aria-label={`${kind === "W" ? "Winners" : "Losers"} bracket rounds`} tabIndex={0} className="overflow-x-auto outline-none focus-visible:ring-2 focus-visible:ring-cyan">
                  <div className="flex gap-4 pb-2">
                    {group(kind).map((ms, i) => <ul key={i} className="w-56 shrink-0 space-y-2">{ms.map((m) => rowOf(m, wRounds))}</ul>)}
                  </div>
                </div>
              </section>
            ))}
            <section className="space-y-2" aria-label="Grand final">
              <h4 className="font-display text-base font-bold text-white">Grand final</h4>
              <p className="text-sm text-zinc-300">The last match: the winners-bracket champion against the losers-bracket champion. The first has not lost yet, so if the second wins, the final is played once more (the reset final).</p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {rowOf(bracket.matches.find((m) => m.id === "GF")!, wRounds)}
                {resetNeeded ? rowOf(bracket.matches.find((m) => m.id === "GF2")!, wRounds) : <li className="rounded-lg border border-dashed border-white/10 p-2 text-sm text-zinc-400">Reset final: only played if the losers-bracket team wins the grand final.</li>}
              </ul>
            </section>
          </>
        )}
      </ToolStep>

      <ScreenButtons payload={screen} what="bracket" step={3} />
    </div>
  );
}
