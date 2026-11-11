import { expect, test, type Page } from "@playwright/test";

const verdict = (page: Page) => page.getByTestId("verdict");
const planGroup = (page: Page) => page.getByRole("group", { name: "Plan", exact: true });

test("the planner page is indexable and carries its questions and structured data", async ({ page }) => {
  await page.goto("/tools/plan/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Plan my tournament/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/tools\/plan\/$/);
  expect(await page.locator('meta[name="robots"][content*="noindex"]').count()).toBe(0);
  const items = page.locator("section[aria-labelledby=faq]").locator("details");
  expect(await items.count()).toBeGreaterThanOrEqual(7);
  const ld = (await page.locator('script[type="application/ld+json"]').allInnerTexts()).map((t) => JSON.parse(t)).flat() as { "@type"?: string; mainEntity?: unknown[] }[];
  const faq = ld.find((x) => x["@type"] === "FAQPage")!;
  expect(faq.mainEntity!.length).toBe(await items.count());
  const sitemap = await (await page.request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/tools/plan/");
});

test("battle royale: lobbies, matches per lobby and a verdict that follows the hours", async ({ page }) => {
  await page.goto("/tools/plan/");
  await expect(page.getByRole("heading", { name: /Step 2/ })).toHaveCount(0); // nothing else until a kind is chosen
  await page.getByRole("button", { name: /Battle royale/ }).click();
  await expect(page.getByRole("button", { name: /Battle royale/ })).toHaveAttribute("aria-pressed", "true");
  await page.getByLabel("Number of teams").fill("48");
  await page.getByLabel("Rooms at the same time").fill("2");
  await page.getByLabel("Hours available").fill("6");
  await expect(verdict(page)).toHaveText("Fits in your time: ends 14:50");
  const plan = planGroup(page);
  await expect(plan).toContainText("4 lobbies");
  await expect(plan).toContainText("3 matches per lobby");
  await expect(plan).toContainText("Example points (not an official scale)");
  await expect(plan.getByRole("link", { name: "points table calculator" })).toHaveAttribute("href", "/tools/points-table/");
  await expect(page.getByRole("region", { name: "Schedule table" }).locator("tbody tr").first()).toContainText("10:00");

  await page.getByLabel("Hours available").fill("1");
  await expect(verdict(page)).toHaveText(/^Does not fit: needs 1 h 20 min, you have 1 h\. Options: fewer teams, more rooms/);

  await page.getByText("More options").first().click();
  await page.getByLabel("Teams per lobby").fill("24");
  await page.getByLabel("Hours available").fill("6");
  await expect(planGroup(page)).toContainText("2 lobbies");
});

test("head to head: recommends a format that fits and lets you pick another", async ({ page }) => {
  await page.goto("/tools/plan/");
  await page.getByRole("button", { name: /Head to head/ }).click();
  await page.getByLabel("Number of teams").fill("8");
  await page.getByLabel("Rooms at the same time").fill("1");
  await page.getByLabel("Hours available").fill("6");
  const plan = planGroup(page);
  await expect(plan).toContainText("Recommended: Single elimination");
  await expect(verdict(page)).toHaveText("Fits in your time: ends 15:30");

  const formats = page.getByRole("group", { name: "Format", exact: true });
  await expect(formats.getByRole("button")).toHaveCount(3);
  await expect(formats.getByRole("button", { name: /Round robin/ })).toContainText("28 matches");
  await expect(formats.getByRole("button", { name: /Single elimination/ })).toContainText("7 matches");

  await formats.getByRole("button", { name: /Round robin/ }).click();
  await expect(formats.getByRole("button", { name: /Round robin/ })).toHaveAttribute("aria-pressed", "true");
  await expect(verdict(page)).toHaveText(/^Does not fit: needs 23 h, you have 6 h\./);

  await page.getByLabel("Hours available").fill("12");
  await formats.getByRole("button", { name: /Double elimination/ }).click();
  await expect(verdict(page)).toContainText("Fits in your time");
  await expect(plan).toContainText("Recommended: Double elimination");
});

test("a bad value gives a plain message instead of a plan", async ({ page }) => {
  await page.goto("/tools/plan/");
  await page.getByRole("button", { name: /Head to head/ }).click();
  await page.getByLabel("Start time").fill("");
  await expect(page.getByRole("alert").filter({ hasText: "Choose a start time" })).toBeVisible();
  await page.getByLabel("Start time").fill("09:30");
  await expect(verdict(page)).toBeVisible();
});

test("the pack can be copied and downloaded, and leaves the organiser's decisions in brackets", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]).catch(() => undefined);
  await page.goto("/tools/plan/");
  await page.getByRole("button", { name: /Battle royale/ }).click();
  await page.getByLabel("Event name (optional)").fill("Monsoon Clash");
  const pack = page.getByLabel("Tournament pack text");
  await expect(pack).toContainText("TOURNAMENT PLAN: Monsoon Clash");
  await expect(pack).toContainText("A team has 4 players and up to 1 substitute");
  await expect(pack).toContainText("[Prizes and how they are paid");
  await expect(pack).toContainText("Monsoon Clash: team registration");

  const [txt] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download as text" }).click()]);
  expect(txt.suggestedFilename()).toBe("monsoon-clash.txt");
  const [md] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download as Markdown" }).click()]);
  expect(md.suggestedFilename()).toBe("monsoon-clash.md");

  await page.getByRole("button", { name: "Copy the pack" }).click();
  await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("TOURNAMENT PLAN: Monsoon Clash");

  await page.getByLabel(/Team size/).selectOption({ label: "5 v 5 game (for example Valorant)" });
  await expect(pack).toContainText("A team has 5 players and up to 1 substitute");
});

test("the next-step links open the matching tool", async ({ page }) => {
  await page.goto("/tools/plan/");
  await page.getByRole("button", { name: /Battle royale/ }).click();
  await expect(page.getByRole("link", { name: /Open in the Registration form/ })).toHaveAttribute("href", "/tools/registration/");
  await page.getByRole("link", { name: /Open in the Points table calculator/ }).click();
  await expect(page).toHaveURL(/\/tools\/points-table\/$/);
  await page.goto("/tools/plan/");
  await page.getByRole("button", { name: /Head to head/ }).click();
  await expect(page.getByRole("link", { name: /Open in the Bracket maker/ })).toHaveAttribute("href", "/tools/brackets/");
});

test("it fits a phone screen without sideways scrolling, and is listed in the footer and the tools index", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/tools/plan/");
  await page.getByRole("button", { name: /Head to head/ }).click();
  await page.getByLabel("Number of teams").fill("32");
  await expect(verdict(page)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  await page.goto("/tools/");
  await expect(page.getByRole("heading", { name: "plan a whole tournament" })).toBeVisible();
  const footerTools = page.locator("footer").getByRole("navigation", { name: "Tools" });
  await expect(footerTools.getByRole("link", { name: "Plan my tournament" }).first()).toHaveAttribute("href", "/tools/plan/");
});
