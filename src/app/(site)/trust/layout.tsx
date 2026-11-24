import type { Metadata } from "next";

// Organiser trust pages are user reviews behind a query string: every page under /trust/ is noindex and out of the sitemap.
export const metadata: Metadata = { robots: { index: false, follow: false }, referrer: "no-referrer" };

export default function TrustLayout({ children }: { children: React.ReactNode }) { return children; }
