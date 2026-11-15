import { api } from "@/lib/api";
import { attempt, type V3Result } from "@/features/shared/services/result";

/** Every v3 screen calls the API through these helpers (which sit on the one shared client in `@/lib/api`). */
export const v3Get = <T>(path: string, opt?: { force?: boolean; ttl?: number }): Promise<V3Result<T>> => attempt(() => api.get<T>(path, { retries: 1, ...opt }));
export const v3Post = <T>(path: string, body?: unknown): Promise<V3Result<T>> => attempt(() => api.post<T>(path, body));
export const v3Put = <T>(path: string, body?: unknown): Promise<V3Result<T>> => attempt(() => api.put<T>(path, body));
export const v3Del = <T>(path: string): Promise<V3Result<T>> => attempt(() => api.del<T>(path));

/** Builds `?a=1&b=2`, leaving out empty values and `false`. `true` becomes `1`. */
export const qs = (params: Record<string, string | number | boolean | undefined | null>): string => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== "" && v !== false) p.set(k, v === true ? "1" : String(v));
  const s = p.toString();
  return s ? `?${s}` : "";
};
