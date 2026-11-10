const openMenu = async (page: import("@playwright/test").Page) => { const t = page.getByRole("button", { name: /Save, open or share/ }); if (await t.isVisible() && (await t.getAttribute("aria-expanded")) !== "true") await t.click(); }; // phones keep Save / Open / Online in a menu
// The online features with the server mocked, so they run anywhere and never touch real data.
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { json, preflight, signedIn } from "./helpers";

test("the sign-in page explains a wrong password plainly and passes the accessibility check", async ({ page }) => {
  await preflight(page);
  await page.route("**/auth/login", (r) => r.fulfill(json({ error: "Invalid email or password" }, 401)));
  await page.goto("/login/");
  await page.getByLabel("Email").fill("a@example.com");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).last().click();
  await expect(page.getByRole("alert").filter({ hasText: /sign-in has expired or the details are wrong/i })).toBeVisible();
  const bad = (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(bad.map((v) => v.id)).toEqual([]);
});

test("a signed-in organiser sees their events and the sign-out button", async ({ page }) => {
  await preflight(page);
  await page.addInitScript(() => localStorage.setItem("eh-session-v1", JSON.stringify({ token: "t", user: { id: "u", email: "o@example.com", name: "Olivia" } })));
  await page.route("**/events", (r) => r.fulfill(json([{ id: "e1", key: "cup", name: "Spring Cup", game: "BGMI", organiser: "", date: "2026-12-01", venue: "", emergency: "", rules: "", settings: {}, updatedAt: "" }])));
  await page.goto("/app/id-cards/");
  await openMenu(page);
  await page.getByRole("button", { name: /^Online/ }).click();
  const dlg = page.getByRole("dialog", { name: "Cloud" });
  await expect(dlg.getByText("Olivia")).toBeVisible();
  await expect(dlg.getByText("Spring Cup")).toBeVisible();
  await dlg.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login\//); // signing out leaves the app
});

test("a pass link that is switched off says so instead of showing an error page", async ({ page }) => {
  await preflight(page);
  await page.route("**/public/pass/**", (r) => r.fulfill(json({ error: "Not found" }, 404)));
  await page.goto("/pass/?t=gone");
  await expect(page.getByRole("alert").filter({ hasText: /not active any more/i })).toBeVisible();
});

test("a pass link without a token explains what to do", async ({ page }) => {
  await page.goto("/pass/");
  await expect(page.getByRole("alert").filter({ hasText: /incomplete/i })).toBeVisible();
});

test("an invite page shows the team and sends only name, role and photo", async ({ page }) => {
  await preflight(page);
  await page.route("**/public/invite/tok", (r) => r.fulfill(json({ event: { name: "Spring Cup", date: "2026-12-01" }, team: { name: "Konkan Kings" } })));
  let sent: Record<string, unknown> | null = null;
  await page.route("**/public/invite/tok/submit", async (r) => { sent = r.request().postDataJSON(); await r.fulfill(json({ ok: true }, 201)); });
  await page.goto("/join/?t=tok");
  await expect(page.getByRole("heading", { name: "Join Konkan Kings" })).toBeVisible();
  await page.getByLabel(/Your name/).fill("Test Player");
  await page.getByRole("button", { name: "Send to the organiser" }).click();
  await expect(page.getByText("Sent. Thank you.")).toBeVisible();
  expect(Object.keys(sent ?? {}).sort()).toEqual(["minor", "name", "role"]);
});

test("the invite page can be read in Hindi and Marathi, and the choice is remembered", async ({ page }) => {
  await preflight(page);
  await page.route("**/public/invite/tok", (r) => r.fulfill(json({ event: { name: "Spring Cup", date: "2026-12-01" }, team: { name: "Konkan Kings" } })));
  await page.goto("/join/?t=tok");
  await expect(page.getByRole("heading", { name: "Join Konkan Kings" })).toBeVisible();
  await page.getByRole("button", { name: "हिन्दी" }).click();
  await expect(page.getByRole("heading", { name: "Konkan Kings में शामिल हों" })).toBeVisible();
  await expect(page.getByRole("button", { name: "आयोजक को भेजें" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Konkan Kings में शामिल हों" })).toBeVisible();
  await page.getByRole("button", { name: "मराठी" }).click();
  await expect(page.getByRole("button", { name: "आयोजकांना पाठवा" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "mr");
});

test("the ID card steps speak the chosen language", async ({ page }) => {
  await signedIn(page);
  await page.goto("/app/id-cards/");
  await page.getByRole("button", { name: "हिन्दी" }).click();
  await expect(page.getByText(/चरण 1 \/ 4/)).toBeVisible();
  await expect(page.getByRole("button", { name: /आगे: लोग/ })).toBeVisible();
});

test("the Account tab changes a password and explains a wrong current one", async ({ page }) => {
  await preflight(page);
  await page.addInitScript(() => localStorage.setItem("eh-session-v1", JSON.stringify({ token: "t", user: { id: "u", email: "o@example.com", name: "Olivia" } })));
  await page.route("**/events", (r) => r.fulfill(json([])));
  let n = 0;
  await page.route("**/auth/change-password", (r) => r.fulfill(n++ === 0 ? json({ error: "Current password is wrong" }, 401) : json({ ok: true })));
  await page.goto("/app/id-cards/");
  await openMenu(page);
  await page.getByRole("button", { name: /^Online/ }).click();
  const dlg = page.getByRole("dialog", { name: "Cloud" });
  await dlg.getByRole("tab", { name: "Account" }).click();
  await dlg.getByLabel("Current password").first().fill("old-password");
  await dlg.getByLabel("New password").fill("a-brand-new-pass");
  await dlg.getByRole("button", { name: "Change password" }).click();
  await expect(dlg.getByRole("alert")).toContainText(/current password is wrong/i);
  await dlg.getByRole("button", { name: "Change password" }).click();
  await expect(dlg.getByText("Password changed.")).toBeVisible();
});
