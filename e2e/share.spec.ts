import fs from "node:fs";
import { expect, test, type Page } from "@playwright/test";

// The phone profile exposes the system share sheet, which a test cannot click. Switch it off so the picture downloads instead.
test.beforeEach(async ({ page }) => { await page.addInitScript(() => { Object.defineProperty(navigator, "share", { value: undefined, configurable: true }); Object.defineProperty(navigator, "canShare", { value: undefined, configurable: true }); }); });

// A 1x1 PNG, small enough to travel in a link.
const LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const table = (extra?: unknown) => ({
  v: "table",
  d: { title: "Spring Cup", subtitle: "After 2 matches", head: ["#", "Team", "M1", "M2", "Total"], rows: [["1", "Alpha", "20", "18", "38"], ["2", "Bravo", "15", "16", "31"], ["3", "Charlie", "12", "11", "23"]], strong: 4 },
  ...(extra ? { x: extra } : null),
});

/** The same plain-base64 link the other specs use: p. then url-safe base64 of the JSON. */
const hashFor = (page: Page, payload: unknown) => page.evaluate((p) => { const bytes = new TextEncoder().encode(JSON.stringify(p)); let s = ""; for (const x of bytes) s += String.fromCharCode(x); return "p." + btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }, payload);

const EXTRAS = { ticker: ["Finals start at 6 PM", "Free entry for students"], sponsors: [{ name: "Acme Energy", logo: LOGO }, { name: "No Logo Co" }] };

test("a display screen shows the ticker and the sponsor strip from the link", async ({ page }) => {
  await page.goto("/tools/display-screen/");
  const hash = await hashFor(page, table(EXTRAS));
  await page.goto(`/display/#d=${hash}`);
  await expect(page.getByRole("heading", { name: "Spring Cup" })).toBeVisible();
  await expect(page.getByLabel("Announcements")).toBeVisible();
  await expect(page.getByLabel("Announcements").getByText("Finals start at 6 PM").first()).toBeVisible();
  const logo = page.getByRole("img", { name: "Acme Energy" });
  await expect(logo).toBeVisible();
  await expect(logo).toHaveAttribute("src", LOGO);
  await expect(page.getByLabel("Sponsors").getByText("No Logo Co")).toBeVisible();
  // The strips sit under the table and do not cover it.
  const box = async (loc: ReturnType<Page["locator"]>) => (await loc.boundingBox())!;
  const rows = await box(page.locator("section[aria-label='Spring Cup']"));
  const strip = await box(page.getByLabel("Sponsors"));
  expect(rows.y + rows.height).toBeLessThanOrEqual(strip.y + 1);
});

test("a screen with no extras has no ticker and no sponsor strip", async ({ page }) => {
  await page.goto("/tools/display-screen/");
  const hash = await hashFor(page, table());
  await page.goto(`/display/#d=${hash}`);
  await expect(page.getByRole("heading", { name: "Spring Cup" })).toBeVisible();
  await expect(page.getByLabel("Announcements")).toHaveCount(0);
  await expect(page.getByLabel("Sponsors")).toHaveCount(0);
});

test("?extras=0 hides the ticker and the sponsors", async ({ page }) => {
  await page.goto("/tools/display-screen/");
  const hash = await hashFor(page, table(EXTRAS));
  await page.goto(`/display/?extras=0#d=${hash}`);
  await expect(page.getByRole("heading", { name: "Spring Cup" })).toBeVisible();
  await expect(page.getByLabel("Announcements")).toHaveCount(0);
  await expect(page.getByLabel("Sponsors")).toHaveCount(0);
});

test("?tick=a|b|c gives a countdown screen a ticker", async ({ page }) => {
  const soon = new Date(Date.now() + 3 * 3600_000 + 30_000).toISOString();
  await page.goto(`/display/?v=countdown&t=${encodeURIComponent(soon)}&title=Doors&tick=${encodeURIComponent("Gates open|Bring your pass|Good luck")}`);
  await expect(page.getByLabel("Announcements").getByText("Bring your pass").first()).toBeVisible();
});

test("the ticker stands still when the visitor asks for reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/tools/display-screen/");
  const hash = await hashFor(page, table(EXTRAS));
  await page.goto(`/display/#d=${hash}`);
  await expect(page.getByLabel("Announcements")).toBeVisible();
  expect(await page.locator(".ds-ticker-track").evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
});

test("sponsors and announcements are saved once and every tool's screen link carries them", async ({ page }) => {
  await page.goto("/tools/points-table/");
  await page.getByText("Sponsors and announcements").click();
  await page.getByLabel(/Announcement lines/).fill("Finals at 6 PM\nFree entry");
  await page.getByRole("button", { name: "Add a sponsor" }).click();
  await page.getByLabel("Name", { exact: true }).first().fill("Acme Energy");
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("eh-extras-v1") ?? "null"));
  expect(saved.ticker).toEqual(["Finals at 6 PM", "Free entry"]);
  expect(saved.sponsors[0].name).toBe("Acme Energy");
  // The screen opened from this tool shows them.
  const [screen] = await Promise.all([page.waitForEvent("popup"), page.getByRole("button", { name: "Open the screen" }).click()]);
  await screen.waitForLoadState("load");
  await expect(screen.getByLabel("Announcements").getByText("Finals at 6 PM").first()).toBeVisible();
  await expect(screen.getByLabel("Sponsors").getByText("Acme Energy")).toBeVisible();
  // And they are still there on another tool after a reload.
  await page.goto("/tools/brackets/");
  await page.getByText("Sponsors and announcements").click();
  await expect(page.getByLabel(/Announcement lines/)).toHaveValue("Finals at 6 PM\nFree entry");
});

test("the share button gives a PNG picture, in both shapes", async ({ page }) => {
  await page.goto("/tools/points-table/");
  for (const [chip, name] of [["Square post", "square"], ["Story", "story"]] as const) {
    await page.getByRole("button", { name: chip, exact: true }).last().click(); // the share step comes after the winners block, which has its own shape chips
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Share on WhatsApp or Instagram" }).click()]);
    expect(download.suggestedFilename()).toMatch(new RegExp(`^[a-z0-9-]+-${name}\\.png$`));
    const bytes = fs.readFileSync((await download.path())!);
    expect([...bytes.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]); // the PNG signature
    // The picture size is in the IHDR chunk: width and height as big-endian numbers at bytes 16 to 24.
    expect(bytes.readUInt32BE(16)).toBe(1080);
    expect(bytes.readUInt32BE(20)).toBe(name === "square" ? 1080 : 1920);
    await expect(page.getByText(/Saved the picture/)).toBeVisible();
  }
});

test("the text version is copied, and the WhatsApp link carries it", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium", "clipboard permissions are set up for Chromium");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/tools/points-table/");
  await page.getByRole("button", { name: "Copy a text version" }).click();
  await expect(page.getByText(/Text copied/)).toBeVisible();
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain("*Standings*");
  expect(text).toMatch(/1\. \S+ - \d+ pts/);
  expect(text).toContain("Made with Esports Hub");
  const href = (await page.getByRole("link", { name: "Send the text on WhatsApp" }).getAttribute("href"))!;
  expect(href.startsWith("https://wa.me/?text=")).toBe(true);
  expect(decodeURIComponent(href.slice("https://wa.me/?text=".length))).toContain("Made with Esports Hub");
});

test("when results are in, a Winners block offers a poster and certificates", async ({ page }) => {
  await page.goto("/tools/points-table/"); // the example already has results
  const block = page.getByRole("region", { name: "Winners", exact: true });
  await expect(block).toBeVisible();
  const href = (await block.getByRole("link", { name: "Make winner certificates" }).getAttribute("href"))!;
  const awards = new URL(href, "http://x.test").searchParams.get("awards")!;
  expect(awards).toMatch(/^Winner:[^|:]+\|Runner-up:[^|:]+\|Third place:[^|:]+$/);
  const [download] = await Promise.all([page.waitForEvent("download"), block.getByRole("button", { name: "Share the winners poster" }).click()]);
  const bytes = fs.readFileSync((await download.path())!);
  expect([...bytes.subarray(0, 4)]).toEqual([0x89, 0x50, 0x4e, 0x47]);
});

test("the bracket maker shows the Winners block only once a champion is decided", async ({ page }) => {
  await page.goto("/tools/brackets/");
  await expect(page.getByRole("region", { name: "Winners", exact: true })).toHaveCount(0);
  // Pick winners round by round: A, D, B, C win the quarter-finals, then A and B the semi-finals, then A the final.
  for (const name of ["A", "D", "B", "C", "A", "B", "A"]) {
    await page.getByRole("button", { name: new RegExp(`^Sample Squad ${name} wins this match$`) }).first().click();
  }
  await expect(page.getByText("Champion decided")).toBeVisible();
  const block = page.getByRole("region", { name: "Winners", exact: true });
  await expect(block).toBeVisible();
  await expect(block.getByRole("link", { name: "Make winner certificates" })).toHaveAttribute("href", /awards=Winner%3A/);
});
