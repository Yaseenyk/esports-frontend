/**
 * Two guides a week: Monday and Wednesday. The first is Monday 16 November 2026; the list position decides the date.
 * Until 19 Nov 2026 it was three a week (Monday, Wednesday, Friday). It was slowed to two after the AdSense "low-value content"
 * review of 16 Nov 2026: fewer, deeper guides read better than volume on a young domain. The first two releases (16 and 18 Nov)
 * keep their dates under both rules. A flood of new pages has cost this owner an index before. See docs/guide-schedule.md.
 */
export const FIRST_RELEASE = "2026-11-16";
const OFFSETS = [0, 2];
export const PER_WEEK = OFFSETS.length;

export function releaseDate(index: number): string {
  const d = new Date(`${FIRST_RELEASE}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + Math.floor(index / PER_WEEK) * 7 + OFFSETS[index % PER_WEEK]);
  return d.toISOString().slice(0, 10);
}

/**
 * Queue pause (owner, 28 Nov 2026). Google November 2026 core update (10-24 Nov) dropped this site and the other new
 * subdomains from search; a timer adding templated guides is the likeliest negative signal, so no scheduled guide released
 * after this date goes live. Guides already live stay live. Set to null to resume the Monday/Wednesday schedule.
 */
export const PAUSED_AFTER: string | null = "2026-11-28";

/** The last release day the site may show: today, or the pause date when the queue is paused. */
export const releaseCutoff = (): string => (PAUSED_AFTER && PAUSED_AFTER < today() ? PAUSED_AFTER : today());

/** Today in UTC. `GUIDES_NOW=2027-01-01` previews a later day in a local build or a test. */
export const today = (): string => process.env.GUIDES_NOW ?? new Date().toISOString().slice(0, 10);

/** The guides in live-now.ts are published at once on this day (the owner asked for ten live immediately, 16 Nov 2026), outside the weekly schedule. */
export const LIVE_NOW_DATE = "2026-11-16";
