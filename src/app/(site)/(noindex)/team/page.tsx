import type { Metadata } from "next";
import TeamPage from "@/components/features/profiles/TeamPage";

// A team page a team chose to publish. Which team comes from ?s=<slug>. Never for search engines.
export const metadata: Metadata = { title: "Team page", robots: { index: false, follow: false } };

export default function Page() {
  return <TeamPage />;
}
