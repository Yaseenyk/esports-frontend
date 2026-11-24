import { expect, test, type Page } from "@playwright/test";

// Trust signals on every points table page, desktop and phone: who runs the site, the scoring rules, the "Safe to use" box, the trust FAQ,
// one FAQPage that matches the visible FAQ and a Person linked from the SoftwareApplication. Also: the text is in the HTML before any script
// runs, and the page analytics cannot read team names from the calculator.

const PAGES = [
  { path: "/points-table/free-fire/", name: "Free Fire points table", rule: "1st 10, 2nd 6, 3rd 5", team: "Alpha" },
  { path: "/points-table/bgmi/", name: "BGMI points table", rule: "1st 10, 2nd 6, 3rd 5", team: "Alpha" },
  { path: "/points-table/cod-mobile/", name: "COD Mobile points table", rule: "1st 15, 2nd 12, 3rd 10", team: "Night Ravens" },
  { path: "/points-table/valorant/", name: "Valorant points table", rule: "3 for a match win, 0 for a loss", team: "Night Owls" },
  { path: "/tools/points-table/", name: "points table maker", rule: "1st 10, 2nd 6, 3rd 5", team: "Alpha" },
] as const;
const PERSON_ID = "https://yk.streamerosai.com/#person";

type Node = Record<string, unknown> & { "@type"?: string };
async function jsonLd(page: Page): Promise<Node[]> {
  return (await page.locator('script[type="application/ld+json"]').allInnerTexts()).map((t) => JSON.parse(t) as Node | Node[]).flat();
}

async function checkSchema(page: Page) {
  const ld = await jsonLd(page);
  const faqs = ld.filter((n) => n["@type"] === "FAQPage");
  expect(faqs).toHaveLength(1);
  const items = page.locator("section[aria-labelledby=faq] details");
  const q = faqs[0]!.mainEntity as { name: string; acceptedAnswer: { text: string } }[];
  await expect(items).toHaveCount(q.length);
  for (let i = 0; i < q.length; i++) {
    await expect(items.nth(i).locator("summary")).toContainText(q[i]!.name);
    expect((await items.nth(i).locator("summary + div").textContent())?.trim()).toBe(q[i]!.acceptedAnswer.text);
  }
  const person = ld.find((n) => n["@type"] === "Person");
  expect(person?.["@id"]).toBe(PERSON_ID);
  expect(person?.sameAs).toEqual(["https://yk.streamerosai.com/", "https://www.linkedin.com/in/yaseen-yk", "https://github.com/Yaseenyk"]);
  const app = ld.find((n) => n["@type"] === "SoftwareApplication")!;
  expect(app.author).toEqual({ "@id": PERSON_ID });
  expect(app.creator).toEqual({ "@id": PERSON_ID });
  expect(app.offers).toMatchObject({ price: "0", priceCurrency: "INR" });
  expect(JSON.stringify(ld)).not.toMatch(/aggregateRating|"review"/);
}

for (const p of PAGES) {
  test(`${p.path}: who runs it, the scoring rules, the Safe to use box and the trust FAQ`, async ({ page }) => {
    await page.goto(p.path);
    const who = page.getByTestId("who-runs");
    await expect(who).toHaveText("Built and run by Yaseen Khatib, a developer in Hyderabad (LinkedIn).");
    await expect(who.getByRole("link", { name: "Yaseen Khatib" })).toHaveAttribute("href", "https://yk.streamerosai.com/");
    await expect(who.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", "https://www.linkedin.com/in/yaseen-yk");
    const rules = page.getByTestId("scoring-rules");
    await expect(rules.getByRole("heading", { level: 2, name: "How this calculator scores" })).toBeVisible();
    await expect(rules).toContainText(p.rule);
    const safe = page.getByTestId("safe-to-use");
    await expect(safe.getByRole("heading", { name: "Safe to use" })).toBeVisible();
    for (const t of ["No sign-in.", "Nothing to install.", "No payment.", "Your team names and scores stay in your browser.", "Never your team names or scores."]) await expect(safe).toContainText(t);
    await expect(safe.getByRole("link", { name: "Privacy policy" })).toHaveAttribute("href", "/privacy/#analytics");
    const faq = page.locator("section[aria-labelledby=faq]");
    for (const q of [`Is the ${p.name} safe to use?`, `Do I need an account to use the ${p.name}?`, `Is the ${p.name} free?`, `Which points system does the ${p.name} use?`]) await expect(faq.getByText(q, { exact: true })).toHaveCount(1);
    await checkSchema(page);
    // The phone layout keeps the box inside the screen.
    const box = await safe.boundingBox(), vw = page.viewportSize()!.width;
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(vw + 1);
  });

  test(`${p.path}: the page analytics cannot read team names from the calculator`, async ({ page }) => {
    await page.goto(p.path);
    const tool = page.locator('[data-clarity-mask="true"]').first();
    await expect(tool).toContainText(p.team); // the tool has loaded its example teams, inside the Clarity mask
    // The Pulse counter labels a clicked control by data-pulse-label, aria-label, title, then its text (analytics-dashboard/pulse/src/tracker.js).
    const leaks = await tool.evaluate((root, team) => {
      const out: string[] = [];
      root.querySelectorAll("a[href],button,summary,[role=button],[role=tab],[role=link],input,textarea,label,select").forEach((el) => {
        const a = el.getAttribute("data-pulse-label") || el.getAttribute("aria-label") || el.getAttribute("title");
        const t = a ?? (el.tagName === "INPUT" || el.tagName === "TEXTAREA" ? "" : (el as HTMLElement).innerText || "");
        if (t.includes(team)) out.push(`${el.tagName}: ${t.slice(0, 60)}`);
      });
      return out;
    }, p.team);
    expect(leaks).toEqual([]);
  });
}

test("Portuguese Free Fire page: the same blocks in Portuguese, one FAQPage and the Person", async ({ page }) => {
  await page.goto("/pt-br/points-table/free-fire/");
  const who = page.getByTestId("who-runs");
  await expect(who).toHaveText("Criado e mantido por Yaseen Khatib, desenvolvedor em Hyderabad, na Índia (LinkedIn).");
  await expect(who.getByRole("link", { name: "Yaseen Khatib" })).toHaveAttribute("href", "https://yk.streamerosai.com/");
  await expect(page.getByTestId("scoring-rules")).toContainText("1º 10, 2º 6, 3º 5");
  await expect(page.getByTestId("safe-to-use").getByRole("heading", { name: "Seguro para usar" })).toBeVisible();
  await expect(page.getByText("A tabela de pontos de Free Fire é segura?", { exact: true })).toHaveCount(1);
  await checkSchema(page);
});

test("the trust text is in the HTML before any script runs", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  for (const p of PAGES) {
    await page.goto(p.path);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByTestId("scoring-rules")).toContainText(p.rule);
    await expect(page.getByTestId("safe-to-use")).toContainText("never sends them to our server");
    await expect(page.getByTestId("who-runs")).toContainText("Yaseen Khatib");
    await expect(page.getByText(`Is the ${p.name} safe to use?`, { exact: true })).toHaveCount(1);
  }
  await ctx.close();
});
