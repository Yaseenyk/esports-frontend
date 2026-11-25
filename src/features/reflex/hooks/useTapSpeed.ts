"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sendEvent } from "@/lib/track";
import type { Payload } from "@/lib/display";
import { EMPTY_STORE, addTaps, tapsPerSecond, type Duration, type ReflexStore } from "@/features/reflex/domain";
import { clearReflex, loadReflex, saveReflex } from "@/features/reflex/services/reflex-store";

export type TapPhase = "ready" | "running" | "done";

/** The tap test: the clock starts on the first tap; every pointer-down on the pad until the time is up is one tap (each finger counts). */
export function useTapSpeed() {
  const [duration, setDurationState] = useState<Duration>(10);
  const [phase, setPhase] = useState<TapPhase>("ready");
  const [taps, setTaps] = useState(0);
  const [left, setLeft] = useState<number>(10);
  const [isBest, setIsBest] = useState(false);
  const [store, setStore] = useState<ReflexStore>(EMPTY_STORE);
  const count = useRef(0), endAt = useRef(0), tick = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => { setStore(loadReflex()); return () => { if (tick.current) clearInterval(tick.current); }; }, []);

  const finish = useCallback(() => {
    if (tick.current) clearInterval(tick.current);
    setPhase("done"); setLeft(0);
    const n = count.current;
    setStore((s) => { const r = addTaps(s, duration, n); setIsBest(r.isBest && n > 0); if (r.isBest) saveReflex(r.store); return r.store; });
    sendEvent("tool_complete", "tap-speed-test");
  }, [duration]);

  const tap = useCallback(() => {
    if (phase === "done") return;
    if (phase === "ready") {
      count.current = 0; endAt.current = performance.now() + duration * 1000; setPhase("running"); setIsBest(false);
      tick.current = setInterval(() => {
        const ms = endAt.current - performance.now();
        if (ms <= 0) finish(); else setLeft(Math.ceil(ms / 100) / 10);
      }, 100);
    } else if (performance.now() >= endAt.current) return;
    count.current += 1; setTaps(count.current);
  }, [phase, duration, finish]);

  const again = useCallback(() => { if (tick.current) clearInterval(tick.current); count.current = 0; setTaps(0); setLeft(duration); setPhase("ready"); }, [duration]);
  const setDuration = useCallback((d: Duration) => { if (tick.current) clearInterval(tick.current); setDurationState(d); count.current = 0; setTaps(0); setLeft(d); setPhase("ready"); }, []);
  const forget = useCallback(() => { clearReflex(); setStore(EMPTY_STORE); }, []);

  const rate = tapsPerSecond(taps, duration);
  const payload = useMemo<Payload | null>(() => (phase !== "done" ? null : {
    v: "table",
    d: { title: "Tap speed test", subtitle: `${taps} taps in ${duration} seconds`, head: ["Test", "Result"], rows: [["Time", `${duration} s`], ["Taps", String(taps)], ["Taps per second", String(rate)]], strong: 1 },
  }), [phase, taps, duration, rate]);

  return { duration, setDuration, phase, taps, left, rate, isBest, store, tap, again, forget, payload };
}
