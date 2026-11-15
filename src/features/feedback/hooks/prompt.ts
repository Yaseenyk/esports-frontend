import { DISMISS_KEY, PROMPTED_KEY, PROMPT_DELAY_MS, PROMPT_SNOOZE_MS } from "@/features/feedback/config";
import { NUDGE_LINES } from "@/features/feedback/copy";

/** The small slice of Storage the rules need, so tests can pass a fake and a clock. */
export interface KV { getItem(k: string): string | null; setItem(k: string, v: string): void }

/** Reads and writes never throw (private mode, blocked storage): a failed read means "nothing stored". */
const read = (kv: KV | undefined, k: string): string | null => { try { return kv ? kv.getItem(k) : null; } catch { return null; } };
const write = (kv: KV | undefined, k: string, v: string) => { try { kv?.setItem(k, v); } catch { /* ignore */ } };

export interface PromptEnv { now: () => number; local?: KV; session?: KV }

/** True when the nudge may appear now: not shown yet in this session, and not dismissed in the last 7 days. */
export function mayNudge(env: PromptEnv): boolean {
  if (read(env.session, PROMPTED_KEY)) return false;
  const at = Number(read(env.local, DISMISS_KEY));
  if (Number.isFinite(at) && at > 0 && env.now() - at < PROMPT_SNOOZE_MS) return false;
  return true;
}

/** Records that the nudge was shown (once per session). */
export const markShown = (env: PromptEnv): void => write(env.session, PROMPTED_KEY, "1");

/** Records a dismissal: only a timestamp, in localStorage. */
export const markDismissed = (env: PromptEnv): void => write(env.local, DISMISS_KEY, String(env.now()));

/** Which line to show. `rand` is injected so tests are deterministic. */
export const pickLine = (rand: () => number = Math.random): string => NUDGE_LINES[Math.min(NUDGE_LINES.length - 1, Math.floor(rand() * NUDGE_LINES.length))];

export interface Timer { set(fn: () => void, ms: number): unknown; clear(h: unknown): void }
const realTimer: Timer = { set: (fn, ms) => setTimeout(fn, ms), clear: (h) => clearTimeout(h as ReturnType<typeof setTimeout>) };

/**
 * Arms the nudge: after PROMPT_DELAY_MS, if the rules still allow it and `interacted()` is false, it asks `show(line)`. Returns a cancel function.
 * "Interacted" is the visitor having opened the panel; the nudge never opens it by itself.
 */
export function armNudge(env: PromptEnv, interacted: () => boolean, show: (line: string) => void, opt: { delay?: number; rand?: () => number; timer?: Timer } = {}): () => void {
  if (!mayNudge(env)) return () => undefined;
  const t = opt.timer ?? realTimer;
  const h = t.set(() => {
    if (interacted() || !mayNudge(env)) return;
    markShown(env);
    show(pickLine(opt.rand));
  }, opt.delay ?? PROMPT_DELAY_MS);
  return () => t.clear(h);
}
