/**
 * Reaction time test and tap speed test. Pure rules and maths, unit tested in node; the timing itself happens in the browser.
 *
 * Honest limits the pages state: a phone adds its own delay (touch sampling, screen refresh, the browser), so a score is only comparable
 * with scores on the same device. The only outside benchmark quoted is Human Benchmark's published median, with the date we read it;
 * their test runs mostly on computers with a mouse, so it is context, not a target.
 */

export const TRIES = 5;
/** The wait before the screen changes is random in this range, so it cannot be anticipated. */
export const WAIT_MIN_MS = 1500, WAIT_MAX_MS = 4500;
/** Taps faster than this after the change are treated as a lucky guess and do not count (no person reacts to a light that fast). */
export const MIN_HUMAN_MS = 100;

export const BENCHMARK = {
  median: 273, average: 284, clicks: "81 million",
  url: "https://humanbenchmark.com/tests/reactiontime/statistics", checked: "25 Nov 2026",
} as const;

export const randomWait = (r: number): number => Math.round(WAIT_MIN_MS + r * (WAIT_MAX_MS - WAIT_MIN_MS));

export type TryResult = { ok: true; ms: number } | { ok: false; why: "early" | "guess" };

/** Judges one tap: before the change is too early; under MIN_HUMAN_MS after it is a guess; otherwise the reaction time, rounded. */
export function judgeTap(tapAt: number, changedAt: number | null): TryResult {
  if (changedAt === null || tapAt < changedAt) return { ok: false, why: "early" };
  const ms = Math.round(tapAt - changedAt);
  return ms < MIN_HUMAN_MS ? { ok: false, why: "guess" } : { ok: true, ms };
}

export const average = (xs: readonly number[]): number => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0);
export const best = (xs: readonly number[]): number => (xs.length ? Math.min(...xs) : 0);

// ------------------------------------------------------------------ tap speed

export const DURATIONS = [5, 10, 30] as const;
export type Duration = (typeof DURATIONS)[number];

/** Taps per second, to one decimal place (a whole number of taps over a whole number of seconds). */
export const tapsPerSecond = (taps: number, seconds: number): number => (seconds > 0 ? Math.round((taps / seconds) * 10) / 10 : 0);

// ------------------------------------------------------------------ results kept on this device

export interface ReflexStore {
  reaction: { best?: number; recent: number[] };
  taps: Partial<Record<`${Duration}`, number>>;
}
export const EMPTY_STORE: ReflexStore = { reaction: { recent: [] }, taps: {} };
export const RECENT_MAX = 10;

/** Reads a stored value safely: anything damaged or hand-edited becomes an empty store. */
export function parseStore(raw: string | null): ReflexStore {
  try {
    const v = JSON.parse(raw ?? "null") as Partial<ReflexStore> | null;
    if (!v || typeof v !== "object") return EMPTY_STORE;
    const num = (n: unknown) => (typeof n === "number" && Number.isFinite(n) && n > 0 && n < 100000 ? n : undefined);
    const recent = Array.isArray(v.reaction?.recent) ? v.reaction!.recent.map(num).filter((n): n is number => n !== undefined).slice(-RECENT_MAX) : [];
    const taps: ReflexStore["taps"] = {};
    for (const d of DURATIONS) { const n = num(v.taps?.[`${d}`]); if (n !== undefined) taps[`${d}`] = n; }
    return { reaction: { best: num(v.reaction?.best), recent }, taps };
  } catch { return EMPTY_STORE; }
}

/** Adds a finished five-try average. */
export function addReaction(s: ReflexStore, avg: number): ReflexStore {
  return { ...s, reaction: { best: s.reaction.best ? Math.min(s.reaction.best, avg) : avg, recent: [...s.reaction.recent, avg].slice(-RECENT_MAX) } };
}

/** Keeps the highest tap count per duration. Returns the store and whether this was a new best. */
export function addTaps(s: ReflexStore, d: Duration, taps: number): { store: ReflexStore; isBest: boolean } {
  const prev = s.taps[`${d}`] ?? 0;
  return taps > prev ? { store: { ...s, taps: { ...s.taps, [`${d}`]: taps } }, isBest: true } : { store: s, isBest: false };
}
