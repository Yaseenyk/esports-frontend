import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = ["/", "/games/", "/events/", "/communities/", "/arcade/", "/tools/", "/tools/id-cards/", "/tools/check-in/", "/tools/brackets/"];

for (const path of PAGES) {
  test(`${path} has no serious accessibility problems`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).exclude(".idcard-box").analyze();
    const bad = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
  });
}

for (const stepName of ["People", "Design", "Print"]) {
  test(`ID card maker, ${stepName} step, has no serious accessibility problems`, async ({ page }) => {
    await page.goto("/tools/id-cards/");
    await page.locator("ol button").filter({ hasText: stepName }).first().click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(600);
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).exclude(".idcard-box").analyze();
    const bad = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
  });
}
