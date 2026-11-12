import type { Metadata } from "next";
import InsightsScreen from "@/components/insights/InsightsScreen";

export const metadata: Metadata = { title: "Insights", robots: { index: false, follow: false } };

export default function Page() {
  return <InsightsScreen />;
}
