import type { Metadata } from "next";

// The board is user text with tiny volume (APP_STRUCTURE.md): every page under /lft/ is noindex and out of the sitemap.
export const metadata: Metadata = { robots: { index: false, follow: false }, referrer: "no-referrer" };

export default function LftLayout({ children }: { children: React.ReactNode }) { return children; }
