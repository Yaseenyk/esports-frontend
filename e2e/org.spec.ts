// Club screens (Phase 2a-ii), server mocked. Everything sits behind GET /me/context features.teamOrgs.
import { expect, test, type Page } from "@playwright/test";
import { json, mockContext, signedIn, unmockedCalls } from "./helpers";

const A = "**/esports-api.yaseenyk.workers.dev";
const ALL = ["org.read", "org.people.manage", "org.events.create", "org.audit.read"];
const team = (caps = ALL, role = "admin") => ({ id: "org-t", name: "Chess Club", kind: "team", status: "active", role, caps });
const personal = { id: "org-p", name: "Olivia", kind: "personal", status: "active", role: "admin", caps: ALL };
const ctx = (orgs: unknown[], teamOrgs = true) => mockContext({ orgs, features: { teamOrgs } });
const needs = { pendingResults: 0, pendingRegistrations: 0, teamsNotReady: 0 };

async function club(page: Page, orgs: unknown[] = [team()]) {
  await signedIn(page, [], { context: ctx(orgs) });
  await page.route(`${A}/orgs/org-t`, (r) => r.fulfill(json({ id: "org-t", name: "Chess Club", kind: "team", status: "active", role: "admin", caps: ALL, createdAt: "", counts: { members: 2, events: 1 } })));
  await page.route(`${A}/orgs/org-t/events**`, (r) => r.fulfill(json({ org: { id: "org-t", name: "Chess Club", kind: "team", role: "admin" }, today: "2026-12-10", groups: { live: 0, upcoming: 1, past: 0, undated: 0 }, total: 1, needsYou: { ...needs, pendingRegistrations: 2 }, events: [{ id: "e1", key: "cup", name: "Spring Cup", game: "BGMI", date: "2026-12-12", startsOn: "2026-12-12", createdAt: "", createdBy: "u", group: "upcoming", needsYou: { ...needs, pendingRegistrations: 2 } }], next: null })));
}

const members = (youRole = "admin") => ({ role: youRole, members: [
  { userId: "u", name: "Olivia Test", email: "olivia@example.com", role: youRole, addedAt: "", isYou: true },
  { userId: "b", name: "Bob", email: "bob@example.com", role: "member", addedAt: "", isYou: false },
] });

test("flag off or no club: the navigation is exactly today's and only /me/context is called extra", async ({ page }) => {
  await signedIn(page, [], { context: ctx([team()], false) });
  await page.goto("/app/");
  const nav = page.getByRole("navigation", { name: "App" });
  await expect(nav.getByRole("link")).toHaveText(["Home", "Events", "ID cards", "Gate check-in", "Brackets", "Account"]);
  await page.goto("/app/org/");
  await expect(page.getByText("Clubs are not available yet.")).toBeVisible();
  expect(unmockedCalls.get(page)).toEqual([]);
});

test("context call fails: the app still works and shows no club entry", async ({ page }) => {
  await signedIn(page, []);
  await page.route(`${A}/me/context`, (r) => r.fulfill(json({ error: "x" }, 500)));
  await page.goto("/app/");
  await expect(page.getByRole("heading", { name: /Welcome/ })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "App" }).getByRole("link", { name: "Your club" })).toHaveCount(0);
});

test("a person with only their own space is offered 'Make it a club'", async ({ page }) => {
  await signedIn(page, [], { context: ctx([personal]) });
  await page.goto("/app/");
  await expect(page.getByRole("navigation", { name: "App" }).getByRole("link", { name: "Make it a club" })).toBeVisible();
});

test("club home shows counts and what needs you", async ({ page }) => {
  await club(page);
  await page.goto("/app/org/");
  await expect(page.getByRole("heading", { name: "Chess Club" })).toBeVisible();
  await expect(page.getByRole("region", { name: "What needs you" })).toContainText("2 teams are waiting for you to approve");
  await expect(page.getByRole("link", { name: /Spring Cup/ })).toBeVisible();
});

test("people: admin promotes after a plain question; own row has no role button; last admin cannot leave", async ({ page }) => {
  await club(page);
  let put: unknown;
  await page.route(`${A}/orgs/org-t/members`, (r) => r.fulfill(json(members())));
  await page.route(`${A}/orgs/org-t/members/b`, (r) => { if (r.request().method() === "PUT") { put = r.request().postDataJSON(); return r.fulfill(json({ ok: true, role: "admin" })); } return r.fallback(); });
  await page.goto("/app/org/people/");
  const me = page.getByRole("listitem").filter({ hasText: "Olivia Test" });
  await expect(me.getByRole("button", { name: /Make/ })).toHaveCount(0);
  await expect(me.getByText("You are the only admin of this club")).toBeVisible();
  await expect(me.getByRole("button", { name: "Leave club" })).toHaveCount(0);
  const bob = page.getByRole("listitem").filter({ hasText: "Bob" });
  await bob.getByRole("button", { name: "Make admin" }).click();
  await expect(page.getByText(/will be able to invite and remove people/)).toBeVisible();
  await page.getByRole("alertdialog").getByRole("button", { name: "Make admin" }).click();
  await expect(page.getByText("Bob is now an admin.")).toBeVisible();
  expect(put).toEqual({ role: "admin" });
});

test("people: a member sees no controls except Leave", async ({ page }) => {
  await club(page, [team(["org.read", "org.events.create"], "member")]);
  await page.route(`${A}/orgs/org-t/members`, (r) => r.fulfill(json({ role: "member", members: [
    { userId: "a", name: "Asha", email: null, role: "admin", addedAt: "", isYou: false },
    { userId: "u", name: "Olivia Test", email: null, role: "member", addedAt: "", isYou: true },
  ] })));
  await page.goto("/app/org/people/");
  await expect(page.getByRole("button", { name: /Make|Remove/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Leave club" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Invite someone" })).toHaveCount(0);
});

test("invite: the link is shown once, a pending invitation can be cancelled", async ({ page }) => {
  await club(page);
  let list = [{ id: "i1", email: "old@example.com", role: "member", createdAt: "", expiresAt: new Date(Date.now() + 5 * 864e5).toISOString(), expired: false, invitedBy: "u" }];
  await page.route(`${A}/orgs/org-t/invitations`, (r) => r.request().method() === "POST"
    ? r.fulfill(json({ id: "i2", email: "new@example.com", role: "member", createdAt: "", expiresAt: new Date(Date.now() + 7 * 864e5).toISOString(), token: "tok", link: "https://x.test/join/?t=tok" }, 201))
    : r.fulfill(json({ invitations: list })));
  await page.route(`${A}/orgs/org-t/invitations/i1`, (r) => { list = []; return r.fulfill(json({ ok: true })); });
  await page.goto("/app/org/invite/");
  await expect(page.getByText("old@example.com")).toBeVisible();
  await page.getByLabel("Their email").fill("new@example.com");
  await page.getByRole("button", { name: "Make the invitation link" }).click();
  await expect(page.getByTestId("invite-link")).toHaveText("https://x.test/join/?t=tok");
  await expect(page.getByText(/shown only once/)).toBeVisible();
  await page.getByRole("button", { name: "Cancel invitation" }).first().click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Cancel invitation" }).click();
  await expect(page.getByText(/was cancelled/)).toBeVisible();
});

test("convert: shows the server's sentence word for word and asks before creating", async ({ page }) => {
  await signedIn(page, [], { context: ctx([personal]) });
  const sentence = "All 3 events in this space will be shared with the people you invite.";
  let body: unknown;
  await page.route(`${A}/orgs/convert/preview`, (r) => r.fulfill(json({ orgId: "org-p", eventCount: 3, sentence, primaryButton: "Create my club", secondaryButton: "Not now" })));
  await page.route(`${A}/orgs/convert`, (r) => { body = r.request().postDataJSON(); return r.fulfill(json({ id: "org-p", name: "Chess Club", kind: "team", role: "admin", eventCount: 3 })); });
  await page.goto("/app/org/convert/");
  await page.getByLabel("Club, college or cafe name").fill("Chess Club");
  await page.getByRole("button", { name: "Next: check what happens" }).click();
  await expect(page.getByTestId("convert-sentence")).toHaveText(sentence);
  expect(body).toBeUndefined();
  await page.getByRole("button", { name: "Create my club" }).click();
  await expect(page.getByText("Your club is ready")).toBeVisible();
  expect(body).toEqual({ name: "Chess Club" });
});

test("activity: admin sees plain lines with names from the member list", async ({ page }) => {
  await club(page);
  await page.route(`${A}/orgs/org-t/members`, (r) => r.fulfill(json(members())));
  await page.route(`${A}/orgs/org-t/audit**`, (r) => r.fulfill(json({ entries: [{ id: "1", at: "2026-12-01T10:00:00Z", actorType: "user", actorId: "u", eventId: null, action: "member.removed", targetType: "user", targetId: "b", reasonCode: null, meta: {} }], next: null })));
  await page.goto("/app/org/activity/");
  await expect(page.getByText("You removed Bob")).toBeVisible();
});

test("join page: wrong email gives the server's plain sentence", async ({ page }) => {
  await signedIn(page, [], { context: ctx([personal]) });
  await page.route(`${A}/public/invite/**`, (r) => r.fulfill(json({ error: "Not found" }, 404)));
  await page.route(`${A}/me/invitations/accept`, (r) => r.fulfill(json({ error: "This invitation was sent for j***@gmail.com. Sign in with that address, or ask your admin to invite the one you use.", code: "wrong_email", invitedHint: "j***@gmail.com" }, 403)));
  await page.goto("/join/?t=abc");
  await expect(page).toHaveURL(/\/join\/$/); // the token is gone from the address bar
  await page.getByRole("button", { name: "Accept the invitation" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "j***@gmail.com" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign out and use another account" })).toBeVisible();
});

test("account: export downloads a file and says what is not in it; deletion preview shows the count", async ({ page }) => {
  await signedIn(page, [], { context: ctx([personal]) });
  await page.route(`${A}/me/export`, (r) => r.fulfill(json({ exportVersion: 1, account: {}, notIncluded: ["rosters", "photos"] })));
  await page.route(`${A}/me/deletion-preview`, (r) => r.fulfill(json({ events: { deleted: [{ id: "e1", name: "Spring Cup" }], deletedCount: 1, needsTypedCount: false, handedOver: [], conflicts: [], needDeleteConfirmation: [], tooManyShared: false }, clubs: { blocking: [], deletedWithAccount: 0 } })));
  await page.goto("/app/account/");
  await expect(page.getByText("Deleting your account will delete 1 event and everything in it.")).toBeVisible();
  const [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download my data" }).click()]);
  expect(dl.suggestedFilename()).toMatch(/^esports-hub-my-data-\d{4}-\d{2}-\d{2}\.json$/);
  await expect(page.locator("p", { hasText: /Not in the file:/ })).toContainText("rosters; photos");
});

test("registration: the acknowledgement must be ticked before the link is made, and is sent as acknowledge", async ({ page }) => {
  await signedIn(page, [{ id: "e1", role: "owner" }], { context: ctx([personal]) });
  let saved: unknown;
  const ack = { version: "interim-1", text: "I am responsible for the details teams send me." };
  await page.route(`${A}/events/e1/roster`, (r) => r.fulfill(json({ teams: [], people: [] })));
  await page.route(`${A}/events/e1/checkins**`, (r) => r.fulfill(json({ checkins: [], total: 0, checkedIn: 0 })));
  await page.route(`${A}/events/e1/registration`, (r) => {
    if (r.request().method() === "PUT") { saved = r.request().postDataJSON(); return r.fulfill(json({ token: "t1", title: "", intro: "", closesAt: null, maxTeams: null, teamSize: 4, subs: 1, open: true, createdAt: "", ackVersion: "interim-1", ackAt: "2026-12-01T00:00:00Z" })); }
    return r.fulfill(json({ form: null, counts: { pending: 0, approved: 0, rejected: 0 }, acknowledgement: ack }));
  });
  await page.goto("/app/events/?id=e1");
  const create = page.getByRole("button", { name: "Create the registration link" });
  await expect(create).toBeDisabled();
  await page.getByLabel(ack.text).check();
  await expect(create).toBeEnabled();
  await create.click();
  await expect.poll(() => saved).toMatchObject({ acknowledge: true });
});
