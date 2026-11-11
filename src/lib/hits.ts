import { API_BASE, hasBackend } from "./api";

/**
 * Counts one page load of a public live view, a stream overlay or an embed, for the sponsor report.
 * Privacy: counts only. Nothing is stored in the browser (no cookie, no id), and the server keeps one number per day, place and view.
 * Safe to call anywhere: it never throws, never blocks the page, and does nothing when the visitor has asked not to be tracked.
 */
export type HitSource = "live" | "overlay" | "embed";

const sent = new Set<string>();

/** True when the visitor's browser says "Do Not Track". We respect it, even though we only count. */
export function doNotTrack(): boolean {
  try {
    const n = navigator as Navigator & { msDoNotTrack?: string };
    return n.doNotTrack === "1" || n.msDoNotTrack === "1" || (window as unknown as { doNotTrack?: string }).doNotTrack === "1";
  } catch { return false; }
}

/** A view name the server accepts: lower case letters, digits, _ and -, at most 20. Anything else becomes "" rather than failing. */
export const cleanView = (v?: string): string => { const s = (v ?? "").toLowerCase(); return /^[a-z0-9_-]{1,20}$/.test(s) ? s : ""; };

/** Once per page load per source and view (kept in memory only, so a reload counts again, which is what a page load is). */
export function sendHit(slug: string, source: HitSource, view?: string): void {
  try {
    if (!hasBackend || typeof window === "undefined" || typeof fetch !== "function") return;
    if (!/^[a-z0-9-]{3,40}$/.test(slug) || doNotTrack()) return;
    const v = cleanView(view);
    const key = `${slug}|${source}|${v}`;
    if (sent.has(key)) return;
    sent.add(key);
    fetch(`${API_BASE}/public/hit/${slug}`, {
      method: "POST", keepalive: true, credentials: "omit", cache: "no-store",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(v ? { source, view: v } : { source }),
    }).catch(() => undefined);
  } catch { /* counting must never break a page */ }
}
