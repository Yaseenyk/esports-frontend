import type { MetadataRoute } from "next";
import { INDEXABLE, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) return { rules: { userAgent: "*", disallow: "/" } };
  // Private screens and one-off links are kept out of crawling. Pages that only carry demo data are crawlable but marked noindex.
  return { rules: { userAgent: "*", allow: "/", disallow: ["/app/", "/gate/", "/join/", "/pass/", "/register/", "/login/", "/signup/"] }, sitemap: `${SITE_URL}/sitemap.xml` };
}
