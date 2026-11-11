import type { Metadata } from "next";
import ReportPage from "@/components/features/results/ReportPage";

// The page a team captain opens from the link the organiser sent. Which team comes from ?t=<token>. Never for search engines.
export const metadata: Metadata = { title: "Report your match result", robots: { index: false, follow: false } };

export default function Page() {
  return <ReportPage />;
}
