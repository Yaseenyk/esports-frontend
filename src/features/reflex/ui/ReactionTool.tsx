"use client";

import { btnSecondary } from "@/features/shared/ui/styles";
import ShareResult from "@/features/share-result/ui/ShareResult";
import { TRIES } from "@/features/reflex/domain";
import { useReaction, type Phase } from "@/features/reflex/hooks/useReaction";

const PATH = "/tools/reaction-time-test/";

const PAD: Record<Phase, string> = {
  idle: "Tap here to start",
  wait: "Wait for cyan…",
  go: "Tap now!",
  early: "Too soon. That try does not count. Tap to try again.",
  guess: "Under 100 ms is a guess, not a reaction. Tap to try again.",
  between: "Tap for the next try",
  done: "Done. Tap to test again",
};

/** Big pad, phone first: pointer-down for touch and mouse, Space or Enter for keyboards. Results stay on this device. */
export default function ReactionTool() {
  const r = useReaction();
  const go = r.phase === "go";
  const onKey = (e: React.KeyboardEvent) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); if (!e.repeat) r.tap(); } };
  return (
    <div className="space-y-5" data-clarity-mask="true">
      <button type="button" data-testid="reaction-pad" data-phase={r.phase}
        onPointerDown={(e) => { e.preventDefault(); r.tap(); }} onKeyDown={onKey}
        className={`flex h-72 w-full touch-manipulation select-none flex-col items-center justify-center gap-2 rounded-xl border px-4 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 ${go ? "border-cyan-400 bg-cyan-400 text-ink" : "border-white/10 bg-surface text-zinc-100"}`}>
        <span className="font-display text-2xl font-bold" aria-live="assertive"><span key={r.phase}>{PAD[r.phase]}</span></span>
        {r.phase === "between" && r.last !== undefined && <span className="font-mono text-4xl tabular-nums"><span key={r.times.length}>{r.last} ms</span></span>}
        {r.phase === "done" && <span className="font-mono text-4xl tabular-nums" data-testid="reaction-avg"><span key={r.avg}>{r.avg} ms</span></span>}
        <span className={`text-sm ${go ? "text-ink" : "text-zinc-400"}`}>Try <span key={r.times.length}>{Math.min(r.times.length + (r.phase === "done" ? 0 : 1), TRIES)}</span> of {TRIES}</span>
      </button>

      {r.times.length > 0 && (
        <ol className="flex flex-wrap gap-2" aria-label="Your tries">
          {r.times.map((t, i) => <li key={i} className="rounded-lg border border-white/10 bg-surface px-3 py-1 font-mono text-sm text-zinc-100 tabular-nums">{i + 1}: {t} ms</li>)}
        </ol>
      )}

      {r.phase === "done" && (
        <p className="text-base text-zinc-300" aria-live="polite">
          Average <strong className="font-mono text-cyan-400 tabular-nums"><span key={r.avg}>{r.avg}</span> ms</strong> over {TRIES} tries, best <span className="font-mono tabular-nums"><span key={r.best}>{r.best}</span> ms</span>.
        </p>
      )}
      <ShareResult payload={r.payload} what="reaction time" path={PATH} />

      <section aria-labelledby="rx-saved" className="space-y-2 border-t border-white/10 pt-4">
        <h3 id="rx-saved" className="font-display text-lg text-zinc-100">On this device</h3>
        {r.store.reaction.best ? (
          <>
            <p className="text-sm text-zinc-300">Best average: <span className="font-mono text-zinc-100 tabular-nums" data-testid="reaction-best"><span key={r.store.reaction.best}>{r.store.reaction.best}</span> ms</span>. Last averages: <span className="font-mono tabular-nums"><span key={r.store.reaction.recent.join()}>{r.store.reaction.recent.map((x) => `${x} ms`).join(", ")}</span></span>.</p>
            <button type="button" className={`${btnSecondary} text-sm`} onClick={r.forget}>Forget my results on this device</button>
          </>
        ) : <p className="text-sm text-zinc-300">Finish five tries and your best average is kept in this browser only. Nothing is uploaded.</p>}
        {r.phase !== "idle" && r.phase !== "done" && <button type="button" className={`${btnSecondary} ml-2 text-sm`} onClick={r.reset}>Start over</button>}
      </section>
    </div>
  );
}
