/** API shape -> domain for the organiser routes. A fixed field list: nothing the server adds later can reach a component. Pure. */
import type { Venue } from "@/features/tournaments/domain";
import type { OrganiserTournament } from "@/features/tournaments/organiser/domain";

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : {});
const str = (v: unknown, max = 20000): string | null => (typeof v === "string" && v.trim() ? v.slice(0, max) : null);
const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

export function toOrganiserTournament(raw: unknown): OrganiserTournament | null {
  const o = obj(raw);
  const id = str(o.id, 80), eventId = str(o.eventId, 80), slug = str(o.slug, 80), title = str(o.title, 200);
  if (!id || !eventId || !slug || !title) return null;
  const venue: Venue = o.venue === "offline" || o.venue === "hybrid" ? o.venue : "online";
  return {
    id, eventId, slug, title, game: str(o.game, 40) ?? "other", format: str(o.format, 40) ?? "", status: str(o.status, 40) ?? "draft", venue,
    city: str(o.city, 80), state: str(o.state, 80), summary: str(o.summary, 400), description: str(o.description, 9000), rules: str(o.rules, 9000),
    maxTeams: num(o.maxTeams), startsAt: str(o.startsAt, 40), endsAt: str(o.endsAt, 40), publishedAt: str(o.publishedAt, 40),
    seoReady: o.seoReady === true, seoFailures: (Array.isArray(o.seoFailures) ? o.seoFailures : []).filter((x): x is string => typeof x === "string").slice(0, 12), updatedAt: str(o.updatedAt, 40),
  };
}

/** The slice of a legacy event (`GET /events`) the organiser list needs. */
export interface EventLite { id: string; name: string; game: string; date: string; role: string }
export function toEventLite(raw: unknown): EventLite | null {
  const o = obj(raw), id = str(o.id, 80);
  return id ? { id, name: str(o.name, 160) ?? "Untitled event", game: str(o.game, 60) ?? "", date: str(o.date, 40) ?? "", role: str(o.role, 20) ?? "" } : null;
}
export const toEventLiteList = (raw: unknown): EventLite[] => (Array.isArray(raw) ? raw : []).map(toEventLite).filter((e): e is EventLite => e !== null);
