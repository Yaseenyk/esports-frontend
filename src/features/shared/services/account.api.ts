import { v3Get, v3Post } from "@/features/shared/services/v3-api";

export interface MeStatus { adultConfirmedAt: string | null; resumeConsentAt: string | null }
const clean = (r: unknown): MeStatus => {
  const x = (r ?? {}) as Record<string, unknown>;
  return { adultConfirmedAt: typeof x.adultConfirmedAt === "string" ? x.adultConfirmedAt : null, resumeConsentAt: typeof x.resumeConsentAt === "string" ? x.resumeConsentAt : null };
};
export const fetchMeStatus = async () => { const r = await v3Get<unknown>("/v3/me/status", { force: true }); return r.ok ? { ok: true as const, data: clean(r.data) } : r; };
export const confirmAdult = async () => { const r = await v3Post<unknown>("/v3/me/adult-confirmation", { adult: true }); return r.ok ? { ok: true as const, data: clean(r.data) } : r; };
