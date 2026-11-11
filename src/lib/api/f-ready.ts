"use client";

import { api } from "./index";
import type { BoardData, CaptainData } from "../ready";

export type { BoardData, BoardMatch, CaptainData, CaptainMatch } from "../ready";

const base = (eventId: string) => `/events/${encodeURIComponent(eventId)}/ready`;

/** Organiser calls (owner or editor). The board is never cached: it must show who is here right now. */
export const ready = {
  board: (eventId: string) => api.get<BoardData>(base(eventId), { ttl: 0, swr: 0 }),
  setGrace: (eventId: string, graceMinutes: number) => api.put<{ settings: { graceMinutes: number } }>(`${base(eventId)}/settings`, { graceMinutes }),
  /** Marks `team` as forfeiting. `noShow` confirms that no one showed up when the other team is not marked ready either. */
  forfeit: (eventId: string, matchId: string, team: string, noShow: boolean) => api.post<unknown>(`${base(eventId)}/${encodeURIComponent(matchId)}/forfeit`, { team, noShow }),
  clear: (eventId: string, matchId: string) => api.post<{ ok: true; cleared: number }>(`${base(eventId)}/${encodeURIComponent(matchId)}/clear`, {}),
};

/** Captain calls: the link token is the only credential, no sign-in. Never cached. */
export const captain = {
  get: (token: string) => api.get<CaptainData>(`/public/ready/${encodeURIComponent(token)}`, { ttl: 0, swr: 0, retries: 1 }),
  mark: (token: string, matchId: string, isReady: boolean) => api.post<{ ok: true; youReady: boolean; opponentReady: boolean; status: string }>(`/public/ready/${encodeURIComponent(token)}/matches/${encodeURIComponent(matchId)}`, { ready: isReady }),
};
