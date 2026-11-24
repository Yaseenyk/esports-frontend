import { expect, test, type Page } from "@playwright/test";

// The COD Mobile Battle Royale points table and the Valorant league table: real pages with their own content, tools that work in the
// browser with no account, and standings that move as results are typed. Runs on desktop and phone.

async function seoBasics(page: Page, path: string, h1: string) {
  await expect(page.getByRole("heading", { level: 1 })).toContainText(h1);
  expect(await page.locator('meta[name="robots"][content*="noindex"]').count()).toBe(0);
  await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", new RegExp(`${path}$`));
  const faq = page.locator("section[aria-labelledby=faq]").locator("details");
  expect(await faq.count()).toBeGreaterThanOrEqual(7);
  const types = (await page.locator('script[type="application/ld+json"]').allInnerTexts()).map((t) => JSON.parse(t)).flat().map((x: { "@type"?: string }) => x["@type"]);
  for (const t of ["BreadcrumbList", "FAQPage", "SoftwareApplication"]) expect(types).toContain(t);
}

test("COD Mobile: an indexable page with its own example scale, and totals that update as results are typed", async ({ page }) => {
  await page.goto("/points-table/cod-mobile/");
  await seoBasics(page, "/points-table/cod-mobile/", "COD Mobile points table maker");
  await expect(page.getByRole("heading", { name: "How a COD Mobile Battle Royale event differs" })).toBeVisible();
  const note = page.getByTestId("preset-note");
  await expect(note).toContainText("written for this page");
  await expect(note.getByRole("link").first()).toHaveAttribute("href", "/guides/cod-mobile-tournament-rules-template/");
  await expect(page.getByLabel("Placement points, 1st place first")).toHaveValue("15, 12, 10, 8, 6, 5, 4, 3, 2, 1");
  const table = page.getByRole("region", { name: "Standings table" });
  const first = table.locator("tbody tr").first();
  await expect(first).toContainText("Red Comets");
  await expect(first).toContainText("49");
  await expect(table.locator("tbody tr").nth(1)).toContainText("tie-break");
  // Night Ravens get 4 more kills in match 3: 46 + 4 = 50, which puts them first.
  await page.getByLabel("Night Ravens, match 3, kills").fill("6");
  await expect(first).toContainText("Night Ravens");
  await expect(first).toContainText("50");
  // A different points per kill changes every total at once.
  await page.getByLabel("Points per kill").fill("2");
  await expect(first).toContainText("68"); // Night Ravens 32 placement + 18 kills x 2 = 68; Red Comets 33 + 16 x 2 = 65
  // The example button restores the page's own scale.
  await page.getByLabel("Placement points, 1st place first").fill("10, 6, 5");
  await page.getByRole("button", { name: "Use the example scale" }).click();
  await expect(page.getByLabel("Placement points, 1st place first")).toHaveValue("15, 12, 10, 8, 6, 5, 4, 3, 2, 1");
});

test("Valorant: a league table, not placement and kills, with best of 1 and best of 3, editable points and a level-map warning", async ({ page }) => {
  await page.goto("/points-table/valorant/");
  await seoBasics(page, "/points-table/valorant/", "Valorant points table maker");
  await expect(page.getByRole("heading", { name: "Why a Valorant table is not a battle royale table" })).toBeVisible();
  await expect(page.getByLabel("Placement points, 1st place first")).toHaveCount(0);
  await expect(page.getByText(/4 teams, 6 matches/)).toBeVisible();

  const results = page.locator("#ml-results");
  const table = page.getByRole("region", { name: "Standings table" });
  const match1 = results.locator("li").filter({ has: page.locator("input") }).first();
  const inputs = match1.locator("input");
  await inputs.nth(0).fill("13"); await inputs.nth(1).fill("7");
  await expect(page.getByText(/1 of 6 matches finished/)).toBeVisible();
  const top = table.locator("tbody tr").first();
  await expect(top.locator("td").last()).toHaveText("3");
  await expect(top).toContainText("+6"); // round difference 13 - 7

  // Best of 3: one map is no longer a finished match; the second map box appears, and 2-0 finishes it.
  await page.getByRole("group", { name: "Best of" }).getByRole("button", { name: "Best of 3" }).click();
  await expect(page.getByText(/0 of 6 matches finished/)).toBeVisible();
  await expect(inputs).toHaveCount(4);
  await inputs.nth(2).fill("13"); await inputs.nth(3).fill("9");
  await expect(match1.getByTestId("match-result")).toContainText("2–0");
  await expect(page.getByText(/1 of 6 matches finished/)).toBeVisible();
  await expect(table.getByRole("columnheader", { name: "Map diff" })).toBeVisible();
  await expect(top).toContainText("+2");

  // Points for a win are editable.
  await page.getByLabel("Points for a win").fill("2");
  await expect(top.locator("td").last()).toHaveText("2");

  // A level map is flagged and does not count.
  const match2 = results.locator("li").filter({ has: page.locator("input") }).nth(1);
  await match2.locator("input").nth(0).fill("12"); await match2.locator("input").nth(1).fill("12");
  await expect(match2.getByRole("alert")).toContainText("A map cannot end level");
  await expect(page.getByText(/1 of 6 matches finished/)).toBeVisible();

  // The CSV holds the standings.
  const [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download table (CSV)" }).click()]);
  expect(dl.suggestedFilename()).toBe("valorant-league-table.csv");
});

test("the points table page links the two new game pages", async ({ page }) => {
  await page.goto("/tools/points-table/");
  await expect(page.locator('a[href="/points-table/cod-mobile/"]').first()).toBeAttached();
  await expect(page.locator('a[href="/points-table/valorant/"]').first()).toBeAttached();
});
