// Pre-rendered player pages exist only in a build made against an API that lists indexable profiles. This spec runs against a build made with
//   node scripts/mock-v3-api.mjs 8799   and   NEXT_PUBLIC_API_URL=http://localhost:8799 npm run build
// The mock serves one profile that passes the quality gate and one that fails it. With a normal build every test here is skipped.
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const built = (slug: string) => fs.existsSync(path.resolve("out", "players", slug, "index.html"));
test.skip(!built("fixture-player-pass"), "this build has no player pages (API was off): see the header of this file");
test.setTimeout(120_000);

const html = () => fs.readFileSync(path.resolve("out", "players", "fixture-player-pass", "index.html"), "utf8");
const live = (page: import("@playwright/test").Page, status = 200, over: Record<string, unknown> = {}) =>
  page.route("**localhost:8799/**", (r) => r.fulfill({ status, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(status === 200 ? { kind: "player", slug: "fixture-player-pass", handle: "Fixture Player", bio: "Live bio", visibility: "public", indexable: true, games: [], links: [], achievements: [], teams: [], matches: [], battleRoyale: [], certificates: [], ...over } : { error: "Not found" }) }));

test("only the passing profile is built; the failing one has no page", () => {
  expect(built("fixture-player-pass")).toBe(true);
  expect(built("fixture-player-thin")).toBe(false);
  const sm = fs.readFileSync(path.resolve("out", "sitemap.xml"), "utf8");
  expect(sm).toContain("/players/fixture-player-pass/");
  expect(sm).not.toContain("fixture-player-thin");
});

test("the static HTML holds the full text, a canonical, ProfilePage and BreadcrumbList, and no private data", () => {
  const h = html();
  for (const t of ["Fixture Player", "Fixture bio written only", "FixtureOP", "IGL", "Fixture Wolves", "Fixture LAN finalist", "Verified", "Fixture Cup Number 1"]) expect(h, t).toContain(t);
  expect(h).toMatch(/<link rel="canonical" href="https:\/\/esports\.streamerosai\.com\/players\/fixture-player-pass\/"/);
  expect(h).toMatch(/<meta name="robots" content="index, follow"/);
  const ld = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  expect(ld.find((d) => d["@type"] === "ProfilePage")?.mainEntity).toMatchObject({ "@type": "Person", name: "Fixture Player" });
  expect(ld.some((d) => d["@type"] === "BreadcrumbList")).toBe(true);
  expect(h).not.toMatch(/@[a-z0-9-]+\.[a-z]{2,}|\/p\/\?k=|userId|adultConfirmed/i);
  expect((/<title>([^<]*)<\/title>/.exec(h)?.[1] ?? "").length).toBeLessThanOrEqual(60);
});

test("in the browser the live profile replaces the built text (a field hidden since the build disappears)", async ({ page }) => {
  await live(page, 200, { bio: "Live bio only" });
  await page.goto("/players/fixture-player-pass/");
  await expect(page.getByText("Live bio only")).toBeVisible();
  await expect(page.getByText("Fixture bio written only")).toHaveCount(0);
});

test("a profile that is gone since the build shows not available and turns noindex", async ({ page }) => {
  await live(page, 404);
  await page.goto("/players/fixture-player-pass/");
  await expect(page.getByRole("heading", { level: 1, name: "This player page is not available" })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  await expect(page.getByText("Fixture bio written only")).toHaveCount(0);
});

test("the built page passes axe", async ({ page }) => {
  await live(page);
  await page.goto("/players/fixture-player-pass/");
  await page.waitForLoadState("networkidle");
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id)).toEqual([]);
});
