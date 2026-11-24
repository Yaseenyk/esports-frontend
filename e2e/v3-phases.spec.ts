// Phases 3-5 (24 Nov 2026): player profiles and team pages, the scrim finder, the directory island. The API is MOCKED (route interception):
// nothing reaches the real backend. Run one project at a time:  npx playwright test e2e/v3-phases.spec.ts --project=desktop  (then --project=phone)
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { adultOk, json, mockV3, v3SignedIn, type Handler } from "./v3-helpers";

test.setTimeout(120_000);

const API = "**/esports-api.yaseenyk.workers.dev/**";
const axe = async (page: Page) => {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500); // let page transitions settle (the same wait the tournament spec uses)
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)).toBe(false);
};
/** The legacy team pages list (GET /profiles), used by the scrim forms. */
const teamPages = (page: Page, items = [{ id: "tp1", name: "Alpha Squad" }]) =>
  page.route(API, (r) => (new URL(r.request().url()).pathname === "/profiles" && r.request().method() === "GET" ? r.fulfill(json({ profiles: items.map((i) => ({ ...i, slug: "abcdefghijkl", published: false, blurb: "", links: [], consentAt: null, updatedAt: "", events: [] })) })) : r.fallback()));

// ---------- flags off: the API answers 404 exactly as production does today ----------
const OFF: [string, string, boolean][] = [
  ["/scrims/", "Not available yet", false], ["/scrims/new/", "Not available yet", true], ["/app/scrims/", "Not available yet", true], ["/app/teams/", "Not available yet", true],
  ["/teams/view/?s=abcdefghijkl", "No shared team page here", false], ["/players/view/?s=ravi", "No public resume here", false],
];
for (const [p, heading, signed] of OFF) {
  test(`flags off: ${p} shows "${heading}", never an error`, async ({ page }) => {
    if (signed) await v3SignedIn(page); else await mockV3(page);
    await page.goto(p);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    await expect(page.getByText("Something went wrong")).toHaveCount(0);
  });
}

test("flags off: the resume editor shows no profile-page panel and keeps its own visibility choice", async ({ page }) => {
  const profile = { slug: "ravi", handle: "Ravi", bio: null, city: null, state: null, languages: [], visibility: "private", games: [], stats: null, adultConfirmedAt: "2030-01-01T00:00:00.000Z", resumeConsentAt: null, createdAt: "2030-01-01T00:00:00.000Z", updatedAt: "2030-01-01T00:00:00.000Z" };
  await v3SignedIn(page, { ...adultOk, "GET /v3/me/profile": () => ({ body: { profile } }) });
  await page.goto("/app/resume/");
  await expect(page.getByRole("heading", { name: "Who can see your resume" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Profile page" })).toHaveCount(0);
});

test("flags off: no page links to the scrim finder or team pages, and nothing new is emitted in the build", async ({ page }) => {
  // Only meaningful for a build made with v3.scrims / v3.profiles off (the flag-off CI job); production has them on since 25 Nov 2026.
  test.skip(fs.readFileSync(path.resolve("out", "index.html"), "utf8").includes('href="/scrims/"'), "this build has the scrim finder on");
  await mockV3(page);
  await page.goto("/");
  await expect(page.locator('a[href="/scrims/"]')).toHaveCount(0);
  await expect(page.locator('a[href="/app/teams/"]')).toHaveCount(0);
  // phase pages are static shells only; no per-profile or per-scrim page exists in the export
  for (const dir of ["players", "teams", "scrims"]) {
    const out = path.resolve("out", dir);
    if (!fs.existsSync(out)) continue;
    const names = fs.readdirSync(out).filter((n) => fs.statSync(path.join(out, n)).isDirectory());
    expect(names.filter((n) => !["view", "new"].includes(n)), dir).toEqual([]);
  }
});

test("the phase routes are noindex", async ({ page }) => {
  await mockV3(page);
  for (const p of ["/scrims/", "/scrims/new/", "/teams/view/?s=x", "/players/view/?s=x", "/app/scrims/", "/app/teams/"]) {
    await page.goto(p);
    await expect(page.locator('meta[name="robots"]'), p).toHaveAttribute("content", /noindex/);
  }
});

test("flags off: /tournaments/ keeps its earlier page and is noindex with fewer than 5 upcoming tournaments", async ({ page }) => {
  await mockV3(page);
  await page.goto("/tournaments/");
  const info = JSON.parse((await page.locator("#eh-directory").textContent()) ?? "{}");
  expect(info.min).toBe(5);
  if (info.upcoming < 5) await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  if (info.mode !== "directory") await expect(page.getByRole("heading", { name: "Upcoming esports tournaments" })).toHaveCount(0);
});

// ---------- phase 3: profiles ----------
const CERT = { id: "cup:alpha wolves", tournament: { slug: "gokte-cup", title: "Gokte Cup", game: "bgmi" }, team: "Alpha Wolves", completedOn: "2030-01-05T00:00:00.000Z", record: { played: 3, wins: 2, draws: 0, losses: 1 }, battleRoyale: { matches: 2, wins: 1, bestPlacement: 1, kills: 18 }, source: "verified_results" };
const MATCH = { tournament: { slug: "gokte-cup", title: "Gokte Cup" }, team: "Alpha Wolves", stage: "main", round: 1, opponent: "Unlisted team", scoreFor: 13, scoreAgainst: 9, result: "win", corrected: true, playedAt: null };
const PLAYER = {
  kind: "player", slug: "ravi", handle: "RaviIGL", bio: "IGL from Pune", city: "Pune", state: "Maharashtra", languages: ["Hindi"], games: [{ game: "bgmi", inGameName: "Ravi", rankCode: null, rankOrdinal: null, roles: ["igl"] }],
  stats: { source: "verified_results", basis: "team_captain", tournaments: 1, matches: { played: 3, wins: 2, losses: 1, draws: 0 }, battleRoyale: { matches: 2, wins: 1, kills: 18, bestPlacement: 1, averagePlacement: 1.5 }, byGame: [] },
  visibility: "public", indexable: true, teams: [{ name: "Alpha Wolves", games: ["bgmi"], tournaments: 1, teamPageSlug: "abcdefghijkl" }], matches: [MATCH], battleRoyale: [{ tournament: MATCH.tournament, team: "Alpha Wolves", matchNo: 1, placement: 1, kills: 11, corrected: false }], certificates: [CERT], updatedAt: "2030-01-06T00:00:00.000Z",
};

test("a shared player profile shows teams, certificates and verified matches; reporting needs sign-in", async ({ page }) => {
  await mockV3(page, { "GET /public/profiles/players/ravi": () => ({ body: PLAYER }) });
  await page.goto("/players/view/?s=ravi");
  await expect(page.getByRole("heading", { level: 1, name: "RaviIGL" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Certificates" })).toBeVisible();
  await expect(page.getByText("Recorded by the organiser on Esports Hub")).toBeVisible();
  await expect(page.getByRole("link", { name: "Alpha Wolves" })).toHaveAttribute("href", "/teams/view/?s=abcdefghijkl");
  await expect(page.getByText("Corrected").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign in to report this page" })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await axe(page);
});

test("a Link only profile says so; a signed-in visitor can report it", async ({ page }) => {
  const seen = await v3SignedIn(page, { "GET /public/profiles/players/ravi": () => ({ body: { ...PLAYER, visibility: "unlisted", indexable: false } }), "POST /v3/profiles/players/ravi/report": () => ({ status: 202, body: { ok: true } }) });
  await page.goto("/players/view/?s=ravi");
  await expect(page.getByText("Link only: shared by its owner")).toBeVisible();
  await page.getByRole("button", { name: "Report this page" }).click();
  await page.getByLabel("What is wrong?").selectOption("contact_details");
  await page.getByRole("button", { name: "Send report" }).click();
  await expect(page.getByText("Thank you. A moderator will look at it.")).toBeVisible();
  expect(JSON.parse(seen.find((s) => s.path === "/v3/profiles/players/ravi/report")!.body).reason).toBe("contact_details");
});

test("a shared team page shows its tournaments and results", async ({ page }) => {
  await mockV3(page, { "GET /public/profiles/teams/abcdefghijkl": () => ({ body: { kind: "team", slug: "abcdefghijkl", name: "Alpha Wolves", blurb: "Pune squad", links: ["https://instagram.com/alphawolves"], visibility: "public", indexable: true, tournaments: [{ tournament: { slug: "gokte-cup", title: "Gokte Cup", game: "bgmi", status: "completed", startsAt: "2030-01-04T00:00:00.000Z", endsAt: null }, team: "Alpha Wolves" }], matches: [MATCH], battleRoyale: [], certificates: [CERT], updatedAt: "" } }) });
  await page.goto("/teams/view/?s=abcdefghijkl");
  await expect(page.getByRole("heading", { level: 1, name: "Alpha Wolves" })).toBeVisible();
  await expect(page.getByRole("link", { name: "instagram.com" })).toHaveAttribute("rel", /nofollow/);
  await expect(page.getByRole("link", { name: "Gokte Cup" }).first()).toBeVisible();
  await axe(page);
});

test("resume editor with v3.profiles on: Link only and Public need consent; hiding a tournament calls the API", async ({ page }) => {
  const profile = { slug: "ravi", handle: "Ravi", bio: null, city: null, state: null, languages: [], visibility: "private", games: [], stats: null, adultConfirmedAt: "2030-01-01T00:00:00.000Z", resumeConsentAt: null, createdAt: "2030-01-01T00:00:00.000Z", updatedAt: "2030-01-01T00:00:00.000Z" };
  const own = (over: Record<string, unknown> = {}) => ({ page: { slug: "ravi", visibility: "private", path: "/players/view/?s=ravi", indexable: false, indexBlockers: ["consent_required", "not_public"], hiddenByModeration: false, teams: [], entries: [{ itemKey: "cup:alpha wolves", tournament: { slug: "gokte-cup", title: "Gokte Cup", game: "bgmi", status: "completed", startsAt: null, endsAt: null }, team: "Alpha Wolves", hidden: false }], matches: [], battleRoyale: [], certificates: [{ ...CERT, hidden: false }], ...over } });
  const seen = await v3SignedIn(page, {
    ...adultOk, "GET /v3/me/profile": () => ({ body: { profile } }), "GET /v3/me/player-page": () => ({ body: own() }),
    "PUT /v3/me/player-page/hidden": ({ body }) => ({ body: own({ entries: [{ ...own().page.entries[0], hidden: (body as { hidden: boolean }).hidden }] }) }),
  });
  await page.goto("/app/resume/");
  await expect(page.getByRole("heading", { name: "Profile page" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Who can see your resume" })).toHaveCount(0); // the panel owns the choice now
  await expect(page.getByRole("radio", { name: /Link only/ })).toBeDisabled();
  await expect(page.getByText("You have not given consent to a shared resume.")).toBeVisible();
  await page.getByRole("button", { name: "Hide from page" }).click();
  await expect(page.getByText("Hidden from your public profile.")).toBeVisible();
  expect(JSON.parse(seen.find((s) => s.path === "/v3/me/player-page/hidden")!.body)).toEqual({ itemKey: "cup:alpha wolves", hidden: true });
  await axe(page);
});

test("my team pages: sharing needs the captain-permission tick; a captained tournament can be added", async ({ page }) => {
  const pageOf = (over: Record<string, unknown> = {}) => ({ page: { id: "tp1", slug: "abcdefghijkl", name: "Alpha Wolves", visibility: "private", path: "/teams/view/?s=abcdefghijkl", indexable: false, indexBlockers: ["not_public", "no_verified_results"], hiddenByModeration: false, entries: [], matches: [], battleRoyale: [], certificates: [], claimable: [{ tournament: { slug: "gokte-cup", title: "Gokte Cup" }, team: "Alpha Wolves" }], ...over }, consentStatement: "I have the team captain's permission to publish this page" });
  const seen = await v3SignedIn(page, {
    "GET /v3/me/team-pages": () => ({ body: { items: [{ id: "tp1", slug: "abcdefghijkl", name: "Alpha Wolves", visibility: "private", path: "/teams/view/?s=abcdefghijkl", indexable: false, indexBlockers: [], hiddenByModeration: false, tournaments: 0, certificates: 0 }], consentStatement: "x" } }),
    "GET /v3/me/team-pages/tp1": () => ({ body: pageOf() }),
    "PUT /v3/me/team-pages/tp1/visibility": ({ body }) => ({ body: pageOf({ visibility: (body as { visibility: string }).visibility }) }),
    "POST /v3/me/team-pages/tp1/claims": () => ({ body: pageOf({ claimable: [], entries: [{ itemKey: "gokte-cup:alpha wolves", tournament: { slug: "gokte-cup", title: "Gokte Cup", game: "bgmi", status: "completed", startsAt: null, endsAt: null }, team: "Alpha Wolves", hidden: false }] }) }),
  });
  await page.goto("/app/teams/");
  await page.getByRole("button", { name: "Manage" }).click();
  await expect(page.getByRole("radio", { name: /Public/ })).toBeDisabled();
  await page.getByRole("checkbox", { name: /captain's permission/ }).check();
  await page.getByRole("radio", { name: /Link only/ }).click(); // controlled: it turns checked once the API answers
  await expect(page.getByText("The team page opens for anyone with the link.")).toBeVisible();
  expect(JSON.parse(seen.find((s) => s.path === "/v3/me/team-pages/tp1/visibility")!.body)).toEqual({ visibility: "unlisted", consent: true });
  await page.getByLabel("Add a tournament you captained").selectOption("0");
  await page.getByRole("button", { name: "Add to the team page" }).click();
  await expect(page.getByText("Tournament added to the team page.")).toBeVisible();
  expect(JSON.parse(seen.find((s) => s.path === "/v3/me/team-pages/tp1/claims")!.body)).toEqual({ tournamentSlug: "gokte-cup", team: "Alpha Wolves" });
  await axe(page);
});

// ---------- phase 4: scrim finder ----------
const SLOT = { id: "s1", game: "bgmi", startsAt: "2030-12-06T15:30:00.000Z", region: "india", server: "Asia", skillNote: "Tier 2 squads", slotsTotal: 2, slotsLeft: 1, teamName: "Alpha Squad", createdAt: "2030-12-01T00:00:00.000Z" };

test("board: IST by default, filters go to the query string and the API as a UTC range, empty state", async ({ page }) => {
  const asked: string[] = [];
  await mockV3(page, { "GET /public/scrims": ({ url }) => { asked.push(url.search); return { body: { items: url.searchParams.get("game") === "valorant" ? [] : [SLOT], nextCursor: null } }; } });
  await page.goto("/scrims/");
  await expect(page.getByRole("heading", { level: 3, name: "Alpha Squad" })).toBeVisible();
  await expect(page.getByText(/9:00 pm IST/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign in to join" })).toBeVisible();
  await page.getByRole("radio", { name: "My device time" }).check();
  await expect(page.getByText(/your time/)).toBeVisible();
  await page.getByLabel("Date (India time)").fill("2030-12-06");
  await expect.poll(() => asked.at(-1)).toContain("from=2030-12-05T18%3A30%3A00.000Z");
  expect(page.url()).toContain("day=2030-12-06");
  await page.getByLabel("Game").selectOption("valorant");
  await expect(page.getByRole("heading", { name: "Nothing matches these filters" })).toBeVisible();
  await axe(page);
});

test("signed in: ask to join with a team page and a handle; report and block from the card", async ({ page }) => {
  const seen = await v3SignedIn(page, {
    "GET /v3/scrims": () => ({ body: { items: [{ ...SLOT, mine: false, myRequest: null }], nextCursor: null } }),
    "POST /v3/scrims/s1/requests": () => ({ status: 201, body: { id: "q1", status: "sent" } }),
    "POST /v3/scrims/s1/report": () => ({ status: 202, body: { ok: true } }),
    "POST /v3/scrims/s1/block": () => ({ body: { ok: true } }),
  });
  await teamPages(page);
  await page.goto("/scrims/");
  await page.getByRole("button", { name: "Ask to join" }).click();
  await page.getByLabel("Your team").selectOption("tp1");
  await page.getByLabel("Your contact").fill("beta_igl");
  await page.getByRole("button", { name: "Send request" }).click();
  await expect(page.getByText("Request sent.")).toBeVisible();
  expect(JSON.parse(seen.find((s) => s.path === "/v3/scrims/s1/requests")!.body)).toMatchObject({ teamProfileId: "tp1", contact: "beta_igl" });
  await page.getByRole("button", { name: "Done" }).click();
  await page.getByRole("button", { name: "Report or block" }).click();
  await page.getByRole("button", { name: "Send report" }).click();
  await expect(page.getByText("Thank you. A moderator will look at it.")).toBeVisible();
  await page.getByRole("button", { name: "Block", exact: true }).click();
  await expect.poll(() => seen.some((s) => s.path === "/v3/scrims/s1/block")).toBe(true);
});

test("post a scrim: India time is sent as UTC; contact must be a handle", async ({ page }) => {
  let posted: Record<string, unknown> = {};
  await v3SignedIn(page, { ...adultOk, "POST /v3/scrims": ({ body }) => { posted = body as Record<string, unknown>; return { status: 201, body: { ...SLOT, id: "s9", status: "open", expired: false, hidden: false, contact: "alpha#1", requests: { pending: 0, accepted: 0 } } }; } });
  await teamPages(page);
  await page.goto("/scrims/new/");
  await page.getByLabel("Your team").selectOption("tp1");
  await page.getByLabel("Game").selectOption("bgmi");
  // two days ahead, 21:00 India time (a scrim may be at most 30 days ahead)
  const ist = new Date(Date.now() + 2 * 86_400_000 + 330 * 60_000);
  const day = `${ist.getUTCFullYear()}-${String(ist.getUTCMonth() + 1).padStart(2, "0")}-${String(ist.getUTCDate()).padStart(2, "0")}`;
  const want = new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate(), 21, 0) - 330 * 60_000).toISOString();
  await page.getByLabel("Date").fill(day);
  await page.getByLabel("Start time").fill("21:00");
  await page.getByLabel("Teams needed").fill("4");
  await page.getByLabel("Your contact").fill("me@example.com");
  await page.getByRole("button", { name: "Post scrim" }).click();
  await expect(page.getByText("Use a game or Discord handle, not an email address.")).toBeVisible();
  await page.getByLabel("Your contact").fill("alpha#1");
  await page.getByRole("button", { name: "Post scrim" }).click();
  await expect(page.getByRole("heading", { name: "Scrim posted" })).toBeVisible();
  expect(posted).toMatchObject({ teamProfileId: "tp1", game: "bgmi", startsAt: want, region: "india", slots: 4, contact: "alpha#1" });
});

test("my scrims: accept a request and see its contact; withdraw a sent request; unblock", async ({ page }) => {
  let accepted = false;
  const req = () => ({ id: "q1", teamName: "Beta Squad", message: "We can play", status: accepted ? "accepted" : "sent", createdAt: "2030-12-01T00:00:00.000Z", respondedAt: null, contact: accepted ? "beta_igl" : null });
  const seen = await v3SignedIn(page, {
    "GET /v3/me/scrims": () => ({ body: { items: [{ ...SLOT, status: "open", expired: false, hidden: false, contact: "alpha#1", requests: { pending: accepted ? 0 : 1, accepted: accepted ? 1 : 0 } }] } }),
    "GET /v3/scrims/s1/requests": () => ({ body: { items: [req()] } }),
    "POST /v3/scrim-requests/q1/respond": () => { accepted = true; return { body: req() }; },
    "GET /v3/me/scrim-requests": () => ({ body: { items: [{ id: "q7", slotId: "s7", status: "accepted", game: "valorant", startsAt: "2030-12-07T15:30:00.000Z", region: "india", slotStatus: "open", teamName: "Gamma", myTeamName: "Alpha Squad", contact: "gamma#9" }] } }),
    "POST /v3/scrim-requests/q7/withdraw": () => ({ body: { id: "q7", status: "withdrawn" } }),
    "GET /v3/me/scrim-blocks": () => ({ body: { items: [{ id: "b1", label: "Pest Squad", createdAt: "2030-12-01T00:00:00.000Z" }] } }),
    "DELETE /v3/me/scrim-blocks/b1": () => ({ body: { ok: true } }),
  });
  await page.goto("/app/scrims/");
  await expect(page.getByText("Their contact: gamma#9")).toBeVisible();
  await page.getByRole("button", { name: "Requests" }).click();
  await expect(page.getByText("beta_igl")).toHaveCount(0); // no contact before acceptance
  await page.getByRole("button", { name: "Accept" }).click();
  await expect(page.getByText("beta_igl")).toBeVisible();
  await page.getByRole("button", { name: "Withdraw" }).click();
  await expect(page.getByText("Request withdrawn.")).toBeVisible();
  await page.getByRole("button", { name: "Unblock" }).click();
  await expect.poll(() => seen.some((s) => s.method === "DELETE" && s.path === "/v3/me/scrim-blocks/b1")).toBe(true);
  await axe(page);
});

test("a scrim API error is an error message, not a crash", async ({ page }) => {
  await mockV3(page, { "GET /public/scrims": (): ReturnType<Handler> => ({ status: 500, body: { error: "boom" } }) });
  await page.goto("/scrims/");
  await expect(page.getByRole("heading", { name: "That did not load" })).toBeVisible();
});

// ---------- phase 4b: the scrim manager ----------
test("board: a full scrim shows its open waitlist and a captain can join it", async ({ page }) => {
  const seen = await v3SignedIn(page, {
    "GET /v3/scrims": () => ({ body: { items: [{ ...SLOT, slotsLeft: 0, mine: false, myRequest: null }], nextCursor: null } }),
    "POST /v3/scrims/s1/waitlist": () => ({ status: 201, body: { id: "w1", requestId: "q9", status: "waiting" } }),
  });
  await teamPages(page);
  await page.goto("/scrims/");
  await expect(page.getByText("Full · waitlist open")).toBeVisible();
  await page.getByRole("button", { name: "Join the waitlist" }).click();
  await page.getByLabel("Your team").selectOption("tp1");
  await page.getByLabel("Your contact").fill("late_igl");
  await page.getByRole("button", { name: "Join the waitlist" }).last().click();
  await expect(page.getByText("You are on the waitlist.")).toBeVisible();
  expect(JSON.parse(seen.find((s) => s.path === "/v3/scrims/s1/waitlist")!.body)).toMatchObject({ teamProfileId: "tp1", contact: "late_igl" });
});

test("my scrims: a notice and a waitlist offer to accept in time; the poster's slot list with numbers and a remove button", async ({ page }) => {
  let accepted = false;
  const seen = await v3SignedIn(page, {
    "GET /v3/me/scrims": () => ({ body: { items: [{ ...SLOT, slotsLeft: 0, status: "full", expired: false, hidden: false, contact: "alpha#1", requests: { pending: 0, accepted: 2 } }] } }),
    "GET /v3/me/scrim-requests": () => ({ body: { items: [] } }),
    "GET /v3/me/scrim-blocks": () => ({ body: { items: [] } }),
    "GET /v3/me/scrim-schedules": () => ({ body: { items: [] } }),
    "GET /v3/me/scrim-notifications": () => ({ body: { unread: 1, items: [{ id: "n1", kind: "waitlist_offer", slotId: "s7", game: "valorant", startsAt: "2030-12-07T15:30:00.000Z", teamName: "Gamma", read: false, createdAt: "2030-12-01T00:00:00.000Z" }] } }),
    "POST /v3/me/scrim-notifications/read": () => ({ body: { ok: true } }),
    "GET /v3/me/scrim-waitlist": () => ({ body: { items: [{ id: "w7", slotId: "s7", status: accepted ? "accepted" : "offered", position: accepted ? null : 1, offerExpiresAt: "2030-12-07T15:00:00.000Z", game: "valorant", startsAt: "2030-12-07T15:30:00.000Z", teamName: "Gamma", myTeamName: "Alpha Squad", slotStatus: "open" }] } }),
    "POST /v3/scrim-waitlist/w7/accept": () => { accepted = true; return { body: { id: "w7", status: "accepted" } }; },
    "GET /v3/scrims/s1/roster": () => ({ body: { role: "poster", slot: { ...SLOT, slotsLeft: 0, status: "full" }, seats: [{ slotNo: 1, teamName: "Beta Squad", you: false, requestId: "q1", contact: "beta_igl" }, { slotNo: 2, teamName: "Delta Squad", you: false, requestId: "q2", contact: "delta#4" }], openSeats: [], waitlist: [{ position: 1, teamName: "Echo Squad", status: "waiting", offerExpiresAt: null, you: false, requestId: "q3" }] } }),
    "POST /v3/scrim-requests/q2/remove": () => ({ body: { id: "q2", status: "removed" } }),
  });
  await page.goto("/app/scrims/");
  await expect(page.getByText("A place opened for you: Gamma")).toBeVisible();
  await page.getByRole("button", { name: "Mark as read" }).click();
  await expect.poll(() => seen.some((s) => s.path === "/v3/me/scrim-notifications/read")).toBe(true);
  await expect(page.getByText(/Accept by .* IST or it passes to the next team/)).toBeVisible();
  await page.getByRole("button", { name: "Accept the place" }).click();
  await expect(page.getByText("You are in.")).toBeVisible();
  await page.getByRole("button", { name: "Slots and waitlist" }).click();
  await expect(page.getByText("#1 Beta Squad")).toBeVisible();
  await expect(page.getByText("1. Echo Squad · waiting")).toBeVisible();
  await page.getByRole("button", { name: "Remove" }).nth(1).click();
  await expect(page.getByText("Team removed. The next team on the waitlist gets an offer.")).toBeVisible();
  expect(seen.some((s) => s.path === "/v3/scrim-requests/q2/remove")).toBe(true);
  await axe(page);
});

test("recurring scrims: create one every day at 9 pm IST and skip a day", async ({ page }) => {
  const sched = { id: "sc1", teamName: "Alpha Squad", game: "bgmi", timeOfDay: "21:00", timeZone: "Asia/Kolkata", daysAhead: 3, region: "india", slots: 4, contact: "alpha#1", active: true, days: [{ day: "2030-12-06", skipped: false, slotId: "s6", startsAt: "2030-12-06T15:30:00.000Z", status: "open", confirmed: 1, slots: 4 }] };
  let list: unknown[] = [];
  const seen = await v3SignedIn(page, {
    "GET /v3/me/scrims": () => ({ body: { items: [] } }), "GET /v3/me/scrim-requests": () => ({ body: { items: [] } }), "GET /v3/me/scrim-blocks": () => ({ body: { items: [] } }),
    "GET /v3/me/scrim-schedules": () => ({ body: { items: list } }),
    "POST /v3/scrim-schedules": () => { list = [sched]; return { status: 201, body: sched }; },
    "POST /v3/scrim-schedules/sc1/days/2030-12-06/skip": () => { list = [{ ...sched, days: [{ ...sched.days[0], skipped: true, status: "cancelled" }] }]; return { body: list[0] }; },
  });
  await teamPages(page);
  await page.goto("/app/scrims/");
  const form = page.getByRole("form", { name: "New recurring scrim" });
  await form.getByLabel("Your team").selectOption("tp1");
  await form.getByLabel("Game").selectOption("bgmi");
  await form.getByLabel("Your contact").fill("alpha#1");
  await form.getByRole("button", { name: "Save recurring scrim" }).click();
  await expect(page.getByText("Recurring scrim saved.")).toBeVisible();
  expect(JSON.parse(seen.find((s) => s.path === "/v3/scrim-schedules")!.body)).toMatchObject({ teamProfileId: "tp1", game: "bgmi", timeOfDay: "21:00", daysAhead: 3, slots: 4 });
  await expect(page.getByText("every day 21:00 IST")).toBeVisible();
  await page.getByRole("button", { name: "Skip this day" }).click();
  await expect(page.getByText(/skipped/)).toBeVisible();
  await axe(page);
});
