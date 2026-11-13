/**
 * Three guides a week: Monday, Wednesday and Friday. The first is Monday 16 November 2026; the list position decides the date.
 * (Weeks of three were chosen over a daily post on purpose: a flood of new pages on a young domain has cost this owner an
 * index before. See docs/guide-schedule.md.)
 */
export const FIRST_RELEASE = "2026-11-16";
const OFFSETS = [0, 2, 4];

export function releaseDate(index: number): string {
  const d = new Date(`${FIRST_RELEASE}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + Math.floor(index / 3) * 7 + OFFSETS[index % 3]);
  return d.toISOString().slice(0, 10);
}

/** Today in UTC. `GUIDES_NOW=2027-01-01` previews a later day in a local build or a test. */
export const today = (): string => process.env.GUIDES_NOW ?? new Date().toISOString().slice(0, 10);
