/** Phase 4 API calls and payload adapters (API.md section 10). The only place this feature talks to the network. */
import { profiles } from "@/lib/api/f-profiles";
import { attempt, type V3Result } from "@/features/shared/failure";
import { qs, v3Del, v3Get, v3Post } from "@/features/shared/services/v3-api";
import { istDayRange } from "@/features/scrims/time";
import type { Block, BoardFilters, BoardPage, IncomingRequest, MySlot, SentRequest, Slot } from "@/features/scrims/domain";

type R = Record<string, unknown>;
const obj = (v: unknown): R => (v && typeof v === "object" && !Array.isArray(v) ? (v as R) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const str = (v: unknown, d = ""): string => (typeof v === "string" ? v : d);
const strOrNull = (v: unknown): string | null => (typeof v === "string" ? v : null);
const num = (v: unknown, d = 0): number => (typeof v === "number" && Number.isFinite(v) ? v : d);
const map = async <A, B>(p: Promise<V3Result<A>>, f: (a: A) => B): Promise<V3Result<B>> => { const r = await p; return r.ok ? { ok: true, data: f(r.data) } : r; };
const enc = encodeURIComponent;

export function toSlot(v: unknown): Slot | null {
  const o = obj(v);
  if (typeof o.id !== "string" || typeof o.startsAt !== "string") return null;
  return {
    id: o.id, game: str(o.game), startsAt: o.startsAt, region: str(o.region), server: strOrNull(o.server), skillNote: strOrNull(o.skillNote), slotsTotal: num(o.slotsTotal, 1), slotsLeft: num(o.slotsLeft),
    teamName: str(o.teamName, "Team"), createdAt: strOrNull(o.createdAt), mine: o.mine === true, myRequest: strOrNull(o.myRequest),
  };
}
export const toBoardPage = (v: unknown): BoardPage => ({ items: arr(obj(v).items).map(toSlot).filter((x): x is Slot => x !== null), nextCursor: strOrNull(obj(v).nextCursor) });
export function toMySlot(v: unknown): MySlot | null {
  const s = toSlot(v);
  if (!s) return null;
  const o = obj(v), q = obj(o.requests);
  return { ...s, status: str(o.status, "open"), expired: o.expired === true, hidden: o.hidden === true, contact: str(o.contact), requests: { pending: num(q.pending), accepted: num(q.accepted) } };
}
export const toIncoming = (v: unknown): IncomingRequest => { const o = obj(v); return { id: str(o.id), teamName: str(o.teamName, "Team"), message: strOrNull(o.message), status: str(o.status), createdAt: strOrNull(o.createdAt), respondedAt: strOrNull(o.respondedAt), contact: o.status === "accepted" ? strOrNull(o.contact) : null }; };
export const toSent = (v: unknown): SentRequest => { const o = obj(v); return { id: str(o.id), slotId: str(o.slotId), status: str(o.status), game: str(o.game), startsAt: str(o.startsAt), region: str(o.region), slotStatus: str(o.slotStatus), teamName: str(o.teamName, "Team"), myTeamName: str(o.myTeamName, "Team"), contact: o.status === "accepted" ? strOrNull(o.contact) : null }; };
const toBlock = (v: unknown): Block => { const o = obj(v); return { id: str(o.id), label: str(o.label, "Team"), createdAt: strOrNull(o.createdAt) }; };

/** Board query: game, region and an India-time day sent as a UTC range. */
export function boardQuery(f: BoardFilters, cursor?: string | null): string {
  const range = f.day ? istDayRange(f.day) : null;
  return qs({ game: f.game, region: f.region, from: range?.from, to: range?.to, cursor: cursor ?? undefined });
}

/** Signed-out visitors read the cached public board; a signed-in captain reads the board with blocks applied and their own slots marked. */
export const fetchBoard = (f: BoardFilters, signedIn: boolean, cursor?: string | null) =>
  map(signedIn ? v3Get<unknown>(`/v3/scrims${boardQuery(f, cursor)}`, { force: true }) : v3Get<unknown>(`/public/scrims${boardQuery(f, cursor)}`), toBoardPage);
export const fetchMySlots = () => map(v3Get<unknown>("/v3/me/scrims", { force: true }), (v) => arr(obj(v).items).map(toMySlot).filter((x): x is MySlot => x !== null));
export const fetchIncoming = (slotId: string) => map(v3Get<unknown>(`/v3/scrims/${enc(slotId)}/requests`, { force: true }), (v) => arr(obj(v).items).map(toIncoming));
export const fetchSent = () => map(v3Get<unknown>("/v3/me/scrim-requests", { force: true }), (v) => arr(obj(v).items).map(toSent));
export const fetchBlocks = () => map(v3Get<unknown>("/v3/me/scrim-blocks", { force: true }), (v) => arr(obj(v).items).map(toBlock));

export const createSlot = (body: Record<string, unknown>) => map(v3Post<unknown>("/v3/scrims", body), toMySlot);
export const cancelSlot = (id: string) => v3Post<unknown>(`/v3/scrims/${enc(id)}/cancel`, {});
export const requestSlot = (id: string, body: { teamProfileId: string; message: string; contact: string }) => v3Post<{ id: string; status: string }>(`/v3/scrims/${enc(id)}/requests`, body);
export const respondTo = (requestId: string, decision: "accept" | "decline") => map(v3Post<unknown>(`/v3/scrim-requests/${enc(requestId)}/respond`, { decision }), toIncoming);
export const withdrawRequest = (requestId: string) => v3Post<unknown>(`/v3/scrim-requests/${enc(requestId)}/withdraw`, {});
export const blockPoster = (slotId: string) => v3Post<unknown>(`/v3/scrims/${enc(slotId)}/block`, {});
export const blockRequester = (requestId: string) => v3Post<unknown>(`/v3/scrim-requests/${enc(requestId)}/block`, {});
export const unblock = (id: string) => v3Del<unknown>(`/v3/me/scrim-blocks/${enc(id)}`);
export const reportSlot = (id: string, reason: string, note: string) => v3Post<{ ok: boolean }>(`/v3/scrims/${enc(id)}/report`, { reason, ...(note.trim() ? { note: note.trim().slice(0, 200) } : {}) });

/** The caller's team pages (a captain posts and requests for a team page they own). */
export const fetchMyTeams = (): Promise<V3Result<{ id: string; name: string }[]>> => attempt(async () => (await profiles.list()).map((p) => ({ id: p.id, name: p.name })));
