// College esports calendar and organiser trust score with the flags ON. These pages exist only in a build made against an API that has them on:
//   node scripts/mock-community-api.mjs 8799      then:   rm -rf .next && NEXT_PUBLIC_API_URL=http://localhost:8799 npm run build
// With a normal build (flags off) every test here is skipped and e2e/community-off.spec.ts runs instead. The browser-side API is MOCKED with route
// interception (nothing reaches a real backend). Run one project at a time:  npx playwright test e2e/community.spec.ts --project=desktop
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page, type Request } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve("out");
// Only a build made against the fixture server: a build against the real API (flags on in production) has a calendar page too, with real data.
const CAL = path.join(OUT, "calendar", "index.html");
const BUILT = fs.existsSync(CAL) && fs.readFileSync(CAL, "utf8").includes("Fixture Fest Cup");
// The fixture tournament page is missing when the mock ran with MOCK_NO_TOURNAMENTS=1 (Windows cannot draw its og.png card).
const HAS_TOURNAMENT = fs.existsSync(path.join(OUT, "tournaments", "fixture-community-cup", "index.html"));
test.skip(!BUILT, "this build was not made against scripts/mock-community-api.mjs: see the header of this file");
test.setTimeout(120_000);

const json = (body: unknown, status = 200) => ({ status, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(body) });
type H = (req: { url: URL; body: unknown; request: Request }) => { status?: number; body?: unknown } | undefined;
interface Seen { method: string; path: string; body: unknown }

/** Mocks the API the build points at. Unhandled paths answer the flag-off 404, exactly like production. */
async function mock(page: Page, handlers: Record<string, H> = {}, signed = false): Promise<Seen[]> {
  const seen: Seen[] = [];
  if (signed) await page.addInitScript(() => localStorage.setItem("eh-session-v1", JSON.stringify({ token: "t", user: { id: "u", email: "olivia@example.com", name: "Olivia Test" } })));
  await page.route(/localhost:8799\//, async (r) => {
    const req = r.request();
    const url = new URL(req.url());
    if (req.method() === "OPTIONS") return r.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" } });
    let body: unknown;
    try { body = req.postData() ? JSON.parse(req.postData()!) : undefined; } catch { body = undefined; }
    seen.push({ method: req.method(), path: url.pathname, body });
    if (url.pathname === "/me") return r.fulfill(json({ id: "u", email: "olivia@example.com", name: "Olivia Test", emailVerified: true }));
    if (url.pathname === "/me/context") return r.fulfill(json({ user: { id: "u", email: "olivia@example.com", name: "Olivia Test" }, orgs: [], staff: null, features: { teamOrgs: false } }));
    if (url.pathname === "/events") return r.fulfill(json([]));
    if (url.pathname.startsWith("/v3/") && !req.headers()["authorization"]) return r.fulfill(json({ error: "Authentication required" }, 401)); // the real API: sign-in first
    const out = handlers[`${req.method()} ${url.pathname}`]?.({ url, body, request: req });
    return r.fulfill(out ? json(out.body ?? {}, out.status ?? 200) : json({ error: "Not found" }, 404));
  });
  return seen;
}

const axe = async (page: Page) => {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
};

// ---------------- calendar ----------------

test("calendar: the built page lists the entries at first paint, is indexable with 5+ upcoming verified events, and is in the sitemap", async ({ page }) => {
  await mock(page);
  await page.goto("/calendar/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("College esports calendar");
  await expect(page.getByText("Fixture Fest Cup 1", { exact: true })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index, follow");
  expect(fs.readFileSync(path.join(OUT, "sitemap.xml"), "utf8")).toContain("/calendar/</loc>");
  // the entry that points at a tournament page of this build links there; the others link out with nofollow
  if (HAS_TOURNAMENT) await expect(page.getByRole("link", { name: "Tournament page and registration" })).toHaveAttribute("href", "/tournaments/fixture-community-cup/");
  else await expect(page.getByRole("link", { name: "Tournament page and registration" })).toHaveCount(0); // never a link to a page this build does not have
  const out = page.getByRole("link", { name: /Register on the organiser's page/ }).first();
  await expect(out).toHaveAttribute("rel", /nofollow/);
  await expect(out).toHaveAttribute("href", /^https:\/\/forms\.example\.org\//);
  await expect(page.getByText("Cancelled", { exact: true })).toBeVisible();
  // the campus cross-link is one small, honest line
  await expect(page.getByRole("link", { name: "campus.streamerosai.com" })).toHaveCount(1);
  await axe(page);
});

test("calendar: filters by game and city, month view, empty state", async ({ page }) => {
  await mock(page);
  await page.goto("/calendar/");
  await page.getByLabel("Game").selectOption("bgmi");
  await expect(page.getByText("Fixture Fest Cup 2", { exact: true })).toBeVisible();
  await expect(page.getByText("Fixture Fest Cup 1", { exact: true })).toHaveCount(0);
  await page.getByLabel("City").selectOption("Nagpur");
  await expect(page.getByText("Fixture Fest Cup 2", { exact: true })).toBeVisible();
  await page.getByLabel("Game").selectOption("cs2");
  await expect(page.getByText("No event matches these filters")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page.getByRole("button", { name: "Month", exact: true }).click();
  await expect(page.getByRole("button", { name: "Month", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("table caption")).toContainText("Events in");
  await expect(page.getByRole("button", { name: /Previous/ })).toBeDisabled();
  await page.getByRole("button", { name: /Next/ }).click();
  await expect(page.getByRole("button", { name: /Previous/ })).toBeEnabled();
  await axe(page);
});

test("calendar: the browser refresh replaces the built list; a failed refresh keeps it and says so", async ({ page }) => {
  await mock(page, { "GET /public/calendar": () => ({ body: { items: [{ id: "n1", title: "Fresh Live Cup", game: "valorant", city: "Pune", online: false, startsOn: "2099-01-05", endsOn: "2099-01-05", status: "listed", registrationUrl: "https://forms.example.org/fresh", tournamentSlug: null, organiser: { name: "Fixture Institute of Technology", slug: null, verified: true } }], upcomingVerified: 1, today: "2099-01-01" } }) });
  await page.goto("/calendar/");
  await expect(page.getByText("Fresh Live Cup")).toBeVisible();
  await page.unrouteAll({ behavior: "ignoreErrors" });
  await mock(page, { "GET /public/calendar": () => ({ status: 500, body: { error: "boom" } }) });
  await page.goto("/calendar/");
  await expect(page.getByRole("alert").filter({ hasText: "Could not refresh the calendar" })).toBeVisible();
  await expect(page.getByText("Fixture Fest Cup 1", { exact: true })).toBeVisible();
});

test("organiser calendar: not verified explains how; verified lists an event and is told when the link was trimmed", async ({ page }) => {
  let mine: unknown[] = [];
  let orgs = [] as { id: string; name: string }[];
  const seen = await mock(page, {
    "GET /v3/me/calendar": () => ({ body: { orgs, items: mine } }),
    "POST /v3/orgs/o1/calendar": ({ body }) => {
      const b = body as Record<string, string>;
      const entry = { id: "e9", title: b.title, game: b.game, city: b.city, online: false, startsOn: b.startsOn, endsOn: b.endsOn, status: "listed", registrationUrl: "https://forms.example.org/reg", tournamentSlug: null, organiser: { name: "Fixture Institute of Technology", slug: null, verified: true }, orgId: "o1", hidden: false, hiddenReason: null };
      mine = [entry];
      return { status: 201, body: { entry, urlStripped: true } };
    },
  }, true);
  await page.goto("/app/calendar/");
  await expect(page.getByRole("heading", { name: "Your organisation is not verified yet" })).toBeVisible();
  orgs = [{ id: "o1", name: "Fixture Institute of Technology" }];
  await page.reload();
  await page.getByLabel("Event name").fill("Techfest Valorant Cup");
  await page.getByLabel("City").fill("Pune");
  await page.getByLabel("First day").fill("2099-01-05");
  await page.getByLabel("Registration link").fill("https://forms.example.org/reg?t=secret");
  await page.getByRole("button", { name: "List the event" }).click();
  await expect(page.getByRole("status").filter({ hasText: "We removed everything after the ?" })).toBeVisible();
  await expect(page.getByText("Techfest Valorant Cup")).toBeVisible();
  const post = seen.find((s) => s.method === "POST")!;
  expect(post.body).toMatchObject({ title: "Techfest Valorant Cup", game: "bgmi", city: "Pune", startsOn: "2099-01-05", endsOn: "2099-01-05" });
  await axe(page);
});

// ---------------- trust ----------------

const review = (i: number, over: Record<string, unknown> = {}) => ({ id: `r${i}`, displayName: `Player ${i}`, verifiedAs: i % 2 ? "played" : "checked_in", stars: null, review: `Review number ${i}: the matches started on time and results were posted quickly.`, createdAt: "2030-11-21T10:00:00.000Z", tournament: { slug: "fixture-community-cup", title: "Fixture Community Cup" }, reply: null, replyHidden: false, ...over });
const summary = (over: Record<string, unknown> = {}) => ({
  tournament: { slug: "fixture-community-cup", title: "Fixture Community Cup" }, organiser: { name: "Fixture Institute of Technology", verified: true },
  score: { count: 3, minimum: 5, average: null, aspects: null, distribution: null }, reviews: [review(1), review(2)],
  window: { state: "open", opensAt: "2030-11-20T12:00:00.000Z", closesAt: "2099-12-20T12:00:00.000Z", days: 30 }, ...over,
});
const me = (over: Record<string, unknown> = {}) => ({ adultConfirmed: true, isOrganiser: false, canReply: false, window: summary().window, myRating: null, suggestedName: "Olivia Test", ...over });

test("trust page: under the minimum there is no number, only the count and how the score is built", async ({ page }) => {
  await mock(page, { "GET /public/tournaments/fixture-community-cup/trust": () => ({ body: summary() }) });
  await page.goto("/trust/?t=fixture-community-cup");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Fixture Institute of Technology");
  await expect(page.getByText("3 verified ratings so far. A score appears after 2 more.")).toBeVisible();
  await expect(page.getByText("out of 5")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "How this score is built" })).toBeVisible();
  await expect(page.getByText("Nobody is paid, rewarded or asked to leave a good rating.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign in to rate" })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await axe(page);
});

test("trust page: from the minimum it shows the average, the count and the breakdown", async ({ page }) => {
  await mock(page, { "GET /public/tournaments/fixture-community-cup/trust": () => ({ body: summary({ score: { count: 6, minimum: 5, average: 4.2, aspects: { onTime: 4.5, fair: 4, communication: 3.8 }, distribution: { 1: 0, 2: 0, 3: 1, 4: 3, 5: 2 } }, reviews: [review(1, { stars: 5, reply: { text: "Thank you for playing.", at: "2030-11-22T00:00:00.000Z" } })] }) }) });
  await page.goto("/trust/?t=fixture-community-cup");
  await expect(page.getByText("4.2", { exact: true })).toBeVisible();
  await expect(page.getByText("4.2 out of 5 from 6 verified ratings.")).toBeVisible();
  await expect(page.getByRole("row", { name: /Kept to the schedule/ })).toContainText("4.5");
  await expect(page.getByRole("row", { name: /^4 stars/ })).toContainText("3");
  await expect(page.getByText("Thank you for playing.")).toBeVisible();
  await expect(page.getByText("Played (team captain)")).toBeVisible();
  await axe(page);
});

test("trust page: an eligible player rates with proof; server errors are explained; the organiser can reply and anyone signed in can report", async ({ page }) => {
  let attempt = 0;
  const seen = await mock(page, {
    "GET /public/tournaments/fixture-community-cup/trust": () => ({ body: summary() }),
    "GET /v3/tournaments/fixture-community-cup/trust/me": () => ({ body: me() }),
    "POST /v3/tournaments/fixture-community-cup/trust/ratings": () => (++attempt === 1 ? { status: 403, body: { error: "x", code: "not_checked_in" } } : { status: 201, body: { id: "mine", stars: 4, onTime: 4, fair: 5, communication: 3, displayName: "Olivia Test", verifiedAs: "checked_in", hidden: false } }),
    "POST /v3/trust/ratings/r1/report": () => ({ status: 201, body: { ok: true } }),
  }, true);
  await page.goto("/trust/?t=fixture-community-cup");
  const form = page.getByRole("form", { name: "Rate this organiser" });
  await expect(form).toBeVisible();
  await expect(page.getByLabel("Name shown with your rating")).toHaveValue("Olivia Test");
  await page.getByRole("button", { name: "Publish my rating" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Paste the link" })).toBeVisible();
  await page.getByLabel("The link to your pass").fill("https://esports.streamerosai.com/pass/?t=abcdefgh12345678");
  await page.getByLabel("Overall").selectOption("4");
  await page.getByLabel("Kept to the schedule").selectOption("4");
  await page.getByLabel("Fair rules and results").selectOption("5");
  await page.getByLabel("Clear communication").selectOption("3");
  await page.getByRole("button", { name: "Publish my rating" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "never scanned in at the event" })).toBeVisible();
  await page.getByRole("button", { name: "Publish my rating" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Your rating is published" })).toBeVisible();
  const post = seen.filter((s) => s.method === "POST" && s.path.endsWith("/ratings")).at(-1)!;
  expect(post.body).toMatchObject({ stars: 4, onTime: 4, fair: 5, communication: 3, displayName: "Olivia Test", proof: { kind: "pass", link: "https://esports.streamerosai.com/pass/?t=abcdefgh12345678" } });
  // report a review
  await page.getByRole("button", { name: "Report this review" }).first().click();
  await page.getByLabel("What is wrong?").selectOption("false_claim");
  await page.getByRole("button", { name: "Send report" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Nothing is hidden until they decide" })).toBeVisible();
  expect(seen.find((s) => s.path === "/v3/trust/ratings/r1/report")!.body).toMatchObject({ target: "review", reason: "false_claim" });
});

test("trust page: the organiser cannot rate but replies once, publicly", async ({ page }) => {
  let replied = false;
  await mock(page, {
    "GET /public/tournaments/fixture-community-cup/trust": () => ({ body: summary({ reviews: [review(1, replied ? { reply: { text: "We will add a second stream next time.", at: null } } : {})] }) }),
    "GET /v3/tournaments/fixture-community-cup/trust/me": () => ({ body: me({ isOrganiser: true, canReply: true }) }),
    "POST /v3/trust/ratings/r1/reply": () => { replied = true; return { body: { ok: true } }; },
  }, true);
  await page.goto("/trust/?t=fixture-community-cup");
  await expect(page.getByText("You run this event, so you cannot rate it.")).toBeVisible();
  await expect(page.getByRole("form", { name: "Rate this organiser" })).toHaveCount(0);
  await page.getByRole("button", { name: "Reply publicly" }).click();
  await page.getByLabel("Your public reply").fill("We will add a second stream next time.");
  await page.getByRole("button", { name: "Publish reply" }).click();
  await expect(page.getByText("We will add a second stream next time.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Reply publicly" })).toHaveCount(0);
});

test("tournament page: the trust island shows the summary and links to the trust page", async ({ page }) => {
  test.skip(!HAS_TOURNAMENT, "no fixture tournament page in this build");
  await mock(page, { "GET /public/tournaments/fixture-community-cup/trust": () => ({ body: summary({ score: { count: 7, minimum: 5, average: 4.6, aspects: { onTime: 5, fair: 4, communication: 4 }, distribution: { 1: 0, 2: 0, 3: 0, 4: 3, 5: 4 } } }) }) });
  await page.goto("/tournaments/fixture-community-cup/");
  const island = page.getByTestId("trust-island");
  await expect(island).toContainText("4.6 out of 5 from 7 verified ratings.");
  await expect(island.getByRole("link", { name: "Reviews and how the score is built" })).toHaveAttribute("href", "/trust/?t=fixture-community-cup");
});

test("tournament page: no trust data, no island (the API answers 404)", async ({ page }) => {
  test.skip(!HAS_TOURNAMENT, "no fixture tournament page in this build");
  await mock(page);
  await page.goto("/tournaments/fixture-community-cup/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByTestId("trust-island")).toHaveCount(0);
});
