import type { Metadata } from "next";
import { RecapScreen } from "@/features/match-recap/ui/RecapScreen";

// Template recap text and picture from one event's entered results (?id=<event id>). Flag v3.recaps.
export const metadata: Metadata = { title: "Match recap" };
export default function Page() { return <RecapScreen />; }
