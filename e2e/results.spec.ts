// The captain page and the organiser panel, with the server mocked so nothing real is touched.
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { json, preflight } from "./helpers";

const API = "**/esports-api.yaseenyk.workers.dev";
const TOKEN = "captaintoken_abcdefghijklmnop";

const view = (over: Record<string, unknown> = {}) => ({
  event: { name: "Spring Cup", date: "2026-12-01" },
  team: "Alpha Wolves",
  matches: [
    { id: "m1", stage: "main", round: 1, slot: 1, side: "a", a: "Alpha Wolves", b: "Beta Hawks", opponent: "Beta Hawks", status: "scheduled", scoreA: null, scoreB: null, startsAt: null, canReport: true, disputed: false, submission: null },
    { id: "m2", stage: "main", round: 2, slot: 1, side: "b", a: "", b: "Alpha Wolves", opponent: "", status: "scheduled", scoreA: null, scoreB: null, startsAt: null, canReport: false, disputed: false, submission: null },
  ],
  ...over,
});

async function mockReport(page: Page, body: () => unknown, onPost?: (b: any) => void) {
  await preflight(page);
  await page.route(`${API}/public/report/${TOKEN}`, (r) => r.fulfill(json(body())));
  await page.route(`${API}/public/report/${TOKEN}/matches/m1`, (r) => { onPost?.(JSON.parse(r.request().postData() ?? "{}")); return r.fulfill(json({ ok: true, id: "s1", status: "pending", disputed: false }, 201)); });
}

test("a captain picks a match, sets the score, confirms and sees it was sent", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  let sent: any = null;
  await mockReport(page, () => view(), (b) => { sent = b; });
  await page.goto(`/report/?t=${TOKEN}`);
  await expect(page.getByRole("heading", { level: 1, name: "Alpha Wolves" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your matches" })).toBeVisible();
  await expect(page.getByText("Your opponent is not decided yet")).toBeVisible();
  await page.getByRole("button", { name: "Send the score" }).click();
  await page.getByRole("button", { name: /One more for Alpha Wolves/ }).click();
  await page.getByRole("button", { name: /One more for Alpha Wolves/ }).click();
  await page.getByRole("button", { name: /One more for Beta Hawks/ }).click();
  await expect(page.getByText("Do not include phone numbers")).toBeVisible();
  await page.getByRole("button", { name: "Check and send" }).click();
  await expect(page.getByRole("heading", { name: "Is this correct?" })).toBeVisible();
  await expect(page.getByText("Alpha Wolves 2 - 1 Beta Hawks")).toBeVisible();
  await page.getByRole("button", { name: "Yes, send it" }).click();
  await expect(page.getByRole("heading", { name: "Sent to the organiser" })).toBeVisible();
  await expect(page.getByText("You will see it here when it is approved")).toBeVisible();
  expect(sent).toMatchObject({ scoreA: 2, scoreB: 1 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("a bad link and a failed send are explained in plain words", async ({ page }) => {
  await preflight(page);
  await page.goto("/report/?t=short");
  await expect(page.getByRole("heading", { name: "This link does not work" })).toBeVisible();
  await page.route(`${API}/public/report/${TOKEN}`, (r) => r.fulfill(json(view())));
  await page.route(`${API}/public/report/${TOKEN}/matches/m1`, (r) => r.fulfill(json({ error: "This match already has a result. Ask the organiser if it is wrong." }, 409)));
  await page.goto(`/report/?t=${TOKEN}`);
  await page.getByRole("button", { name: "Send the score" }).click();
  await page.getByRole("button", { name: "Check and send" }).click();
  await page.getByRole("button", { name: "Yes, send it" }).click();
  await expect(page.getByRole("alert").filter({ hasText: /\S/ })).toContainText("already has a result");
});

test("an approved or rejected score shows its status and reason", async ({ page }) => {
  await mockReport(page, () => view({ matches: [{ ...view().matches[0], submission: { id: "s1", status: "rejected", scoreA: 2, scoreB: 1, note: "", rejectReason: "Screenshot is blurry", createdAt: "2026-12-01T10:00:00Z", decidedAt: null, hasProof: true } }] }));
  await page.goto(`/report/?t=${TOKEN}`);
  await expect(page.getByText("Not accepted: Screenshot is blurry")).toBeVisible();
  await expect(page.getByRole("button", { name: "Send the score" })).toBeVisible();
});

test("the report page passes the accessibility check", async ({ page }) => {
  await mockReport(page, () => view());
  await page.goto(`/report/?t=${TOKEN}`);
  await expect(page.getByRole("heading", { name: "Your matches" })).toBeVisible();
  await page.waitForLoadState("networkidle");
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  const bad = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
  expect((await page.evaluate(() => document.querySelector('meta[name="robots"]')?.getAttribute("content"))) ?? "").toContain("noindex");
});
