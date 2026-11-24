import type { Metadata } from "next";
import { ScrimBoardScreen } from "@/features/scrims/ui/ScrimScreens";

export const metadata: Metadata = { title: "Scrim finder" };
export default function Page() { return <ScrimBoardScreen />; }
