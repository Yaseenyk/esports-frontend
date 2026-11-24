import type { Metadata } from "next";
import { loadCommunityStatus, PRUNE_MARKER_ID } from "@/features/community/services/build-data";
import MyCalendarScreen from "@/features/community/ui/MyCalendarScreen";

export const metadata: Metadata = { title: "College calendar" };

/** /app/calendar/: verified organisations list events. Emitted only while flag v3.calendar was on at build time. */
export default async function Page() {
  if (!(await loadCommunityStatus()).calendar) return <script type="application/json" id={PRUNE_MARKER_ID} dangerouslySetInnerHTML={{ __html: '{"route":"app-calendar"}' }} />;
  return <MyCalendarScreen />;
}
