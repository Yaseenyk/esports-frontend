/**
 * Phase 5: the public tournament directory (API.md section 11, flag v3.directory). Pure.
 *
 * THE INDEX RULE (AdSense review, mid-December 2026): /tournaments/ is indexable and listed in the sitemap only when at least MIN_UPCOMING_FOR_INDEX
 * upcoming public tournaments exist. Below that the page is thin, so it ships noindex and stays out of the sitemap. The same number is checked by
 * scripts/verify-seo.mjs against the data the page carries (#eh-directory).
 */
export const MIN_UPCOMING_FOR_INDEX = 5;

export interface DirectoryItem {
  slug: string; title: string; game: string; format: string; status: string; summary: string | null; venue: string; city: string | null; state: string | null;
  startsAt: string | null; endsAt: string | null; maxTeams: number | null; registration: { open: boolean; registered: number; spotsLeft: number | null };
  /** The organiser's sign-up link, only when they chose to show it here and registration is open. */
  registerUrl: string | null;
  pagePath: string;
}
export interface DirectoryData { items: DirectoryItem[]; total: number; cities: { city: string; count: number }[]; games: { game: string; count: number }[] }
export interface DirectoryFilters { game: string; city: string }

/** Index rule: enough upcoming public tournaments. `total` is the unfiltered count from the API. */
export const directoryIndexable = (total: number): boolean => Number.isInteger(total) && total >= MIN_UPCOMING_FOR_INDEX;

/** Upcoming = public, not finished, has a start date and has not ended (end, or start + 1 day, still ahead). Mirrors the API rule. */
const UPCOMING_STATUSES = ["published", "registration_open", "registration_closed", "live"];
export function isUpcoming(t: { status: string; startsAt: string | null; endsAt: string | null }, now: number = Date.now()): boolean {
  if (!UPCOMING_STATUSES.includes(t.status) || !t.startsAt) return false;
  const start = Date.parse(t.startsAt);
  if (!Number.isFinite(start)) return false;
  const end = t.endsAt ? Date.parse(t.endsAt) : start + 86_400_000;
  return Number.isFinite(end) && end >= now;
}

/** Client-side filter over the build-time list (the island also re-asks the API with the same filters). */
export function filterItems(items: DirectoryItem[], f: DirectoryFilters): DirectoryItem[] {
  const city = f.city.trim().toLowerCase();
  return items.filter((i) => (!f.game || i.game === f.game) && (!city || (i.city ?? "").trim().toLowerCase() === city));
}

/** A register link is accepted only if it is our own registration page (never an outside URL). */
export const safeRegisterUrl = (v: unknown): string | null => (typeof v === "string" && /^\/register\/\?t=[A-Za-z0-9%._~-]{8,200}$/.test(v) ? v : null);
