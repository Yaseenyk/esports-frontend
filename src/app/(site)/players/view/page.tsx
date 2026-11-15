import type { Metadata } from "next";
import { PublicResumeScreen } from "@/features/resume/ui/ResumeScreens";

export const metadata: Metadata = { title: "Esports resume" };
export default function Page() { return <PublicResumeScreen />; }
