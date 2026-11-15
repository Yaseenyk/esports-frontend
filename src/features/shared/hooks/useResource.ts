"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { V3Failure, V3Result } from "@/features/shared/failure";

export type Resource<T> =
  | { phase: "loading"; showSkeleton: boolean }
  | { phase: "ready"; data: T }
  | { phase: "unavailable" }
  | { phase: "signin" }
  | { phase: "error"; failure: V3Failure };

/** Loads one thing through a service call. A 404 becomes `unavailable` (feature off), a 401 `signin`. The skeleton only shows after 180 ms. */
export function useResource<T>(load: () => Promise<V3Result<T>>, deps: readonly unknown[]): Resource<T> & { reload: () => void } {
  const [state, setState] = useState<Resource<T>>({ phase: "loading", showSkeleton: false });
  const [tick, setTick] = useState(0);
  const loadRef = useRef(load);
  const quiet = useRef(false); // a reload keeps what is on screen instead of flashing a skeleton
  loadRef.current = load;
  useEffect(() => {
    let live = true;
    const keep = quiet.current; quiet.current = false;
    if (!keep) setState({ phase: "loading", showSkeleton: false });
    const timer = setTimeout(() => live && setState((s) => (s.phase === "loading" ? { phase: "loading", showSkeleton: true } : s)), 180);
    loadRef.current().then((r) => {
      if (!live) return;
      if (r.ok) setState({ phase: "ready", data: r.data });
      else if (r.failure.kind === "unavailable") setState({ phase: "unavailable" });
      else if (r.failure.kind === "unauthorized") setState({ phase: "signin" });
      else setState({ phase: "error", failure: r.failure });
    });
    return () => { live = false; clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  const reload = useCallback(() => { quiet.current = true; setTick((t) => t + 1); }, []);
  return { ...state, reload };
}
