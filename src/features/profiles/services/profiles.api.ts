/** Phase 3 API calls (API.md section 9). The only place this feature talks to the network, through the shared client. */
import type { V3Result } from "@/features/shared/failure";
import { v3Get, v3Post, v3Put } from "@/features/shared/services/v3-api";
import { toOwnPlayerPage, toOwnTeamPage, toPlayerPage, toTeamPage, toTeamPageList } from "@/features/profiles/services/profiles.adapter";
import type { DetailsPatch, Visibility } from "@/features/profiles/domain";
export type { DetailsPatch };

const map = async <A, B>(p: Promise<V3Result<A>>, f: (a: A) => B): Promise<V3Result<B>> => { const r = await p; return r.ok ? { ok: true, data: f(r.data) } : r; };
const enc = encodeURIComponent;

// A withdrawn consent or a page made private must show at once: public reads always skip the cache.
export const fetchPlayerPage = (slug: string) => map(v3Get<unknown>(`/public/profiles/players/${enc(slug)}`, { force: true }), toPlayerPage);
/** The page a player card's QR opens. The token goes in the path of an API call, never into analytics or a referrer (the page strips it from the address bar). */
export const fetchPlayerByCard = (token: string) => map(v3Get<unknown>(`/public/profiles/cards/${enc(token)}`, { force: true, ttl: 0 }), toPlayerPage);
export const fetchTeamPage = (slug: string) => map(v3Get<unknown>(`/public/profiles/teams/${enc(slug)}`, { force: true }), toTeamPage);

export const fetchMyPlayerPage = () => map(v3Get<unknown>("/v3/me/player-page", { force: true }), toOwnPlayerPage);
export const putPlayerVisibility = (visibility: Visibility) => map(v3Put<unknown>("/v3/me/player-page/visibility", { visibility }), toOwnPlayerPage);
export const putPageDetails = (patch: DetailsPatch) => map(v3Put<unknown>("/v3/me/player-page/details", patch), toOwnPlayerPage);
export const postCardLink = () => map(v3Post<unknown>("/v3/me/player-page/card-link", {}), toOwnPlayerPage);
export const postCardReset = () => map(v3Post<unknown>("/v3/me/player-page/card-link/reset", {}), toOwnPlayerPage);
export const postCardReport = (token: string, reason: string, note: string) =>
  v3Post<{ ok: boolean }>(`/v3/profiles/cards/${enc(token)}/report`, { reason, ...(note.trim() ? { note: note.trim().slice(0, 200) } : {}) });
export const putPlayerHidden = (itemKey: string, hidden: boolean) => map(v3Put<unknown>("/v3/me/player-page/hidden", { itemKey, hidden }), toOwnPlayerPage);

export const fetchMyTeamPages = () => map(v3Get<unknown>("/v3/me/team-pages", { force: true }), toTeamPageList);
export const fetchMyTeamPage = (id: string) => map(v3Get<unknown>(`/v3/me/team-pages/${enc(id)}`, { force: true }), toOwnTeamPage);
export const putTeamVisibility = (id: string, visibility: Visibility, consent: boolean) => map(v3Put<unknown>(`/v3/me/team-pages/${enc(id)}/visibility`, { visibility, ...(consent ? { consent: true } : {}) }), toOwnTeamPage);
export const postTeamClaim = (id: string, tournamentSlug: string, team: string) => map(v3Post<unknown>(`/v3/me/team-pages/${enc(id)}/claims`, { tournamentSlug, team }), toOwnTeamPage);
export const putTeamHidden = (id: string, itemKey: string, hidden: boolean) => map(v3Put<unknown>(`/v3/me/team-pages/${enc(id)}/hidden`, { itemKey, hidden }), toOwnTeamPage);

export const postReport = (kind: "players" | "teams", slug: string, reason: string, note: string) =>
  v3Post<{ ok: boolean }>(`/v3/profiles/${kind}/${enc(slug)}/report`, { reason, ...(note.trim() ? { note: note.trim().slice(0, 200) } : {}) });
