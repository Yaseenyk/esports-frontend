import { api } from "./index";
import type { LiveState } from "../live";
import { reportPath, type SponsorReportData } from "../sponsorreport";

/** Sponsor report client. Organiser routes only (the counting call is `sendHit` in lib/hits.ts). */
export const sponsorReport = {
  get: (eventId: string, from: string, to: string) => api.get<SponsorReportData>(reportPath(eventId, from, to), { ttl: 15_000, swr: 0 }),
  /** The live page state, for the sponsors shown on it. */
  live: (eventId: string) => api.get<LiveState>(`/events/${encodeURIComponent(eventId)}/live`, { ttl: 15_000, swr: 0 }),
};
