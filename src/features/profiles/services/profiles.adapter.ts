/** API payloads (API.md section 9) to the screen shapes. Defensive: a missing or odd field becomes a safe default, never a crash. Pure. */
import { HIDEABLE, LINK_KINDS } from "@/features/profiles/domain";
import type {
  Achievement, BrRow, Certificate, Entry, GameLine, HideableField, LinkKind, MatchRow, OwnPlayerPage, OwnTeamPage, PageDetails, PlayerLink, PlayerPage, ProfileStats, TeamOnProfile, TeamPage,
  TeamPageSummary, TournamentRef, Visibility,
} from "@/features/profiles/domain";

type R = Record<string, unknown>;
const obj = (v: unknown): R => (v && typeof v === "object" && !Array.isArray(v) ? (v as R) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const str = (v: unknown, d = ""): string => (typeof v === "string" ? v : d);
const strOrNull = (v: unknown): string | null => (typeof v === "string" ? v : null);
const num = (v: unknown, d = 0): number => (typeof v === "number" && Number.isFinite(v) ? v : d);
const numOrNull = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
const strings = (v: unknown): string[] => arr(v).filter((x): x is string => typeof x === "string");
export const toVisibility = (v: unknown): Visibility => (v === "public" || v === "unlisted" ? v : "private");

const ref = (v: unknown): TournamentRef => { const o = obj(v); return { slug: str(o.slug), title: str(o.title) }; };
const tour = (v: unknown) => { const o = obj(v); return { ...ref(o), game: str(o.game), status: str(o.status), startsAt: strOrNull(o.startsAt), endsAt: strOrNull(o.endsAt) }; };

export function toMatch(v: unknown): MatchRow | null {
  const o = obj(v);
  const result = o.result === "win" || o.result === "loss" || o.result === "draw" ? o.result : null;
  if (!result) return null;
  return { tournament: ref(o.tournament), team: str(o.team), stage: str(o.stage), round: num(o.round), opponent: str(o.opponent), scoreFor: numOrNull(o.scoreFor), scoreAgainst: numOrNull(o.scoreAgainst), result, corrected: o.corrected === true, playedAt: strOrNull(o.playedAt), hidden: o.hidden === true };
}
export function toBr(v: unknown): BrRow {
  const o = obj(v);
  return { tournament: ref(o.tournament), team: str(o.team), matchNo: num(o.matchNo), placement: num(o.placement), kills: num(o.kills), corrected: o.corrected === true, hidden: o.hidden === true };
}
export function toCertificate(v: unknown): Certificate | null {
  const o = obj(v);
  if (typeof o.id !== "string") return null;
  const r = o.record ? obj(o.record) : null;
  const b = o.battleRoyale ? obj(o.battleRoyale) : null;
  const t = obj(o.tournament);
  return {
    id: o.id, tournament: { ...ref(t), game: str(t.game) }, team: str(o.team), completedOn: strOrNull(o.completedOn),
    record: r ? { played: num(r.played), wins: num(r.wins), draws: num(r.draws), losses: num(r.losses) } : null,
    battleRoyale: b ? { matches: num(b.matches), wins: num(b.wins), bestPlacement: num(b.bestPlacement), kills: num(b.kills) } : null,
    hidden: o.hidden === true,
  };
}
const toEntry = (v: unknown): Entry => { const o = obj(v); return { itemKey: str(o.itemKey), tournament: tour(o.tournament), team: str(o.team), hidden: o.hidden === true }; };
const toTeamOn = (v: unknown): TeamOnProfile => { const o = obj(v); return { name: str(o.name), games: strings(o.games), tournaments: num(o.tournaments), teamPageSlug: strOrNull(o.teamPageSlug) }; };
function toStats(v: unknown): ProfileStats | null {
  if (!v || typeof v !== "object") return null;
  const o = obj(v), m = obj(o.matches), b = obj(o.battleRoyale);
  return { tournaments: num(o.tournaments), matches: { played: num(m.played), wins: num(m.wins), losses: num(m.losses), draws: num(m.draws) }, battleRoyale: { matches: num(b.matches), wins: num(b.wins), kills: num(b.kills), bestPlacement: numOrNull(b.bestPlacement) } };
}
const toGame = (v: unknown): GameLine => { const o = obj(v); return { game: str(o.game), inGameName: str(o.inGameName), rankCode: strOrNull(o.rankCode), rankOrdinal: numOrNull(o.rankOrdinal), roles: strings(o.roles) }; };

const results = (o: R) => ({
  matches: arr(o.matches).map(toMatch).filter((x): x is MatchRow => x !== null),
  battleRoyale: arr(o.battleRoyale).map(toBr),
  certificates: arr(o.certificates).map(toCertificate).filter((x): x is Certificate => x !== null),
});

/**
 * A link the page may render: http or https only, parsed by the browser's URL parser (so "javascript:", "data:" and odd encodings never pass),
 * no user name or password. The server already allowlists the hosts; this is the second lock on the door.
 */
export function safeHref(v: unknown): string | null {
  if (typeof v !== "string" || v.length > 200) return null;
  try {
    const u = new URL(v);
    if ((u.protocol !== "https:" && u.protocol !== "http:") || u.username || u.password) return null;
    return u.toString();
  } catch { return null; }
}
const KINDS = new Set<string>(LINK_KINDS.map((k) => k.value));
export const toLinks = (v: unknown): PlayerLink[] => arr(v).map((x) => { const o = obj(x); const url = safeHref(o.url); return url && KINDS.has(str(o.kind)) ? { kind: str(o.kind) as LinkKind, url } : null; }).filter((x): x is PlayerLink => x !== null).slice(0, 6);
export const toAchievements = (v: unknown): Achievement[] => arr(v).map((x) => { const o = obj(x); const t = str(o.title).slice(0, 80); return t ? { title: t, year: numOrNull(o.year) } : null; }).filter((x): x is Achievement => x !== null).slice(0, 8);
const FIELDS = new Set<string>(HIDEABLE.map((h) => h.value));
const toHidden = (v: unknown): HideableField[] => strings(v).filter((x): x is HideableField => FIELDS.has(x));

export function toPlayerPage(v: unknown): PlayerPage | null {
  const o = obj(v);
  if (typeof o.handle !== "string" || !o.handle) return null;
  return {
    slug: typeof o.slug === "string" && o.slug ? o.slug : null, handle: o.handle, bio: strOrNull(o.bio), city: strOrNull(o.city), state: strOrNull(o.state), languages: strings(o.languages), games: arr(o.games).map(toGame),
    stats: toStats(o.stats), teamName: strOrNull(o.teamName), links: toLinks(o.links), achievements: toAchievements(o.achievements),
    visibility: toVisibility(o.visibility), indexable: o.indexable === true, teams: arr(o.teams).map(toTeamOn), updatedAt: strOrNull(o.updatedAt), ...results(o),
  };
}

const toDetails = (v: unknown): PageDetails => { const o = obj(v); return { teamName: strOrNull(o.teamName), links: toLinks(o.links), achievements: toAchievements(o.achievements), hiddenFields: toHidden(o.hiddenFields), searchOptIn: o.searchOptIn === true }; };
/** "/p/?k=<22 characters>" only: anything else from the server is ignored, so the QR can never hold another address. */
export const toCardPath = (v: unknown): string | null => (typeof v === "string" && /^\/p\/\?k=[A-Za-z0-9_-]{22}$/.test(v) ? v : null);

export function toTeamPage(v: unknown): TeamPage | null {
  const o = obj(v);
  if (typeof o.slug !== "string" || typeof o.name !== "string") return null;
  return {
    slug: o.slug, name: o.name, blurb: str(o.blurb), links: strings(o.links).filter((l) => l.startsWith("https://")), visibility: toVisibility(o.visibility), indexable: o.indexable === true,
    tournaments: arr(o.tournaments).map((x) => { const t = obj(x); return { tournament: tour(t.tournament), team: str(t.team) }; }), updatedAt: strOrNull(o.updatedAt), ...results(o),
  };
}

const ownBase = (o: R) => ({
  slug: str(o.slug), visibility: toVisibility(o.visibility), path: str(o.path), indexable: o.indexable === true, indexBlockers: strings(o.indexBlockers),
  hiddenByModeration: o.hiddenByModeration === true, entries: arr(o.entries).map(toEntry), ...results(o),
});
export function toOwnPlayerPage(v: unknown): OwnPlayerPage | null {
  const p = obj(v).page;
  if (!p || typeof p !== "object") return null;
  const o = obj(p);
  const vis = toVisibility(o.visibility);
  const cardPath = toCardPath(o.cardPath);
  const path = vis === "public" ? str(o.path) || null : vis === "unlisted" ? toCardPath(o.path) : null;
  return { ...ownBase(o), path, cardPath, cardCreatedAt: strOrNull(o.cardCreatedAt), details: toDetails(o.details), teams: arr(o.teams).map(toTeamOn) };
}
export function toOwnTeamPage(v: unknown): OwnTeamPage | null {
  const o = obj(obj(v).page);
  if (typeof o.id !== "string") return null;
  return { ...ownBase(o), id: o.id, name: str(o.name), claimable: arr(o.claimable).map((x) => { const c = obj(x); return { tournament: ref(c.tournament), team: str(c.team) }; }) };
}
export function toTeamPageList(v: unknown): { items: TeamPageSummary[]; consentStatement: string } {
  const o = obj(v);
  return {
    consentStatement: str(o.consentStatement, "I have the team captain's permission to publish this page"),
    items: arr(o.items).map((x) => {
      const t = obj(x);
      return { id: str(t.id), slug: str(t.slug), name: str(t.name), visibility: toVisibility(t.visibility), path: str(t.path), indexable: t.indexable === true, indexBlockers: strings(t.indexBlockers), hiddenByModeration: t.hiddenByModeration === true, tournaments: num(t.tournaments), certificates: num(t.certificates) };
    }).filter((t) => t.id !== ""),
  };
}
