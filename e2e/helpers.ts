import { expect, type Page } from "@playwright/test";

const API = "**/esports-api.yaseenyk.workers.dev/**";
export const json = (body: unknown, status = 200) => ({ status, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(body) });

/** Lets cross-origin API calls through the browser pre-check, so mocked answers can be read. */
export const preflight = (page: Page) => page.route(API, (r) => (r.request().method() === "OPTIONS" ? r.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" } }) : r.fallback()));

// ---- Mock factory (B-24): the one place that builds mocked API answers. Later phases change the shapes here, not in 19 specs. ----

export const mockUser = (over: Record<string, unknown> = {}) => ({ id: "u", email: "olivia@example.com", name: "Olivia Test", emailVerified: true, ...over });

/** An event as the server sends it in the list. The role is always present, as the real API sends it. */
export const mockEvent = (over: Record<string, unknown> = {}) => ({ id: "e1", key: "cup", name: "Spring Cup", game: "BGMI", organiser: "", date: "2026-12-01", venue: "", emergency: "", rules: "", settings: {}, updatedAt: "", role: "owner", ...over });

export const mockMembers = (over: Record<string, unknown> = {}) => ({ owner: { userId: "u", name: "Olivia Test", email: "olivia@example.com" }, members: [], ...over });

/** GET /me/context (blueprint 11.2). Nothing calls it yet; it is here so the shell can start to without hitting production. */
export const mockContext = (over: Record<string, unknown> = {}) => ({ user: mockUser(), orgs: [], staff: null, features: { teamOrgs: false }, ...over });

export interface ApiMocks {
  /** Answer for GET /events. Each item is filled out with mockEvent defaults. */
  events?: Record<string, unknown>[];
  /** Answer for GET /events/:id. Default: the matching item of `events`. */
  eventDetail?: (id: string) => unknown | undefined;
  /** Answer for GET /events/:id/members. */
  members?: unknown;
  me?: unknown;
  context?: unknown;
}

/** Every request to the API that no mock answered, as "METHOD path". Specs can assert it is empty. */
export const unmockedCalls = new WeakMap<Page, string[]>();

/**
 * Mocks the API for a signed-in page and makes every call nobody mocked ABORT, so a missing mock fails loudly instead of reaching
 * production (where a 401 would sign the test user out). Register this FIRST: Playwright tries the latest route first, so a spec's
 * own page.route() added afterwards wins, and `fallback()` ends up here.
 */
export async function mockApi(page: Page, m: ApiMocks = {}) {
  const calls: string[] = [];
  unmockedCalls.set(page, calls);
  const events = (m.events ?? []).map((e) => mockEvent(e));
  await page.route(API, (r) => { const u = new URL(r.request().url()); calls.push(`${r.request().method()} ${u.pathname}`); return r.abort("failed"); });
  await preflight(page);
  const get = (path: RegExp, answer: (match: RegExpMatchArray) => unknown | undefined) =>
    page.route(API, (r) => {
      const u = new URL(r.request().url());
      const hit = r.request().method() === "GET" ? u.pathname.match(path) : null;
      const body = hit ? answer(hit) : undefined;
      return body === undefined ? r.fallback() : r.fulfill(json(body));
    });
  await get(/^\/events$/, () => events);
  await get(/^\/events\/([^/]+)$/, (h) => (m.eventDetail ? m.eventDetail(h[1]) : events.find((e) => e.id === h[1])));
  await get(/^\/events\/[^/]+\/members$/, () => m.members ?? mockMembers());
  await get(/^\/me$/, () => m.me ?? mockUser());
  await get(/^\/me\/context$/, () => m.context ?? mockContext());
}

/** Opens the app as a signed-in organiser. The server is mocked, so no real account or data is touched. Unmocked API calls abort. */
export async function signedIn(page: Page, events: unknown[] = [], mocks: Omit<ApiMocks, "events"> = {}) {
  await page.addInitScript(() => localStorage.setItem("eh-session-v1", JSON.stringify({ token: "t", user: { id: "u", email: "olivia@example.com", name: "Olivia Test" } })));
  await mockApi(page, { ...mocks, events: events as Record<string, unknown>[] });
}

/** Opens one panel of the event toolbox (group, then panel) and waits until it is open. Panels load only when opened. */
export async function openPanel(page: Page, group: "run" | "share" | "settings", id: string) {
  const g = page.locator(`details[data-group="${group}"]`);
  if (!(await g.evaluate((d) => (d as HTMLDetailsElement).open))) await g.locator("> summary").click();
  const p = g.locator(`details[data-panel="${id}"]`);
  if (!(await p.evaluate((d) => (d as HTMLDetailsElement).open))) await p.locator("> summary").click();
}

/** Opens the hub menu in the app header (the same honeycomb menu as the home page) and returns its "App" navigation. */
export async function appNav(page: Page) {
  const dlg = page.getByRole("dialog", { name: "Hub menu" });
  await expect(dlg).toBeHidden();
  await page.getByRole("button", { name: "Open the hub menu" }).click();
  return dlg.getByRole("navigation", { name: "App" });
}
