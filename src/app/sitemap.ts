import type { MetadataRoute } from "next";
import { GUIDES } from "@/content/guides";
import { TOOLS } from "@/lib/data";
import { GROWTH_PAGES } from "@/lib/growth-pages";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

const LAUNCH = "2026-11-11";

/** Only pages with real, checked content. Demo-data pages, the app, the gate scanner, sign-in and one-off links are left out on purpose. */
export default function sitemap(): MetadataRoute.Sitemap {
  const at = (path: string, priority: number, lastModified = LAUNCH) => ({ url: `${SITE_URL}${path}`, lastModified, changeFrequency: "monthly" as const, priority });
  return [
    at("/", 1), at("/tools/", 0.9), at("/guides/", 0.9),
    ...TOOLS.map((t) => at(t.href, 0.9)),
    ...GROWTH_PAGES.map((p) => at(p.path, p.priority)),
    ...GUIDES.map((g) => at(`/guides/${g.slug}/`, 0.8, g.updated)),
    at("/about/", 0.4), at("/contact/", 0.3), at("/privacy/", 0.2), at("/terms/", 0.2),
  ];
}
