/**
 * The ONLY place the staff console talks to the API (`/admin/v1/*`). If stream S or R change a response shape, change the
 * normalisers at the bottom of this file and nothing else.
 *
 * Rules kept here, not in screens:
 *  - the staff token lives in sessionStorage ONLY (never localStorage), and the password-step user token is never stored at all;
 *  - the staff API answers 404 to anyone who is not staff (and to an expired token), so a 404 on any route except the lookup means
 *    "you are not signed in as staff": the session is dropped and the screens show a plain 404;
 *  - responses are copied through an allow-list, so a field the server adds later (a roster, a photo, an email) cannot reach the screen.
 */
import { API_BASE } from "../api";

export const STAFF_KEY = "eh-staff-v1";

export interface StoreLike { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void }

export class AdminError extends Error {
  constructor(public status: number, message: string, public code?: string, public retryAfterMs?: number) { super(message); }
}

/** Reason codes for a staff action (blueprint 9.4). Labels are what the screen says. */
export const REASONS = [
  { code: "spam", label: "Spam" },
  { code: "scam", label: "Scam or fraud" },
  { code: "minor_exposed", label: "A child is shown" },
  { code: "contact_details", label: "Private contact details shown" },
  { code: "abuse", label: "Abuse or harassment" },
  { code: "legal_request", label: "Legal request" },
  { code: "user_request", label: "The owner asked for this" },
  { code: "security", label: "Security problem" },
  { code: "other", label: "Something else" },
] as const;
export const reasonLabel = (code: string) => REASONS.find((r) => r.code === code)?.label ?? code.replace(/_/g, " ");

/** The reasons a member of the public can give when they report something (blueprint 9.2). */
export const REPORT_REASONS: Record<string, string> = { spam: "Spam", scam: "Scam", minor_exposed: "A child is shown", contact_details: "Contact details shown", offensive: "Offensive", copyright: "Copyright", wrong_info: "Wrong information", other: "Something else" };

export type Decision = "hide" | "restore" | "dismiss";

/** Which queue the server is asked for (`status` on GET /reports). Closed reports are `actioned` (hidden) or `dismissed`. */
export type ReportTab = "open" | "needs_other_staff" | "actioned" | "dismissed";

export interface Report {
  /** `report` (the generic table) or `directory` (the directory's own reports): decide needs both. */
  source: "report" | "directory";
  id: string; targetType: string; targetId: string; reasonCode: string; note: string;
  status: string; priority: number; reporters: number; createdAt: string; hidden: boolean;
  /** A same-site path to the public page, when the server sends one. */
  link: string | null;
  /** The event the reported page belongs to (an id), so the screen can open it in the content hub. */
  eventId: string | null;
}
export interface Takedown { targetType: string; targetId: string; reasonCode: string; at: string }
export interface Page<T> { items: T[]; next: string | null }
export interface Flag { key: string; value: boolean; updatedAt: string | null; settable: boolean; stepUp: boolean; description: string | null; reasonCode: string | null; display: string | null }
export interface UsageItem { key: string; label: string; value: number | null; limit: number | null; unit: string; source: string; note: string | null; available: boolean }
export interface Usage { items: UsageItem[]; note: string | null }
export interface AuditRow { id: string; at: string; actorType: string; action: string; targetType: string; targetId: string; reasonCode: string; orgId: string | null }
/** What a lookup may show: metadata only, copied through an allow-list. Never a roster, a photo, a registration or an email. */
export interface Lookup { kind: string; id: string; status: string; createdAt: string | null; emailVerified: boolean | null; counts: { label: string; value: number }[] }

/** Home page numbers. A null count means that part is not available on this database (not "zero"). */
export interface Overview { counts: Record<string, number | null>; recent: AuditRow[] }
export interface OrgRow { id: string; name: string; kind: string; slug: string | null; status: string; createdAt: string; verifiedAt: string | null; members: number; events: number; owner: { id: string; email: string } | null }
export type OrgTab = "pending" | "verified" | "all";
export interface UserOrg { id: string; name: string; kind: string; role: string; verified: boolean }
/** Emails arrive MASKED ("y***@g***.com"); the full address comes only from revealEmail, which is logged with a reason. */
export interface UserRow { id: string; email: string; status: string; createdAt: string; emailVerifiedAt: string | null; staff: boolean; orgs: UserOrg[] }
export const CONTENT_KINDS = ["scrims", "lft", "directory", "calendar", "ratings", "results"] as const;
export type ContentKind = (typeof CONTENT_KINDS)[number];
export interface ContentItem { kind: ContentKind; id: string; title: string; body: string | null; meta: string[]; status: string; hidden: boolean; hiddenReason: string | null; reports: number; createdAt: string | null; link: string | null; reply: string | null; replyHidden: boolean }
export interface ContentPage { kind: ContentKind; available: boolean; reasons: string[]; items: ContentItem[]; next: string | null }
export type FeedbackStatus = "new" | "triaged" | "fixed" | "wontfix";
export interface FeedbackItem { id: string; createdAt: string; kind: string; status: string; message: string; pagePath: string; deviceClass: string; attachmentCount: number; staffNote: string | null; hasContact: boolean }

/** Reasons for hiding a calendar entry or a rating (their own list on the server). */
export const MODERATION_REASON_LABELS: Record<string, string> = {
  abuse: "Abuse or harassment", personal_info: "Personal details shown", false_claim: "False claim", spam: "Spam", conflict_of_interest: "Conflict of interest",
  off_topic: "Off topic", report_unfounded: "The report was unfounded", appeal_upheld: "The appeal was upheld", other: "Something else",
};
export const anyReasonLabel = (code: string) => REASONS.find((r) => r.code === code)?.label ?? MODERATION_REASON_LABELS[code] ?? code.replace(/_/g, " ");

// ---- token helpers ----

interface Claims { exp?: number; su?: number }
export function claims(token: string): Claims {
  try {
    const part = token.split(".")[1];
    if (!part) return {};
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = typeof atob === "function" ? atob(b64.padEnd(Math.ceil(b64.length / 4) * 4, "=")) : Buffer.from(b64, "base64").toString("utf8");
    const c = JSON.parse(json) as Claims;
    return { exp: typeof c.exp === "number" ? c.exp : undefined, su: typeof c.su === "number" ? c.su : undefined };
  } catch { return {}; }
}

export interface AdminOptions { base: string; fetchImpl?: typeof fetch; store?: () => StoreLike | null; now?: () => number }

const browserStore = (): StoreLike | null => { try { return typeof sessionStorage === "undefined" ? null : sessionStorage; } catch { return null; } };

export function createAdminClient(o: AdminOptions) {
  const f = o.fetchImpl ?? ((...a: Parameters<typeof fetch>) => fetch(...a));
  const store = o.store ?? browserStore;
  const now = o.now ?? (() => Date.now());
  const listeners = new Set<() => void>();
  let memory: string | null = null; // used only when sessionStorage is unavailable: this tab, nothing persisted

  const read = (): string | null => { try { return store()?.getItem(STAFF_KEY) ?? memory; } catch { return memory; } };
  const write = (t: string | null) => {
    memory = t;
    try { const s = store(); if (s) { if (t) s.setItem(STAFF_KEY, t); else s.removeItem(STAFF_KEY); } } catch { /* tab-only */ }
    listeners.forEach((l) => l());
  };

  async function raw(method: string, path: string, body?: unknown, bearer?: string): Promise<unknown> {
    let res: Response;
    try {
      res = await f(o.base + path, { method, cache: "no-store", headers: { ...(body === undefined ? {} : { "content-type": "application/json" }), ...(bearer ? { authorization: `Bearer ${bearer}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
    } catch { throw new AdminError(0, "Could not reach the server. Check your connection."); }
    let data: unknown = null;
    try { data = await res.json(); } catch { /* empty body */ }
    if (res.ok) return data;
    const d = (data ?? {}) as { error?: unknown; code?: unknown; retryAfter?: unknown };
    const ra = Number(res.headers?.get?.("retry-after") ?? d.retryAfter);
    throw new AdminError(res.status, typeof d.error === "string" ? d.error : "The server did not accept that.", typeof d.code === "string" ? d.code : undefined, Number.isFinite(ra) && ra > 0 ? ra * 1000 : undefined);
  }

  const tokenOf = (r: unknown): string => {
    const t = (r as { token?: unknown })?.token;
    if (typeof t !== "string" || !t) throw new AdminError(502, "The server sent an answer this page does not understand.");
    return t;
  };

  async function renewIfNeeded() {
    const t = read(); if (!t) return;
    const { exp } = claims(t);
    if (exp === undefined || exp * 1000 - now() > 120_000) return;
    try { write(tokenOf(await raw("POST", "/admin/v1/session/renew", undefined, t))); } catch (e) { if (e instanceof AdminError && (e.status === 404 || e.status === 401)) write(null); }
  }

  /** `lookup` is the one route where a 404 can also mean "no match", so it does not drop the session. */
  async function call(method: string, path: string, body?: unknown, o2: { lookup?: boolean } = {}): Promise<unknown> {
    await renewIfNeeded();
    const t = read();
    if (!t) throw new AdminError(404, "Not found");
    try { return await raw(method, "/admin/v1" + path, body, t); } catch (e) {
      if (e instanceof AdminError && (e.status === 401 || (e.status === 404 && !o2.lookup))) write(null);
      throw e;
    }
  }

  const q = (params: Record<string, string | undefined>) => { const s = Object.entries(params).filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`).join("&"); return s ? `?${s}` : ""; };

  return {
    subscribe: (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; },
    hasSession: () => read() !== null,
    signOut: () => write(null),
    /** True when the last code is older than five minutes, so a step-up action needs a fresh one. */
    needsStepUp: () => { const t = read(); if (!t) return true; const { su } = claims(t); return su === undefined ? false : now() / 1000 - su > 290; },

    /** Step 1: the ordinary account sign-in. The token is returned to the caller's memory and is never stored. */
    async checkPassword(email: string, password: string): Promise<string> { return tokenOf(await raw("POST", "/auth/login", { email, password })); },
    /** Step 1 with Google: the server checks the ID token and answers the ordinary account token (kept in memory only, like the password step). */
    async checkGoogle(credential: string): Promise<string> { return tokenOf(await raw("POST", "/auth/google", { credential })); },
    /** Is an ordinary account token still good? true, false (expired or signed out) or "inactive" (suspended / pending deletion). */
    async checkUserToken(userToken: string): Promise<true | false | "inactive"> {
      try { await raw("GET", "/me", undefined, userToken); return true; } catch (e) { if (e instanceof AdminError && e.status === 403) return "inactive"; if (e instanceof AdminError && e.status === 401) return false; throw e; }
    },
    /** First sign-in only: a staff account without an authenticator gets a new secret (shown once). 404 = not possible for this account. */
    async enroll(userToken: string): Promise<{ secret: string; otpauthUrl: string }> {
      const r = rec(await raw("POST", "/admin/v1/session/enroll", {}, userToken));
      const secret = str(r.secret); const otpauthUrl = str(r.otpauthUrl);
      if (!/^[A-Z2-7]{16,64}$/.test(secret) || !otpauthUrl.startsWith("otpauth://totp/")) throw new AdminError(502, "The server sent an answer this page does not understand.");
      return { secret, otpauthUrl };
    },
    /** Step 2: the authenticator code. A 404 means this account is not staff. */
    async openSession(userToken: string, code: string): Promise<void> { write(tokenOf(await raw("POST", "/admin/v1/session", { code }, userToken))); },
    async stepUp(code: string): Promise<void> {
      const t = read(); if (!t) throw new AdminError(404, "Not found");
      try { write(tokenOf(await raw("POST", "/admin/v1/session/step-up", { code }, t))); } catch (e) { if (e instanceof AdminError && e.status === 404) write(null); throw e; }
    },

    async reports(status: ReportTab, after?: string): Promise<Page<Report>> { return pageOf(await call("GET", `/reports${q({ status, after })}`), toReport); },
    async decide(id: string, decision: Decision, reasonCode: string, source: Report["source"] = "report"): Promise<void> { await call("POST", `/reports/${encodeURIComponent(id)}/decide`, { source, decision, reasonCode }); },
    async takedown(targetType: string, targetId: string, reasonCode: string): Promise<void> { await call("POST", "/takedowns", { targetType, targetId, reasonCode }); },
    /** What is hidden right now (newest first). */
    async takedowns(after?: string): Promise<Page<Takedown>> { return pageOf(await call("GET", `/takedowns${q({ after })}`), toTakedown); },
    /** Lifts a takedown: the page is public again. A reason is required, no step-up. */
    async liftTakedown(targetType: string, targetId: string, reasonCode: string): Promise<void> { await call("POST", `/takedowns/${encodeURIComponent(targetType)}/${encodeURIComponent(targetId)}/restore`, { reasonCode }); },

    /** Exact match on an id or an email. The email is sent, never shown again. Returns null when nothing matches. */
    async lookup(by: "id" | "email", value: string): Promise<Lookup | null> {
      try { return toLookup(await call("GET", `/lookup${q({ [by]: value })}`, undefined, { lookup: true })); } catch (e) { if (e instanceof AdminError && e.status === 404) return null; throw e; }
    },

    async flags(): Promise<Flag[]> { return toFlags(await call("GET", "/flags")); },
    async setFlag(key: string, value: boolean, reasonCode: string): Promise<void> { await call("PUT", `/flags/${encodeURIComponent(key)}`, { value, reasonCode }); },

    async usage(): Promise<Usage> { return toUsage(await call("GET", "/usage")); },

    async overview(): Promise<Overview> {
      const r = rec(await call("GET", "/overview")); const c = rec(r.counts);
      return { counts: Object.fromEntries(Object.entries(c).map(([k, v]) => [k, num(v)])), recent: (Array.isArray(r.recent) ? r.recent : []).map((x) => toAudit(rec(x))).filter((x): x is AuditRow => x !== null) };
    },
    async orgs(status: OrgTab, search?: string, after?: string): Promise<Page<OrgRow>> { return pageOf(await call("GET", `/orgs${q({ status, q: search, after })}`), toOrg); },
    async verifyOrg(id: string, reasonCode: string, slug?: string): Promise<{ slug: string | null }> { const r = rec(await call("POST", `/orgs/${encodeURIComponent(id)}/verify`, slug ? { reasonCode, slug } : { reasonCode })); return { slug: str(r.slug) || null }; },
    async unverifyOrg(id: string, reasonCode: string): Promise<void> { await call("POST", `/orgs/${encodeURIComponent(id)}/unverify`, { reasonCode }); },
    async suspendOrg(id: string, reasonCode: string): Promise<void> { await call("POST", `/orgs/${encodeURIComponent(id)}/suspend`, { reasonCode }); },
    async restoreOrg(id: string, reasonCode: string): Promise<void> { await call("POST", `/orgs/${encodeURIComponent(id)}/restore`, { reasonCode }); },
    async users(search?: string, after?: string): Promise<Page<UserRow>> { return pageOf(await call("GET", `/users${q({ q: search, after })}`), toUser); },
    /** The full email of one account. The server logs who asked, when, and the reason. */
    async revealEmail(id: string, reasonCode: string): Promise<string> { const e = str(rec(await call("POST", `/users/${encodeURIComponent(id)}/reveal`, { reasonCode })).email); if (!e.includes("@")) throw new AdminError(502, "The server sent an answer this page does not understand."); return e; },
    /** Suspend and restore need a fresh authenticator code (step-up), like the server requires. */
    async suspendUser(id: string, reasonCode: string): Promise<void> { await call("POST", `/users/${encodeURIComponent(id)}/suspend`, { reasonCode }); },
    async restoreUser(id: string, reasonCode: string): Promise<void> { await call("POST", `/users/${encodeURIComponent(id)}/restore`, { reasonCode }); },
    async content(kind: ContentKind, o3: { state?: "all" | "hidden"; id?: string; after?: string } = {}): Promise<ContentPage> {
      const r = rec(await call("GET", `/content${q({ kind, state: o3.state === "hidden" ? "hidden" : undefined, id: o3.id, after: o3.after })}`));
      const p = pageOf(r, toContent);
      return { kind, available: r.available !== false, reasons: Array.isArray(r.reasons) ? r.reasons.filter((x): x is string => typeof x === "string") : [], items: p.items, next: p.next };
    },
    async setContentHidden(kind: ContentKind, id: string, hide: boolean, reasonCode: string, target?: "review" | "reply"): Promise<void> {
      await call("POST", `/content/${kind}/${encodeURIComponent(id)}/${hide ? "hide" : "restore"}`, target ? { reasonCode, target } : { reasonCode });
    },
    /** Feedback answers 404 while feedback.enabled is off: that means "switched off", not "signed out", so the session stays. Returns null then. */
    async feedback(status: FeedbackStatus, cursor?: string): Promise<Page<FeedbackItem> | null> {
      try { return pageOf(await call("GET", `/feedback${q({ status, cursor })}`, undefined, { lookup: true }), toFeedback); } catch (e) { if (e instanceof AdminError && e.status === 404) return null; throw e; }
    },
    async triageFeedback(id: string, patch: { status?: FeedbackStatus; staffNote?: string | null }): Promise<void> { await call("PATCH", `/feedback/${encodeURIComponent(id)}`, patch, { lookup: true }); },
    async audit(after?: string, org?: string): Promise<Page<AuditRow>> { return pageOf(await call("GET", `/audit${q({ after, org })}`), toAudit); },
  };
}

export const admin = createAdminClient({ base: API_BASE });

// ---- normalisers: the one place response shapes are interpreted (all tolerant, all allow-lists) ----

const str = (v: unknown, d = ""): string => (typeof v === "string" ? v : typeof v === "number" ? String(v) : d);
const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
const rec = (v: unknown): Record<string, unknown> => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});
/** A link is shown only when it is a path on this site. Anything else (a full address, a script) is dropped. */
export const safeLink = (v: unknown): string | null => (typeof v === "string" && /^\/(?!\/)[\w\-./?=&%]*$/.test(v) ? v : null);

function pageOf<T>(raw: unknown, one: (r: Record<string, unknown>) => T | null): Page<T> {
  const r = rec(raw);
  const list = Array.isArray(raw) ? raw : Array.isArray(r.items) ? r.items : Array.isArray(r.entries) ? r.entries : [];
  const next = str(r.next ?? r.nextCursor ?? r.after);
  return { items: list.map((x) => one(rec(x))).filter((x): x is T => x !== null), next: next || null };
}

function toReport(r: Record<string, unknown>): Report | null {
  const id = str(r.id); if (!id) return null;
  const status = str(r.status, "open");
  // An upheld report is `actioned`: its target is hidden, so the screen offers "restore".
  return { source: r.source === "directory" ? "directory" : "report", id, targetType: str(r.targetType ?? r.target_type, "page"), targetId: str(r.targetId ?? r.target_id), reasonCode: str(r.reasonCode ?? r.reason_code, "other"), note: str(r.note).slice(0, 200), status, priority: num(r.priority) ?? 1, reporters: num(r.reporters ?? r.reporterCount ?? r.distinctReporters) ?? 1, createdAt: str(r.createdAt ?? r.created_at), hidden: r.hidden === true || status === "actioned" || status === "hidden", link: safeLink(r.link ?? r.path), eventId: /^[A-Za-z0-9._~-]{1,64}$/.test(str(r.eventId)) ? str(r.eventId) : null };
}

function toTakedown(r: Record<string, unknown>): Takedown | null {
  const targetType = str(r.targetType ?? r.target_type); const targetId = str(r.targetId ?? r.target_id);
  if (!targetType || !targetId) return null;
  return { targetType, targetId, reasonCode: str(r.reasonCode ?? r.reason_code, "other"), at: str(r.at) };
}

function toAudit(r: Record<string, unknown>): AuditRow | null {
  const id = str(r.id); if (!id) return null;
  // The actor's id is never shown: staff appear as "Platform staff".
  return { id, at: str(r.at), actorType: str(r.actorType ?? r.actor_type), action: str(r.action), targetType: str(r.targetType ?? r.target_type), targetId: str(r.targetId ?? r.target_id), reasonCode: str(r.reasonCode ?? r.reason_code), orgId: str(r.orgId ?? r.org_id) || null };
}

function toFlags(raw: unknown): Flag[] {
  const r = rec(raw);
  const src = r.flags ?? raw;
  // `display` keeps a non-boolean value (authz.mode is "legacy" / "shadow" / "org") so the screen can show it as text.
  if (Array.isArray(src)) return src.map((x) => rec(x)).filter((x) => str(x.key)).map((x) => ({ key: str(x.key), value: x.value === true || x.value === 1, updatedAt: str(x.updatedAt ?? x.updated_at) || null, settable: x.settable !== false, stepUp: x.stepUp === true || str(x.key).startsWith("kill."), description: str(x.description) || null, reasonCode: str(x.reasonCode) || null, display: typeof x.value === "string" ? x.value : null }));
  return Object.entries(rec(src)).map(([key, v]) => ({ key, value: v === true || v === 1, updatedAt: null, settable: true, stepUp: key.startsWith("kill."), description: null, reasonCode: null, display: typeof v === "string" ? v : null }));
}

// The server sends ids `d1_rows_written_today`, `worker_requests_today`, `mail_sent_today`, `db_size_bytes` (and a label); the short names are kept as a fallback.
const USAGE_LABELS: Record<string, string> = { d1_rows_written_today: "Database rows written today", worker_requests_today: "Server requests today", mail_sent_today: "Emails sent today", db_size_bytes: "Database size", rows_written: "Database rows written today", requests: "Server requests today", mail: "Emails sent today", db_size: "Database size" };
export const isMailItem = (key: string) => key === "mail_sent_today" || key === "mail";
function toUsage(raw: unknown): Usage {
  const r = rec(raw);
  const list = Array.isArray(r.items) ? r.items : Array.isArray(raw) ? (raw as unknown[]) : [];
  return {
    note: str(r.note) || null,
    items: list.map((x) => rec(x)).map((x): Record<string, unknown> & { key: string } => ({ ...x, key: str(x.id ?? x.key) })).filter((x) => x.key).map((x) => ({ key: x.key, label: str(x.label) || USAGE_LABELS[x.key] || x.key, value: x.available === false ? null : num(x.value), limit: num(x.limit), unit: str(x.unit) || (/(_bytes|db_size)$/.test(x.key) ? "bytes" : ""), source: str(x.source, "unknown"), note: str(x.note) || null, available: x.available !== false && num(x.value) !== null })),
  };
}

const COUNT_LABELS: Record<string, string> = { members: "Members", events: "Events", eventsOwned: "Events owned", eventsShared: "Events shared with them", teams: "Teams", people: "People", registrations: "Registrations", checkins: "Check-ins" };

/** Real shapes (admin-api.md): user { orgs[], counts{eventsOwned,eventsShared} }, org { orgKind, counts{members,events} }, event { counts{teams,people,registrations,checkins} }. Numbers only. */
function toLookup(raw: unknown): Lookup | null {
  const r = rec(raw); const id = str(r.id); if (!id) return null;
  const counts: Lookup["counts"] = [];
  if (Array.isArray(r.orgs)) counts.push({ label: "Organisations", value: r.orgs.length });
  else if (num(r.orgCount) !== null) counts.push({ label: "Organisations", value: num(r.orgCount) as number });
  const c = rec(r.counts);
  for (const k of Object.keys(COUNT_LABELS)) { const n = num(c[k]); if (n !== null) counts.push({ label: COUNT_LABELS[k], value: n }); }
  if (num(r.eventCount) !== null && !("events" in c) && !("eventsOwned" in c)) counts.push({ label: "Events", value: num(r.eventCount) as number });
  return { kind: str(r.kind ?? r.type, "item"), id, status: str(r.status, "active"), createdAt: str(r.createdAt ?? r.created_at) || null, emailVerified: typeof r.emailVerified === "boolean" ? r.emailVerified : null, counts };
}

function toOrg(r: Record<string, unknown>): OrgRow | null {
  const id = str(r.id); if (!id) return null;
  const o = rec(r.owner);
  return { id, name: str(r.name, "Organisation"), kind: str(r.kind, "team"), slug: str(r.slug) || null, status: str(r.status, "active"), createdAt: str(r.createdAt), verifiedAt: str(r.verifiedAt) || null, members: num(r.members) ?? 0, events: num(r.events) ?? 0, owner: str(o.id) ? { id: str(o.id), email: maskedOnly(str(o.email)) } : null };
}

/** Defence in depth: an address that is not masked is masked here, so a list can never show a full email even if the server sent one. */
export const maskedOnly = (e: string): string => {
  if (!e || e.includes("***")) return e;
  const at = e.lastIndexOf("@"); if (at < 1) return "***";
  const domain = e.slice(at + 1); const dot = domain.lastIndexOf(".");
  return `${e[0]}***@${domain[0] ?? ""}***${dot > 0 ? domain.slice(dot) : ""}`;
};

function toUser(r: Record<string, unknown>): UserRow | null {
  const id = str(r.id); if (!id) return null;
  const orgs = (Array.isArray(r.orgs) ? r.orgs : []).map((x) => rec(x)).filter((x) => str(x.id)).map((x) => ({ id: str(x.id), name: str(x.name), kind: str(x.kind), role: str(x.role), verified: x.verified === true }));
  return { id, email: maskedOnly(str(r.email)), status: str(r.status, "active"), createdAt: str(r.createdAt), emailVerifiedAt: str(r.emailVerifiedAt) || null, staff: r.staff === true, orgs };
}

function toContent(r: Record<string, unknown>): ContentItem | null {
  const id = str(r.id); const kind = str(r.kind) as ContentKind;
  if (!id || !(CONTENT_KINDS as readonly string[]).includes(kind)) return null;
  return {
    kind, id, title: str(r.title, "Item").slice(0, 200), body: r.body === null || r.body === undefined ? null : str(r.body).slice(0, 1200),
    meta: (Array.isArray(r.meta) ? r.meta : []).map((m) => str(m)).filter(Boolean).slice(0, 6), status: str(r.status), hidden: r.hidden === true,
    hiddenReason: str(r.hiddenReason) || null, reports: num(r.reports) ?? 0, createdAt: str(r.createdAt) || null, link: safeLink(r.link),
    reply: r.reply === null || r.reply === undefined ? null : str(r.reply).slice(0, 1200), replyHidden: r.replyHidden === true,
  };
}

function toFeedback(r: Record<string, unknown>): FeedbackItem | null {
  const id = str(r.id); if (!id) return null;
  return { id, createdAt: str(r.createdAt), kind: str(r.kind, "other"), status: str(r.status, "new"), message: str(r.message).slice(0, 2000), pagePath: str(r.pagePath), deviceClass: str(r.deviceClass), attachmentCount: num(r.attachmentCount) ?? 0, staffNote: str(r.staffNote) || null, hasContact: r.hasContact === true };
}
