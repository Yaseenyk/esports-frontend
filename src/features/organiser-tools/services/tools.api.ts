import type { V3Result } from "@/features/shared/failure";
import { v3Get } from "@/features/shared/services/v3-api";

/** Which organiser tools are on for one event. ONE call; it answers 404 while the three flags (v3.rooms, v3.recaps, v3.screenshots) are off. */
export interface ToolSwitches { rooms: boolean; recaps: boolean; screenshots: boolean; canEdit: boolean }
export const toToolSwitches = (v: unknown): ToolSwitches => {
  const r = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  return { rooms: r.rooms === true, recaps: r.recaps === true, screenshots: r.screenshots === true, canEdit: r.canEdit === true };
};
export async function fetchToolSwitches(eventId: string): Promise<V3Result<ToolSwitches>> {
  const r = await v3Get<unknown>(`/v3/events/${encodeURIComponent(eventId)}/tools`, { force: true, ttl: 0 });
  return r.ok ? { ok: true, data: toToolSwitches(r.data) } : r;
}
