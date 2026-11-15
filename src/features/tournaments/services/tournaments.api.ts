import { api } from "@/lib/api";
import { toCardList, toDetail, toLive } from "@/features/tournaments/services/tournament.adapter";
import type { LiveStatus, TournamentCard, TournamentDetail } from "@/features/tournaments/domain";
import { attempt, type V3Result } from "@/features/shared/services/result";

/**
 * Public tournament reads. At BUILD time these run in Node through the same client (`@/lib/api`); any failure (404 while the flag is off, a
 * network error, a bad payload) resolves to `null`/empty so the build never fails because the API is away.
 */
const BUILD_OPT = { retries: 0, timeout: 8000, ttl: 300000 } as const;

export async function fetchPublicList(limit = 50): Promise<TournamentCard[] | null> {
  try { return toCardList(await api.get<unknown>(`/public/tournaments?limit=${limit}`, BUILD_OPT)); } catch { return null; }
}

export async function fetchPublicDetail(slug: string): Promise<TournamentDetail | null> {
  try { return toDetail(await api.get<unknown>(`/public/tournaments/${encodeURIComponent(slug)}`, BUILD_OPT)); } catch { return null; }
}

/** Browser side: the live registration count for the island on the tournament page. */
export const fetchLive = (slug: string): Promise<V3Result<LiveStatus | null>> =>
  attempt(async () => toLive(await api.get<unknown>(`/public/tournaments/${encodeURIComponent(slug)}/live`, { retries: 1, ttl: 10000, force: true })));
