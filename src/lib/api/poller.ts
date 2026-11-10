/**
 * Polling that backs off when nothing changes and stops when nobody is looking.
 *  - starts fast, slows by half again after each unchanged answer, up to a ceiling; any change snaps it back
 *  - paused while the tab is hidden or the device is offline; on return it refreshes only if the data is old
 *  - never overlaps itself, and a failure slows it down further
 */
export interface PollerOptions<T> {
  fetch: () => Promise<T>;
  onData: (v: T, changed: boolean) => void;
  onError?: (e: unknown) => void;
  minMs?: number;
  maxMs?: number;
  /** How old the data may be before returning to the tab triggers an immediate refresh. */
  staleMs?: number;
  same?: (a: T, b: T) => boolean;
  now?: () => number;
  setTimer?: (fn: () => void, ms: number) => unknown;
  clearTimer?: (t: unknown) => void;
  isVisible?: () => boolean;
  isOnline?: () => boolean;
}

export function createPoller<T>(o: PollerOptions<T>) {
  const min = o.minMs ?? 10000, max = o.maxMs ?? 60000, stale = o.staleMs ?? min;
  const now = o.now ?? Date.now;
  const set = o.setTimer ?? ((fn, ms) => setTimeout(fn, ms)), clear = o.clearTimer ?? ((t) => clearTimeout(t as ReturnType<typeof setTimeout>));
  const visible = o.isVisible ?? (() => typeof document === "undefined" || document.visibilityState === "visible");
  const online = o.isOnline ?? (() => typeof navigator === "undefined" || navigator.onLine);
  const same = o.same ?? ((a: T, b: T) => JSON.stringify(a) === JSON.stringify(b));
  let wait = min, timer: unknown = null, running = false, stopped = true, last: T | undefined, lastAt = 0, calls = 0;

  const arm = () => { if (stopped || timer !== null) return; timer = set(() => { timer = null; void tick(); }, wait); };

  async function tick() {
    if (stopped || running) return;
    if (!visible() || !online()) return; // paused: resume() restarts it
    running = true;
    try {
      calls++;
      const v = await o.fetch();
      const changed = last === undefined || !same(last, v);
      last = v; lastAt = now();
      wait = changed ? min : Math.min(max, Math.round(wait * 1.5));
      o.onData(v, changed);
    } catch (e) { wait = Math.min(max, wait * 2); o.onError?.(e); } finally { running = false; arm(); }
  }

  return {
    start() { stopped = false; void tick(); },
    stop() { stopped = true; if (timer !== null) { clear(timer); timer = null; } },
    /** Call when the tab becomes visible or the device comes back online. */
    resume() { if (stopped) return; if (timer !== null) { clear(timer); timer = null; } if (now() - lastAt >= stale) void tick(); else arm(); },
    /** Something just happened that makes a change likely (a scan, a save): look again soon. */
    nudge() { wait = min; },
    get interval() { return wait; },
    get calls() { return calls; },
  };
}
