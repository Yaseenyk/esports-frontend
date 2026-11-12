// Insights screen and API keys, server mocked. Unmocked calls abort (see helpers.ts).
import { expect, test } from "@playwright/test";
import { json, mockContext, signedIn } from "./helpers";

const A = "**/esports-api.yaseenyk.workers.dev";
const data = { window: { months: 12, from: "2025-12", to: "2026-11-12" }, events: { total: 3, byMonth: [{ month: "2026-11", count: 3 }] }, registrations: { total: 3, byStatus: { pending: 2, approved: 1 } }, checkIns: { total: 2 }, liveViews: { total: 10, bySource: { live: 7, embed: 3 } }, perEvent: [{ id: "e1", key: "cup", name: "Spring Cup", game: "BGMI", date: "2026-11-05", registrations: { total: 3, pending: 2, approved: 1 }, checkIns: 2, liveViews: 10 }] };
const none = { ...data, events: { total: 0, byMonth: [] }, registrations: { total: 0, byStatus: {} }, checkIns: { total: 0 }, liveViews: { total: 0, bySource: {} }, perEvent: [] };

test("insights: bars, table toggle, counts, no personal data", async ({ page }) => {
  await signedIn(page);
  await page.route(`${A}/me/analytics**`, (r) => r.fulfill(json(data)));
  await page.goto("/app/insights/");
  await expect(page.getByRole("heading", { name: "Insights" })).toBeVisible();
  await expect(page.getByRole("img", { name: /Events created by month/ })).toBeVisible();
  await page.getByRole("button", { name: "Table" }).click();
  await expect(page.getByRole("table", { name: "Events created by month" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Check-ins" })).toContainText("2");
  await expect(page.getByRole("region", { name: "Live page views" })).toContainText("10");
  await expect(page.locator("body")).not.toContainText("@");
});

test("insights: empty state and error with retry", async ({ page }) => {
  await signedIn(page);
  let failing = true; // the client retries a failed read on its own, so the server keeps failing until the test says it has recovered
  await page.route(`${A}/me/analytics**`, (r) => (failing ? r.fulfill(json({ error: "x" }, 500)) : r.fulfill(json(none))));
  await page.goto("/app/insights/");
  await expect(page.getByRole("alert").filter({ hasText: /[^ ]/ })).toContainText("server had a problem");
  failing = false;
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByText("Nothing to show yet: create an event and share its link.")).toBeVisible();
});

test("insights: club switcher loads the club's numbers", async ({ page }) => {
  const team = { id: "org-t", name: "Chess Club", kind: "team", status: "active", role: "admin", caps: ["org.read"] };
  await signedIn(page, [], { context: mockContext({ orgs: [team], features: { teamOrgs: true } }) });
  await page.route(`${A}/me/analytics**`, (r) => r.fulfill(json(none)));
  await page.route(`${A}/orgs/org-t/analytics**`, (r) => r.fulfill(json({ ...data, org: { id: "org-t", name: "Chess Club", kind: "team" } })));
  await page.goto("/app/insights/");
  await page.getByLabel("1. Choose what to look at").selectOption("org-t");
  await expect(page.getByRole("img", { name: /Events created by month/ })).toBeVisible();
});

test("api keys: key shown once with a warning, revoke asks first", async ({ page }) => {
  await signedIn(page);
  let keys: unknown[] = [{ id: "k1", label: "Old", hint: "abcd", createdAt: "2026-11-01T00:00:00Z", lastUsedAt: null }];
  await page.route(`${A}/me/api-keys`, (r) => {
    if (r.request().method() === "POST") { keys = [...keys, { id: "k2", label: "Sheet", hint: "wxyz", createdAt: "2026-11-12T00:00:00Z", lastUsedAt: null }]; return r.fulfill(json({ id: "k2", label: "Sheet", key: "ehk_SECRET123" }, 201)); }
    return r.fulfill(json({ keys }));
  });
  await page.route(`${A}/me/api-keys/k1`, (r) => { keys = keys.filter((k) => (k as { id: string }).id !== "k1"); return r.fulfill(json({ ok: true })); });
  await page.goto("/app/account/");
  await expect(page.getByText("Never used").first()).toBeVisible();
  await page.getByLabel("Name for the new key").fill("Sheet");
  await page.getByRole("button", { name: "Make a key" }).click();
  await expect(page.getByTestId("new-key")).toHaveText("ehk_SECRET123");
  await expect(page.getByText("We cannot show it again")).toBeVisible();
  await page.getByRole("button", { name: "Revoke Old" }).click();
  await page.getByRole("button", { name: "Yes, revoke it" }).click();
  await expect(page.getByText("Key revoked")).toBeVisible();
});
