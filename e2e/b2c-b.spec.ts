// Builder B (25 Nov 2026): scrim time planner, tournament alerts, LFT contacts. The API is MOCKED (route interception): nothing reaches the
// real backend. Run one project at a time:  npx playwright test e2e/b2c-b.spec.ts --project=desktop  (then --project=phone)
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { LISTING, mockV3, v3SignedIn } from "./v3-helpers";

test.setTimeout(120_000);

const axe = async (page: Page) => {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)).toBe(false);
};

const TOKEN = "T".repeat(31) + "k";
const HOUR = 3600;
const start = Math.ceil(Date.now() / 1000 / HOUR) * HOUR + 24 * HOUR;
const PLAN = { game: "bgmi", title: "Week 2 scrims", tz: "Asia/Kolkata", slotMinutes: 60, slots: [start, start + HOUR, start + 2 * HOUR], people: [{ id: "p1", name: "Asha", picks: [0, 1] }, { id: "p2", name: "Ravi", picks: [1, 2] }], counts: [1, 2, 1], expiresAt: new Date(Date.now() + 30 * 86_400_000).toISOString(), createdAt: new Date().toISOString() };

test("planner landing: indexable copy, FAQ and the create form make a plan with a share link; the token never goes into a URL", async ({ page }) => {
  const seen = await mockV3(page, { "POST /public/planner": ({ body }) => ({ status: 201, body: { token: TOKEN, captainKey: "C".repeat(32), expiresAt: PLAN.expiresAt, echo: (body as { slots?: unknown[] })?.slots?.length } }) });
  await page.goto("/tools/scrim-time-planner/");
  await expect(page.getByRole("heading", { level: 1, name: /Scrim time planner/ })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute("content", /noindex/);
  await expect(page.locator('script[type="application/ld+json"]').first()).toBeAttached();
  await expect(page.getByText("Is this like When2meet?")).toBeVisible();
  await axe(page);
  await page.getByRole("button", { name: "Make the plan and get a link" }).click();
  await expect(page.getByRole("heading", { name: "Your plan is ready" })).toBeVisible();
  await expect(page.getByText(`/squad/#t=${TOKEN}`)).toBeVisible();
  const create = seen.find((s) => s.path === "/public/planner")!;
  expect(create.search).toBe("");
  expect(JSON.parse(create.body)).toMatchObject({ game: "bgmi", tz: "Asia/Kolkata", slotMinutes: 60 });
  await axe(page);
});

test("planner landing: flag off says Not available yet", async ({ page }) => {
  await mockV3(page);
  await page.goto("/tools/scrim-time-planner/");
  await page.getByRole("button", { name: "Make the plan and get a link" }).click();
  await expect(page.getByRole("heading", { name: "Not available yet" })).toBeVisible();
});

test("shared plan: noindex, best times, tap and save, post a scrim link", async ({ page }) => {
  const seen = await mockV3(page, {
    "POST /public/planner/open": ({ body }) => ((body as { token?: string })?.token === TOKEN ? { body: PLAN } : undefined),
    "POST /public/planner/vote": ({ body }) => {
      const b = body as { name: string; picks: number[]; editKey: string };
      expect(b.editKey).toMatch(/^[A-Za-z0-9_-]{43}$/);
      return { body: { ...PLAN, people: [...PLAN.people, { id: "me", name: b.name, picks: b.picks }], counts: [1, 3, 1], mine: "me" } };
    },
  });
  await page.goto(`/squad/#t=${TOKEN}`);
  await expect(page.getByRole("heading", { level: 1, name: "Week 2 scrims" })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.getByText(/2 of 2 free \(everyone\): Asha, Ravi/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Post a scrim at this time" }).first()).toHaveAttribute("href", /^\/scrims\/new\/\?starts=.+&game=bgmi$/);
  await axe(page);
  await page.getByLabel("Your name").fill("Kiran");
  const slot = page.getByRole("button", { pressed: false }).filter({ hasText: "Tap if free" }).nth(1);
  await slot.click();
  await page.getByRole("button", { name: "Save my hours" }).click();
  await expect(page.getByText("Saved. Your squad sees your hours now.")).toBeVisible();
  expect(seen.every((s) => !s.search.includes(TOKEN) && !s.path.includes(TOKEN))).toBe(true);
  await expect(page.getByRole("button", { name: "Remove my answers" })).toBeVisible();
});

test("shared plan: a wrong or missing token is a calm page, not an error", async ({ page }) => {
  await mockV3(page);
  await page.goto(`/squad/#t=${"Z".repeat(32)}`);
  await expect(page.getByRole("heading", { level: 1, name: "This plan is gone" })).toBeVisible();
  await page.goto("/squad/");
  await expect(page.getByRole("heading", { level: 1, name: "This link is not complete" })).toBeVisible();
  await axe(page);
});

const SETTINGS = { status: "off", email: "o***@example.com", confirmedAt: null, rules: [], limits: { maxRules: 5, emailsPerDay: 1 }, mailer: true };
test("alerts settings: save rules and ask for the double opt-in email", async ({ page }) => {
  let state = { ...SETTINGS } as Record<string, unknown>;
  const seen = await v3SignedIn(page, {
    "GET /v3/me/alerts": () => ({ body: state }),
    "PUT /v3/me/alerts": ({ body }) => { state = { ...state, rules: (body as { rules: unknown[] }).rules }; return { body: state }; },
    "POST /v3/me/alerts/confirm-email": () => { state = { ...state, status: "pending" }; return { body: state }; },
  });
  await page.goto("/app/alerts/");
  await expect(page.getByRole("heading", { level: 1, name: "Tournament alerts" })).toBeVisible();
  await page.getByLabel("Game").selectOption("bgmi");
  await page.getByLabel("Where").fill("Pune");
  await axe(page);
  await page.getByRole("button", { name: "Save and confirm my email" }).click();
  await expect(page.getByText(/Check your inbox/)).toBeVisible();
  await expect(page.getByText("Waiting for you")).toBeVisible();
  const put = seen.find((s) => s.method === "PUT" && s.path === "/v3/me/alerts")!;
  expect(JSON.parse(put.body)).toEqual({ rules: [{ game: "bgmi", place: "pune", kind: "any" }] });
  const confirm = seen.find((s) => s.path === "/v3/me/alerts/confirm-email")!;
  expect(confirm.body).not.toMatch(/@/); // the address is never sent: the server uses the account's own
});

test("alerts settings: flag off is Not available yet", async ({ page }) => {
  await v3SignedIn(page);
  await page.goto("/app/alerts/");
  await expect(page.getByRole("heading", { name: "Not available yet" })).toBeVisible();
});

test("alert email links: confirm acts on open, unsubscribe needs one tap, the token leaves the address bar", async ({ page }) => {
  const seen = await mockV3(page, { "POST /public/alerts/confirm": () => ({ body: { ok: true, status: "active" } }), "POST /public/alerts/unsubscribe": () => ({ body: { ok: true, status: "stopped" } }) });
  await page.goto(`/alerts/confirm/#t=${TOKEN}`);
  await expect(page.getByText(/Alerts are on/)).toBeVisible();
  expect(page.url()).not.toContain(TOKEN);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await page.goto(`/alerts/unsubscribe/#t=${TOKEN}`);
  expect(seen.filter((s) => s.path === "/public/alerts/unsubscribe")).toHaveLength(0); // opening changes nothing
  await axe(page);
  await page.getByRole("button", { name: "Unsubscribe" }).click();
  await expect(page.getByText(/You are unsubscribed/)).toBeVisible();
  expect(JSON.parse(seen.find((s) => s.path === "/public/alerts/unsubscribe")!.body)).toEqual({ token: TOKEN });
});

test("alert email links: an unknown token says the link does not work any more", async ({ page }) => {
  await mockV3(page);
  await page.goto(`/alerts/confirm/#t=${TOKEN}`);
  await expect(page.getByRole("heading", { level: 1, name: "This link does not work any more" })).toBeVisible();
});

test("my listings: accepted requests show only the contacts the other side chose to share", async ({ page }) => {
  await v3SignedIn(page, {
    "GET /v3/me/lft": () => ({ body: { items: [{ ...LISTING, kind: "looking_for_player", teamName: "Wolves", contact: "wolves#1", status: "open", hidden: false, reportCount: 0, applications: 2 }] } }),
    "GET /v3/me/lft/applications": () => ({ body: { items: [{ id: "s1", listingId: "x", status: "accepted", kind: "looking_for_player", game: "bgmi", teamName: "Hawks", listingStatus: "open", createdAt: "2030-01-01T00:00:00.000Z", respondedAt: null, contact: "hawks#9", contacts: { discord: "hawks#9", instagram: "hawks_gg" } }] } }),
    "GET /v3/lft/a1/applications": () => ({ body: { items: [
      { id: "r1", status: "accepted", message: "Hi", createdAt: "2030-01-01T00:00:00.000Z", respondedAt: null, profileSlug: null, contact: "ravi#1", contacts: { discord: "ravi#1", ign: "RaviIGL" } },
      { id: "r2", status: "sent", message: "Pick me", createdAt: "2030-01-01T00:00:00.000Z", respondedAt: null, profileSlug: null, contact: "leak#1", contacts: { discord: "leak#1" } },
    ] } }),
  });
  await page.goto("/app/lft/");
  await expect(page.getByText("hawks_gg")).toBeVisible();
  await page.getByRole("button", { name: /Applications \(2\)/ }).click();
  await expect(page.getByText("RaviIGL")).toBeVisible();
  await expect(page.getByText("leak#1")).toHaveCount(0); // a pending request never shows a contact, whatever the server sent
  await axe(page);
});
