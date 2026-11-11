// The run-of-show panel and the volunteer page, with the server mocked so nothing real is touched.
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { json, openPanel, preflight, signedIn } from "./helpers";

const API = "**/esports-api.yaseenyk.workers.dev";
const TOKEN = "abcDEF123_-abcDEF123456";

type Item = { id: string; atTime: string; dayOffset: number; title: string; ownerName: string; status: string; notes: string };
const item = (id: string, atTime: string, title: string, ownerName = "", status = "todo", notes = ""): Item => ({ id, atTime, dayOffset: 0, title, ownerName, status, notes });

async function organiser(page: Page, start: Item[]) {
  await signedIn(page, [{ id: "e1", name: "Spring Cup", date: "2026-12-01", role: "owner" }]);
  const st = { items: start, link: null as null | { active: boolean; showNotes: boolean; createdAt: string }, puts: 0, statuses: [] as string[] };
  await page.route(`${API}/events/e1/runofshow**`, async (r) => {
    const req = r.request(), url = req.url(), m = req.method();
    if (m === "PUT") { st.puts++; const b = req.postDataJSON() as { items: Item[] }; st.items = b.items.map((i, k) => ({ ...i, id: i.id.startsWith("srv") ? i.id : `srv${k}` })); return r.fulfill(json({ items: st.items, link: st.link })); }
    if (m === "POST" && url.endsWith("/status")) { const b = req.postDataJSON() as { status: string }; const id = url.split("/").slice(-2)[0]!; st.statuses.push(`${id}:${b.status}`); st.items = st.items.map((i) => (i.id === id ? { ...i, status: b.status } : i)); return r.fulfill(json({ item: st.items.find((i) => i.id === id) })); }
    if (m === "POST" && url.endsWith("/link")) { st.link = { active: true, showNotes: false, createdAt: "2026-12-01T08:00:00Z" }; return r.fulfill(json({ token: TOKEN, showNotes: false, createdAt: "2026-12-01T08:00:00Z" }, 201)); }
    if (m === "DELETE") { st.link = null; return r.fulfill(json({ ok: true })); }
    return r.fulfill(json({ items: st.items, link: st.link }));
  });
  await page.goto("/app/events/?id=e1");
  await openPanel(page, "run", "runofshow");
  return st;
}

test("an empty run of show offers templates, saves an edited timeline and makes a volunteer link", async ({ page }) => {
  const st = await organiser(page, []);
  const panel = page.getByRole("region", { name: "Run of show" });
  await expect(panel.getByRole("heading", { name: "Start from a template" })).toBeVisible();
  await expect(panel.getByText("Nothing here yet.")).toBeVisible();
  await panel.getByRole("button", { name: /Gaming cafe league night/ }).click();
  await expect(panel.getByText(/Template added/)).toBeVisible();
  await expect(panel.getByLabel("Time of Doors open")).toHaveValue("17:00");
  // edit one item: owner and a note, then save
  await panel.getByLabel("Owner of Doors open").fill("Asha");
  await panel.getByLabel("Notes for Doors open").fill("Gate 2");
  await panel.getByRole("button", { name: "Save the timeline" }).click();
  await expect(panel.getByText(/^Saved\./)).toBeVisible();
  expect(st.puts).toBe(1);
  expect(st.items.find((i) => i.title === "Doors open")).toMatchObject({ ownerName: "Asha", notes: "Gate 2" });
  // step 3
  page.on("dialog", (d) => void d.accept());
  await panel.getByRole("button", { name: "Make a volunteer link" }).click();
  await expect(panel.getByLabel("Volunteer link").first()).toContainText(`/run/?t=${TOKEN}`);
  await expect(panel.getByRole("img", { name: "QR code for the volunteer link" })).toBeVisible();
  await panel.getByRole("button", { name: "Stop the link" }).click();
  await expect(panel.getByText("The volunteer link has been stopped.")).toBeVisible();
});

test("move, delete with undo, shift everything and an incomplete item is refused", async ({ page }) => {
  await organiser(page, [item("srv1", "09:00", "Doors open"), item("srv2", "10:00", "Briefing")]);
  const panel = page.getByRole("region", { name: "Run of show" });
  await panel.getByRole("button", { name: "Move Briefing up" }).click();
  await expect(panel.getByLabel(/^What happens at item 1/)).toHaveValue("Briefing");
  await panel.getByRole("button", { name: "Delete Briefing" }).click();
  await expect(panel.getByText(/Removed "Briefing"/)).toBeVisible();
  await panel.getByRole("button", { name: "Undo" }).click();
  await expect(panel.getByLabel(/^What happens at item 1/)).toHaveValue("Briefing");
  await panel.getByText("More options").click();
  await panel.getByLabel("Minutes").fill("30");
  await panel.getByRole("button", { name: "Move everything later" }).click();
  await expect(panel.getByLabel("Time of Doors open")).toHaveValue("09:30");
  await expect(panel.getByLabel("Time of Briefing")).toHaveValue("10:30");
  await panel.getByRole("button", { name: "Add an item" }).click();
  await panel.getByRole("button", { name: "Save the timeline" }).click();
  await expect(panel.getByText("Item 3 needs a title.")).toBeVisible();
});

test("a status tap saves straight away", async ({ page }) => {
  const st = await organiser(page, [item("srv1", "09:00", "Doors open", "Asha")]);
  const panel = page.getByRole("region", { name: "Run of show" });
  await panel.getByRole("group", { name: "Status of Doors open" }).getByRole("button", { name: "Done" }).click();
  await expect(panel.getByText(/Marked "Doors open" as done/)).toBeVisible();
  expect(st.statuses).toEqual(["srv1:done"]);
  await expect(panel.getByRole("button", { name: "Save the timeline" })).toBeDisabled();
});

const publicBody = (items: Record<string, unknown>[], showNotes = false) => ({ event: { name: "Spring Cup", date: "2026-12-01", venue: "City Arena" }, items, showNotes });
const pub = (id: string, atTime: string, title: string, ownerName: string, status = "todo", extra: Record<string, unknown> = {}) => ({ id, atTime, dayOffset: 0, title, ownerName, status, ...extra });

test("the volunteer page highlights now and next and filters to my items, remembering the name", async ({ page }) => {
  await preflight(page);
  await page.clock.install({ time: new Date(2026, 11, 1, 10, 20) });
  const items = [pub("a", "09:00", "Doors open", "Asha", "done"), pub("b", "10:00", "Captains briefing", "Ravi", "doing", { notes: "Bring the rule sheet" }), pub("c", "11:00", "Matches start", "Asha"), pub("d", "13:00", "Lunch", "Mira")];
  await page.route(`${API}/public/run/*`, (r) => r.fulfill(json(publicBody(items, true))));
  await page.goto(`/run/?t=${TOKEN}`);
  await expect(page.getByRole("heading", { level: 1, name: "Spring Cup" })).toBeVisible();
  await expect(page.getByRole("note").filter({ hasText: "Now" })).toContainText("Captains briefing");
  await expect(page.getByRole("note").filter({ hasText: "Next" })).toContainText("Matches start");
  await expect(page.getByRole("note").filter({ hasText: "Next" })).toContainText("in 40 min");
  await expect(page.getByText("Bring the rule sheet").first()).toBeVisible();
  await expect(page.getByText("1 of 4 done")).toBeVisible();
  await page.getByLabel("Show only my items").selectOption("Asha");
  await expect(page.getByText("Lunch")).toHaveCount(0);
  await expect(page.getByText("Matches start").first()).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Show only my items")).toHaveValue("Asha");
  await expect(page.getByText("Showing only my items")).toBeVisible();
  expect((await page.evaluate(() => document.querySelector('meta[name="robots"]')?.getAttribute("content"))) ?? "").toContain("noindex");
});

test("the volunteer page updates by itself", async ({ page }) => {
  await preflight(page);
  await page.clock.install({ time: new Date(2026, 11, 1, 10, 20) });
  let n = 0;
  await page.route(`${API}/public/run/*`, (r) => r.fulfill(json(publicBody([pub("a", "10:00", "Briefing", "Ravi", n++ === 0 ? "todo" : "done")]))));
  await page.goto(`/run/?t=${TOKEN}`);
  await expect(page.getByText("To do").first()).toBeVisible();
  await page.clock.runFor(8_000); // the page asks again after about 15 seconds; small steps, because one big jump would also fire the request timeout and cancel the fetch
  await page.waitForTimeout(300);
  await page.clock.runFor(8_000);
  await expect(page.getByText("1 of 1 done")).toBeVisible(); // the status changed to done on the server
});

test("a stopped or wrong link says so plainly", async ({ page }) => {
  await preflight(page);
  await page.route(`${API}/public/run/*`, (r) => r.fulfill(json({ error: "not_found" }, 404)));
  await page.goto(`/run/?t=${TOKEN}`);
  await expect(page.getByRole("heading", { name: "This link is not working" })).toBeVisible();
  await page.goto("/run/");
  await expect(page.getByRole("heading", { name: "This link is not working" })).toBeVisible();
});

test("the volunteer page passes the accessibility check", async ({ page }) => {
  await preflight(page);
  await page.route(`${API}/public/run/*`, (r) => r.fulfill(json(publicBody([pub("a", "09:00", "Doors open", "Asha"), pub("b", "10:00", "Briefing", "Ravi", "done")]))));
  await page.goto(`/run/?t=${TOKEN}`);
  await expect(page.getByText("Doors open").first()).toBeVisible();
  await page.waitForLoadState("networkidle");
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  const bad = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
});
