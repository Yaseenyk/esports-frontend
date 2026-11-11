import fs from "node:fs";
import { expect, test } from "@playwright/test";
import { json, preflight, signedIn } from "./helpers";

const PAGES = ["/", "/games/", "/events/", "/communities/", "/arcade/", "/guides/", "/tools/", "/tools/id-cards/", "/tools/check-in/", "/tools/brackets/", "/tools/points-table/", "/tools/round-robin/", "/tools/double-elimination/", "/tools/display-screen/", "/tools/registration/", "/tools/schedule/", "/tools/plan/", "/tools/poster/", "/points-table/bgmi/", "/points-table/free-fire/", "/compare/free-tournament-software-india/", "/tools/certificates/", "/manage/", "/login/", "/signup/", "/gate/", "/about/", "/privacy/", "/terms/", "/contact/", "/guides/points-table/", "/guides/run-a-campus-tournament/"];

for (const path of PAGES) {
  test(`${path} loads with no errors and no sideways scroll`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => { if (m.type() === "error" && !/favicon|Failed to load resource/.test(m.text())) errors.push(m.text()); });
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1").first()).toBeVisible();
    await page.waitForLoadState("networkidle");
    const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(wide, "page scrolls sideways").toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
  });
}

test("an unknown address shows the not-found page", async ({ page }) => {
  const res = await page.goto("/no-such-page/");
  expect(res?.status()).toBe(404);
});

test("the navigation menu opens, lists the tools and closes with Escape", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /menu/i }).first().click();
  await expect(page.getByRole("dialog", { name: "Hub menu" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("games can be searched", async ({ page }) => {
  await page.goto("/games/");
  const box = page.getByRole("searchbox").or(page.getByPlaceholder(/search/i)).first();
  await box.fill("valorant");
  await expect(page.getByRole("link", { name: /valorant/i }).first()).toBeVisible();
});

test("the public tool pages are real, readable pages for search engines", async ({ page }) => {
  for (const [path, h1] of [["/tools/id-cards/", /ID card maker/i], ["/tools/check-in/", /attendance|check-in/i], ["/tools/brackets/", /bracket/i], ["/tools/points-table/", /points table/i]] as const) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(h1);
    await expect(page.getByRole("link", { name: /Create a free account/ }).first()).toHaveAttribute("href", "/signup/");
    expect(await page.locator('script[type="application/ld+json"]').count()).toBeGreaterThan(0);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  }
});

test("the website is open to search engines, but demo-data pages and the app are not", async ({ page, request }) => {
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Allow: /");
  expect(robots).toContain("Disallow: /app/");
  expect(robots).toContain("Sitemap:");
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/guides/points-table/");
  expect(sitemap).toContain("/tools/id-cards/");
  expect(sitemap).not.toContain("/games/");
  expect(sitemap).not.toContain("/events/");
  for (const [path, noindex] of [["/", false], ["/guides/", false], ["/guides/points-table/", false], ["/tools/brackets/", false], ["/about/", false], ["/games/", true], ["/events/", true], ["/communities/", true], ["/login/", true], ["/app/", true]] as const) {
    await page.goto(path);
    const meta = page.locator('meta[name="robots"]');
    if (noindex) await expect(meta).toHaveAttribute("content", /noindex/);
    else expect(await meta.count() === 0 || !/noindex/.test((await meta.getAttribute("content")) ?? "")).toBe(true);
  }
});

test("the home page and the guides carry real content, not demo data", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Free tournament tools for organisers/);
  await expect(page.locator("body")).not.toContainText(/made-up|sample data|Monsoon Clash/i);
  await page.goto("/guides/");
  await expect(page.locator("article, a.card").first()).toBeVisible();
  expect(await page.getByRole("heading", { level: 2 }).count()).toBeGreaterThanOrEqual(8);
  await page.goto("/guides/points-table/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/points table/i);
  await expect(page.getByRole("navigation", { name: "On this page" })).toBeVisible();
  await expect(page.getByRole("table").first()).toBeVisible();
});

test("the ID card maker opens on the public tool page with no account", async ({ page }) => {
  await page.goto("/tools/id-cards/");
  await page.getByRole("button", { name: "Open the ID card maker" }).click();
  await expect(page.getByText(/Step 1 of 4/)).toBeVisible({ timeout: 20000 });
});

test("the points table calculator ranks the example, reacts to changes and exports", async ({ page }) => {
  await page.goto("/tools/points-table/");
  const standings = page.getByRole("region", { name: "Standings table" });
  await expect(standings.getByRole("row").nth(1)).toContainText("Charlie");
  await expect(standings.getByRole("row").nth(1)).toContainText("34");
  // Give Alpha a better last match: their kills now decide the lead
  await page.getByLabel("Alpha, match 2, kills").fill("30");
  await expect(standings.getByRole("row").nth(1)).toContainText("Alpha");
  // A broken scale is explained, not silently ignored
  await page.getByLabel(/Placement points/).fill("ten, six");
  await expect(page.getByRole("alert").filter({ hasText: /numbers only/i })).toBeVisible();
  await page.getByLabel(/Placement points/).fill("10, 6, 5, 4, 3, 2, 1, 1");
  const [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download as CSV" }).click()]);
  expect(dl.suggestedFilename()).toBe("points-table.csv");
});

test("the contact form validates and sends", async ({ page }) => {
  await preflight(page);
  let sent: Record<string, unknown> | null = null;
  await page.route("**/esports-api.yaseenyk.workers.dev/public/contact", async (r) => { sent = r.request().postDataJSON(); await r.fulfill(json({ ok: true }, 201)); });
  await page.goto("/contact/");
  await expect(page.getByRole("button", { name: "Send message" })).toBeDisabled();
  await page.getByLabel(/Message/).fill("The points guide has a typo in the third table.");
  await page.getByLabel(/Your email/).fill("asha@example.com");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Thank you. Your message was sent.")).toBeVisible();
  expect((sent as unknown as Record<string, string>).website).toBe(""); // the bot trap stayed empty
});

test("the app sends a signed-out visitor to sign in and brings them back afterwards", async ({ page }) => {
  await preflight(page);
  await page.route("**/esports-api.yaseenyk.workers.dev/auth/login", (r) => r.fulfill(json({ token: "t", user: { id: "u", email: "a@example.com", name: "Asha Test" } })));
  await page.route("**/esports-api.yaseenyk.workers.dev/events", (r) => r.fulfill(json([])));
  await page.goto("/app/brackets/");
  await expect(page).toHaveURL(/\/login\/\?next=%2Fapp%2Fbrackets%2F/);
  await page.getByLabel("Email").fill("a@example.com");
  await page.getByLabel("Password").fill("correct horse");
  await page.getByRole("button", { name: "Sign in", exact: true }).last().click();
  await expect(page).toHaveURL(/\/app\/brackets\//);
  await expect(page.getByRole("heading", { name: "Bracket maker" })).toBeVisible();
});

test("a return address outside the app is ignored after sign-in", async ({ page }) => {
  await preflight(page);
  await page.route("**/esports-api.yaseenyk.workers.dev/auth/login", (r) => r.fulfill(json({ token: "t", user: { id: "u", email: "a@example.com", name: "Asha Test" } })));
  await page.route("**/esports-api.yaseenyk.workers.dev/events", (r) => r.fulfill(json([])));
  await page.goto("/login/?next=https%3A%2F%2Fevil.example%2F");
  await page.getByLabel("Email").fill("a@example.com");
  await page.getByLabel("Password").fill("correct horse");
  await page.getByRole("button", { name: "Sign in", exact: true }).last().click();
  await expect(page).toHaveURL(/localhost:\d+\/app\/$/);
});

test("every app screen opens after sign-in, and an expired sign-in returns to the sign-in page", async ({ page }) => {
  await signedIn(page, [{ id: "e1", key: "cup", name: "Spring Cup", game: "BGMI", organiser: "", date: "2026-12-01", venue: "Pune", emergency: "", rules: "", settings: {}, updatedAt: "" }]);
  await page.goto("/app/");
  await expect(page.getByRole("heading", { name: /Welcome, Olivia/ })).toBeVisible();
  await expect(page.getByText("Spring Cup")).toBeVisible();
  for (const [name, h1] of [["ID cards", /ID cards/], ["Gate check-in", /Gate check-in/], ["Brackets", /Bracket maker/], ["Account", /Account/]] as const) {
    await page.getByRole("navigation", { name: "App" }).getByRole("link", { name }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(h1);
  }
  // The server rejects the token: the person is signed out and sent to sign in.
  await page.route("**/esports-api.yaseenyk.workers.dev/events", (r) => r.fulfill(json({ error: "Authentication required" }, 401)));
  await page.getByRole("navigation", { name: "App" }).getByRole("link", { name: "Home" }).click();
  await expect(page).toHaveURL(/\/login\//, { timeout: 15000 });
});

test("the round robin generator makes fixtures, takes scores and ranks teams", async ({ page }) => {
  await page.goto("/tools/round-robin/");
  await expect(page.getByText(/5 teams, 5 rounds, 10 matches/)).toBeVisible();
  await expect(page.getByText(/has a bye/).first()).toBeVisible();
  const first = page.getByRole("group").filter({ hasText: "Round 1" }).locator("input").first();
  await first.fill("3");
  await page.getByRole("group").filter({ hasText: "Round 1" }).locator("input").nth(1).fill("1");
  const table = page.getByRole("region", { name: "League table" }).last();
  await expect(table.getByRole("row").nth(1)).toContainText("3"); // a win is worth 3 points
  await page.getByText("More options", { exact: true }).click(); // the home-and-away option is tucked under More options
  await page.getByLabel(/Play everyone twice/).check();
  await expect(page.getByText(/20 matches/).first()).toBeVisible();
  const [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download fixtures (CSV)" }).click()]);
  expect(dl.suggestedFilename()).toBe("round-robin-fixtures.csv");
});

test("the schedule maker works out the finish time and refuses bad input", async ({ page }) => {
  await page.goto("/tools/schedule/");
  await expect(page.getByText(/5 rounds/)).toBeVisible();
  await page.getByLabel("Number of matches").fill("8");
  await page.getByText("More options").first().click(); // lobbies and breaks are tucked away until asked for
  await page.getByLabel("Matches at the same time").fill("2");
  await expect(page.getByText(/4 rounds/)).toBeVisible();
  const table = page.getByRole("region", { name: "Schedule table" });
  await expect(table.getByRole("row").nth(1)).toContainText("10:00");
  await expect(table.getByRole("row").nth(1)).toContainText("M1, M2");
  await page.getByLabel("First match starts at").fill("");
  await expect(page.getByRole("alert").filter({ hasText: /start time/i })).toBeVisible();
});

test("the certificate maker previews a certificate and downloads a PDF with one page per name", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/tools/certificates/");
  await expect(page.getByText("Aarav Mehta").first()).toBeVisible();
  await page.getByLabel("Names, one per line").fill("आरव मेहता\nDiya Kulkarni");
  const [dl] = await Promise.all([page.waitForEvent("download", { timeout: 90_000 }), page.getByRole("button", { name: /Download PDF \(2\)/ }).click()]);
  expect(dl.suggestedFilename()).toBe("certificates.pdf");
  const bytes = fs.readFileSync((await dl.path())!);
  expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
  expect((bytes.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length).toBe(2);
});

test("the app shows an event with its numbers and warnings", async ({ page }) => {
  await signedIn(page, [{ id: "e1", key: "cup", name: "Spring Cup", game: "BGMI", organiser: "Guild", date: "2026-12-01", venue: "Pune", emergency: "", rules: "", settings: {}, updatedAt: "" }]);
  await page.route("**/esports-api.yaseenyk.workers.dev/events/e1/roster", (r) => r.fulfill(json({ teams: [{ id: "t1", name: "Kings" }], people: [{ id: "K-1", name: "A", teamId: "t1", role: "Player", minor: true, guardian: false, photoUrl: null }, { id: "K-2", name: "B", teamId: "t1", role: "Coach", minor: false, guardian: false, photoUrl: "/x" }] })));
  await page.route("**/esports-api.yaseenyk.workers.dev/events/e1/checkins", (r) => r.fulfill(json({ checkins: [], total: 2, checkedIn: 1 })));
  await page.goto("/app/events/");
  await page.getByRole("button", { name: /Spring Cup/ }).click();
  await expect(page.getByRole("heading", { name: "Spring Cup" })).toBeVisible();
  await expect(page.getByText("1 of 2")).toBeVisible();
  await expect(page.getByText(/without a guardian/).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Open the cards" })).toHaveAttribute("href", /open=e1/);
});

test("the double elimination bracket advances winners, drops losers and needs a reset only when the upset happens", async ({ page }) => {
  await page.goto("/tools/double-elimination/");
  await expect(page.getByText(/6 teams.*2 byes/)).toBeVisible();
  const winners = page.getByRole("region", { name: "Winners bracket rounds" });
  // Seed 3 plays seed 6 in round 1; pick the first listed team in the first playable match.
  await winners.getByRole("button", { name: /Mumbai Mavericks/ }).first().click();
  await expect(page.getByRole("region", { name: "Winners bracket rounds" })).toContainText("Mumbai Mavericks");
  await page.getByRole("button", { name: "Clear all results" }).click();
  await expect(page.getByText(/Reset final: only played if/)).toBeVisible();
  await expect(page.getByText(/Up to 10 matches, or 11/)).toBeVisible();
});

test("the registration page copies a form and adapts it to the team size", async ({ page }) => {
  await page.goto("/tools/registration/");
  const form = page.getByLabel("Registration form text");
  await expect(form).toContainText("Player 4");
  await expect(form).toContainText("Substitute 1");
  await page.getByRole("combobox", { name: /^Team size/ }).selectOption("solo");
  await expect(form).not.toContainText("Player 2");
  await page.getByLabel("Event name").fill("Spring Cup");
  await expect(form).toContainText("Spring Cup: team registration");
});

test("a captain registers a team through a registration link", async ({ page }) => {
  await preflight(page);
  await page.route("**/esports-api.yaseenyk.workers.dev/public/registration/tok", (r) => r.fulfill(json({ event: { name: "Spring Cup", date: "2026-12-01", venue: "Pune" }, form: { title: "Spring Cup registration", intro: "Bring your own device.", teamSize: 2, subs: 1, closesAt: null, spotsLeft: 5, status: "open" } })));
  let sent: Record<string, unknown> | null = null;
  await page.route("**/esports-api.yaseenyk.workers.dev/public/registration/tok/submit", async (r) => { sent = r.request().postDataJSON(); await r.fulfill(json({ ok: true }, 201)); });
  await page.goto("/register/?t=tok");
  await expect(page.getByRole("heading", { name: "Spring Cup registration" })).toBeVisible();
  await expect(page.getByText("5 places left")).toBeVisible();
  const send = page.getByRole("button", { name: "Register my team" });
  await expect(send).toBeDisabled();
  await page.getByLabel("Team name").fill("Konkan Kings");
  await page.getByLabel(/Captain.s name/).fill("Asha Captain");
  await page.getByLabel(/Captain.s phone or email/).fill("9999900000");
  await page.getByLabel(/Player 1, full name/).fill("Aarav Mehta");
  await page.getByLabel(/Player 2, full name/).fill("Diya Kulkarni");
  await send.click();
  await expect(page.getByText("Registered. Thank you.")).toBeVisible();
  const body = sent as unknown as { teamName: string; players: { name: string }[] };
  expect(body.teamName).toBe("Konkan Kings");
  expect(body.players.map((p) => p.name)).toEqual(["Aarav Mehta", "Diya Kulkarni"]);
});

test("a closed or unknown registration link says so", async ({ page }) => {
  await preflight(page);
  await page.route("**/esports-api.yaseenyk.workers.dev/public/registration/shut", (r) => r.fulfill(json({ event: { name: "Spring Cup", date: "", venue: "" }, form: { title: "", intro: "", teamSize: 4, subs: 1, closesAt: null, spotsLeft: 0, status: "full" } })));
  await page.route("**/esports-api.yaseenyk.workers.dev/public/registration/gone", (r) => r.fulfill(json({ error: "Not found" }, 404)));
  await page.goto("/register/?t=shut");
  await expect(page.getByText(/All places are taken/)).toBeVisible();
  await page.goto("/register/?t=gone");
  await expect(page.getByRole("alert").filter({ hasText: /not active/i })).toBeVisible();
  await page.goto("/register/");
  await expect(page.getByRole("alert").filter({ hasText: /incomplete/i })).toBeVisible();
});

test("an organiser sets up registration and approves a team in the app", async ({ page }) => {
  await signedIn(page, [{ id: "e1", key: "cup", name: "Spring Cup", game: "BGMI", organiser: "Guild", date: "2026-12-01", venue: "Pune", emergency: "", rules: "", settings: {}, updatedAt: "" }]);
  await page.route("**/esports-api.yaseenyk.workers.dev/events/e1/roster", (r) => r.fulfill(json({ teams: [], people: [] })));
  await page.route("**/esports-api.yaseenyk.workers.dev/events/e1/checkins", (r) => r.fulfill(json({ checkins: [], total: 0, checkedIn: 0 })));
  let created = false, approved = false;
  await page.route("**/esports-api.yaseenyk.workers.dev/events/e1/registration", async (r) => {
    const m = r.request().method();
    if (m === "PUT") { created = true; return r.fulfill(json({ token: "tok123", title: "Cup", intro: "", closesAt: null, maxTeams: null, teamSize: 4, subs: 1, open: true, createdAt: "" }, 201)); }
    return r.fulfill(json({ form: created ? { token: "tok123", title: "Cup", intro: "", closesAt: null, maxTeams: null, teamSize: 4, subs: 1, open: true, createdAt: "" } : null, counts: { pending: approved ? 0 : 1, approved: approved ? 1 : 0, rejected: 0 } }));
  });
  await page.route("**/esports-api.yaseenyk.workers.dev/events/e1/registrations?status=pending", (r) => r.fulfill(json(approved ? [] : [{ id: "r1", teamName: "Konkan Kings", captainName: "Asha", captainContact: "9999900000", players: [{ name: "Aarav", ign: "AM", minor: false }, { name: "Diya", ign: "DK", minor: true }], notes: "", status: "pending", createdAt: "" }])));
  await page.route("**/esports-api.yaseenyk.workers.dev/events/e1/registrations/r1/approve", (r) => { approved = true; return r.fulfill(json({ ok: true, teamId: "R1", people: 2 })); });
  await page.goto("/app/events/?id=e1");
  await expect(page.getByRole("heading", { name: "Spring Cup" })).toBeVisible();
  await page.getByRole("button", { name: "Create the registration link" }).click();
  await expect(page.getByText(/register\/\?t=tok123/)).toBeVisible();
  await page.getByRole("button", { name: "Refresh" }).first().click();
  await expect(page.getByText("Konkan Kings")).toBeVisible();
  await expect(page.getByText(/under 18/).first()).toBeVisible();
  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByText(/added to the roster \(2 people\)/)).toBeVisible();
});

test("the registration page can be read in Hindi and Marathi", async ({ page }) => {
  await preflight(page);
  await page.route("**/esports-api.yaseenyk.workers.dev/public/registration/tok", (r) => r.fulfill(json({ event: { name: "Spring Cup", date: "", venue: "" }, form: { title: "", intro: "", teamSize: 2, subs: 1, closesAt: null, spotsLeft: 3, status: "open" } })));
  await page.goto("/register/?t=tok");
  await expect(page.getByRole("heading", { name: "Register for Spring Cup" })).toBeVisible();
  await page.getByRole("button", { name: "हिन्दी" }).click();
  await expect(page.getByRole("heading", { name: "Spring Cup के लिए पंजीकरण करें" })).toBeVisible();
  await expect(page.getByText("3 स्थान बचे हैं")).toBeVisible();
  await expect(page.getByRole("button", { name: "मेरी टीम पंजीकृत करें" })).toBeVisible();
  await page.getByRole("button", { name: "मराठी" }).click();
  await expect(page.getByRole("button", { name: "माझी टीम नोंदवा" })).toBeVisible();
  await expect(page.getByText("3 जागा शिल्लक")).toBeVisible();
});

test("the owner can add an organiser by email, and a shared event shows its role", async ({ page }) => {
  await signedIn(page, [{ id: "e1", key: "cup", name: "Spring Cup", game: "BGMI", organiser: "", date: "", venue: "", emergency: "", rules: "", settings: {}, updatedAt: "", role: "owner" }, { id: "e2", key: "lan", name: "LAN Night", game: "", organiser: "", date: "", venue: "", emergency: "", rules: "", settings: {}, updatedAt: "", role: "viewer" }]);
  await page.route("**/esports-api.yaseenyk.workers.dev/events/e1/roster", (r) => r.fulfill(json({ teams: [], people: [] })));
  await page.route("**/esports-api.yaseenyk.workers.dev/events/e1/checkins", (r) => r.fulfill(json({ checkins: [], total: 0, checkedIn: 0 })));
  await page.route("**/esports-api.yaseenyk.workers.dev/events/e1/registration", (r) => r.fulfill(json({ form: null, counts: { pending: 0, approved: 0, rejected: 0 } })));
  let added = false;
  await page.route("**/esports-api.yaseenyk.workers.dev/events/e1/members", async (r) => {
    if (r.request().method() === "POST") { added = true; return r.fulfill(json({ userId: "u2", name: "Eddie Editor", email: "eddie@example.com", role: "editor" }, 201)); }
    return r.fulfill(json({ owner: { userId: "u", name: "Olivia", email: "olivia@example.com" }, members: added ? [{ userId: "u2", name: "Eddie Editor", email: "eddie@example.com", role: "editor", addedAt: "" }] : [] }));
  });
  await page.goto("/app/events/");
  await expect(page.getByText(/Shared with you . view only/)).toBeVisible();
  await page.getByRole("button", { name: /Spring Cup/ }).click();
  const panel = page.getByRole("region", { name: "Organisers" });
  await panel.getByLabel("Their email").fill("eddie@example.com");
  await panel.getByRole("button", { name: "Add", exact: true }).click();
  await expect(panel.getByText("Eddie Editor").first()).toBeVisible();
  await expect(panel.getByText("now has edit access")).toBeVisible();
});

test("a view-only organiser sees the event with a notice and no access controls", async ({ page }) => {
  await signedIn(page, [{ id: "e2", key: "lan", name: "LAN Night", game: "", organiser: "", date: "", venue: "", emergency: "", rules: "", settings: {}, updatedAt: "", role: "viewer" }]);
  await page.route("**/esports-api.yaseenyk.workers.dev/events/e2/roster", (r) => r.fulfill(json({ teams: [], people: [] })));
  await page.route("**/esports-api.yaseenyk.workers.dev/events/e2/checkins", (r) => r.fulfill(json({ checkins: [], total: 0, checkedIn: 0 })));
  await page.route("**/esports-api.yaseenyk.workers.dev/events/e2/registration", (r) => r.fulfill(json({ form: null, counts: { pending: 0, approved: 0, rejected: 0 } })));
  await page.goto("/app/events/?id=e2");
  await expect(page.getByText(/view-only access/i)).toBeVisible();
  await expect(page.getByRole("region", { name: "Organisers" })).toHaveCount(0);
});

test("the home page keeps its motion and imagery, and the content is in the page before any script runs", async ({ page, request }) => {
  // What a search engine reads first: the plain HTML, with the real numbers and no placeholder zeros.
  const html = await (await request.get("/")).text();
  expect(html).toContain("for organisers: from"); // the headline text, with the highlighted words in their own span
  expect(html).toMatch(/<dd[^>]*><span>23<\/span><\/dd>/);
  expect(html).not.toMatch(/<dd[^>]*><span>0<\/span><\/dd>/);
  // What a person sees: the game strip, the floating game icons and the animated hero cards arrive after the page has settled.
  await page.goto("/");
  await expect(page.locator(".marquee-track")).toHaveCount(1);
  await expect(page.locator("img[src*='/games/']").first()).toBeAttached();
  await page.waitForLoadState("networkidle");
  if ((page.viewportSize()?.width ?? 0) >= 1024) {
    await expect(page.locator(".hero-art")).toBeVisible({ timeout: 10_000 });
    expect(await page.locator(".hero-art .animate-float").count()).toBeGreaterThanOrEqual(6);
    expect(await page.locator(".hero-art img").count()).toBeGreaterThanOrEqual(4);
  }
});

test("a display screen shows a table from its link, bare of site chrome, and a damaged link is explained", async ({ page, request }) => {
  await page.goto("/tools/points-table/");
  const [screen] = await Promise.all([page.waitForEvent("popup"), page.getByRole("button", { name: "Open the screen" }).click()]);
  await screen.waitForLoadState("load");
  await expect(screen.getByRole("heading", { name: "Standings" })).toBeVisible();
  await expect(screen.getByText("Charlie").first()).toBeVisible();
  await expect(screen.locator("nav, footer")).toHaveCount(0); // nothing from the website is on a TV
  await expect(screen.locator("canvas.hexfield")).toBeHidden();
  // A separate browser profile, so the open tool page cannot answer the screen over the live channel.
  const bad = await (await page.context().browser()!.newContext()).newPage();
  await bad.goto("/display/#d=z.not-valid");
  await expect(bad.getByText("This screen link is damaged")).toBeVisible();
  await bad.goto("/display/");
  await expect(bad.getByText("Waiting for a view")).toBeVisible();
  expect((await request.get("/robots.txt")).ok()).toBe(true);
});

test("a screen follows the tool it was opened from, live", async ({ page }) => {
  await page.goto("/tools/points-table/");
  const [screen] = await Promise.all([page.waitForEvent("popup"), page.getByRole("button", { name: "Open the screen" }).click()]);
  await screen.waitForLoadState("load");
  const first = screen.getByRole("row").nth(1).or(screen.locator("li").first());
  await expect(screen.locator("li").first()).toContainText("Charlie");
  await page.getByLabel("Alpha, match 2, kills").fill("30"); // Alpha now leads
  await expect(screen.locator("li").first()).toContainText("Alpha", { timeout: 10_000 });
  void first;
});

test("the countdown, transparent background and look settings work from the address", async ({ page }) => {
  const soon = new Date(Date.now() + 3 * 3600_000 + 30_000).toISOString();
  await page.goto(`/display/?v=countdown&t=${encodeURIComponent(soon)}&title=Spring%20Cup&sub=Doors%20open%20soon&bg=transparent&theme=neon`);
  await expect(page.getByRole("heading", { name: "Spring Cup" })).toBeVisible();
  await expect(page.getByText("hours", { exact: true })).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await page.goto(`/display/?v=countdown&t=${encodeURIComponent(new Date(Date.now() - 1000).toISOString())}&title=Go`);
  await expect(page.getByText("LIVE NOW")).toBeVisible();
});

test("the schedule screen marks the round on now and the next round", async ({ page }) => {
  const d = new Date();
  const ymd = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  const a = new Date(d.getTime() - 10 * 60_000), b = new Date(d.getTime() + 30 * 60_000), c = new Date(d.getTime() + 40 * 60_000), e = new Date(d.getTime() + 80 * 60_000);
  // The schedule is on the day it starts. A time on the next day is written with "(+1d)", so the test also holds when it runs just after midnight.
  const day = ymd(a);
  const hh = (x: Date) => `${String(x.getHours()).padStart(2, "0")}:${String(x.getMinutes()).padStart(2, "0")}${ymd(x) === day ? "" : " (+1d)"}`;
  const payload = { v: "schedule", d: { title: "Run-sheet", date: day, slots: [{ n: 1, start: hh(a), end: hh(b), label: "M1, M2", breakAfter: 0 }, { n: 2, start: hh(c), end: hh(e), label: "M3, M4", breakAfter: 0 }] } };
  await page.goto("/tools/display-screen/");
  const hash = await page.evaluate(async (p) => { const bytes = new TextEncoder().encode(JSON.stringify(p)); let s = ""; for (const x of bytes) s += String.fromCharCode(x); return "p." + btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }, payload);
  await page.goto(`/display/#d=${hash}`);
  await expect(page.getByText("NOW", { exact: true })).toBeVisible();
  await expect(page.getByText("NEXT", { exact: true })).toBeVisible();
});

test("the display screen page explains itself and previews each screen", async ({ page }) => {
  await page.goto("/tools/display-screen/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/scoreboard/i);
  for (const name of ["Battle royale standings", "League table", "Run-sheet", "Countdown", "Knockout bracket"]) {
    await page.getByRole("button", { name }).click();
    await expect(page.locator("iframe")).toHaveAttribute("src", /\/display\//);
  }
});

test("both bracket tools open a bracket screen that follows the results", async ({ page }) => {
  await page.goto("/tools/brackets/");
  const [screen] = await Promise.all([page.waitForEvent("popup"), page.getByRole("button", { name: "Open the screen" }).click()]);
  await screen.waitForLoadState("load");
  await expect(screen.getByText("Sample Squad A").first()).toBeVisible();
  await expect(screen.getByText("Quarter-finals")).toBeVisible();
  await expect(screen.locator("nav, footer")).toHaveCount(0);
  await screen.close(); // the tools reuse one named screen window, so close it before opening the next
  await page.goto("/tools/double-elimination/");
  const [dscreen] = await Promise.all([page.waitForEvent("popup"), page.getByRole("button", { name: "Open the screen" }).click()]);
  await dscreen.waitForLoadState("load");
  await expect(dscreen.getByText("Winners bracket")).toBeVisible();
  await expect(dscreen.getByText("Losers bracket")).toBeVisible();
  await expect(dscreen.getByText("Konkan Kings").first()).toBeVisible();
});

test("a number box can be cleared and retyped, and stays inside its limits", async ({ page }) => {
  await page.goto("/tools/schedule/");
  const box = page.getByLabel("Minutes per match");
  await box.fill("");
  await expect(box).toHaveValue(""); // the box is left alone while it is empty
  await box.pressSequentially("25");
  await expect(box).toHaveValue("25");
  await box.fill("9999");
  await page.getByLabel("Number of matches").focus(); // leaving the box shows the real value again
  await expect(box).toHaveValue("600");
  await page.goto("/tools/points-table/");
  const kill = page.getByLabel("Points per kill");
  await kill.fill("");
  await kill.pressSequentially("2.5");
  await expect(kill).toHaveValue("2.5");
});

test("round robin ignores repeated names and treats a team called Bye as a team", async ({ page }) => {
  await page.goto("/tools/round-robin/");
  await page.getByLabel("One team per line").fill("Alpha\nalpha\nBravo\n\n  \nBye");
  await expect(page.getByText(/3 teams, 3 rounds, 3 matches/)).toBeVisible();
  await expect(page.getByText(/1 repeated name was ignored/)).toBeVisible();
  await page.getByLabel("One team per line").fill(Array.from({ length: 41 }, (_, i) => `Team ${i}`).join("\n"));
  await expect(page.getByText(/too many for a round robin/)).toBeVisible();
});

test("changing an early double elimination result clears the results built on it", async ({ page }) => {
  await page.goto("/tools/double-elimination/");
  await page.getByLabel("One team per line").fill("Ace\nBolt\nCrow\nDove");
  const pressed = page.locator('[aria-pressed="true"]');
  const base = await pressed.count(); // the screen design picker on this page has one selected design of its own
  const winners = page.getByRole("region", { name: "Winners bracket rounds" });
  await winners.getByRole("button", { name: /Ace/ }).first().click(); // Ace beats Dove
  await winners.getByRole("button", { name: /Bolt/ }).first().click(); // Bolt beats Crow
  await winners.getByRole("button", { name: /Ace/ }).last().click(); // Ace beats Bolt in the winners final
  await expect(pressed).toHaveCount(base + 3);
  await winners.getByRole("button", { name: /Dove/ }).first().click(); // change: Dove now beats Ace
  await expect(pressed).toHaveCount(base + 2); // the winners final was forgotten, because Ace is no longer in it
});

test("a display screen shows hostile text as plain text, follows a changed link and survives a bad live message", async ({ page }) => {
  const encode = (p: unknown) => page.evaluate(async (x) => { const bytes = new TextEncoder().encode(JSON.stringify(x)); let s = ""; for (const b of bytes) s += String.fromCharCode(b); return "p." + btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }, p);
  await page.goto("/tools/display-screen/");
  const evil = "<img src=x onerror=\"window.__pwned=1\">";
  const one = await encode({ v: "table", d: { title: evil, head: ["#", "Team", "Pts"], rows: [["1", evil, "9"]], strong: 2 } });
  const two = await encode({ v: "table", d: { title: "Second view", head: ["#", "Team", "Pts"], rows: [["1", "Zed", "4"]], strong: 2 } });
  await page.goto(`/display/#d=${one}`);
  await expect(page.locator("h1:not(.sr-only)")).toHaveText(evil);
  expect(await page.evaluate(() => (window as unknown as { __pwned?: number }).__pwned)).toBeUndefined();
  expect(await page.locator("img[src='x']").count()).toBe(0);
  await page.evaluate((h) => { location.hash = `d=${h}`; }, two);
  await expect(page.locator("h1:not(.sr-only)")).toHaveText("Second view");
  await page.evaluate(() => { const c = new BroadcastChannel("eh-display"); c.postMessage({ payload: { v: "table", d: { head: null, rows: 5 } } }); c.postMessage({ payload: null }); c.close(); });
  await page.waitForTimeout(300);
  await expect(page.locator("h1:not(.sr-only)")).toHaveText("Second view");
});

test("the menu search opens a result with Enter, and a number key for the page you are on closes the menu", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /menu/i }).first().click();
  const box = page.getByRole("dialog", { name: "Hub menu" }).getByRole("combobox");
  await box.fill("valorant");
  await expect(page.getByRole("option").first()).toBeVisible();
  await box.press("Enter");
  await expect(page).toHaveURL(/valorant/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goto("/tools/");
  await page.keyboard.press("m");
  await expect(page.getByRole("dialog", { name: "Hub menu" })).toBeVisible();
  await page.keyboard.press("1"); // Tools: the page we are already on
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
