/** Phase 4b API calls: the scrim manager (API.md section 13). Roster, waitlist offers, notices and recurring daily scrims. */
import type { V3Result } from "@/features/shared/failure";
import { v3Del, v3Get, v3Post, v3Put } from "@/features/shared/services/v3-api";

type R = Record<string, unknown>;
const obj = (v: unknown): R => (v && typeof v === "object" && !Array.isArray(v) ? (v as R) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const str = (v: unknown, d = ""): string => (typeof v === "string" ? v : d);
const strOrNull = (v: unknown): string | null => (typeof v === "string" ? v : null);
const num = (v: unknown, d = 0): number => (typeof v === "number" && Number.isFinite(v) ? v : d);
const map = async <A, B>(p: Promise<V3Result<A>>, f: (a: A) => B): Promise<V3Result<B>> => { const r = await p; return r.ok ? { ok: true, data: f(r.data) } : r; };
const enc = encodeURIComponent;

export interface Seat { slotNo: number; teamName: string; you: boolean; requestId: string | null; contact: string | null }
export interface WaitRow { position: number; teamName: string; status: string; offerExpiresAt: string | null; you: boolean }
export interface Roster { role: "poster" | "team"; slotsTotal: number; status: string; seats: Seat[]; openSeats: number[]; waitlist: WaitRow[] }
export interface MyEntry { id: string; slotId: string; status: string; position: number | null; offerExpiresAt: string | null; game: string; startsAt: string; teamName: string; myTeamName: string; slotStatus: string }
export interface Notice { id: string; kind: string; slotId: string | null; game: string | null; startsAt: string | null; teamName: string | null; read: boolean; createdAt: string | null }
export interface ScheduleDay { day: string; skipped: boolean; slotId: string | null; startsAt: string | null; status: string | null; confirmed: number | null; slots: number | null }
export interface Schedule { id: string; teamName: string; game: string; timeOfDay: string; daysAhead: number; region: string; slots: number; contact: string; active: boolean; days: ScheduleDay[] }

export function toRoster(v: unknown): Roster {
  const o = obj(v), s = obj(o.slot);
  return {
    role: o.role === "poster" ? "poster" : "team", slotsTotal: num(s.slotsTotal, 1), status: str(s.status),
    seats: arr(o.seats).map((x) => { const q = obj(x); return { slotNo: num(q.slotNo), teamName: str(q.teamName, "Team"), you: q.you === true, requestId: strOrNull(q.requestId), contact: strOrNull(q.contact) }; }),
    openSeats: arr(o.openSeats).map((n) => num(n)).filter((n) => n > 0),
    waitlist: arr(o.waitlist).map((x) => { const q = obj(x); return { position: num(q.position), teamName: str(q.teamName, "Team"), status: str(q.status), offerExpiresAt: strOrNull(q.offerExpiresAt), you: q.you === true }; }),
  };
}
export const toEntry = (v: unknown): MyEntry => { const o = obj(v); return { id: str(o.id), slotId: str(o.slotId), status: str(o.status), position: typeof o.position === "number" ? o.position : null, offerExpiresAt: strOrNull(o.offerExpiresAt), game: str(o.game), startsAt: str(o.startsAt), teamName: str(o.teamName, "Team"), myTeamName: str(o.myTeamName, "Team"), slotStatus: str(o.slotStatus) }; };
export const toNotice = (v: unknown): Notice => { const o = obj(v); return { id: str(o.id), kind: str(o.kind), slotId: strOrNull(o.slotId), game: strOrNull(o.game), startsAt: strOrNull(o.startsAt), teamName: strOrNull(o.teamName), read: o.read === true, createdAt: strOrNull(o.createdAt) }; };
export function toSchedule(v: unknown): Schedule {
  const o = obj(v);
  return {
    id: str(o.id), teamName: str(o.teamName, "Team"), game: str(o.game), timeOfDay: str(o.timeOfDay), daysAhead: num(o.daysAhead, 1), region: str(o.region), slots: num(o.slots, 1), contact: str(o.contact), active: o.active === true,
    days: arr(o.days).map((x) => { const d = obj(x); return { day: str(d.day), skipped: d.skipped === true, slotId: strOrNull(d.slotId), startsAt: strOrNull(d.startsAt), status: strOrNull(d.status), confirmed: typeof d.confirmed === "number" ? d.confirmed : null, slots: typeof d.slots === "number" ? d.slots : null }; }),
  };
}

export const fetchRoster = (slotId: string) => map(v3Get<unknown>(`/v3/scrims/${enc(slotId)}/roster`, { force: true }), toRoster);
export const editSlot = (slotId: string, body: { slots?: number; skillNote?: string }) => map(v3Put<unknown>(`/v3/scrims/${enc(slotId)}`, body), toRoster);
export const removeTeam = (requestId: string) => v3Post<unknown>(`/v3/scrim-requests/${enc(requestId)}/remove`, {});
export const joinWaitlist = (slotId: string, body: { teamProfileId: string; message: string; contact: string }) => v3Post<{ id: string; status: string }>(`/v3/scrims/${enc(slotId)}/waitlist`, body);
export const fetchMyWaitlist = () => map(v3Get<unknown>("/v3/me/scrim-waitlist", { force: true }), (v) => arr(obj(v).items).map(toEntry));
export const answerOffer = (entryId: string, action: "accept" | "decline" | "leave") => v3Post<unknown>(`/v3/scrim-waitlist/${enc(entryId)}/${action}`, {});
export const fetchNotices = () => map(v3Get<unknown>("/v3/me/scrim-notifications", { force: true }), (v) => ({ items: arr(obj(v).items).map(toNotice), unread: num(obj(v).unread) }));
export const readNotices = () => v3Post<unknown>("/v3/me/scrim-notifications/read", {});
export const fetchSchedules = () => map(v3Get<unknown>("/v3/me/scrim-schedules", { force: true }), (v) => arr(obj(v).items).map(toSchedule));
export const createSchedule = (body: Record<string, unknown>) => map(v3Post<unknown>("/v3/scrim-schedules", body), toSchedule);
export const updateSchedule = (id: string, body: Record<string, unknown>) => map(v3Put<unknown>(`/v3/scrim-schedules/${enc(id)}`, body), toSchedule);
export const deleteSchedule = (id: string) => v3Del<unknown>(`/v3/scrim-schedules/${enc(id)}`);
export const skipDay = (id: string, day: string) => map(v3Post<unknown>(`/v3/scrim-schedules/${enc(id)}/days/${enc(day)}/skip`, {}), toSchedule);
