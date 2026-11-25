"use client";

import { btnPrimary, btnSecondary } from "@/features/shared/ui/styles";
import ShareResult from "@/features/share-result/ui/ShareResult";
import { DURATIONS } from "@/features/reflex/domain";
import { useTapSpeed } from "@/features/reflex/hooks/useTapSpeed";

const PATH = "/tools/tap-speed-test/";

/** Tap pad, phone first: every pointer-down is one tap, so two thumbs count. The clock starts on the first tap. Best scores stay on this device. */
export default function TapTool() {
  const t = useTapSpeed();
  const running = t.phase === "running";
  return (
    <div className="space-y-5" data-clarity-mask="true">
      <div role="group" aria-label="Test length" className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-zinc-100">Test length:</span>
        {DURATIONS.map((d) => <button key={d} type="button" className="chip" aria-pressed={t.duration === d} disabled={running} onClick={() => t.setDuration(d)}>{d} seconds</button>)}
      </div>
      <button type="button" data-testid="tap-pad" data-phase={t.phase} disabled={t.phase === "done"}
        onPointerDown={(e) => { e.preventDefault(); t.tap(); }} onKeyDown={(e) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); t.tap(); } }}
        className={`flex h-72 w-full touch-manipulation select-none flex-col items-center justify-center gap-2 rounded-xl border bg-surface px-4 text-center text-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 ${running ? "border-cyan-400" : "border-white/10"}`}>
        <span className="font-mono text-6xl tabular-nums" data-testid="tap-count"><span key={t.taps}>{t.taps}</span></span>
        <span className="font-display text-xl font-bold" aria-live="polite">
          <span key={t.phase}>{t.phase === "ready" ? "Tap here as fast as you can. The clock starts on your first tap." : running ? "Keep tapping!" : "Time is up"}</span>
        </span>
        <span className="font-mono text-sm text-zinc-400 tabular-nums">{running ? <span key={t.left}>{t.left.toFixed(1)} s left</span> : <span key={`d${t.duration}`}>{t.duration} s</span>}</span>
      </button>

      {t.phase === "done" && (
        <div className="space-y-3" aria-live="polite">
          <p className="text-base text-zinc-300">
            <strong className="font-mono text-3xl text-cyan-400 tabular-nums" data-testid="tap-rate"><span key={t.rate}>{t.rate}</span></strong> taps per second (<span key={t.taps}>{t.taps}</span> taps in {t.duration} seconds).
            {t.isBest && <span className="ml-2 text-success"><span aria-hidden="true">✓ </span>New best on this device for {t.duration} seconds.</span>}
          </p>
          <button type="button" className={btnPrimary} onClick={t.again}>Try again</button>
        </div>
      )}
      <ShareResult payload={t.payload} what="tap speed" path={PATH} />

      <section aria-labelledby="tap-saved" className="space-y-2 border-t border-white/10 pt-4">
        <h3 id="tap-saved" className="font-display text-lg text-zinc-100">Best on this device</h3>
        <ul className="flex flex-wrap gap-2 text-sm text-zinc-300">
          {DURATIONS.map((d) => { const n = t.store.taps[`${d}`]; return <li key={d} className="rounded-lg border border-white/10 bg-surface px-3 py-1">{d} s: <span className="font-mono text-zinc-100 tabular-nums"><span key={n ?? 0}>{n ? `${n} taps` : "none yet"}</span></span></li>; })}
        </ul>
        <p className="text-xs text-zinc-400">Kept in this browser only. Nothing is uploaded.</p>
        <button type="button" className={`${btnSecondary} text-sm`} onClick={t.forget}>Forget my results on this device</button>
      </section>
    </div>
  );
}
