import { EMPTY_STORE, parseStore, type ReflexStore } from "@/features/reflex/domain";

/** The results live in this browser's localStorage only. Nothing is sent. Storage that is blocked (private mode) just means nothing is kept. */
const KEY = "eh_reflex_v1";

export function loadReflex(): ReflexStore {
  try { return parseStore(localStorage.getItem(KEY)); } catch { return EMPTY_STORE; }
}
export function saveReflex(s: ReflexStore): void {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage blocked: the result still shows */ }
}
export function clearReflex(): void {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
