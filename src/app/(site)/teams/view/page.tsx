import type { Metadata } from "next";
import { TeamProfileScreen } from "@/features/profiles";

export const metadata: Metadata = { title: "Team page" };
export default function Page() { return <TeamProfileScreen />; }
