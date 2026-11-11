import type { Page } from "@playwright/test";

const API = "**/esports-api.yaseenyk.workers.dev/**";
export const json = (body: unknown, status = 200) => ({ status, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(body) });

/** Lets cross-origin API calls through the browser pre-check, so mocked answers can be read. */
export const preflight = (page: Page) => page.route(API, (r) => (r.request().method() === "OPTIONS" ? r.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" } }) : r.fallback()));

/** Opens the app as a signed-in organiser. The server is mocked, so no real account or data is touched. */
export async function signedIn(page: Page, events: unknown[] = []) {
  await page.addInitScript(() => localStorage.setItem("eh-session-v1", JSON.stringify({ token: "t", user: { id: "u", email: "olivia@example.com", name: "Olivia Test" } })));
  await preflight(page);
  await page.route("**/esports-api.yaseenyk.workers.dev/events", (r) => (r.request().method() === "GET" ? r.fulfill(json(events)) : r.fallback()));
}

/** Opens one panel of the event toolbox (group, then panel) and waits until it is open. Panels load only when opened. */
export async function openPanel(page: Page, group: "run" | "share" | "settings", id: string) {
  const g = page.locator(`details[data-group="${group}"]`);
  if (!(await g.evaluate((d) => (d as HTMLDetailsElement).open))) await g.locator("> summary").click();
  const p = g.locator(`details[data-panel="${id}"]`);
  if (!(await p.evaluate((d) => (d as HTMLDetailsElement).open))) await p.locator("> summary").click();
}
