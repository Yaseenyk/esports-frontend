import type { Metadata } from "next";
import PlanScreen from "@/features/squad-planner/ui/PlanScreen";

// A shared squad plan. The token lives after # (never sent to a server); the page is noindex, out of the sitemap and disallowed in robots.txt.
export const metadata: Metadata = { title: "Squad plan", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default function Page() {
  return <PlanScreen />;
}
