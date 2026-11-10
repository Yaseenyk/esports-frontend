const openMenu = async (page: import("@playwright/test").Page) => { const t = page.getByRole("button", { name: /Save, open or share/ }); if (await t.isVisible() && (await t.getAttribute("aria-expanded")) !== "true") await t.click(); }; // phones keep Save / Open / Online in a menu
// The online features with the server mocked, so they run anywhere and never touch real data.
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const API = "**/esports-api.yaseenyk.workers.dev/**";
const json = (body: unknown, status = 200) => ({ status, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(body) });
const preflight = (page: Page) => page.route(API, (r) => (r.request().method() === "OPTIONS" ? r.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" } }) : r.fallback()));

test("the Online panel asks for sign-in and explains a wrong password plainly", async ({ page }) => {
  await preflight(page);
  await page.route("**/auth/login", (r) => r.fulfill(json({ error: "Invalid email or password" }, 401)));
  await page.goto("/tools/id-cards/");
  await openMenu(page);
  await page.getByRole("button", { name: /^Online/ }).click();
  const dlg = page.getByRole("dialog", { name: "Cloud" });
  await expect(dlg.getByText(/Optional: sign in/)).toBeVisible();
  await dlg.getByLabel("Email").fill("a@example.com");
  await dlg.getByLabel("Password").fill("wrong-password");
  await dlg.getByRole("button", { name: "Sign in", exact: true }).last().click();
  await expect(dlg.getByRole("alert")).toContainText(/sign-in has expired or the details are wrong/i);
  const bad = (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).exclude(".idcard-box").analyze()).violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(bad.map((v) => v.id)).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(dlg).toHaveCount(0);
});

test("a signed-in organiser sees their events and the sign-out button", async ({ page }) => {
  await preflight(page);
  await page.addInitScript(() => localStorage.setItem("eh-session-v1", JSON.stringify({ token: "t", user: { id: "u", email: "o@example.com", name: "Olivia" } })));
  await page.route("**/events", (r) => r.fulfill(json([{ id: "e1", key: "cup", name: "Spring Cup", game: "BGMI", organiser: "", date: "2026-12-01", venue: "", emergency: "", rules: "", settings: {}, updatedAt: "" }])));
  await page.goto("/tools/id-cards/");
  await openMenu(page);
  await page.getByRole("button", { name: /^Online/ }).click();
  const dlg = page.getByRole("dialog", { name: "Cloud" });
  await expect(dlg.getByText("Olivia")).toBeVisible();
  await expect(dlg.getByText("Spring Cup")).toBeVisible();
  await dlg.getByRole("button", { name: "Sign out" }).click();
  await expect(dlg.getByText(/Optional: sign in/)).toBeVisible();
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
