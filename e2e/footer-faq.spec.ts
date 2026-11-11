import { expect, test } from "@playwright/test";

test("the footer is a honeycomb of every tool plus a guide log, with working links and no sideways scroll", async ({ page }) => {
  await page.goto("/tools/");
  const footer = page.locator("footer");
  await footer.scrollIntoViewIfNeeded();
  const tools = footer.getByRole("navigation", { name: "Tools" });
  const visible = await tools.locator(".fx-hex:visible").count();
  expect(visible).toBe(14); // one tile per tool, and only one of the two layouts shows at a time
  await expect(footer.getByRole("navigation", { name: "Guides" }).getByRole("link", { name: /^All \d+ guides/ })).toBeVisible();
  expect(await footer.getByRole("navigation", { name: "Guides" }).locator("li a").count()).toBe(10);
  // The page never scrolls sideways because of the footer.
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  await tools.getByRole("link", { name: "Gate check-in scanner" }).first().click();
  await expect(page).toHaveURL(/\/tools\/check-in\/$/);
});

test("the home page questions are real answers: the first is open, each has substance, and the structured data matches", async ({ page }) => {
  await page.goto("/");
  const section = page.locator("section[aria-labelledby=faq]");
  await section.scrollIntoViewIfNeeded();
  const items = section.locator("details");
  expect(await items.count()).toBeGreaterThanOrEqual(10);
  expect(await section.locator("details[open]").count()).toBe(1);
  for (const i of [0, 3, 9]) {
    const text = ((await items.nth(i).textContent()) ?? "").replace(/\s+/g, " ");
    expect(text.length, `question ${i + 1} should be a full answer`).toBeGreaterThan(350);
  }
  await items.nth(5).locator("summary").click();
  await expect(items.nth(5)).toHaveAttribute("open", "");
  const ld = await page.locator('script[type="application/ld+json"]').allInnerTexts();
  const faq = ld.map((t) => JSON.parse(t)).flat().find((x: { "@type"?: string }) => x["@type"] === "FAQPage") as { mainEntity: unknown[] };
  expect(faq.mainEntity.length).toBe(await items.count());
});

test("a tool page and a guide show their questions in full", async ({ page }) => {
  for (const path of ["/tools/points-table/", "/guides/run-a-campus-tournament/"]) {
    await page.goto(path);
    const items = page.locator("section[aria-labelledby=faq]").locator("details");
    expect(await items.count(), path).toBeGreaterThanOrEqual(6);
    const longest = await items.evaluateAll((els) => Math.min(...els.map((e) => (e.textContent ?? "").length)));
    expect(longest, `${path}: every answer is more than one line`).toBeGreaterThan(300);
  }
});

test("a display screen design from the link changes how the screen looks", async ({ page }) => {
  const payload = { v: "table", d: { title: "Cup", head: ["#", "Team", "Pts"], rows: [["1", "Alpha", "10"], ["2", "Bravo", "8"]], strong: 2 } };
  await page.goto("/tools/display-screen/");
  const hash = await page.evaluate((p) => { const bytes = new TextEncoder().encode(JSON.stringify(p)); let s = ""; for (const x of bytes) s += String.fromCharCode(x); return "p." + btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }, payload);
  await page.goto(`/display/?theme=pitch#d=${hash}`);
  await expect(page.locator("h1:not(.sr-only)")).toHaveCSS("text-transform", "uppercase");
  const pitch = await page.locator("body").evaluate((b) => getComputedStyle(b).backgroundImage);
  await page.goto(`/display/?theme=paper#d=${hash}`);
  await expect(page.locator("h1:not(.sr-only)")).toHaveCSS("text-transform", "none");
  const paper = await page.locator("body").evaluate((b) => getComputedStyle(b).backgroundColor);
  expect(pitch).toContain("gradient");
  expect(paper).toBe("rgb(247, 245, 239)");
});

test("the display screen picker lists every design in three groups and previews the chosen one", async ({ page }) => {
  await page.goto("/tools/display-screen/");
  const picker = page.getByRole("group", { name: "Stream" });
  await expect(picker).toBeVisible();
  expect(await page.locator("fieldset button[aria-pressed]").count()).toBe(14);
  await page.getByRole("button", { name: /Stadium Lights/ }).click();
  await expect(page.locator("iframe")).toHaveAttribute("src", /theme=stadium/);
  await expect(page.getByRole("button", { name: /Stadium Lights/ })).toHaveAttribute("aria-pressed", "true");
});
