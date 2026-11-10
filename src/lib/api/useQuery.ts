"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "./index";
import { createPoller } from "./poller";
import type { GetOptions } from "./client";

export interface Query<T> { data: T | undefined; loading: boolean; error: Error | null; refetch: () => void }

/**
 * Reads one endpoint. Shows cached data instantly, refreshes it quietly, and pauses everything when the tab is hidden.
 * Pass `pollMs` for live data: it slows itself down while nothing changes. `loading` is true only when there is nothing to show yet.
 */
export function useQuery<T>(path: string | null, opts: GetOptions & { pollMs?: number; maxPollMs?: number } = {}): Query<T> {
  const [data, setData] = useState<T | undefined>(() => (path ? api.peek<T>(path) : undefined));
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(!!path && data === undefined);
  const optRef = useRef(opts); optRef.current = opts;
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!path) { setLoading(false); return; }
    let live = true;
    const ctl = new AbortController();
    const cached = api.peek<T>(path);
    setData(cached); setLoading(cached === undefined); setError(null);
    const { pollMs, maxPollMs, ...get } = optRef.current;
    const read = () => api.get<T>(path, { ...get, signal: ctl.signal, force: tick > 0 && get.force !== false ? true : get.force });
    if (!pollMs) {
      read().then((v) => { if (live) { setData(v); setLoading(false); } }).catch((e) => { if (live) { setError(e); setLoading(false); } });
      return () => { live = false; ctl.abort(); };
    }
    const poller = createPoller<T>({
      fetch: () => api.get<T>(path, { ...get, ttl: Math.max(1000, pollMs - 1000), signal: ctl.signal }),
      onData: (v) => { if (live) { setData(v); setLoading(false); setError(null); } },
      onError: (e) => { if (live) { setError(e as Error); setLoading(false); } },
      minMs: pollMs, maxMs: maxPollMs ?? pollMs * 6,
    });
    const wake = () => poller.resume();
    document.addEventListener("visibilitychange", wake); window.addEventListener("online", wake);
    poller.start();
    return () => { live = false; ctl.abort(); poller.stop(); document.removeEventListener("visibilitychange", wake); window.removeEventListener("online", wake); };
  }, [path, tick]);

  return { data, loading, error, refetch: useCallback(() => setTick((n) => n + 1), []) };
}
