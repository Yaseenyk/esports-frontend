/**
 * Portuguese (Brazil) versions of two pages, for the Brazilian visitors who use the Free Fire points table with Google Translate on.
 * Only these two pages exist in Portuguese. Everything else on the site is English.
 *
 * THE REVIEW SWITCH. The project rule: no translated page is indexed before a native reader approves it.
 * PT_BR_REVIEWED stays false until a native Brazilian Portuguese reader (chosen by the site owner, Yaseen Khatib) has read both pages,
 * on a phone, and the owner records that approval here. While it is false the Portuguese pages are `noindex, follow`
 * and are left out of sitemap.xml (scripts/verify-seo.mjs fails the build if either is not true).
 * Setting it to true makes both pages indexable and adds them to the sitemap. Nothing else needs to change.
 */
export const PT_BR_REVIEWED = false;

export type UiLang = "en" | "pt-BR";

/** English path -> Portuguese path, for the pages that have a Portuguese version. */
export const PT_BR_PAGES: Record<string, string> = {
  "/points-table/free-fire/": "/pt-br/points-table/free-fire/",
  "/guides/free-fire-team-names-ideas/": "/pt-br/guides/free-fire-team-names-ideas/",
};

/** hreflang links for an English page that has a Portuguese version (en, pt-BR, x-default = English). Undefined for other pages. */
export function hreflangFor(enPath: string): Record<string, string> | undefined {
  const pt = PT_BR_PAGES[enPath];
  return pt ? { en: enPath, "pt-BR": pt, "x-default": enPath } : undefined;
}

/** The English page for a Portuguese path. */
export const enPathFor = (ptPath: string) => Object.keys(PT_BR_PAGES).find((k) => PT_BR_PAGES[k] === ptPath) ?? "/";

/** Robots for a Portuguese page: held out of search until the review switch above is on. */
export const PT_BR_ROBOTS = PT_BR_REVIEWED ? { index: true, follow: true } : { index: false, follow: true };
