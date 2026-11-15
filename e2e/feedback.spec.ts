// The on-page feedback bot. The API is MOCKED with route interception: nothing here reaches the real backend (production answers 404 for
// /feedback/status while the flag is off). Run one project at a time:  npx playwright test e2e/feedback.spec.ts --project=desktop
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { json, signedIn } from "./helpers";

test.setTimeout(120_000);

const API = "**/esports-api.yaseenyk.workers.dev/**";
const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "authorization,content-type,x-attach-token,accept", "access-control-allow-methods": "GET,POST,DELETE,OPTIONS" };
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");
const STATUS_ON = { enabled: true, consentVersion: "feedback-v1", maxAttachments: 2, maxAttachmentBytes: 409600 };

interface Seen { method: string; path: string; headers: Record<string, string>; json: any; bytes: number }
interface Reply { status: number; body?: unknown }
interface Mock { status?: Reply; create?: (n: number) => Reply; upload?: (n: number) => Reply; del?: () => Reply }

/** Mocks /feedback*. Every other API call is aborted so nothing reaches production. Returns what the page sent. */
async function mockFeedback(page: Page, m: Mock = {}, keep = false): Promise<Seen[]> {
  const seen: Seen[] = [];
  await page.addInitScript(() => { try { sessionStorage.setItem("eh-feedback-probe", "1"); } catch { /* ignore */ } }); // the widget only talks to the API on the real host unless this is set
  let creates = 0, uploads = 0;
  if (!keep) await page.route(API, (r) => r.request().method() === "OPTIONS" ? r.fulfill({ status: 204, headers: CORS }) : r.abort("failed"));
  await page.route(API, async (r) => {
    const req = r.request(); const u = new URL(req.url());
    if (!u.pathname.startsWith("/feedback")) return r.fallback();
    if (req.method() === "OPTIONS") return r.fulfill({ status: 204, headers: CORS });
    const raw = req.postDataBuffer(); let body: any;
    try { body = raw ? JSON.parse(raw.toString("utf8")) : undefined; } catch { body = undefined; }
    seen.push({ method: req.method(), path: u.pathname, headers: req.headers(), json: body, bytes: raw?.length ?? 0 });
    let out: Reply;
    if (u.pathname === "/feedback/status") out = m.status ?? { status: 200, body: STATUS_ON };
    else if (u.pathname === "/feedback" && req.method() === "POST") out = (m.create ?? (() => ({ status: 201, body: { id: "r1", attachToken: "TOK", attachExpiresIn: 1200 } })))(++creates);
    else if (u.pathname.endsWith("/attachments")) out = (m.upload ?? (() => ({ status: 201, body: { id: "a1" } })))(++uploads);
    else if (req.method() === "DELETE") out = (m.del ?? (() => ({ status: 204 })))();
    else out = { status: 404, body: { error: "Not found" } };
    if (out.status === 204) return r.fulfill({ status: 204, headers: CORS });
    return r.fulfill({ ...json(out.body ?? {}, out.status), headers: { ...CORS, "content-type": "application/json" } });
  });
  return seen;
}

const bubble = (p: Page) => p.getByRole("button", { name: "Give feedback" });
const dialog = (p: Page) => p.getByRole("dialog", { name: "Feedback" });
const open = async (p: Page, path = "/about/") => { await p.goto(path); await expect(bubble(p)).toBeVisible({ timeout: 20_000 }); await bubble(p).click(); await expect(dialog(p)).toBeVisible(); };
const next = (p: Page) => dialog(p).getByRole("button", { name: "Next" }).click();

/** Walks the scripted conversation up to the summary. */
async function toReview(p: Page, o: { shot?: boolean; contact?: string; message?: string } = {}) {
  await open(p);
  await dialog(p).getByRole("button", { name: "Start" }).click();
  await dialog(p).getByRole("radio", { name: /Something is broken/ }).check();
  await next(p);
  await dialog(p).getByLabel("Tell us in your own words").fill(o.message ?? "The bracket page does not load for me");
  await next(p);
  await expect(dialog(p).getByLabel("Page this is about")).toHaveValue("/about/");
  await next(p);
  if (o.shot) {
    await dialog(p).locator('input[type="file"]').setInputFiles({ name: "shot.png", mimeType: "image/png", buffer: PNG });
    await expect(dialog(p).getByText(/Ready, \d+ KB/)).toBeVisible();
  }
  await next(p);
  if (o.contact) await dialog(p).getByLabel(/Email or handle/).fill(o.contact);
  await next(p);
  await expect(dialog(p).getByRole("heading", { name: "What will be sent" })).toBeVisible();
}
const consentAndSend = async (p: Page) => { await dialog(p).getByLabel(/I agree that this is sent/).check(); await dialog(p).getByRole("button", { name: "Send feedback" }).click(); };

test("probe 404: nothing in the DOM at all", async ({ page }) => {
  const seen = await mockFeedback(page, { status: { status: 404, body: { error: "Not found" } } });
  await page.goto("/about/");
  await expect.poll(() => seen.filter((s) => s.path === "/feedback/status").length, { timeout: 20_000 }).toBe(1);
  await page.waitForTimeout(500);
  await expect(page.getByRole("button", { name: "Give feedback" })).toHaveCount(0);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(await page.locator("body").innerHTML()).not.toMatch(/Give feedback|eh-fb/);
  expect(seen[0].headers.authorization).toBeUndefined();
  // cached for the session: moving to another page asks nothing more
  await page.goto("/guides/");
  await page.waitForTimeout(1500);
  expect(seen.filter((s) => s.path === "/feedback/status").length).toBe(1);
});

test("probe network error counts as off", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("eh-feedback-probe", "1"));
  await page.route(API, (r) => r.abort("failed"));
  await page.goto("/about/");
  await page.waitForTimeout(6000);
  await expect(page.getByRole("button", { name: "Give feedback" })).toHaveCount(0);
});

test("probe 200: the bubble appears (with no account sent)", async ({ page }) => {
  const seen = await mockFeedback(page);
  await page.goto("/about/");
  await expect(bubble(page)).toBeVisible({ timeout: 20_000 });
  expect(seen.filter((s) => s.path === "/feedback/status")).toHaveLength(1);
  expect(seen[0].headers.authorization).toBeUndefined();
  const box = (await bubble(page).boundingBox())!;
  expect(box.height).toBeGreaterThanOrEqual(44); expect(box.width).toBeGreaterThanOrEqual(44);
});

test("happy path with a screenshot: exact request, upload with the attach token, thanks, withdraw", async ({ page }) => {
  const seen = await mockFeedback(page);
  await page.goto("/about/?t=PRIVATE#frag");
  await expect(bubble(page)).toBeVisible({ timeout: 20_000 });
  await bubble(page).click();
  await dialog(page).getByRole("button", { name: "Start" }).click();
  await dialog(page).getByRole("radio", { name: /Something is broken/ }).check();
  await next(page);
  await expect(dialog(page).getByText("Please do not include passwords or private links.")).toBeVisible();
  await dialog(page).getByLabel("Tell us in your own words").fill("short");
  await expect(dialog(page).getByText(/5 of 2000 characters/)).toBeVisible();
  await next(page);
  await expect(dialog(page).getByText(/at least 10 characters/)).toBeVisible();
  await dialog(page).getByLabel("Tell us in your own words").fill("The bracket page does not load for me");
  await next(page);
  await expect(dialog(page).getByText("You are on: /about/")).toBeVisible();
  await expect(dialog(page).getByLabel("Page this is about")).toHaveValue("/about/");
  await next(page);
  await dialog(page).locator('input[type="file"]').setInputFiles({ name: "shot.png", mimeType: "image/png", buffer: PNG });
  await expect(dialog(page).getByText(/Ready, \d+ KB/)).toBeVisible();
  await next(page);
  await dialog(page).getByLabel(/Email or handle/).fill("me@example.com");
  await next(page);
  await expect(dialog(page).getByText("/about/", { exact: true })).toBeVisible();
  await dialog(page).getByRole("button", { name: "Send feedback" }).click();
  await expect(dialog(page).getByText("Please tick the box to send.")).toBeVisible();
  await expect(dialog(page).getByRole("link", { name: /Read the privacy page/ })).toHaveAttribute("href", "/privacy/#feedback");
  await consentAndSend(page);
  await expect(dialog(page).getByText("Thank you. We got it.")).toBeVisible();

  const post = seen.find((s) => s.method === "POST" && s.path === "/feedback")!;
  expect(post.json).toMatchObject({ kind: "bug", message: "The bracket page does not load for me", page: { path: "/about/" }, contact: "me@example.com", consent: true, consentVersion: "feedback-v1", website: "" });
  expect(post.json.client.viewport.w).toBeGreaterThan(0);
  expect(post.json.includeAccount).toBeUndefined();
  expect(JSON.stringify(post.json)).not.toMatch(/PRIVATE|frag|\?t=/);
  expect(post.headers.authorization).toBeUndefined();
  const up = seen.find((s) => s.path === "/feedback/r1/attachments")!;
  expect(up.headers["x-attach-token"]).toBe("TOK");
  expect(up.headers["content-type"]).toMatch(/^image\/(webp|jpeg)/);
  expect(up.headers.authorization).toBeUndefined();
  expect(up.bytes).toBeLessThanOrEqual(409600);

  await expect(dialog(page).getByText(/withdraw it for the next 20 minutes/)).toBeVisible();
  await dialog(page).getByRole("button", { name: "Withdraw this report" }).click();
  await expect(dialog(page).getByText(/Your report was withdrawn/)).toBeVisible();
  const del = seen.find((s) => s.method === "DELETE")!;
  expect(del.path).toBe("/feedback/r1"); expect(del.headers["x-attach-token"]).toBe("TOK");
});

test("the honeypot exists, is hidden and unreachable, and the widget always sends it empty", async ({ page }) => {
  const seen = await mockFeedback(page);
  await toReview(page);
  const hp = page.locator('input[name="website"]');
  await expect(hp).toHaveCount(1);
  await expect(hp).toHaveAttribute("tabindex", "-1");
  await expect(hp.locator("xpath=..")).toHaveAttribute("aria-hidden", "true");
  await hp.evaluate((el: HTMLInputElement) => { el.value = "bot wrote this"; });
  await consentAndSend(page);
  await expect(dialog(page).getByText("Thank you. We got it.")).toBeVisible();
  expect(seen.find((s) => s.method === "POST" && s.path === "/feedback")!.json.website).toBe("");
});

const CREATE_ERRORS: [string, Reply, RegExp][] = [
  ["rate_limited", { status: 429, body: { error: "slow", code: "rate_limited" } }, /few reports in a short time/],
  ["daily_cap", { status: 429, body: { error: "cap", code: "daily_cap" } }, /limit for feedback from this connection today/],
  ["too_short", { status: 400, body: { error: "short", code: "too_short" } }, /message is too short/],
  ["invalid", { status: 400, body: { error: "bad", code: "invalid", field: "page.path" } }, /was not accepted/],
  ["404 (switched off)", { status: 404, body: { error: "Not found" } }, /switched off right now/],
  ["413", { status: 413, body: { error: "big" } }, /too large to send/],
  ["500", { status: 500, body: { error: "oops" } }, /Something went wrong and the report was not sent/],
];
for (const [name, reply, words] of CREATE_ERRORS) {
  test(`send error ${name}: plain words, answers kept, retry works`, async ({ page }) => {
    let first = true;
    await mockFeedback(page, { create: () => { if (first) { first = false; return reply; } return { status: 201, body: { id: "r1", attachToken: "TOK", attachExpiresIn: 1200 } }; } });
    await toReview(page);
    await consentAndSend(page);
    await expect(dialog(page).getByRole("alert").filter({ hasText: words })).toBeVisible();
    if (name === "too_short") { await expect(dialog(page).getByLabel("Tell us in your own words")).toHaveValue("The bracket page does not load for me"); await next(page); await next(page); await next(page); await next(page); }
    else if (name === "invalid") { await next(page); await next(page); await next(page); }
    await expect(dialog(page).getByRole("heading", { name: "What will be sent" })).toBeVisible();
    await dialog(page).getByLabel(/I agree that this is sent/).check();
    await dialog(page).getByRole("button", { name: "Send feedback" }).click();
    await expect(dialog(page).getByText("Thank you. We got it.")).toBeVisible();
  });
}

test("send error: the network drops, then it works", async ({ page }) => {
  let n = 0;
  const seen = await mockFeedback(page);
  await page.route(API, (r) => { const u = new URL(r.request().url()); if (u.pathname === "/feedback" && r.request().method() === "POST" && n++ === 0) return r.abort("failed"); return r.fallback(); });
  await toReview(page);
  await consentAndSend(page);
  await expect(dialog(page).getByRole("alert").filter({ hasText: /could not reach the server/ })).toBeVisible();
  await dialog(page).getByRole("button", { name: "Send feedback" }).click();
  await expect(dialog(page).getByText("Thank you. We got it.")).toBeVisible();
  expect(seen.length).toBeGreaterThan(0);
});

const UPLOAD_ERRORS: [string, Reply, RegExp][] = [
  ["bad_image", { status: 400, body: { error: "x", code: "bad_image" } }, /could not be read as an image/],
  ["bad_token", { status: 401, body: { error: "x", code: "bad_token" } }, /upload window for this report has closed/],
  ["too_many", { status: 409, body: { error: "x", code: "too_many" } }, /only 2 screenshots/],
  ["too_big", { status: 413, body: { error: "x", code: "too_big" } }, /still too large/],
  ["unsupported_type", { status: 415, body: { error: "x", code: "unsupported_type" } }, /Only PNG, JPEG or WebP/],
];
for (const [name, reply, words] of UPLOAD_ERRORS) {
  test(`upload error ${name}: the report is NOT lost, retry offered`, async ({ page }) => {
    let first = true;
    const seen = await mockFeedback(page, { upload: () => { if (first) { first = false; return reply; } return { status: 201, body: { id: "a1" } }; } });
    await toReview(page, { shot: true });
    await consentAndSend(page);
    await expect(dialog(page).getByText("We got your message, but the screenshot did not upload.")).toBeVisible();
    await expect(dialog(page).getByRole("alert").filter({ hasText: words })).toBeVisible();
    expect(seen.filter((s) => s.method === "POST" && s.path === "/feedback")).toHaveLength(1);
    await expect(dialog(page).getByRole("button", { name: "Withdraw this report" })).toBeVisible();
    await dialog(page).getByRole("button", { name: "Retry the upload" }).click();
    await expect(dialog(page).getByText("Thank you. We got it.")).toBeVisible();
    expect(seen.filter((s) => s.method === "POST" && s.path === "/feedback")).toHaveLength(1);
    expect(seen.filter((s) => s.path.endsWith("/attachments"))).toHaveLength(2);
  });
}

test("a failed upload can be finished without the screenshot", async ({ page }) => {
  await mockFeedback(page, { upload: () => ({ status: 415, body: { error: "x", code: "unsupported_type" } }) });
  await toReview(page, { shot: true });
  await consentAndSend(page);
  await dialog(page).getByRole("button", { name: "Finish without it" }).click();
  await expect(dialog(page).getByText("Thank you. We got it.")).toBeVisible();
});

test("withdraw failure keeps the report and says so", async ({ page }) => {
  await mockFeedback(page, { del: () => ({ status: 401, body: { error: "no", code: "bad_token" } }) });
  await toReview(page);
  await consentAndSend(page);
  await dialog(page).getByRole("button", { name: "Withdraw this report" }).click();
  await expect(dialog(page).getByRole("alert").filter({ hasText: /20 minutes are over/ })).toBeVisible();
});

test("recent error messages: captured, cleaned, sent only when the tick is on", async ({ page }) => {
  const seen = await mockFeedback(page);
  await page.goto("/about/");
  await expect(bubble(page)).toBeVisible({ timeout: 20_000 });
  await page.evaluate(() => { setTimeout(() => { throw new Error("boom at https://x.example/api?t=SECRETVALUE for olivia@example.com"); }, 0); });
  await page.waitForTimeout(300);
  await bubble(page).click();
  await dialog(page).getByRole("button", { name: "Start" }).click();
  await dialog(page).getByRole("radio", { name: /Something is broken/ }).check(); await next(page);
  await dialog(page).getByLabel("Tell us in your own words").fill("The bracket page does not load for me"); await next(page); await next(page); await next(page); await next(page);
  const tick = dialog(page).getByLabel(/Include recent error messages/);
  await expect(tick).toBeChecked();
  await expect(dialog(page).getByText("Recent error messages", { exact: true })).toBeVisible();
  await consentAndSend(page);
  await expect(dialog(page).getByText("Thank you. We got it.")).toBeVisible();
  const errors = seen.find((s) => s.method === "POST" && s.path === "/feedback")!.json.client.errors as string[];
  expect(errors.join(" ")).toContain("boom at https://x.example/api");
  expect(errors.join(" ")).not.toMatch(/SECRETVALUE|olivia/);
  // untick: not sent
  await dialog(page).getByRole("button", { name: "Withdraw this report" }).click();
  await dialog(page).getByRole("button", { name: "Send another" }).click();
  await dialog(page).getByRole("button", { name: "Start" }).click();
  await dialog(page).getByRole("radio", { name: /Something is broken/ }).check(); await next(page);
  await dialog(page).getByLabel("Tell us in your own words").fill("The bracket page does not load for me"); await next(page); await next(page); await next(page); await next(page);
  await dialog(page).getByLabel(/Include recent error messages/).uncheck();
  await consentAndSend(page);
  await expect(dialog(page).getByText("Thank you. We got it.")).toBeVisible();
  const second = seen.filter((s) => s.method === "POST" && s.path === "/feedback")[1];
  expect(second.json.client.errors).toBeUndefined();
});

test("account: the tick exists only when signed in; the bearer token goes only when ticked", async ({ page }) => {
  // signed out
  const out = await mockFeedback(page);
  await toReview(page);
  await expect(dialog(page).getByLabel(/Link this report to my account/)).toHaveCount(0);
  await expect(dialog(page).getByText("Sign in to link a report to your account.")).toBeVisible();
  expect(out.length).toBeGreaterThan(0);
});

test("account: signed in, ticked sends the token; unticked sends none", async ({ page }) => {
  await signedIn(page);
  const seen = await mockFeedback(page, {}, true);
  await toReview(page);
  const tick = dialog(page).getByLabel(/Link this report to my account/);
  await expect(tick).not.toBeChecked();
  await consentAndSend(page);
  await expect(dialog(page).getByText("Thank you. We got it.")).toBeVisible();
  const a = seen.filter((s) => s.method === "POST" && s.path === "/feedback")[0];
  expect(a.headers.authorization).toBeUndefined(); expect(a.json.includeAccount).toBeUndefined();
  expect(seen.find((s) => s.path === "/feedback/status")!.headers.authorization).toBeUndefined();
  await dialog(page).getByRole("button", { name: "Withdraw this report" }).click();
  await dialog(page).getByRole("button", { name: "Send another" }).click();
  await dialog(page).getByRole("button", { name: "Start" }).click();
  await dialog(page).getByRole("radio", { name: /Something is broken/ }).check(); await next(page);
  await dialog(page).getByLabel("Tell us in your own words").fill("The bracket page does not load for me"); await next(page); await next(page); await next(page); await next(page);
  await dialog(page).getByLabel(/Link this report to my account/).check();
  await consentAndSend(page);
  await expect(dialog(page).getByText("Thank you. We got it.")).toBeVisible();
  const b = seen.filter((s) => s.method === "POST" && s.path === "/feedback")[1];
  expect(b.headers.authorization).toBe("Bearer t"); expect(b.json.includeAccount).toBe(true);
  const del = seen.find((s) => s.method === "DELETE")!;
  expect(del.headers.authorization).toBeUndefined();
});

test("the page field is editable but only a same-site path is accepted", async ({ page }) => {
  const seen = await mockFeedback(page);
  await open(page);
  await dialog(page).getByRole("button", { name: "Start" }).click();
  await dialog(page).getByRole("radio", { name: /Something else/ }).check(); await next(page);
  await dialog(page).getByLabel("Tell us in your own words").fill("The bracket page does not load for me"); await next(page);
  const path = dialog(page).getByLabel("Page this is about");
  await path.fill("https://evil.example/phish"); await next(page);
  await expect(dialog(page).getByRole("alert").filter({ hasText: /starts with \//})).toBeVisible();
  await path.fill("/tools/brackets/?t=SECRET#x"); await next(page);
  await next(page); await next(page);
  await consentAndSend(page);
  await expect(dialog(page).getByText("Thank you. We got it.")).toBeVisible();
  const post = seen.find((s) => s.method === "POST" && s.path === "/feedback")!;
  expect(post.json.page.path).toBe("/tools/brackets/");
  expect(post.json.page.title).toBeUndefined();
});

test("screenshots: at most 2, a bad file is refused with a reason, remove works", async ({ page }) => {
  await mockFeedback(page);
  await open(page);
  await dialog(page).getByRole("button", { name: "Start" }).click();
  await dialog(page).getByRole("radio", { name: /Something else/ }).check(); await next(page);
  await dialog(page).getByLabel("Tell us in your own words").fill("The bracket page does not load for me"); await next(page); await next(page);
  const input = dialog(page).locator('input[type="file"]');
  await input.setInputFiles({ name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("hi") });
  await expect(dialog(page).getByText("Only PNG, JPEG or WebP images can be attached.")).toBeVisible();
  for (const n of ["a.png", "b.png", "c.png"]) await input.setInputFiles({ name: n, mimeType: "image/png", buffer: PNG });
  await expect(dialog(page).getByText(/Ready, \d+ KB/)).toHaveCount(2);
  await expect(dialog(page).getByText("You can attach at most 2 images.")).toBeVisible();
  await dialog(page).getByRole("button", { name: "Remove a.png" }).click();
  await expect(dialog(page).getByText(/Ready, \d+ KB/)).toHaveCount(1);
  // paste from the clipboard
  await page.evaluate(async () => {
    const bin = atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==");
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const dt = new DataTransfer(); dt.items.add(new File([bytes], "pasted.png", { type: "image/png" }));
    document.dispatchEvent(new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true }));
  });
  await expect(dialog(page).getByText(/Ready, \d+ KB/)).toHaveCount(2);
});

test("hidden on gate, display, pass, overlay and embed: no probe, nothing rendered", async ({ page }) => {
  const seen = await mockFeedback(page);
  for (const p of ["/gate/", "/display/", "/pass/?t=x", "/overlay/", "/embed/"]) {
    await page.goto(p);
    await page.waitForLoadState("load");
    await page.waitForTimeout(4800);
    await expect(page.getByRole("button", { name: "Give feedback" })).toHaveCount(0);
  }
  expect(seen.filter((s) => s.path.startsWith("/feedback"))).toHaveLength(0);
});

test("keyboard only: open, answer, tab stays inside, Escape closes and focus returns", async ({ page }) => {
  await mockFeedback(page);
  await page.goto("/about/");
  await expect(bubble(page)).toBeVisible({ timeout: 20_000 });
  await bubble(page).focus();
  await page.keyboard.press("Enter");
  await expect(dialog(page)).toBeVisible();
  await expect(dialog(page).getByRole("button", { name: "Start" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(dialog(page).getByRole("radio").first()).toBeFocused();
  await page.keyboard.press("Space");
  await expect(dialog(page).getByRole("radio").first()).toBeChecked();
  for (let i = 0; i < 25; i++) { await page.keyboard.press("Tab"); expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true); }
  for (let i = 0; i < 25; i++) { await page.keyboard.press("Shift+Tab"); expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true); }
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toHaveCount(0);
  await expect(bubble(page)).toBeFocused();
  // a whole report from the keyboard
  await page.keyboard.press("Enter");
  await expect(dialog(page)).toBeVisible();
  await page.keyboard.press("Tab"); // Back is not in the greeting; the step already moved on
  const tabTo = async (name: RegExp) => { for (let i = 0; i < 15; i++) { const t = await page.evaluate(() => (document.activeElement as HTMLElement | null)?.getAttribute("aria-label") || (document.activeElement as HTMLElement | null)?.innerText || ""); if (name.test(t)) return; await page.keyboard.press("Tab"); } throw new Error(`never reached ${name}`); };
  await tabTo(/^Next$/); await page.keyboard.press("Enter");
  await expect(dialog(page).getByLabel("Tell us in your own words")).toBeVisible();
});

test("axe WCAG 2.1 AA with the panel open (desktop width and 390x844), on several steps", async ({ page }) => {
  await mockFeedback(page);
  const scan = async (label: string) => {
    const r = await new AxeBuilder({ page }).include('[role="dialog"]').withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(r.violations.map((v) => `${label}: ${v.id} ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
  };
  for (const size of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(size);
    await open(page);
    await scan(`${size.width} greeting`);
    await dialog(page).getByRole("button", { name: "Start" }).click();
    await scan(`${size.width} kind`);
    await dialog(page).getByRole("radio", { name: /Something is broken/ }).check(); await next(page);
    await scan(`${size.width} message`);
    await dialog(page).getByLabel("Tell us in your own words").fill("The bracket page does not load for me"); await next(page);
    await scan(`${size.width} page`);
    await next(page); await scan(`${size.width} shots`);
    await next(page); await scan(`${size.width} contact`);
    await next(page); await scan(`${size.width} review`);
    await consentAndSend(page);
    await expect(dialog(page).getByText("Thank you. We got it.")).toBeVisible();
    await scan(`${size.width} thanks`);
  }
});

test("no horizontal scroll: 390x844, and 200% zoom (640x450), panel closed and open", async ({ page }) => {
  await mockFeedback(page);
  for (const size of [{ width: 390, height: 844 }, { width: 640, height: 450 }]) {
    await page.setViewportSize(size);
    await page.goto("/about/");
    await expect(bubble(page)).toBeVisible({ timeout: 20_000 });
    const wide = () => page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(await wide()).toBe(false);
    await bubble(page).click();
    await expect(dialog(page)).toBeVisible();
    expect(await wide()).toBe(false);
    const box = (await dialog(page).boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(size.width); expect(box.y).toBeGreaterThanOrEqual(0); expect(box.y + box.height).toBeLessThanOrEqual(size.height);
    // the whole conversation still reaches its last button with the panel scrolling inside itself
    await dialog(page).getByRole("button", { name: "Start" }).click();
    await dialog(page).getByRole("radio", { name: /Something is broken/ }).check(); await next(page);
    await dialog(page).getByLabel("Tell us in your own words").fill("The bracket page does not load for me"); await next(page); await next(page); await next(page); await next(page);
    await expect(dialog(page).getByRole("button", { name: "Send feedback" })).toBeInViewport();
    expect(await wide()).toBe(false);
  }
});

for (const size of [{ width: 390, height: 844 }, { width: 412, height: 915 }]) {
  test(`the bubble does not overlap the bottom navigation at ${size.width}x${size.height}`, async ({ page }) => {
    await signedIn(page);
    await mockFeedback(page, {}, true);
    await page.setViewportSize(size);
    await page.goto("/app/id-cards/");
    await expect(bubble(page)).toBeVisible({ timeout: 20_000 });
    const nav = page.getByRole("navigation", { name: "Step navigation" });
    await nav.scrollIntoViewIfNeeded();
    await expect(nav).toBeVisible();
    for (const y of [0, 400, 100000]) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      const n = await nav.boundingBox(); const b = await bubble(page).boundingBox();
      if (!n || !b || n.y + n.height < 0 || n.y > size.height) continue;
      const overlap = !(b.x + b.width <= n.x || b.x >= n.x + n.width || b.y + b.height <= n.y || b.y >= n.y + n.height);
      expect(overlap, `bubble ${JSON.stringify(b)} vs nav ${JSON.stringify(n)} at scroll ${y}`).toBe(false);
    }
  });
}

test("print: the widget does not print", async ({ page }) => {
  await mockFeedback(page);
  await page.goto("/about/");
  await expect(bubble(page)).toBeVisible({ timeout: 20_000 });
  await page.emulateMedia({ media: "print" });
  await expect(bubble(page)).toBeHidden();
  await page.emulateMedia({ media: "screen" });
  await expect(bubble(page)).toBeVisible();
});

test("the hint: appears once after about 20 s, animated with transform and opacity only, never opens the panel", async ({ page }) => {
  await mockFeedback(page);
  await page.goto("/about/");
  await expect(bubble(page)).toBeVisible({ timeout: 20_000 });
  const hint = page.getByRole("status").filter({ hasText: /feedback|broken|grow|confusing|idea/i });
  await expect(hint).toHaveCount(0);
  await expect(hint).toBeVisible({ timeout: 30_000 });
  expect(await hint.evaluate((el) => getComputedStyle(el).animationName)).toBe("nudge");
  await expect(dialog(page)).toHaveCount(0);
  // dismiss: only a timestamp is stored, under the named key
  await page.getByRole("button", { name: "Hide this hint" }).click();
  await expect(hint).toHaveCount(0);
  const keys = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("eh-feedback")));
  expect(keys).toEqual(["eh-feedback-nudge-dismissed-at"]);
  expect(Number(await page.evaluate(() => localStorage.getItem("eh-feedback-nudge-dismissed-at")))).toBeGreaterThan(1_700_000_000_000);
});

test("the hint under reduced motion: static, no animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mockFeedback(page);
  await page.goto("/about/");
  const hint = page.getByRole("status").filter({ hasText: /feedback|broken|grow|confusing|idea/i });
  await expect(hint).toBeVisible({ timeout: 50_000 });
  expect(await hint.evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  expect(await hint.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
});

test("the hint stays away for 7 days after a dismissal, and when the panel was opened", async ({ page }) => {
  await page.addInitScript(() => { try { if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("eh-feedback-nudge-dismissed-at", String(Date.now() - 6 * 24 * 3600 * 1000)); } } catch { /* ignore */ } });
  await mockFeedback(page);
  await page.goto("/about/");
  await expect(bubble(page)).toBeVisible({ timeout: 20_000 });
  await page.waitForTimeout(22_000);
  await expect(page.getByRole("button", { name: "Hide this hint" })).toHaveCount(0);
});

test("the hint is not shown once the visitor opened the panel", async ({ page }) => {
  await mockFeedback(page);
  await page.goto("/about/");
  await expect(bubble(page)).toBeVisible({ timeout: 20_000 });
  await bubble(page).click();
  await page.waitForTimeout(22_000);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Hide this hint" })).toHaveCount(0);
});
