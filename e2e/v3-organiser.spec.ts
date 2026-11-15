// Organiser tournament screens and dispute corrections. The API is MOCKED with route interception (a small stateful fake of API.md section 2):
// nothing here reaches the real backend. Run one project at a time:  npx playwright test e2e/v3-organiser.spec.ts --project=desktop
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { DISPUTE, json, mockV3, signedIn, type Handler } from "./v3-helpers";

test.setTimeout(120_000);

const EV = { id: "e1", name: "Gokte Cup", game: "BGMI", date: "2026-12-01", role: "owner" };
const EV2 = { id: "e2", name: "Spring Showdown", game: "Free Fire", date: "2026-12-05", role: "owner" };
const EV3 = { id: "e3", name: "Someone else's cup", game: "BGMI", date: "2026-12-09", role: "viewer" };

type T = Record<string, unknown>;
/** n characters of plain text that neither starts nor ends with a space. */
const text = (n: number) => `${"squads play six matches ".repeat(Math.ceil(n / 20))}`.slice(0, n - 1) + "x";

function failuresOf(t: T): string[] {
  const f: string[] = [];
  if (String(t.summary ?? "").length < 80) f.push("summary_80");
  if (String(t.description ?? "").length < 200) f.push("description_200");
  if (!t.startsAt) f.push("start_date");
  if (t.status !== "registration_open") f.push("registration_or_results");
  if (!t.publishedAt || t.status === "draft") f.push("published");
  return f;
}
const MOVES: Record<string, string[]> = { draft: ["published", "cancelled"], published: ["registration_open", "cancelled"], registration_open: ["registration_closed", "cancelled"], registration_closed: ["live", "cancelled"], live: ["completed", "cancelled"], completed: [], cancelled: [] };

/** A fake of the organiser routes for ONE event. `state.t` is the tournament (null = none yet). */
function backend(eventId: string, opt: { initial?: T | null; disputeStatuses?: string[] | null; serverDisputesOpen?: boolean } = {}) {
  const state: { t: T | null; calls: { method: string; path: string; body: unknown }[] } = { t: opt.initial ?? null, calls: [] };
  const withFailures = (t: T) => ({ ...t, seoFailures: failuresOf(t), seoReady: failuresOf(t).length === 0 });
  const base = `/v3/events/${eventId}/tournament`;
  const handlers: Record<string, Handler> = {
    "GET /public/tournaments": () => ({ body: { items: [] } }),
    "GET /public/tournaments/taken-cup": () => ({ body: { tournament: { slug: "taken-cup", title: "Taken Cup" } } }),
    [`GET ${base}`]: () => (state.t ? { body: withFailures(state.t) } : undefined),
    [`POST ${base}`]: ({ body }) => {
      state.calls.push({ method: "POST", path: base, body });
      const b = body as T;
      if (b.slug === "taken-cup") return { status: 409, body: { error: "That slug is taken", code: "slug_taken" } };
      state.t = { id: "t1", eventId, slug: b.slug ?? String(b.title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), status: "draft", publishedAt: null, venue: "online", ...b };
      return { status: 201, body: withFailures(state.t) };
    },
    [`PUT ${base}`]: ({ body }) => {
      state.calls.push({ method: "PUT", path: base, body });
      const b = body as T;
      if (!state.t) return undefined;
      if (b.slug !== undefined && b.slug !== state.t.slug && state.t.publishedAt) return { status: 409, body: { error: "locked", code: "slug_locked" } };
      state.t = { ...state.t, ...b };
      return { body: withFailures(state.t) };
    },
    [`POST ${base}/status`]: ({ body }) => {
      const to = String((body as T).to);
      state.calls.push({ method: "POST", path: `${base}/status`, body });
      const t = state.t;
      if (!t) return undefined;
      const from = String(t.status);
      if (!MOVES[from]?.includes(to)) return { status: 409, body: { error: "bad", code: "bad_transition", from, allowed: MOVES[from] } };
      if (to === "registration_open" && (!t.description || !t.startsAt)) return { status: 409, body: { error: "needs", code: "needs_description_and_start" } };
      if (to === "completed" && opt.serverDisputesOpen) return { status: 409, body: { error: "disputes", code: "disputes_open" } };
      state.t = { ...t, status: to, publishedAt: t.publishedAt ?? (to === "published" ? "2026-11-16T00:00:00.000Z" : null) };
      return { body: withFailures(state.t) };
    },
  };
  if (opt.disputeStatuses) handlers[`GET /v3/tournaments/${state.t?.slug ?? "gokte-cup"}/disputes`] = () => ({ body: { items: opt.disputeStatuses!.map((s, i) => ({ ...DISPUTE, id: `d${i}`, status: s })) } });
  return { state, handlers };
}

const FULL: T = { id: "t1", eventId: "e1", slug: "gokte-cup", title: "Gokte Cup 2026", game: "bgmi", format: "battle_royale_points", status: "draft", venue: "offline", city: "Pune", state: "Maharashtra", summary: text(90), description: text(220), rules: null, maxTeams: 16, startsAt: "2026-12-20T04:30:00.000Z", endsAt: null, publishedAt: null };

async function organiser(page: Page, handlers: Record<string, Handler> = {}, events: unknown[] = [EV, EV2, EV3]) {
  await signedIn(page, events);
  return mockV3(page, handlers);
}

// ---------- "Not available yet" ----------
for (const path of ["/app/tournaments/", "/app/tournaments/manage/?id=e1"]) {
  test(`${path} says "Not available yet" when every v3 call answers 404 (flag off)`, async ({ page }) => {
    await organiser(page); // no handlers: the same 404 production gives
    await page.goto(path);
    await expect(page.getByRole("heading", { name: "Not available yet" })).toBeVisible();
    await expect(page.getByText("Something went wrong")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Create tournament" })).toHaveCount(0);
  });
}

test("the new routes are noindex and nothing is added to the public nav or footer", async ({ page }) => {
  await organiser(page);
  for (const p of ["/app/tournaments/", "/app/tournaments/manage/?id=e1"]) {
    await page.goto(p);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  }
  await page.goto("/");
  await expect(page.locator('footer a[href="/tournaments/"], footer a[href="/lft/"], footer a[href^="/app/tournaments"]')).toHaveCount(0);
  expect(await page.locator("a[href*='/app/tournaments']").count()).toBe(0);
});

// ---------- list ----------
test("list: tournament pages, events without one, view-only events left out", async ({ page }) => {
  const b1 = backend("e1", { initial: FULL });
  await organiser(page, { ...b1.handlers });
  await page.goto("/app/tournaments/");
  await expect(page.getByRole("heading", { name: "Your tournament pages" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Gokte Cup 2026" })).toBeVisible();
  await expect(page.getByText("Draft", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Events without a tournament page" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Spring Showdown" })).toBeVisible();
  await expect(page.getByText("Someone else's cup")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Manage/ })).toHaveAttribute("href", "/app/tournaments/manage/?id=e1");
  await page.getByRole("link", { name: /Create tournament/ }).click();
  await expect(page).toHaveURL(/manage\/\?id=e2/);
});

// ---------- create -> edit -> publish ----------
test("create, edit, publish: the happy path through the state machine", async ({ page }) => {
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  const b = backend("e2");
  await organiser(page, b.handlers);
  await page.goto("/app/tournaments/manage/?id=e2");
  await expect(page.getByRole("heading", { name: "Create tournament", level: 1 })).toBeVisible();
  await expect(page.getByLabel("Title", { exact: true })).toHaveValue("Spring Showdown"); // from the event's name
  await expect(page.getByLabel("Page address")).toHaveValue("spring-showdown"); // suggested from the title

  // checklist before anything is written
  const list = page.locator("section[aria-labelledby=chk-h]");
  await expect(list.getByText("Missing:").first()).toBeVisible();
  await expect(list).toContainText("mainly for sharing the link");

  // validation
  await page.getByRole("button", { name: "Create tournament" }).click();
  await expect(page.getByText("Choose the game.")).toBeVisible();
  await expect(page.getByText("Choose the format.")).toBeVisible();

  await page.getByLabel("Game", { exact: true }).selectOption("free_fire");
  await page.getByLabel("Format", { exact: true }).selectOption("single_elimination");
  await page.getByLabel("Venue", { exact: true }).selectOption("offline");
  await page.getByLabel("City", { exact: true }).fill("Pune");
  await page.getByLabel("Starts (your local time)").fill("2026-12-20T10:00");
  await page.getByLabel("Summary", { exact: true }).fill("Short summary.");
  await page.getByLabel(/^Description/).fill("# About\n\nSquads of four. **Six** matches.\n- Room at 5:45 pm");
  await expect(page.getByText("Plain-text preview")).toBeVisible();
  await expect(page.locator("p.whitespace-pre-line").filter({ hasText: "Squads of four. Six matches." })).toContainText("\u2022 Room at 5:45 pm");
  await page.getByRole("button", { name: "Create tournament" }).click();
  await expect(page.getByText("Tournament created as a draft")).toBeVisible();
  const create = b.state.calls[0].body as T;
  expect(create).toMatchObject({ title: "Spring Showdown", game: "free_fire", format: "single_elimination", venue: "offline", city: "Pune", slug: "spring-showdown", summary: "Short summary." });
  expect(create.description).toBe("About\n\nSquads of four. Six matches.\n\u2022 Room at 5:45 pm"); // markdown stored as plain text
  expect(String(create.startsAt)).toMatch(/^2026-12-20T\d\d:\d\d:00\.000Z$/);
  await expect(page.getByRole("heading", { name: "Spring Showdown", level: 1 })).toBeVisible();

  // status panel: a draft offers publish and cancel only
  await expect(page.getByRole("button", { name: "Publish the page" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Open registration" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Cancel the tournament" })).toBeVisible();
  await expect(page.getByText("The public link works after you publish")).toBeVisible();

  // edit: only the changed field is sent
  await page.getByLabel("Summary", { exact: true }).fill(text(95));
  await expect(page.getByText("You have unsaved changes.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Publish the page" })).toBeDisabled(); // unsaved edits block a move
  await expect(page.getByText("Save your changes first").first()).toBeVisible();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Saved.")).toBeVisible();
  expect(b.state.calls[1]).toMatchObject({ method: "PUT", body: { summary: text(95) } });
  expect(Object.keys(b.state.calls[1].body as T)).toEqual(["summary"]);
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Nothing has changed.")).toBeVisible();

  // publish
  await page.getByRole("button", { name: "Publish the page" }).click();
  await expect(page.getByText("Status is now: Published.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Open registration" })).toBeEnabled(); // any description and a start date satisfy the state machine...
  await expect(page.locator("section[aria-labelledby=chk-h]").getByText(/description of 200+/).locator("..")).toContainText("Missing"); // ...but a short one will not get the page indexed

  // the address is locked and the page says so
  await expect(page.getByLabel("Page address")).toBeDisabled();
  await expect(page.getByText("Locked: this page has been published")).toBeVisible();

  // share block with a copy button
  const url = "https://esports.streamerosai.com/tournaments/spring-showdown/";
  await expect(page.getByRole("heading", { name: "Share" })).toBeVisible();
  await expect(page.getByText(url)).toBeVisible();
  await page.getByRole("button", { name: "Copy link" }).click();
  await expect(page.getByText("Link copied.")).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(url);

  // description written: registration can open
  await page.getByLabel(/^Description/).fill(text(230));
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Saved.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Open registration" })).toBeEnabled();
  await page.getByRole("button", { name: "Open registration" }).click();
  await expect(page.getByText("Status is now: Registration open.")).toBeVisible();
  await expect(page.locator("section[aria-labelledby=chk-h]")).toContainText("Every line is done");
  expect(b.state.calls.filter((c) => c.path.endsWith("/status")).map((c) => (c.body as T).to)).toEqual(["published", "registration_open"]);

  // links to the legacy registrations queue and the disputes queue
  await expect(page.getByRole("link", { name: "Registrations queue" })).toHaveAttribute("href", "/app/events/?id=e2");
  await expect(page.getByRole("link", { name: /Disputes queue/ })).toHaveAttribute("href", "/app/tournaments/disputes/?id=e2");
  await expect(page.getByText("Team size, the registration form")).toBeVisible();
});

test("edit: the checklist follows what is typed, using the guard's own rules", async ({ page }) => {
  const b = backend("e1", { initial: { ...FULL, summary: "Too short", description: null } });
  await organiser(page, b.handlers);
  await page.goto("/app/tournaments/manage/?id=e1");
  const chk = page.locator("section[aria-labelledby=chk-h]");
  await expect(chk.getByText("A summary of 80+ characters").locator("..")).toContainText("Missing");
  await page.getByLabel("Summary", { exact: true }).fill("s".repeat(80));
  await expect(chk.getByText("A summary of 80+ characters").locator("..")).toContainText("Done");
  await page.getByLabel(/^Description/).fill("## " + "d".repeat(199));
  await expect(chk.getByText(/description of 200\+/).locator("..")).toContainText("Missing"); // the "## " mark is not counted
  await page.getByLabel(/^Description/).fill("## " + "d".repeat(200));
  await expect(chk.getByText(/description of 200\+/).locator("..")).toContainText("Done");
  await expect(chk.getByText("Published by you").locator("..")).toContainText("Missing");
});

// ---------- blocked transitions, with the reason ----------
test("blocked: registration_open without a description, completed while disputes are open (known), then the server's own refusal", async ({ page }) => {
  const b = backend("e1", { initial: { ...FULL, status: "published", publishedAt: "2026-11-16T00:00:00.000Z", description: null } });
  await organiser(page, b.handlers);
  await page.goto("/app/tournaments/manage/?id=e1");
  await expect(page.getByRole("button", { name: "Open registration" })).toBeDisabled();
  await expect(page.getByText("Registration can only open with a description. Add it above and save.")).toBeVisible();

  // live with two undecided disputes: completed is blocked with a count and a link
  const p2 = await page.context().newPage();
  const live = backend("e1", { initial: { ...FULL, status: "live", publishedAt: "2026-11-16T00:00:00.000Z" }, disputeStatuses: ["open", "under_review", "resolved"] });
  await organiser(p2, live.handlers);
  await p2.goto("/app/tournaments/manage/?id=e1");
  await expect(p2.getByRole("button", { name: "Mark as completed" })).toBeDisabled();
  await expect(p2.getByText("2 disputes are still undecided. Decide them in the disputes queue first.")).toBeVisible();
  await expect(p2.getByRole("link", { name: "Disputes queue (2 undecided)" })).toBeVisible();
});

test("blocked: the server's disputes_open answer is explained in plain words and the page stays live", async ({ page }) => {
  // the dispute list is not readable here, so the screen cannot know; the move is offered and the server refuses
  const b = backend("e1", { initial: { ...FULL, status: "live", publishedAt: "2026-11-16T00:00:00.000Z" }, serverDisputesOpen: true });
  await organiser(page, b.handlers);
  await page.goto("/app/tournaments/manage/?id=e1");
  await expect(page.getByRole("button", { name: "Mark as completed" })).toBeEnabled();
  await page.getByRole("button", { name: "Mark as completed" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "cannot be completed while a dispute is undecided" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Mark as completed" })).toBeVisible(); // still live
  expect((b.state.t as T).status).toBe("live");
});

test("blocked: a stale screen gets bad_transition, an explanation and a reload of the real state", async ({ page }) => {
  const b = backend("e1", { initial: { ...FULL, status: "draft" } });
  await organiser(page, b.handlers);
  await page.goto("/app/tournaments/manage/?id=e1");
  await expect(page.getByRole("button", { name: "Publish the page" })).toBeEnabled();
  b.state.t = { ...(b.state.t as T), status: "registration_closed", publishedAt: "2026-11-16T00:00:00.000Z" }; // changed elsewhere
  await page.getByRole("button", { name: "Publish the page" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "cannot move to" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start the tournament" })).toBeVisible(); // reloaded
});

test("cancel asks first, and a cancelled tournament offers nothing more", async ({ page }) => {
  const b = backend("e1", { initial: FULL });
  await organiser(page, b.handlers);
  await page.goto("/app/tournaments/manage/?id=e1");
  await page.getByRole("button", { name: "Cancel the tournament" }).click();
  await expect(page.getByText("This is final")).toBeVisible();
  await page.getByRole("button", { name: "Keep it" }).click();
  expect((b.state.t as T).status).toBe("draft");
  await page.getByRole("button", { name: "Cancel the tournament" }).click();
  await page.getByRole("button", { name: "Yes, cancel the tournament" }).click();
  await expect(page.getByText("Status is now: Cancelled.")).toBeVisible();
  await expect(page.getByText("There are no further moves.")).toBeVisible();
});

// ---------- slug ----------
test("slug: format and reserved words answer while typing, a published address is flagged taken, the server's slug_taken lands on the field", async ({ page }) => {
  const b = backend("e2");
  await organiser(page, b.handlers);
  await page.goto("/app/tournaments/manage/?id=e2");
  const slug = page.getByLabel("Page address");
  await slug.fill("admin");
  await expect(page.getByText("That address is reserved. Try another one.").first()).toBeVisible();
  await slug.fill("a--b-c");
  await expect(page.getByText("Use single hyphens only").first()).toBeVisible();
  await slug.fill("ab");
  await expect(page.getByText("Use 3 to 60 characters").first()).toBeVisible();
  await slug.fill("taken-cup");
  await expect(page.getByText("a published tournament already uses this address")).toBeVisible();
  await slug.fill("free-cup-2026");
  await expect(page.getByText("No published tournament uses this address. The final check happens when you save.")).toBeVisible();

  // a draft holds a slug the public lookup cannot see: the server's 409 is shown at the field
  await page.getByLabel("Game", { exact: true }).selectOption("bgmi");
  await page.getByLabel("Format", { exact: true }).selectOption("swiss");
  b.state.t = null;
  await slug.fill("taken-cup");
  await page.getByRole("button", { name: "Create tournament" }).click();
  await expect(page.locator("#t-slug-err")).toContainText("already taken");
  await expect(page.getByText("Tournament created")).toHaveCount(0);
  await slug.fill("free-cup-2026");
  await page.getByRole("button", { name: "Create tournament" }).click();
  await expect(page.getByText("Tournament created as a draft")).toBeVisible();
  expect(b.state.calls.map((c) => (c.body as T).slug)).toEqual(["taken-cup", "free-cup-2026"]);
});

test("slug: the server refuses a change after publish (slug_locked) in words", async ({ page }) => {
  const b = backend("e1", { initial: { ...FULL, status: "published", publishedAt: "2026-11-16T00:00:00.000Z" } });
  await organiser(page, { ...b.handlers, "PUT /v3/events/e1/tournament": () => ({ status: 409, body: { error: "locked", code: "slug_locked" } }) });
  await page.goto("/app/tournaments/manage/?id=e1");
  await page.getByLabel("Title", { exact: true }).fill("Gokte Cup 2026 Final");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.locator("#t-slug-err")).toContainText("cannot change once the page has been published");
});

test("an event that already has a tournament: create answers tournament_exists and the screen opens it", async ({ page }) => {
  const b = backend("e2");
  await organiser(page, { ...b.handlers, "POST /v3/events/e2/tournament": () => { b.state.t = { ...FULL, id: "t9", eventId: "e2", slug: "spring" }; return { status: 409, body: { error: "exists", code: "tournament_exists" } }; } });
  await page.goto("/app/tournaments/manage/?id=e2");
  await page.getByLabel("Game", { exact: true }).selectOption("bgmi");
  await page.getByLabel("Format", { exact: true }).selectOption("swiss");
  await page.getByRole("button", { name: "Create tournament" }).click();
  await expect(page.getByRole("heading", { name: "Gokte Cup 2026", level: 1 })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save changes" })).toBeVisible();
});

test("a view-only event cannot be wrapped, and an unknown event says so", async ({ page }) => {
  const b = backend("e3");
  await organiser(page, b.handlers);
  await page.goto("/app/tournaments/manage/?id=e3");
  await expect(page.getByRole("heading", { name: "View only" })).toBeVisible();
  await page.route("**/esports-api.yaseenyk.workers.dev/events/nope", (r) => (r.request().method() === "OPTIONS" ? r.fallback() : r.fulfill(json({ error: "Not found" }, 404))));
  await page.goto("/app/tournaments/manage/?id=nope");
  await expect(page.getByRole("heading", { name: "Event not found" })).toBeVisible();
});

// ---------- dispute corrections ----------
const OPEN_DISPUTE = { ...DISPUTE, status: "under_review", overdue: false, matchId: "m1", matchNo: 2, raisedByTeam: "Alpha Wolves", permissions: { canComment: true, canUploadEvidence: false, canWithdraw: false, transitions: [], canResolve: true, role: "organiser" } };
const CURRENT = { matches: [{ id: "m1", stage: "main", round: 1, slot: 1, a: "Alpha", b: "Beta", status: "finished", scoreA: 13, scoreB: 9, winner: "a" }], br: [{ matchNo: 2, team: "Alpha Wolves", placement: 2, kills: 11 }, { matchNo: 2, team: "Beta Hawks", placement: 3, kills: 4 }] };

async function disputePage(page: Page, handlers: Record<string, Handler> = {}) {
  await organiser(page, { "GET /v3/disputes/d1": () => ({ body: OPEN_DISPUTE }), ...handlers });
  await page.route("**/esports-api.yaseenyk.workers.dev/events/e1/matches", (r) => (r.request().method() === "OPTIONS" ? r.fallback() : r.fulfill(json(CURRENT))));
}

test("corrections: old value shown, new value validated, sent as the API.md payload, shown in the timeline", async ({ page }) => {
  let resolved = false;
  let sent: T | null = null;
  await disputePage(page, {
    "GET /v3/disputes/d1": () => ({ body: resolved ? { ...OPEN_DISPUTE, status: "resolved", outcome: "upheld", resolutionNote: "Screenshot shows first place.", resolvedAt: "2030-01-05T00:00:00.000Z", permissions: { ...OPEN_DISPUTE.permissions, canResolve: false }, events: [...OPEN_DISPUTE.events, { id: "e3", actorRole: "organiser", action: "status_resolved", fromStatus: "under_review", toStatus: "resolved", note: "Screenshot shows first place.", createdAt: "2030-01-05T00:00:00.000Z" }], corrections: [{ matchRef: "br:2:Alpha Wolves", oldValue: { placement: 2, kills: 11 }, newValue: { placement: 1, kills: 11 } }] } : OPEN_DISPUTE }),
    "POST /v3/disputes/d1/resolve": ({ body }) => { sent = body as T; resolved = true; return { body: {} }; },
  });
  await page.goto("/app/disputes/view/?id=d1&e=e1");
  await expect(page.getByRole("heading", { name: "Decide this dispute" })).toBeVisible();
  await expect(page.getByText("Result corrections can be added when")).toHaveCount(0); // Resolve + Upheld is the default
  await page.getByRole("button", { name: "Add a battle royale correction" }).click();
  // prefilled from the dispute: match 2, the raising team; the old value comes from the event's current results
  await expect(page.getByLabel("Match number (correction 1)")).toHaveValue("2");
  await expect(page.getByLabel("Team (correction 1)")).toHaveValue("Alpha Wolves");
  await expect(page.getByText("Alpha Wolves placed 2 with 11 kills in match 2")).toBeVisible();

  await page.getByLabel("Reason, shown to both teams").fill("Screenshot shows first place.");
  await page.getByRole("button", { name: "Save decision" }).click(); // nothing typed yet
  await expect(page.getByText("A whole number from 1 to 100.")).toBeVisible();
  expect(sent).toBeNull();
  await page.getByLabel("New placement (correction 1)").fill("2");
  await page.getByLabel("New kills (correction 1)").fill("11");
  await page.getByRole("button", { name: "Save decision" }).click();
  await expect(page.getByText("Same as the current result. Change at least one value.")).toBeVisible();
  expect(sent).toBeNull();

  // a head-to-head correction with a winner that contradicts the scores
  await page.getByRole("button", { name: "Add a head-to-head correction" }).click();
  await page.getByLabel("Match (correction 2)").selectOption("m1");
  await expect(page.getByText("Alpha 13 - 9 Beta, Alpha won")).toBeVisible();
  await page.getByLabel("New score, side A (correction 2)").fill("9");
  await page.getByLabel("New score, side B (correction 2)").fill("13");
  await page.getByLabel("New winner (correction 2)").selectOption("a");
  await page.getByLabel("New placement (correction 1)").fill("1");
  await page.getByRole("button", { name: "Save decision" }).click();
  await expect(page.getByText("Side A cannot win with fewer points than side B.")).toBeVisible();
  expect(sent).toBeNull();
  await page.getByLabel("New winner (correction 2)").selectOption("b");
  await page.getByRole("button", { name: "Remove correction 2" }).click();
  await expect(page.getByLabel("Match (correction 2)")).toHaveCount(0);

  await page.getByRole("button", { name: "Save decision" }).click();
  await expect(page.getByText("Decision saved, with the result corrections.")).toBeVisible();
  expect(sent).toEqual({ status: "resolved", outcome: "upheld", note: "Screenshot shows first place.", corrections: [{ matchNo: 2, team: "Alpha Wolves", placement: 1, kills: 11 }] });

  // shown in the timeline, under the decision, old and new
  const tl = page.locator("section[aria-labelledby=tl-h]");
  await expect(tl.getByText("Result corrections (1)")).toBeVisible();
  await expect(tl).toContainText("Battle royale match 2, Alpha Wolves: was placement 2, kills 11, now placement 1, kills 11");
  await expect(page.getByRole("heading", { name: "Decide this dispute" })).toHaveCount(0); // decided: the form is gone
});

test("corrections: only with an upheld decision; a no-action decision sends none", async ({ page }) => {
  let sent: T | null = null;
  await disputePage(page, { "POST /v3/disputes/d1/resolve": ({ body }) => { sent = body as T; return { body: {} }; } });
  await page.goto("/app/disputes/view/?id=d1&e=e1");
  await page.getByRole("button", { name: "Add a battle royale correction" }).click();
  await page.getByLabel("Outcome").selectOption("no_action");
  await expect(page.getByText("Result corrections can be added when the decision is Resolve with Upheld or Partly upheld.")).toBeVisible();
  await expect(page.getByLabel("New placement (correction 1)")).toHaveCount(0);
  await page.getByLabel("Reason, shown to both teams").fill("Nothing to change after review.");
  await page.getByRole("button", { name: "Save decision" }).click();
  await expect(page.getByText("Decision saved.")).toBeVisible();
  expect(sent).toEqual({ status: "resolved", outcome: "no_action", note: "Nothing to change after review." });
});

test("corrections: without the event in the link the form still works and says why no old value is shown; the server's refusal is plain words", async ({ page }) => {
  let sent: T | null = null;
  await disputePage(page, { "POST /v3/disputes/d1/resolve": ({ body }) => { sent = body as T; return { status: 400, body: { error: "x", code: "correction_target_missing" } }; } });
  await page.goto("/app/disputes/view/?id=d1");
  await page.getByRole("button", { name: "Add a head-to-head correction" }).click();
  await expect(page.getByLabel("Match id (correction 1)")).toHaveValue("m1"); // from the dispute
  await expect(page.getByText("not shown here. The server records the value being replaced when you save.")).toBeVisible();
  await page.getByLabel("New score, side A (correction 1)").fill("13");
  await page.getByLabel("New score, side B (correction 1)").fill("11");
  await page.getByLabel("New winner (correction 1)").selectOption("a");
  await page.getByLabel("Reason, shown to both teams").fill("The final score was 13 to 11.");
  await page.getByRole("button", { name: "Save decision" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "points at a result that does not exist" })).toBeVisible();
  expect((sent as T | null)?.corrections).toEqual([{ matchId: "m1", scoreA: 13, scoreB: 11, winner: "a" }]);
});

test("nobody resolves a dispute they raised or are named in: no form without canResolve, and the server's 403 is explained", async ({ page }) => {
  await organiser(page, { "GET /v3/disputes/d1": () => ({ body: { ...OPEN_DISPUTE, permissions: { ...OPEN_DISPUTE.permissions, canResolve: false, role: "raiser" } } }) });
  await page.goto("/app/disputes/view/?id=d1&e=e1");
  await expect(page.getByRole("heading", { name: "Wrong score" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Decide this dispute" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Add a battle royale correction" })).toHaveCount(0);
  const p2 = await page.context().newPage();
  await organiser(p2, { "GET /v3/disputes/d1": () => ({ body: OPEN_DISPUTE }), "POST /v3/disputes/d1/resolve": () => ({ status: 403, body: { error: "no", code: "conflict_of_interest" } }) });
  await p2.goto("/app/disputes/view/?id=d1");
  await p2.getByLabel("Reason, shown to both teams").fill("A decision with enough words.");
  await p2.getByRole("button", { name: "Save decision" }).click();
  await expect(p2.getByRole("alert").filter({ hasText: "cannot decide a dispute you are part of" })).toBeVisible();
});

test("the organiser queue carries the event to the dispute so old values can be shown", async ({ page }) => {
  await organiser(page, { "GET /v3/events/e1/tournament": () => ({ body: { ...FULL } }), "GET /v3/tournaments/gokte-cup/disputes": () => ({ body: { items: [OPEN_DISPUTE] } }) });
  await page.goto("/app/tournaments/disputes/?id=e1");
  await expect(page.locator("ul li a").first()).toHaveAttribute("href", "/app/disputes/view/?id=d1&e=e1");
});

// ---------- accessibility: WCAG 2.1 AA on every new page, desktop and 390x844 ----------
interface Case { name: string; path: string; setup: (page: Page) => Promise<void>; act?: (page: Page) => Promise<void> }
const FULL_OPEN = { ...FULL, status: "published", publishedAt: "2026-11-16T00:00:00.000Z", summary: "Short" };
const CASES: Case[] = [
  { name: "my tournaments", path: "/app/tournaments/", setup: async (p) => { await organiser(p, backend("e1", { initial: FULL }).handlers); } },
  { name: "create", path: "/app/tournaments/manage/?id=e2", setup: async (p) => { await organiser(p, backend("e2").handlers); } },
  { name: "create with errors", path: "/app/tournaments/manage/?id=e2", setup: async (p) => { await organiser(p, backend("e2").handlers); }, act: async (p) => { await p.getByLabel("Page address").fill("admin"); await p.getByRole("button", { name: "Create tournament" }).click(); } },
  { name: "edit, published, blocked move", path: "/app/tournaments/manage/?id=e1", setup: async (p) => { await organiser(p, backend("e1", { initial: { ...FULL_OPEN, description: null } }).handlers); } },
  { name: "edit, live with open disputes", path: "/app/tournaments/manage/?id=e1", setup: async (p) => { await organiser(p, backend("e1", { initial: { ...FULL, status: "live", publishedAt: "2026-11-16T00:00:00.000Z" }, disputeStatuses: ["open"] }).handlers); } },
  { name: "not available (list)", path: "/app/tournaments/", setup: async (p) => { await organiser(p); } },
  { name: "not available (manage)", path: "/app/tournaments/manage/?id=e1", setup: async (p) => { await organiser(p); } },
  { name: "dispute resolve with corrections", path: "/app/disputes/view/?id=d1&e=e1", setup: async (p) => { await disputePage(p); }, act: async (p) => { await p.getByRole("button", { name: "Add a battle royale correction" }).click(); await p.getByRole("button", { name: "Add a head-to-head correction" }).click(); await p.getByRole("button", { name: "Save decision" }).click(); } },
];
const VIEWPORTS = [{ name: "desktop", width: 1280, height: 900 }, { name: "390x844", width: 390, height: 844 }];
for (const c of CASES) {
  for (const vp of VIEWPORTS) {
    test(`${c.name} has no accessibility violations at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await c.setup(page);
      await page.goto(c.path);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(500);
      if (c.act) { await c.act(page); await page.waitForTimeout(300); }
      const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      const bad = r.violations; // every impact level, stricter than the other v3 specs
      expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)).toBe(false);
    });
  }
}
