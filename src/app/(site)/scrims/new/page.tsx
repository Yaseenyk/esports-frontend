import type { Metadata } from "next";
import { NewScrimScreen } from "@/features/scrims/ui/ScrimScreens";

export const metadata: Metadata = { title: "Post a scrim" };
export default function Page() { return <NewScrimScreen />; }
