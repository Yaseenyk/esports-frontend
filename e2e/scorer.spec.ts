// Scorer mode: the public scoring page (steppers, confirm sheet, undo, offline queue, battle royale) and the organiser panel. The server is mocked.
import { expect, test, type Page, type Route } from "@playwright/test";
import { json, openPanel, preflight, signedIn } from "./helpers";

const API = "**/esports-api.yaseenyk.workers.dev";
const TOKEN = "tokentokentokentokentoken12";
const match = (o: Record<string, unknown>) => ({ id: "m1", stage: "main", round: 1, slot: 1, a: "Alpha", b: "Beta", status: "scheduled", scoreA: null, scoreB: null, startsAt: null, winner: null, ...o });
const view = (over: Record<string, unknown> = {}) => ({
  event: { name: "Spring Cup" }, label: "Lobby A referee", stage: null, expiresAt: "2099-01-01T10:00:00Z",
  matches: [match({}), match({ id: "m2", slot: 2, a: "Gamma", b: "Delta" })],
  battleRoyale: { allowed: true, teams: ["Alpha", "Beta", "Gamma"], rows: [] },
  ...over,
});

/** The server side of one link. `fail` makes every save look like a dead connection. */
async function mockScore(page: Page, v = view()) {
  const st = { posts: [] as { path: string; body: any }[], fail: false, view: v };
  await preflight(page);
  await page.route(`${API}/public/score/${TOKEN}**`, async (r: Route) => {
    const req = r.request();
    const path = new URL(req.url()).pathname;
    if (req.method() === "GET") return r.fulfill(json(st.view));
    if (st.fail) return r.abort("failed");
    const body = req.postDataJSON();
    st.posts.push({ path, body });
    if (path.endsWith("/br")) return r.fulfill(json({ ok: true, saved: body.rows.length, rows: body.rows.map((x: any) => ({ matchNo: body.matchNo, ...x })) }));
    const id = path.split("/").slice(-2)[0]!;
    const m = st.view.matches.find((x: any) => x.id === id) as any;
    Object.assign(m, body.status === "live" && body.undo ? { status: "live", scoreA: null, scoreB: null } : { status: body.status, scoreA: body.scoreA ?? null, scoreB: body.scoreB ?? null, winner: body.winner ?? null });
    return r.fulfill(json({ match: m, changed: [], correction: false, previous: null, downstreamReset: false }));
  });
  return st;
}

test("a referee steps the score, confirms in a sheet, saves, and can undo", async ({ page }) => {
  const st = await mockScore(page);
  await page.goto(`/score/?t=${TOKEN}`);
  await expect(page.getByRole("heading", { level: 1, name: "Spring Cup" })).toBeVisible();
  await expect(page.getByText(/Lobby A referee/).first()).toBeVisible();
  const card = page.getByRole("article", { name: "Alpha against Beta" });
  await card.getByRole("button", { name: "Add one point to Alpha" }).click();
  await card.getByRole("button", { name: "Add one point to Alpha" }).click();
  await card.getByRole("button", { name: "Add one point to Beta" }).click();
  await expect(card.getByLabel("Alpha score")).toHaveValue("2");
  await card.getByRole("button", { name: "Finish match" }).click();
  const sheet = page.getByRole("dialog");
  await expect(sheet.getByRole("heading", { name: "Alpha 2, Beta 1: save?" })).toBeVisible();
  expect(st.posts).toHaveLength(0); // nothing is sent before the confirm
  await sheet.getByRole("button", { name: "Go back" }).click();
  await expect(sheet).toBeHidden();
  expect(st.posts).toHaveLength(0);
  await card.getByRole("button", { name: "Finish match" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Save result" }).click();
  await expect.poll(() => st.posts.length).toBe(1);
  expect(st.posts[0]!.path).toMatch(/\/matches\/m1\/result$/);
  expect(st.posts[0]!.body).toEqual({ status: "finished", scoreA: 2, scoreB: 1 });
  await expect(page.getByText(/You can undo for/)).toBeVisible();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect.poll(() => st.posts.length).toBe(2);
  expect(st.posts[1]!.body).toEqual({ status: "live", undo: true, scoreA: null, scoreB: null });
});

test("a forfeit is under More options and asks first", async ({ page }) => {
  const st = await mockScore(page);
  await page.goto(`/score/?t=${TOKEN}`);
  const card = page.getByRole("article", { name: "Gamma against Delta" });
  await card.getByText("More options").click();
  await card.getByRole("button", { name: "Gamma wins by forfeit" }).click();
  await expect(page.getByRole("dialog").getByRole("heading", { name: "Delta forfeits. Gamma wins?" })).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "Yes, Gamma wins" }).click();
  await expect.poll(() => st.posts.length).toBe(1);
  expect(st.posts[0]!.body).toEqual({ status: "forfeit", winner: "a" });
});

test("with no signal the result waits on the phone and goes out when the signal is back", async ({ page }) => {
  const st = await mockScore(page);
  st.fail = true;
  await page.goto(`/score/?t=${TOKEN}`);
  const card = page.getByRole("article", { name: "Alpha against Beta" });
  await card.getByRole("button", { name: "Add one point to Alpha" }).click();
  await card.getByRole("button", { name: "Finish match" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Save result" }).click();
  await expect(page.getByText(/1 result saved on this phone, will send when online/)).toBeVisible();
  await expect(card.getByText("Saved on this phone, will send when online.")).toBeVisible();
  await expect(card.getByText("Alpha 1, Beta 0")).toBeVisible(); // the referee sees their own work at once
  expect(st.posts).toHaveLength(0);
  // it survives a reload
  await page.reload();
  await expect(page.getByText(/1 result saved on this phone/)).toBeVisible();
  st.fail = false;
  await page.getByRole("button", { name: "Send now" }).click();
  await expect.poll(() => st.posts.length).toBe(1);
  expect(st.posts[0]!.body).toEqual({ status: "finished", scoreA: 1, scoreB: 0 });
  await expect(page.getByText(/saved on this phone, will send when online/)).toBeHidden();
});

test("battle royale: a duplicate placement is caught before anything is sent", async ({ page }) => {
  const st = await mockScore(page);
  await page.goto(`/score/?t=${TOKEN}`);
  await page.getByRole("tab", { name: "Battle royale" }).click();
  await expect(page.getByText("Match number").first()).toBeVisible();
  await page.getByLabel("Alpha placement").fill("1");
  await page.getByLabel("Alpha kills").fill("7");
  await page.getByLabel("Beta placement").fill("1");
  await page.getByRole("button", { name: "Save match 1" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "already used by Alpha" })).toBeVisible();
  await expect(page.getByRole("dialog")).toBeHidden();
  expect(st.posts).toHaveLength(0);
  await page.getByLabel("Beta placement").fill("2");
  await page.getByRole("button", { name: "Save match 1" }).click();
  await expect(page.getByRole("dialog").getByRole("heading", { name: "Match 1: 2 teams, save?" })).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "Save results" }).click();
  await expect.poll(() => st.posts.length).toBe(1);
  expect(st.posts[0]!.body).toEqual({ matchNo: 1, rows: [{ team: "Alpha", placement: 1, kills: 7 }, { team: "Beta", placement: 2, kills: 0 }] });
});

test("a dead or missing link says so in plain words and shows no site footer", async ({ page }) => {
  await preflight(page);
  await page.route(`${API}/public/score/**`, (r) => r.fulfill(json({ error: "gone" }, 404)));
  await page.goto(`/score/?t=${TOKEN}`);
  await expect(page.getByRole("heading", { name: "This scoring link does not work" })).toBeVisible();
  await expect(page.locator("footer.no-print")).toBeHidden();
  await page.goto("/score/");
  await expect(page.getByRole("heading", { name: "This scoring link does not work" })).toBeVisible();
  expect((await page.evaluate(() => document.querySelector('meta[name="robots"]')?.getAttribute("content"))) ?? "").toContain("noindex");
});

test("an empty link explains what to do", async ({ page }) => {
  await mockScore(page, view({ matches: [], battleRoyale: { allowed: false, teams: [], rows: [] } }));
  await page.goto(`/score/?t=${TOKEN}`);
  await expect(page.getByRole("heading", { name: "No matches here yet" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Check again" })).toBeVisible();
});

const EVENT = { id: "e1", key: "cup", name: "Spring Cup", game: "BGMI", organiser: "", date: "2026-12-01", venue: "", emergency: "", rules: "", settings: {}, updatedAt: "", role: "owner" };

test("the panel makes a link in two steps, shows it once, and switches it off after asking", async ({ page }) => {
  await signedIn(page, [EVENT]);
  const links: any[] = [];
  const made: any[] = [];
  await page.route(`${API}/events/e1/**`, async (r: Route) => {
    const req = r.request();
    const path = new URL(req.url()).pathname;
    if (path.endsWith("/scorer-links") && req.method() === "GET") return r.fulfill(json({ links }));
    if (path.endsWith("/scorer-links") && req.method() === "POST") {
      const b = req.postDataJSON(); made.push(b);
      const link = { id: "l1", label: b.label, stage: b.stage ?? null, expiresAt: new Date(Date.now() + b.hours * 3600_000).toISOString(), revokedAt: null, createdAt: new Date().toISOString(), state: "active" };
      links.unshift(link);
      return r.fulfill(json({ link, token: "newtokennewtokennewtoken1234" }, 201));
    }
    if (path.endsWith("/scorer-links/l1") && req.method() === "DELETE") { links[0].state = "revoked"; links[0].revokedAt = "now"; return r.fulfill(json({ ok: true })); }
    if (path.endsWith("/matches")) return r.fulfill(json({ matches: [], br: [] }));
    if (path.endsWith("/roster")) return r.fulfill(json({ teams: [], people: [] }));
    return r.fulfill(json({ error: "not_found" }, 404));
  });
  await page.route(`${API}/events/e1`, (r) => r.fulfill(json(EVENT)));
  await page.goto("/app/events/?id=e1");
  await openPanel(page, "run", "scorer");
  const panel = page.getByRole("region", { name: "Scorer links", exact: true });
  await expect(panel.getByText("No links yet. Use step 1 to make the first one.")).toBeVisible();
  await expect(panel.getByText(/They cannot:/)).toBeVisible();
  await panel.getByRole("button", { name: "Make the link" }).click();
  await expect(panel.getByRole("alert").filter({ hasText: /\S/ })).toContainText("Give the link a name");
  await panel.getByLabel("Name of the link").fill("Lobby A referee");
  await panel.getByRole("button", { name: "Make the link" }).click();
  await expect(panel.getByTestId("scorer-url")).toContainText("/score/?t=newtokennewtokennewtoken1234");
  expect(made[0]).toEqual({ label: "Lobby A referee", stage: null, hours: 12 });
  await expect(panel.getByRole("img", { name: /QR code/ })).toBeVisible();
  await expect(panel.getByRole("link", { name: "Send on WhatsApp" })).toHaveAttribute("href", /^https:\/\/wa\.me\/\?text=/);
  await expect(panel.getByRole("button", { name: "Copy the link" })).toBeVisible();
  await expect(panel.getByText(/1 working/)).toBeVisible();
  await panel.getByRole("button", { name: "Switch off the link Lobby A referee" }).click();
  await panel.getByRole("button", { name: "No" }).click();
  await expect(panel.getByText(/1 working/)).toBeVisible();
  await panel.getByRole("button", { name: "Switch off the link Lobby A referee" }).click();
  await panel.getByRole("button", { name: "Yes, switch off" }).click();
  await expect(panel.getByText("Revoked")).toBeVisible();
  await expect(panel.getByTestId("scorer-url")).toBeHidden();
});
