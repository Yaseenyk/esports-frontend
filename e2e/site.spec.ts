import fs from "node:fs";
import { expect, test } from "@playwright/test";
import { json, preflight, signedIn } from "./helpers";

const PAGES = ["/", "/games/", "/events/", "/communities/", "/arcade/", "/guides/", "/tools/", "/tools/id-cards/", "/tools/check-in/", "/tools/brackets/", "/tools/points-table/", "/tools/round-robin/", "/tools/schedule/", "/tools/certificates/", "/manage/", "/login/", "/signup/", "/gate/", "/about/", "/privacy/", "/terms/", "/contact/", "/guides/points-table/", "/guides/run-a-campus-tournament/"];

for (const path of PAGES) {
  test(`${path} loads with no errors and no sideways scroll`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => { if (m.type() === "error" && !/favicon|Failed to load resource/.test(m.text())) errors.push(m.text()); });
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1").first()).toBeVisible();
    await page.waitForLoadState("networkidle");
    const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(wide, "page scrolls sideways").toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
  });
}

test("an unknown address shows the not-found page", async ({ page }) => {
  const res = await page.goto("/no-such-page/");
  expect(res?.status()).toBe(404);
});

test("the navigation menu opens, lists the tools and closes with Escape", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /menu/i }).first().click();
  await expect(page.getByRole("dialog", { name: "Hub menu" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("games can be searched", async ({ page }) => {
  await page.goto("/games/");
  const box = page.getByRole("searchbox").or(page.getByPlaceholder(/search/i)).first();
  await box.fill("valorant");
  await expect(page.getByRole("link", { name: /valorant/i }).first()).toBeVisible();
});

test("the public tool pages are real, readable pages for search engines", async ({ page }) => {
  for (const [path, h1] of [["/tools/id-cards/", /ID card maker/i], ["/tools/check-in/", /Gate check-in/i], ["/tools/brackets/", /bracket/i], ["/tools/points-table/", /points table/i]] as const) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(h1);
    await expect(page.getByRole("link", { name: /Create a free account/ }).first()).toHaveAttribute("href", "/signup/");
    expect(await page.locator('script[type="application/ld+json"]').count()).toBeGreaterThan(0);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  }
});

test("the website is open to search engines, but demo-data pages and the app are not", async ({ page, request }) => {
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Allow: /");
  expect(robots).toContain("Disallow: /app/");
  expect(robots).toContain("Sitemap:");
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/guides/points-table/");
  expect(sitemap).toContain("/tools/id-cards/");
  expect(sitemap).not.toContain("/games/");
  expect(sitemap).not.toContain("/events/");
  for (const [path, noindex] of [["/", false], ["/guides/", false], ["/guides/points-table/", false], ["/tools/brackets/", false], ["/about/", false], ["/games/", true], ["/events/", true], ["/communities/", true], ["/login/", true], ["/app/", true]] as const) {
    await page.goto(path);
    const meta = page.locator('meta[name="robots"]');
    if (noindex) await expect(meta).toHaveAttribute("content", /noindex/);
    else expect(await meta.count() === 0 || !/noindex/.test((await meta.getAttribute("content")) ?? "")).toBe(true);
  }
});

test("the home page and the guides carry real content, not demo data", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Free tools and guides/);
  await expect(page.locator("body")).not.toContainText(/made-up|sample data|Monsoon Clash/i);
  await page.goto("/guides/");
  await expect(page.locator("article, a.card").first()).toBeVisible();
  expect(await page.getByRole("heading", { level: 2 }).count()).toBeGreaterThanOrEqual(8);
  await page.goto("/guides/points-table/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/points table/i);
  await expect(page.getByRole("navigation", { name: "On this page" })).toBeVisible();
  await expect(page.getByRole("table").first()).toBeVisible();
});

test("the ID card maker opens on the public tool page with no account", async ({ page }) => {
  await page.goto("/tools/id-cards/");
  await page.getByRole("button", { name: "Open the ID card maker" }).click();
  await expect(page.getByText(/Step 1 of 4/)).toBeVisible({ timeout: 20000 });
});

test("the points table calculator ranks the example, reacts to changes and exports", async ({ page }) => {
  await page.goto("/tools/points-table/");
  const standings = page.getByRole("region", { name: "Standings table" });
  await expect(standings.getByRole("row").nth(1)).toContainText("Charlie");
  await expect(standings.getByRole("row").nth(1)).toContainText("34");
  // Give Alpha a better last match: their kills now decide the lead
  await page.getByLabel("Alpha, match 2, kills").fill("30");
  await expect(standings.getByRole("row").nth(1)).toContainText("Alpha");
  // A broken scale is explained, not silently ignored
  await page.getByLabel(/Placement points/).fill("ten, six");
  await expect(page.getByRole("alert").filter({ hasText: /numbers only/i })).toBeVisible();
  await page.getByLabel(/Placement points/).fill("10, 6, 5, 4, 3, 2, 1, 1");
  const [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download as CSV" }).click()]);
  expect(dl.suggestedFilename()).toBe("points-table.csv");
});

test("the contact form validates and sends", async ({ page }) => {
  await preflight(page);
  let sent: Record<string, unknown> | null = null;
  await page.route("**/esports-api.yaseenyk.workers.dev/public/contact", async (r) => { sent = r.request().postDataJSON(); await r.fulfill(json({ ok: true }, 201)); });
  await page.goto("/contact/");
  await expect(page.getByRole("button", { name: "Send message" })).toBeDisabled();
  await page.getByLabel(/Message/).fill("The points guide has a typo in the third table.");
  await page.getByLabel(/Your email/).fill("asha@example.com");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Thank you. Your message was sent.")).toBeVisible();
  expect((sent as unknown as Record<string, string>).website).toBe(""); // the bot trap stayed empty
});

test("the app sends a signed-out visitor to sign in and brings them back afterwards", async ({ page }) => {
  await preflight(page);
  await page.route("**/esports-api.yaseenyk.workers.dev/auth/login", (r) => r.fulfill(json({ token: "t", user: { id: "u", email: "a@example.com", name: "Asha Test" } })));
  await page.route("**/esports-api.yaseenyk.workers.dev/events", (r) => r.fulfill(json([])));
  await page.goto("/app/brackets/");
  await expect(page).toHaveURL(/\/login\/\?next=%2Fapp%2Fbrackets%2F/);
  await page.getByLabel("Email").fill("a@example.com");
  await page.getByLabel("Password").fill("correct horse");
  await page.getByRole("button", { name: "Sign in", exact: true }).last().click();
  await expect(page).toHaveURL(/\/app\/brackets\//);
  await expect(page.getByRole("heading", { name: "Bracket maker" })).toBeVisible();
});

test("a return address outside the app is ignored after sign-in", async ({ page }) => {
  await preflight(page);
  await page.route("**/esports-api.yaseenyk.workers.dev/auth/login", (r) => r.fulfill(json({ token: "t", user: { id: "u", email: "a@example.com", name: "Asha Test" } })));
  await page.route("**/esports-api.yaseenyk.workers.dev/events", (r) => r.fulfill(json([])));
  await page.goto("/login/?next=https%3A%2F%2Fevil.example%2F");
  await page.getByLabel("Email").fill("a@example.com");
  await page.getByLabel("Password").fill("correct horse");
  await page.getByRole("button", { name: "Sign in", exact: true }).last().click();
  await expect(page).toHaveURL(/localhost:\d+\/app\/$/);
});

test("every app screen opens after sign-in, and an expired sign-in returns to the sign-in page", async ({ page }) => {
  await signedIn(page, [{ id: "e1", key: "cup", name: "Spring Cup", game: "BGMI", organiser: "", date: "2026-12-01", venue: "Pune", emergency: "", rules: "", settings: {}, updatedAt: "" }]);
  await page.goto("/app/");
  await expect(page.getByRole("heading", { name: /Welcome, Olivia/ })).toBeVisible();
  await expect(page.getByText("Spring Cup")).toBeVisible();
  for (const [name, h1] of [["ID cards", /ID cards/], ["Gate check-in", /Gate check-in/], ["Brackets", /Bracket maker/], ["Account", /Account/]] as const) {
    await page.getByRole("navigation", { name: "App" }).getByRole("link", { name }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(h1);
  }
  // The server rejects the token: the person is signed out and sent to sign in.
  await page.route("**/esports-api.yaseenyk.workers.dev/events", (r) => r.fulfill(json({ error: "Authentication required" }, 401)));
  await page.getByRole("navigation", { name: "App" }).getByRole("link", { name: "Home" }).click();
  await expect(page).toHaveURL(/\/login\//, { timeout: 15000 });
});

test("the round robin generator makes fixtures, takes scores and ranks teams", async ({ page }) => {
  await page.goto("/tools/round-robin/");
  await expect(page.getByText(/5 teams, 5 rounds, 10 matches/)).toBeVisible();
  await expect(page.getByText(/has a bye/).first()).toBeVisible();
  const first = page.getByRole("group").filter({ hasText: "Round 1" }).locator("input").first();
  await first.fill("3");
  await page.getByRole("group").filter({ hasText: "Round 1" }).locator("input").nth(1).fill("1");
  const table = page.getByRole("region", { name: "League table" }).last();
  await expect(table.getByRole("row").nth(1)).toContainText("3"); // a win is worth 3 points
  await page.getByLabel(/Play everyone twice/).check();
  await expect(page.getByText(/20 matches/)).toBeVisible();
  const [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download fixtures (CSV)" }).click()]);
  expect(dl.suggestedFilename()).toBe("round-robin-fixtures.csv");
});

test("the schedule maker works out the finish time and refuses bad input", async ({ page }) => {
  await page.goto("/tools/schedule/");
  await expect(page.getByText(/5 rounds/)).toBeVisible();
  await page.getByLabel("Number of matches").fill("8");
  await page.getByLabel("Matches at the same time").fill("2");
  await expect(page.getByText(/4 rounds/)).toBeVisible();
  const table = page.getByRole("region", { name: "Schedule table" });
  await expect(table.getByRole("row").nth(1)).toContainText("10:00");
  await expect(table.getByRole("row").nth(1)).toContainText("M1, M2");
  await page.getByLabel("First match starts at").fill("");
  await expect(page.getByRole("alert").filter({ hasText: /start time/i })).toBeVisible();
});

test("the certificate maker previews a certificate and downloads a PDF with one page per name", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/tools/certificates/");
  await expect(page.getByText("Aarav Mehta").first()).toBeVisible();
  await page.getByLabel("Names, one per line").fill("आरव मेहता\nDiya Kulkarni");
  const [dl] = await Promise.all([page.waitForEvent("download", { timeout: 90_000 }), page.getByRole("button", { name: /Download PDF \(2\)/ }).click()]);
  expect(dl.suggestedFilename()).toBe("certificates.pdf");
  const bytes = fs.readFileSync((await dl.path())!);
  expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
  expect((bytes.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length).toBe(2);
});

test("the app shows an event with its numbers and warnings", async ({ page }) => {
  await signedIn(page, [{ id: "e1", key: "cup", name: "Spring Cup", game: "BGMI", organiser: "Guild", date: "2026-12-01", venue: "Pune", emergency: "", rules: "", settings: {}, updatedAt: "" }]);
  await page.route("**/esports-api.yaseenyk.workers.dev/events/e1/roster", (r) => r.fulfill(json({ teams: [{ id: "t1", name: "Kings" }], people: [{ id: "K-1", name: "A", teamId: "t1", role: "Player", minor: true, guardian: false, photoUrl: null }, { id: "K-2", name: "B", teamId: "t1", role: "Coach", minor: false, guardian: false, photoUrl: "/x" }] })));
  await page.route("**/esports-api.yaseenyk.workers.dev/events/e1/checkins", (r) => r.fulfill(json({ checkins: [], total: 2, checkedIn: 1 })));
  await page.goto("/app/events/");
  await page.getByRole("button", { name: /Spring Cup/ }).click();
  await expect(page.getByRole("heading", { name: "Spring Cup" })).toBeVisible();
  await expect(page.getByText("1 of 2")).toBeVisible();
  await expect(page.getByText(/without a guardian/).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Open the cards" })).toHaveAttribute("href", /open=e1/);
});
