/** API shape -> domain for the resume. Fixed field lists: nothing the server adds (ids, emails, consent times on the public read) reaches a component. Pure. */
import type { GameRow, OwnProfile, OwnResume, PublicProfile, Visibility } from "@/features/resume/domain";

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : {});
const str = (v: unknown, max = 2000): string | null => (typeof v === "string" && v.trim() ? v.slice(0, max) : null);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const vis = (v: unknown): Visibility => (v === "public" || v === "unlisted" ? v : "private");

export function toGame(raw: unknown): GameRow | null {
  const o = obj(raw), game = str(o.game, 40), name = str(o.inGameName, 40);
  if (!game || !name) return null;
  return { game, inGameName: name, rankCode: str(o.rankCode, 24) ?? "", rankOrdinal: typeof o.rankOrdinal === "number" ? Math.max(0, Math.min(100, Math.floor(o.rankOrdinal))) : 0, roles: arr(o.roles).filter((r): r is string => typeof r === "string").slice(0, 4) };
}
const games = (v: unknown): GameRow[] => arr(v).map(toGame).filter((g): g is GameRow => g !== null);

export function toOwnResume(raw: unknown): OwnResume {
  const o = obj(raw), p = obj(o.profile);
  const slug = str(p.slug, 60), handle = str(p.handle, 40);
  const profile: OwnProfile | null = slug && handle ? {
    slug, handle, bio: str(p.bio, 400), city: str(p.city, 60), state: str(p.state, 60), languages: arr(p.languages).filter((l): l is string => typeof l === "string").slice(0, 6),
    visibility: vis(p.visibility), games: games(p.games), updatedAt: str(p.updatedAt, 40),
  } : null;
  // The profile carries its own copies of the two timestamps; the top level wins when both exist.
  return { profile, adultConfirmedAt: str(o.adultConfirmedAt, 40) ?? str(p.adultConfirmedAt, 40), resumeConsentAt: str(o.resumeConsentAt, 40) ?? str(p.resumeConsentAt, 40) };
}

export function toPublicProfile(raw: unknown): PublicProfile | null {
  const o = obj(raw), slug = str(o.slug, 60), handle = str(o.handle, 40);
  if (!slug || !handle) return null;
  return { slug, handle, bio: str(o.bio, 400), city: str(o.city, 60), state: str(o.state, 60), languages: arr(o.languages).filter((l): l is string => typeof l === "string").slice(0, 6), games: games(o.games), updatedAt: str(o.updatedAt, 40) };
}
