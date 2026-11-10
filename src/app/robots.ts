import type { MetadataRoute } from "next";
import { INDEXABLE, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // While the pages show made-up sample data nothing is offered to crawlers. Set NEXT_PUBLIC_INDEXABLE=1 at build time to open the website.
  if (!INDEXABLE) return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/", disallow: ["/app/", "/gate/", "/join/", "/pass/"] }, sitemap: `${SITE_URL}/sitemap.xml` };
}
