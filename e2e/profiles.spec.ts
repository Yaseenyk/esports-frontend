// Team pages: the public page and the panel's three steps, with the server mocked so nothing real is touched.
import { expect, test } from "@playwright/test";
import { json, openPanel, preflight, signedIn } from "./helpers";

const API = "**/esports-api.yaseenyk.workers.dev";
const TEAM = {
  name: "Alpha Wolves", blurb: "We play for fun.", links: ["https://instagram.com/alphawolves"], updatedAt: "2026-12-01T10:00:00Z",
  history: [{ eventName: "Spring Cup", date: "2026-12-01", record: { played: 3, wins: 2, draws: 0, losses: 1 }, br: { matches: 2, bestPlacement: 2, kills: 9 } }],
};

test("the public team page shows the record, the history and a share button, and no player details", async ({ page }) => {
  await preflight(page);
  await page.route(`${API}/public/team/*`, (r) => r.fulfill(json(TEAM)));
  await page.goto("/team/?s=abcdefghijkl");
  await expect(page.getByRole("heading", { level: 1, name: "Alpha Wolves" })).toBeVisible();
  await expect(page.getByText("We play for fun.")).toBeVisible();
  await expect(page.getByRole("link", { name: /Instagram/ })).toHaveAttribute("href", "https://instagram.com/alphawolves");
  await expect(page.getByRole("region", { name: "Record" })).toContainText("Wins");
  await expect(page.getByRole("region", { name: "Results history" })).toContainText("Spring Cup");
  await expect(page.getByRole("region", { name: "Results history" })).toContainText("3 matches: 2 won, 0 drawn, 1 lost");
  await expect(page.getByText(/no player names, photos or contact details/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Share this page" })).toBeVisible();
  expect((await page.evaluate(() => document.querySelector('meta[name="robots"]')?.getAttribute("content"))) ?? "").toContain("noindex");
});

test("a missing, unpublished or malformed link says the page is not available", async ({ page }) => {
  await preflight(page);
  await page.route(`${API}/public/team/*`, (r) => r.fulfill(json({ error: "not_found" }, 404)));
  await page.goto("/team/?s=abcdefghijkl");
  await expect(page.getByRole("heading", { name: "This team page is not available" })).toBeVisible();
  await page.goto("/team/?s=bad");
  await expect(page.getByRole("heading", { name: "This team page is not available" })).toBeVisible();
});

test("a failing server shows a plain error with a retry button", async ({ page }) => {
  await preflight(page);
  let n = 0;
  await page.route(`${API}/public/team/*`, (r) => (++n <= 1 ? r.fulfill(json({ error: "x" }, 400)) : r.fulfill(json(TEAM))));
  await page.goto("/team/?s=abcdefghijkl");
  await expect(page.getByRole("alert").filter({ hasText: /\S/ })).toContainText("Check your connection");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Alpha Wolves" })).toBeVisible();
});

test("the panel: publishing needs consent, then the page can be taken down after a confirmation", async ({ page }) => {
  const EV = { id: "ev1", key: "k", name: "Spring Cup", game: "BGMI", organiser: "Org", date: "2026-12-01", venue: "Hall", emergency: "", rules: "", settings: {}, updatedAt: "", role: "owner" };
  await signedIn(page, [EV]);
  let profile: Record<string, unknown> | null = null;
  const calls: string[] = [];
  await page.route(`${API}/events/ev1/matches`, (r) => r.fulfill(json({ matches: [{ id: "m1", stage: "main", round: 1, slot: 1, a: "Alpha Wolves", b: "Beta Hawks", status: "finished", scoreA: 2, scoreB: 0, winner: "a", startsAt: null, nextId: null, nextSide: null, updatedAt: "" }], br: [] })));
  await page.route(`${API}/events/ev1/roster`, (r) => r.fulfill(json({ teams: [{ id: "t1", name: "Alpha Wolves" }], people: [] })));
  await page.route(`${API}/profiles**`, async (r) => {
    const req = r.request(), url = new URL(req.url()), body = req.postDataJSON?.() ?? {};
    calls.push(`${req.method()} ${url.pathname.replace(/^.*\/profiles/, "/profiles")}`);
    const base = { id: "p1", slug: "abcdefghijkl", updatedAt: "", consentAt: null, published: false, events: [] as unknown[], links: [] as string[], blurb: "", name: "" };
    if (req.method() === "GET") return r.fulfill(json({ profiles: profile ? [profile] : [] }));
    if (req.method() === "DELETE") { profile = null; return r.fulfill(json({ ok: true })); }
    if (url.pathname.endsWith("/link")) { profile = { ...profile, events: [{ eventId: "ev1", eventName: "Spring Cup", teamName: body.teamName }] }; return r.fulfill(json(profile, 201)); }
    profile = { ...base, ...(profile ?? {}), ...body, consentAt: body.published ? "2026-12-01T10:00:00Z" : null, ...(body.published === false ? { consent: undefined } : {}) };
    return r.fulfill(json(profile, req.method() === "POST" ? 201 : 200));
  });
  await page.goto("/app/events/?id=ev1");
  await openPanel(page, "share", "profiles");
  await expect(page.getByText("You have no team pages yet")).toBeVisible();
  await page.getByRole("combobox", { name: "Team" }).selectOption("Alpha Wolves");
  await expect(page.getByLabel("Team name")).toHaveValue("Alpha Wolves");
  await page.getByLabel("Short blurb (optional)").fill("We play for fun.");
  await expect(page.getByLabel("Live preview")).toContainText("1 won");
  await expect(page.getByRole("button", { name: "Publish page" })).toBeDisabled();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Publish page" }).click();
  await expect(page.getByText(/Published\. Anyone with the link/)).toBeVisible();
  expect(calls).toContain("POST /profiles/p1/link");
  await expect(page.getByText("Public", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /^Delete/ }).click();
  await expect(page.getByText(/cannot be brought back/)).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByText("Public", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /^Delete/ }).click();
  await page.getByRole("button", { name: "Yes, delete it" }).click();
  await expect(page.getByText(/was deleted/)).toBeVisible();
});
