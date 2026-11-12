import type { Metadata } from "next";
import PeopleScreen from "@/components/org/PeopleScreen";

export const metadata: Metadata = { title: "People in your club", robots: { index: false, follow: false } };

export default function Page() {
  return <PeopleScreen />;
}
