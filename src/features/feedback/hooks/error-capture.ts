import { ERRORS_MAX, ERROR_LEN } from "@/features/feedback/config";

/**
 * Keeps the last few page errors in MEMORY ONLY (never stored, never sent unless the visitor leaves the tick on). Everything is cleaned
 * first: URL query strings and hashes, anything that looks like a token, JWT or email, then cut to 200 characters.
 */
export function sanitizeError(raw: unknown): string {
  let s = typeof raw === "string" ? raw : raw instanceof Error ? `${raw.name}: ${raw.message}` : (() => { try { return String(raw); } catch { return ""; } })();
  s = s.replace(/[\u0000-\u001f\u007f]+/g, " ");
  s = s.replace(/[^\s@<>"'()]+@[^\s@<>"'()]+\.[^\s@<>"'()]+/g, "[email]");
  s = s.replace(/\beyJ[\w-]*\.[\w-]*\.[\w-]*/g, "[token]");
  s = s.replace(/\b(Bearer|Basic)\s+[^\s"']+/gi, "$1 [token]");
  s = s.replace(/\b(?:[a-z][a-z0-9+.-]*:)?\/\/[^\s"'<>)]*/gi, (u) => u.split(/[?#]/)[0]); // full URLs: keep scheme, host and path
  s = s.replace(/\?[^\s"'<>)]+/g, ""); // a bare path with a query: /join/?t=SECRET
  s = s.replace(/(\/[^\s#"'<>)]*)#[^\s"'<>)]+/g, "$1"); // a bare path with a hash: /pass/#SECRET
  s = s.replace(/[?&#](?:t|token|key|secret|auth|code|password|pass)=[^\s&"'<>)]*/gi, "");
  s = s.replace(/\b[A-Za-z0-9_+=-]{24,}\b/g, "[token]"); // long opaque runs: keys, ids, base64
  s = s.replace(/\s+/g, " ").trim();
  return s.length > ERROR_LEN ? `${s.slice(0, ERROR_LEN - 1)}…` : s;
}

/** A small ring of the newest messages. Skips an empty message and an exact repeat of the last one. */
export function createErrorBuffer(max = ERRORS_MAX) {
  let items: string[] = [];
  return {
    push(raw: unknown) {
      const m = sanitizeError(raw);
      if (!m || items[items.length - 1] === m) return;
      items = [...items, m].slice(-max);
    },
    list: (): string[] => [...items],
    clear() { items = []; },
  };
}

const buffer = createErrorBuffer();

/** Starts listening for `error` and `unhandledrejection`. Returns the stop function. Safe to call twice (the second call is a no-op until stopped). */
let stopCurrent: (() => void) | null = null;
export function startErrorCapture(target: Window = window): () => void {
  if (stopCurrent) return stopCurrent;
  const onError = (e: ErrorEvent) => buffer.push(e.message || e.error);
  const onRejection = (e: PromiseRejectionEvent) => buffer.push(e.reason);
  target.addEventListener("error", onError);
  target.addEventListener("unhandledrejection", onRejection);
  stopCurrent = () => { target.removeEventListener("error", onError); target.removeEventListener("unhandledrejection", onRejection); buffer.clear(); stopCurrent = null; };
  return stopCurrent;
}

export const recentErrors = (): string[] => buffer.list();
