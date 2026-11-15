import { api } from "@/lib/api";
import { attempt, type V3Failure, type V3Result } from "@/features/shared/failure";
import { v3Get, v3Post, v3Put } from "@/features/shared/services/v3-api";
import { toEventLite, toEventLiteList, toOrganiserTournament, type EventLite } from "@/features/tournaments/services/organiser.adapter";
import type { OrganiserTournament, OwnedEventRow } from "@/features/tournaments/organiser/domain";

const e = encodeURIComponent;
const mapOk = async <A, B>(p: Promise<V3Result<A>>, f: (a: A) => B): Promise<V3Result<B>> => { const r = await p; return r.ok ? { ok: true, data: f(r.data) } : r; };
const unreadable: V3Failure = { kind: "error", status: 200 };
const tournament = (r: unknown): V3Result<OrganiserTournament> => { const t = toOrganiserTournament(r); return t ? { ok: true, data: t } : { ok: false, failure: unreadable }; };

/**
 * Is the tournament feature switched on? With the flag off EVERY tournament route answers 404, and a 404 on one event's tournament also
 * means "no tournament yet", so it cannot tell the two apart. The public list answers 200 (empty or not) when the flag is on and 404 when
 * it is off, so it is the probe.
 */
export const probeTournaments = (): Promise<V3Result<true>> => mapOk(v3Get<unknown>("/public/tournaments?limit=1", { force: true }), () => true as const);

/** One legacy event (name and the caller's role). */
export const fetchEvent = (eventId: string): Promise<V3Result<EventLite>> =>
  attempt(async () => { const ev = toEventLite(await api.get<unknown>(`/events/${e(eventId)}`, { retries: 1, ttl: 0, force: true })); if (!ev) throw Object.assign(new Error("event"), { status: 404 }); return ev; });

/** `status 404` here is "this event has no tournament page yet" (once the probe says the feature is on). */
export const fetchTournament = (eventId: string): Promise<V3Result<OrganiserTournament>> => v3Get<unknown>(`/v3/events/${e(eventId)}/tournament`, { force: true }).then((r) => (r.ok ? tournament(r.data) : r));
export const createTournament = (eventId: string, body: Record<string, unknown>): Promise<V3Result<OrganiserTournament>> => v3Post<unknown>(`/v3/events/${e(eventId)}/tournament`, body).then((r) => (r.ok ? tournament(r.data) : r));
export const updateTournament = (eventId: string, body: Record<string, unknown>): Promise<V3Result<OrganiserTournament>> => v3Put<unknown>(`/v3/events/${e(eventId)}/tournament`, body).then((r) => (r.ok ? tournament(r.data) : r));
export const moveTournament = (eventId: string, to: string): Promise<V3Result<OrganiserTournament>> => v3Post<unknown>(`/v3/events/${e(eventId)}/tournament/status`, { to }).then((r) => (r.ok ? tournament(r.data) : r));

/**
 * Slug hint. There is no "is this free" endpoint, so the only certain "taken" is a PUBLISHED tournament with that address
 * (`GET /public/tournaments/:slug` answers 200). Anything else is "unknown": a draft can hold it too, so the save is the final check.
 */
export const slugInUse = (slug: string): Promise<boolean> => v3Get<unknown>(`/public/tournaments/${e(slug)}`, { force: true }).then((r) => r.ok);

/** Statuses of the disputes on one tournament (organiser route), to explain why "completed" is blocked. */
export const fetchDisputeStatuses = (slug: string): Promise<V3Result<string[]>> =>
  mapOk(v3Get<unknown>(`/v3/tournaments/${e(slug)}/disputes`, { force: true }), (raw) => {
    const list = Array.isArray(raw) ? raw : ((raw as { items?: unknown } | null)?.items as unknown[] | undefined) ?? [];
    return list.map((d) => (d && typeof (d as { status?: unknown }).status === "string" ? (d as { status: string }).status : "")).filter(Boolean);
  });

/** Every event the person can change, each with the tournament built on it (404 = none yet). Capped so one screen is a bounded number of calls. */
export async function fetchOwnedEvents(cap = 30): Promise<V3Result<OwnedEventRow[]>> {
  const probe = await probeTournaments();
  if (!probe.ok) return probe;
  const list = await attempt(async () => toEventLiteList(await api.get<unknown>("/events", { retries: 1, ttl: 0, force: true })));
  if (!list.ok) return list;
  const mine = list.data.filter((ev) => ev.role === "owner" || ev.role === "editor").slice(0, cap);
  const rows = await Promise.all(mine.map(async (ev): Promise<OwnedEventRow> => {
    const t = await fetchTournament(ev.id);
    if (t.ok) return { ...ev, tournament: t.data, failed: false };
    return { ...ev, tournament: null, failed: t.failure.kind !== "unavailable" };
  }));
  return { ok: true, data: rows };
}
