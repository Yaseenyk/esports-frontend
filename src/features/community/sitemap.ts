/** The calendar's sitemap entry (Node only, build time). Present only when the page is indexable by the same rule its metadata uses. */
import { loadBuildCalendar } from "@/features/community/services/build-data";
import { calendarIndexable, todayIst } from "@/features/community/seo";

export async function calendarSitemapEntry(): Promise<{ path: string; lastModified: string }[]> {
  const cal = await loadBuildCalendar();
  if (!cal) return [];
  const today = todayIst();
  const input = cal.items.map((e) => ({ startsOn: e.startsOn, endsOn: e.endsOn, status: e.status, verified: e.organiser.verified }));
  return calendarIndexable(input, today) ? [{ path: "/calendar/", lastModified: today }] : [];
}
