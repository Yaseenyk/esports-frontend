/** Tournament alert API calls. Tokens from email links go in POST bodies. The adapter copies known fields only. */
import { v3Del, v3Get, v3Post, v3Put } from "@/features/shared/services/v3-api";
import type { V3Result } from "@/features/shared/failure";
import type { AlertRule, AlertSettings, AlertStatus } from "@/features/alerts/domain";

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : {});
const STATUSES: AlertStatus[] = ["off", "pending", "expired", "active", "stopped"];

export function toSettings(raw: unknown): AlertSettings {
  const o = obj(raw);
  const rules: AlertRule[] = (Array.isArray(o.rules) ? o.rules : []).map((r) => { const x = obj(r); return { game: String(x.game ?? "any").slice(0, 20), place: String(x.place ?? "any").slice(0, 60), kind: String(x.kind ?? "any").slice(0, 20) }; }).slice(0, 5);
  const limits = obj(o.limits);
  return {
    status: STATUSES.includes(o.status as AlertStatus) ? (o.status as AlertStatus) : "off",
    email: typeof o.email === "string" ? o.email.slice(0, 120) : null,
    confirmedAt: typeof o.confirmedAt === "string" ? o.confirmedAt : null,
    rules, maxRules: typeof limits.maxRules === "number" ? limits.maxRules : 5, mailer: o.mailer === true,
  };
}
const map = async <A, B>(p: Promise<V3Result<A>>, f: (a: A) => B): Promise<V3Result<B>> => { const r = await p; return r.ok ? { ok: true, data: f(r.data) } : r; };

export const fetchAlerts = () => map(v3Get<unknown>("/v3/me/alerts", { force: true }), toSettings);
export const saveRules = (rules: AlertRule[]) => map(v3Put<unknown>("/v3/me/alerts", { rules }), toSettings);
export const sendConfirm = () => map(v3Post<unknown>("/v3/me/alerts/confirm-email", {}), toSettings);
export const stopAlerts = () => map(v3Post<unknown>("/v3/me/alerts/stop", {}), toSettings);
export const deleteAlerts = () => v3Del<unknown>("/v3/me/alerts");
export const confirmToken = (token: string) => v3Post<unknown>("/public/alerts/confirm", { token });
export const unsubscribeToken = (token: string) => v3Post<unknown>("/public/alerts/unsubscribe", { token });
