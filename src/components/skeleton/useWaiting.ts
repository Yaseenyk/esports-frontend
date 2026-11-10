"use client";

import { useEffect, useRef, useState } from "react";
import { MIN_SHOWN_MS, phaseFor, timingFor, typicalLatency, type Phase } from "@/lib/loading";

/**
 * Turns "is loading" into what to show. Quick loads show nothing, ~1 s loads show a skeleton immediately,
 * 2 s+ loads add a hint, and a stuck one offers a retry. A skeleton, once visible, stays long enough not to blink.
 */
export function useWaiting(loading: boolean, key?: string): Phase {
  const [phase, setPhase] = useState<Phase>("hidden");
  const shownAt = useRef(0);
  useEffect(() => {
    if (!loading) {
      const left = shownAt.current ? Math.max(0, MIN_SHOWN_MS - (Date.now() - shownAt.current)) : 0;
      const id = window.setTimeout(() => { shownAt.current = 0; setPhase("hidden"); }, left);
      return () => window.clearTimeout(id);
    }
    const t = timingFor(key ? typicalLatency(key) : undefined);
    const start = Date.now();
    const tick = () => {
      const p = phaseFor(Date.now() - start, t);
      if (p !== "hidden" && !shownAt.current) shownAt.current = Date.now();
      setPhase(p);
    };
    tick();
    const ids = [t.delay, t.slow, t.stuck].filter((ms) => ms > 0).map((ms) => window.setTimeout(tick, ms + 5));
    return () => ids.forEach(window.clearTimeout);
  }, [loading, key]);
  return phase;
}
