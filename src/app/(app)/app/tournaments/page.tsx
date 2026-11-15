import type { Metadata } from "next";
import { MyTournamentsScreen } from "@/features/tournaments/ui/OrganiserScreens";

// The events the signed-in person can wrap in a public tournament page. Private app area: never indexed (the app layout sets noindex).
export const metadata: Metadata = { title: "My tournaments" };
export default function Page() { return <MyTournamentsScreen />; }
