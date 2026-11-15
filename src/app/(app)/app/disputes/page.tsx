import type { Metadata } from "next";
import { MyDisputesScreen } from "@/features/disputes/ui/DisputeScreens";

export const metadata: Metadata = { title: "My disputes" };
export default function Page() { return <MyDisputesScreen />; }
