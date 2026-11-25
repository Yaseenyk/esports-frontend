import { profiles } from "@/lib/api/f-profiles";
import { attempt, type V3Result } from "@/features/shared/failure";
import { v3Del, v3Get, v3Post } from "@/features/shared/services/v3-api";
import { filtersToApiQuery } from "@/features/lft/filters";
import { toBoardPage, toInbox, toListing, toMyListings, toSent } from "@/features/lft/services/lft.adapter";
import type { BoardFilters, BoardPage, Contacts, InboxApplication, Listing, MatchWants, MyListing, SentApplication } from "@/features/lft/domain";

const map = async <A, B>(p: Promise<V3Result<A>>, f: (a: A) => B): Promise<V3Result<B>> => { const r = await p; return r.ok ? { ok: true, data: f(r.data) } : r; };

export const fetchBoard = (f: BoardFilters, cursor?: string | null, wants?: MatchWants) => map(v3Get<unknown>(`/public/lft${filtersToApiQuery(f, cursor, 20, wants)}`), toBoardPage);
export const fetchListing = (id: string) => map(v3Get<unknown>(`/public/lft/${encodeURIComponent(id)}`), (r): Listing | null => toListing(r));
export const fetchMine = () => map(v3Get<unknown>("/v3/me/lft", { force: true }), toMyListings);
export const fetchSent = () => map(v3Get<unknown>("/v3/me/lft/applications", { force: true }), toSent);
export const fetchInbox = (id: string) => map(v3Get<unknown>(`/v3/lft/${encodeURIComponent(id)}/applications`, { force: true }), toInbox);

export const createListing = (body: Record<string, unknown>) => map(v3Post<unknown>("/v3/lft", body), (r): Listing | null => toListing(r));
export const closeListing = (id: string, status: "closed" | "filled") => v3Post<unknown>(`/v3/lft/${encodeURIComponent(id)}/close`, { status });
export const bumpListing = (id: string) => v3Post<unknown>(`/v3/lft/${encodeURIComponent(id)}/bump`);
/** `contact` (the legacy single handle) is always sent; `contacts` only when the person chose several (team matching on). */
export const applyTo = (id: string, message: string, contact: string, contacts?: Contacts) => v3Post<{ id: string; status: string }>(`/v3/lft/${encodeURIComponent(id)}/applications`, { message, contact, ...(contacts ? { contacts } : {}) });
export const blockFromRequest = (applicationId: string) => v3Post<unknown>(`/v3/lft-applications/${encodeURIComponent(applicationId)}/block`, {});
export const reportRequest = (applicationId: string, reason: string, note: string) => v3Post<unknown>(`/v3/lft-applications/${encodeURIComponent(applicationId)}/report`, { reason, ...(note.trim() ? { note: note.trim() } : {}) });
type RawBlock = { id?: unknown; label?: unknown; createdAt?: unknown };
const toBlocks = (r: unknown): { id: string; label: string; createdAt: string }[] => {
  const items = (r as { items?: unknown } | null)?.items;
  return Array.isArray(items) ? (items as RawBlock[]).map((b) => ({ id: String(b.id ?? ""), label: String(b.label ?? "").slice(0, 60), createdAt: String(b.createdAt ?? "") })).filter((b) => b.id) : [];
};
export const fetchBlocks = () => map(v3Get<unknown>("/v3/me/lft-blocks", { force: true }), toBlocks);
export const unblock = (id: string) => v3Del<unknown>(`/v3/me/lft-blocks/${encodeURIComponent(id)}`);
export const respond = (applicationId: string, decision: "accept" | "decline") => v3Post<unknown>(`/v3/lft-applications/${encodeURIComponent(applicationId)}/respond`, { decision });
export const withdraw = (applicationId: string) => v3Post<unknown>(`/v3/lft-applications/${encodeURIComponent(applicationId)}/withdraw`);
export const reportListing = (id: string, reason: string, note: string) => v3Post<{ ok: boolean }>(`/v3/lft/${encodeURIComponent(id)}/report`, { reason, ...(note.trim() ? { note: note.trim() } : {}) });

/** My legacy team pages, for a team that is looking for a player (the server wants one of them as `teamProfileId`). */
export const fetchMyTeamPages = (): Promise<V3Result<{ id: string; name: string }[]>> => attempt(async () => (await profiles.list()).map((p) => ({ id: p.id, name: p.name })));

export type { MyListing, InboxApplication, SentApplication };
