/**
 * THIN-PAGE GUARD, frontend copy (README ADR-5, CLAUDE.md "Programmatic SEO rules").
 *
 * KEEP IN STEP with the backend's `esports-backend/src/v3/lib/seo-guard.ts`. The block between the SYNCED markers below is a verbatim copy of it
 * (same constants, same `seoVerdict`). `tests/thin-page-guard.test.mjs` runs it against the shared fixtures in
 * `tests/fixtures/seo-guard-cases.json` and, when the backend repo is checked out next to this one, compares the two blocks as text.
 * Change the backend rule first, then paste it here, then add a fixture.
 *
 * Pure and dependency-free: `scripts/verify-seo.mjs` transpiles this file and runs it against the built pages.
 */

// ---- SYNCED with esports-backend/src/v3/lib/seo-guard.ts: begin ----
export interface SeoGuardInput {
  title: string | null | undefined;
  /** True when no OTHER published tournament has the same title (case-insensitive). The caller computes it; unknown counts as not unique. */
  titleIsUnique: boolean;
  summary: string | null | undefined;
  description: string | null | undefined;
  /** Epoch seconds. */
  startsAt: number | null | undefined;
  venue: "online" | "offline" | "hybrid" | null | undefined;
  city: string | null | undefined;
  status: string;
  /** Verified results exist for the event (head-to-head finished match or battle royale rows). */
  hasVerifiedResults: boolean;
  /** Epoch seconds of the organiser's publish click. */
  publishedAt: number | null | undefined;
}

export const SEO_SUMMARY_MIN = 80;
export const SEO_DESCRIPTION_MIN = 200;
export const SEO_TITLE_MIN = 8;

export interface SeoVerdict {
  ready: boolean;
  /** Machine-readable names of the lines that failed (empty when ready). */
  failures: string[];
}

const len = (s: string | null | undefined): number => (typeof s === "string" ? s.trim().length : 0);

export function seoVerdict(i: SeoGuardInput): SeoVerdict {
  const f: string[] = [];
  if (len(i.title) < SEO_TITLE_MIN || !i.titleIsUnique) f.push("title_unique");
  if (len(i.summary) < SEO_SUMMARY_MIN) f.push("summary_80");
  if (len(i.description) < SEO_DESCRIPTION_MIN) f.push("description_200");
  if (!i.startsAt) f.push("start_date");
  // "a venue or an online flag": online counts by itself; offline or hybrid needs a city.
  if (!(i.venue === "online" || (i.venue && len(i.city) > 0))) f.push("venue");
  if (!(i.status === "registration_open" || i.hasVerifiedResults)) f.push("registration_or_results");
  if (!i.publishedAt || i.status === "draft" || i.status === "cancelled") f.push("published");
  return { ready: f.length === 0, failures: f };
}

export const seoReady = (i: SeoGuardInput): boolean => seoVerdict(i).ready;
// ---- SYNCED with esports-backend/src/v3/lib/seo-guard.ts: end ----

// ---- Frontend-only additions (not in the backend file) ----

/** The most newly indexable programmatic pages allowed in any rolling week (CLAUDE.md "Cadence cap"). */
export const WEEKLY_CAP = 10;
export const WEEK_SECONDS = 7 * 24 * 3600;

/** What the public API gives for one tournament, reduced to what the guard and the cap need. Times are ISO strings or null. */
export interface GuardSource {
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  startsAt: string | null;
  venue: "online" | "offline" | "hybrid" | null;
  city: string | null;
  status: string;
  hasResults: boolean;
  publishedAt: string | null;
  /** The API's own verdict (`seoReady`). The page is indexable only when the API and this guard BOTH say yes. */
  apiSeoReady: boolean;
}

export const toEpoch = (iso: string | null | undefined): number | null => {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? Math.floor(t / 1000) : null;
};

/** The guard input for one tournament. `titleCounts` maps a lower-cased title to how many public tournaments carry it. */
export function guardInput(s: GuardSource, titleCounts: ReadonlyMap<string, number>): SeoGuardInput {
  const key = (s.title ?? "").trim().toLowerCase();
  return {
    title: s.title, titleIsUnique: (titleCounts.get(key) ?? 0) <= 1, summary: s.summary, description: s.description,
    startsAt: toEpoch(s.startsAt), venue: s.venue, city: s.city, status: s.status, hasVerifiedResults: s.hasResults, publishedAt: toEpoch(s.publishedAt),
  };
}

export function titleCountsOf(items: readonly { title: string }[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const i of items) { const k = (i.title ?? "").trim().toLowerCase(); m.set(k, (m.get(k) ?? 0) + 1); }
  return m;
}

export interface PageVerdict {
  slug: string;
  /** True only when the guard passes, the API agrees and the weekly cap has room. */
  indexable: boolean;
  failures: string[];
}

/**
 * Verdict for every page of one build. A page is indexable when the guard passes AND the API's `seoReady` is true. "Newly indexable" is
 * measured by `publishedAt` (the organiser's first publish click, the only first-published date the API gives): walking the ready pages
 * oldest first, a page is held back (noindex, out of the sitemap, failure `weekly_cap`) when `cap` pages published in the 7 days up to and
 * including its own publish time are already indexable. Held pages become indexable on a later build, once they are older than the window.
 */
export function judgePages(items: readonly GuardSource[], cap: number = WEEKLY_CAP): PageVerdict[] {
  const counts = titleCountsOf(items);
  const base = items.map((s) => {
    const v = seoVerdict(guardInput(s, counts));
    const failures = [...v.failures];
    if (!s.apiSeoReady) failures.push("api_not_ready");
    return { slug: s.slug, failures, at: toEpoch(s.publishedAt) ?? 0 };
  });
  const allowed: number[] = [];
  const out = new Map<string, PageVerdict>();
  for (const b of base.filter((x) => x.failures.length === 0).sort((x, y) => x.at - y.at || (x.slug < y.slug ? -1 : 1))) {
    const inWindow = allowed.filter((t) => t > b.at - WEEK_SECONDS && t <= b.at).length;
    if (inWindow >= cap) { out.set(b.slug, { slug: b.slug, indexable: false, failures: ["weekly_cap"] }); continue; }
    allowed.push(b.at);
    out.set(b.slug, { slug: b.slug, indexable: true, failures: [] });
  }
  return base.map((b) => out.get(b.slug) ?? { slug: b.slug, indexable: false, failures: b.failures });
}

/** The largest number of pages whose publish times fall in any one rolling week. verify-seo asserts it never exceeds the cap. */
export function maxInAnyWeek(publishedAtEpochs: readonly number[]): number {
  const s = [...publishedAtEpochs].sort((a, b) => a - b);
  let best = 0, lo = 0;
  for (let hi = 0; hi < s.length; hi++) { while (s[hi] - s[lo] >= WEEK_SECONDS) lo++; best = Math.max(best, hi - lo + 1); }
  return best;
}
