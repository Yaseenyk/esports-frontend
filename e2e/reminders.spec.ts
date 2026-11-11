// Email reminders panel, the unsubscribe page and the consent field on the registration form. The server is mocked; no real data or email is touched.
import { expect, test, type Page } from "@playwright/test";
import { json, openPanel, preflight, signedIn } from "./helpers";

const A = "**/esports-api.yaseenyk.workers.dev";
const ev = { id: "e1", key: "cup", name: "Spring Cup", game: "BGMI", organiser: "", date: "2026-12-01", venue: "Pune", emergency: "", rules: "", settings: {}, updatedAt: "" };
const limits = (o = {}) => ({ dayLimit: 90, eventDayLimit: 40, sentToday: 3, eventSentToday: 0, remainingToday: 40, ...o });

async function mockEvent(page: Page, state: { jobs: Record<string, unknown>[]; limits?: Record<string, unknown> }, captured: { created?: Record<string, unknown>; tests: number; cancelled: string[] }) {
  await signedIn(page, [ev]);
  await page.route(`${A}/events/e1/roster`, (r) => r.fulfill(json({ teams: [], people: [] })));
  await page.route(`${A}/events/e1/registration`, (r) => r.fulfill(json({ form: null, counts: { pending: 0, approved: 0, rejected: 0 } })));
  await page.route(`${A}/events/e1/members`, (r) => r.fulfill(json({ owner: null, members: [] })));
  await page.route(`${A}/events/e1/checkins**`, (r) => r.fulfill(json({ checkins: [], total: 0, checkedIn: 0 })));
  await page.route(`${A}/events/e1/reminders/recipients`, (r) => r.fulfill(json({ organisers: { count: 1, unsubscribed: 0 }, captains: { count: 3, unsubscribed: 1 }, limits: limits(state.limits), items: [{ kind: "organiser", email: "o***@example.com", unsubscribed: false }, { kind: "captain", email: "k***@gmail.com", unsubscribed: false }] })));
  await page.route(`${A}/events/e1/reminders/test`, async (r) => { captured.tests++; await r.fulfill(json({ ok: true, sentTo: "o***@example.com" })); });
  await page.route(`${A}/events/e1/reminders/*`, async (r) => {
    if (r.request().method() === "DELETE") { const id = r.request().url().split("/").pop()!; captured.cancelled.push(id); state.jobs = state.jobs.map((j) => (j.id === id ? { ...j, status: "cancelled" } : j)); await r.fulfill(json({ ok: true })); } else await r.fallback();
  });
  await page.route(`${A}/events/e1/reminders`, async (r) => {
    if (r.request().method() === "POST") {
      captured.created = r.request().postDataJSON();
      const job = { id: "j-new", kind: captured.created!.kind, subject: captured.created!.subject, body: captured.created!.body, audience: captured.created!.audience, sendAt: captured.created!.sendAt ?? new Date().toISOString(), status: "pending", recipientsSnapshotCount: 4, sentCount: 0, note: "", createdAt: "", sentAt: null };
      state.jobs = [job, ...state.jobs];
      await r.fulfill(json(job, 201));
    } else await r.fulfill(json({ jobs: state.jobs, limits: limits(state.limits), mailer: true }));
  });
}

test("an organiser picks a template, sees counts, sends a test, previews and schedules, then cancels", async ({ page }) => {
  const captured = { tests: 0, cancelled: [] as string[] } as { created?: Record<string, unknown>; tests: number; cancelled: string[] };
  const state = { jobs: [{ id: "j-old", kind: "results", subject: "Results are up for Spring Cup", body: "Thanks", audience: "both", sendAt: "2026-11-01T10:00:00Z", status: "sent", recipientsSnapshotCount: 4, sentCount: 4, note: "Sent to 4 people.", createdAt: "", sentAt: "2026-11-01T10:05:00Z" }] };
  await mockEvent(page, state, captured);
  await page.goto("/app/events/?id=e1");
  await openPanel(page, "settings", "reminders");
  const panel = page.getByRole("region", { name: "Email reminders" }).first();
  await expect(panel.getByTestId("limit-words")).toContainText("about 90 emails a day");
  await expect(panel.getByText("Sent to 4 people.")).toBeVisible();
  await expect(panel.getByText("Organisers (1)")).toBeVisible();
  await expect(panel.getByText("Captains who agreed to emails (3)")).toBeVisible();

  // step 1: template fills the words
  await panel.getByRole("button", { name: /Registration closes soon/ }).click();
  await expect(panel.getByLabel("Subject")).toHaveValue("Registration for Spring Cup closes soon");

  // step 2: test goes to the organiser only
  await panel.getByRole("button", { name: "Send me a test" }).click();
  await expect(panel.getByText(/test email was sent to o\*\*\*@example\.com/)).toBeVisible();
  expect(captured.tests).toBe(1);

  // choose a time: the local time is shown
  await panel.getByRole("radio", { name: /date and time/i }).check(); // the default is to send now
  // a time five days from now, in the browser's own clock (the app only accepts the next 90 days)
  const soon = new Date(Date.now() + 5 * 86_400_000);
  const pad = (n: number) => String(n).padStart(2, "0");
  await panel.locator('input[type="datetime-local"]').fill(`${soon.getFullYear()}-${pad(soon.getMonth() + 1)}-${pad(soon.getDate())}T09:30`);
  await expect(panel.getByText(/your local time/)).toBeVisible();

  // step 3: nothing is sent until confirmed
  await expect(panel.getByLabel("Email preview")).toContainText("Unsubscribe from this event");
  await panel.getByRole("button", { name: "Review and schedule" }).click();
  expect(captured.created).toBeUndefined();
  await expect(panel.getByText(/This will email 4 people/)).toBeVisible();
  await panel.getByRole("button", { name: "Yes, schedule it" }).click();
  await expect(panel.getByText(/Done\. It is scheduled for/)).toBeVisible();
  expect(captured.created).toMatchObject({ kind: "closing", audience: "both", subject: "Registration for Spring Cup closes soon" });
  const sentFor = new Date(captured.created!.sendAt as string).getTime();
  expect(Math.abs(sentFor - soon.getTime())).toBeLessThan(86_400_000); // the day we picked (the exact hour depends on the time zone)

  // the list shows it, and cancelling is confirmed
  const item = panel.getByRole("listitem").filter({ hasText: "Registration for Spring Cup closes soon" });
  await expect(item.getByText(/Waiting to be sent/)).toBeVisible();
  await item.getByRole("button", { name: "Cancel this reminder" }).click();
  await item.getByRole("button", { name: "Yes, cancel it" }).click();
  await expect(panel.getByText("Cancelled. Nothing was sent.")).toBeVisible();
  expect(captured.cancelled).toEqual(["j-new"]);
});

test("the panel explains a reached daily limit and a refused schedule in plain words", async ({ page }) => {
  const captured = { tests: 0, cancelled: [] as string[] } as { created?: Record<string, unknown>; tests: number; cancelled: string[] };
  await mockEvent(page, { jobs: [], limits: { sentToday: 90, remainingToday: 0 } }, captured);
  await page.route(`${A}/events/e1/reminders`, (r) => (r.request().method() === "POST" ? r.fulfill(json({ error: "Nobody would get this yet." }, 400)) : r.fulfill(json({ jobs: [], limits: limits({ sentToday: 90, remainingToday: 0 }), mailer: true }))));
  await page.goto("/app/events/?id=e1");
  await openPanel(page, "settings", "reminders");
  const panel = page.getByRole("region", { name: "Email reminders" }).first();
  await expect(panel.getByTestId("limit-words")).toContainText("Today's limit has been reached");
  await expect(panel.getByText("Nothing yet. Pick a message in step 1 and schedule it.")).toBeVisible();
  await panel.getByRole("radio", { name: /Send now/ }).check();
  await panel.getByRole("button", { name: "Review and send" }).click();
  await panel.getByRole("button", { name: "Yes, schedule it" }).click();
  await expect(panel.getByRole("alert").filter({ hasText: /\S/ })).toContainText("Nobody would get this yet.");
});

test("the unsubscribe page asks once, changes nothing on open, and confirms", async ({ page }) => {
  await preflight(page);
  let posted = 0;
  await page.route(`${A}/public/unsubscribe/tok`, async (r) => {
    if (r.request().method() === "POST") { posted++; await r.fulfill(json({ ok: true, event: "Spring Cup", email: "k***@gmail.com", unsubscribed: true })); }
    else await r.fulfill(json({ event: "Spring Cup", email: "k***@gmail.com", unsubscribed: false }));
  });
  await page.goto("/unsubscribe/?t=tok");
  await expect(page.getByText(/Stop emails about/)).toBeVisible();
  expect(posted).toBe(0);
  await page.getByRole("button", { name: "Yes, unsubscribe me" }).click();
  await expect(page.getByRole("status").filter({ hasText: /\S/ })).toContainText("You will not get any more emails about");
  expect(posted).toBe(1);
  expect((await page.evaluate(() => document.querySelector('meta[name="robots"]')?.getAttribute("content"))) ?? "").toContain("noindex");
});

test("the unsubscribe page handles a missing or unknown link", async ({ page }) => {
  await preflight(page);
  await page.route(`${A}/public/unsubscribe/gone`, (r) => r.fulfill(json({ error: "Not found" }, 404)));
  await page.goto("/unsubscribe/");
  await expect(page.getByRole("alert").filter({ hasText: /\S/ })).toContainText("needs the link from the email");
  await page.goto("/unsubscribe/?t=gone");
  await expect(page.getByRole("alert").filter({ hasText: /\S/ })).toContainText("not valid");
});

test("the registration form has an optional email with a consent box, sent only when ticked", async ({ page }) => {
  await preflight(page);
  await page.route(`${A}/public/registration/tok`, (r) => r.fulfill(json({ event: { name: "Spring Cup", date: "2026-12-01", venue: "Pune" }, form: { title: "Spring Cup registration", intro: "", teamSize: 2, subs: 0, closesAt: null, spotsLeft: 5, status: "open" } })));
  let sent: Record<string, unknown> | null = null;
  await page.route(`${A}/public/registration/tok/submit`, async (r) => { sent = r.request().postDataJSON(); await r.fulfill(json({ ok: true }, 201)); });
  await page.goto("/register/?t=tok");
  await page.getByLabel("Team name").fill("Konkan Kings");
  await page.getByLabel(/Captain.s name/).fill("Asha Captain");
  await page.getByLabel(/Captain.s phone or email/).fill("9999900000");
  await page.getByLabel(/Player 1, full name/).fill("Aarav Mehta");
  await page.getByLabel(/Player 2, full name/).fill("Diya Kulkarni");
  const consent = page.getByRole("checkbox", { name: /Email me updates about this event/ });
  await expect(consent).toBeDisabled();
  await page.getByLabel("Email me updates about this event", { exact: true }).fill("asha@example.com");
  await page.getByRole("button", { name: "Register my team" }).click();
  await expect(page.getByRole("alert").filter({ hasText: /\S/ })).toContainText("Tick the box");
  await consent.check();
  await page.getByRole("button", { name: "Register my team" }).click();
  await expect(page.getByText("Registered. Thank you.")).toBeVisible();
  expect(sent).toMatchObject({ captainEmail: "asha@example.com", emailConsent: true });
  expect(String((sent as unknown as Record<string, unknown>).emailConsentText)).toContain("unsubscribe");
});
