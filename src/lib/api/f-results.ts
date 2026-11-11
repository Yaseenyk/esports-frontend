"use client";

import { api } from "./index";
import { events } from "./cloud";
import type { Side, SubStatus } from "../results";

export type { Side, SubStatus } from "../results";

const base = (eventId: string) => `/events/${encodeURIComponent(eventId)}`;

export interface CaptainLinkInfo { id: string; team: string; createdAt: string; revokedAt: string | null; active: boolean }
/** Returned once, right after creation: the token is never listed again. */
export interface NewCaptainLink { id: string; team: string; token: string; createdAt: string }
export interface Rival { id: string; team: string; scoreA: number; scoreB: number; note: string; hasProof: boolean; proofUrl: string | null }
export interface SubmissionItem {
  id: string; matchId: string; team: string; scoreA: number; scoreB: number; note: string; hasProof: boolean; proofUrl: string | null;
  status: SubStatus; rejectReason: string | null; createdAt: string; decidedAt: string | null; decidedBy: string | null; disputed: boolean; rivals: Rival[];
  match: { a: string; b: string; stage: string; round: number; slot: number; status: string; scoreA: number | null; scoreB: number | null } | null;
}
export interface CaptainMatch {
  id: string; stage: string; round: number; slot: number; side: Side; a: string; b: string; opponent: string; status: string; scoreA: number | null; scoreB: number | null; startsAt: string | null;
  canReport: boolean; disputed: boolean;
  submission: { id: string; status: SubStatus; scoreA: number; scoreB: number; note: string; rejectReason: string | null; createdAt: string; decidedAt: string | null; hasProof: boolean } | null;
}
export interface CaptainView { event: { name: string; date: string }; team: string; matches: CaptainMatch[] }

/** Organiser calls (owner or editor; a view-only member can read the lists). Never cached: the queue must be current. */
export const results = {
  links: (eventId: string) => api.get<{ links: CaptainLinkInfo[] }>(`${base(eventId)}/captain-links`, { ttl: 0, swr: 0 }).then((r) => r?.links ?? []),
  /** One link for every team found in the matches. Teams that already have a working link are skipped unless `renew` is true. */
  makeAll: (eventId: string, renew = false) => api.post<{ links: NewCaptainLink[]; skipped: string[] }>(`${base(eventId)}/captain-links`, { all: true, renew }),
  /** A fresh link for one team. The team's old link stops working. */
  makeOne: (eventId: string, team: string) => api.post<{ links: NewCaptainLink[] }>(`${base(eventId)}/captain-links`, { team }),
  revoke: (eventId: string, linkId: string) => api.del<{ ok: true }>(`${base(eventId)}/captain-links/${encodeURIComponent(linkId)}`),
  submissions: (eventId: string, status?: SubStatus) =>
    api.get<{ submissions: SubmissionItem[]; autoApprove: boolean }>(`${base(eventId)}/result-submissions${status ? `?status=${status}` : ""}`, { ttl: 0, swr: 0 }).then((r) => ({ submissions: r?.submissions ?? [], autoApprove: !!r?.autoApprove })),
  approve: (eventId: string, sid: string) => api.post<{ ok: true }>(`${base(eventId)}/result-submissions/${encodeURIComponent(sid)}/approve`, {}),
  reject: (eventId: string, sid: string, reason: string) => api.post<{ ok: true }>(`${base(eventId)}/result-submissions/${encodeURIComponent(sid)}/reject`, { reason }),
  setAutoApprove: (eventId: string, autoApprove: boolean) => api.put<{ autoApprove: boolean }>(`${base(eventId)}/result-settings`, { autoApprove }),
  /** The screenshot as a data URL (it needs the sign-in, so it cannot be a plain image address). */
  proof: (proofUrl: string) => events.photoAsDataUrl(proofUrl),
};

/** Captain calls: the link token is the only credential, no sign-in. Never cached. */
export const report = {
  get: (token: string) => api.get<CaptainView>(`/public/report/${encodeURIComponent(token)}`, { ttl: 0, swr: 0, retries: 1 }),
  send: (token: string, matchId: string, body: { scoreA: number; scoreB: number; note?: string; proof?: string }) =>
    api.post<{ ok: true; id: string; status: "pending" | "approved"; disputed: boolean }>(`/public/report/${encodeURIComponent(token)}/matches/${encodeURIComponent(matchId)}`, body),
};
