/** Journal API calls (backend flag v3.journal). The only place this feature talks to the network, through the shared client. Owner-only routes. */
import type { V3Result } from "@/features/shared/failure";
import { v3Del, v3Get, v3Post, v3Put } from "@/features/shared/services/v3-api";
import { toItem, toList } from "@/features/journal/services/journal.adapter";

const map = async <A, B>(p: Promise<V3Result<A>>, f: (a: A) => B): Promise<V3Result<B>> => { const r = await p; return r.ok ? { ok: true, data: f(r.data) } : r; };
const enc = encodeURIComponent;

export const fetchJournal = () => map(v3Get<unknown>("/v3/me/journal", { force: true, ttl: 0 }), toList);
export const postEntry = (body: Record<string, unknown>) => map(v3Post<unknown>("/v3/me/journal", body), toItem);
export const putEntry = (id: string, body: Record<string, unknown>) => map(v3Put<unknown>(`/v3/me/journal/${enc(id)}`, body), toItem);
export const deleteEntry = (id: string) => v3Del<{ ok: boolean }>(`/v3/me/journal/${enc(id)}`);
export const clearJournal = () => v3Post<{ ok: boolean; deleted: number }>("/v3/me/journal/clear", { confirm: true });
