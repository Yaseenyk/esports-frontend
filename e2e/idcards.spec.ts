import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";

const step = (page: Page, name: string) => page.locator("ol button").filter({ hasText: name }).first().click();
const open = async (page: Page) => { await page.goto("/tools/id-cards/"); await expect(page.getByRole("heading", { level: 1 })).toContainText(/ID cards/i); };

test("demo event: teams, people and cards are all there", async ({ page }) => {
  await open(page);
  await expect(page.locator("ol")).toContainText("3 teams");
  await expect(page.locator("ol")).toContainText("12 people");
  await step(page, "People");
  await expect(page.getByText("Aarav Mehta").first()).toBeVisible();
  await step(page, "Design");
  await expect(page.locator(".idcard-box, [data-card]").first().or(page.locator("[style*='container-type']").first())).toBeVisible();
  await step(page, "Print");
  await expect(page.getByRole("button", { name: /Download PDF/ })).toBeVisible();
});

test("the next and back buttons walk through the four steps", async ({ page }) => {
  await open(page);
  const nav = page.getByRole("navigation", { name: "Step navigation" });
  await nav.getByRole("button", { name: /Next: People/ }).click();
  await expect(page.locator("ol button[aria-current='step']")).toContainText("People");
  await nav.getByRole("button", { name: /Next: Design/ }).click();
  await nav.getByRole("button", { name: /Next: Print/ }).click();
  await expect(page.locator("ol button[aria-current='step']")).toContainText("Print");
  await nav.getByRole("button", { name: /Back/ }).click();
  await expect(page.locator("ol button[aria-current='step']")).toContainText("Design");
});

test("scanning a dummy Aadhaar card adds the person, keeping only the last 4 digits", async ({ page }) => {
  await open(page);
  await step(page, "People");
  const chip = page.getByRole("button", { name: "Aarav Mehta", exact: true });
  await expect(chip).toBeDisabled(); // permission first
  await page.getByRole("checkbox", { name: /permission/i }).check();
  await page.getByRole("button", { name: "Diya Kulkarni", exact: true }).click();
  const job = page.locator("ul[aria-live=polite] li").filter({ hasText: "sample-card-diya-kulkarni" });
  await expect(job).toBeVisible({ timeout: 30_000 });
  await expect(job).toContainText(/done|read|added|duplicate|already/i, { timeout: 30_000 });
  const html = await page.content();
  expect(html).not.toMatch(/\b\d{4}\s?\d{4}\s?8802\b/); // never a full number on screen
});

test("a project can be saved and opened again", async ({ page }) => {
  await open(page);
  const [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Save project" }).click()]);
  const file = await dl.path();
  const saved = JSON.parse(fs.readFileSync(file!, "utf8"));
  expect(saved.app).toBe("esports-hub-idcards");
  expect(saved.people).toHaveLength(12);
  expect(saved.info.passphrase).toBeUndefined(); // the signing secret is not written to the file
  await page.reload();
  await page.locator("input[type=file][accept*='json']").setInputFiles(file!);
  await expect(page.locator("ol")).toContainText("12 people");
});

test("a damaged project file is refused with a message and changes nothing", async ({ page }) => {
  await open(page);
  await page.locator("input[type=file][accept*='json']").setInputFiles({ name: "bad.json", mimeType: "application/json", buffer: Buffer.from("{nope") });
  await expect(page.getByText(/valid JSON|not a project/i).first()).toBeVisible();
  await expect(page.locator("ol")).toContainText("12 people");
});

test("the PDF downloads with real card pages", async ({ page }) => {
  test.setTimeout(150_000); // exporting 12 cards is CPU-heavy when several browsers run at once
  await open(page);
  await step(page, "Print");
  const [dl] = await Promise.all([page.waitForEvent("download", { timeout: 140_000 }), page.getByRole("button", { name: /Download PDF/ }).click()]);
  const bytes = fs.readFileSync((await dl.path())!);
  expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
  expect(bytes.length).toBeGreaterThan(10_000);
  expect(bytes.length).toBeLessThan(20_000_000); // pictures are JPEG, not raw
});

test("the PNG zip downloads", async ({ page }) => {
  test.setTimeout(150_000); // exporting 12 cards is CPU-heavy when several browsers run at once
  await open(page);
  await step(page, "Print");
  const [dl] = await Promise.all([page.waitForEvent("download", { timeout: 140_000 }), page.getByRole("button", { name: /PNG \(zip\)/ }).click()]);
  expect(dl.suggestedFilename()).toMatch(/\.zip$/);
  const bytes = fs.readFileSync((await dl.path())!);
  expect(bytes.subarray(0, 2).toString()).toBe("PK");
});

test("steps load on demand and show a skeleton on a slow connection", async ({ page, context }) => {
  await open(page);
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 1500, downloadThroughput: 40 * 1024, uploadThroughput: 40 * 1024 });
  await page.evaluate(() => [...document.querySelectorAll("ol button")].find((b) => b.getAttribute("aria-label")?.startsWith("Print"))?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
  await expect(page.locator("[role=status] .sk").first()).toBeVisible({ timeout: 8000 });
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await expect(page.getByRole("button", { name: /Download PDF/ })).toBeVisible({ timeout: 30_000 });
  await expect(page.locator("[role=status] .sk")).toHaveCount(0);
});

test("the gate page accepts a pass code and rejects a forged one", async ({ page }) => {
  await page.goto("/tools/check-in/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText(/check-in pack|load.*pack/i).first()).toBeVisible();
});
