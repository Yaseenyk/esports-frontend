// The stream overlay (OBS browser source), with the public live API mocked so nothing real is touched.
import { expect, test, type Page } from "@playwright/test";
import { json, preflight } from "./helpers";

const API = "**/esports-api.yaseenyk.workers.dev";
const table = (title: string, head: string[], rows: string[][]) => ({ v: "table", d: { title, head, rows } });

const VIEWS = [
  { kind: "standings", payload: table("Group stage standings", ["#", "Team", "Kills", "Total"], [["1", "Alpha", "10", "30"], ["2", "Bravo", "8", "25"]]) },
  { kind: "league", payload: table("League table", ["#", "Team", "P", "Pts"], [["1", "Charlie", "2", "6"], ["2", "Delta", "2", "3"]]) },
  { kind: "schedule", payload: { v: "schedule", d: { title: "Match day schedule", slots: [{ n: 1, start: "23:58", end: "23:59", label: "Alpha vs Bravo" }] } } },
  { kind: "bracket", payload: { v: "bracket", d: { title: "Knockout bracket", sections: [{ name: "", rounds: [{ name: "Semi final", matches: [{ a: "Charlie", b: "Delta" }] }] }] } } },
  { kind: "countdown", payload: { v: "countdown", d: { title: "Finals start in", at: "2099-01-01T10:00:00Z" } } },
];
const MATCHES = [
  { id: "m1", stage: "main", round: 1, slot: 1, a: "Alpha", b: "Bravo", status: "live", scoreA: 7, scoreB: 5, startsAt: null },
  { id: "m2", stage: "main", round: 2, slot: 1, a: "Charlie", b: "Delta", status: "scheduled", scoreA: null, scoreB: null, startsAt: "2099-01-01T15:40:00Z" },
];
const body = (over: Record<string, unknown> = {}, matches: unknown[] = MATCHES) => ({
  event: { name: "Spring Cup", date: "2026-12-01", venue: "City Arena" },
  snapshot: { views: VIEWS, announcements: [], sponsors: [{ name: "Acme Energy" }], ticker: ["Free parking at gate 2"], ...over },
  matches, updatedAt: "2026-12-01T09:30:00Z",
});
const mock = (page: Page, fn: () => { status?: number; body: unknown }) => page.route(`${API}/public/live/*`, (r) => { const x = fn(); return r.fulfill(json(x.body, x.status ?? 200)); });

test("the page background is transparent and nothing from the site shows", async ({ page }) => {
  await preflight(page);
  await mock(page, () => ({ body: body() }));
  await page.goto("/overlay/?e=demo&v=standings");
  await expect(page.getByText("Group stage standings")).toBeVisible();
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
  await expect(page.locator("footer")).toBeHidden();
  expect((await page.evaluate(() => document.querySelector('meta[name="robots"]')?.getAttribute("content"))) ?? "").toContain("noindex");
  await page.goto("/overlay/?e=demo&v=standings&bg=solid");
  await expect(page.getByText("Group stage standings")).toBeVisible();
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).not.toBe("rgba(0, 0, 0, 0)");
});

test("each view renders", async ({ page }) => {
  await preflight(page);
  await mock(page, () => ({ body: body() }));
  for (const [v, text] of [["standings", "Group stage standings"], ["league", "League table"], ["schedule", "Match day schedule"], ["bracket", "Knockout bracket"], ["countdown", "Finals start in"], ["matches", "Up next"]]) {
    await page.goto(`/overlay/?e=demo&v=${v}&theme=neon`);
    await expect(page.getByText(text, { exact: false }).first()).toBeVisible();
  }
  await page.goto("/overlay/?e=demo&v=nextmatch");
  await expect(page.getByRole("status", { name: "LIVE: Alpha 7 - 5 Bravo" })).toBeVisible();
  await page.goto("/overlay/?e=demo&v=ticker");
  await expect(page.getByRole("marquee", { name: "Announcements" })).toContainText("Free parking at gate 2");
  await page.goto("/overlay/?e=demo&v=sponsors");
  await expect(page.getByRole("list", { name: "Sponsors" })).toContainText("Acme Energy");
});

test("the next-match bar says what is next when nothing is live, and a team can be highlighted", async ({ page }) => {
  await preflight(page);
  await mock(page, () => ({ body: body({}, [MATCHES[1]]) }));
  await page.goto("/overlay/?e=demo&v=nextmatch");
  await expect(page.getByRole("status", { name: /^NEXT: Charlie vs Delta at / })).toBeVisible();
  await page.goto("/overlay/?e=demo&v=standings&team=Bravo");
  await expect(page.locator('li[data-ov-mark="1"]')).toHaveCount(1);
  await expect(page.locator('li[data-ov-mark="1"]')).toContainText("Bravo");
});

test("it updates by itself when the data changes, and keeps the last data when the server fails", async ({ page }) => {
  await preflight(page);
  await page.clock.install();
  let mode: "a" | "b" | "down" = "a";
  await mock(page, () => (mode === "down" ? { status: 500, body: { error: "boom" } } : { body: body({ views: [{ kind: "standings", payload: table(mode === "a" ? "First title" : "Second title", ["#", "Team"], [["1", "Alpha"]]) }] }) }));
  await page.goto("/overlay/?e=demo&v=standings");
  await expect(page.getByText("First title")).toBeVisible();
  mode = "b";
  await page.clock.runFor(11_000);
  await expect(page.getByText("Second title")).toBeVisible();
  await expect(page.getByText("First title")).toHaveCount(0);
  mode = "down";
  await page.clock.runFor(35_000);
  await expect(page.getByText("Second title")).toBeVisible();
  await expect(page.getByText(/error|could not|offline|reconnecting/i)).toHaveCount(0);
  mode = "a";
  await page.clock.runFor(70_000);
  await expect(page.getByText("First title")).toBeVisible();
});

test("a missing or unpublished page shows nothing, not an error", async ({ page }) => {
  await preflight(page);
  await mock(page, () => ({ status: 404, body: { error: "not_found" } }));
  await page.goto("/overlay/?e=nothere&v=standings");
  await page.waitForTimeout(500);
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(page.getByText(/not found|not live|error/i)).toHaveCount(0);
  await page.goto("/overlay/");
  await page.waitForTimeout(300);
  await expect(page.getByText(/error/i)).toHaveCount(0);
});
