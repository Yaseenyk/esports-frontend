/**
 * API shape -> domain. The ONLY place a public tournament payload is read. It copies a fixed list of fields and nothing else, so a field the
 * server adds later (or sends by mistake: ids, emails, captain contacts) can never reach a component. Pure.
 */
import type { GuardSource } from "@/features/tournaments/seo/thin-page-guard";
import type { BrResult, LiveStatus, MatchResult, ScheduleRow, TournamentCard, TournamentDetail, Venue } from "@/features/tournaments/domain";

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : {});
const str = (v: unknown, max = 20000): string | null => (typeof v === "string" && v.trim() ? v.slice(0, max) : null);
const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
const int0 = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const venueOf = (v: unknown): Venue | null => (v === "online" || v === "offline" || v === "hybrid" ? v : null);

export function toCard(raw: unknown): TournamentCard | null {
  const o = obj(raw);
  const slug = str(o.slug, 80), title = str(o.title, 200);
  if (!slug || !title || !/^[a-z0-9-]+$/.test(slug)) return null;
  return {
    slug, title, game: str(o.game, 40) ?? "other", format: str(o.format, 40) ?? "", status: str(o.status, 40) ?? "published", summary: str(o.summary, 400), venue: venueOf(o.venue),
    city: str(o.city, 80), state: str(o.state, 80), startsAt: str(o.startsAt, 40), endsAt: str(o.endsAt, 40), maxTeams: num(o.maxTeams), publishedAt: str(o.publishedAt, 40), seoReady: o.seoReady === true,
  };
}

export function toCardList(raw: unknown): TournamentCard[] {
  return arr(obj(raw).items).map(toCard).filter((c): c is TournamentCard => c !== null);
}

export function toDetail(raw: unknown): TournamentDetail | null {
  const o = obj(raw);
  const base = toCard(o.tournament);
  if (!base) return null;
  const t = obj(o.tournament), reg = obj(o.registration), res = obj(o.results);
  return {
    ...base, description: str(t.description), rules: str(t.rules),
    registration: { open: reg.open === true, registered: int0(reg.registered), approved: int0(reg.approved), spotsLeft: num(reg.spotsLeft) },
    teams: arr(o.teams).map((x) => ({ name: str(obj(x).name, 80) ?? "", teamSlug: str(obj(x).teamSlug, 80) ?? "" })).filter((x) => x.name && x.teamSlug),
    schedule: arr(o.schedule).map((x) => { const r = obj(x); return { stage: str(r.stage, 40) ?? "main", round: num(r.round), slot: num(r.slot), teamA: str(r.teamA, 80) ?? "To be decided", teamB: str(r.teamB, 80) ?? "To be decided", startsAt: str(r.startsAt, 40), status: str(r.status, 30) ?? "scheduled" }; }),
    results: {
      matches: arr(res.matches).map((x) => { const r = obj(x); return { stage: str(r.stage, 40) ?? "main", round: num(r.round), slot: num(r.slot), teamA: str(r.teamA, 80) ?? "", teamB: str(r.teamB, 80) ?? "", status: str(r.status, 30) ?? "finished", scoreA: num(r.scoreA), scoreB: num(r.scoreB), winner: r.winner === "a" || r.winner === "b" ? r.winner : null, corrected: r.corrected === true }; }),
      battleRoyale: arr(res.battleRoyale).map((x) => { const r = obj(x), og = obj(r.original); return { matchNo: int0(r.matchNo), team: str(r.team, 80) ?? "", placement: int0(r.placement), kills: int0(r.kills), corrected: r.corrected === true, original: r.original ? { placement: int0(og.placement), kills: int0(og.kills) } : null }; }),
    },
    hasResults: o.hasResults === true,
  };
}

export function toLive(raw: unknown): LiveStatus | null {
  const o = obj(raw);
  const slug = str(o.slug, 80);
  return slug ? { slug, status: str(o.status, 40) ?? "", registered: int0(o.registered), spotsLeft: num(o.spotsLeft), open: o.open === true } : null;
}

/** What the thin-page guard needs from a detail. */
export const guardSource = (d: TournamentDetail): GuardSource => ({
  slug: d.slug, title: d.title, summary: d.summary, description: d.description, startsAt: d.startsAt, venue: d.venue, city: d.city, status: d.status, hasResults: d.hasResults, publishedAt: d.publishedAt, apiSeoReady: d.seoReady,
});
