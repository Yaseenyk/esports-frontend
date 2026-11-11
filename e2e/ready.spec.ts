// The captain ready page and the organiser panel, with the server mocked so nothing real is touched.
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { json, openPanel, preflight, signedIn } from "./helpers";

const API = "**/esports-api.yaseenyk.workers.dev";
const TOKEN = "t".repeat(32);
const EVENT = { id: "e1", key: "cup", name: "Spring Cup", game: "BGMI", organiser: "", date: "2026-12-01", venue: "", emergency: "", rules: "", settings: {}, updatedAt: "", role: "owner" };
const inMin = (n: number) => new Date(Date.now() + n * 60_000).toISOString();

interface CapState { youReady: boolean; opponentReady: boolean; startsAt: string; opponent: string; status: string }
function captainBody(s: CapState) {
  return {
    team: "Alpha Wolves", eventName: "Spring Cup", graceMinutes: 10, serverTime: new Date().toISOString(),
    matches: [{ id: "m1", stage: "main", round: 1, opponent: s.opponent, startsAt: s.startsAt, status: s.status, youReady: s.youReady, opponentReady: s.opponentReady, minutesToGrace: 20, canMark: true }],
  };
}
async function mockCaptain(page: Page, s: CapState) {
  const posts: unknown[] = [];
  await preflight(page);
  await page.route(`${API}/public/ready/*/matches/*`, (r) => {
    const b = r.request().postDataJSON() as { ready: boolean };
    posts.push(b);
    s.youReady = b.ready;
    return r.fulfill(json({ ok: true, youReady: s.youReady, opponentReady: s.opponentReady, status: "scheduled" }));
  });
  await page.route(`${API}/public/ready/*`, (r) => (r.request().url().includes("/matches/") ? r.fallback() : r.fulfill(json(captainBody(s)))));
  return posts;
}

test("a captain taps We are here and sees that the opponent is not ready yet", async ({ page }) => {
  const s: CapState = { youReady: false, opponentReady: false, startsAt: inMin(20), opponent: "Beta Hawks", status: "scheduled" };
  const posts = await mockCaptain(page, s);
  await page.goto(`/ready/?t=${TOKEN}`);
  await expect(page.getByRole("heading", { level: 1, name: "Alpha Wolves" })).toBeVisible();
  await expect(page.getByText("Tap when your team is here")).toBeVisible();
  await page.getByRole("button", { name: "We are here" }).click();
  await expect(page.getByText("Waiting for your opponent", { exact: true })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "organiser can see that you are here" })).toBeVisible();
  expect(posts).toEqual([{ ready: true }]);
  await expect(page.getByRole("button", { name: "We are here" })).toHaveCount(0);
  expect((await page.evaluate(() => document.querySelector('meta[name="robots"]')?.getAttribute("content"))) ?? "").toContain("noindex");
});

test("the early state explains when the button opens, and both-ready says wait", async ({ page }) => {
  const s: CapState = { youReady: false, opponentReady: false, startsAt: inMin(120), opponent: "Beta Hawks", status: "scheduled" };
  await mockCaptain(page, s);
  await page.goto(`/ready/?t=${TOKEN}`);
  await expect(page.getByText("Not time to check in yet")).toBeVisible();
  await expect(page.getByRole("button", { name: "We are here" })).toHaveCount(0);
  s.startsAt = inMin(10); s.youReady = true; s.opponentReady = true;
  await page.reload();
  await expect(page.getByText("Both teams are ready", { exact: true })).toBeVisible();
});

test("a bad link says so in plain words, and a captain with no match sees an empty state", async ({ page }) => {
  await preflight(page);
  await page.route(`${API}/public/ready/*`, (r) => r.fulfill(json({ error: "This link is not valid." }, 404)));
  await page.goto(`/ready/?t=${TOKEN}`);
  await expect(page.getByRole("heading", { name: "This link does not work" })).toBeVisible();
  await page.goto("/ready/");
  await expect(page.getByRole("heading", { name: "This link does not work" })).toBeVisible();
});

test("the captain page passes the accessibility check", async ({ page }) => {
  await mockCaptain(page, { youReady: false, opponentReady: true, startsAt: inMin(5), opponent: "Beta Hawks", status: "scheduled" });
  await page.goto(`/ready/?t=${TOKEN}`);
  await expect(page.getByRole("button", { name: "We are here" })).toBeVisible();
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  const bad = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
});

const row = (id: string, a: string, b: string, startMin: number, o: Record<string, unknown> = {}) => ({ id, stage: "main", round: 1, slot: 1, a, b, status: "scheduled", startsAt: inMin(startMin), aReady: false, bReady: false, aReadyAt: null, bReadyAt: null, graceDeadline: null, late: [], ...o });

test("the organiser board groups matches and a forfeit needs a confirmation that states the consequence", async ({ page }) => {
  await signedIn(page, [EVENT]);
  const forfeits: unknown[] = [];
  const settings: unknown[] = [];
  let matches = [row("m1", "Alpha Wolves", "Beta Hawks", -20, { bReady: true }), row("m2", "Gamma", "Delta", 30), row("m3", "Echo", "Foxtrot", 5, { aReady: true, bReady: true, status: "ready" })];
  await page.route(`${API}/events/e1/ready/settings`, (r) => { settings.push(r.request().postDataJSON()); return r.fulfill(json({ settings: { graceMinutes: 15 } })); });
  await page.route(`${API}/events/e1/ready/m1/forfeit`, (r) => {
    forfeits.push(r.request().postDataJSON());
    matches = [row("m2", "Gamma", "Delta", 30), row("m3", "Echo", "Foxtrot", 5, { aReady: true, bReady: true, status: "ready" })];
    return r.fulfill(json({ match: {}, changed: [] }));
  });
  await page.route(`${API}/events/e1/ready`, (r) => r.fulfill(json({ settings: { graceMinutes: 10 }, serverTime: new Date().toISOString(), matches })));
  await page.route(`${API}/events/e1/**`, (r) => (r.request().url().includes("/ready") ? r.fallback() : r.fulfill(json({ error: "not_found" }, 404))));
  await page.goto("/app/events/?id=e1");
  await openPanel(page, "run", "ready");
  const panel = page.getByRole("region", { name: "Team ready check", exact: true });
  await expect(panel.getByRole("region", { name: "Late" })).toContainText("Alpha Wolves");
  await expect(panel.getByRole("region", { name: "Starting soon" })).toContainText("Gamma");
  await expect(panel.getByRole("region", { name: "Ready" })).toContainText("Echo");

  await panel.getByLabel("Grace period in minutes").fill("15");
  await panel.getByRole("button", { name: "Save grace period" }).click();
  await expect(panel.getByText(/Saved\. A team counts as late 15 minutes/)).toBeVisible();
  expect(settings).toEqual([{ graceMinutes: 15 }]);

  await panel.getByRole("button", { name: "Mark Alpha Wolves as forfeit" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("Beta Hawks will win this match");
  await dialog.getByRole("button", { name: /Cancel/ }).click();
  expect(forfeits).toEqual([]);
  await panel.getByRole("button", { name: "Mark Alpha Wolves as forfeit" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Yes, Alpha Wolves forfeits" }).click();
  await expect(panel.getByText("Alpha Wolves is recorded as a forfeit. Beta Hawks wins.")).toBeVisible();
  expect(forfeits).toEqual([{ team: "Alpha Wolves", noShow: false }]);
});

test("the board has an empty state that says what to do next", async ({ page }) => {
  await signedIn(page, [EVENT]);
  await page.route(`${API}/events/e1/ready`, (r) => r.fulfill(json({ settings: { graceMinutes: 10 }, serverTime: new Date().toISOString(), matches: [] })));
  await page.route(`${API}/events/e1/**`, (r) => (r.request().url().endsWith("/ready") ? r.fallback() : r.fulfill(json({ error: "not_found" }, 404))));
  await page.goto("/app/events/?id=e1");
  await openPanel(page, "run", "ready");
  await expect(page.getByText("No upcoming matches yet")).toBeVisible();
});
