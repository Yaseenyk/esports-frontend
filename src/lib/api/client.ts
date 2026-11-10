/**
 * A small API client built to make as few requests as possible.
 *  - identical requests in flight share one network call
 *  - answers are cached; a stale answer is shown at once while a fresh one loads in the background (stale-while-revalidate)
 *  - ETags make an unchanged answer a tiny "304 Not Modified"
 *  - only safe requests (GET) are retried, with backoff; client errors (4xx) never are
 *  - a request that outlives its timeout is cancelled, and each request's speed is recorded so the screen can adapt
 */
import { recordLatency } from "../loading";

export interface ClientOptions {
  base: string;
  fetchImpl?: typeof fetch;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
  /** Called with a bearer token for every request, when signed in. */
  token?: () => string | null;
  isOnline?: () => boolean;
  /** Receives how long each endpoint took. Defaults to the shared tracker the loading screens read. */
  onLatency?: (key: string, ms: number) => void;
  /** Called when the server says the sign-in is no longer valid (401) on a request that carried a token. */
  onUnauthorized?: () => void;
}

export interface GetOptions {
  /** How long an answer counts as fresh (ms). Default 15 s. */
  ttl?: number;
  /** How long past `ttl` a stale answer may still be shown while it refreshes (ms). Default 5 min. */
  swr?: number;
  timeout?: number;
  retries?: number;
  signal?: AbortSignal;
  /** Skip the cache and ask again. */
  force?: boolean;
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public retryAfterMs?: number) { super(message); }
}

interface Entry { data: unknown; at: number; etag?: string }

export function createClient(o: ClientOptions) {
  const f = o.fetchImpl ?? ((...a: Parameters<typeof fetch>) => fetch(...a));
  const now = o.now ?? Date.now;
  const sleep = o.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const online = o.isOnline ?? (() => (typeof navigator === "undefined" ? true : navigator.onLine));
  const cache = new Map<string, Entry>();
  const flying = new Map<string, Promise<unknown>>();
  const stats = { network: 0, cacheHits: 0, deduped: 0, notModified: 0, retried: 0 };

  const url = (p: string) => o.base.replace(/\/$/, "") + p;
  const headers = (extra?: Record<string, string>) => {
    const h: Record<string, string> = { accept: "application/json", ...extra };
    const t = o.token?.(); if (t) h.authorization = `Bearer ${t}`;
    return h;
  };

  async function once(path: string, opt: GetOptions, etag?: string): Promise<{ data?: unknown; etag?: string; notModified?: boolean }> {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), opt.timeout ?? 10000);
    opt.signal?.addEventListener("abort", () => ctl.abort(), { once: true });
    const t0 = now();
    try {
      stats.network++;
      const res = await f(url(path), { headers: headers(etag ? { "if-none-match": etag } : undefined), signal: ctl.signal });
      (o.onLatency ?? recordLatency)(path.split("?")[0], now() - t0);
      if (res.status === 304) { stats.notModified++; return { notModified: true }; }
      if (res.status === 401 && o.token?.() && !path.startsWith("/auth/")) o.onUnauthorized?.();
      if (!res.ok) {
        const ra = Number(res.headers.get("retry-after"));
        throw new ApiError(res.status, `Request failed (${res.status})`, ra > 0 ? ra * 1000 : undefined);
      }
      return { data: await res.json(), etag: res.headers.get("etag") ?? undefined };
    } finally { clearTimeout(timer); }
  }

  async function fetchWithRetry(path: string, opt: GetOptions, etag?: string) {
    const max = opt.retries ?? 2;
    for (let n = 0; ; n++) {
      try { return await once(path, opt, etag); } catch (e) {
        const err = e as ApiError;
        const retryable = !opt.signal?.aborted && (err instanceof ApiError ? err.status >= 500 || err.status === 429 : true);
        if (!retryable || n >= max) throw err;
        stats.retried++;
        await sleep(err.retryAfterMs ?? Math.min(4000, 300 * 2 ** n) * (0.75 + 0.5 * Math.random()));
      }
    }
  }

  async function get<T>(path: string, opt: GetOptions = {}): Promise<T> {
    const ttl = opt.ttl ?? 15000, swr = opt.swr ?? 300000;
    const hit = cache.get(path);
    const age = hit ? now() - hit.at : Infinity;
    if (!opt.force && hit && age < ttl) { stats.cacheHits++; return hit.data as T; }
    // Offline: an old answer beats an error.
    if (!online() && hit) { stats.cacheHits++; return hit.data as T; }
    const refresh = (): Promise<T> => {
      const running = flying.get(path);
      if (running) { stats.deduped++; return running as Promise<T>; }
      const p = fetchWithRetry(path, opt, hit?.etag).then((r) => {
        if (r.notModified && hit) { hit.at = now(); return hit.data as T; }
        cache.set(path, { data: r.data, at: now(), etag: r.etag });
        return r.data as T;
      }).finally(() => flying.delete(path));
      flying.set(path, p);
      return p;
    };
    if (!opt.force && hit && age < ttl + swr) { refresh().catch(() => undefined); stats.cacheHits++; return hit.data as T; } // show now, refresh quietly
    return refresh();
  }

  /** Writes are never retried automatically: repeating a request that may have worked could do it twice. */
  async function send<T>(method: "POST" | "PUT" | "DELETE", path: string, body?: unknown, extra?: { signal?: AbortSignal; timeout?: number; keepalive?: boolean }): Promise<T> {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), extra?.timeout ?? 15000);
    extra?.signal?.addEventListener("abort", () => ctl.abort(), { once: true });
    try {
      stats.network++;
      const res = await f(url(path), { method, headers: headers(body === undefined ? undefined : { "content-type": "application/json" }), body: body === undefined ? undefined : JSON.stringify(body), signal: ctl.signal, keepalive: extra?.keepalive });
      if (res.status === 401 && o.token?.() && !path.startsWith("/auth/")) o.onUnauthorized?.();
      if (!res.ok) throw new ApiError(res.status, `Request failed (${res.status})`);
      invalidateRelated(path);
      return (res.status === 204 ? undefined : await res.json()) as T;
    } finally { clearTimeout(timer); }
  }

  /** After a write, forget cached reads of the same collection so nobody sees stale data. */
  function invalidateRelated(path: string) {
    const root = path.split("?")[0].split("/").slice(0, 3).join("/");
    for (const k of [...cache.keys()]) if (k.startsWith(root)) cache.delete(k);
  }

  return {
    get,
    post: <T>(path: string, body?: unknown, extra?: Parameters<typeof send>[3]) => send<T>("POST", path, body, extra),
    put: <T>(path: string, body?: unknown, extra?: Parameters<typeof send>[3]) => send<T>("PUT", path, body, extra),
    del: <T>(path: string, extra?: Parameters<typeof send>[3]) => send<T>("DELETE", path, undefined, extra),
    peek: <T>(path: string): T | undefined => cache.get(path)?.data as T | undefined,
    invalidate: (prefix: string) => { for (const k of [...cache.keys()]) if (k.startsWith(prefix)) cache.delete(k); },
    clear: () => cache.clear(),
    stats,
  };
}

export type ApiClient = ReturnType<typeof createClient>;
