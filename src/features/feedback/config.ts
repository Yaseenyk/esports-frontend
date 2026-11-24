/** The feedback bot's fixed settings. One place for the hidden-route list, the storage keys and the timings, so a test can pin them. */

/** The contract version the report carries; the privacy text it links to is the one this matches. */
export const CONSENT_VERSION = "feedback-v1";

/**
 * Routes where the widget renders NOTHING and does not even probe the API: the gate scanner, display screens and every OBS / embed /
 * overlay page (they are on a stream or a venue screen), and pass pages (a private link for one person). Prefix match on whole segments.
 * Print and fullscreen are handled separately (CSS `no-print`, and `isFullscreenNow`).
 */
export const HIDDEN_ROUTE_PREFIXES = ["/gate", "/display", "/pass", "/overlay", "/embed", "/pt-br"] as const; // /pt-br: the widget is English only

/** True when the widget must not exist on this path. `/gate`, `/gate/` and `/gate/x` match; `/gatehouse` does not. */
export function isHiddenPath(pathname: string | null | undefined): boolean {
  const p = (pathname || "/").split(/[?#]/)[0].toLowerCase().replace(/\/+$/, "") || "/";
  return HIDDEN_ROUTE_PREFIXES.some((h) => p === h || p.startsWith(`${h}/`));
}

/** True while any element (a video, the display screen) is fullscreen. */
export const isFullscreenNow = (doc: Pick<Document, "fullscreenElement"> = document): boolean => !!doc.fullscreenElement;

/**
 * Where the widget may talk to the API at all: the real site only. On localhost, previews and in automated tests it does nothing (no probe, no
 * chunk), so a test run never sends a request to production (which would also log a CORS error on a non-production origin). To try it elsewhere,
 * set sessionStorage `eh-feedback-probe` to `1` in that tab (the feedback e2e does this and mocks the API).
 */
export const PROBE_HOSTS = ["esports.streamerosai.com"];
export const PROBE_FORCE_KEY = "eh-feedback-probe";
export function probeAllowed(hostname: string, session?: { getItem(k: string): string | null }): boolean {
  if (PROBE_HOSTS.includes(hostname)) return true;
  try { return session?.getItem(PROBE_FORCE_KEY) === "1"; } catch { return false; }
}

// ---- popup (the nudge line next to the bubble) ----
export const PROMPT_DELAY_MS = 20_000;
export const PROMPT_SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;
/** The only thing kept in localStorage: a timestamp (ms) of when the visitor dismissed the nudge. Named in the privacy page. */
export const DISMISS_KEY = "eh-feedback-nudge-dismissed-at";
/** sessionStorage: set once the nudge has been shown in this tab, so it shows at most once per session. */
export const PROMPTED_KEY = "eh-feedback-nudge-shown";
/** sessionStorage: the cached answer of GET /feedback/status for this session. */
export const STATUS_KEY = "eh-feedback-status";

// ---- limits (the contract) ----
export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 2000;
export const CONTACT_MAX = 120;
export const PATH_MAX = 200;
export const ERRORS_MAX = 5;
export const ERROR_LEN = 200;
/** How long the withdraw button stays (seconds); the server's `attachExpiresIn` wins when it sends one. */
export const WITHDRAW_SECONDS = 1200;
