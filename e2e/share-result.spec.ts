import fs from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";

// "Share result": one button directly under every result, outside the optional TV step. On the phone profile the share sheet is
// stubbed (a test cannot tap the real one) and records the file it was handed; on desktop the picture downloads and the message is copied.

declare global { interface Window { __shared: { name: string; type: string; head: number[]; text?: string } | null } }

test.beforeEach(async ({ page, context, browserName }) => {
  if (browserName === "chromium") await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.addInitScript(() => {
    window.__shared = null;
    Object.defineProperty(navigator, "canShare", { value: (d: { files?: File[] }) => Boolean(d?.files?.length), configurable: true });
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (d: { files: File[]; text?: string }) => {
        const f = d.files[0]!;
        const head = Array.from(new Uint8Array(await f.arrayBuffer()).slice(0, 24));
        window.__shared = { name: f.name, type: f.type, head, text: d.text };
      },
    });
  });
});

const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const size = (head: number[]) => ({ w: Buffer.from(head).readUInt32BE(16), h: Buffer.from(head).readUInt32BE(20) });

/** Presses the button inside `scope` and checks that a PNG of the right shape came out and that the message names `path`. */
async function shareFrom(page: Page, scope: Locator, path: string, phone: boolean, o: { pt?: boolean; story?: boolean } = {}) {
  const box = scope.getByTestId("share-result").first();
  await expect(box).toBeVisible();
  const button = box.getByRole("button", { name: o.pt ? "Compartilhar resultado" : "Share result" });
  if (o.story) await box.getByRole("button", { name: "Story (9:16)" }).click();
  const footer = `${o.pt ? "Feito com" : "Made with"} Esports Hub · esports.streamerosai.com${path.replace(/\/$/, "")}`;
  let head: number[];
  if (phone) {
    await button.click();
    await expect.poll(() => page.evaluate(() => window.__shared)).not.toBeNull();
    const shared = (await page.evaluate(() => window.__shared))!;
    expect(shared.type).toBe("image/png");
    expect(shared.name).toMatch(/^[a-z0-9-]+-(portrait|story)\.png$/);
    expect(shared.text?.split("\n").at(-1)).toBe(footer);
    head = shared.head;
    await expect(box.getByRole("status")).toContainText(o.pt ? "Compartilhado" : "Shared");
  } else {
    const [download] = await Promise.all([page.waitForEvent("download"), button.click()]);
    expect(download.suggestedFilename()).toMatch(/^[a-z0-9-]+-(portrait|story)\.png$/);
    head = [...fs.readFileSync((await download.path())!).subarray(0, 24)];
    await expect(box.getByRole("status")).toContainText(o.pt ? "mensagem copiada" : "message copied");
    const text = await page.evaluate(() => navigator.clipboard.readText());
    expect(text.split("\n").at(-1)).toBe(footer);
  }
  expect(head.slice(0, 8)).toEqual(PNG);
  expect(size(head)).toEqual({ w: 1080, h: o.story ? 1920 : 1350 });
}

const isPhone = (name: string) => name === "phone";

for (const path of ["/points-table/free-fire/", "/points-table/bgmi/", "/points-table/cod-mobile/", "/tools/points-table/"]) {
  test(`${path}: Share result sits under the standings and makes a picture with the page address`, async ({ page }, info) => {
    await page.goto(path);
    const standings = page.locator("#pt-standings");
    await expect(standings.getByRole("region", { name: "Standings table" })).toBeVisible();
    await shareFrom(page, standings, path, isPhone(info.project.name), { story: path === "/points-table/cod-mobile/" });
  });
}

test("the Portuguese page shares in Portuguese with its own address", async ({ page }, info) => {
  await page.goto("/pt-br/points-table/free-fire/");
  await shareFrom(page, page.locator("#pt-standings"), "/pt-br/points-table/free-fire/", isPhone(info.project.name), { pt: true });
});

test("single elimination: Share result is under the bracket", async ({ page }, info) => {
  await page.goto("/tools/brackets/");
  await shareFrom(page, page.locator("#bk-pick"), "/tools/brackets/", isPhone(info.project.name));
});

test("double elimination: Share result is under the bracket", async ({ page }, info) => {
  await page.goto("/tools/double-elimination/");
  await shareFrom(page, page.locator("#de-pick"), "/tools/double-elimination/", isPhone(info.project.name));
});

test("round robin: Share result appears under the league table once a score is in", async ({ page }, info) => {
  await page.goto("/tools/round-robin/");
  await expect(page.locator("#rr-table").getByTestId("share-result")).toHaveCount(0);
  const first = page.locator("#rr-scores fieldset").first().locator("input");
  await first.nth(0).fill("3"); await first.nth(1).fill("1");
  await shareFrom(page, page.locator("#rr-table"), "/tools/round-robin/", isPhone(info.project.name));
});

test("groups: the group tables and the knockout each have their own Share result", async ({ page }, info) => {
  await page.goto("/tools/groups/");
  const inputs = page.locator("#gk-scores input");
  await inputs.nth(0).fill("2"); await inputs.nth(1).fill("0");
  await shareFrom(page, page.locator("#gk-scores"), "/tools/groups/", isPhone(info.project.name));
  await page.evaluate(() => { window.__shared = null; });
  await shareFrom(page, page.locator("#gk-knockout"), "/tools/groups/", isPhone(info.project.name), { story: true });
});

test("Valorant league: Share result is under the standings once a match is finished", async ({ page }, info) => {
  await page.goto("/points-table/valorant/");
  const inputs = page.locator("#ml-results input");
  await inputs.nth(0).fill("13"); await inputs.nth(1).fill("7");
  await shareFrom(page, page.locator("#ml-table"), "/points-table/valorant/", isPhone(info.project.name));
});

test("one share block on a points table: picture, design, text copy and WhatsApp text together", async ({ page }) => {
  await page.goto("/points-table/free-fire/");
  const box = page.getByTestId("share-result");
  await expect(box).toHaveCount(1);
  await expect(box.getByRole("combobox", { name: "Design" })).toBeVisible();
  await expect(box.getByRole("link", { name: "Send the text on WhatsApp" })).toHaveAttribute("href", /^https:\/\/wa\.me\/\?text=/);
  await expect(box.getByRole("button", { name: "Copy a text version" })).toBeEnabled();
  // The screen-design share panel is folded away, so the page shows a single share block.
  await expect(page.getByTestId("more-share")).not.toHaveAttribute("open", /.*/);
  await expect(page.getByRole("button", { name: "Share on WhatsApp or Instagram" })).toBeHidden();
  // Share result is not a second cyan primary: it is a secondary button.
  expect(await box.getByRole("button", { name: "Share result" }).evaluate((b) => getComputedStyle(b).backgroundColor)).not.toBe("rgb(34, 211, 238)");
});
