import type { Metadata } from "next";
import ReadyPage from "@/components/features/ready/ReadyPage";

// The page a team captain opens from the link the organiser sent. Which team comes from ?t=<token>. Never for search engines.
export const metadata: Metadata = { title: "Team ready check", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default function Page() {
  return <ReadyPage />;
}
