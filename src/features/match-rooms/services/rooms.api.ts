import type { V3Failure, V3Result } from "@/features/shared/failure";
import { v3Del, v3Get, v3Post, v3Put } from "@/features/shared/services/v3-api";
import type { CaptainRoom, OrganiserRoom, RevealedRoom, RoomPhase, RoomMatch, RoomView, RoomsState } from "@/features/match-rooms/domain";

/** Match rooms API (flag v3.rooms). Every payload is read field by field: nothing unexpected reaches the screens. Revealed credentials are never cached. */
const e = encodeURIComponent;
const s = (v: unknown, max = 200): string => (typeof v === "string" ? v.slice(0, max) : "");
const n = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) ? v : 0);
const phase = (v: unknown): RoomPhase => (v === "revealed" || v === "expired" ? v : "waiting");
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const unreadable: V3Failure = { kind: "error", status: 200 };
const map = async <A, B>(p: Promise<V3Result<A>>, f: (a: A) => B | null): Promise<V3Result<B>> => {
  const r = await p;
  if (!r.ok) return r;
  const d = f(r.data);
  return d === null ? { ok: false, failure: unreadable } : { ok: true, data: d };
};

function match(v: unknown): RoomMatch | null {
  const m = obj(v);
  if (!m.id) return null;
  return { id: s(m.id, 80), teamA: typeof m.teamA === "string" ? m.teamA.slice(0, 80) : null, teamB: typeof m.teamB === "string" ? m.teamB.slice(0, 80) : null };
}
export function toOrganiserRoom(v: unknown): OrganiserRoom | null {
  const r = obj(v);
  if (typeof r.id !== "string") return null;
  return {
    id: r.id.slice(0, 64), label: s(r.label, 80), match: match(r.match), startsAt: s(r.startsAt, 40), revealAt: s(r.revealAt, 40), revealMinutesBefore: n(r.revealMinutesBefore), phase: phase(r.phase),
    hasCredentials: r.hasCredentials === true, version: n(r.version), rotatedAt: typeof r.rotatedAt === "string" ? r.rotatedAt : null, purgedAt: typeof r.purgedAt === "string" ? r.purgedAt : null,
    views: n(r.views), teamsSeenCurrent: n(r.teamsSeenCurrent),
  };
}
export function toRoomsState(v: unknown): RoomsState | null {
  const r = obj(v);
  const ev = obj(r.event);
  if (typeof ev.id !== "string") return null;
  const limits = obj(r.limits);
  return {
    event: { id: ev.id, name: s(ev.name, 120) }, canEdit: r.canEdit === true,
    rooms: arr(r.rooms).map(toOrganiserRoom).filter((x): x is OrganiserRoom => x !== null),
    matches: arr(r.matches).map(obj).filter((m) => typeof m.id === "string").map((m) => ({ id: s(m.id, 80), stage: s(m.stage, 40), round: n(m.round), slot: n(m.slot), teamA: s(m.teamA, 80), teamB: s(m.teamB, 80) })),
    revealMax: n(limits.revealMaxMinutes) || 180, revealDefault: n(limits.revealDefaultMinutes) || 15, credentialMax: n(limits.credentialMax) || 40,
  };
}
export function toCaptainRoom(v: unknown): CaptainRoom | null {
  const r = obj(v);
  const ev = obj(r.event);
  if (typeof r.id !== "string" || typeof ev.id !== "string") return null;
  return { id: r.id.slice(0, 64), event: { id: ev.id, name: s(ev.name, 120) }, team: s(r.team, 80), label: s(r.label, 80), match: match(r.match), startsAt: s(r.startsAt, 40), revealAt: s(r.revealAt, 40), phase: phase(r.phase) };
}
export function toRevealed(v: unknown): RevealedRoom | null {
  const r = obj(v);
  if (typeof r.id !== "string" || typeof r.roomId !== "string" || typeof r.password !== "string") return null;
  return { id: r.id, label: s(r.label, 80), team: s(r.team, 80), startsAt: s(r.startsAt, 40), version: n(r.version), roomId: r.roomId.slice(0, 40), password: r.password.slice(0, 40) };
}
const toViews = (v: unknown): RoomView[] => arr(obj(v).views).map(obj).map((x) => ({ team: s(x.team, 80), version: n(x.version), viewedAt: s(x.viewedAt, 40) }));

const base = (eventId: string) => `/v3/events/${e(eventId)}/rooms`;
export const fetchRooms = (eventId: string) => map(v3Get<unknown>(base(eventId), { force: true, ttl: 0 }), toRoomsState);
export const createRoom = (eventId: string, body: unknown) => map(v3Post<unknown>(base(eventId), body), toOrganiserRoom);
export const updateRoom = (eventId: string, roomId: string, body: unknown) => map(v3Put<unknown>(`${base(eventId)}/${e(roomId)}`, body), toOrganiserRoom);
export const rotateRoom = (eventId: string, roomId: string, body: { password: string; roomId?: string }) => map(v3Post<unknown>(`${base(eventId)}/${e(roomId)}/rotate`, body), toOrganiserRoom);
export const deleteRoom = (eventId: string, roomId: string) => map(v3Del<unknown>(`${base(eventId)}/${e(roomId)}`), () => true as const);
export const fetchViews = (eventId: string, roomId: string) => map(v3Get<unknown>(`${base(eventId)}/${e(roomId)}/views`, { force: true, ttl: 0 }), toViews);

export const claimCaptain = (token: string, adult: boolean) => map(v3Post<unknown>("/v3/rooms/captain-claim", adult ? { token, adult: true } : { token }), (v) => ({ team: s(obj(v).team, 80) }));
export const fetchMyRooms = () => map(v3Get<unknown>("/v3/me/rooms", { force: true, ttl: 0 }), (v) => arr(obj(v).rooms).map(toCaptainRoom).filter((x): x is CaptainRoom => x !== null));
/** POST, so no cache anywhere keeps the answer; the server logs each successful reveal. */
export const revealRoom = (roomId: string) => map(v3Post<unknown>(`/v3/me/rooms/${e(roomId)}/reveal`), toRevealed);
