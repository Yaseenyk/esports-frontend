/**
 * Portuguese (Brazil) versions of a few pages, for the Brazilian visitors who use the Free Fire tools. Everything else on the site is English.
 *
 * THE REVIEW SWITCH, PER PAGE. The project rule: no translated page is indexed before a native reader approves it.
 * PT_BR_REVIEWED holds one entry per Portuguese page: the date a native Brazilian Portuguese reader (chosen by the site owner, Yaseen Khatib)
 * approved it, read on a phone, or null while it waits. A page with null is `noindex, follow`, is left out of sitemap.xml, and no page
 * declares hreflang to it (scripts/verify-seo.mjs fails the build if any of that is not true). Recording a date makes that one page
 * indexable, adds it to the sitemap and turns on the hreflang pair with its English page. Nothing else needs to change.
 */

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
 * Portuguese path -> the date a native reader approved it, or null while it waits for review.
 * Approved 24 Nov 2026: the owner confirmed a native Brazilian Portuguese reader read and approved the points table and the team names guide.
 * Added 25 Nov 2026, not reviewed yet: the nick, sensitivity converter and guild name pages.
 */
export const PT_BR_REVIEWED: Record<string, string | null> = {
  "/pt-br/points-table/free-fire/": "2026-11-24",
  "/pt-br/guides/free-fire-team-names-ideas/": "2026-11-24",
  "/pt-br/tools/nick-free-fire/": null,
  "/pt-br/tools/conversor-de-sensibilidade/": null,
  "/pt-br/tools/nome-de-guilda-free-fire/": null,
};

/** True only for a Portuguese page a native reader approved. */
export const ptReviewed = (ptPath: string): boolean => !!PT_BR_REVIEWED[ptPath];

/** The Portuguese pages that may be indexed and listed in the sitemap. */
export const PT_BR_INDEXABLE: string[] = Object.values(PT_BR_PAGES).filter(ptReviewed);

/**
 * hreflang links for an English page whose Portuguese version is approved (en, pt-BR, x-default = English). Undefined otherwise: hreflang
 * to a noindex page is ignored by search engines and can break the pair, so an unreviewed translation gets none, on either side.
 */
export function hreflangFor(enPath: string): Record<string, string> | undefined {
  const pt = PT_BR_PAGES[enPath];
  return pt && ptReviewed(pt) ? { en: enPath, "pt-BR": pt, "x-default": enPath } : undefined;
}

/** The English page for a Portuguese path. */
export const enPathFor = (ptPath: string) => Object.keys(PT_BR_PAGES).find((k) => PT_BR_PAGES[k] === ptPath) ?? "/";

/** Robots for a Portuguese page: held out of search until its own review date is recorded above. */
export const ptRobots = (ptPath: string) => (ptReviewed(ptPath) ? { index: true, follow: true } : { index: false, follow: true });
