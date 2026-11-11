// Sponsor report: the hit counter on the live page (once per load, never with Do Not Track) and the organiser panel. The server is mocked.
import fs from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { json, openPanel, preflight, signedIn } from "./helpers";

const A = "**/esports-api.yaseenyk.workers.dev";
const ev = { id: "e1", key: "cup", name: "Spring Cup", game: "BGMI", organiser: "", date: "2026-12-01", venue: "Pune", emergency: "", rules: "", settings: {}, updatedAt: "" };
const pub = { event: { name: "Spring Cup", date: "2026-12-01", venue: "City Arena" }, snapshot: { views: [], announcements: [], sponsors: [{ name: "Acme Energy" }], ticker: [] }, updatedAt: "2026-12-01T09:30:00Z" };

async function trackHits(page: Page) {
  const hits: { url: string; body: unknown }[] = [];
  await page.route(`${A}/public/hit/*`, async (r) => {
    if (r.request().method() === "OPTIONS") return r.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" } });
    hits.push({ url: r.request().url(), body: r.request().postDataJSON() });
    return r.fulfill({ status: 204, headers: { "access-control-allow-origin": "*" } });
  });
  return hits;
}

test("the live page counts one page load, even after it refreshes itself", async ({ page }) => {
  await preflight(page);
  const hits = await trackHits(page);
  await page.route(`${A}/public/live/*`, (r) => r.fulfill(json(pub)));
  await page.goto("/live/?e=demo");
  await expect(page.getByRole("heading", { level: 1, name: "Spring Cup" }).first()).toBeVisible();
  await expect.poll(() => hits.length).toBe(1);
  await page.waitForTimeout(1500);
  expect(hits).toHaveLength(1);
  expect(hits[0]!.url).toContain("/public/hit/demo");
  expect(hits[0]!.body).toEqual({ source: "live" });
});

test("nothing is sent when the browser says Do Not Track", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "doNotTrack", { get: () => "1" }));
  await preflight(page);
  const hits = await trackHits(page);
  await page.route(`${A}/public/live/*`, (r) => r.fulfill(json(pub)));
  await page.goto("/live/?e=demo");
  await expect(page.getByRole("heading", { level: 1, name: "Spring Cup" }).first()).toBeVisible();
  await page.waitForTimeout(1500);
  expect(hits).toHaveLength(0);
});

const days = (n: number) => Array.from({ length: n }, (_, i) => ({ day: `2026-12-${String(i + 1).padStart(2, "0")}`, hits: i === 2 ? 40 : i % 3 }));
async function mockPanel(page: Page, total: number) {
  await signedIn(page, [ev]);
  await page.route(`${A}/events/e1/registration`, (r) => r.fulfill(json({ form: null, counts: { pending: 0, approved: 0, rejected: 0 } })));
  await page.route(`${A}/events/e1/members`, (r) => r.fulfill(json({ owner: null, members: [] })));
  await page.route(`${A}/events/e1/live`, (r) => r.fulfill(json({ slug: "demo", published: true, snapshot: { views: [], announcements: [], sponsors: [{ name: "Acme Energy" }, { name: "Bolt Cola" }], ticker: [] }, updatedAt: "" })));
  const d = total ? days(10) : [];
  await page.route(`${A}/events/e1/sponsor-report**`, (r) => r.fulfill(json({
    from: "2026-12-01", to: "2026-12-10", total, days: d, bySource: total ? { live: 30, overlay: 12, embed: 5 } : { live: 0, overlay: 0, embed: 0 },
    byView: total ? [{ source: "live", view: "", hits: 30 }, { source: "overlay", view: "table", hits: 12 }] : [], peak: total ? { day: "2026-12-03", hits: 40 } : null,
  })));
}

test("the panel shows loads, an accessible chart, honest copy and downloads a one page PDF", async ({ page }) => {
  test.setTimeout(90_000);
  await mockPanel(page, 47);
  await page.goto("/app/events/?id=e1");
  await openPanel(page, "share", "sponsorreport");
  const panel = page.getByRole("region", { name: "Sponsor report" });
  await expect(panel.getByRole("heading", { name: /Step 1: Pick the period/ })).toBeVisible();
  await expect(panel.getByTestId("sr-numbers").getByText(/47 page loads/).first()).toBeVisible();
  await expect(panel.getByRole("img", { name: /Page loads by day/ })).toBeVisible();
  await expect(panel.getByText("Live page", { exact: true })).toBeVisible();
  await expect(panel.getByText("Stream overlay").first()).toBeVisible();
  await expect(panel.getByText("Embedded widgets").first()).toBeVisible();
  await expect(panel.getByText("Every page load showed these sponsors.")).toBeVisible();
  await expect(panel.getByText("Acme Energy")).toBeVisible();
  await expect(panel.getByText(/This counts page loads, not unique people/)).toBeVisible();
  await expect(panel.getByText(/\b(viewers|audience|reach)\b/i)).toHaveCount(0);
  await panel.getByText("Last 7 days").click();
  const [dl] = await Promise.all([page.waitForEvent("download", { timeout: 60_000 }), panel.getByRole("button", { name: "Download the report (PDF)" }).click()]);
  expect(dl.suggestedFilename()).toBe("Spring-Cup-sponsor-report.pdf");
  const bytes = fs.readFileSync((await dl.path())!);
  expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
  expect((bytes.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length).toBe(1);
});

test("the panel has a plain empty state and a plain error state", async ({ page }) => {
  await mockPanel(page, 0);
  await page.goto("/app/events/?id=e1");
  await openPanel(page, "share", "sponsorreport");
  const panel = page.getByRole("region", { name: "Sponsor report" });
  await expect(panel.getByTestId("sr-empty")).toContainText("Nothing has been counted");
  await expect(panel.getByRole("button", { name: "Check again" })).toBeVisible();
  await page.unroute(`${A}/events/e1/sponsor-report**`);
  await page.route(`${A}/events/e1/sponsor-report**`, (r) => r.fulfill(json({ error: "x" }, 500)));
  await panel.getByText("Last 7 days").click();
  await expect(panel.getByRole("alert").filter({ hasText: /\S/ }).first()).toContainText("The server had a problem");
});
