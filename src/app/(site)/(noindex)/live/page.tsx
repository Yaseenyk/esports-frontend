import type { Metadata } from "next";
import LivePage from "@/components/live/LivePage";

// The page players open from a poster or link. Which event comes from ?e=<slug>. Never for search engines.
export const metadata: Metadata = { title: "Live event page", robots: { index: false, follow: false } };

export default function Page() {
  return <LivePage />;
}
