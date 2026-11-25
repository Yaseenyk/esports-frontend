// Builder C (25 Nov 2026): private match journal, server badges, stats story card. The API is MOCKED (route interception).
// Run one project at a time:  npx playwright test e2e/b2c-c.spec.ts --project=desktop  (then --project=phone)
import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { adultOk, mockV3, v3SignedIn } from "./v3-helpers";

test.setTimeout(120_000);

const TOKEN = "AbCdEfGhIjKlMnOpQrStUv";
const axe = async (page: Page) => {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)).toBe(false);
};

const entry = (id: string, over: Record<string, unknown> = {}) => ({ id: id.padEnd(32, "0"), playedOn: "2026-11-10", game: "bgmi", mode: "Squad", map: "Erangel", placement: 3, kills: 5, damage: 700, notes: null, createdAt: "2026-11-10T10:00:00.000Z", updatedAt: "2026-11-10T10:00:00.000Z", ...over });

// ---------------------------------------------------------------- journal
test("journal: flag off shows Not available and calls nothing else", async ({ page }) => {
  const seen = await v3SignedIn(page, { ...adultOk });
  await page.goto("/app/journal/");
  await expect(page.getByRole("heading", { level: 1, name: "Match journal" })).toBeVisible();
  await expect(page.getByText("Not available yet")).toBeVisible();
  expect(seen.filter((s) => s.method !== "GET")).toEqual([]);
});

test("journal: log a match, see progress as charts and as a table, export CSV, delete all; labelled self-logged and masked", async ({ page }) => {
  let items = [entry("a1", { playedOn: "2026-11-02", kills: 2, placement: 4 }), entry("b2", { playedOn: "2026-11-10", kills: 8, placement: 1, notes: "=cmd|' /C calc'!A0" })];
  const posted: Record<string, unknown>[] = [];
  const seen = await v3SignedIn(page, {
    ...adultOk,
    "GET /v3/me/journal": () => ({ body: { items, count: items.length, cap: 2000, selfLogged: true } }),
    "POST /v3/me/journal": ({ body }) => { posted.push(body as Record<string, unknown>); const e = entry("c3", body as Record<string, unknown>); items = [e, ...items]; return { status: 201, body: { item: e } }; },
    "POST /v3/me/journal/clear": () => { const n = items.length; items = []; return { body: { ok: true, deleted: n } }; },
  });
  await page.goto("/app/journal/");
  await expect(page.getByRole("heading", { name: /Progress/ })).toContainText("Self-logged");
  await expect(page.locator("[data-clarity-mask]")).toHaveCount(1);
  await expect(page.getByRole("img", { name: /Matches per week/ })).toBeVisible();
  await expect(page.getByRole("img", { name: /Kills per match/ })).toBeVisible();
  // validation stays in the page; nothing is sent
  await page.getByRole("textbox", { name: "Kills" }).fill("abc");
  await page.getByRole("button", { name: "Save match" }).click();
  await expect(page.getByText(/Kills: a whole number/)).toBeVisible();
  expect(posted).toHaveLength(0);
  await page.getByRole("textbox", { name: "Kills" }).fill("6");
  await page.getByLabel("Placement (optional)").fill("2");
  await page.getByLabel("Notes (optional)").fill("<b>not html</b>");
  await page.getByRole("button", { name: "Save match" }).click();
  await expect(page.getByText(/plain text/)).toBeVisible();
  await page.getByLabel("Notes (optional)").fill("Hot drop, went well");
  await page.getByRole("button", { name: "Save match" }).click();
  await expect(page.getByText("Match saved to your journal.")).toBeVisible();
  expect(posted[0]).toMatchObject({ game: "bgmi", kills: 6, placement: 2, notes: "Hot drop, went well" });
  await expect(page.getByText("Hot drop, went well")).toBeVisible();
  // table view
  await page.getByRole("button", { name: "Show as a table" }).click();
  await expect(page.getByRole("table")).toBeVisible();
  await axe(page);
  // CSV, made in the browser, formula defused
  const [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download CSV" }).click()]);
  expect(dl.suggestedFilename()).toMatch(/^match-journal-\d{4}-\d{2}-\d{2}\.csv$/);
  const csv = readFileSync((await dl.path())!, "utf8");
  expect(csv).toContain("date,game,mode,map,placement,kills,damage,notes");
  expect(csv).toContain("\"'=cmd");
  // delete all needs a second click
  await page.getByRole("button", { name: "Delete all matches" }).click();
  await page.getByRole("button", { name: "Yes, delete all" }).click();
  await expect(page.getByText(/Your journal is empty/)).toBeVisible();
  expect(JSON.parse(seen.find((s) => s.path === "/v3/me/journal/clear")!.body)).toEqual({ confirm: true });
  await expect(page.getByRole("heading", { name: "No matches yet" })).toBeVisible();
});

test("journal: notes render as text, never as HTML", async ({ page }) => {
  await v3SignedIn(page, { ...adultOk, "GET /v3/me/journal": () => ({ body: { items: [entry("x1", { notes: "<img src=x onerror=alert(1)>" })], cap: 2000 } }) });
  let dialog = false;
  page.on("dialog", (d) => { dialog = true; void d.dismiss(); });
  await page.goto("/app/journal/");
  await expect(page.getByText("<img src=x onerror=alert(1)>")).toBeVisible();
  await expect(page.locator("main img[src='x']")).toHaveCount(0);
  expect(dialog).toBe(false);
});

// ---------------------------------------------------------------- badges on the shared page
const CARD_PAGE = {
  kind: "player", slug: null, handle: "RaviIGL", bio: null, city: null, state: null, languages: [], teamName: "Alpha Wolves",
  games: [{ game: "bgmi", inGameName: "RaviOP", rankCode: null, rankOrdinal: null, roles: ["igl"] }], links: [], achievements: [],
  stats: { source: "verified_results", tournaments: 1, matches: { played: 0, wins: 0, losses: 0, draws: 0 }, battleRoyale: { matches: 2, wins: 1, kills: 18, bestPlacement: 1 } },
  badges: [{ id: "first_win", title: "First win" }, { id: "not_a_badge", title: "Fake badge" }],
  visibility: "unlisted", indexable: false, teams: [], matches: [], battleRoyale: [], certificates: [], updatedAt: "2030-01-06T00:00:00.000Z",
};

test("shared page: badges show with their rule, unknown ids are dropped, and they are labelled as recorded (not typed)", async ({ page }) => {
  await mockV3(page, { [`GET /public/profiles/cards/${TOKEN}`]: () => ({ body: CARD_PAGE }) });
  await page.goto(`/p/?k=${TOKEN}`);
  const sec = page.locator("section", { has: page.getByRole("heading", { name: /Badges/ }) });
  await expect(sec).toContainText("First win");
  await expect(sec).toContainText("Win a verified match");
  await expect(sec).toContainText("Recorded by Esports Hub");
  await expect(page.getByText("Fake badge")).toHaveCount(0);
  await axe(page);
});

test("shared page: no badges section when the API sends none (flag off)", async ({ page }) => {
  await mockV3(page, { [`GET /public/profiles/cards/${TOKEN}`]: () => ({ body: { ...CARD_PAGE, badges: [] } }) });
  await page.goto(`/p/?k=${TOKEN}`);
  await expect(page.getByRole("heading", { level: 1, name: "RaviIGL" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Badges/ })).toHaveCount(0);
});

// ---------------------------------------------------------------- owner: badges panel and story card
const PROFILE = { slug: "ravi", handle: "RaviIGL", bio: null, city: null, state: null, languages: [], visibility: "unlisted", games: [{ game: "bgmi", inGameName: "RaviOP", rankCode: "", rankOrdinal: 0, roles: ["igl"] }], stats: null, adultConfirmedAt: "2030-01-01T00:00:00.000Z", resumeConsentAt: "2030-01-01T00:00:00.000Z", createdAt: "2030-01-01T00:00:00.000Z", updatedAt: "2030-01-01T00:00:00.000Z" };
const DETAILS = { teamName: "Alpha Wolves", links: [], achievements: [], hiddenFields: [], searchOptIn: false };
const own = { page: { slug: "ravi", visibility: "unlisted", path: `/p/?k=${TOKEN}`, cardPath: `/p/?k=${TOKEN}`, cardCreatedAt: null, details: DETAILS, indexable: false, indexBlockers: ["not_public"], hiddenByModeration: false, teams: [], entries: [], matches: [], battleRoyale: [], certificates: [] } };
const statusOk = { "GET /v3/me/status": () => ({ body: { adultConfirmedAt: "2030-01-01T00:00:00.000Z", resumeConsentAt: "2030-01-01T00:00:00.000Z" } }) };
const badgeList = (hidden: boolean) => ({ items: [
  { id: "first_tournament", title: "First tournament", rule: "x", earned: true, hidden: false },
  { id: "first_win", title: "First win", rule: "x", earned: true, hidden },
  { id: "verified_5", title: "5 verified results", rule: "x", earned: false, hidden: false },
], sectionHidden: false });

test("owner: badge panel says badges are not device XP, and each earned badge has a show/hide switch", async ({ page }) => {
  let hidden = false;
  const seen = await v3SignedIn(page, {
    ...adultOk, ...statusOk, "GET /v3/me/profile": () => ({ body: { profile: PROFILE } }), "GET /v3/me/player-page": () => ({ body: own }),
    "GET /v3/me/badges": () => ({ body: badgeList(hidden) }),
    "PUT /v3/me/badges/hidden": ({ body }) => { hidden = (body as { hidden: boolean }).hidden; return { body: badgeList(hidden) }; },
    "GET /v3/me/journal": () => ({ body: { items: [], cap: 2000 } }),
  });
  await page.goto("/app/resume/");
  const panel = page.getByRole("region", { name: "Badges", exact: true });
  await expect(panel).toContainText("are not badges");
  await panel.getByRole("checkbox", { name: /First win/ }).click();
  await expect(panel.getByRole("checkbox", { name: /First win/ })).not.toBeChecked();
  await expect(panel.getByText("(hidden)")).toBeVisible();
  expect(JSON.parse(seen.find((s) => s.path === "/v3/me/badges/hidden")!.body)).toEqual({ badge: "first_win", hidden: true });
  await expect(page.getByRole("link", { name: "match journal" })).toHaveAttribute("href", "/app/journal/");
  await expect(page.getByRole("checkbox", { name: "Badges", exact: true })).toBeVisible(); // the whole-section field switch
  await axe(page);
});

test("story card: drawn in the browser at 1080x1920 or 1080x1350 from the shared page; journal numbers only when ticked", async ({ page }) => {
  const seen = await v3SignedIn(page, {
    ...statusOk, "GET /v3/me/profile": () => ({ body: { profile: PROFILE } }), "GET /v3/me/player-page": () => ({ body: own }),
    [`GET /public/profiles/cards/${TOKEN}`]: () => ({ body: CARD_PAGE }),
    "GET /v3/me/journal": () => ({ body: { items: [entry("a1"), entry("b2", { kills: 9 })], cap: 2000 } }),
  });
  await page.goto("/app/player-card/");
  await expect(page.getByRole("heading", { name: "Stats for your Instagram or WhatsApp story" })).toBeVisible();
  const img = page.getByTestId("story-preview");
  await expect(img).toBeVisible();
  await expect.poll(() => img.evaluate((i: HTMLImageElement) => `${i.naturalWidth}x${i.naturalHeight}`)).toBe("1080x1920");
  const opt = page.getByRole("checkbox", { name: /Add my match journal numbers/ });
  await expect(opt).not.toBeChecked();
  await opt.check();
  await page.getByRole("button", { name: "Post 1080 x 1350" }).click();
  await expect.poll(() => img.evaluate((i: HTMLImageElement) => `${i.naturalWidth}x${i.naturalHeight}`)).toBe("1080x1350");
  const [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download picture" }).click()]);
  expect(dl.suggestedFilename()).toBe("stats-portrait-raviigl.png");
  const png = readFileSync((await dl.path())!);
  expect(png.readUInt32BE(16)).toBe(1080);
  expect(png.readUInt32BE(20)).toBe(1350);
  expect(seen.filter((s) => s.method !== "GET")).toEqual([]); // nothing is uploaded
  await axe(page);
});
