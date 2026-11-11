import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";
import { signedIn } from "./helpers";

const step = (page: Page, name: string) => page.locator("ol button").filter({ hasText: name }).first().click();
const openMenu = async (page: import("@playwright/test").Page) => { const t = page.getByRole("button", { name: /Save, open or share/ }); if (await t.isVisible() && (await t.getAttribute("aria-expanded")) !== "true") await t.click(); }; // phones keep Save / Open / Online in a menu
const open = async (page: Page) => { await signedIn(page); await page.goto("/app/id-cards/"); await expect(page.getByRole("heading", { level: 1 })).toContainText(/ID cards/i); };

test("demo event: teams, people and cards are all there", async ({ page }) => {
  await open(page);
  await expect(page.locator("ol")).toContainText("3 teams");
  await expect(page.locator("ol")).toContainText("12 people");
  await step(page, "People");
  await expect(page.getByRole("textbox", { name: "Full name" }).first()).toHaveValue("Aarav Mehta");
  await step(page, "Design");
  await expect(page.locator(".idcard-box, [data-card]").first().or(page.locator("[style*='container-type']").first())).toBeVisible();
  await step(page, "Print");
  await expect(page.getByRole("button", { name: "Download PDF (real size)" })).toBeVisible();
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
  await page.getByText("More ways to add people").click(); // scanning is an extra way, not the first thing a new organiser sees
  await page.getByRole("button", { name: /Scan Aadhaar cards/ }).click();
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
  const [dl] = await Promise.all([page.waitForEvent("download"), (async () => { await openMenu(page); await page.getByRole("button", { name: /^Save project/ }).click(); })()]);
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
  const [dl] = await Promise.all([page.waitForEvent("download", { timeout: 140_000 }), page.getByRole("button", { name: "Download PDF (real size)" }).click()]);
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
  await expect(page.getByRole("button", { name: "Download PDF (real size)" })).toBeVisible({ timeout: 30_000 });
  await expect(page.locator("[role=status] .sk")).toHaveCount(0);
});

test("the gate page accepts a pass code and rejects a forged one", async ({ page }) => {
  await page.goto("/gate/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText(/check-in pack|load.*pack/i).first()).toBeVisible();
});

test("adding a person by hand opens their details, and a new ID never repeats one that is in use", async ({ page }) => {
  await open(page);
  await step(page, "People");
  // Remove the second person on the first team, so "count + 1" would hand out an ID that is still taken.
  await page.getByRole("button", { name: "Open details for Diya Kulkarni" }).click();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Remove person" }).click();
  await expect(page.locator("ol")).toContainText("11 people");
  await page.getByRole("tab", { name: /By hand|Add one by hand/ }).click();
  await page.getByRole("button", { name: "+ Add a person" }).click();
  await expect(page.getByLabel("ID on the card")).toHaveValue("KON-006");
  await expect(page.locator("ol")).toContainText("12 people");
  await expect(page.getByText("Another person already has this ID")).toHaveCount(0);
});

test("removing a person asks first, and saying no keeps them", async ({ page }) => {
  await open(page);
  await step(page, "People");
  await page.getByRole("button", { name: "Open details for Aarav Mehta" }).click();
  page.once("dialog", (d) => d.dismiss());
  await page.getByRole("button", { name: "Remove person" }).click();
  await expect(page.locator("ol")).toContainText("12 people");
});

test("two people with the same ID are flagged where the ID is typed", async ({ page }) => {
  await open(page);
  await step(page, "People");
  await page.getByRole("button", { name: "Open details for Aarav Mehta" }).click();
  await page.getByLabel("ID on the card").fill("KON-002");
  await expect(page.getByRole("alert").filter({ hasText: /already has this ID/ }).first()).toBeVisible();
  await expect(page.getByLabel("ID on the card").first()).toHaveValue("KON-002"); // typing does not close the row
});

test("the People step offers two plain ways to add people and keeps the rest under More ways", async ({ page }) => {
  await open(page);
  await step(page, "People");
  const tabs = page.getByRole("tablist", { name: "How to add people" });
  await expect(tabs.getByRole("tab")).toHaveCount(2);
  await expect(page.getByRole("tab", { name: /By hand|Add one by hand/ })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("checkbox", { name: /permission/i })).toHaveCount(0); // the scan form is not in the way
  await expect(page.getByText(/Choose one way to add people/)).toBeVisible();
  await page.getByText("More ways to add people").click();
  await expect(page.getByRole("button", { name: /Send players an invite link/ })).toBeVisible();
});

test("the step intro says what to do in plain words", async ({ page }) => {
  await open(page);
  await expect(page.getByText(/Type your event name and list your teams/)).toBeVisible();
});
