import fs from "node:fs";
import { expect, test, type Page } from "@playwright/test";

// The tools added on 24 Nov 2026: sensitivity converter, team name generator, slot and prize split, rulebook, and the day-wise schedule.
// Each: an indexable page with real content, inputs that change visible output, downloads that are real files, and Share result
// where the tool makes a result to share. Runs on desktop and phone.

async function seoBasics(page: Page, path: string, h1: RegExp) {
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(h1);
  expect(await page.locator('meta[name="robots"][content*="noindex"]').count()).toBe(0);
  await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", new RegExp(`${path}$`));
  expect(await page.locator("section[aria-labelledby=faq]").locator("details").count()).toBeGreaterThanOrEqual(7);
  const types = (await page.locator('script[type="application/ld+json"]').allInnerTexts()).map((t) => JSON.parse(t)).flat().map((x: { "@type"?: string }) => x["@type"]);
  for (const t of ["BreadcrumbList", "FAQPage", "SoftwareApplication"]) expect(types).toContain(t);
}

/** One FAQPage per page, and its questions and answers are the visible FAQ text, word for word. */
async function faqMatchesPage(page: Page) {
  const blocks = (await page.locator('script[type="application/ld+json"]').allInnerTexts()).map((t) => JSON.parse(t)).flat();
  const faqs = blocks.filter((x: { "@type"?: string }) => x["@type"] === "FAQPage");
  expect(faqs).toHaveLength(1);
  const visible = ((await page.locator("section[aria-labelledby=faq]").textContent()) ?? "").replace(/\s+/g, " ");
  for (const q of faqs[0].mainEntity as { name: string; acceptedAnswer: { text: string } }[]) {
    expect(visible).toContain(q.name);
    expect(visible).toContain(q.acceptedAnswer.text.replace(/\s+/g, " "));
  }
}

const shareButton = (page: Page) => page.getByTestId("share-result").first().getByRole("button", { name: "Share result" });
const head = async (download: { path(): Promise<string | null> }, n: number) => fs.readFileSync((await download.path())!).subarray(0, n);

test("sensitivity converter: Valorant to CS2 with cm/360, a DPI change, other games, sources and no mobile conversion", async ({ page }) => {
  await page.goto("/tools/sensitivity-converter/");
  await seoBasics(page, "/tools/sensitivity-converter/", /Sensitivity converter and eDPI calculator/);
  await expect(page).toHaveTitle(/^Sens converter and eDPI calculator/);
  const answer = page.getByTestId("sens-answer");
  await expect(answer).toHaveText("1.27"); // Valorant 0.4 at 800 DPI -> CS2: 0.4 x 0.07 / 0.022
  await expect(page.getByTestId("sens-cm")).toContainText("40.82 cm/360");
  await page.getByLabel("To game").selectOption("ow2");
  await expect(answer).toHaveText("4.24");
  await page.getByLabel("To game").selectOption("cs2");
  await page.getByLabel("I am changing my mouse DPI too").check();
  await page.getByLabel("New mouse DPI").fill("1600");
  await expect(answer).toHaveText("0.64");
  await expect(page.getByTestId("sens-cm")).toContainText("40.82 cm/360"); // the turn distance does not change
  await page.getByRole("button", { name: "Swap the games" }).click();
  await expect(page.getByLabel("From game")).toHaveValue("cs2");
  await page.getByLabel("Your sensitivity in the first game").fill("0");
  await expect(page.getByText("Type a sensitivity above 0").first()).toBeVisible();
  await expect(answer).toHaveCount(0);
  await page.getByLabel("Your sensitivity in the first game").fill("1");
  await expect(page.getByRole("region", { name: "The same setting in every listed game" })).toContainText("Apex Legends");
  // Every value is cited, and the mobile games are explained, not converted.
  await expect(page.locator('a[href^="https://developer.valvesoftware.com/"]').first()).toBeVisible();
  await expect(page.getByRole("heading", { name: /Where the yaw numbers come from \(checked 24 Nov 2026\)/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Why BGMI, Free Fire and COD Mobile are not in the converter" })).toBeVisible();
  await expect(page.getByLabel("To game").locator("option")).toHaveText(["Counter-Strike 2", "Valorant", "Apex Legends", "Overwatch 2"]);
  await expect(shareButton(page)).toBeEnabled();
  // The eDPI calculator: sens x DPI, cm/360, and the eDPI that feels the same in each game.
  await expect(page.getByRole("heading", { name: "eDPI calculator", exact: true })).toBeVisible();
  await expect(page.getByTestId("edpi-answer")).toHaveText("320");
  await expect(page.getByTestId("edpi-cm")).toHaveText("40.82");
  const perGame = page.getByRole("region", { name: "The same feel as an eDPI in every listed game" });
  await expect(perGame.getByRole("row", { name: /Counter-Strike 2/ })).toContainText("1018.2");
  await page.locator("#edpi-sens").fill("1.5");
  await page.locator("#edpi-dpi").fill("400");
  await page.locator("#edpi-game").selectOption("cs2");
  await expect(page.getByTestId("edpi-answer")).toHaveText("600");
  await page.locator("#edpi-sens").fill("0");
  await expect(page.getByText("Fix the box marked above to see your eDPI.")).toBeVisible();
  // The FAQ answers the three questions people search for, and the structured data matches the visible text.
  for (const q of ["What is eDPI?", "How do I convert Valorant sensitivity to CS2?", "What is cm/360?"]) await expect(page.locator("section[aria-labelledby=faq] summary", { hasText: q })).toHaveCount(1);
  await faqMatchesPage(page);
});

test("team name generator: original names, the blocklist, a badge as PNG and SVG, and Create this team", async ({ page }) => {
  await page.goto("/tools/team-name-generator/");
  await seoBasics(page, "/tools/team-name-generator/", /Team name generator for Free Fire guilds, BGMI teams and clans/);
  await faqMatchesPage(page);
  const names = page.getByTestId("tn-pick");
  await expect(names).toHaveCount(8);
  const second = (await names.nth(1).innerText()).trim();
  await names.nth(1).click();
  await expect(page.getByTestId("tn-name")).toHaveText(second);
  await expect(page.getByTestId("tn-badge")).toBeVisible();
  await page.getByRole("button", { name: "Indian words" }).click();
  await expect(names).toHaveCount(8);
  const before = await names.allInnerTexts();
  await page.getByRole("button", { name: "More names" }).click();
  await expect.poll(async () => (await names.allInnerTexts()).join()).not.toBe(before.join());
  // Your own name is checked.
  await page.getByLabel("I have my own name: check it and use it").check();
  const own = page.getByLabel("Your team name");
  await own.fill("Team Liquid");
  await expect(page.locator("#tn-own-err")).toContainText("existing esports organisation");
  await own.fill("BGMI Kings");
  await expect(page.locator("#tn-own-err")).toContainText("name of a game");
  await own.fill("Monsoon Cobras");
  await expect(page.getByText("That name is fine to use.")).toBeVisible();
  await expect(page.getByTestId("tn-name")).toHaveText("Monsoon Cobras");
  await page.getByRole("button", { name: "Hexagon" }).click();
  await page.getByRole("group", { name: "Main colour" }).getByRole("button", { name: "Violet" }).click();
  const [png] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download PNG" }).click()]);
  expect(png.suggestedFilename()).toBe("monsoon-cobras-badge.png");
  expect([...(await head(png, 8))]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const [svg] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download SVG" }).click()]);
  expect(svg.suggestedFilename()).toBe("monsoon-cobras-badge.svg");
  const svgText = fs.readFileSync((await svg.path())!, "utf8");
  expect(svgText).toContain(">MC</text>");
  expect(svgText).toContain("#A855F7");
  await expect(page.getByRole("link", { name: "Create this team" })).toHaveAttribute("href", "/signup/");
});

test("team name generator: game presets, a Copy button per name, and stylish versions that keep the plain name", async ({ page, context, browserName }) => {
  if (browserName === "chromium") await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/tools/team-name-generator/");
  const names = page.getByTestId("tn-pick");
  await expect(names).toHaveCount(8);
  await expect(page.getByTestId("tn-stylish")).toHaveCount(0); // off by default on this page
  await page.getByRole("group", { name: "Game" }).getByRole("button", { name: "Clan" }).click();
  for (const n of await names.allInnerTexts()) expect(n.trim()).toMatch(/^The |Clan$|^Order of the /);
  await page.getByRole("group", { name: "Game" }).getByRole("button", { name: "BGMI team" }).click();
  await expect(names).toHaveCount(8);
  const first = (await names.first().innerText()).trim();
  await page.getByRole("button", { name: `Copy ${first}`, exact: true }).click();
  await expect(page.getByText(`Copied: ${first}`)).toBeVisible();
  await page.getByLabel("Show stylish versions (fancy letters and symbols)").check();
  await expect(page.getByTestId("tn-stylish")).toHaveCount(8);
  await expect(page.getByTestId("tn-style-note")).toContainText("Check it fits in the game");
  await page.getByRole("group", { name: "Letters" }).getByRole("button", { name: "Small capitals" }).click();
  await page.getByRole("group", { name: "Symbols" }).getByRole("button", { name: "Stars ★" }).click();
  const styled = (await page.getByTestId("tn-stylish-text").first().innerText()).trim();
  expect(styled.startsWith("★") && styled.endsWith("★")).toBe(true);
  expect(styled).not.toMatch(/[A-Z]/); // small capitals replace the letters
  await expect(names.first()).toHaveText(first); // the plain name stays next to it
  await page.getByRole("button", { name: `Copy the stylish version of ${first}` }).click();
  await expect(page.getByText(`Copied: ${styled}`)).toBeVisible();
  if (browserName === "chromium") expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(styled);
});

test("Free Fire guild name page: its own indexable page, the guild preset and stylish versions on, and its own questions", async ({ page }) => {
  await page.goto("/tools/free-fire-guild-name/");
  await seoBasics(page, "/tools/free-fire-guild-name/", /Free Fire guild name generator/);
  await faqMatchesPage(page);
  await expect(page.getByRole("group", { name: "Game" }).getByRole("button", { name: "Free Fire guild" })).toHaveAttribute("aria-pressed", "true");
  const names = page.getByTestId("tn-pick");
  await expect(names).toHaveCount(8);
  for (const n of await names.allInnerTexts()) expect([...n.trim()].length).toBeLessThanOrEqual(14);
  await expect(page.getByTestId("tn-stylish")).toHaveCount(8);
  await expect(page.getByTestId("tn-stylish").first()).toContainText("characters");
  await expect(page.getByRole("heading", { name: "Will a stylish guild name fit in Free Fire?" })).toBeVisible();
  // No game limit is claimed anywhere on the page.
  const text = await page.locator("main").innerText();
  expect(text).not.toMatch(/(limit|maximum|up to) (is |of )?\d+ characters/i);
  await expect(page.getByRole("link", { name: "esports team names guide" })).toHaveAttribute("href", "/guides/esports-team-names-ideas/");
  await expect(page.locator("section[aria-labelledby=related]").getByRole("link", { name: /Team name generator/ })).toHaveAttribute("href", "/tools/team-name-generator/");
});

test("slot and prize split: slots add up, a prize pool figure splits by percent and by rule, CSV and Share result", async ({ page }) => {
  await page.goto("/tools/prize-split/");
  await seoBasics(page, "/tools/prize-split/", /Slot and prize split calculator/);
  const slots = page.getByTestId("ps-slot");
  await expect(slots).toHaveText(["4", "3", "3", "3", "3"]);
  await expect(page.getByTestId("ps-slot-total")).toHaveText("16");
  await page.getByLabel("Number of groups or lobbies").fill("4");
  await expect(slots).toHaveText(["4", "4", "4", "4"]);
  await page.getByRole("button", { name: "By group size" }).click();
  await page.getByLabel("Teams in group A").fill("20");
  await expect(page.getByTestId("ps-slot-total")).toHaveText("16");
  const shares = page.getByTestId("ps-share");
  await expect(shares).toHaveText(["5,000", "3,000", "2,000"]);
  await page.getByLabel("3rd place (%)").fill("10");
  await expect(page.getByRole("alert").filter({ hasText: "add up to 90" })).toBeVisible();
  await page.getByLabel("Places that get a share").fill("4");
  await page.getByRole("button", { name: "Even steps" }).click();
  await expect(shares).toHaveText(["4,000", "3,000", "2,000", "1,000"]);
  await page.getByLabel("Figure to split").fill("1000");
  await page.getByRole("button", { name: "Equal shares" }).click();
  await page.getByLabel("Places that get a share").fill("3");
  await page.getByLabel("Round each share to").selectOption("10");
  await expect(shares).toHaveText(["340", "330", "330"]);
  await expect(page.getByTestId("ps-pool-total")).toHaveText("1,000");
  const [csv] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download split (CSV)" }).click()]);
  expect(csv.suggestedFilename()).toBe("pool-split.csv");
  expect(fs.readFileSync((await csv.path())!, "utf8")).toContain('"1st","33.333333","340"');
  await expect(page.getByTestId("share-result")).toHaveCount(2);
  await expect(shareButton(page)).toBeEnabled();
  // No currency and no entry-fee wording anywhere on the page.
  const text = (await page.locator("main").innerText()).toLowerCase();
  for (const bad of ["₹", "entry fee", "pay now", "wallet"]) expect(text).not.toContain(bad);
});

test("rulebook generator: fields fill the template, the text is editable, and the PDF downloads", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/tools/rulebook/");
  await seoBasics(page, "/tools/rulebook/", /Tournament rulebook generator/);
  const text = page.getByLabel("Your rulebook (edit freely)");
  await expect(text).toHaveValue(/This rulebook is a template made with a free tool\. It is not the official rules/);
  await expect(text).toHaveValue(/# Format: battle royale points/);
  await page.getByLabel("Event name").fill("Spring Cup");
  await page.getByLabel("Organiser").fill("Campus Esports Club");
  await expect(text).toHaveValue(/^# Spring Cup: rulebook/);
  await expect(text).toHaveValue(/Organiser: Campus Esports Club/);
  await page.getByLabel("Game", { exact: true }).selectOption("valorant");
  await expect(text).toHaveValue(/# Format: best-of maps/);
  await page.getByLabel("Format", { exact: true }).selectOption("double");
  await expect(text).toHaveValue(/# Format: double elimination/);
  await expect(page.getByText(/items are still to fill in/)).toBeVisible();
  await text.fill("# Spring Cup: rulebook\nOur own rules.\n# Check-in\n- Be on time.");
  await expect(page.getByText("You have edited the text, so the form above no longer changes it.")).toBeVisible();
  await expect(page.getByText("No [brackets] left to fill.")).toBeVisible();
  const [pdf] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download PDF" }).click()]);
  expect(pdf.suggestedFilename()).toBe("spring-cup-rulebook.pdf");
  expect((await head(pdf, 5)).toString()).toBe("%PDF-");
  await page.getByRole("button", { name: "Rebuild from the form" }).click();
  await expect(text).toHaveValue(/# Format: double elimination/);
});

test("schedule maker: a bracket placed day by day in dependency order, CSV and Share result; the one-day mode still works", async ({ page }) => {
  await page.goto("/tools/schedule/");
  await expect(page.getByText(/5 rounds/)).toBeVisible(); // the original one-day mode is the default
  await expect(shareButton(page)).toBeEnabled();
  await page.getByRole("button", { name: "From a bracket, day by day" }).click();
  const summary = page.getByTestId("dp-summary");
  await expect(summary).toContainText("15 of 15 matches placed"); // 16 teams, single elimination
  const table = page.getByRole("region", { name: "Day-wise schedule table" });
  await expect(table).toContainText("Day 1");
  await expect(table).toContainText("Seed 1 vs Seed 16");
  await expect(table).toContainText("Winner of M1 vs Winner of M2");
  // The final starts after both semi-finals have ended.
  const rows = await table.locator("tbody tr").allInnerTexts();
  const startOf = (stage: string) => rows.filter((r) => r.includes(stage)).map((r) => r.trim().slice(0, 5));
  const semisEnd = rows.filter((r) => r.includes("Semi-finals")).map((r) => r.trim().split(/\s+/)[1]!);
  expect(startOf("Final").length).toBe(1);
  for (const end of semisEnd) expect(startOf("Final")[0]! > end).toBe(true);
  await page.getByLabel("Matches", { exact: true }).selectOption("double");
  await page.getByLabel("Number of teams").fill("8");
  await expect(summary).toContainText("15 of 15 matches placed"); // 2n - 2 = 14 plus the optional reset
  await expect(table).toContainText("Grand final reset (only if needed)");
  await page.getByLabel("Number of days").fill("1");
  await page.getByLabel("Ends by").fill("12:00");
  await expect(page.getByRole("alert").filter({ hasText: "do not fit in the days given" })).toBeVisible();
  await page.getByLabel("Ends by").fill("20:00");
  const [csv] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download (CSV)" }).click()]);
  expect(csv.suggestedFilename()).toBe("day-wise-schedule.csv");
  expect(fs.readFileSync((await csv.path())!, "utf8").split("\r\n")[0]).toBe('"Day","Start","End","Station","Match","Stage","Teams"');
  await expect(shareButton(page)).toBeEnabled();
  await page.getByRole("button", { name: "One day, by number of matches" }).click();
  await expect(page.getByText(/5 rounds/)).toBeVisible();
});

test("the new tools are listed on the tools page, in the sitemap and in llms.txt", async ({ page, request }) => {
  await page.goto("/tools/");
  for (const [name, href] of [["convert sensitivity or work out eDPI", "/tools/sensitivity-converter/"], ["name a team", "/tools/team-name-generator/"], ["name a Free Fire guild", "/tools/free-fire-guild-name/"], ["split slots or a prize pool", "/tools/prize-split/"], ["write the rules", "/tools/rulebook/"]]) {
    await expect(page.getByRole("link", { name: new RegExp(name, "i") })).toHaveAttribute("href", href);
  }
  const sitemap = await (await request.get("/sitemap.xml")).text();
  const llms = await (await request.get("/llms.txt")).text();
  for (const p of ["sensitivity-converter", "team-name-generator", "free-fire-guild-name", "prize-split", "rulebook"]) {
    expect(sitemap).toContain(`/tools/${p}/`);
    expect(llms).toContain(`/tools/${p}/`);
  }
});

test("the day-wise schedule and the filled-in tools have no serious accessibility problems", async ({ page }) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  const check = async () => {
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    const bad = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
  };
  await page.goto("/tools/schedule/");
  await page.getByRole("button", { name: "From a bracket, day by day" }).click();
  await expect(page.getByTestId("dp-summary")).toBeVisible();
  await check();
  await page.goto("/tools/team-name-generator/");
  await page.getByLabel("I have my own name: check it and use it").check();
  await page.getByLabel("Your team name").fill("Fnatic");
  await expect(page.locator("#tn-own-err")).toBeVisible();
  await check();
});
