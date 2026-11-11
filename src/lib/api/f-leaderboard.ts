/** Typed calls for the season leaderboard (docs/usp2-contract.md, feature 1). Same patterns as `live` in cloud.ts. */
import { api } from "./index";
import type { LeagueSettings, LeagueState, PublicLeague } from "../league";

export type { LeagueSettings, LeagueState, PublicLeague } from "../league";

const base = (eventId: string) => `/events/${encodeURIComponent(eventId)}/league`;

export const league = {
  /** Owner, editor or viewer. Never cached: the panel must show what is really saved and published. */
  get: (eventId: string) => api.get<LeagueState>(base(eventId), { ttl: 0, swr: 0 }),
  /** Owner or editor. Every field is optional; what you leave out is kept. The first call also creates the public link. */
  put: (eventId: string, body: Partial<LeagueSettings> & { published?: boolean }) => api.put<LeagueState>(base(eventId), body),
  /** No sign-in. The shared client sends the saved ETag, so an unchanged page costs one tiny 304 answer. A 404 means not published or not found. */
  public: (slug: string) => api.get<PublicLeague>(`/public/league/${encodeURIComponent(slug)}`, { ttl: 0, swr: 0, retries: 1 }),
};
