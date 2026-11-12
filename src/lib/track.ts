import { API_BASE, hasBackend } from "./api";
import { gtmAllowed } from "./gtm";
import { doNotTrack } from "./hits";

/**
 * The one client tracking event: `tool_complete` (blueprint 8.4). Counts only: the server keeps one number per day and tool, no identifier, no cookie,
 * nothing stored in the browser except the visitor's own opt-out switch. Safe to call anywhere: it never throws and never blocks the page.
 *
 * Sends nothing when: there is no backend, the page is not a public marketing page (never in the app, sign-in, or on any address that can hold a private
 * link: same list as the tag loader, src/lib/gtm.ts), Do Not Track or Global Privacy Control is on, or the visitor switched it off (`TRACK_OFF_KEY`
 * is "1" in localStorage). The server applies the same rules again (Origin, DNT, GPC) and always answers 204.
 */
export type TrackEvent = "tool_complete";

/** The free tools (same list as the backend src/metrics.ts TOOL_IDS and the keys of TOOL_PAGES). */
export const TOOL_IDS = [
  "poster", "plan", "id-cards", "double-elimination", "registration", "round-robin", "schedule",
  "certificates", "display-screen", "check-in", "brackets", "points-table", "groups", "print-kits",
] as const;
export type ToolId = (typeof TOOL_IDS)[number];

/** localStorage key of the privacy-page switch (a plain boolean; "1" means the visitor opted out). */
export const TRACK_OFF_KEY = "eh_track_off";

const sent = new Set<string>();

/** True when the browser says Global Privacy Control. */
export function globalPrivacyControl(): boolean {
  try { return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true; } catch { return false; }
}

/** True when the visitor turned tracking off on the privacy page. Storage that cannot be read counts as "not opted out". */
export function optedOut(): boolean {
  try { return localStorage.getItem(TRACK_OFF_KEY) === "1"; } catch { return false; }
}

/** All the client-side gates in one place. */
export function trackingAllowed(pathname: string): boolean {
  return hasBackend && gtmAllowed(pathname) && !doNotTrack() && !globalPrivacyControl() && !optedOut();
}

/** The beacon body: tiny JSON as text/plain (a CORS-safelisted type, so the browser sends no preflight). Exported for the tests. */
export const beaconBody = (name: TrackEvent, d: string): string => JSON.stringify({ v: 1, e: name, d });

/** Once per page load per tool (kept in memory only). `tool_complete` means the visitor finished the tool's job (for example downloaded the result). */
export function sendEvent(name: TrackEvent, tool: string): void {
  try {
    if (typeof window === "undefined" || name !== "tool_complete") return;
    if (!(TOOL_IDS as readonly string[]).includes(tool)) return;
    if (!trackingAllowed(window.location.pathname)) return;
    if (sent.has(`${name}|${tool}`)) return;
    sent.add(`${name}|${tool}`);
    const url = `${API_BASE}/public/t`;
    const body = beaconBody(name, tool);
    if (typeof navigator.sendBeacon === "function" && navigator.sendBeacon(url, new Blob([body], { type: "text/plain;charset=UTF-8" }))) return;
    if (typeof fetch === "function") {
      fetch(url, { method: "POST", keepalive: true, credentials: "omit", cache: "no-store", headers: { "content-type": "text/plain;charset=UTF-8" }, body }).catch(() => undefined);
    }
  } catch { /* counting must never break a page */ }
}

/** Test hook: forget what was already sent in this page load. */
export function resetTrackForTests(): void { sent.clear(); }
