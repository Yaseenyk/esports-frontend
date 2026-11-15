import type { Metadata } from "next";

// Player resumes are client routes that always fetch fresh (a withdrawn consent must take effect at once): never indexed.
export const metadata: Metadata = { robots: { index: false, follow: false }, referrer: "no-referrer" };

export default function PlayersLayout({ children }: { children: React.ReactNode }) { return children; }
