import type { Page, Request } from "@playwright/test";
import { json, preflight, signedIn } from "./helpers";

const API = "**/esports-api.yaseenyk.workers.dev/**";

export interface Seen { method: string; path: string; search: string; body: string; raw: Buffer | null }
export type Handler = (req: { url: URL; method: string; body: unknown; request: Request }) => { status?: number; body?: unknown } | undefined;

/**
 * Mocks the v3 endpoints. Everything under /v3/ and /public/ that no handler answers gets the SAME 404 the real API gives while a feature
 * flag is off (`{"error":"Not found"}`), so "Not available yet" is tested against the real behaviour. Handlers are keyed "METHOD /path".
 * Register after signedIn(): the latest route wins, and anything outside /v3 and /public falls back to those mocks.
 */
export async function mockV3(page: Page, handlers: Record<string, Handler> = {}): Promise<Seen[]> {
  const seen: Seen[] = [];
  await page.route(API, async (r) => {
    const request = r.request();
    const url = new URL(request.url());
    if (request.method() === "OPTIONS") return r.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" } });
    if (!url.pathname.startsWith("/v3/") && !url.pathname.startsWith("/public/")) return r.fallback();
    const raw = request.postDataBuffer();
    seen.push({ method: request.method(), path: url.pathname, search: url.search, body: raw ? raw.toString("latin1").slice(0, 2000) : "", raw });
    const key = `${request.method()} ${url.pathname}`;
    const h = handlers[key];
    let body: unknown = undefined;
    if (raw) { try { body = JSON.parse(raw.toString("utf8")); } catch { body = undefined; } }
    const out = h?.({ url, method: request.method(), body, request });
    if (!out) return r.fulfill(json({ error: "Not found" }, 404));
    return r.fulfill(json(out.body ?? {}, out.status ?? 200));
  });
  return seen;
}

/** Signed in with the v3 mocks on top. */
export async function v3SignedIn(page: Page, handlers: Record<string, Handler> = {}): Promise<Seen[]> {
  await signedIn(page);
  return mockV3(page, handlers);
}

export { json, preflight, signedIn };

export const LISTING = { id: "a1", kind: "looking_for_team", game: "bgmi", roles: ["igl"], rankMin: 10, rankMax: 20, state: "Maharashtra", city: "Pune", onlineOk: true, message: "Serious IGL looking for a squad, evenings only", teamName: null, createdAt: "2030-01-01T00:00:00.000Z", lastBumpedAt: "2030-01-02T00:00:00.000Z", expiresAt: "2030-01-15T00:00:00.000Z" };
export const adultOk = { "GET /v3/me/status": () => ({ body: { adultConfirmedAt: "2030-01-01T00:00:00.000Z", resumeConsentAt: null } }) };

export const DISPUTE = {
  id: "d1", tournament: { slug: "gokte-cup-2026", title: "Gokte Cup 2026" }, type: "wrong_score", status: "under_review", summary: "The score for match 2 was entered wrongly.", raisedByTeam: "Alpha Wolves", againstTeam: "Beta Hawks", matchId: null, matchNo: 2,
  outcome: null, resolutionNote: null, resolvedAt: null, dueAt: "2030-01-04T00:00:00.000Z", overdue: true, createdAt: "2030-01-01T00:00:00.000Z", updatedAt: "2030-01-02T00:00:00.000Z",
  events: [
    { id: "e1", actorRole: "team", action: "raised", fromStatus: null, toStatus: "open", note: "The score for match 2 was entered wrongly.", createdAt: "2030-01-01T00:00:00.000Z" },
    { id: "e2", actorRole: "organiser", action: "status_under_review", fromStatus: "open", toStatus: "under_review", note: null, createdAt: "2030-01-02T00:00:00.000Z" },
  ],
  evidence: [{ id: "v1", mimeType: "image/png", sizeBytes: 183422, caption: null, createdAt: "2030-01-01T00:00:00.000Z", purged: false, purgeAfter: null }, { id: "v2", mimeType: "image/webp", sizeBytes: 1000, caption: "Lobby", createdAt: "2030-01-01T00:00:00.000Z", purged: true, purgeAfter: null }],
  corrections: [],
  permissions: { canComment: true, canUploadEvidence: true, canWithdraw: true, transitions: ["evidence_requested"], canResolve: false, role: "raiser" },
};
