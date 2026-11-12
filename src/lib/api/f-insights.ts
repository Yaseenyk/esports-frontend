import { api } from "./index";
import type { Analytics, ApiKeyRow, CreatedKey } from "../insights";
import { normaliseAnalytics, normaliseKeys } from "../insights";

/** Analytics and API key calls (docs/ecosystem/phase467-api.md). Counts only. The key secret comes back once and is never cached. */
const q = (months: number) => `?months=${months}`;

export const insightsApi = {
  mine: async (months = 12): Promise<Analytics> => normaliseAnalytics(await api.get<unknown>(`/me/analytics${q(months)}`, { ttl: 30_000 })),
  org: async (id: string, months = 12): Promise<Analytics> => normaliseAnalytics(await api.get<unknown>(`/orgs/${encodeURIComponent(id)}/analytics${q(months)}`, { ttl: 30_000 })),
  keys: async (): Promise<ApiKeyRow[]> => normaliseKeys(await api.get<unknown>("/me/api-keys", { ttl: 0, swr: 0 })),
  createKey: async (label: string): Promise<CreatedKey> => {
    const r = await api.post<{ id?: string; label?: string; key?: string }>("/me/api-keys", { label });
    api.invalidate("/me/api-keys");
    return { id: String(r.id ?? ""), label: String(r.label ?? label), key: String(r.key ?? "") };
  },
  revokeKey: async (id: string) => { const r = await api.del<{ ok: true }>(`/me/api-keys/${encodeURIComponent(id)}`); api.invalidate("/me/api-keys"); return r; },
};
