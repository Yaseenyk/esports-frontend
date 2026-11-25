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

const OVERVIEW = { counts: { users: 41, usersVerified: 30, usersSuspended: 1, orgs: 5, orgsPending: 2, orgsVerified: 3, events: 12, tournaments: 4, openReports: 3, openRatingReports: 1, feedbackNew: 2, feedbackTotal: 9, scrims: 6, scrimsHidden: 1, lft: 7, lftHidden: 0, directory: 2, directoryHidden: 0, calendar: null, calendarHidden: null, ratings: 8, ratingsHidden: 1 }, recent: [{ id: 9, at: new Date().toISOString(), actorType: "staff", actorId: "staff-secret-id", action: "org.verified", targetType: "org", targetId: "o1", reasonCode: "other" }] };
const ORGS = { items: [{ id: "o1", name: "Pune Esports Club", kind: "team", slug: null, status: "active", createdAt: new Date(Date.now() - 86_400_000).toISOString(), verifiedAt: null, members: 3, events: 2, owner: { id: "u1", email: "o***@g***.com" } }], next: null };
const USERS = { items: [{ id: "u1", email: "owner@gmail.com", status: "active", createdAt: new Date(Date.now() - 86_400_000).toISOString(), emailVerifiedAt: null, staff: false, orgs: [{ id: "o1", name: "Pune Esports Club", kind: "team", role: "admin", verified: false }] }], next: null };
const CONTENT: Record<string, unknown> = {
  scrims: { kind: "scrims", available: true, reasons: ["spam", "scam", "abuse", "other"], items: [{ kind: "scrims", id: "s1", title: "Alpha Squad", body: "tier 2 only", meta: ["bgmi"], status: "open", hidden: false, hiddenReason: null, reports: 2, createdAt: new Date().toISOString(), link: null }], next: null },
  ratings: { kind: "ratings", available: true, reasons: ["abuse", "personal_info", "spam", "other"], items: [{ kind: "ratings", id: "r1", title: "2 of 5 from Riya K", body: "Started two hours late.", meta: ["Spring Cup"], status: "visible", hidden: false, hiddenReason: null, reports: 1, createdAt: new Date().toISOString(), link: null, reply: "Sorry, the venue opened late.", replyHidden: false }], next: null },
  calendar: { kind: "calendar", available: false, reasons: ["abuse"], items: [], next: null },
};

const base: Handler = (path, method) => {
  if (path === "/admin/v1/overview") return OVERVIEW;
  if (path === "/admin/v1/orgs" && method === "GET") return ORGS;
  if (path === "/admin/v1/users" && method === "GET") return USERS;
  if (path === "/admin/v1/reports" && method === "GET") return { items: REPORTS };
  if (path === "/admin/v1/flags" && method === "GET") return FLAGS;
  if (path === "/admin/v1/usage") return USAGE;
  if (path === "/admin/v1/audit") return { entries: [{ id: 1, at: new Date().toISOString(), actorType: "staff", actorId: "staff-secret-id", orgId: null, eventId: null, action: "report.decided", targetType: "team_profile", targetId: "t1", reasonCode: "scam", meta: {} }], next: null };
  return undefined;
};

test.beforeEach(async ({ page }) => { await mockApi(page); });

test("a stranger sees a plain 404 with nothing about staff", async ({ page }) => {
  for (const p of ["/admin/", "/admin/reports/", "/admin/switches/", "/admin/orgs/", "/admin/users/", "/admin/content/", "/admin/feedback/"]) {
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
  await page.getByLabel("Password", { exact: true }).fill("correct horse");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByLabel("Authenticator code")).toBeFocused();
  await page.getByLabel("Authenticator code").fill("000000");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("alert").filter({ hasText: /[^ ]/ })).toContainText("That code did not work");
  await page.getByLabel("Authenticator code").fill("123456");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
  await expect(page.getByText("Open reports")).toBeVisible();
  const stores = await page.evaluate(() => ({ s: sessionStorage.getItem("eh-staff-v1"), l: JSON.stringify(Object.entries(localStorage)), pw: document.body.innerHTML.includes("correct horse") }));
  expect(stores.s).toBe(token);
  expect(stores.l).not.toContain(token);
  expect(stores.l).not.toContain("user-token");
  expect(stores.pw).toBe(false);
  expect(unmockedCalls.get(page)).toEqual([]);
});

test("an account that is not staff is told so on the sign-in, and no session is stored", async ({ page }) => {
  await staffApi(page, (path) => (path === "/auth/login" ? { token: "u", user: {} } : path === "/admin/v1/session" ? { status: 404, body: { error: "Not found" } } : undefined));
  await page.goto("/admin/?in");
  await page.getByLabel("Email").fill("n@example.com");
  await page.getByLabel("Password", { exact: true }).fill("pw-12345678");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Authenticator code").fill("123456");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("alert").filter({ hasText: /[^ ]/ })).toContainText("This account cannot open this area");
  await expect(page.getByLabel("Email")).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem("eh-staff-v1"))).toBeNull();
});

test("home: every count links to its queue, null counts say not available, recent activity has no staff id", async ({ page }) => {
  await asStaff(page);
  await staffApi(page, base);
  await page.goto("/admin/");
  await expect(page.getByRole("link", { name: /Open reports\s*3/ })).toHaveAttribute("href", "/admin/reports/");
  await expect(page.getByRole("link", { name: /Organisations to approve\s*2/ })).toHaveAttribute("href", "/admin/orgs/");
  await expect(page.getByRole("link", { name: /New feedback/ })).toHaveAttribute("href", "/admin/feedback/");
  await expect(page.getByRole("link", { name: /^Ratings/ })).toHaveAttribute("href", "/admin/content/?kind=ratings");
  await expect(page.getByRole("link", { name: /Calendar entries/ })).toContainText("Not available yet");
  await expect(page.getByText("12 of 90")).toBeVisible();
  await expect(page.getByText("Org verified")).toBeVisible();
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
  for (const p of ["/admin/", "/admin/reports/", "/admin/content/", "/admin/orgs/", "/admin/users/", "/admin/feedback/", "/admin/lookup/", "/admin/switches/", "/admin/usage/", "/admin/activity/"]) {
    await page.goto(p);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(900);
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${p} ${v.id}`)).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});

// ---- staff console: organisations, users, content, feedback, switches, sign-in ----

test("organisations: the queue shows masked owners and counts; verify asks for a reason and sends the typed address", async ({ page }) => {
  await asStaff(page);
  await staffApi(page, (path, method, body) => (path === "/admin/v1/orgs/o1/verify" ? { ok: true, slug: "pune-club", changed: true } : base(path, method, body)));
  await page.goto("/admin/orgs/");
  await expect(page.getByRole("heading", { name: "Pune Esports Club" })).toBeVisible();
  await expect(page.getByText("o***@g***.com")).toBeVisible();
  await expect(page.getByText(/3 members · 2 events/)).toBeVisible();
  await page.getByRole("button", { name: "Verify" }).click();
  await page.getByLabel("Public address (optional)").fill("pune-club");
  await page.getByRole("button", { name: "Verify" }).last().click();
  await expect(page.getByRole("alert").filter({ hasText: /[^ ]/ })).toContainText("Choose a reason");
  await page.getByLabel("Reason (required)").selectOption("other");
  await page.getByRole("button", { name: "Verify" }).last().click();
  await expect(page.getByRole("status").filter({ hasText: "is verified" })).toBeVisible();
  expect(sent.find((s) => s.path === "/admin/v1/orgs/o1/verify")?.body).toEqual({ reasonCode: "other", slug: "pune-club" });
});

test("users: emails are masked even if the server sends them plain; reveal needs a reason and shows the address once", async ({ page }) => {
  await asStaff(page);
  await staffApi(page, (path, method, body) => (path === "/admin/v1/users/u1/reveal" ? { id: "u1", email: "owner@gmail.com" } : base(path, method, body)));
  await page.goto("/admin/users/");
  await expect(page.getByText("o***@g***.com")).toBeVisible();
  expect(await page.locator("body").innerText()).not.toContain("owner@gmail.com");
  await page.getByLabel("Search by email (any part)").fill("own");
  await page.getByRole("button", { name: "Search" }).click();
  await expect.poll(() => sent.some((s) => s.path === "/admin/v1/users")).toBe(true);
  await page.getByRole("button", { name: "Show email" }).click();
  await page.getByLabel("Reason (required)").selectOption("user_request");
  await page.getByRole("button", { name: "Show email" }).last().click();
  await expect(page.getByText("owner@gmail.com")).toBeVisible();
  expect(sent.find((s) => s.path === "/admin/v1/users/u1/reveal")?.body).toEqual({ reasonCode: "user_request" });
});

test("content hub: each kind has its own list; hide a scrim with a reason; hide only the reply of a review with the ratings reasons", async ({ page }) => {
  await asStaff(page);
  let kind = "scrims";
  await staffApi(page, (path, method, body) => {
    if (path === "/admin/v1/content" && method === "GET") return CONTENT[kind];
    if (path.startsWith("/admin/v1/content/") && method === "POST") return { ok: true, item: null };
    return base(path, method, body);
  });
  await page.goto("/admin/content/?kind=scrims");
  await expect(page.getByRole("heading", { name: "Alpha Squad" })).toBeVisible();
  await expect(page.getByText("2 reports")).toBeVisible();
  await page.getByRole("button", { name: "Hide", exact: true }).click();
  await page.getByLabel("Reason (required)").selectOption("spam");
  await page.getByRole("button", { name: "Hide it" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Hidden: Alpha Squad" })).toBeVisible();
  expect(sent.find((s) => s.path === "/admin/v1/content/scrims/s1/hide")?.body).toEqual({ reasonCode: "spam" });

  kind = "ratings";
  await page.getByRole("button", { name: "Ratings and reviews" }).click();
  await expect(page.getByText("Sorry, the venue opened late.")).toBeVisible();
  await page.getByRole("button", { name: "Hide reply" }).click();
  await expect(page.getByLabel("Reason (required)").locator("option[value=personal_info]")).toHaveCount(1);
  await page.getByLabel("Reason (required)").selectOption("personal_info");
  await page.getByRole("button", { name: "Hide it" }).click();
  await expect.poll(() => sent.find((s) => s.path === "/admin/v1/content/ratings/r1/hide")?.body).toEqual({ reasonCode: "personal_info", target: "reply" });

  kind = "calendar";
  await page.getByRole("button", { name: "Calendar" }).click();
  await expect(page.getByText("not set up on the database yet")).toBeVisible();
});

test("reports link to the content hub and the lookup for their event", async ({ page }) => {
  await asStaff(page);
  await staffApi(page, (path, method, body) => (path === "/admin/v1/reports" ? { items: [{ ...REPORTS[1], eventId: "ev1" }, { source: "directory", id: "d1", targetType: "directory_entry", targetId: "ev2", reasonCode: "other", priority: 0, reporters: 1, status: "open", createdAt: new Date().toISOString() }] } : base(path, method, body)));
  await page.goto("/admin/reports/");
  await page.getByRole("button", { name: /Live page/ }).click();
  await expect(page.getByRole("link", { name: "See it in Content" })).toHaveAttribute("href", "/admin/content/?kind=results&id=ev1");
  await expect(page.getByRole("link", { name: "Look up the event" })).toHaveAttribute("href", "/admin/lookup/?id=ev1");
  await page.getByRole("button", { name: /Directory listing/ }).click();
  await expect(page.getByRole("link", { name: "See it in Content" }).last()).toHaveAttribute("href", "/admin/content/?kind=directory&id=ev2");
});

test("feedback inbox: switched off says so and keeps the session; on, a status change is sent", async ({ page }) => {
  await asStaff(page);
  let on = false;
  await staffApi(page, (path, method, body) => {
    if (path === "/admin/v1/feedback" && method === "GET") return on ? { items: [{ id: "f1", createdAt: new Date().toISOString(), kind: "bug", status: "new", message: "Save button broke", pagePath: "/tools/", deviceClass: "phone", attachmentCount: 0, staffNote: null, hasContact: true, contact: "secret@example.com" }], next: null } : { status: 404, body: { error: "Not found" } };
    if (path === "/admin/v1/feedback/f1" && method === "PATCH") return { ok: true };
    return base(path, method, body);
  });
  await page.goto("/admin/feedback/");
  await expect(page.getByText(/switched off/)).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem("eh-staff-v1"))).not.toBeNull();
  on = true;
  await page.getByRole("button", { name: "Looked at" }).click();
  await page.getByRole("button", { name: "New", exact: true }).click();
  await expect(page.getByText("Save button broke")).toBeVisible();
  expect(await page.locator("body").innerText()).not.toContain("secret@example.com");
  await page.getByRole("button", { name: "Mark: Fixed" }).click();
  await expect.poll(() => sent.find((s) => s.path === "/admin/v1/feedback/f1")?.body).toEqual({ status: "fixed", staffNote: null });
});

test("switches list the v3 feature flags with their notes, read-only", async ({ page }) => {
  await asStaff(page);
  const flags = { flags: [...FLAGS.flags, { key: "v3.trust", value: true, settable: false, stepUp: false, description: "Organiser trust score: proof-based ratings.", updatedAt: new Date().toISOString(), reasonCode: "other" }, { key: "v3.scrims", value: false, settable: false, stepUp: false, description: "Scrim finder.", updatedAt: null, reasonCode: null }] };
  await staffApi(page, (path, method, body) => (path === "/admin/v1/flags" && method === "GET" ? flags : base(path, method, body)));
  await page.goto("/admin/switches/");
  await expect(page.getByRole("heading", { name: "Feature flags" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "v3.trust" })).toBeVisible();
  await expect(page.getByText("Organiser trust score: proof-based ratings.")).toBeVisible();
  await expect(page.getByText("Scrim finder.")).toBeVisible();
  await expect(page.getByText("authz")).toHaveCount(0);
});

test("sign-in: continue with the site session, set up the authenticator (QR, key, copy), then the code", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("eh-session-v1", JSON.stringify({ token: "SITE-TOKEN", user: { id: "u", email: "owner@gmail.com", name: "Owner" } })));
  const token = staffToken();
  await staffApi(page, (path, method, body) => {
    if (path === "/me") return { id: "u", email: "owner@gmail.com", name: "Owner" };
    if (path === "/admin/v1/session") return (body as { code: string }).code === "654321" ? { token } : { status: 409, body: { error: "Set up your authenticator first", code: "totp_not_enrolled" } };
    if (path === "/admin/v1/session/enroll") return { secret: "JBSWY3DPEHPK3PXPJBSWY3DP", otpauthUrl: "otpauth://totp/Esports%20Hub:u?secret=JBSWY3DPEHPK3PXPJBSWY3DP&issuer=Esports%20Hub" };
    return base(path, method, body);
  });
  await page.goto("/admin/?in");
  await expect(page.getByText("Esports Hub · Staff")).toBeVisible();
  expect(await page.locator("body").innerText()).not.toContain("owner@gmail.com");
  await page.getByRole("button", { name: "Continue as o***@g***.com" }).click();
  await expect(page.getByLabel("Authenticator code")).toBeFocused();
  await expect(page.getByLabel("Authenticator code")).toHaveAttribute("autocomplete", "one-time-code");
  await expect(page.getByLabel("Authenticator code")).toHaveAttribute("inputmode", "numeric");
  expect(sent.find((s) => s.path === "/me")).toBeTruthy();
  await page.getByLabel("Authenticator code").fill("111111");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("img", { name: /QR code/ })).toBeVisible();
  await expect(page.getByTestId("totp-key")).toHaveText("JBSW Y3DP EHPK 3PXP JBSW Y3DP");
  await expect(page.getByText(/Google Authenticator/)).toBeVisible();
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.getByRole("button", { name: "Copy key" }).click();
  await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
  await page.getByLabel("Authenticator code").fill("654321");
  await page.getByRole("button", { name: "Finish and sign in" }).click();
  await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem("eh-staff-v1"))).toBe(token);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("eh-session-v1") ?? "{}").token)).toBe("SITE-TOKEN"); // the site sign-in is untouched
});

test("sign-in: password eye toggles, forgot-password link, wrong password, expired site session and rate limit messages", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("eh-session-v1", JSON.stringify({ token: "OLD", user: { id: "u", email: "old@example.com" } })));
  let tries = 0;
  await staffApi(page, (path) => {
    if (path === "/me") return { status: 401, body: { error: "Authentication required" } };
    if (path === "/auth/login") return tries++ === 0 ? { status: 401, body: { error: "Invalid" } } : { token: "U" };
    if (path === "/admin/v1/session") return { status: 429, body: { error: "Too many", code: "locked" } };
    return undefined;
  });
  await page.goto("/admin/?in");
  await page.getByRole("button", { name: /Continue as/ }).click();
  await expect(page.getByRole("alert").filter({ hasText: /[^ ]/ })).toContainText("site sign-in has expired");
  await expect(page.getByRole("button", { name: /Continue as/ })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Forgot password?" })).toHaveAttribute("href", "/forgot-password/");
  const pw = page.getByLabel("Password", { exact: true });
  await expect(pw).toHaveAttribute("autocomplete", "current-password");
  await expect(page.getByLabel("Email")).toHaveAttribute("autocomplete", "username");
  await expect(pw).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(page.getByRole("button", { name: "Show password" })).toHaveAttribute("aria-pressed", "true");
  await expect(pw).toHaveAttribute("type", "text");
  await page.getByLabel("Email").fill("s@example.com");
  await pw.fill("wrong");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("alert").filter({ hasText: /[^ ]/ })).toContainText("did not match");
  await pw.fill("right");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Authenticator code").fill("123456");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("alert").filter({ hasText: /[^ ]/ })).toContainText("Too many tries");
});

test("the staff sign-in page has no serious accessibility problems and fits a phone", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/admin/?in");
  await expect(page.getByRole("heading", { name: "Staff sign-in" })).toBeVisible();
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
