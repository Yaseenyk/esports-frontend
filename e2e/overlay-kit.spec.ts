import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// The OBS overlay kit (behind NEXT_PUBLIC_OVERLAY_KIT). Run with the flag set the same way as the build:
//   flag on  (the Tests workflow's main e2e job): the tool feeds the overlay live, the pages work, the streamerOS card is honest.
//   flag off (the production default, the "flag-off" job): no kit page is emitted, listed in the sitemap or linked from a tool.
const ON = ["1", "true", "on"].includes(process.env.NEXT_PUBLIC_OVERLAY_KIT ?? "");
const WAITLIST = "https://streamerosai.com/download/";

const transparent = async (p: Page) => {
  expect(await p.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
  expect(await p.evaluate(() => getComputedStyle(document.documentElement).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
};
async function axe(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(900);
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).exclude("iframe").analyze();
  return r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
}

test.describe("overlay kit, flag on", () => {
  test.skip(!ON, "the build has the overlay kit flag off");

  test("a points table update in the tool shows on the overlay page at once (two pages, one browser)", async ({ context }) => {
    const tool = await context.newPage();
    await tool.goto("/points-table/free-fire/");
    const box = tool.getByTestId("overlay-kit-connect");
    await expect(box).toContainText("Off. Nothing is sent");
    await box.getByLabel("Send to the OBS overlay").check();
    await expect(tool.getByTestId("overlay-kit-status")).toContainText("4 teams sent");

    const ov = await context.newPage();
    await ov.goto("/overlay-kit/live/#v=points");
    const rows = ov.locator('[data-kit-view="points"] li');
    // The tool's own ranking: Charlie 34, then Bravo and Alpha level on 30 (Bravo has more kills), then Delta 24.
    await expect(rows.first()).toContainText("Charlie");
    await expect(rows.first()).toContainText("34");
    await expect(rows.nth(1)).toContainText("Bravo");
    await transparent(ov);
    expect((await ov.evaluate(() => document.querySelector('meta[name="robots"]')?.getAttribute("content"))) ?? "").toContain("noindex");
    await expect(ov.locator("footer")).toBeHidden();

    // Delta gets 17 more kills in match 1: 24 + 17 = 41, first place. The overlay follows without a reload.
    await tool.getByLabel("Delta, match 1, kills").fill("20");
    await expect(rows.first()).toContainText("Delta");
    await expect(rows.first()).toContainText("41");

    // Team cards for one team, and the kill leaders from team kills.
    await ov.goto("/overlay-kit/live/#v=cards&team=delta&area=bottom");
    const card = ov.locator('[data-kit-view="cards"] article');
    await expect(card).toHaveCount(1);
    await expect(card).toContainText("Delta");
    await expect(card).toContainText("Rank 1");
    await expect(card).toContainText("41 pts");
    await expect(card.locator("svg text")).toHaveText("DE"); // the drawn badge, no logo
    await ov.goto("/overlay-kit/live/#v=fraggers");
    await expect(ov.locator('[data-kit-view="fraggers"]')).toContainText("Team kills");
    await expect(ov.locator('[data-kit-view="fraggers"] li').first()).toContainText("Delta");
    await transparent(ov);

    // Turning sending off stops updates.
    await box.getByLabel("Send to the OBS overlay").uncheck();
    await expect(tool.getByTestId("overlay-kit-status")).toContainText("Off");
  });

  test("player kills typed on the kit page drive the top fraggers overlay live", async ({ context }) => {
    const kit = await context.newPage();
    await kit.goto("/overlay-kit/");
    const ov = await context.newPage();
    await ov.goto("/overlay-kit/live/#v=fraggers&n=3");
    await kit.getByRole("button", { name: "Add a player" }).click();
    await kit.getByLabel("Player 1 name").fill("Ana");
    await kit.getByLabel("Player 1 team").fill("Bravo");
    await kit.getByLabel("Player 1 kills").fill("9");
    await kit.getByRole("button", { name: "Add a player" }).click();
    await kit.getByLabel("Player 2 name").fill("Zed");
    await kit.getByLabel("Player 2 kills").fill("12");
    const list = ov.locator('[data-kit-view="fraggers"]');
    await expect(list).toContainText("Player kills");
    await expect(list.locator("li").first()).toContainText("Zed");
    await expect(list.locator("li").nth(1)).toContainText("Ana");
    await expect(list.locator("li").nth(1)).toContainText("Bravo");
    await kit.getByLabel("Player 1 kills").fill("15");
    await expect(list.locator("li").first()).toContainText("Ana");
  });

  test("the Valorant league feeds the overlay with played, won, lost and points", async ({ context }) => {
    const tool = await context.newPage();
    await tool.goto("/points-table/valorant/");
    await tool.getByTestId("overlay-kit-connect").getByLabel("Send to the OBS overlay").check();
    await expect(tool.getByTestId("overlay-kit-status")).toContainText("4 teams sent");
    const ov = await context.newPage();
    await ov.goto("/overlay-kit/live/#v=points&src=valorant&theme=stadium");
    const view = ov.locator('[data-kit-view="points"]');
    await expect(view).toContainText("League table");
    await expect(view).toContainText("Night Owls");
    await expect(view).toContainText("Pts");
  });

  test("the kit page copies an OBS link with everything after the #, and the link's snapshot works in a fresh browser", async ({ context, browser, baseURL }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]).catch(() => undefined);
    const tool = await context.newPage();
    await tool.goto("/points-table/bgmi/");
    await tool.getByTestId("overlay-kit-connect").getByLabel("Send to the OBS overlay").check();
    await expect(tool.getByTestId("overlay-kit-status")).toContainText("teams sent");
    const kit = await context.newPage();
    await kit.goto("/overlay-kit/");
    await expect(kit.getByTestId("kit-source")).toContainText("BGMI");
    const view = kit.getByTestId("kit-view-cards");
    await view.getByLabel("Where on screen").selectOption("right");
    const url = await kit.getByTestId("kit-url-cards").inputValue();
    expect(url.startsWith(`${baseURL}/overlay-kit/live/#v=cards&`)).toBe(true);
    expect(url).not.toContain("?");
    expect(url).toContain("area=right");
    expect(url).toContain("&d=");
    await view.getByRole("button", { name: "Copy OBS URL" }).click();
    await expect(view.getByRole("status")).not.toBeEmpty();
    // The live preview on the kit page follows the tool.
    await kit.getByTestId("kit-view-points").getByRole("button", { name: "Preview below" }).click();
    await expect(kit.frameLocator('[data-testid="kit-preview"]').locator('[data-kit-view="points"]')).toContainText("Charlie");
    // A fresh browser (like OBS's own) has no saved data: the snapshot in the link fills the overlay.
    const fresh = await browser.newContext();
    const p = await fresh.newPage();
    await p.goto(url);
    await expect(p.locator('[data-kit-view="cards"] article').first()).toContainText("Charlie");
    await expect(p.locator('[data-kit-area="right"]')).toBeVisible();
    await transparent(p);
    await fresh.close();
  });

  test("an overlay with no data waits quietly, and a damaged link never breaks it", async ({ page }) => {
    await page.goto("/overlay-kit/live/#v=nope&d=%%%broken");
    await expect(page.getByRole("status")).toContainText("Waiting for a points table");
    await transparent(page);
  });

  test("the kit page and the OBS guide are real pages, with the honest streamerOS card and no serious accessibility problems", async ({ page }) => {
    for (const [path, h1] of [["/overlay-kit/", "OBS overlay kit"], ["/overlay-kit/obs-setup/", "Set up the overlay kit in OBS Studio"]] as const) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(h1);
      expect(await page.locator('meta[name="robots"][content*="noindex"]').count()).toBe(0);
      await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", new RegExp(`${path}$`));
      const card = page.getByTestId("streameros-card");
      await expect(card.getByRole("heading")).toHaveText("Coming in streamerOS, February 2027");
      await expect(card).toContainText("not released yet");
      await expect(card.getByRole("link", { name: "Join the streamerOS waitlist" })).toHaveAttribute("href", WAITLIST);
      expect(await axe(page)).toEqual([]);
    }
    await expect(page.getByText("Width to 1920 and Height to 1080")).toBeVisible();
    await expect(page.getByText("background-color: rgba(0, 0, 0, 0)")).toBeVisible();
    await expect(page.getByRole("heading", { name: "5. Refreshing and fixing problems" })).toBeVisible();
  });

  test("the tools link to the kit, and the kit pages are in the sitemap (the browser source is not)", async ({ page, request }) => {
    await page.goto("/points-table/cod-mobile/");
    await expect(page.getByTestId("overlay-kit-connect").getByRole("link", { name: "Open the overlay kit" })).toHaveAttribute("href", "/overlay-kit/");
    const sm = await (await request.get("/sitemap.xml")).text();
    expect(sm).toContain("/overlay-kit/</loc>");
    expect(sm).toContain("/overlay-kit/obs-setup/</loc>");
    expect(sm).not.toContain("/overlay-kit/live/");
  });
});

test.describe("overlay kit, flag off", () => {
  test.skip(ON, "the build has the overlay kit flag on");

  test("no kit page is emitted, listed or linked", async ({ page, request }) => {
    for (const path of ["/overlay-kit/", "/overlay-kit/obs-setup/", "/overlay-kit/live/"]) expect((await request.get(path)).status()).toBe(404);
    const sm = await (await request.get("/sitemap.xml")).text();
    expect(sm).not.toContain("overlay-kit");
    for (const path of ["/points-table/free-fire/", "/points-table/valorant/"]) {
      await page.goto(path);
      await expect(page.getByRole("button", { name: "Open the screen" })).toBeVisible(); // the tool has loaded
      await expect(page.getByTestId("overlay-kit-connect")).toHaveCount(0);
      expect(await page.locator('a[href^="/overlay-kit"]').count()).toBe(0);
    }
  });
});
