import type { Metadata } from "next";
import { PlayerProfileScreen } from "@/features/profiles";
import { PublicResumeScreen } from "@/features/resume/ui/ResumeScreens";

export const metadata: Metadata = { title: "Esports resume" };
// The phase 3 profile (teams, matches, certificates) when v3.profiles is on; the earlier resume view while it is off.
export default function Page() { return <PlayerProfileScreen fallback={<PublicResumeScreen />} />; }
