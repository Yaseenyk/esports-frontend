import { api } from "@/lib/api";
import { attempt, type V3Result } from "@/features/shared/failure";
import { v3Get, v3Post } from "@/features/shared/services/v3-api";
import { toDetail, toList } from "@/features/disputes/services/dispute.adapter";
import type { DisputeDetail, DisputeListItem } from "@/features/disputes/domain";

const map = async <A, B>(p: Promise<V3Result<A>>, f: (a: A) => B): Promise<V3Result<B>> => { const r = await p; return r.ok ? { ok: true, data: f(r.data) } : r; };
const e = encodeURIComponent;

export const fetchMine = (): Promise<V3Result<DisputeListItem[]>> => map(v3Get<unknown>("/v3/me/disputes", { force: true }), toList);
export const fetchForTournament = (slug: string): Promise<V3Result<DisputeListItem[]>> => map(v3Get<unknown>(`/v3/tournaments/${e(slug)}/disputes`, { force: true }), toList);
export const fetchDispute = (id: string): Promise<V3Result<DisputeDetail | null>> => map(v3Get<unknown>(`/v3/disputes/${e(id)}`, { force: true }), toDetail);

export const raiseDispute = (slug: string, body: Record<string, unknown>): Promise<V3Result<DisputeDetail | null>> => map(v3Post<unknown>(`/v3/tournaments/${e(slug)}/disputes`, body), toDetail);
export const comment = (id: string, note: string) => v3Post<unknown>(`/v3/disputes/${e(id)}/comment`, { note });
export const transition = (id: string, to: string, note: string) => v3Post<unknown>(`/v3/disputes/${e(id)}/transition`, { to, ...(note.trim() ? { note: note.trim() } : {}) });
export const resolve = (id: string, body: { status: string; outcome: string; note: string }) => v3Post<unknown>(`/v3/disputes/${e(id)}/resolve`, body);

/** The captain claim: the legacy captain-link token, sent once and never stored by this app. Returns the team it proved. */
export const claimCaptain = (slug: string, token: string) => map(v3Post<unknown>(`/v3/tournaments/${e(slug)}/captain-claim`, { token }), (r) => {
  const o = (r && typeof r === "object" ? r : {}) as Record<string, unknown>;
  return { team: typeof o.team === "string" ? o.team.slice(0, 80) : "" };
});

/** Evidence upload: the image bytes ARE the body (API.md). Caption goes in the query string. */
export const uploadEvidence = (id: string, blob: Blob, caption = ""): Promise<V3Result<{ id: string }>> =>
  attempt(async () => { const r = await api.postRaw<{ id?: unknown }>(`/v3/disputes/${e(id)}/evidence${caption.trim() ? `?caption=${e(caption.trim().slice(0, 200))}` : ""}`, blob); return { id: typeof r?.id === "string" ? r.id : "" }; });

/** Evidence needs the bearer token, so it is fetched as a blob and shown through an object URL (an `<img src>` cannot send a header). */
export const downloadEvidence = (id: string, evidenceId: string): Promise<V3Result<Blob>> => attempt(() => api.getBlob(`/v3/disputes/${e(id)}/evidence/${e(evidenceId)}`));
