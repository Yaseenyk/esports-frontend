import type { Metadata } from "next";
import { CaptainRoomsScreen } from "@/features/match-rooms/ui/RoomsScreens";

// Captains of confirmed teams read their match room ID and password here, from the organiser's reveal time (flag v3.rooms). Private, noindex (app layout).
export const metadata: Metadata = { title: "My match rooms" };
export default function Page() { return <CaptainRoomsScreen />; }
