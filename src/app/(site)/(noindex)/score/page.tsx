import type { Metadata } from "next";
import ScorePage from "@/components/features/scorer/ScorePage";

// The page a referee or lobby host opens from the link the organiser sent. The code comes from ?t=<token>. Never for search engines.
export const metadata: Metadata = { title: "Enter match results", robots: { index: false, follow: false } };

export default function Page() {
  return <ScorePage />;
}
