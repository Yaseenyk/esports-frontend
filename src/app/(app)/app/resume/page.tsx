import type { Metadata } from "next";
import { ResumeEditorScreen } from "@/features/resume/ui/ResumeScreens";

export const metadata: Metadata = { title: "My esports resume" };
export default function Page() { return <ResumeEditorScreen />; }
