// Community pages in a build made against an API with the flags ON but too little real data (production on 25 Nov 2026: calendar empty).
// The calendar page exists, says why it is empty, is noindex and out of the sitemap, and is not linked from the menu or footer.
// Skipped for flag-off builds (community-off.spec.ts) and fixture builds (community.spec.ts).
import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve("out");
const CAL = path.join(OUT, "calendar", "index.html");
const html = fs.existsSync(CAL) ? fs.readFileSync(CAL, "utf8") : "";
const info = (() => { const m = /<script type="application\/json" id="eh-calendar">([\s\S]*?)<\/script>/.exec(html); try { return m ? JSON.parse(m[1]) : null; } catch { return null; } })();
test.skip(!html || html.includes("Fixture Fest Cup"), "not a real-API build with the calendar on");

test("calendar below the index threshold: noindex, out of the sitemap, an honest empty state, no menu link", async ({ page }) => {
  await page.route(/\/public\/calendar/, (r) => r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ items: [], upcomingVerified: 0, minimumForIndex: 5, today: "2030-01-01" }) }));
  await page.goto("/calendar/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("College esports calendar");
  if (info && info.upcoming < 5) {
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    expect(fs.readFileSync(path.join(OUT, "sitemap.xml"), "utf8")).not.toContain("/calendar/");
  }
  await expect(page.getByText("No upcoming events are listed yet.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "List your college event" })).toBeVisible();
  // The empty calendar offers one action, which goes to the listing section.
  await expect(page.getByRole("link", { name: "List your college event" })).toHaveAttribute("href", "#list-cal");
  if (info && info.entries.length === 0) {
    await page.goto("/");
    await expect(page.locator('a[href="/calendar/"]')).toHaveCount(0);
  }
});
