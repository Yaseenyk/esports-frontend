/**
 * How a waiting screen should look, given how long it has been waiting and how fast this request usually is.
 *  - hidden : too quick to be worth showing anything (a flash of skeleton is worse than none)
 *  - skeleton : show the shaped placeholder
 *  - slow : still waiting; say so
 *  - stuck : something is probably wrong; offer a retry
 */
export type Phase = "hidden" | "skeleton" | "slow" | "stuck";

export interface Timing { delay: number; slow: number; stuck: number }
export const FAST: Timing = { delay: 180, slow: 3500, stuck: 12000 };
export const KNOWN_SLOW: Timing = { delay: 0, slow: 4000, stuck: 14000 };

export function phaseFor(elapsedMs: number, t: Timing = FAST): Phase {
  if (elapsedMs < t.delay) return "hidden";
  if (elapsedMs < t.slow) return "skeleton";
  if (elapsedMs < t.stuck) return "slow";
  return "stuck";
}

/** A request that usually takes ~1 s or more will always be visible, so its skeleton appears at once; a quick one waits a beat so nothing flashes. */
export function timingFor(typicalMs: number | undefined): Timing {
  if (typicalMs === undefined) return FAST;
  if (typicalMs >= 600) return KNOWN_SLOW;
  if (typicalMs >= 300) return { ...FAST, delay: 80 };
  return FAST;
}

/** Once shown, a skeleton stays for at least this long so it never blinks. */
export const MIN_SHOWN_MS = 450;

/** Running average of how long each request takes, so the screen can adapt to a 1 s API versus a 2 s one. */
const avg = new Map<string, number>();
export function recordLatency(key: string, ms: number): void {
  const prev = avg.get(key);
  avg.set(key, prev === undefined ? ms : prev * 0.7 + ms * 0.3);
}
export const typicalLatency = (key: string): number | undefined => avg.get(key);
export const resetLatency = (): void => avg.clear();
