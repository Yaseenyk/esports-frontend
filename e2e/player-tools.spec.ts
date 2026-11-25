import { expect, test, type Page } from "@playwright/test";

// The player tools added on 25 Nov 2026 (name styles, reaction time, tap speed, Valorant crosshair) and their pt-BR pages.
// Each: real content in the static HTML, a working tool, results kept on the device only, and no serious accessibility problems.
// Runs on desktop and phone.

async function seo(page: Page, path: string, h1: RegExp, { index = true } = {}) {
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(h1);
  expect(await page.locator('meta[name="robots"][content*="noindex"]').count()).toBe(index ? 0 : 1);
  await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", new RegExp(`${path}$`));
  expect((await page.title()).length).toBeLessThanOrEqual(60);
  const blocks = (await page.locator('script[type="application/ld+json"]').allInnerTexts()).map((t) => JSON.parse(t)).flat();
  const types = blocks.map((x: { "@type"?: string }) => x["@type"]);
  for (const t of ["BreadcrumbList", "FAQPage", "SoftwareApplication"]) expect(types).toContain(t);
  const faq = blocks.find((x: { "@type"?: string }) => x["@type"] === "FAQPage");
  const visible = ((await page.locator("section[aria-labelledby=faq]").textContent()) ?? "").replace(/\s+/g, " ");
  for (const q of faq.mainEntity as { name: string; acceptedAnswer: { text: string } }[]) {
    expect(visible).toContain(q.name);
    expect(visible).toContain(q.acceptedAnswer.text.replace(/\s+/g, " "));
  }
}

async function axe(page: Page) {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  const bad = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
}

test.beforeEach(async ({ context }) => { await context.grantPermissions(["clipboard-read", "clipboard-write"]); });

test("Free Fire name style: static ready names and symbols, the generator, copy, and no hreflang to the unreviewed pt page", async ({ page, request }) => {
  const html = await (await request.get("/tools/free-fire-name-style/")).text();
  // The lists and FAQ are in the static HTML, before any script runs.
  expect((html.match(/data-copy=/g) ?? []).length).toBeGreaterThanOrEqual(120);
  expect(html).toContain("made by this tool from our own word lists");
  expect(html).not.toContain('hreflang="pt-BR"');
  await page.goto("/tools/free-fire-name-style/");
  await seo(page, "/tools/free-fire-name-style/", /Free Fire name style generator: stylish names you can copy/);
  await expect(page.getByTestId("ready-names").locator("li")).toHaveCount(60);
  const name = page.getByLabel("Your name");
  await name.fill("Arjun");
  const rows = page.getByTestId("ns-list").locator("li");
  await expect(rows).toHaveCount(11);
  await expect(rows.first()).toContainText("꧁Arjun꧂");
  await expect(page.getByTestId("ns-text").nth(4)).toHaveText("꧁𝐀𝐫𝐣𝐮𝐧꧂"); // bold
  await expect(rows.nth(4)).toContainText("Newer fonts only");
  await page.getByRole("group", { name: "Symbols around the name" }).getByRole("button", { name: "None" }).click();
  await expect(rows.first()).toContainText("Arjun");
  await rows.first().getByRole("button").click();
  await expect(page.getByText("Copied: Arjun").first()).toBeVisible();
  await name.fill("");
  await expect(page.getByText("Type a name to see the styles.")).toBeVisible();
  // A ready-made name copies from the static list.
  await page.getByTestId("ready-names").locator("li").first().getByRole("button").first().click();
  await expect(page.getByText(/^Copied: /).last()).toBeVisible();
  await page.getByTestId("symbols").getByRole("button").first().click();
  await expect(page.getByText("Copied: ꧁").last()).toBeVisible();
  await expect(page.locator('a[href^="https://ffsuporte.garena.com/"]').first()).toBeVisible();
  await axe(page);
});

test("BGMI name style: clan tag looks and the rename source", async ({ page }) => {
  await page.goto("/tools/bgmi-name-style/");
  await seo(page, "/tools/bgmi-name-style/", /BGMI name style generator: stylish names and symbols/);
  await page.getByLabel("Your name").fill("Kabir");
  await page.getByLabel("Add a clan tag before my name").check();
  await page.getByLabel("Clan tag", { exact: true }).fill("IND");
  await page.getByRole("button", { name: "『TAG』Name" }).click();
  await expect(page.getByTestId("ns-list").locator("li").first()).toContainText("『IND』꧁Kabir꧂");
  await page.getByLabel("Your name").fill("bitch");
  await expect(page.getByText("That name contains an abusive or hateful word").first()).toBeVisible();
  await expect(page.locator('a[href^="https://help.battlegroundsmobileindia.com/"]').first()).toBeVisible();
  await axe(page);
});

test("reaction time test: early taps do not count, five tries give an average kept on this device", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/tools/reaction-time-test/");
  await seo(page, "/tools/reaction-time-test/", /Reaction time test: how fast are your reflexes\?/);
  const pad = page.getByTestId("reaction-pad");
  await pad.click();
  await expect(pad).toHaveAttribute("data-phase", "wait");
  await pad.click();
  await expect(pad).toHaveAttribute("data-phase", "early");
  for (let i = 0; i < 5; i++) {
    await pad.click(); // arm
    await expect(pad).toHaveAttribute("data-phase", "go", { timeout: 6000 });
    await page.waitForTimeout(150); // a person needs time to react; under 100 ms counts as a guess
    await pad.click();
    await expect(pad).toHaveAttribute("data-phase", i < 4 ? "between" : "done");
  }
  await expect(page.getByTestId("reaction-avg")).toContainText(/\d+ ms/);
  await expect(page.getByTestId("share-result").getByRole("button", { name: "Share result" })).toBeEnabled();
  await page.reload();
  await expect(page.getByTestId("reaction-best")).toContainText(/\d+ ms/);
  await page.getByRole("button", { name: "Forget my results on this device" }).click();
  await expect(page.getByTestId("reaction-best")).toHaveCount(0);
  await expect(page.locator('a[href="https://humanbenchmark.com/tests/reactiontime/statistics"]').first()).toBeVisible();
  await axe(page);
});

test("tap speed test: taps in 5 seconds, taps per second, a best kept on this device", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/tools/tap-speed-test/");
  await seo(page, "/tools/tap-speed-test/", /Tap speed test: taps per second \(CPS on mobile\)/);
  await page.getByRole("button", { name: "5 seconds" }).click();
  const pad = page.getByTestId("tap-pad");
  for (let i = 0; i < 20; i++) await pad.click({ delay: 5 });
  await expect(page.getByTestId("tap-count")).toHaveText("20");
  await expect(pad).toHaveAttribute("data-phase", "done", { timeout: 8000 });
  await expect(page.getByTestId("tap-rate")).toHaveText("4");
  await expect(page.getByText("New best on this device for 5 seconds.")).toBeVisible();
  await expect(page.getByTestId("share-result").getByRole("button", { name: "Share result" })).toBeEnabled();
  await page.reload();
  await expect(page.locator("body")).toContainText("5 s: 20 taps");
  await axe(page);
});

test("Valorant crosshair: paste, preview, edit, copy, favourites, share link and a canonical without the code", async ({ page }) => {
  await page.goto("/tools/valorant-crosshair/");
  await seo(page, "/tools/valorant-crosshair/", /Valorant crosshair code generator and preview/);
  const code = page.getByTestId("xh-code");
  await expect(code).toHaveValue("0");
  await page.getByLabel("Paste a crosshair code").fill("0;P;c;5;h;0;0l;4;0o;2;0a;1;0f;0;1b;0");
  await expect(code).toHaveValue("0;P;c;5;h;0;0l;4;0o;2;0a;1;1b;0;0f;0");
  await expect(page.getByTestId("xh-kept")).toBeVisible();
  await page.getByRole("group", { name: "Crosshair colour" }).getByRole("button", { name: "Red" }).click();
  await expect(code).toHaveValue(/^0;P;c;7;/);
  await page.getByLabel("Centre dot", { exact: true }).check();
  await expect(code).toHaveValue(/;d;1/);
  await expect(page.getByTestId("xh-preview").locator("rect")).not.toHaveCount(1);
  await page.getByRole("button", { name: "Copy code" }).click();
  await expect(page.getByText(/^Code copied/)).toBeVisible();
  await page.getByLabel("Name for this crosshair").fill("Red dot");
  await page.getByRole("button", { name: "Save to favourites" }).click();
  await expect(page.getByTestId("xh-fav-list")).toContainText("Red dot");
  await page.reload();
  await expect(page.getByTestId("xh-fav-list")).toContainText("Red dot");
  await page.getByLabel("Paste a crosshair code").fill("1;P;c;5");
  await expect(page.getByText("That does not look like a Valorant crosshair code").first()).toBeVisible();
  await page.goto("/tools/valorant-crosshair/?c=0%3BP%3Bc%3B1%3Bh%3B0");
  await expect(code).toHaveValue("0;P;c;1;h;0");
  await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", /\/tools\/valorant-crosshair\/$/);
  await axe(page);
});

test("pt-BR tool pages: Portuguese, noindex until reviewed, no hreflang either way, out of the sitemap", async ({ page, request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  const llms = await (await request.get("/llms.txt")).text();
  for (const p of ["free-fire-name-style", "bgmi-name-style", "reaction-time-test", "tap-speed-test", "valorant-crosshair"]) {
    expect(sitemap).toContain(`/tools/${p}/`);
    expect(llms).toContain(`/tools/${p}/`);
  }
  const pages: [string, RegExp, string][] = [
    ["/pt-br/tools/nick-free-fire/", /Gerador de nick para Free Fire com letras diferentes/, "Seu nome"],
    ["/pt-br/tools/conversor-de-sensibilidade/", /Conversor de sensibilidade para Valorant, CS2, Apex e Overwatch 2/, "Jogo de origem"],
    ["/pt-br/tools/nome-de-guilda-free-fire/", /Gerador de nome de guilda para Free Fire/, "Já tenho um nome: checar e usar"],
  ];
  for (const [path, h1, label] of pages) {
    expect(sitemap).not.toContain(path);
    await page.goto(path);
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await seo(page, path, h1, { index: false });
    await expect(page.locator("link[rel=alternate][hreflang]")).toHaveCount(0);
    await expect(page.getByLabel(label).first()).toBeVisible();
    await axe(page);
  }
  await page.getByLabel("Já tenho um nome: checar e usar").check();
  await page.getByLabel("O nome do seu time").fill("Garena Kings");
  await expect(page.getByText("O nome usa o nome de um jogo").first()).toBeVisible();
  await page.goto("/pt-br/tools/conversor-de-sensibilidade/");
  await expect(page.getByTestId("sens-answer")).toHaveText("1.27");
  for (const en of ["/tools/free-fire-name-style/", "/tools/sensitivity-converter/", "/tools/free-fire-guild-name/"]) {
    await page.goto(en);
    await expect(page.locator('link[rel=alternate][hreflang="pt-BR"]')).toHaveCount(0);
  }
});
