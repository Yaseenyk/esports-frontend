import { PATH_MAX } from "@/features/feedback/config";

/**
 * The page a report is about. Only the PATH ever leaves the browser: the query string and the hash are cut off here, because secret links
 * (/join/?t=TOKEN, /pass/?t=, /register/?t=) carry their secret there. Pure: no window access.
 */
export function cleanPath(input: string | null | undefined): string {
  let p = String(input ?? "").trim();
  // A full address: keep only its path (the host is always this site).
  const abs = /^[a-z][a-z0-9+.-]*:\/\/[^/?#]*/i.exec(p);
  if (abs) p = p.slice(abs[0].length);
  p = p.split(/[?#]/)[0];
  p = p.replace(/[\u0000-\u001f\u007f\s]/g, "").replace(/\/{2,}/g, "/");
  if (!p.startsWith("/")) p = `/${p}`;
  return p.slice(0, PATH_MAX);
}

/** True when `typed` is a usable same-site path (or a full address on this site). Rejects what a visitor may type into the editable field. */
export function validatePathInput(typed: string, ownOrigin?: string): boolean {
  const t = typed.trim();
  if (!t || t.length > PATH_MAX + 200) return false;
  if (t.startsWith("//") || t.startsWith("\\")) return false; // protocol-relative: another site
  if (/^[a-z][a-z0-9+.-]*:/i.test(t)) { // an absolute address must be this very site
    if (!ownOrigin) return false;
    try { if (new URL(t).origin !== new URL(ownOrigin).origin) return false; } catch { return false; }
    return true;
  }
  if (!t.startsWith("/")) return false;
  return !/[\u0000-\u001f\u007f<>"'`\\]/.test(t);
}

/** What the editable field shows and sends: the typed text reduced to a path. Query and hash are removed, not rejected, so pasting a full address works. */
export const pathFromInput = (typed: string): string => cleanPath(typed);
