import type { Metadata } from "next";
import { OrganiserQueueScreen } from "@/features/disputes/ui/DisputeScreens";

// The organiser's queue. The tournament comes from the query string (?t=<address> or ?id=<event id>): ids are not known at build time.
export const metadata: Metadata = { title: "Tournament disputes" };
export default function Page() { return <OrganiserQueueScreen />; }
