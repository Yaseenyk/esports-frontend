import type { Metadata } from "next";
import { DisputeViewScreen } from "@/features/disputes/ui/DisputeScreens";

export const metadata: Metadata = { title: "Dispute" };
export default function Page() { return <DisputeViewScreen />; }
