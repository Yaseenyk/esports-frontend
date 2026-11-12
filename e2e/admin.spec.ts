import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page, type Route } from "@playwright/test";
import { json, mockApi, unmockedCalls } from "./helpers";

const API = "**/esports-api.yaseenyk.workers.dev/**";
const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
const staffToken = (suInSeconds = 5) => { const n = Math.floor(Date.now() / 1000); return `${b64({ alg: "HS256" })}.${b64({ sub: "s", aud: "staff", exp: n + 1500, su: n - suInSeconds })}.sig`; };

type Handler = (path: string, method: string, body: unknown) => unknown | { status: number; body: unknown } | undefined;
const sent: { method: string; path: string; body: unknown }[] = [];

/** Registers AFTER mockApi (whose abort-everything catch-all must come first, see helpers.ts). */
async function staffApi(page: Page, handler: Handler) {
  sent.length = 0;
  await page.route(API, (r: Route) => {
    const req = r.request();
    if (req.method() === "OPTIONS") return r.fallback();
    const path = new URL(req.url()).pathname;
    let body: unknown = null; try { body = req.postDataJSON(); } catch { /* none */ }
    sent.push({ method: req.method(), path, body });
    const out = handler(path, req.method(), body);
    if (out === undefined) return r.fallback();
    const o = out as { status?: number; body?: unknown };
    return typeof o.status === "number" && "body" in o ? r.fulfill(json(o.body, o.status)) : r.fulfill(json(out));
  });
}

const asStaff = (page: Page, suSeconds = 5) => page.addInitScript((t) => sessionStorage.setItem("eh-staff-v1", t), staffToken(suSeconds));

const REPORTS = [
  { source: "report", id: "r1", targetType: "team_profile", targetId: "t1", reasonCode: "scam", note: "Looks fake <b>x</b>", priority: 1, reporters: 2, createdAt: new Date(Date.now() - 3600_000).toISOString(), status: "open", link: "/team/alpha/" },
  { source: "report", id: "r2", targetType: "live_page", targetId: "l1", reasonCode: "minor_exposed", note: "", priority: 3, reporters: 1, createdAt: new Date(Date.now() - 7200_000).toISOString(), status: "open" },
];
const FLAGS = { flags: [{ key: "kill.mail", value: false, settable: true, stepUp: true }, { key: "kill.uploads", value: true, settable: true, stepUp: true }, { key: "takedown.enforce", value: false, settable: true, stepUp: false }, { key: "authz.mode", value: "legacy", settable: false, stepUp: false }] };
const USAGE = { day: "2026-11-12", items: [{ id: "d1_rows_written_today", label: "Database rows written today", value: null, limit: 100000, exact: false, available: false, source: "No sample is collected yet" }, { id: "worker_requests_today", label: "Worker requests today", value: null, limit: 100000, exact: false, available: false, source: "Needs the Cloudflare token" }, { id: "mail_sent_today", label: "Emails sent today", value: 12, limit: 90, exact: true, available: true, source: "Counted" }, { id: "db_size_bytes", label: "Database size", value: 52_000_000, limit: 500_000_000, exact: true, available: true, source: "From the database" }], note: "Limits not verified, check Cloudflare." };

const base: Handler = (path, method) => {
  if (path === "/admin/v1/reports" && method === "GET") return { items: REPORTS };
  if (path === "/admin/v1/flags" && method === "GET") return FLAGS;
  if (path === "/admin/v1/usage") return USAGE;
  if (path === "/admin/v1/audit") return { entries: [{ id: 1, at: new Date().toISOString(), actorType: "staff", actorId: "staff-secret-id", orgId: null, eventId: null, action: "report.decided", targetType: "team_profile", targetId: "t1", reasonCode: "scam", meta: {} }], next: null };
  return undefined;
};

test.beforeEach(async ({ page }) => { await mockApi(page); });

test("a stranger sees a plain 404 with nothing about staff", async ({ page }) => {
  for (const p of ["/admin/", "/admin/reports/", "/admin/switches/"]) {
    await page.goto(p);
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
    await expect(page.getByText("This page could not be found.")).toBeVisible();
    const text = (await page.locator("body").innerText()).toLowerCase();
    expect(text).not.toMatch(/staff|admin|sign in|password/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page).toHaveTitle("Page not found");
  }
  expect(unmockedCalls.get(page)).toEqual([]);
});

test("staff sign in with email, password and code; the token is in sessionStorage only", async ({ page }) => {
  const token = staffToken();
  await staffApi(page, (path, method, body) => {
    if (path === "/auth/login") return { token: "user-token", user: { id: "u", email: "s@example.com", name: "S" } };
    if (path === "/admin/v1/session") return (body as { code: string }).code === "123456" ? { token } : { status: 401, body: { error: "Wrong code" } };
    return base(path, method, body);
  });
  await page.goto("/admin/?in");
  await page.getByLabel("Email").fill("s@example.com");
  await page.getByLabel("Password").fill("correct horse");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByLabel("Authenticator code")).toBeFocused();
  await page.getByLabel("Authenticator code").fill("000000");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("alert").filter({ hasText: /[^ ]/ })).toContainText("That code did not work");
  await page.getByLabel("Authenticator code").fill("123456");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
  await expect(page.getByText("Reports waiting")).toBeVisible();
  const stores = await page.evaluate(() => ({ s: sessionStorage.getItem("eh-staff-v1"), l: JSON.stringify(Object.entries(localStorage)), pw: document.body.innerHTML.includes("correct horse") }));
  expect(stores.s).toBe(token);
  expect(stores.l).not.toContain(token);
  expect(stores.l).not.toContain("user-token");
  expect(stores.pw).toBe(false);
  expect(unmockedCalls.get(page)).toEqual([]);
});

test("an account that is not staff ends on the plain 404", async ({ page }) => {
  await staffApi(page, (path) => (path === "/auth/login" ? { token: "u", user: {} } : path === "/admin/v1/session" ? { status: 404, body: { error: "Not found" } } : undefined));
  await page.goto("/admin/?in");
  await page.getByLabel("Email").fill("n@example.com");
  await page.getByLabel("Password").fill("pw-12345678");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Authenticator code").fill("123456");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem("eh-staff-v1"))).toBeNull();
});

test("dashboard shows counts only", async ({ page }) => {
  await asStaff(page);
  await staffApi(page, base);
  await page.goto("/admin/");
  await expect(page.getByText("Reports waiting")).toBeVisible();
  await expect(page.getByText("Urgent reports")).toBeVisible();
  await expect(page.getByText("12 of 90")).toBeVisible();
  expect(await page.locator("body").innerText()).not.toContain("staff-secret-id");
});

test("hide a report: choose it, confirm with a reason", async ({ page }) => {
  await asStaff(page);
  await staffApi(page, (path, method, body) => (path === "/admin/v1/reports/r1/decide" ? { ok: true } : base(path, method, body)));
  await page.goto("/admin/reports/");
  await page.getByRole("button", { name: /Team page: Scam/ }).click();
  await expect(page.getByText("Looks fake <b>x</b>")).toBeVisible(); // note is plain text, never markup
  await page.getByRole("button", { name: "Hide it" }).click();
  await expect(page.getByRole("heading", { name: "Hide this from the public?" })).toBeFocused();
  await page.getByRole("button", { name: "Hide it" }).last().click();
  await expect(page.getByRole("alert").filter({ hasText: /[^ ]/ })).toContainText("Choose a reason");
  expect(sent.some((s) => s.path.endsWith("/decide"))).toBe(false);
  await page.getByLabel("Reason (required)").selectOption("scam");
  await page.getByRole("button", { name: "Hide it" }).last().click();
  await expect(page.getByRole("status").filter({ hasText: "Hidden." })).toBeVisible();
  expect(sent.find((s) => s.path.endsWith("/decide"))?.body).toEqual({ source: "report", decision: "hide", reasonCode: "scam" });
});

test("takedown and dismiss need their own confirmation and Escape cancels", async ({ page }) => {
  await asStaff(page);
  await staffApi(page, (path, method, body) => (path === "/admin/v1/takedowns" ? { ok: true } : base(path, method, body)));
  await page.goto("/admin/reports/");
  await page.getByRole("button", { name: /Live page/ }).click();
  await page.getByRole("button", { name: "Dismiss report" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Take down" })).toBeVisible();
  await page.getByRole("button", { name: "Take down" }).click();
  await page.getByLabel("Reason (required)").selectOption("minor_exposed");
  await page.getByRole("button", { name: "Take it down" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Taken down." })).toBeVisible();
  expect(sent.find((s) => s.path === "/admin/v1/takedowns")?.body).toEqual({ targetType: "live_page", targetId: "l1", reasonCode: "minor_exposed" });
});

test("kill switch: plain warning, reason and a fresh code when the last one is old", async ({ page }) => {
  await asStaff(page, 900);
  await staffApi(page, (path, method, body) => {
    if (path === "/admin/v1/session/step-up") return { token: staffToken(0) };
    if (path === "/admin/v1/flags/kill.mail" && method === "PUT") return { ok: true };
    return base(path, method, body);
  });
  await page.goto("/admin/switches/");
  await expect(page.getByText("Part of the site")).toHaveCount(0);
  await expect(page.getByText("Photo and file uploads")).toBeVisible(); // every switch the server lists is shown, in plain words
  await expect(page.getByText("authz")).toHaveCount(0);
  await page.getByRole("button", { name: /Stop: Emails/ }).click();
  await expect(page.getByText("People who ask for a password reset will not get an email")).toBeVisible();
  await page.getByLabel("Reason (required)").selectOption("security");
  await page.getByRole("button", { name: "Yes, stop it" }).click();
  await expect(page.getByRole("alert").filter({ hasText: /[^ ]/ })).toContainText("6-digit code");
  await page.getByLabel("Authenticator code").fill("123456");
  await page.getByRole("button", { name: "Yes, stop it" }).click();
  await expect(page.getByRole("status").filter({ hasText: "is stopped" })).toBeVisible();
  expect(sent.find((s) => s.path.endsWith("/flags/kill.mail"))?.body).toEqual({ value: true, reasonCode: "security" });
});

test("lift a takedown: choose a reason, confirm, and the lift route is called", async ({ page }) => {
  await asStaff(page);
  await staffApi(page, (path, method, body) => {
    if (path === "/admin/v1/takedowns" && method === "GET") return { items: [{ targetType: "live_page", targetId: "l1", reasonCode: "scam", byStaff: "s", at: new Date().toISOString(), eventId: "l1", orgId: null }], next: null };
    if (path === "/admin/v1/takedowns/live_page/l1/restore" && method === "POST") return { ok: true, state: "restored", changed: true };
    return base(path, method, body);
  });
  await page.goto("/admin/reports/");
  await page.getByRole("button", { name: "Taken down" }).click();
  await page.getByRole("button", { name: /Lift takedown: Live page/ }).click();
  await page.getByRole("button", { name: "Lift takedown" }).last().click();
  await expect(page.getByRole("alert").filter({ hasText: /[^ ]/ })).toContainText("Choose a reason");
  expect(sent.some((s) => s.path.endsWith("/restore"))).toBe(false);
  await page.getByLabel("Reason (required)").selectOption("other");
  await page.getByRole("button", { name: "Lift takedown" }).last().click();
  await expect(page.getByRole("status").filter({ hasText: "Takedown lifted." })).toBeVisible();
  expect(sent.find((s) => s.path.endsWith("/restore"))?.body).toEqual({ reasonCode: "other" });
});

test("lookup shows metadata only and does not keep the email on screen", async ({ page }) => {
  await asStaff(page);
  await staffApi(page, (path, method, body) => (path === "/admin/v1/lookup" ? { kind: "user", id: "u9", status: "active", email: "leak@example.com", roster: [{ name: "Child" }], orgs: [], counts: { eventsOwned: 3, eventsShared: 0 } } : base(path, method, body)));
  await page.goto("/admin/lookup/");
  await page.getByRole("button", { name: "Email" }).click();
  await page.getByLabel("Exact email address").fill("leak@example.com");
  await page.getByRole("button", { name: "Look up" }).click();
  await expect(page.getByText("u9")).toBeVisible();
  const text = await page.locator("body").innerText();
  expect(text).not.toContain("leak@example.com");
  expect(text).not.toContain("Child");
  await expect(page.getByLabel("Exact email address")).toHaveValue("");
});

test("an error from the server is shown with a way to retry", async ({ page }) => {
  await asStaff(page);
  let n = 0;
  await staffApi(page, (path, method, body) => (path === "/admin/v1/usage" && n++ === 0 ? { status: 500, body: { error: "boom" } } : base(path, method, body)));
  await page.goto("/admin/usage/");
  await expect(page.getByRole("alert").filter({ hasText: /[^ ]/ })).toContainText("server had a problem");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByText("Database rows written today")).toBeVisible();
  await expect(page.getByText("Limits not verified, check Cloudflare.")).toBeVisible();
});

test("activity shows actions without staff ids", async ({ page }) => {
  await asStaff(page);
  await staffApi(page, base);
  await page.goto("/admin/activity/");
  await expect(page.getByText("Report decided")).toBeVisible();
  await expect(page.getByText("Platform staff")).toBeVisible();
  expect(await page.locator("body").innerText()).not.toContain("staff-secret-id");
});

test("every staff page has no serious accessibility problems and fits 360 px", async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 360, height: 740 });
  await asStaff(page);
  await staffApi(page, base);
  for (const p of ["/admin/", "/admin/reports/", "/admin/lookup/", "/admin/switches/", "/admin/usage/", "/admin/activity/"]) {
    await page.goto(p);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(900);
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${p} ${v.id}`)).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});
