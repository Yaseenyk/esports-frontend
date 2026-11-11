// The live page, the publish panel and "publish from a tool", with the server mocked so nothing real is touched.
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page, type Route } from "@playwright/test";
import zlib from "node:zlib";
import { json, openPanel, preflight, signedIn } from "./helpers";

const API = "**/esports-api.yaseenyk.workers.dev";
const table = (title: string, head: string[], rows: string[][]) => ({ v: "table", d: { title, head, rows } });

const VIEWS = [
  { kind: "standings", payload: table("Group stage standings", ["#", "Team", "Kills", "Total"], [["1", "Alpha", "10", "30"], ["2", "Bravo", "8", "25"]]) },
  { kind: "league", payload: table("League table", ["#", "Team", "P", "Pts"], [["1", "Charlie", "2", "6"], ["2", "Delta", "2", "3"]]) },
  { kind: "schedule", payload: { v: "schedule", d: { title: "Match day schedule", slots: [{ n: 1, start: "23:58", end: "23:59", label: "Alpha vs Bravo" }] } } },
  { kind: "bracket", payload: { v: "bracket", d: { title: "Knockout bracket", sections: [{ name: "", rounds: [{ name: "Semi final", matches: [{ a: "Charlie", b: "Delta" }] }] }] } } },
  { kind: "countdown", payload: { v: "countdown", d: { title: "Finals start in", at: "2099-01-01T10:00:00Z" } } },
];
const snapshot = (over: Record<string, unknown> = {}) => ({ views: VIEWS, announcements: [{ text: "Round 2 starts at 3 pm", at: "2026-12-01T09:30:00Z" }], sponsors: [{ name: "Acme Energy" }], ticker: ["Free parking at gate 2"], ...over });
const publicBody = (over: Record<string, unknown> = {}) => ({ event: { name: "Spring Cup", date: "2026-12-01", venue: "City Arena" }, snapshot: snapshot(over), updatedAt: "2026-12-01T09:30:00Z" });

const publicLive = (page: Page, body: () => unknown, status = () => 200) => page.route(`${API}/public/live/*`, (r) => r.fulfill(json(body(), status())));

test("the live page shows the event, announcements, every view in its own tab, sponsors and the ticker", async ({ page }) => {
  await preflight(page);
  await publicLive(page, () => publicBody());
  await page.goto("/live/?e=demo");
  await expect(page.getByRole("heading", { level: 1, name: "Spring Cup" }).first()).toBeVisible();
  await expect(page.getByText("City Arena")).toBeVisible();
  await expect(page.getByText("Live", { exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Announcements" }).getByText("Round 2 starts at 3 pm")).toBeVisible();
  await expect(page.getByRole("region", { name: "Sponsors" }).getByText("Acme Energy")).toBeVisible();
  await expect(page.getByRole("region", { name: "News ticker" })).toContainText("Free parking at gate 2");
  await expect(page.getByRole("tab")).toHaveCount(5);
  for (const [tab, text] of [["Standings", "Group stage standings"], ["Table", "League table"], ["Schedule", "Match day schedule"], ["Bracket", "Knockout bracket"], ["Countdown", "Finals start in"]]) {
    await page.getByRole("tab", { name: tab, exact: true }).click();
    await expect(page.getByRole("tabpanel").getByText(text)).toBeVisible();
  }
  await expect(page.getByText(/^Updated /)).toBeVisible();
  expect((await page.evaluate(() => document.querySelector('meta[name="robots"]')?.getAttribute("content"))) ?? "").toContain("noindex");
});

test("the live page passes the accessibility check", async ({ page }) => {
  await preflight(page);
  await publicLive(page, () => publicBody());
  await page.goto("/live/?e=demo");
  await expect(page.getByRole("tab", { name: "Standings" })).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(900);
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  const bad = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
});

test("the live page refreshes by itself", async ({ page }) => {
  await preflight(page);
  await page.clock.install();
  let n = 0;
  await publicLive(page, () => publicBody({ announcements: [{ text: n++ === 0 ? "First news" : "Fresh news", at: "2026-12-01T09:30:00Z" }] }));
  await page.goto("/live/?e=demo");
  await expect(page.getByText("First news")).toBeVisible();
  await page.clock.runFor(25_000);
  await expect(page.getByText("Fresh news")).toBeVisible();
});

test("a page that is not published says so plainly", async ({ page }) => {
  await preflight(page);
  await publicLive(page, () => ({ error: "not_found" }), () => 404);
  await page.goto("/live/?e=nothere");
  await expect(page.getByRole("heading", { name: "This event page is not live yet" })).toBeVisible();
  await page.goto("/live/");
  await expect(page.getByRole("heading", { name: "This event page is not live yet" })).toBeVisible();
});

test("going offline keeps the last data on screen", async ({ page, context }) => {
  await preflight(page);
  await publicLive(page, () => publicBody());
  await page.goto("/live/?e=demo");
  await expect(page.getByText("Round 2 starts at 3 pm")).toBeVisible();
  await context.setOffline(true);
  await expect(page.getByText(/You are offline/)).toBeVisible();
  await expect(page.getByText("Round 2 starts at 3 pm")).toBeVisible();
});

test("My team is highlighted, remembered after a reload, and shows the next match only when the data says it", async ({ page }) => {
  await preflight(page);
  await publicLive(page, () => publicBody());
  await page.goto("/live/?e=demo");
  const pick = page.getByLabel("My team");
  await expect(pick.locator("option")).toHaveCount(5); // Not chosen + Alpha, Bravo, Charlie, Delta
  await pick.selectOption("Charlie");
  await expect(page.getByRole("note").filter({ hasText: "Your next match" })).toContainText("Charlie vs Delta");
  await page.getByRole("tab", { name: "Table", exact: true }).click();
  await expect(page.locator("li[data-mine]").filter({ hasText: "Charlie" })).toHaveCount(1);
  await page.reload();
  await expect(page.getByLabel("My team")).toHaveValue("Charlie");
  await page.getByLabel("My team").selectOption("");
  await expect(page.getByRole("note")).toHaveCount(0);
});

test("on a phone: team picker first, no site footer, cards that open, round chips, no sideways scroll", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await preflight(page);
  await publicLive(page, () => publicBody());
  await page.goto("/live/?e=demo");
  await expect(page.getByText("Which team are you?")).toBeVisible();
  await expect(page.getByText("We will highlight it for you.")).toBeVisible();
  await expect(page.locator("footer.no-print")).toBeHidden();
  await expect(page.getByRole("link", { name: /Made with Esports Hub/ })).toHaveAttribute("href", "/tools/");
  const card = page.getByRole("button", { name: /Alpha/ }).first();
  await expect(card).toHaveAttribute("aria-expanded", "false");
  await card.click();
  await expect(page.getByRole("list", { name: "Alpha details" })).toContainText("Kills");
  await page.getByLabel("My team").selectOption("Bravo");
  await expect(page.getByLabel("Your team")).toContainText("Bravo");
  await page.getByRole("tab", { name: "Schedule", exact: true }).click();
  await expect(page.getByText("Alpha vs Bravo").first()).toBeVisible();
  await page.getByRole("tab", { name: "Bracket", exact: true }).click();
  await expect(page.getByRole("group", { name: "Jump to a round" })).toHaveCount(0); // one round: no chips needed
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

const MATCHES = [
  { id: "g1", stage: "group:A", round: 1, slot: 1, a: "Alpha", b: "Bravo", status: "finished", scoreA: 2, scoreB: 1, startsAt: null },
  { id: "g2", stage: "group:A", round: 2, slot: 1, a: "Charlie", b: "Alpha", status: "live", scoreA: 0, scoreB: 0, startsAt: null },
  { id: "k1", stage: "knockout", round: 1, slot: 1, a: "", b: "", status: "scheduled", scoreA: null, scoreB: null, startsAt: null },
];

test("a Matches tab appears when the server sends matches, grouped by stage and round, with My team highlighted", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await preflight(page);
  await publicLive(page, () => ({ ...publicBody({ views: [] }), matches: MATCHES }));
  await page.goto("/live/?e=demo");
  await expect(page.getByRole("tab")).toHaveCount(1);
  await page.getByRole("tab", { name: "Matches", exact: true }).click();
  const panel = page.getByRole("tabpanel");
  await expect(panel.getByRole("heading", { name: "Group A" })).toBeVisible();
  await expect(panel.getByRole("heading", { name: "Knockout" })).toBeVisible();
  await expect(panel.getByRole("heading", { name: "Round 2" })).toBeVisible();
  await expect(panel.getByText("Live now")).toBeVisible();
  await expect(panel.getByText("Finished")).toBeVisible();
  await expect(panel.getByText("2 - 1")).toBeVisible();
  await expect(panel.getByText("To be decided").first()).toBeVisible();
  await page.getByLabel("My team").selectOption("Charlie");
  await expect(panel.locator("li[data-mine]")).toHaveCount(1);
  await expect(panel.getByText("Your team")).toBeVisible();
  await expect(page.getByRole("note").filter({ hasText: "Your next match" })).toContainText("Group A, round 2: vs Alpha");
  await panel.getByLabel(/Show only Charlie/).check();
  await expect(panel.locator("li")).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("without matches in the response there is no Matches tab", async ({ page }) => {
  await preflight(page);
  await publicLive(page, () => publicBody());
  await page.goto("/live/?e=demo");
  await expect(page.getByRole("tab")).toHaveCount(5);
  await expect(page.getByRole("tab", { name: "Matches" })).toHaveCount(0);
});

// ---- the panel on the event page ----
const EVENT = { id: "e1", key: "cup", name: "Spring Cup", game: "BGMI", organiser: "", date: "2026-12-01", venue: "", emergency: "", rules: "", settings: {}, updatedAt: "", role: "owner" };

/** The event's server side, kept in one object so each test can read what was saved. */
async function mockEvent(page: Page, start: { slug: string | null; published: boolean; snapshot: unknown }) {
  const st = { ...start, puts: [] as { published?: boolean; snapshot?: { views: { kind: string }[]; announcements: { text: string }[]; sponsors: { name: string; logo?: string }[]; ticker: string[] } }[] };
  const reply = () => ({ slug: st.slug, published: st.published, snapshot: st.snapshot, updatedAt: "2026-12-01T09:00:00Z" });
  await page.route(`${API}/events/e1/**`, async (r: Route) => {
    const path = new URL(r.request().url()).pathname;
    if (path.endsWith("/live")) {
      if (r.request().method() === "PUT") {
        const b = r.request().postDataJSON();
        st.puts.push(b);
        st.slug ??= "abcd1234efgh";
        if (typeof b.published === "boolean") st.published = b.published;
        if (b.snapshot) st.snapshot = b.snapshot;
      }
      return r.fulfill(json(reply()));
    }
    if (path.endsWith("/roster")) return r.fulfill(json({ teams: [], people: [] }));
    if (path.endsWith("/checkins")) return r.fulfill(json({ checkins: [], total: 0, checkedIn: 0 }));
    return r.fulfill(json({ error: "not_found" }, 404));
  });
  return st;
}
const tinyPng = (w: number, h: number) => {
  const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = (b: Buffer) => { let c = 0xffffffff; for (const x of b) c = crcTable[(c ^ x) & 255]! ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (t: string, d: Buffer) => { const len = Buffer.alloc(4); len.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  const raw = Buffer.alloc((w * 3 + 1) * h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const o = y * (w * 3 + 1) + 1 + x * 3; raw[o] = (x * 7) & 255; raw[o + 1] = (y * 5) & 255; raw[o + 2] = 120; }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
};

test("the live page panel publishes and unpublishes after asking, and shows the link", async ({ page }) => {
  await signedIn(page, [EVENT]);
  const st = await mockEvent(page, { slug: null, published: false, snapshot: null });
  await page.goto("/app/events/?id=e1");
  await openPanel(page, "share", "live");
  const panel = page.getByRole("region", { name: "Live page", exact: true });
  await expect(panel.getByText("Not published")).toBeVisible();
  const sw = panel.getByRole("switch");
  await expect(sw).toHaveAttribute("aria-checked", "false");
  page.once("dialog", (d) => { expect(d.message()).toMatch(/anyone with the link/i); void d.accept(); });
  await sw.click();
  await expect(sw).toHaveAttribute("aria-checked", "true");
  await expect(panel.getByLabel("Public link")).toContainText("/live/?e=abcd1234efgh");
  await expect(panel.getByRole("img", { name: /QR code/ })).toBeVisible();
  await expect(panel.getByRole("link", { name: "Open the page" })).toHaveAttribute("href", /\/live\/\?e=abcd1234efgh$/);
  await expect(panel.getByRole("button", { name: "Copy link" })).toBeVisible();
  await expect(panel.getByRole("button", { name: "Download QR for a poster" })).toBeVisible();
  expect(st.puts[0]).toEqual({ published: true });
  page.once("dialog", (d) => { expect(d.message()).toMatch(/link will stop working/i); void d.accept(); });
  await sw.click();
  await expect(sw).toHaveAttribute("aria-checked", "false");
  expect(st.puts[1]).toEqual({ published: false });
});

test("announcements, sponsors with a shrunk logo and ticker lines are saved together, and the views are kept", async ({ page }) => {
  await signedIn(page, [EVENT]);
  const st = await mockEvent(page, { slug: "abcd1234efgh", published: true, snapshot: snapshot({ announcements: [{ text: "Old news", at: "2026-01-01T08:00:00Z" }], sponsors: [], ticker: [] }) });
  await page.goto("/app/events/?id=e1");
  await openPanel(page, "share", "live");
  const panel = page.getByRole("region", { name: "Live page", exact: true });
  await expect(panel.getByText("Old news")).toBeVisible();
  await panel.getByLabel("New announcement").fill("Lunch at 1 pm");
  await panel.getByRole("button", { name: "Post", exact: true }).click();
  await panel.getByRole("button", { name: "Add a sponsor" }).click();
  await panel.getByLabel("Sponsor 1 name").fill("Acme Energy");
  await panel.getByLabel(/Add logo/).setInputFiles({ name: "logo.png", mimeType: "image/png", buffer: tinyPng(600, 300) });
  await expect(panel.getByRole("img", { name: "Acme Energy logo" })).toBeVisible();
  await panel.getByRole("button", { name: "Add a ticker line" }).click();
  await panel.getByLabel("Ticker line 1", { exact: true }).fill("Free parking at gate 2");
  await panel.getByRole("button", { name: "Save", exact: true }).click();
  await expect(panel.getByText("Saved.")).toBeVisible();
  const sent = st.puts.at(-1)!.snapshot!;
  expect(sent.views.map((v) => v.kind)).toEqual(["standings", "league", "schedule", "bracket", "countdown"]);
  expect(sent.announcements.map((a) => a.text)).toEqual(["Lunch at 1 pm", "Old news"]);
  expect(sent.ticker).toEqual(["Free parking at gate 2"]);
  const logo = sent.sponsors[0]!.logo!;
  expect(logo.startsWith("data:image/")).toBe(true);
  expect(logo.length).toBeLessThanOrEqual(60000);
  if (logo.startsWith("data:image/png")) expect(Buffer.from(logo.split(",")[1]!, "base64").readUInt32BE(16)).toBeLessThanOrEqual(240);
  // delete one announcement and a sponsor
  await panel.getByRole("button", { name: "Delete announcement: Old news" }).click();
  await panel.getByRole("button", { name: "Remove sponsor 1" }).click();
  await panel.getByRole("button", { name: "Save", exact: true }).click();
  await expect(panel.getByText("Saved.")).toBeVisible();
  expect(st.puts.at(-1)!.snapshot!.announcements.map((a) => a.text)).toEqual(["Lunch at 1 pm"]);
  expect(st.puts.at(-1)!.snapshot!.sponsors).toEqual([]);
});

test("a tool offers to publish only when signed in, and says so when it is signed out", async ({ page }) => {
  await page.goto("/tools/points-table/");
  await expect(page.getByText("Sign in to publish this on your event's live page")).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign in", exact: true }).last()).toHaveAttribute("href", /\/login\//);
});

test("a signed-in organiser publishes a tool's view into the event's snapshot and keeps the rest", async ({ page }) => {
  await signedIn(page, [EVENT]);
  const st = await mockEvent(page, { slug: "abcd1234efgh", published: true, snapshot: snapshot({ views: [VIEWS[3]] }) });
  await page.goto("/tools/points-table/");
  const group = page.getByRole("group", { name: "Publish on the live page" });
  await expect(group.getByLabel("Event")).toHaveValue("e1");
  await group.getByRole("button", { name: /^Publish this / }).click();
  await expect(group.getByText(/^Published\./)).toBeVisible();
  const put = st.puts[0]!;
  expect(put.published).toBe(true);
  const kinds = put.snapshot!.views.map((v) => v.kind).sort();
  expect(kinds).toHaveLength(2);
  expect(kinds).toContain("bracket");
  expect(kinds.find((k) => k !== "bracket")).toMatch(/^(standings|league)$/);
  expect(put.snapshot!.announcements[0]!.text).toBe("Round 2 starts at 3 pm");
  expect(put.snapshot!.ticker).toEqual(["Free parking at gate 2"]);
});

test("when the page is not published yet the tool saves the view and points to the event page", async ({ page }) => {
  await signedIn(page, [EVENT]);
  const st = await mockEvent(page, { slug: "abcd1234efgh", published: false, snapshot: null });
  await page.goto("/tools/points-table/");
  const group = page.getByRole("group", { name: "Publish on the live page" });
  await group.getByRole("button", { name: /^Publish this / }).click();
  await expect(group.getByText(/not published yet/)).toBeVisible();
  await expect(group.getByRole("link", { name: "Publish the page" })).toHaveAttribute("href", "/app/events/?id=e1");
  expect(st.puts[0]!.published).toBeUndefined();
});

test("a failed publish says what went wrong", async ({ page }) => {
  await signedIn(page, [EVENT]);
  await page.route(`${API}/events/e1/live`, (r) => r.fulfill(json({ error: "forbidden" }, 403)));
  await page.goto("/tools/points-table/");
  const group = page.getByRole("group", { name: "Publish on the live page" });
  await group.getByRole("button", { name: /^Publish this / }).click();
  await expect(group.getByText(/do not have permission/i)).toBeVisible();
});
