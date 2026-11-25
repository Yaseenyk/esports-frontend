/**
 * READ-ONLY view of the ordinary site sign-in for the staff console's "Continue as ..." button.
 * The console never writes, renews or clears the site session (that stays with src/lib/api/cloud.ts); it only borrows the account token
 * for one request (POST /admin/v1/session), which still needs a staff row AND a fresh authenticator code on the server.
 * Same storage key and shape check as cloud.ts, kept apart so the console does not import the app's cached client.
 */
const TOKEN_KEY = "eh-session-v1";

export interface SiteSession { token: string; email: string }

export function readSiteSession(): SiteSession | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as { token?: unknown; user?: { email?: unknown } } | null;
    if (!s || typeof s.token !== "string" || !s.token || typeof s.user?.email !== "string") return null;
    return { token: s.token, email: s.user.email };
  } catch {
    return null;
  }
}
