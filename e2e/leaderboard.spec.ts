// The season leaderboard: the public page and the publish panel, with the server mocked so nothing real is touched.
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page, type Route } from "@playwright/test";
import { json, openPanel, preflight, signedIn } from "./helpers";

const API = "**/esports-api.yaseenyk.workers.dev";
const SLUG = "abcd234efgh2";

const fin = (id: string, slot: number, a: string, b: string, sa: number, sb: number) => ({ id, stage: "main", round: 1, slot, a, b, status: "finished", scoreA: sa, scoreB: sb, startsAt: null });
const publicBody = (over: Record<string, unknown> = {}) => ({
  title: "Autumn League",
  event: { name: "Spring Cup", date: "2026-12-01", venue: "City Arena" },
  settings: { scale: [], perKill: 1, winPts: 3, drawPts: 1, lossPts: 0, days: [{ label: "Day 1", fromMatch: 1, toMatch: 2 }, { label: "Day 2", fromMatch: 3, toMatch: 4 }] },
  matches: [fin("m1", 1, "Alpha", "Bravo", 2, 0), fin("m2", 2, "Charlie", "Delta", 0, 1), fin("m3", 3, "Bravo", "Charlie", 3, 0), fin("m4", 4, "Alpha", "Delta", 0, 1)],
  br: [],
  updatedAt: "2026-12-01T09:30:00Z",
  ...over,
});
const publicLeague = (page: Page, body: () => unknown, status = () => 200) => page.route(`${API}/public/league/*`, (r) => r.fulfill(json(body(), status())));

test("the leaderboard ranks teams, moves between days, shows movement in words and remembers my team", async ({ page }) => {
  await preflight(page);
  await publicLeague(page, () => publicBody());
  await page.goto(`/league/?s=${SLUG}`);
  await expect(page.getByRole("heading", { level: 1, name: "Autumn League" })).toBeVisible();
  await expect(page.getByText("City Arena")).toBeVisible();
  const cards = page.getByRole("list", { name: "Ranking" }).getByRole("listitem");
  await expect(cards).toHaveCount(4);
  // the latest day is shown first
  await expect(page.getByRole("button", { name: "Day 2" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { name: "Table after Day 2" })).toBeVisible();
  await expect(cards.nth(0)).toContainText("Delta");
  await expect(cards.nth(0)).toContainText("Up 1 place");
  await expect(cards.nth(0)).toContainText("+3 on this day");
  await expect(cards.nth(1)).toContainText("level");
  await expect(cards.nth(3)).toContainText("Charlie");
  await expect(cards.nth(3)).toContainText("Down 1 place");
  await expect(page.getByText(/^Updated /)).toBeVisible();
  // another day
  await page.getByRole("button", { name: "Day 1" }).click();
  await expect(page.getByRole("heading", { name: "Table after Day 1" })).toBeVisible();
  await expect(cards.nth(0)).toContainText("Alpha");
  // my team
  await page.getByRole("button", { name: "Day 2" }).click();
  await page.getByRole("combobox").selectOption("Bravo");
  await expect(page.getByRole("note")).toContainText("Bravo is 2nd (level with another team) with 3 points.");
  await expect(page.getByText("Your team", { exact: true }).first()).toBeVisible();
  await page.reload();
  await expect(page.getByRole("combobox")).toHaveValue("Bravo");
  // the rules are explained in words
  await page.getByText("How the points work").click();
  await expect(page.getByText(/a win is 3 points, a draw is 1 and a loss is 0/)).toBeVisible();
  await expect(page.getByText(/When teams are level, the order is decided by/)).toBeVisible();
  expect((await page.evaluate(() => document.querySelector('meta[name="robots"]')?.getAttribute("content"))) ?? "").toContain("noindex");
  await expect(page.getByRole("link", { name: /Made with Esports Hub/ })).toBeVisible();
});

test("a season with one table has no day chips, and a season with no results says what to do", async ({ page }) => {
  await preflight(page);
  await publicLeague(page, () => publicBody({ settings: { scale: [], perKill: 1, winPts: 3, drawPts: 1, lossPts: 0, days: [] } }));
  await page.goto(`/league/?s=${SLUG}`);
  await expect(page.getByRole("heading", { name: "Table", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Day / })).toHaveCount(0);
  await page.unroute(`${API}/public/league/*`);
  await publicLeague(page, () => publicBody({ matches: [], br: [] }));
  await page.goto(`/league/?s=${SLUG}`);
  await expect(page.getByText("No results yet", { exact: true })).toBeVisible();
});

test("battle royale results are scored with the published scale", async ({ page }) => {
  await preflight(page);
  await publicLeague(page, () => publicBody({
    settings: { scale: [10, 6], perKill: 1, winPts: 3, drawPts: 1, lossPts: 0, days: [] }, matches: [],
    br: [{ matchNo: 1, team: "Wolves", placement: 1, kills: 4 }, { matchNo: 1, team: "Hawks", placement: 2, kills: 7 }],
  }));
  await page.goto(`/league/?s=${SLUG}`);
  const cards = page.getByRole("list", { name: "Ranking" }).getByRole("listitem");
  await expect(cards.nth(0)).toContainText("Wolves");
  await expect(cards.nth(0)).toContainText("14");
  await expect(cards.nth(1)).toContainText("Hawks");
  await expect(cards.nth(1)).toContainText("13");
});

test("an unpublished or unknown link, and a link with no code, say the leaderboard is not live", async ({ page }) => {
  await preflight(page);
  await publicLeague(page, () => ({ error: "not_found" }), () => 404);
  await page.goto(`/league/?s=${SLUG}`);
  await expect(page.getByRole("heading", { name: "This leaderboard is not live yet" })).toBeVisible();
  await page.goto("/league/");
  await expect(page.getByRole("heading", { name: "This leaderboard is not live yet" })).toBeVisible();
});

test("going offline keeps the last table and says so", async ({ page, context }) => {
  await preflight(page);
  await publicLeague(page, () => publicBody());
  await page.goto(`/league/?s=${SLUG}`);
  await expect(page.getByRole("list", { name: "Ranking" }).getByRole("listitem")).toHaveCount(4);
  await context.setOffline(true);
  await expect(page.getByText("You are offline. Showing the last update.")).toBeVisible();
  await expect(page.getByRole("list", { name: "Ranking" }).getByRole("listitem")).toHaveCount(4);
  await context.setOffline(false);
});

test("the leaderboard page passes the accessibility check on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await preflight(page);
  await publicLeague(page, () => publicBody());
  await page.goto(`/league/?s=${SLUG}`);
  await expect(page.getByRole("list", { name: "Ranking" })).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  const bad = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
});

// ---------- the panel ----------
const EVENT = { id: "e1", key: "cup", name: "Spring Cup", game: "BGMI", organiser: "", date: "2026-12-01", venue: "", emergency: "", rules: "", settings: {}, updatedAt: "", role: "owner" };
type Put = { published?: boolean; title?: string; scale?: number[]; perKill?: number; winPts?: number; days?: { label: string; fromMatch: number; toMatch: number }[] };

async function mockEvent(page: Page, matches: unknown[] = []) {
  const st = { slug: null as string | null, published: false, title: "", scale: [] as number[], perKill: 1, winPts: 3, drawPts: 1, lossPts: 0, days: [] as unknown[], puts: [] as Put[] };
  const reply = () => ({ slug: st.slug, published: st.published, title: st.title, scale: st.scale, perKill: st.perKill, winPts: st.winPts, drawPts: st.drawPts, lossPts: st.lossPts, days: st.days, updatedAt: st.slug ? "2026-12-01T09:00:00Z" : null });
  await page.route(`${API}/events/e1/**`, async (r: Route) => {
    const path = new URL(r.request().url()).pathname;
    if (path.endsWith("/league")) {
      if (r.request().method() === "PUT") {
        const b = r.request().postDataJSON() as Put;
        st.puts.push(b);
        st.slug ??= SLUG;
        Object.assign(st, Object.fromEntries(Object.entries(b)));
      }
      return r.fulfill(json(reply()));
    }
    if (path.endsWith("/matches")) return r.fulfill(json({ matches, br: [] }));
    if (path.endsWith("/roster")) return r.fulfill(json({ teams: [], people: [] }));
    return r.fulfill(json({ error: "not_found" }, 404));
  });
  return st;
}

test("the panel explains itself, saves the points, then publishes after asking and shows the link", async ({ page }) => {
  await signedIn(page, [EVENT]);
  const st = await mockEvent(page);
  await page.goto("/app/events/?id=e1");
  await openPanel(page, "share", "leaderboard");
  const panel = page.getByRole("region", { name: "Season leaderboard", exact: true });
  await expect(panel.getByText("One ranking for the whole season")).toBeVisible();
  await expect(panel.getByText(/No results are recorded yet/)).toBeVisible();
  await expect(panel.getByRole("heading", { name: /Step 1: Choose how points are scored/ })).toBeVisible();
  await expect(panel.getByRole("heading", { name: /Step 2: Publish and share/ })).toBeVisible();
  await panel.getByRole("button", { name: "Use a common example scale" }).click();
  await expect(panel.getByLabel(/points for each place/)).toHaveValue("10, 6, 5, 4, 3, 2, 1, 1");
  await panel.getByLabel("Title of the leaderboard").fill("Autumn League");
  await panel.getByLabel(/points for each kill/).fill("2");
  // days sit under More options
  await panel.getByText("More options: win, draw and loss points, and days").click();
  await panel.getByRole("button", { name: "Add the first day" }).click();
  await expect(panel.getByText("Day 1 = matches 1 to 5")).toBeVisible();
  await panel.getByRole("button", { name: "Day 1 last match: one more" }).click();
  await expect(panel.getByText("Day 1 = matches 1 to 6")).toBeVisible();
  await panel.getByRole("button", { name: "Add another day" }).click();
  await expect(panel.getByText("Day 2 = matches 7 to 12")).toBeVisible();
  await panel.getByRole("button", { name: "Save the points" }).click();
  await expect(panel.getByText(/^Saved\./)).toBeVisible();
  expect(st.puts[0]).toMatchObject({ title: "Autumn League", scale: [10, 6, 5, 4, 3, 2, 1, 1], perKill: 2, winPts: 3, days: [{ label: "Day 1", fromMatch: 1, toMatch: 6 }, { label: "Day 2", fromMatch: 7, toMatch: 12 }] });
  // publish
  const sw = panel.getByRole("switch");
  await expect(sw).toHaveAttribute("aria-checked", "false");
  await expect(panel.getByText("Not published")).toBeVisible();
  page.once("dialog", (d) => { expect(d.message()).toMatch(/anyone with the link/i); void d.accept(); });
  await sw.click();
  await expect(sw).toHaveAttribute("aria-checked", "true");
  await expect(panel.getByLabel("Public link")).toContainText(`/league/?s=${SLUG}`);
  await expect(panel.getByRole("img", { name: /QR code/ })).toBeVisible();
  await expect(panel.getByRole("link", { name: "Open the page" })).toHaveAttribute("href", new RegExp(`/league/\\?s=${SLUG}$`));
  await expect(panel.getByRole("button", { name: "Download QR for a poster" })).toBeVisible();
  expect(st.puts[1]).toMatchObject({ published: true });
  // unpublish asks first; saying no changes nothing
  page.once("dialog", (d) => { expect(d.message()).toMatch(/link will stop working/i); void d.dismiss(); });
  await sw.click();
  await expect(sw).toHaveAttribute("aria-checked", "true");
  expect(st.puts).toHaveLength(2);
});

test("the panel refuses bad numbers in plain words and shows a preview from the recorded results", async ({ page }) => {
  await signedIn(page, [EVENT]);
  await mockEvent(page, [fin("m1", 1, "Alpha", "Bravo", 2, 0)]);
  await page.goto("/app/events/?id=e1");
  await openPanel(page, "share", "leaderboard");
  const panel = page.getByRole("region", { name: "Season leaderboard", exact: true });
  await expect(panel.getByText("Preview of the table")).toBeVisible();
  await expect(panel.getByText("Alpha, 3 points")).toBeVisible();
  await panel.getByLabel(/points for each place/).fill("10, six");
  await expect(panel.getByRole("alert")).toContainText("Placement points must be numbers separated by commas");
  await expect(panel.getByRole("button", { name: /Save the points|Saved/ })).toBeDisabled();
});

test("a viewer can look at the leaderboard settings but not change them", async ({ page }) => {
  await signedIn(page, [{ ...EVENT, role: "viewer" }]);
  await mockEvent(page);
  await page.goto("/app/events/?id=e1");
  await openPanel(page, "share", "leaderboard");
  const panel = page.getByRole("region", { name: "Season leaderboard", exact: true });
  await expect(panel.getByText(/You can look but not change this/)).toBeVisible();
  await expect(panel.getByRole("switch")).toBeDisabled();
  await expect(panel.getByRole("button", { name: "Use a common example scale" })).toBeDisabled();
});
