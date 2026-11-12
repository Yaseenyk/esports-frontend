import type { Metadata } from "next";
import ActivityScreen from "@/components/org/ActivityScreen";

export const metadata: Metadata = { title: "Club activity", robots: { index: false, follow: false } };

export default function Page() {
  return <ActivityScreen />;
}
