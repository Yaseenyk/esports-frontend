import { expect, test } from "@playwright/test";
import { json, preflight, signedIn } from "./helpers";

const PAGES = ["/", "/games/", "/events/", "/communities/", "/arcade/", "/guides/", "/tools/", "/tools/id-cards/", "/tools/check-in/", "/tools/brackets/", "/manage/", "/login/", "/signup/", "/gate/"];

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
  for (const [path, h1] of [["/tools/id-cards/", /ID cards and passes/i], ["/tools/check-in/", /Gate check-in/i], ["/tools/brackets/", /bracket/i]] as const) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(h1);
    await expect(page.getByRole("link", { name: /Create a free account/ }).first()).toHaveAttribute("href", "/signup/");
    expect(await page.locator('script[type="application/ld+json"]').count()).toBeGreaterThan(0);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  }
});

test("the website is not offered to search engines while it shows sample data, and the app never is", async ({ page, request }) => {
  expect(await (await request.get("/robots.txt")).text()).toContain("Disallow: /");
  await page.goto("/app/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  expect((await request.get("/sitemap.xml")).status()).toBe(200);
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
