import { api, hasBackend } from "@/lib/api";
import { STATUS_KEY } from "@/features/feedback/config";
import type { Created, FeedbackResult, FeedbackStatus, ReportBody } from "@/features/feedback/domain";
import { toFeedbackFailure } from "@/features/feedback/services/failure";

const e = encodeURIComponent;

async function run<T>(call: "create" | "upload" | "withdraw" | "status", fn: () => Promise<T>): Promise<FeedbackResult<T>> {
  try { return { ok: true, data: await fn() }; } catch (err) { return { ok: false, failure: toFeedbackFailure(err, call) }; }
}

/** What the probe found. `off` covers a 404 and a network error: the widget then renders nothing. */
export type Probe = { on: true; status: FeedbackStatus } | { on: false };

let memo: Probe | null = null;

const parse = (raw: unknown): Probe => {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  if (o.enabled !== true) return { on: false };
  const n = (v: unknown, d: number) => (typeof v === "number" && v > 0 ? v : d);
  return { on: true, status: { enabled: true, consentVersion: typeof o.consentVersion === "string" ? o.consentVersion : "feedback-v1", maxAttachments: Math.min(4, n(o.maxAttachments, 2)), maxAttachmentBytes: n(o.maxAttachmentBytes, 409600) } };
};

/**
 * Asks once per session whether feedback is switched on. A 200 or a 404 is cached in sessionStorage; a network error counts as "off" for
 * this page load only (it is asked again in a new tab). No bearer token is sent.
 */
export async function probeStatus(): Promise<Probe> {
  if (!hasBackend) return { on: false };
  if (memo) return memo;
  try { const c = sessionStorage.getItem(STATUS_KEY); if (c) { memo = c === "off" ? { on: false } : parse(JSON.parse(c)); return memo; } } catch { /* storage blocked */ }
  const r = await run("status", () => api.get<unknown>("/feedback/status", { retries: 0, timeout: 6000, force: true, anonymous: true }));
  let out: Probe = { on: false };
  let cache = false;
  if (r.ok) { out = parse(r.data); cache = true; } else if (r.failure.code === "not_found") cache = true;
  memo = out;
  if (cache) { try { sessionStorage.setItem(STATUS_KEY, out.on ? JSON.stringify(out.status) : "off"); } catch { /* ignore */ } }
  return out;
}

/** Test hook: forget the in-memory answer. */
export const resetProbeMemo = (): void => { memo = null; };

/** The report. The bearer token goes along only when the visitor chose "link to my account" (`withAccount`). */
export const createReport = (body: ReportBody, withAccount: boolean): Promise<FeedbackResult<Created>> =>
  run("create", async () => {
    const r = await api.post<Partial<Created>>("/feedback", body, { anonymous: !withAccount });
    if (!r || typeof r.id !== "string" || typeof r.attachToken !== "string") throw Object.assign(new Error("bad answer"), { status: 500 });
    return { id: r.id, attachToken: r.attachToken, attachExpiresIn: typeof r.attachExpiresIn === "number" ? r.attachExpiresIn : 1200 };
  });

/** One screenshot: the bytes are the body, the attach token is the only credential (never the account). */
export const uploadShot = (id: string, token: string, blob: Blob): Promise<FeedbackResult<{ id: string }>> =>
  run("upload", async () => {
    const r = await api.postRaw<{ id?: unknown }>(`/feedback/${e(id)}/attachments`, blob, { anonymous: true, headers: { "X-Attach-Token": token, "Content-Type": blob.type || "application/octet-stream" } });
    return { id: typeof r?.id === "string" ? r.id : "" };
  });

export const withdrawReport = (id: string, token: string): Promise<FeedbackResult<void>> =>
  run("withdraw", async () => { await api.del<void>(`/feedback/${e(id)}`, { anonymous: true, headers: { "X-Attach-Token": token } }); });
