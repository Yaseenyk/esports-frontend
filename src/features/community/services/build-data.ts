/**
 * Build-time reads for the community features (Node only, never imported by a client component). Never throws: with the API off (404),
 * unreachable or odd, both features read as OFF, so no community page, link or island is emitted (scripts/prune-community.mjs removes the
 * routes that rendered only their "off" marker).
 */
import { api } from "@/lib/api";
import { toCalendarPage, toStatus } from "@/features/community/services/community.adapter";
import type { CalendarPage, CommunityStatus } from "@/features/community/domain";

const BUILD_OPT = { retries: 0, timeout: 8000, ttl: 300000 } as const;
let status: Promise<CommunityStatus> | null = null;
let calendar: Promise<CalendarPage | null> | null = null;

async function loadStatus(): Promise<CommunityStatus> {
  try { return toStatus(await api.get<unknown>("/public/community/status", BUILD_OPT)); } catch { return { calendar: false, trust: false }; }
}
async function loadCalendar(): Promise<CalendarPage | null> {
  if (!(await loadCommunityStatus()).calendar) return null;
  try { return toCalendarPage(await api.get<unknown>("/public/calendar", BUILD_OPT)); } catch { return null; }
}

/** Which community features the API has switched on, read once per build. */
export const loadCommunityStatus = (): Promise<CommunityStatus> => (status ??= loadStatus());
/** Every upcoming calendar entry at build time, or null when the calendar is off or unreachable. */
export const loadBuildCalendar = (): Promise<CalendarPage | null> => (calendar ??= loadCalendar());

/** The marker a route renders while its feature is off; scripts/prune-community.mjs deletes every built page that carries it. */
export const PRUNE_MARKER_ID = "eh-prune-community";
