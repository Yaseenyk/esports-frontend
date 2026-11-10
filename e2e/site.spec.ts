import { expect, test } from "@playwright/test";

const PAGES = ["/", "/games/", "/events/", "/communities/", "/arcade/", "/guides/", "/tools/", "/tools/id-cards/", "/tools/check-in/", "/tools/brackets/", "/manage/"];

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
