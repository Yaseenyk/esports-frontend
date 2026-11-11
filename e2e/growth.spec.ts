import { expect, test } from "@playwright/test";

// The search-growth pages: poster maker, BGMI and Free Fire points table pages, and the comparison.

test("the poster maker draws a preview, downloads a PNG and sends a WhatsApp text", async ({ page }) => {
  await page.goto("/tools/poster/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Tournament poster maker");
  await page.getByLabel("Event name").fill("Spring Cup");
  await page.getByLabel("Venue").fill("College hall");
  await page.getByLabel("Prize line").fill("Trophy and certificates");
  const preview = page.getByRole("img", { name: /Preview of the poster for Spring Cup/ });
  await expect(preview).toBeVisible();
  await expect(preview).toHaveAttribute("src", /^blob:/);
  // Each look and shape can be chosen.
  for (const look of ["BGMI", "Valorant", "Cricket", "Football", "Free Fire"]) { await page.getByRole("group", { name: "Look" }).getByRole("button", { name: look }).click(); await expect(page.getByRole("group", { name: "Look" }).getByRole("button", { name: look })).toHaveAttribute("aria-pressed", "true"); }
  await page.getByRole("button", { name: "Story (9:16)" }).click();
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Download PNG/ }).click()]);
  expect(download.suggestedFilename()).toBe("spring-cup-story.png");
  await expect(page.getByRole("link", { name: "Send the text on WhatsApp" })).toHaveAttribute("href", /^https:\/\/wa\.me\/\?text=Spring%20Cup/);
  // The sponsor list takes at most two.
  const add = page.getByRole("button", { name: "Add a sponsor" });
  await add.click(); await add.click();
  await expect(add).toBeDisabled();
});

test("the poster maker needs an event name before it shares", async ({ page }) => {
  await page.goto("/tools/poster/");
  await page.getByLabel("Event name").fill("");
  await expect(page.getByRole("button", { name: "Share on WhatsApp or Instagram" })).toBeDisabled();
  await expect(page.getByRole("button", { name: /Download PNG/ })).toBeDisabled();
});

for (const [path, game] of [["/points-table/bgmi/", "BGMI"], ["/points-table/free-fire/", "Free Fire"]] as const) {
  test(`${path} is an indexable page with the points table, an example-scale note and a share button`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(`${game} points table maker`);
    expect(await page.locator('meta[name="robots"][content*="noindex"]').count()).toBe(0);
    await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", new RegExp(`${path}$`));
    const note = page.getByTestId("preset-note");
    await expect(note).toContainText("Example only");
    await expect(note.getByRole("link").first()).toHaveAttribute("href", /\/guides\//);
    await expect(page.getByRole("table", { name: "Standings table" }).or(page.getByRole("region", { name: "Standings table" }))).toBeVisible();
    await expect(page.getByRole("button", { name: "Share on WhatsApp or Instagram" })).toBeVisible();
    // Breadcrumb goes back to the tool page.
    await expect(page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "Points table maker" })).toHaveAttribute("href", "/tools/points-table/");
    const faq = page.locator("section[aria-labelledby=faq]").locator("details");
    expect(await faq.count()).toBeGreaterThanOrEqual(7);
    const ld = (await page.locator('script[type="application/ld+json"]').allInnerTexts()).map((t) => JSON.parse(t));
    const types = ld.flat().map((x: { "@type"?: string }) => x["@type"]);
    for (const t of ["BreadcrumbList", "FAQPage", "SoftwareApplication"]) expect(types).toContain(t);
  });
}

test("the tool points table has no example note, only the game pages do", async ({ page }) => {
  await page.goto("/tools/points-table/");
  await expect(page.getByTestId("preset-note")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Points table maker");
});

test("the comparison page says when it was checked, marks what is not verified and links to the tools", async ({ page }) => {
  await page.goto("/compare/free-tournament-software-india/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Free tournament software for India");
  await expect(page.getByText("Last checked: 11 Nov 2026")).toBeVisible();
  const table = page.getByRole("region", { name: "Comparison table" });
  for (const name of ["bracketmaker.app", "score7.io", "pointstablemaker.com", "obscoreboard.com", "challonge.com"]) await expect(table.getByRole("rowheader", { name })).toBeVisible();
  expect(await table.getByText("not verified").count()).toBeGreaterThan(3);
  await expect(page.getByText("Where Esports Hub is weaker").first()).toBeVisible();
  await page.getByRole("link", { name: "Tournament poster maker" }).last().click();
  await expect(page).toHaveURL(/\/tools\/poster\/$/);
});

test("the tools page offers the poster maker", async ({ page }) => {
  await page.goto("/tools/");
  await page.getByRole("link", { name: /make a tournament poster/i }).click();
  await expect(page).toHaveURL(/\/tools\/poster\/$/);
});
