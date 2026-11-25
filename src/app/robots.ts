import type { MetadataRoute } from "next";
import { AI_CRAWLERS, PRIVATE_PATHS } from "@/lib/crawlers";
import { INDEXABLE, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) return { rules: { userAgent: "*", disallow: "/" } };
  // Everyone, and the AI crawlers by name (same private paths): see src/lib/crawlers.ts.
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: PRIVATE_PATHS },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
