import { v3Del, v3Get, v3Post, v3Put } from "@/features/shared/services/v3-api";
import type { V3Result } from "@/features/shared/failure";
import { toOwnResume, toPublicProfile } from "@/features/resume/services/resume.adapter";
import type { PublicProfile } from "@/features/resume/domain";

const map = async <A, B>(p: Promise<V3Result<A>>, f: (a: A) => B): Promise<V3Result<B>> => { const r = await p; return r.ok ? { ok: true, data: f(r.data) } : r; };

export const fetchOwnResume = () => map(v3Get<unknown>("/v3/me/profile", { force: true }), toOwnResume);
export const saveProfile = (body: Record<string, unknown>) => v3Put<unknown>("/v3/me/profile", body);
export const deleteProfile = () => v3Del<unknown>("/v3/me/profile");
export const saveGame = (game: string, body: Record<string, unknown>) => v3Put<unknown>(`/v3/me/games/${encodeURIComponent(game)}`, body);
export const deleteGame = (game: string) => v3Del<unknown>(`/v3/me/games/${encodeURIComponent(game)}`);
export const giveConsent = () => v3Post<unknown>("/v3/me/resume-consent", { consent: true });
export const withdrawConsent = () => v3Del<unknown>("/v3/me/resume-consent");
export const fetchPublicPlayer = (slug: string) => map(v3Get<unknown>(`/public/players/${encodeURIComponent(slug)}`, { force: true, ttl: 0 }), (r): PublicProfile | null => toPublicProfile(r));
