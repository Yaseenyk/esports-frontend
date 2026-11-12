import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { signedIn } from "./helpers";

test.setTimeout(120_000); // axe on a busy page is slow when several browsers run at once

const PAGES = ["/", "/games/", "/events/", "/communities/", "/arcade/", "/tools/", "/tools/id-cards/", "/tools/check-in/", "/tools/brackets/", "/login/", "/signup/", "/forgot-password/", "/reset-password/?t=abc", "/gate/", "/tools/points-table/", "/tools/round-robin/", "/tools/double-elimination/", "/tools/display-screen/", "/tools/registration/", "/tools/schedule/", "/tools/plan/", "/tools/poster/", "/points-table/bgmi/", "/points-table/free-fire/", "/compare/free-tournament-software-india/", "/tools/certificates/", "/guides/", "/guides/points-table/", "/guides/event-gate-checkin/", "/about/", "/contact/", "/privacy/", "/terms/", "/display/", "/manage/"];
const APP_PAGES = ["/app/", "/app/events/", "/app/check-in/", "/app/brackets/", "/app/account/"];

for (const path of PAGES) {
  test(`${path} has no serious accessibility problems`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(900); // let the page fade-in finish: contrast is measured on what is really on screen
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).exclude(".idcard-box").analyze();
    const bad = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
  });
}

for (const stepName of ["People", "Design", "Print"]) {
  test(`ID card maker, ${stepName} step, has no serious accessibility problems`, async ({ page }) => {
    await signedIn(page);
    await page.goto("/app/id-cards/");
    await page.locator("ol button").filter({ hasText: stepName }).first().click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500); // the step fades in and its chunk may still be loading when several browsers run at once
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).exclude(".idcard-box").analyze();
    const bad = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
  });
}

for (const path of APP_PAGES) {
  test(`app page ${path} has no serious accessibility problems`, async ({ page }) => {
    await signedIn(page);
    await page.goto(path);
    await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(900);
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).exclude(".idcard-box").analyze();
    const bad = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
  });
}
