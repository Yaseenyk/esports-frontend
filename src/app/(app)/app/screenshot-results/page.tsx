import type { Metadata } from "next";
import { ScreenshotScreen } from "@/features/screenshot-reader/ui/ScreenshotScreen";

// Read a results screenshot in the browser, check every row, then save (?id=<event id>). Flag v3.screenshots. The picture is never uploaded.
export const metadata: Metadata = { title: "Results from a screenshot" };
export default function Page() { return <ScreenshotScreen />; }
