/**
 * Token hygiene for pages whose address carries a secret (?t= or ?k=). GitHub Pages cannot send a Referrer-Policy header, so:
 *  1. a <meta name="referrer" content="no-referrer"> tag is added (pages also set it through Next metadata, so it is there at first paint);
 *  2. the token is read once, then removed from the address bar with history.replaceState, so it is not shared by copy, screenshot or history.
 * A reload would then find no token, so the values are kept in sessionStorage (this tab only, gone when it closes) and read back from there.
 */
export const TOKEN_PARAMS: readonly string[] = ["t", "k"];
const STORE = "eh-token-hygiene-v1";

/** Pure: splits a query string into the sensitive values and the rest. `rest` keeps every other parameter in order. */
export function splitTokens(search: string, names: readonly string[] = TOKEN_PARAMS): { tokens: Record<string, string>; rest: string; found: boolean } {
  const q = new URLSearchParams(search);
  const tokens: Record<string, string> = {};
  for (const n of names) { const v = q.get(n); if (v !== null) { tokens[n] = v; q.delete(n); } }
  const s = q.toString();
  return { tokens, rest: s ? `?${s}` : "", found: Object.keys(tokens).length > 0 };
}

/** Pure: rebuilds a query string with the given token values put back in front of `rest`. */
export function joinTokens(tokens: Record<string, string>, rest: string): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(tokens)) q.set(k, v);
  new URLSearchParams(rest).forEach((v, k) => q.append(k, v));
  const s = q.toString();
  return s ? `?${s}` : "";
}

/** Adds the no-referrer meta tag once. Safe to call repeatedly and on the server (does nothing there). */
export function ensureNoReferrer(doc: Document | undefined = typeof document === "undefined" ? undefined : document): void {
  if (!doc?.head) return;
  const existing = doc.head.querySelector('meta[name="referrer"]');
  if (existing) { existing.setAttribute("content", "no-referrer"); return; }
  const m = doc.createElement("meta");
  m.setAttribute("name", "referrer");
  m.setAttribute("content", "no-referrer");
  doc.head.appendChild(m);
}

interface Env { location: Pick<Location, "pathname" | "search" | "hash">; history: Pick<History, "replaceState" | "state">; storage?: Pick<Storage, "getItem" | "setItem"> | null }

function browserEnv(): Env | null {
  if (typeof window === "undefined") return null;
  let storage: Storage | null = null;
  try { storage = window.sessionStorage; } catch { storage = null; }
  return { location: window.location, history: window.history, storage };
}

const read = (s: Env["storage"], path: string): Record<string, string> => {
  try { const all = JSON.parse(s?.getItem(STORE) ?? "{}") as Record<string, Record<string, string>>; return all[path] && typeof all[path] === "object" ? all[path] : {}; } catch { return {}; }
};
const write = (s: Env["storage"], path: string, t: Record<string, string>) => {
  try { const all = JSON.parse(s?.getItem(STORE) ?? "{}") as Record<string, Record<string, string>>; all[path] = t; s?.setItem(STORE, JSON.stringify(all)); } catch { /* storage blocked: a reload will need the link again */ }
};

/**
 * Call once from a token page's effect in place of reading `location.search`. Returns the page's query string as it was when opened
 * (restored from this tab's storage after a reload), and strips the sensitive values from the address bar. Adds the meta tag too.
 */
export function takeTokenSearch(names: readonly string[] = TOKEN_PARAMS, env: Env | null = browserEnv(), doc?: Document): string {
  if (!env) return "";
  ensureNoReferrer(doc);
  const path = env.location.pathname;
  const { tokens, rest, found } = splitTokens(env.location.search, names);
  if (found) {
    write(env.storage, path, tokens);
    env.history.replaceState(env.history.state, "", `${path}${rest}${env.location.hash}`);
    return joinTokens(tokens, rest);
  }
  const kept = read(env.storage, path);
  return Object.keys(kept).length ? joinTokens(kept, rest) : env.location.search;
}
