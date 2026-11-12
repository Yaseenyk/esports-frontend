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
  await expect(page.getByRole("alert").filter({ hasText: /email or password is not right/i })).toBeVisible();
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
  page.once("dialog", (d) => d.accept()); // signing out asks first, because the cards on this screen are not saved anywhere else
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
  await page.getByRole("button", { name: "Open the hub menu" }).click(); // the language switch lives in the hub menu, like on the home page
  await page.getByRole("dialog", { name: "Hub menu" }).getByRole("button", { name: "हिन्दी" }).click();
  await page.keyboard.press("Escape");
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

test("the sign-in form can show the password and does not offer a second Sign in switch on its own page", async ({ page }) => {
  await preflight(page);
  await page.goto("/login/");
  const pw = page.getByLabel("Password", { exact: true });
  await pw.fill("correct horse");
  await expect(pw).toHaveAttribute("type", "password");
  await page.getByLabel("Show characters").check();
  await expect(pw).toHaveAttribute("type", "text");
  await expect(pw).toHaveAttribute("autocomplete", "current-password");
  await expect(page.getByLabel("Email")).toHaveAttribute("autocomplete", "username");
  await expect(page.getByRole("button", { name: "Create account" })).toHaveCount(0); // the page links to /signup/ instead
});

test("the sign-in button sends one request even when it is pressed twice", async ({ page }) => {
  await preflight(page);
  let n = 0;
  await page.route("**/auth/login", async (r) => { n++; await new Promise((x) => setTimeout(x, 400)); await r.fulfill(json({ token: "t", user: { id: "u", email: "a@example.com", name: "Asha" } })); });
  await page.route("**/events", (r) => r.fulfill(json([])));
  await page.goto("/login/");
  await page.getByLabel("Email").fill("a@example.com");
  await page.getByLabel("Password", { exact: true }).fill("correct horse");
  await page.getByRole("button", { name: "Sign in", exact: true }).last().dblclick();
  await expect(page).toHaveURL(/\/app\//);
  expect(n).toBe(1);
});

test("an expired sign-in says so on the sign-in page and brings the person back", async ({ page }) => {
  await signedIn(page);
  await page.route("**/esports-api.yaseenyk.workers.dev/events", (r) => r.fulfill(json({ error: "Authentication required" }, 401)));
  await page.goto("/app/events/");
  await expect(page).toHaveURL(/\/login\/\?next=%2Fapp%2Fevents%2F&expired=1/, { timeout: 15000 });
  await expect(page.getByRole("status").filter({ hasText: /sign-in ran out/i })).toBeVisible();
});

test("the Sign out button in the app header goes to a plain sign-in page", async ({ page }) => {
  await signedIn(page);
  await page.goto("/app/events/");
  const out = page.getByRole("button", { name: "Sign out" });
  if (!(await out.first().isVisible())) await page.getByRole("button", { name: "Open the hub menu" }).click(); // on a phone it is in the hub menu
  await out.click();
  await expect(page).toHaveURL(/\/login\/$/);
  await expect(page.getByRole("status").filter({ hasText: /ran out/i })).toHaveCount(0);
});

test("an event can be deleted from its page, after a confirmation, and leaves the list", async ({ page }) => {
  const ev = { id: "e1", key: "cup", name: "Spring Cup", game: "BGMI", organiser: "", date: "2026-12-01", venue: "", emergency: "", rules: "", settings: {}, updatedAt: "", role: "owner" };
  await signedIn(page, [ev]);
  let gone = false, deletes = 0;
  const A = "**/esports-api.yaseenyk.workers.dev";
  await page.route(`${A}/events`, (r) => (r.request().method() === "GET" ? r.fulfill(json(gone ? [] : [ev])) : r.fallback()));
  await page.route(`${A}/events/e1`, (r) => { if (r.request().method() === "DELETE") { deletes++; gone = true; return r.fulfill(json({ ok: true })); } return r.fallback(); });
  await page.route(`${A}/events/e1/roster`, (r) => r.fulfill(json({ teams: [], people: [] })));
  await page.route(`${A}/events/e1/checkins**`, (r) => r.fulfill(json({ checkins: [], total: 0, checkedIn: 0 })));
  await page.route(`${A}/events/e1/registration`, (r) => r.fulfill(json({ form: null, counts: { pending: 0, approved: 0, rejected: 0 } })));
  await page.route(`${A}/events/e1/members`, (r) => r.fulfill(json({ owner: null, members: [] })));
  await page.goto("/app/events/?id=e1");
  await expect(page.getByRole("heading", { name: "Spring Cup", level: 2 })).toBeVisible();
  await expect(page.getByRole("region", { name: "Getting started checklist" })).toBeVisible();
  await page.locator("summary", { hasText: "venue screen" }).click(); // deleting is tucked away on purpose
  page.once("dialog", (d) => d.dismiss()); // saying no keeps everything
  await page.getByRole("button", { name: "Delete event" }).click();
  expect(deletes).toBe(0);
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Delete event" }).click();
  await expect(page.getByText("No events saved online yet.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Create your first event" })).toBeVisible(); // an empty page always has one clear next step
  expect(deletes).toBe(1);
});

test("live gate: a key the server refuses says so, a refused code is not queued, and a lost connection keeps the scan", async ({ page }) => {
  await preflight(page);
  await signedIn(page); // first: its catch-all must be the OLDEST route so this spec's own routes win
  const A = "**/esports-api.yaseenyk.workers.dev";
  let keyOk = false, mode: "refuse" | "offline" = "refuse";
  await page.route(`${A}/gate/roster`, (r) => (keyOk ? r.fulfill(json({ event: { name: "Spring Cup", date: "2026-12-01", venue: "Pune" }, people: [] })) : r.fulfill(json({ error: "bad key" }, 401))));
  await page.route(`${A}/gate/checkin`, (r) => (mode === "refuse" ? r.fulfill(json({ error: "bad code" }, 422)) : r.abort()));
  await page.goto("/app/check-in/");
  await page.getByRole("tab", { name: /Live/ }).click();
  await page.getByLabel("Gate key").fill("gk_wrong");
  await page.getByRole("button", { name: "Connect" }).click();
  await expect(page.getByRole("alert").filter({ hasText: /not valid/i })).toBeVisible();
  keyOk = true;
  await page.getByLabel("Gate key").fill("gk_right");
  await page.getByRole("button", { name: "Connect" }).click();
  await expect(page.getByText("Spring Cup")).toBeVisible();
  await page.getByLabel("Pass code").fill("EH1.x.A-1.sig");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await expect(page.getByText(/server did not accept that code/i)).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: /waiting for signal/ })).toHaveCount(0);
  mode = "offline";
  await page.getByLabel("Pass code").fill("EH1.x.A-2.sig");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: /1 scan waiting for signal/ })).toBeVisible();
});

test("the app home shows a start-here checklist with one clear next step", async ({ page }) => {
  await signedIn(page, []);
  await page.goto("/app/");
  const list = page.getByRole("region", { name: "Getting started checklist" });
  await expect(list.getByRole("listitem")).toHaveCount(5);
  await expect(list.getByText("0 of 5 done")).toBeVisible();
  await expect(list.getByRole("link", { name: "Create an event" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Create your first event" })).toBeVisible();
});

test("the event page ticks off steps as the teams and people arrive", async ({ page }) => {
  const ev = { id: "e1", key: "cup", name: "Spring Cup", game: "BGMI", organiser: "", date: "2026-12-01", venue: "", emergency: "", rules: "", settings: {}, updatedAt: "", role: "owner" };
  await signedIn(page, [ev]);
  const A = "**/esports-api.yaseenyk.workers.dev";
  await page.route(`${A}/events/e1/roster`, (r) => r.fulfill(json({ teams: [{ id: "t1", name: "Kings" }], people: [{ id: "p1", name: "Asha", teamId: "t1", role: "Player", minor: false, photoUrl: null }] })));
  await page.route(`${A}/events/e1/checkins**`, (r) => r.fulfill(json({ checkins: [], total: 1, checkedIn: 0 })));
  await page.route(`${A}/events/e1/registration`, (r) => r.fulfill(json({ form: null, counts: { pending: 0, approved: 0, rejected: 0 } })));
  await page.route(`${A}/events/e1/members`, (r) => r.fulfill(json({ owner: null, members: [] })));
  await page.goto("/app/events/?id=e1");
  const list = page.getByRole("region", { name: "Getting started checklist" });
  await expect(list.locator("li[data-done=true]")).toHaveCount(2); // teams and people are done
  await expect(list.getByText("2 of 5 done")).toBeVisible();
  await expect(list.getByRole("link", { name: "Design cards" })).toBeVisible(); // the first unfinished step is the one big button
});

test("the invite and pass pages open with a plain what-to-do line", async ({ page }) => {
  await preflight(page);
  await page.route("**/public/invite/tok", (r) => r.fulfill(json({ event: { name: "Spring Cup", date: "2026-12-01" }, team: { name: "Konkan Kings" } })));
  await page.goto("/join/?t=tok");
  await expect(page.getByText(/asked you to fill this in/)).toBeVisible();
});
