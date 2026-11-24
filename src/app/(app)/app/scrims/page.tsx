import type { Metadata } from "next";
import { MyScrimsScreen } from "@/features/scrims/ui/ScrimScreens";

export const metadata: Metadata = { title: "My scrims" };
export default function Page() { return <MyScrimsScreen />; }
