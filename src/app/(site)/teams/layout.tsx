import type { Metadata } from "next";

// Shared team pages are client routes that always fetch fresh (a page made private must disappear at once): never indexed.
export const metadata: Metadata = { robots: { index: false, follow: false }, referrer: "no-referrer" };

export default function TeamsLayout({ children }: { children: React.ReactNode }) { return children; }
