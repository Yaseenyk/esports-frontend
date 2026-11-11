// "Run this event again": the two-step dialog, with the server mocked so nothing real is touched.
import { expect, test, type Page } from "@playwright/test";
import { json, signedIn } from "./helpers";

const A = "**/esports-api.yaseenyk.workers.dev";
const ev = (role: string) => ({ id: "e1", key: "cup", name: "Spring Cup", game: "BGMI", organiser: "", date: "2026-12-01", venue: "", emergency: "", rules: "", settings: {}, updatedAt: "", role });

async function open(page: Page, role = "owner", dupe: (body: any) => { status: number; body: unknown } = () => ({ status: 201, body: { ...ev("owner"), id: "e2", name: "x" } })) {
  await signedIn(page, [ev(role)]);
  const bodies: any[] = [];
  await page.route(`${A}/events`, (r) => (r.request().method() === "GET" ? r.fulfill(json([ev(role)])) : r.fallback()));
  await page.route(`${A}/events/e1/roster`, (r) => r.fulfill(json({ teams: [], people: [] })));
  await page.route(`${A}/events/e1/checkins**`, (r) => r.fulfill(json({ checkins: [], total: 0, checkedIn: 0 })));
  await page.route(`${A}/events/e1/registration`, (r) => r.fulfill(json({ form: null, counts: { pending: 0, approved: 0, rejected: 0 } })));
  await page.route(`${A}/events/e1/members`, (r) => r.fulfill(json({ owner: null, members: [] })));
  await page.route(`${A}/events/e1/duplicate`, (r) => {
    const b = r.request().postDataJSON();
    bodies.push(b);
    const out = dupe(b);
    return r.fulfill(json(out.body, out.status));
  });
  await page.goto("/app/events/?id=e1");
  await page.getByRole("button", { name: "Run this event again" }).click();
  await expect(page.getByRole("dialog", { name: "Run this event again" })).toBeVisible();
  return bodies;
}

test("step 1 prefills the name, 'Same time next week' adds 7 days, step 2 has safe defaults and the people warning", async ({ page }) => {
  await open(page);
  const d = page.getByRole("dialog");
  await expect(d.getByLabel("Name of the new event")).toHaveValue("Spring Cup (copy)");
  await expect(d.getByLabel("Date")).toHaveValue("2026-12-01");
  await d.getByRole("button", { name: "Same time next week" }).click();
  await expect(d.getByLabel("Date")).toHaveValue("2026-12-08");
  await d.getByRole("button", { name: /Next: what to bring over/ }).click();
  await expect(d.getByRole("heading", { name: /Step 2: What to bring over/ })).toBeVisible();
  for (const [label, on] of [["Teams", true], ["People", false], ["Registration form text", true], ["Sponsors and ticker", true], ["Structure of matches", true], ["Editors and viewers", false]] as const) {
    const box = d.getByRole("checkbox", { name: new RegExp(`^${label}`) });
    if (on) await expect(box).toBeChecked(); else await expect(box).not.toBeChecked();
  }
  await expect(d.getByText("Names and teams only. Photos, birth dates, consent and passes are never copied.")).toBeVisible();
  await expect(d.getByRole("group", { name: "Summary" })).toContainText("Left behind: people, editors and viewers");
});

test("making the copy sends the choices, shows success and links to the new event; focus returns on close", async ({ page }) => {
  const bodies = await open(page, "owner", (b) => ({ status: 201, body: { ...ev("owner"), id: "e2", name: b.name } }));
  const d = page.getByRole("dialog");
  await d.getByLabel("Name of the new event").fill("Spring Cup week 2");
  await d.getByRole("button", { name: /Next: what to bring over/ }).click();
  await d.getByRole("checkbox", { name: /^People/ }).check();
  await d.getByRole("button", { name: "Make the new event" }).click();
  await expect(d.getByRole("status").filter({ hasText: "Created." })).toContainText("Spring Cup week 2");
  expect(bodies).toHaveLength(1);
  expect(bodies[0]).toEqual({ name: "Spring Cup week 2", date: "2026-12-01", include: { teams: true, people: true, registrationForm: true, liveExtras: true, directory: false, members: false, matches: true } });
  await expect(d.getByRole("link", { name: "Open the new event" })).toHaveAttribute("href", "/app/events/?id=e2");
  await d.getByRole("button", { name: "Stay here" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Run this event again" })).toBeFocused();
});

test("unticking Teams switches People off and disables it", async ({ page }) => {
  const bodies = await open(page);
  const d = page.getByRole("dialog");
  await d.getByRole("button", { name: /Next: what to bring over/ }).click();
  await d.getByRole("checkbox", { name: /^People/ }).check();
  await d.getByRole("checkbox", { name: /^Teams/ }).uncheck();
  await expect(d.getByRole("checkbox", { name: /^People/ })).toBeDisabled();
  await expect(d.getByRole("checkbox", { name: /^People/ })).not.toBeChecked();
  await d.getByRole("button", { name: "Make the new event" }).click();
  await expect(d.getByRole("status").filter({ hasText: "Created." })).toBeVisible();
  expect(bodies[0].include).toMatchObject({ teams: false, people: false });
});

test("an editor is not offered editors and viewers", async ({ page }) => {
  await open(page, "editor");
  const d = page.getByRole("dialog");
  await d.getByRole("button", { name: /Next: what to bring over/ }).click();
  await expect(d.getByRole("checkbox", { name: /^Editors and viewers/ })).toHaveCount(0);
});

test("an error is explained in plain words and the button can be pressed again", async ({ page }) => {
  let n = 0;
  await open(page, "owner", () => (++n === 1 ? { status: 429, body: { error: "Too many requests" } } : { status: 201, body: { ...ev("owner"), id: "e2", name: "Spring Cup (copy)" } }));
  const d = page.getByRole("dialog");
  await d.getByRole("button", { name: /Next: what to bring over/ }).click();
  await d.getByRole("button", { name: "Make the new event" }).click();
  await expect(d.getByRole("alert")).toContainText("Too many tries");
  await d.getByRole("button", { name: "Try again" }).click();
  await expect(d.getByText(/^Created\./)).toBeVisible();
});

test("the dialog traps focus, closes with Escape and gives focus back", async ({ page }) => {
  await open(page);
  const d = page.getByRole("dialog");
  await expect(d.getByLabel("Name of the new event")).toBeFocused();
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true);
  }
  await page.keyboard.press("Shift+Tab");
  expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Run this event again" })).toBeFocused();
});

test("an empty name cannot go on", async ({ page }) => {
  await open(page);
  const d = page.getByRole("dialog");
  await d.getByLabel("Name of the new event").fill("  ");
  await expect(d.getByRole("alert")).toContainText("Give the new event a name.");
  await expect(d.getByRole("button", { name: /Next: what to bring over/ })).toBeDisabled();
});
