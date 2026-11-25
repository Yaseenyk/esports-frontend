import type { MetadataRoute } from "next";
import { LISTED_GUIDES as GUIDES } from "@/content/guides";
import { TOOLS } from "@/lib/data";
import { GROWTH_PAGES } from "@/lib/growth-pages";
import { SITE_URL } from "@/lib/site";
import { TOOL_PAGES } from "@/lib/tool-pages";
import { PT_BR_INDEXABLE, PT_BR_REVIEWED } from "@/lib/pt-br";
import { indexableColleges, loadBuildColleges } from "@/features/colleges/college";
import { indexableOnly, loadBuildTournaments } from "@/features/tournaments/services/build-data";
import { tournamentsIndexVerdict } from "@/features/directory/services/page-verdict";
import { KIT_GUIDE_PATH, KIT_PATH, OVERLAY_KIT } from "@/features/overlay-kit/flag";
import { calendarSitemapEntry } from "@/features/community/sitemap";

export const dynamic = "force-static";

/** The day the site launched: the lastmod of any page whose text has not changed since. A page that really changes sets its own `updated` date. */
const LAUNCH = "2026-11-11";
/** Every tool page got new headings on this day, so no tool page can claim an older date. */
const HEADINGS = "2026-11-12";

/** Only pages with real, checked content. Demo-data pages, the app, the gate scanner, sign-in and one-off links are left out on purpose. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const at = (path: string, priority: number, lastModified: string | undefined = LAUNCH) => ({ url: `${SITE_URL}${path}`, lastModified, changeFrequency: "monthly" as const, priority });
  // v3 tournament pages: ONLY the ones the thin-page guard passed (and the weekly cap allowed). Empty while the API is off.
  const live = indexableOnly(await loadBuildTournaments());
  const colleges = indexableColleges(await loadBuildColleges());
  // /tournaments/ itself: only with 5 or more upcoming public tournaments (the same verdict the page uses for its robots tag).
  const index = await tournamentsIndexVerdict();
  return [
    at("/", 1, HEADINGS), at("/tools/", 0.9, HEADINGS), at("/guides/", 0.9),
    ...TOOLS.map((t) => at(t.href, 0.9, TOOL_PAGES[t.slug]?.updated ?? HEADINGS)),
    ...GROWTH_PAGES.map((p) => at(p.path, p.priority, p.updated)),
    ...GUIDES.map((g) => at(`/guides/${g.slug}/`, 0.8, g.updated)),
    ...(index.indexable ? [at("/tournaments/", 0.6, live[0]?.detail.publishedAt?.slice(0, 10) ?? LAUNCH)] : []),
    ...live.map((t) => at(`/tournaments/${t.detail.slug}/`, 0.5, t.detail.publishedAt?.slice(0, 10) ?? LAUNCH)),
    ...colleges.map((c) => at(`/colleges/${c.slug}/`, 0.4)),
    // The OBS overlay kit: only while its flag is on (the browser source page /overlay-kit/live/ is noindex and never listed).
    ...(OVERLAY_KIT ? [at(KIT_PATH, 0.6, "2026-11-24"), at(KIT_GUIDE_PATH, 0.5, "2026-11-24")] : []),
    // College esports calendar: only while it passes the index rule (5+ upcoming entries from verified organisations). Empty while the API is off.
    ...(await calendarSitemapEntry()).map((p) => at(p.path, 0.5, p.lastModified)),
    at("/about/", 0.4), at("/contact/", 0.3), at("/privacy/", 0.2), at("/terms/", 0.2),
    // Portuguese pages: each only after a native Brazilian Portuguese reader approved it (PT_BR_REVIEWED in src/lib/pt-br.ts, one date per page).
    ...PT_BR_INDEXABLE.map((p) => at(p, 0.5, PT_BR_REVIEWED[p] ?? undefined)),
  ];
}
