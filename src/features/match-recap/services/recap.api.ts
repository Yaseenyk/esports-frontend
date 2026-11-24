import type { V3Failure, V3Result } from "@/features/shared/failure";
import { v3Get } from "@/features/shared/services/v3-api";
import type { BrFact, H2hFact, RecapFacts, Scoring } from "@/features/match-recap/recap";

/** Recap facts (flag v3.recaps), read field by field. A 404 means the feature is off (or the event is not yours): the screen shows nothing new. */
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const s = (v: unknown, max = 120): string => (typeof v === "string" ? v.slice(0, max) : "");
const int = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) ? v : 0);
const intOrNull = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

export function toRecapFacts(v: unknown): RecapFacts | null {
  const r = obj(v);
  const ev = obj(r.event);
  if (typeof ev.id !== "string") return null;
  const sc = obj(r.scoring);
  const scoring: Scoring | null = Array.isArray(sc.scale)
    ? { title: s(sc.title, 80), scale: arr(sc.scale).filter((x): x is number => typeof x === "number" && Number.isFinite(x)).slice(0, 100), perKill: int(sc.perKill), winPts: int(sc.winPts), drawPts: int(sc.drawPts), lossPts: int(sc.lossPts) }
    : null;
  const battleRoyale: BrFact[] = arr(r.battleRoyale).map(obj).filter((x) => typeof x.team === "string" && typeof x.matchNo === "number")
    .map((x) => ({ matchNo: int(x.matchNo), team: s(x.team, 60), placement: int(x.placement), kills: int(x.kills), corrected: x.corrected === true }));
  const matches: H2hFact[] = arr(r.matches).map(obj).filter((x) => typeof x.id === "string")
    .map((x) => ({ id: s(x.id, 80), stage: s(x.stage, 40), round: int(x.round), slot: int(x.slot), teamA: s(x.teamA, 60), teamB: s(x.teamB, 60), status: s(x.status, 20), scoreA: intOrNull(x.scoreA), scoreB: intOrNull(x.scoreB), winner: typeof x.winner === "string" ? x.winner : null, corrected: x.corrected === true }));
  const publicPath = typeof r.publicPath === "string" && /^\/tournaments\/[a-z0-9-]{1,80}\/$/.test(r.publicPath) ? r.publicPath : null;
  return { event: { id: ev.id, name: s(ev.name), game: s(ev.game, 40) }, publicPath, scoring, matches, battleRoyale };
}

const unreadable: V3Failure = { kind: "error", status: 200 };
export async function fetchRecapFacts(eventId: string): Promise<V3Result<RecapFacts>> {
  const r = await v3Get<unknown>(`/v3/events/${encodeURIComponent(eventId)}/recap`, { force: true, ttl: 0 });
  if (!r.ok) return r;
  const f = toRecapFacts(r.data);
  return f ? { ok: true, data: f } : { ok: false, failure: unreadable };
}
