/** Browser-side calls for the calendar and the organiser trust score, on the one shared client (`@/lib/api` through the v3 helpers). */
import type { V3Result } from "@/features/shared/failure";
import { qs, v3Del, v3Get, v3Post, v3Put } from "@/features/shared/services/v3-api";
import { toCalendarPage, toMyCalendar, toMyTrust, toOwnRating, toTrustSummary } from "@/features/community/services/community.adapter";
import type { CalendarPage, MyCalendar, MyTrust, OwnEntry, OwnRating, RatingBody, TrustSummary } from "@/features/community/domain";
export type { RatingBody };

const map = async <A, B>(p: Promise<V3Result<A>>, f: (a: A) => B): Promise<V3Result<B>> => { const r = await p; return r.ok ? { ok: true, data: f(r.data) } : r; };

export const fetchCalendar = (q: { from?: string; to?: string; game?: string; city?: string } = {}): Promise<V3Result<CalendarPage>> =>
  map(v3Get<unknown>(`/public/calendar${qs(q)}`, { ttl: 60_000 }), toCalendarPage);

export const fetchMyCalendar = (): Promise<V3Result<MyCalendar>> => map(v3Get<unknown>("/v3/me/calendar", { force: true }), toMyCalendar);

export interface EntryBody { title: string; game: string; city: string; online: boolean; startsOn: string; endsOn: string; registrationUrl: string | null; tournamentSlug: string | null; status?: "listed" | "cancelled" }
type SaveOut = { entry: OwnEntry | null; urlStripped: boolean };
const toSave = (r: unknown): SaveOut => {
  const o = (r ?? {}) as Record<string, unknown>;
  const mine = toMyCalendar({ items: [o.entry] }).items[0] ?? null;
  return { entry: mine, urlStripped: o.urlStripped === true };
};
export const createEntry = (orgId: string, body: EntryBody) => map(v3Post<unknown>(`/v3/orgs/${encodeURIComponent(orgId)}/calendar`, body), toSave);
export const updateEntry = (id: string, body: EntryBody) => map(v3Put<unknown>(`/v3/calendar/${encodeURIComponent(id)}`, body), toSave);
export const deleteEntry = (id: string) => v3Del<unknown>(`/v3/calendar/${encodeURIComponent(id)}`);

export const fetchTrust = (slug: string, force = false): Promise<V3Result<TrustSummary | null>> =>
  map(v3Get<unknown>(`/public/tournaments/${encodeURIComponent(slug)}/trust`, { ttl: 30_000, force }), toTrustSummary);
export const fetchMyTrust = (slug: string): Promise<V3Result<MyTrust>> => map(v3Get<unknown>(`/v3/tournaments/${encodeURIComponent(slug)}/trust/me`, { force: true }), toMyTrust);

export const submitRating = (slug: string, body: RatingBody): Promise<V3Result<OwnRating | null>> =>
  map(v3Post<unknown>(`/v3/tournaments/${encodeURIComponent(slug)}/trust/ratings`, body), toOwnRating);
export const deleteRating = (id: string) => v3Del<unknown>(`/v3/trust/ratings/${encodeURIComponent(id)}`);
export const replyTo = (id: string, text: string) => v3Post<unknown>(`/v3/trust/ratings/${encodeURIComponent(id)}/reply`, { text });
export const reportReview = (id: string, target: "review" | "reply", reason: string, note: string) =>
  v3Post<unknown>(`/v3/trust/ratings/${encodeURIComponent(id)}/report`, { target, reason, ...(note.trim() ? { note: note.trim() } : {}) });
