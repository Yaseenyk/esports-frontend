/**
 * The calendar's index rule, dependency-free (scripts/verify-seo.mjs transpiles and re-runs this file on what the build shipped).
 * The page /calendar/ may be indexed and listed in the sitemap only with at least MIN_UPCOMING_FOR_INDEX upcoming entries, every one of them from a
 * VERIFIED organisation (the API lists nothing else, and each entry carries `verified: true` so the check can be re-run on the built page).
 * Mirrors CALENDAR.MIN_UPCOMING_FOR_INDEX in esports-backend src/v3/lib/community.ts.
 */
export const MIN_UPCOMING_FOR_INDEX = 5;

export interface IndexInputEntry { startsOn: string; endsOn: string; status: string; verified: boolean }

/** Upcoming = listed (not cancelled), from a verified organisation, ending today or later (calendar days, compared as YYYY-MM-DD text). */
export function countUpcoming(entries: readonly IndexInputEntry[], today: string): number {
  return entries.filter((e) => e.verified === true && e.status === "listed" && typeof e.endsOn === "string" && e.endsOn >= today).length;
}

export function calendarIndexable(entries: readonly IndexInputEntry[], today: string): boolean {
  return countUpcoming(entries, today) >= MIN_UPCOMING_FOR_INDEX;
}

/** Today in India (the audience), as YYYY-MM-DD. */
export const todayIst = (nowMs: number = Date.now()): string => new Date(nowMs + 330 * 60_000).toISOString().slice(0, 10);
