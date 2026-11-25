/**
 * Portuguese (Brazil) versions of two pages, for the Brazilian visitors who use the Free Fire points table with Google Translate on.
 * Only these two pages exist in Portuguese. Everything else on the site is English.
 *
 * THE REVIEW SWITCH, ONE PAGE AT A TIME. The project rule: no translated page is indexed before a native reader approves it.
 * A Portuguese page is listed in PT_BR_REVIEWED, with the date, only after a native Brazilian Portuguese reader (chosen by the site
 * owner, Yaseen Khatib) has read it on a phone and the owner records that approval here. Until then the page is `noindex, follow`
 * and left out of sitemap.xml (scripts/verify-seo.mjs reads this record and fails the build otherwise). A new page starts unlisted.
 */
/**
 * Approved 24 Nov 2026: the owner confirmed a native Brazilian Portuguese reader read and approved both pages.
 */
export const PT_BR_REVIEWED: Record<string, string> = {
  "/pt-br/points-table/free-fire/": "2026-11-24",
  "/pt-br/guides/free-fire-team-names-ideas/": "2026-11-24",
};

/** True once a native reader approved this Portuguese page. */
export const ptBrReviewed = (ptPath: string) => !!PT_BR_REVIEWED[ptPath];

import MERGED_GUIDES from "@/content/merged-guides.json";

export type UiLang = "en" | "pt-BR";

/** English path -> Portuguese path, for the pages that have a Portuguese version. */
export const PT_BR_PAGES: Record<string, string> = {
  "/points-table/free-fire/": "/pt-br/points-table/free-fire/",
  "/guides/free-fire-team-names-ideas/": "/pt-br/guides/free-fire-team-names-ideas/",
};

/**
 * English pages that are noindex (guides merged into another guide, src/content/merged-guides.json). A hreflang pair needs both pages
 * indexable: hreflang pointing at a noindex page is ignored and can drop the pair. So a Portuguese page whose English twin is merged
 * stands alone (its own canonical, no hreflang), and the merged English page does not point at it either.
 */
const MERGED_EN = new Set(Object.keys(MERGED_GUIDES).map((slug) => `/guides/${slug}/`));

/** hreflang links for an English page that has a Portuguese version (en, pt-BR, x-default = English). Undefined for other pages, and when the English page is noindex. */
export function hreflangFor(enPath: string): Record<string, string> | undefined {
  const pt = PT_BR_PAGES[enPath];
  return pt && !MERGED_EN.has(enPath) ? { en: enPath, "pt-BR": pt, "x-default": enPath } : undefined;
}

/** The English page for a Portuguese path. */
export const enPathFor = (ptPath: string) => Object.keys(PT_BR_PAGES).find((k) => PT_BR_PAGES[k] === ptPath) ?? "/";

/** Robots for a Portuguese page: held out of search until that page is in PT_BR_REVIEWED. */
export const ptBrRobots = (ptPath: string) => (ptBrReviewed(ptPath) ? { index: true, follow: true } : { index: false, follow: true });
/** Robots for a Portuguese page that has not been reviewed yet. Prefer ptBrRobots(path), which turns indexing on once the page is approved. */
export const PT_BR_ROBOTS = { index: false, follow: true } as const;
