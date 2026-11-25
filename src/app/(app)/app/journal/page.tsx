import type { Metadata } from "next";
import { JournalScreen } from "@/features/journal/ui/JournalScreen";

export const metadata: Metadata = { title: "Match journal" };

export default function Page() {
  return <JournalScreen />;
}
