/**
 * Portuguese (Brazil) versions of a few pages, for the Brazilian visitors who use the Free Fire tools. Everything else on the site is English.
 *
 * THE REVIEW SWITCH, PER PAGE. The project rule: no translated page is indexed before a native reader approves it.
 * PT_BR_REVIEWED holds one entry per Portuguese page: the date a native Brazilian Portuguese reader (chosen by the site owner, Yaseen Khatib)
 * approved it, read on a phone, or null while it waits. A page with null (or no entry) is `noindex, follow`, is left out of sitemap.xml, and
 * no page declares hreflang to it (scripts/verify-seo.mjs fails the build if any of that is not true). Recording a date makes that one page
 * indexable, adds it to the sitemap and turns on the hreflang pair with its English page (unless the English page is a merged guide).
 */

import MERGED_GUIDES from "@/content/merged-guides.json";

export type UiLang = "en" | "pt-BR";

/** English path -> Portuguese path, for the pages that have a Portuguese version. */
export const PT_BR_PAGES: Record<string, string> = {
  "/points-table/free-fire/": "/pt-br/points-table/free-fire/",
  "/guides/free-fire-team-names-ideas/": "/pt-br/guides/free-fire-team-names-ideas/",
  "/tools/free-fire-name-style/": "/pt-br/tools/nick-free-fire/",
  "/tools/sensitivity-converter/": "/pt-br/tools/conversor-de-sensibilidade/",
  "/tools/free-fire-guild-name/": "/pt-br/tools/nome-de-guilda-free-fire/",
};

/**
 * Portuguese path -> the date a native reader approved it, or null while it waits for review. A new page starts as null.
 * Approved 24 Nov 2026: the owner confirmed a native Brazilian Portuguese reader read and approved the points table and the team names guide.
 * Approved 25 Nov 2026: the owner confirmed a native Brazilian Portuguese reader read and approved the nick, sensitivity converter and guild name tool pages.
 * Added 25 Nov 2026, not reviewed yet: the nick, sensitivity converter and guild name pages.
 */
export const PT_BR_REVIEWED: Record<string, string | null> = {
  "/pt-br/points-table/free-fire/": "2026-11-24",
  "/pt-br/guides/free-fire-team-names-ideas/": "2026-11-24",
  "/pt-br/tools/nick-free-fire/": "2026-11-25",
  "/pt-br/tools/conversor-de-sensibilidade/": "2026-11-25",
  "/pt-br/tools/nome-de-guilda-free-fire/": "2026-11-25",
};

/** True only for a Portuguese page a native reader approved. */
export const ptBrReviewed = (ptPath: string): boolean => !!PT_BR_REVIEWED[ptPath];

/** The Portuguese pages that may be indexed and listed in the sitemap. */
export const PT_BR_INDEXABLE: string[] = Object.values(PT_BR_PAGES).filter(ptBrReviewed);

/**
 * English pages that are noindex (guides merged into another guide, src/content/merged-guides.json). A hreflang pair needs both pages
 * indexable: hreflang pointing at a noindex page is ignored and can drop the pair. So a Portuguese page whose English twin is merged
 * stands alone (its own canonical, no hreflang), and the merged English page does not point at it either.
 */
const MERGED_EN = new Set(Object.keys(MERGED_GUIDES).map((slug) => `/guides/${slug}/`));

/**
 * hreflang links for an English page whose Portuguese version is approved (en, pt-BR, x-default = English). Undefined otherwise: when the
 * Portuguese page is unreviewed (noindex) or the English page is a merged (noindex) guide, there is no pair, on either side.
 */
export function hreflangFor(enPath: string): Record<string, string> | undefined {
  const pt = PT_BR_PAGES[enPath];
  return pt && ptBrReviewed(pt) && !MERGED_EN.has(enPath) ? { en: enPath, "pt-BR": pt, "x-default": enPath } : undefined;
}

/** The English page for a Portuguese path. */
export const enPathFor = (ptPath: string) => Object.keys(PT_BR_PAGES).find((k) => PT_BR_PAGES[k] === ptPath) ?? "/";

/** Robots for a Portuguese page: held out of search until its own review date is recorded in PT_BR_REVIEWED. */
export const ptBrRobots = (ptPath: string) => (ptBrReviewed(ptPath) ? { index: true, follow: true } : { index: false, follow: true });
/** Robots for a Portuguese page that has not been reviewed yet. Prefer ptBrRobots(path), which turns indexing on once the page is approved. */
export const PT_BR_ROBOTS = { index: false, follow: true } as const;
