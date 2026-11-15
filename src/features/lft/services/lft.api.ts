import { profiles } from "@/lib/api/f-profiles";
import { attempt, type V3Result } from "@/features/shared/failure";
import { v3Get, v3Post } from "@/features/shared/services/v3-api";
import { filtersToApiQuery } from "@/features/lft/filters";
import { toBoardPage, toInbox, toListing, toMyListings, toSent } from "@/features/lft/services/lft.adapter";
import type { BoardFilters, BoardPage, InboxApplication, Listing, MyListing, SentApplication } from "@/features/lft/domain";

const map = async <A, B>(p: Promise<V3Result<A>>, f: (a: A) => B): Promise<V3Result<B>> => { const r = await p; return r.ok ? { ok: true, data: f(r.data) } : r; };

export const fetchBoard = (f: BoardFilters, cursor?: string | null) => map(v3Get<unknown>(`/public/lft${filtersToApiQuery(f, cursor)}`), toBoardPage);
export const fetchListing = (id: string) => map(v3Get<unknown>(`/public/lft/${encodeURIComponent(id)}`), (r): Listing | null => toListing(r));
export const fetchMine = () => map(v3Get<unknown>("/v3/me/lft", { force: true }), toMyListings);
export const fetchSent = () => map(v3Get<unknown>("/v3/me/lft/applications", { force: true }), toSent);
export const fetchInbox = (id: string) => map(v3Get<unknown>(`/v3/lft/${encodeURIComponent(id)}/applications`, { force: true }), toInbox);

export const createListing = (body: Record<string, unknown>) => map(v3Post<unknown>("/v3/lft", body), (r): Listing | null => toListing(r));
export const closeListing = (id: string, status: "closed" | "filled") => v3Post<unknown>(`/v3/lft/${encodeURIComponent(id)}/close`, { status });
export const bumpListing = (id: string) => v3Post<unknown>(`/v3/lft/${encodeURIComponent(id)}/bump`);
export const applyTo = (id: string, message: string, contact: string) => v3Post<{ id: string; status: string }>(`/v3/lft/${encodeURIComponent(id)}/applications`, { message, contact });
export const respond = (applicationId: string, decision: "accept" | "decline") => v3Post<unknown>(`/v3/lft-applications/${encodeURIComponent(applicationId)}/respond`, { decision });
export const withdraw = (applicationId: string) => v3Post<unknown>(`/v3/lft-applications/${encodeURIComponent(applicationId)}/withdraw`);
export const reportListing = (id: string, reason: string, note: string) => v3Post<{ ok: boolean }>(`/v3/lft/${encodeURIComponent(id)}/report`, { reason, ...(note.trim() ? { note: note.trim() } : {}) });

/** My legacy team pages, for a team that is looking for a player (the server wants one of them as `teamProfileId`). */
export const fetchMyTeamPages = (): Promise<V3Result<{ id: string; name: string }[]>> => attempt(async () => (await profiles.list()).map((p) => ({ id: p.id, name: p.name })));

export type { MyListing, InboxApplication, SentApplication };
