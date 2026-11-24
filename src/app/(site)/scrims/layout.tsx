import type { Metadata } from "next";

// The scrim finder is user-posted, short-lived content: never indexed and not in the sitemap.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function ScrimsLayout({ children }: { children: React.ReactNode }) { return children; }
