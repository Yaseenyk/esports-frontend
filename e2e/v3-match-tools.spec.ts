// Organiser match tools: match rooms (organiser + captain), the match recap and results from a screenshot. The API is MOCKED (route interception):
// nothing reaches the real backend, and the screenshot reader's text recognition is replaced by fixture text (window.__EH_OCR_TEXT__), so no
// language data is downloaded. Run one project at a time:  npx playwright test e2e/v3-match-tools.spec.ts --project=desktop
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { mockV3, signedIn, type Handler } from "./v3-helpers";

test.setTimeout(120_000);
declare global { interface Window { __recapShared: { name: string; text?: string } | null; __EH_OCR_TEXT__?: string } }

const EV = { id: "e1", name: "Gokte Cup", game: "BGMI", date: "2026-12-01", role: "owner" };
const isPhone = (name: string) => name === "phone";
const PNG_BYTES = Buffer.from("89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c63000100000500010d0a2db40000000049454e44ae426082", "hex");

async function axe(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(r.violations.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)).toBe(false);
}

test.describe("flags off: nothing new is visible", () => {
  test("the event page shows no match tools and every new page is a calm Not available", async ({ page }) => {
    await signedIn(page, [EV]);
    const seen = await mockV3(page); // every /v3 call answers the real flag-off 404
    await page.goto("/app/events/?id=e1");
    await expect(page.getByRole("heading", { name: "Gokte Cup", level: 2 })).toBeVisible();
    await expect.poll(() => seen.some((s) => s.path === "/v3/events/e1/tools")).toBe(true);
    await page.waitForTimeout(300);
    await expect(page.getByTestId("match-tools")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Match rooms" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Match recap" })).toHaveCount(0);
    for (const p of ["/app/rooms/manage/?id=e1", "/app/rooms/", "/app/recap/?id=e1", "/app/screenshot-results/?id=e1"]) {
      await page.goto(p);
      await expect(page.getByRole("heading", { name: "Not available yet" })).toBeVisible();
      await expect(page.getByRole("button", { name: /Save room|Add team|Share recap|Read the screenshot/ })).toHaveCount(0);
      await expect(page.locator('input[type="file"]')).toHaveCount(0);
    }
    expect(seen.filter((s) => s.method !== "GET")).toEqual([]); // nothing was written
  });
});

test.describe("flags on", () => {
  test("organiser: links on the event page, add a room, credentials leave the screen, view log", async ({ page }) => {
    const rooms: Record<string, unknown>[] = [];
    const posted: unknown[] = [];
    const handlers: Record<string, Handler> = {
      "GET /v3/events/e1/tools": () => ({ body: { rooms: true, recaps: true, screenshots: true, canEdit: true } }),
      "GET /v3/events/e1/rooms": () => ({ body: { event: { id: "e1", name: "Gokte Cup" }, canEdit: true, rooms, matches: [{ id: "m1", stage: "main", round: 1, slot: 1, teamA: "Alpha Wolves", teamB: "Beta Hawks" }], limits: { revealMaxMinutes: 180, revealDefaultMinutes: 15, credentialMax: 40 } } }),
      "POST /v3/events/e1/rooms": ({ body }) => {
        posted.push(body);
        const b = body as Record<string, unknown>;
        const r = { id: "a".repeat(32), label: b.label, match: null, startsAt: b.startsAt, revealAt: b.startsAt, revealMinutesBefore: b.revealMinutesBefore, phase: "waiting", hasCredentials: true, version: 1, rotatedAt: null, purgedAt: null, views: 0, teamsSeenCurrent: 0 };
        rooms.push(r);
        return { status: 201, body: r };
      },
      [`GET /v3/events/e1/rooms/${"a".repeat(32)}/views`]: () => ({ body: { room: { id: "a".repeat(32), label: "Match 3 lobby", version: 1 }, views: [{ team: "Alpha Wolves", version: 1, viewedAt: "2026-12-01T18:20:00.000Z" }] } }),
    };
    await signedIn(page, [EV]);
    await mockV3(page, handlers);
    await page.goto("/app/events/?id=e1");
    const tools = page.getByTestId("match-tools");
    await expect(tools).toBeVisible();
    await expect(tools.getByRole("link", { name: "Results from a screenshot" })).toBeVisible();
    await expect(tools.getByRole("link", { name: "Match recap" })).toBeVisible();
    await tools.getByRole("link", { name: "Match rooms" }).click();
    await expect(page).toHaveURL(/\/app\/rooms\/manage\/\?id=e1/);
    await expect(page.getByRole("heading", { name: "Match rooms", level: 1 })).toBeVisible();
    await expect(page.getByText("No rooms yet.")).toBeVisible();

    // validation first: nothing is sent
    await page.getByRole("button", { name: "Save room" }).click();
    await expect(page.getByText("Type the room ID", { exact: false })).toBeVisible();
    expect(posted).toEqual([]);

    await page.getByLabel("Room name").fill("Match 3 lobby");
    await page.getByLabel("Match starts at").fill("2026-12-01T18:30");
    await page.getByLabel("Captains can see it").selectOption("15");
    await page.getByLabel("Room ID").fill("ROOM-778812");
    await page.getByLabel("Room password").fill("tiger42");
    await page.getByRole("button", { name: "Save room" }).click();
    await expect(page.getByText("Saved Match 3 lobby.", { exact: false })).toBeVisible();
    expect(posted).toHaveLength(1);
    expect(posted[0]).toMatchObject({ label: "Match 3 lobby", roomId: "ROOM-778812", password: "tiger42", revealMinutesBefore: 15, matchId: null });
    // the typed credentials are cleared and never shown again on the organiser's screen
    await expect(page.getByLabel("Room ID")).toHaveValue("");
    await expect(page.getByLabel("Room password")).toHaveValue("");
    const card = page.getByTestId("room-card");
    await expect(card).toContainText("Match 3 lobby");
    await expect(card).toContainText("15 minutes before the start");
    expect(await page.locator("body").innerText()).not.toMatch(/ROOM-778812|tiger42/);
    await card.getByRole("button", { name: "Who has seen it" }).click();
    await expect(card.getByRole("region")).toContainText("Alpha Wolves");
    await axe(page);
  });

  test("captain: claim with a link (only the token is sent), waiting room is locked, revealed room shows the details until hidden", async ({ page, browserName }) => {
    const claims: unknown[] = [];
    const R1 = { id: "b".repeat(32), event: { id: "e1", name: "Gokte Cup" }, team: "Alpha Wolves", label: "Match 1 lobby", match: null, startsAt: "2026-12-01T18:30:00.000Z", revealAt: "2026-12-01T18:15:00.000Z", phase: "revealed" };
    const R2 = { ...R1, id: "c".repeat(32), label: "Final lobby", phase: "waiting" };
    await signedIn(page, []);
    const seen = await mockV3(page, {
      "GET /v3/me/rooms": () => ({ body: { rooms: [R1, R2] } }),
      "POST /v3/rooms/captain-claim": ({ body }) => { claims.push(body); return { body: { team: "Alpha Wolves" } }; },
      [`POST /v3/me/rooms/${R1.id}/reveal`]: () => ({ body: { id: R1.id, label: R1.label, team: R1.team, startsAt: R1.startsAt, version: 1, roomId: "ROOM-778812", password: "tiger42" } }),
    });
    await page.goto("/app/rooms/");
    await expect(page.getByRole("heading", { name: "My match rooms" })).toBeVisible();
    const token = "abcdefghijklmnopqrstuvwx_-12";
    await page.getByLabel("Your team's captain link").fill(`https://esports.streamerosai.com/report/?t=${token}`);
    await page.getByRole("button", { name: "Add team" }).click();
    await expect(page.getByText("You are now the captain of Alpha Wolves", { exact: false })).toBeVisible();
    expect(claims).toEqual([{ token }]);
    await expect(page.getByLabel("Your team's captain link")).toHaveValue("");

    const cards = page.getByTestId("captain-room");
    await expect(cards).toHaveCount(2);
    // A waiting room says when it opens, in words, not as a disabled button.
    await expect(cards.nth(1).getByTestId("room-not-yet")).toContainText("Not shown yet");
    await expect(cards.nth(1).getByRole("button", { name: /Not shown yet|Show room ID/ })).toHaveCount(0);
    await expect(page.getByTestId("room-password")).toHaveCount(0);
    await cards.nth(0).getByRole("button", { name: "Show room ID and password" }).click();
    await expect(page.getByTestId("room-id")).toHaveText("ROOM-778812");
    await expect(page.getByTestId("room-password")).toHaveText("tiger42");
    await expect(page.locator('[data-clarity-mask="true"][translate="no"]').first()).toBeVisible();
    // Copy buttons beside each value; the copy is announced. The values stay inside the masked, untranslated block.
    if (browserName === "chromium") await page.context().grantPermissions(["clipboard-read", "clipboard-write"]).catch(() => undefined);
    await cards.nth(0).getByRole("button", { name: "Copy password" }).click();
    await expect(page.getByTestId("room-copied")).toContainText(/Password copied|Copying is blocked/);
    await expect(page.locator('[data-clarity-mask="true"][translate="no"]').first().getByRole("button", { name: "Copy room ID" })).toBeVisible();
    // nothing about the room ever lands in storage or the address
    expect(await page.evaluate(() => JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage }) + location.href)).not.toMatch(/ROOM-778812|tiger42|abcdefghijkl/);
    await axe(page);
    await cards.nth(0).getByRole("button", { name: "Hide" }).click();
    await expect(page.getByTestId("room-password")).toHaveCount(0);
    expect(seen.filter((s) => s.path.endsWith("/reveal")).map((s) => s.method)).toEqual(["POST"]);
  });

  test("recap: template text from entered results, editable, picture with the site link", async ({ page, context, browserName }, info) => {
    if (browserName === "chromium") await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.addInitScript(() => {
      window.__recapShared = null;
      Object.defineProperty(navigator, "canShare", { value: (d: { files?: File[] }) => Boolean(d?.files?.length), configurable: true });
      Object.defineProperty(navigator, "share", { configurable: true, value: async (d: { files: File[]; text?: string }) => { window.__recapShared = { name: d.files[0]!.name, text: d.text }; } });
    });
    const br = (matchNo: number, team: string, placement: number, kills: number) => ({ matchNo, team, placement, kills, corrected: false });
    await signedIn(page, [EV]);
    await mockV3(page, {
      "GET /v3/events/e1/recap": () => ({ body: { event: { id: "e1", name: "Gokte Cup", game: "BGMI" }, publicPath: "/tournaments/gokte-cup/", scoring: { title: "", scale: [10, 6, 5, 4], perKill: 1, winPts: 3, drawPts: 1, lossPts: 0 }, matches: [],
        battleRoyale: [br(1, "Alpha Wolves", 1, 5), br(1, "Beta Hawks", 2, 8), br(1, "Gamma Squad", 3, 2), br(1, "Delta Owls", 4, 0), br(2, "Delta Owls", 1, 12), br(2, "Gamma Squad", 2, 9), br(2, "Alpha Wolves", 3, 0), br(2, "Beta Hawks", 4, 1)] } }),
    });
    await page.goto("/app/recap/?id=e1");
    const text = page.getByLabel("Edit before sharing");
    await expect(text).toHaveValue(/Delta Owls won Match 2 with 12 kills\./);
    await expect(text).toHaveValue(/Gamma Squad climbed to 2nd \(from 3rd\)\./);
    await expect(text).toHaveValue(/esports\.streamerosai\.com\/tournaments\/gokte-cup$/);
    await page.getByLabel("Match", { exact: true }).selectOption({ label: "Match 1" });
    await expect(text).toHaveValue(/Alpha Wolves won Match 1 with 5 kills\./);
    await text.fill("Alpha Wolves won Match 1. GG everyone!");
    await expect(page.getByRole("button", { name: "Back to the original text" })).toBeEnabled();
    await axe(page);
    if (isPhone(info.project.name)) {
      await page.getByRole("button", { name: "Share recap" }).click();
      await expect.poll(() => page.evaluate(() => window.__recapShared)).not.toBeNull();
      const s = (await page.evaluate(() => window.__recapShared))!;
      expect(s.name).toMatch(/^gokte-cup-match-1-recap-portrait.png$/);
      expect(s.text).toBe("Alpha Wolves won Match 1. GG everyone!");
    } else {
      const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Share recap" }).click()]);
      expect(download.suggestedFilename()).toMatch(/^gokte-cup-match-1-recap-portrait.png$/);
      const head = fs.readFileSync((await download.path())!).subarray(0, 8);
      expect([...head]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    }
    await page.getByRole("button", { name: "Back to the original text" }).click();
    await expect(text).toHaveValue(/^Gokte Cup: Match 1 recap/);
  });

  test("screenshot: read on the device, every row starts unconfirmed, nothing saves until all are confirmed, no image is uploaded", async ({ page }) => {
    const fixture = fs.readFileSync(path.resolve("tests/fixtures/ocr-results-br.txt"), "utf8");
    await page.addInitScript((t) => { window.__EH_OCR_TEXT__ = t; }, fixture);
    const saved: unknown[] = [];
    const posts: { url: string; bytes: number; png: boolean }[] = [];
    page.on("request", (r) => { if (r.method() !== "GET" && r.method() !== "OPTIONS") { const b = r.postDataBuffer(); posts.push({ url: r.url(), bytes: b?.length ?? 0, png: !!b && b.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47])) }); } });
    await signedIn(page, [EV]);
    await mockV3(page, {
      "GET /v3/events/e1/screenshot-results": () => ({ body: { event: { id: "e1", name: "Gokte Cup" }, canEdit: true, teams: ["Alpha Wolves", "Beta Hawks", "Gamma Squad", "Delta Owls", "Echo Esports", "Foxtrot Five"], matchNumbers: [1, 2], nextMatchNo: 3 } }),
      "POST /v3/events/e1/screenshot-results": ({ body }) => { saved.push(body); return { status: 201, body: { matchNo: 3, saved: 6 } }; },
    });
    await page.goto("/app/screenshot-results/?id=e1");
    await expect(page.getByRole("heading", { name: "Reading can be wrong" })).toBeVisible();
    await expect(page.getByText("It is not uploaded anywhere", { exact: false })).toBeVisible();
    await page.locator('input[type="file"]').setInputFiles({ name: "results.png", mimeType: "image/png", buffer: PNG_BYTES });
    await page.getByRole("button", { name: "Read the screenshot" }).click();
    const rows = page.getByTestId("review-row");
    await expect(rows).toHaveCount(6);
    await expect(page.getByTestId("review-summary")).toHaveText("0 of 6 confirmed");
    for (let i = 0; i < 6; i++) await expect(rows.nth(i)).toContainText("Not checked");
    const save = page.getByRole("button", { name: "Save confirmed results" });
    await expect(save).toBeDisabled();
    await expect(page.getByTestId("save-blocker")).toContainText("Fix the row with a problem first");

    // row 6: the kill count was not read; it cannot be confirmed until it is typed
    await expect(rows.nth(5).getByRole("button", { name: "Confirm row 6" })).toBeDisabled();
    await rows.nth(5).getByLabel("Kills").fill("0");
    await rows.nth(5).getByRole("button", { name: "Use this name" }).click();
    await expect(rows.nth(5).getByLabel("Team")).toHaveValue("Foxtrot Five");
    await rows.nth(3).getByRole("button", { name: "Use this name" }).click();
    await expect(rows.nth(3).getByLabel("Team")).toHaveValue("Delta Owls");
    for (let i = 0; i < 4; i++) await rows.nth(i).getByRole("button", { name: `Confirm row ${i + 1}` }).click();
    await expect(page.getByTestId("review-summary")).toHaveText("4 of 6 confirmed");
    await expect(save).toBeDisabled();
    expect(saved).toEqual([]);
    // One primary confirms the rest that have no problem (the person's own action; it never saves)
    const all = page.getByRole("button", { name: "Confirm all rows without problems" });
    await all.click();
    await expect(page.getByTestId("review-summary")).toHaveText("6 of 6 confirmed");
    await expect(all).toBeDisabled();
    expect(saved).toEqual([]);
    // editing a confirmed row unconfirms it
    await rows.nth(0).getByLabel("Kills").fill("13");
    await expect(rows.nth(0)).toContainText("Not checked");
    await rows.nth(0).getByRole("button", { name: "Confirm row 1" }).click();
    await expect(page.getByTestId("review-summary")).toHaveText("6 of 6 confirmed");
    expect(saved).toEqual([]); // never saved on its own
    await expect(page.getByLabel("Match number")).toHaveValue("3");
    await axe(page);
    await expect(save).toBeEnabled();
    await save.click();
    await expect(page.getByText("Saved 6 rows for match 3.")).toBeVisible();
    expect(saved).toHaveLength(1);
    const body = saved[0] as { matchNo: number; replace: boolean; rows: { team: string; placement: number; kills: number; confirmed: boolean }[] };
    expect(body.matchNo).toBe(3);
    expect(body.rows.every((r) => r.confirmed === true)).toBe(true);
    expect(body.rows.map((r) => [r.team, r.placement, r.kills])).toEqual([["Alpha Wolves", 1, 13], ["Beta Hawks", 2, 8], ["Gamma Squad", 3, 5], ["Delta Owls", 4, 3], ["Echo Esports", 5, 11], ["Foxtrot Five", 6, 0]]);
    // the only write was that small JSON body; no request anywhere carried the picture
    expect(posts.filter((p) => p.png)).toEqual([]);
    expect(posts.every((p) => p.bytes < 4000)).toBe(true);
  });

  test("screenshot: an existing match number needs Replace before saving", async ({ page }) => {
    await page.addInitScript(() => { window.__EH_OCR_TEXT__ = "1 Alpha Wolves 4"; });
    await signedIn(page, [EV]);
    await mockV3(page, { "GET /v3/events/e1/screenshot-results": () => ({ body: { event: { id: "e1", name: "Gokte Cup" }, canEdit: true, teams: ["Alpha Wolves"], matchNumbers: [1, 2], nextMatchNo: 3 } }) });
    await page.goto("/app/screenshot-results/?id=e1");
    await page.locator('input[type="file"]').setInputFiles({ name: "r.png", mimeType: "image/png", buffer: PNG_BYTES });
    await page.getByRole("button", { name: "Read the screenshot" }).click();
    await page.getByRole("button", { name: "Confirm row 1" }).click();
    await page.getByLabel("Match number").fill("2");
    await expect(page.getByTestId("save-blocker")).toContainText("Match 2 already has results");
    await expect(page.getByRole("button", { name: "Save confirmed results" })).toBeDisabled();
    await page.getByLabel("Replace the saved results of this match").check();
    await expect(page.getByRole("button", { name: "Save confirmed results" })).toBeEnabled();
  });
});
