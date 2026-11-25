"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sendEvent } from "@/lib/track";
import type { Payload } from "@/lib/display";
import { TRIES, addReaction, average, best, judgeTap, randomWait, type ReflexStore } from "@/features/reflex/domain";
import { clearReflex, loadReflex, saveReflex } from "@/features/reflex/services/reflex-store";
import { EMPTY_STORE } from "@/features/reflex/domain";

export type Phase = "idle" | "wait" | "go" | "early" | "guess" | "between" | "done";

/**
 * The reaction test: tap to start, wait for the change, tap. Five good tries make a result. The change time is taken in the frame the
 * colour is painted (requestAnimationFrame), the tap time at pointer-down, both from performance.now().
 */
export function useReaction() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [times, setTimes] = useState<number[]>([]);
  const [store, setStore] = useState<ReflexStore>(EMPTY_STORE);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const changedAt = useRef<number | null>(null);
  useEffect(() => { setStore(loadReflex()); return () => { if (timer.current) clearTimeout(timer.current); }; }, []);

  useEffect(() => {
    if (phase !== "go") return;
    const id = requestAnimationFrame(() => { changedAt.current = performance.now(); });
    return () => cancelAnimationFrame(id);
  }, [phase]);

  const arm = useCallback(() => {
    changedAt.current = null;
    setPhase("wait");
    timer.current = setTimeout(() => setPhase("go"), randomWait(Math.random()));
  }, []);

  const tap = useCallback(() => {
    const now = performance.now();
    if (phase === "idle" || phase === "early" || phase === "guess" || phase === "between") { arm(); return; }
    if (phase === "done") { setTimes([]); arm(); return; }
    if (phase === "wait") { if (timer.current) clearTimeout(timer.current); setPhase("early"); return; }
    // phase === "go": a tap before the paint was recorded counts from the tap itself (a guess, below 100 ms).
    const r = judgeTap(now, changedAt.current ?? now);
    if (!r.ok) { setPhase(r.why === "early" ? "early" : "guess"); return; }
    const next = [...times, r.ms];
    setTimes(next);
    if (next.length >= TRIES) {
      setPhase("done");
      setStore((s) => { const n = addReaction(s, average(next)); saveReflex(n); return n; });
      sendEvent("tool_complete", "reaction-time-test");
    } else setPhase("between");
  }, [phase, times, arm]);

  const reset = useCallback(() => { if (timer.current) clearTimeout(timer.current); setTimes([]); setPhase("idle"); }, []);
  const forget = useCallback(() => { clearReflex(); setStore(EMPTY_STORE); }, []);

  const avg = average(times);
  const payload = useMemo<Payload | null>(() => (phase !== "done" ? null : {
    v: "table",
    d: { title: "Reaction time test", subtitle: `Average ${avg} ms over ${TRIES} tries, best ${best(times)} ms`, head: ["Try", "Reaction time"], rows: times.map((t, i) => [String(i + 1), `${t} ms`]), strong: 1 },
  }), [phase, times, avg]);

  return { phase, times, last: times[times.length - 1], avg, best: best(times), store, tap, reset, forget, payload };
}
