// Tournament pages exist only in a build made against an API that has tournaments. This spec runs against a build made with
//   node scripts/mock-v3-api.mjs 8799   and   NEXT_PUBLIC_API_URL=http://localhost:8799 npm run build
// With a normal build (API off) there are no tournament pages and every test here is skipped.
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const has = (slug: string) => fs.existsSync(path.resolve("out", "tournaments", slug, "index.html"));
const BUILT = has("fixture-cup-1");
test.skip(!BUILT, "this build has no tournament pages (API was off): see the header of this file");
test.setTimeout(120_000);

const live = (page: import("@playwright/test").Page, over: Record<string, unknown> = {}) =>
  page.route("**localhost:8799/**", (r) => r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ slug: "fixture-cup-1", status: "registration_open", registered: 11, spotsLeft: 5, open: true, ...over }) }));

test("an indexable tournament page: one h1, JSON-LD, canonical, index", async ({ page }) => {
  await live(page);
  await page.goto("/tournaments/fixture-cup-1/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Fixture Cup Number 1");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index, follow");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/tournaments\/fixture-cup-1\/$/);
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  const event = ld.map((t) => JSON.parse(t)).find((d) => d["@type"] === "SportsEvent");
  expect(event.name).toBe("Fixture Cup Number 1");
  expect(event.eventAttendanceMode).toContain("OfflineEventAttendanceMode");
});

test("the registration island starts from the built numbers and switches to the live ones", async ({ page }) => {
  await live(page);
  await page.goto("/tournaments/fixture-cup-1/");
  const box = page.getByRole("region", { name: "Registration" });
  await expect(box).toContainText("11 teams have registered");
  await expect(box).toContainText("5 spots left");
  await expect(box).toContainText("Updated just now");
});

test("the registration island keeps the built numbers when the live endpoint fails", async ({ page }) => {
  await page.route("**localhost:8799/**", (r) => r.abort());
  await page.goto("/tournaments/fixture-cup-1/");
  await expect(page.getByRole("region", { name: "Registration" })).toContainText("9 teams have registered");
});

test("a thin tournament page is noindex and carries no SportsEvent", async ({ page }) => {
  await live(page);
  await page.goto("/tournaments/fixture-thin/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((t) => JSON.parse(t));
  expect(ld.some((d) => d["@type"] === "SportsEvent")).toBe(false);
});

test("verified results show the corrected marker with the original value", async ({ page }) => {
  await live(page, { slug: "fixture-results-cup", status: "completed", open: false });
  await page.goto("/tournaments/fixture-results-cup/");
  await expect(page.getByRole("heading", { name: "Verified results" })).toBeVisible();
  await expect(page.getByText("Corrected (was 2)")).toBeVisible();
  await expect(page.getByText("Winner").first()).toBeVisible();
});

test("the index lists the tournaments; it is indexable only with 5 or more upcoming public tournaments", async ({ page }) => {
  await page.goto("/tournaments/");
  const info = JSON.parse((await page.locator("#eh-directory").textContent()) ?? "{}");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", info.upcoming >= 5 ? "index, follow" : "noindex, follow");
  await expect(page.getByRole("link", { name: /Fixture Cup Number 1/ })).toBeVisible();
});

for (const p of ["/tournaments/", "/tournaments/fixture-cup-1/", "/tournaments/fixture-thin/", "/tournaments/fixture-results-cup/"]) {
  for (const vp of [{ name: "desktop", width: 1280, height: 900 }, { name: "390x844", width: 390, height: 844 }]) {
    test(`${p} has no serious accessibility problems at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await live(page);
      await page.goto(p);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(700);
      const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)).toBe(false);
    });
  }
}
