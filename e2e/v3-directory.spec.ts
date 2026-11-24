// The phase 5 directory exists only in a build made against an API with v3.directory on:
//   MOCK_DIRECTORY=6 node scripts/mock-v3-api.mjs 8799   then   NEXT_PUBLIC_API_URL=http://localhost:8799 npm run build
// (MOCK_DIRECTORY=3 builds the same page below the index threshold). With a normal build every test here is skipped.
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const file = path.resolve("out", "tournaments", "index.html");
const info = (() => { try { return JSON.parse(/id="eh-directory">([\s\S]*?)<\/script>/.exec(fs.readFileSync(file, "utf8"))?.[1] ?? "{}"); } catch { return {}; } })();
test.skip(info.mode !== "directory", "this build has no directory (v3.directory was off): see the header of this file");
test.setTimeout(120_000);

test("the directory is in the static HTML, filters by game and city, and the Register button opens the opted-in sign-up form only", async ({ page }) => {
  await page.goto("/tournaments/");
  await expect(page.getByRole("heading", { level: 1, name: "Upcoming esports tournaments" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Register your team" })).toHaveAttribute("href", "/register/?t=fixturetoken123");
  await page.getByLabel("City").selectOption("Mumbai");
  await expect(page).toHaveURL(/city=Mumbai/);
  await expect(page.getByRole("link", { name: "Register your team" })).toHaveCount(0); // the Mumbai fixtures did not opt in
  await page.getByLabel("Game").selectOption("bgmi");
  await expect(page.getByRole("heading", { name: "Nothing matches these filters" })).toBeVisible();
});

test("robots follow the 5-upcoming rule", async ({ page }) => {
  await page.goto("/tournaments/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", info.upcoming >= 5 ? "index, follow" : "noindex, follow");
  const sitemap = fs.readFileSync(path.resolve("out", "sitemap.xml"), "utf8");
  expect(sitemap.includes("/tournaments/</loc>")).toBe(info.upcoming >= 5);
});

test("no serious accessibility problems, no sideways scroll", async ({ page }) => {
  await page.goto("/tournaments/");
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)).toBe(false);
});
