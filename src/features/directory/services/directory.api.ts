/**
 * Directory reads (API.md section 11). At BUILD time `loadBuildDirectory` runs in Node through the shared client: 404 (flag off), an error or a bad payload
 * all give null, so the build never fails and /tournaments/ stays exactly as before. In the browser the island re-reads it with the chosen filters.
 */
import { api } from "@/lib/api";
import type { V3Result } from "@/features/shared/failure";
import { qs, v3Get, v3Put } from "@/features/shared/services/v3-api";
import { safeRegisterUrl, type DirectoryData, type DirectoryFilters, type DirectoryItem } from "@/features/directory/domain";

type R = Record<string, unknown>;
const obj = (v: unknown): R => (v && typeof v === "object" && !Array.isArray(v) ? (v as R) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const str = (v: unknown, d = ""): string => (typeof v === "string" ? v : d);
const strOrNull = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v : null);
const numOrNull = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
const SLUG = /^[a-z0-9-]{3,60}$/;

export function toItem(v: unknown): DirectoryItem | null {
  const o = obj(v), reg = obj(o.registration);
  const slug = str(o.slug);
  if (!SLUG.test(slug) || typeof o.title !== "string") return null;
  return {
    slug, title: o.title.slice(0, 120), game: str(o.game), format: str(o.format), status: str(o.status), summary: strOrNull(o.summary), venue: str(o.venue, "online"), city: strOrNull(o.city), state: strOrNull(o.state),
    startsAt: strOrNull(o.startsAt), endsAt: strOrNull(o.endsAt), maxTeams: numOrNull(o.maxTeams),
    registration: { open: reg.open === true, registered: numOrNull(reg.registered) ?? 0, spotsLeft: numOrNull(reg.spotsLeft) },
    registerUrl: safeRegisterUrl(o.registerUrl), pagePath: `/tournaments/${slug}/`,
  };
}
export function toDirectory(v: unknown): DirectoryData {
  const o = obj(v);
  return {
    items: arr(o.items).map(toItem).filter((x): x is DirectoryItem => x !== null),
    total: numOrNull(o.total) ?? 0,
    cities: arr(o.cities).map((c) => ({ city: str(obj(c).city), count: numOrNull(obj(c).count) ?? 0 })).filter((c) => c.city !== ""),
    games: arr(o.games).map((g) => ({ game: str(obj(g).game), count: numOrNull(obj(g).count) ?? 0 })).filter((g) => g.game !== ""),
  };
}

const BUILD_OPT = { retries: 0, timeout: 8000, ttl: 300000 } as const;
let cached: Promise<DirectoryData | null> | null = null;
/** Build time only. null = the directory is off (or the API is away): /tournaments/ keeps its earlier behaviour. */
export const loadBuildDirectory = (): Promise<DirectoryData | null> =>
  (cached ??= api.get<unknown>("/public/tournament-directory?limit=50", BUILD_OPT).then(toDirectory, () => null));

const map = async <A, B>(p: Promise<V3Result<A>>, f: (a: A) => B): Promise<V3Result<B>> => { const r = await p; return r.ok ? { ok: true, data: f(r.data) } : r; };
/** Browser: the live list with filters. */
export const fetchDirectory = (f: DirectoryFilters) => map(v3Get<unknown>(`/public/tournament-directory${qs({ game: f.game, city: f.city.trim(), limit: 50 })}`), toDirectory);

// ---- organiser opt-in (show the sign-up link on the directory card) ----
export interface DirectorySetting { signupPublic: boolean; listed: boolean; registrationOpen: boolean; signupFormOpen: boolean; linkShown: boolean }
const toSetting = (v: unknown): DirectorySetting => { const o = obj(v); return { signupPublic: o.signupPublic === true, listed: o.listed === true, registrationOpen: o.registrationOpen === true, signupFormOpen: o.signupFormOpen === true, linkShown: o.linkShown === true }; };
export const fetchSetting = (eventId: string) => map(v3Get<unknown>(`/v3/events/${encodeURIComponent(eventId)}/tournament/directory`, { force: true }), toSetting);
export const putSetting = (eventId: string, signupPublic: boolean) => map(v3Put<unknown>(`/v3/events/${encodeURIComponent(eventId)}/tournament/directory`, { signupPublic }), toSetting);
