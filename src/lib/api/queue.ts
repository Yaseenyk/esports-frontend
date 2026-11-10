/**
 * Collects small writes (gate check-ins, mostly) and sends them together, instead of one request per scan.
 *  - the same item queued twice is sent once
 *  - the queue survives a reload and an offline spell (kept in storage), and is retried with growing delays
 *  - it flushes on a timer, when it is large, and when the tab is hidden or closed
 */
export interface QueueStorage { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void }

export interface QueueOptions<T> {
  /** Sends a batch. Resolve when the server has it; reject to keep the items and try again later. */
  send: (items: T[]) => Promise<void>;
  keyOf: (item: T) => string;
  intervalMs?: number;
  maxBatch?: number;
  storage?: QueueStorage | null;
  storageKey?: string;
  isOnline?: () => boolean;
  setTimer?: (fn: () => void, ms: number) => unknown;
  clearTimer?: (t: unknown) => void;
}

export function createBatchQueue<T>(o: QueueOptions<T>) {
  const interval = o.intervalMs ?? 20000, maxBatch = o.maxBatch ?? 200;
  const set = o.setTimer ?? ((fn, ms) => setTimeout(fn, ms)), clear = o.clearTimer ?? ((t) => clearTimeout(t as ReturnType<typeof setTimeout>));
  const online = o.isOnline ?? (() => (typeof navigator === "undefined" ? true : navigator.onLine));
  const items = new Map<string, T>();
  let timer: unknown = null, failures = 0, sending = false;
  const stats = { batches: 0, sent: 0, failed: 0 };

  const save = () => { try { o.storage?.setItem(o.storageKey ?? "eh-queue", JSON.stringify([...items])); } catch { /* storage full or blocked: keep going in memory */ } };
  try { const raw = o.storage?.getItem(o.storageKey ?? "eh-queue"); if (raw) for (const [k, v] of JSON.parse(raw) as [string, T][]) items.set(k, v); } catch { /* ignore a damaged saved queue */ }

  const schedule = (ms: number) => { if (timer === null) timer = set(() => { timer = null; void flush(); }, ms); };
  const delay = () => Math.min(5 * 60000, interval * 2 ** failures);

  async function flush(): Promise<void> {
    if (sending || items.size === 0) return;
    if (!online()) { schedule(delay()); return; }
    sending = true;
    const batch = [...items].slice(0, maxBatch);
    try {
      await o.send(batch.map(([, v]) => v));
      for (const [k] of batch) items.delete(k);
      failures = 0; stats.batches++; stats.sent += batch.length; save();
    } catch { failures++; stats.failed++; } finally { sending = false; }
    if (items.size) schedule(failures ? delay() : 0);
  }

  return {
    add(item: T) { items.set(o.keyOf(item), item); save(); if (items.size >= maxBatch) { if (timer !== null) { clear(timer); timer = null; } void flush(); } else schedule(interval); },
    flush: async () => { if (timer !== null) { clear(timer); timer = null; } await flush(); },
    get size() { return items.size; },
    stats,
    /** Wire up "send what is left when the tab is hidden or closed". Returns the cleanup. */
    attach(doc: Pick<Document, "addEventListener" | "removeEventListener" | "visibilityState">, win: Pick<Window, "addEventListener" | "removeEventListener">) {
      const hide = () => { if (doc.visibilityState === "hidden") void this.flush(); };
      const back = () => { if (items.size) void this.flush(); };
      doc.addEventListener("visibilitychange", hide); win.addEventListener("pagehide", hide as EventListener); win.addEventListener("online", back);
      return () => { doc.removeEventListener("visibilitychange", hide); win.removeEventListener("pagehide", hide as EventListener); win.removeEventListener("online", back); };
    },
  };
}
