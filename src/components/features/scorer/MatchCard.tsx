"use client";

import { useEffect, useState } from "react";
import { stageLabel, statusLabel } from "@/lib/matches";
import { confirmText, isFinal, parseScore, stepScore, validateScore, type ResultBody, type ScorerMatch } from "@/lib/scorer";
import type { SheetAsk } from "./ConfirmSheet";

const CHIP: Record<string, string> = {
  live: "border-emerald-400/60 text-emerald-300",
  finished: "border-cyan/60 text-cyan",
  forfeit: "border-amber-300/60 text-amber-200",
};
const MARK: Record<string, string> = { live: "● ", finished: "✓ ", forfeit: "⚑ " };

function Stepper({ team, value, onChange }: { team: string; value: number | null; onChange: (n: number | null) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="min-w-0 flex-1 break-words text-lg font-bold leading-tight text-white">{team}</span>
      <button type="button" aria-label={`Take one point off ${team}`} className="btn-ghost !min-h-14 !w-14 shrink-0 !px-0 text-3xl" onClick={() => onChange(stepScore(value, -1))}>−</button>
      <input
        aria-label={`${team} score`}
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={3}
        value={value === null ? "" : String(value)}
        onChange={(e) => onChange(parseScore(e.target.value))}
        onFocus={(e) => e.target.select()}
        className="h-14 w-[4.5rem] shrink-0 rounded-lg border border-zinc-600 bg-zinc-900 text-center text-3xl font-extrabold text-white outline-none focus-visible:ring-2 focus-visible:ring-cyan"
      />
      <button type="button" aria-label={`Add one point to ${team}`} className="btn !min-h-14 !w-14 shrink-0 !px-0 text-3xl" onClick={() => onChange(stepScore(value, 1))}>+</button>
    </div>
  );
}

/** One match: big steppers, "Finish match" with a confirm sheet, and everything less common under "More options". */
export default function MatchCard({ match: m, pending, onSend, onAsk }: {
  match: ScorerMatch;
  pending: boolean;
  onSend: (m: ScorerMatch, body: ResultBody, label: string) => void;
  onAsk: (a: SheetAsk) => void;
}) {
  const final = isFinal(m);
  const [a, setA] = useState<number | null>(m.scoreA ?? 0);
  const [b, setB] = useState<number | null>(m.scoreB ?? 0);
  const [dirty, setDirty] = useState(false);
  const [editing, setEditing] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  // Follow the server (or a queued save) until the referee starts typing.
  useEffect(() => { if (!dirty) { setA(m.scoreA ?? 0); setB(m.scoreB ?? 0); } }, [m.scoreA, m.scoreB, m.status, dirty]);

  const ready = !!m.a && !!m.b;
  const showSteppers = ready && (!final || editing);
  const change = (set: (n: number | null) => void) => (n: number | null) => { set(n); setDirty(true); setProblem(null); };

  const finish = () => {
    const v = validateScore(a, b);
    if (!v.ok) { setProblem(v.error); return; }
    const sa = a as number; const sb = b as number;
    onAsk({
      title: confirmText(m.a, m.b, sa, sb),
      detail: sa === sb ? "This is a draw. If the match needs a winner, go back and fix the score." : final ? "This replaces the result that was saved before. The organiser will see that it was changed." : "The organiser and the live page will see it.",
      confirmLabel: final ? "Save the new result" : "Save result",
      run: () => { onSend(m, { status: "finished", scoreA: sa, scoreB: sb }, `${m.a} ${sa}, ${m.b} ${sb}`); setDirty(false); setEditing(false); },
    });
  };
  const markLive = () => {
    const v = validateScore(a, b);
    if (!v.ok) { setProblem(v.error); return; }
    onSend(m, { status: "live", scoreA: a as number, scoreB: b as number }, `${m.a} ${a}, ${m.b} ${b} (live)`);
    setDirty(false);
  };
  const forfeit = (side: "a" | "b") => {
    const win = side === "a" ? m.a : m.b; const lose = side === "a" ? m.b : m.a;
    onAsk({
      title: `${lose} forfeits. ${win} wins?`,
      detail: "The match is marked as a forfeit and the winner moves on. You can change it again while your link works.",
      confirmLabel: `Yes, ${win} wins`,
      run: () => { onSend(m, { status: "forfeit", winner: side }, `${win} win by forfeit against ${lose}`); setDirty(false); setEditing(false); },
    });
  };

  return (
    <article aria-label={`${m.a || "To be decided"} against ${m.b || "to be decided"}`} className="card space-y-4 !p-4">
      <header className="flex flex-wrap items-center gap-2 text-sm text-zinc-300">
        <span className="font-semibold">{stageLabel(m.stage)}</span>
        <span aria-hidden="true">·</span>
        <span>Round {m.round}, match {m.slot}</span>
        <span className={`ml-auto rounded-full border px-3 py-1 text-xs font-bold ${CHIP[m.status] ?? "border-zinc-600 text-zinc-200"}`}>{MARK[m.status] ?? ""}{statusLabel(m.status)}</span>
      </header>

      {!ready && <p className="text-base text-zinc-300">Waiting for both teams to be decided. You can score this match once the names are in.</p>}

      {ready && final && !editing && (
        <div className="space-y-3">
          <p className="text-xl font-bold leading-snug text-white">
            {m.status === "forfeit" ? <>{m.winner === "a" ? m.a : m.b} won by forfeit</> : <>{m.a} {m.scoreA}, {m.b} {m.scoreB}</>}
          </p>
          <button type="button" className="btn-ghost w-full !min-h-12" onClick={() => setEditing(true)}>Change this result</button>
        </div>
      )}

      {showSteppers && (
        <div className="space-y-3">
          <Stepper team={m.a} value={a} onChange={change(setA)} />
          <Stepper team={m.b} value={b} onChange={change(setB)} />
          {problem && <p role="alert" className="text-base font-semibold text-amber-200">{problem}</p>}
          <button type="button" className="btn w-full !min-h-14 text-lg" onClick={finish}>{final ? "Save the new result" : "Finish match"}</button>
          {final && <button type="button" className="btn-ghost w-full !min-h-12" onClick={() => { setEditing(false); setDirty(false); setProblem(null); }}>Cancel</button>}
          <p className="text-sm text-zinc-300">Nothing is sent until you confirm.</p>
        </div>
      )}

      {ready && (
        <details className="group rounded-lg border border-zinc-800">
          <summary className="flex min-h-12 cursor-pointer items-center px-3 text-base font-semibold text-zinc-200 outline-none focus-visible:ring-2 focus-visible:ring-cyan">More options</summary>
          <div className="space-y-3 border-t border-zinc-800 p-3">
            {!final && <button type="button" className="btn-ghost w-full !min-h-12" onClick={markLive}>Show as live with this score</button>}
            <p className="text-sm text-zinc-300">Team did not show up? The other team wins and moves on.</p>
            <div className="grid gap-2">
              <button type="button" className="btn-ghost !min-h-12 !whitespace-normal py-2 text-center" onClick={() => forfeit("a")}>{m.a} wins by forfeit</button>
              <button type="button" className="btn-ghost !min-h-12 !whitespace-normal py-2 text-center" onClick={() => forfeit("b")}>{m.b} wins by forfeit</button>
            </div>
          </div>
        </details>
      )}

      {pending && <p role="status" className="rounded-lg border border-amber-300/40 bg-amber-300/10 px-3 py-2 text-sm font-semibold text-amber-100">Saved on this phone, will send when online.</p>}
    </article>
  );
}
