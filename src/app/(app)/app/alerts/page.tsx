import type { Metadata } from "next";
import AlertsScreen from "@/features/alerts/ui/AlertsScreen";

export const metadata: Metadata = { title: "Tournament alerts" };
export default function Page() { return <AlertsScreen />; }
