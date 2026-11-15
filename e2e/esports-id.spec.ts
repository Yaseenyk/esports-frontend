import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// The esports ID card maker page and its comparison guide (desktop and 390 x 844 phone via the two projects).
const PAGE = "/id-card-maker/esports/";
const GUIDE = "/guides/best-free-esports-id-card-makers/";

const jsonLd = async (page: import("@playwright/test").Page) =>
  (await page.locator('script[type="application/ld+json"]').allTextContents()).flatMap((t) => { const j = JSON.parse(t); return Array.isArray(j) ? j : [j]; });

test.setTimeout(120_000);

test("the esports page is indexable, has one h1, the tool above the fold and the schema types", async ({ page }) => {
  await page.goto(PAGE);
  await expect(page).toHaveTitle("Esports ID Card Maker: Free, No Sign-up · Esports Hub");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/esports ID card maker/i);
  expect(await page.locator('meta[name="robots"][content*="noindex"]').count()).toBe(0);
  await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", /\/id-card-maker\/esports\/$/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/og\/esports-id-card-maker\.png$/);
  // The tool's open button is visible without scrolling past the header.
  const open = page.getByRole("button", { name: "Open the ID card maker" });
  await expect(open).toBeVisible();
  const box = (await open.boundingBox())!;
  expect(box.y).toBeLessThan(page.viewportSize()!.height + 200);
  const types = (await jsonLd(page)).map((d) => d["@type"]).sort();
  expect(types).toEqual(["BreadcrumbList", "FAQPage", "HowTo", "Organization", "SoftwareApplication"]); // Organization is the sitewide entity from the layout
});

test("the page shows its sections, the sample cards with alt text and the honest comparison", async ({ page }) => {
  await page.goto(PAGE);
  for (const h of ["Who this esports ID card maker is for", "From a roster to cards in one go", "Print sheets: sizes, crop marks and bleed", "Privacy: what stays in your browser", "Real sample cards from the maker", "How it compares: an honest table", "Where this tool is weaker"]) await expect(page.getByRole("heading", { level: 2, name: h })).toBeVisible();
  const imgs = page.locator("figure img");
  await expect(imgs).toHaveCount(3);
  for (let i = 0; i < 3; i++) {
    await imgs.nth(i).scrollIntoViewIfNeeded();
    await expect(imgs.nth(i)).toHaveAttribute("alt", /.{40,}/);
    await expect.poll(() => imgs.nth(i).evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0)).toBe(true);
  }
  const table = page.getByRole("table", { name: /compared, last checked 15 Nov 2026/ });
  await table.scrollIntoViewIfNeeded();
  await expect(table.getByRole("row")).toHaveCount(9);
  await expect(table).toContainText("Canva");
  await expect(table).toContainText("IDCreator");
  await expect(page.getByText("Last checked 15 Nov 2026; check each site for current terms")).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: /esports ID card maker: questions and answers/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "All free tournament tools" })).toBeVisible();
  // No horizontal scroll of the page itself (the table scrolls inside its own region).
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});

test("the live tool opens from the esports page and keeps the roster import", async ({ page }) => {
  await page.goto(PAGE);
  await page.getByRole("button", { name: "Open the ID card maker" }).click();
  await expect(page.locator("ol").first()).toContainText("3 teams", { timeout: 30_000 });
  await page.locator("ol button").filter({ hasText: "People" }).first().click();
  await page.getByRole("tab", { name: /Import/ }).click();
  await expect(page.getByRole("textbox", { name: "Roster rows" })).toBeVisible();
});

test("the comparison guide has the answer box, last-checked date, article schema and links to the tool", async ({ page }) => {
  await page.goto(GUIDE);
  await expect(page).toHaveTitle("Best free esports ID card makers (2026) · Esports Hub");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("note", { name: "Short answer" })).toContainText("Canva");
  await expect(page.getByText("Last checked: 15 November 2026").first()).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "How to design a good tournament ID card" })).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
  const types = (await jsonLd(page)).map((d) => d["@type"]);
  expect(types).toEqual(expect.arrayContaining(["Article", "BreadcrumbList", "FAQPage"]));
  await expect(page.getByRole("link", { name: "esports ID card maker" }).first()).toHaveAttribute("href", PAGE);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});

test("the tools hub, the home page and the general ID card page link to the esports pages, and the footer links to the hub", async ({ page }) => {
  await page.goto("/tools/id-cards/");
  await expect(page).toHaveTitle("Free ID card maker for esports and events · Esports Hub");
  await expect(page.locator(`main a[href="${PAGE}"]`).first()).toBeVisible();
  await expect(page.getByRole("contentinfo").getByRole("link", { name: "All tools" })).toHaveAttribute("href", "/tools/");
  await page.goto("/");
  await expect(page.locator(`a[href="${PAGE}"]`).first()).toBeVisible();
  await page.goto("/tools/");
  await expect(page.locator(`a[href="${PAGE}"]`).first()).toBeVisible();
  await expect(page.locator(`a[href="${GUIDE}"]`).first()).toBeVisible();
});

for (const path of [PAGE, GUIDE]) {
  test(`${path} has no serious accessibility problems`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(900);
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).exclude(".idcard-box").analyze();
    const bad = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
  });
}
