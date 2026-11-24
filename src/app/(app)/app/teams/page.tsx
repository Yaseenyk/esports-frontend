import type { Metadata } from "next";
import { MyTeamPagesScreen } from "@/features/profiles";

export const metadata: Metadata = { title: "My team pages" };
export default function Page() { return <MyTeamPagesScreen />; }
