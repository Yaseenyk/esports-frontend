import type { Metadata } from "next";
import LeaguePage from "@/components/features/leaderboard/LeaguePage";

// The season leaderboard players open from a poster or link. Which event comes from ?s=<slug>. Never for search engines.
export const metadata: Metadata = { title: "Season leaderboard", robots: { index: false, follow: false } };

export default function Page() {
  return <LeaguePage />;
}
