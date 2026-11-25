/** Badge API calls (backend flag v3.achievements): the owner's list and the per-badge show/hide switch. Public badges arrive with the player page. */
import type { V3Result } from "@/features/shared/failure";
import { v3Get, v3Put } from "@/features/shared/services/v3-api";
import { toOwnBadges } from "@/features/badges/services/badges.adapter";

const map = async <A, B>(p: Promise<V3Result<A>>, f: (a: A) => B): Promise<V3Result<B>> => { const r = await p; return r.ok ? { ok: true, data: f(r.data) } : r; };
export const fetchMyBadges = () => map(v3Get<unknown>("/v3/me/badges", { force: true, ttl: 0 }), toOwnBadges);
export const putBadgeHidden = (badge: string, hidden: boolean) => map(v3Put<unknown>("/v3/me/badges/hidden", { badge, hidden }), toOwnBadges);
