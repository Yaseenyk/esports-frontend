// Community features with the backend flags OFF (production today, and every CI build): nothing is emitted and nothing is visible.
// No /calendar/, /trust/ or /app/calendar/ page, no link to them, no trust island on tournament pages, no call to a community endpoint, no sitemap entry.
// Skipped on a build made against scripts/mock-community-api.mjs with the flags on (see e2e/community.spec.ts).
import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve("out");
const ON_BUILD = fs.existsSync(path.join(OUT, "calendar", "index.html"));
test.skip(ON_BUILD, "this build has the community pages (flags were on): see e2e/community.spec.ts");

const COMMUNITY_CALL = /\/public\/community|\/public\/calendar|\/trust(\/|$)|\/v3\/me\/calendar|\/calendar(\/|$)/;

function watch(page: Page) {
  const calls: string[] = [];
  page.on("request", (r) => { const u = new URL(r.url()); if (COMMUNITY_CALL.test(u.pathname) && !u.pathname.startsWith("/_next")) calls.push(`${r.method()} ${u.host}${u.pathname}`); });
  return calls;
}

test("no community page is emitted", async ({ page }) => {
  for (const p of ["/calendar/", "/trust/?t=anything", "/app/calendar/"]) {
    const r = await page.goto(p);
    expect(r?.status(), p).toBe(404);
  }
  for (const f of [path.join(OUT, "calendar"), path.join(OUT, "trust"), path.join(OUT, "app", "calendar")]) expect(fs.existsSync(f), f).toBe(false);
});

test("nothing links to the community pages and no page calls a community endpoint", async ({ page }) => {
  const calls = watch(page);
  const pages = ["/", "/tools/", "/about/"];
  const tournament = fs.existsSync(path.join(OUT, "tournaments")) ? fs.readdirSync(path.join(OUT, "tournaments")).find((d) => fs.existsSync(path.join(OUT, "tournaments", d, "index.html"))) : undefined;
  if (tournament) pages.push(`/tournaments/${tournament}/`);
  for (const p of pages) {
    await page.goto(p);
    await expect(page.locator('a[href^="/calendar"], a[href^="/trust"], a[href^="/app/calendar"]')).toHaveCount(0);
    await expect(page.getByText("College calendar", { exact: true })).toHaveCount(0);
    await expect(page.getByTestId("trust-island")).toHaveCount(0);
  }
  expect(calls).toEqual([]);
});

test("the sitemap and the built HTML do not mention the calendar or the trust pages", async () => {
  const sm = fs.readFileSync(path.join(OUT, "sitemap.xml"), "utf8");
  expect(sm).not.toContain("/calendar/");
  expect(sm).not.toContain("/trust/");
  const html = fs.readFileSync(path.join(OUT, "index.html"), "utf8");
  expect(html).not.toContain("eh-prune-community");
  expect(html).not.toContain('href="/calendar/"');
});
