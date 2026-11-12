/** Pure helpers for the Insights screen and API keys (docs/ecosystem/phase467-api.md). No network, no React: unit-tested directly. Counts only, never people. */

export interface PerEvent { id: string; key: string; name: string; game: string; date: string; registrations: { total: number; pending: number; approved: number }; checkIns: number; liveViews: number }
export interface Analytics {
  org: { id: string; name: string } | null;
  window: { months: number; from: string; to: string };
  events: { total: number; byMonth: { month: string; count: number }[] };
  registrations: { total: number; byStatus: Record<string, number> };
  checkIns: { total: number };
  liveViews: { total: number; bySource: Record<string, number> };
  perEvent: PerEvent[];
}

const num = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0);
const str = (v: unknown): string => (typeof v === "string" ? v : "");
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});
const counts = (v: unknown): Record<string, number> => Object.fromEntries(Object.entries(obj(v)).map(([k, n]) => [k, num(n)]));

/** Defensive read: a missing piece becomes 0 or empty. Only the fields the screen draws are kept (no name, email or photo can pass through). */
export function normaliseAnalytics(raw: unknown): Analytics {
  const r = obj(raw), w = obj(r.window), ev = obj(r.events), rg = obj(r.registrations), ci = obj(r.checkIns), lv = obj(r.liveViews), o = obj(r.org);
  return {
    org: o.id ? { id: str(o.id), name: str(o.name) } : null,
    window: { months: num(w.months) || 12, from: str(w.from), to: str(w.to) },
    events: { total: num(ev.total), byMonth: (Array.isArray(ev.byMonth) ? ev.byMonth : []).map((m) => ({ month: str(obj(m).month), count: num(obj(m).count) })).filter((m) => /^\d{4}-\d{2}$/.test(m.month)) },
    registrations: { total: num(rg.total), byStatus: counts(rg.byStatus) },
    checkIns: { total: num(ci.total) },
    liveViews: { total: num(lv.total), bySource: counts(lv.bySource) },
    perEvent: (Array.isArray(r.perEvent) ? r.perEvent : []).map((p) => {
      const e = obj(p), g = obj(e.registrations);
      return { id: str(e.id), key: str(e.key), name: str(e.name), game: str(e.game), date: str(e.date), registrations: { total: num(g.total), pending: num(g.pending), approved: num(g.approved) }, checkIns: num(e.checkIns), liveViews: num(e.liveViews) };
    }),
  };
}

/** True when there is nothing at all to chart or count. */
export const isEmpty = (a: Analytics): boolean => a.events.total === 0 && a.registrations.total === 0 && a.checkIns.total === 0 && a.liveViews.total === 0;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2026-11" -> "Nov 2026"; anything else comes back unchanged. */
export const monthLabel = (m: string): string => { const x = /^(\d{4})-(\d{2})$/.exec(m); const i = x ? Number(x[2]) - 1 : -1; return x && i >= 0 && i < 12 ? `${MONTHS[i]} ${x[1]}` : m; };

/** The server leaves out months with no events; the chart wants every month in a row, oldest first, with 0 for the quiet ones. */
export function fillMonths(byMonth: { month: string; count: number }[], months: number, to: string): { month: string; count: number }[] {
  const end = /^(\d{4})-(\d{2})/.exec(to);
  if (!end) return [...byMonth].sort((a, b) => a.month.localeCompare(b.month));
  const have = new Map(byMonth.map((m) => [m.month, m.count]));
  let y = Number(end[1]), mo = Number(end[2]);
  const out: { month: string; count: number }[] = [];
  for (let i = 0; i < Math.min(Math.max(months, 1), 12); i++) {
    const k = `${y}-${String(mo).padStart(2, "0")}`;
    out.unshift({ month: k, count: have.get(k) ?? 0 });
    mo -= 1; if (mo === 0) { mo = 12; y -= 1; }
  }
  return out;
}

/** Plain words for an analytics failure. */
export function insightsError(e: unknown): string {
  const s = (e as { status?: number })?.status;
  if (s === 429) return "Too many tries. Wait a minute and try again.";
  if (s === 404) return "These numbers are not available for this club. You may not belong to it any more.";
  if (typeof s === "number" && s >= 500) return "The server had a problem. Try again in a moment.";
  if (typeof s === "number") return "Could not load the numbers. Try again.";
  return "Could not reach the server. Check your connection and try again.";
}

// ---- API keys ----
export const MAX_KEYS = 5;
export interface ApiKeyRow { id: string; label: string; hint: string; createdAt: string; lastUsedAt: string | null }
export interface CreatedKey { id: string; label: string; key: string }

/** Accepts `{keys: [...]}` or a bare array; never keeps a secret even if the server sent one. */
export function normaliseKeys(raw: unknown): ApiKeyRow[] {
  const list = Array.isArray(raw) ? raw : Array.isArray(obj(raw).keys) ? (obj(raw).keys as unknown[]) : [];
  return list.map((k) => { const o = obj(k); return { id: str(o.id), label: str(o.label), hint: str(o.hint), createdAt: str(o.createdAt), lastUsedAt: typeof o.lastUsedAt === "string" ? o.lastUsedAt : null }; }).filter((k) => k.id);
}

export function keyError(e: unknown, what: "list" | "create" | "revoke"): string {
  const s = (e as { status?: number })?.status, code = (e as { detail?: { code?: string } })?.detail?.code;
  if (what === "create" && (code === "api_key_limit" || code === "key_limit" || s === 409)) return `You already have ${MAX_KEYS} keys, the most allowed. Revoke one first.`;
  if (what === "create" && s === 400) return "Give the key a short label, for example the name of the tool that will use it.";
  if (s === 429) return "Too many tries. Wait a few minutes and try again.";
  if (s === 404 && what === "revoke") return "That key is already gone. Refresh the list.";
  if (typeof s === "number" && s >= 500) return "The server had a problem. Try again in a moment.";
  return what === "list" ? "Could not load your keys. Try again." : what === "create" ? "Could not create the key. Try again." : "Could not revoke the key. Try again.";
}

export const keyDate = (iso: string | null): string => { if (!iso) return "Never used"; const d = new Date(iso); return Number.isNaN(d.getTime()) ? "Never used" : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); };

/** What a successful add-member call says. With clubs on the server sends a pending invitation (`pending: true`); never claim access then. */
export function addMemberMessage(r: { pending?: boolean; name?: string; email?: string; role?: string }, typedEmail: string): string {
  if (r.pending === true) return `Invitation sent to ${r.email || typedEmail}. They get access when they accept it.`;
  return `${r.name || typedEmail} now has ${r.role === "editor" ? "edit" : "view-only"} access.`;
}
