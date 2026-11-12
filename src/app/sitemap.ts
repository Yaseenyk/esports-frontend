import type { MetadataRoute } from "next";
import { GUIDES } from "@/content/guides";
import { TOOLS } from "@/lib/data";
import { GROWTH_PAGES } from "@/lib/growth-pages";
import { SITE_URL } from "@/lib/site";
import { TOOL_PAGES } from "@/lib/tool-pages";

export const dynamic = "force-static";

/** The day the site launched: the lastmod of any page whose text has not changed since. A page that really changes sets its own `updated` date. */
const LAUNCH = "2026-11-11";
/** Every tool page got new headings on this day, so no tool page can claim an older date. */
const HEADINGS = "2026-11-12";

/** Only pages with real, checked content. Demo-data pages, the app, the gate scanner, sign-in and one-off links are left out on purpose. */
export default function sitemap(): MetadataRoute.Sitemap {
  const at = (path: string, priority: number, lastModified: string | undefined = LAUNCH) => ({ url: `${SITE_URL}${path}`, lastModified, changeFrequency: "monthly" as const, priority });
  return [
    at("/", 1, HEADINGS), at("/tools/", 0.9, HEADINGS), at("/guides/", 0.9),
    ...TOOLS.map((t) => at(t.href, 0.9, TOOL_PAGES[t.slug]?.updated ?? HEADINGS)),
    ...GROWTH_PAGES.map((p) => at(p.path, p.priority, p.updated)),
    ...GUIDES.map((g) => at(`/guides/${g.slug}/`, 0.8, g.updated)),
    at("/about/", 0.4), at("/developers/", 0.3), at("/contact/", 0.3), at("/privacy/", 0.2), at("/terms/", 0.2),
  ];
}
