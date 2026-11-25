import type { Metadata } from "next";

// The page a player card's QR opens (/p/?k=<token>). The token is the page's only address, so: never indexed, never followed, never sent as a referrer,
// out of the sitemap, and out of Pulse (data-exclude "/p/" in app/layout.tsx) and the tag loader (not in lib/gtm.ts ALLOWED).
export const metadata: Metadata = { robots: { index: false, follow: false }, referrer: "no-referrer" };

export default function CardLayout({ children }: { children: React.ReactNode }) { return children; }
