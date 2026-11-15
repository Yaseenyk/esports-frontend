import type { Metadata } from "next";
import { NewDisputeScreen } from "@/features/disputes/ui/DisputeScreens";

export const metadata: Metadata = { title: "Raise a dispute" };
export default function Page() { return <NewDisputeScreen />; }
