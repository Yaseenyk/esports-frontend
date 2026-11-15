// v3 screens (tournament pages are in v3-tournaments.spec.ts, which needs a build against a mock API). The API is MOCKED with route
// interception: nothing here reaches the real backend. Run one project at a time:  npx playwright test e2e/v3.spec.ts --project=desktop
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { DISPUTE, LISTING, adultOk, json, mockV3, v3SignedIn, type Handler } from "./v3-helpers";

test.setTimeout(120_000);

// ---------- "Not available yet": every v3 call answers 404, exactly as production does with the flags off ----------
const OFF: [string, string, boolean][] = [
  ["/lft/", "The board", false], ["/lft/listing/?id=a1", "The board", false], ["/lft/new/", "The board", true], ["/players/view/?s=ravi-igl", "Esports resumes", false],
  ["/app/lft/", "The board", true], ["/app/resume/", "The esports resume", true], ["/app/disputes/", "The dispute portal", true], ["/app/disputes/new/", "The dispute portal", true],
  ["/app/disputes/view/?id=d1", "The dispute portal", true], ["/app/tournaments/disputes/?t=gokte-cup-2026", "The dispute portal", true],
];
for (const [path, , signed] of OFF) {
  test(`${path} says "Not available yet" (not an error) when the API answers 404`, async ({ page }) => {
    if (signed) await v3SignedIn(page); else await mockV3(page);
    await page.goto(path);
    await expect(page.getByRole("heading", { name: "Not available yet" })).toBeVisible();
    await expect(page.getByText("Something went wrong")).toHaveCount(0);
  });
}

test("the v3 routes are noindex", async ({ page }) => {
  await mockV3(page);
  for (const p of ["/lft/", "/lft/listing/?id=a1", "/lft/new/", "/players/view/?s=x", "/app/resume/"]) {
    await page.goto(p);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  }
});

// ---------- LFT board ----------
test("board: filters go to the query string and the API, cursor pagination, empty and error states", async ({ page }) => {
  const asked: string[] = [];
  await mockV3(page, {
    "GET /public/lft": ({ url }) => {
      asked.push(url.search);
      if (url.searchParams.get("game") === "valorant") return { body: { items: [], nextCursor: null } };
      if (url.searchParams.get("role") === "sniper") return { status: 500, body: { error: "boom" } };
      if (url.searchParams.get("cursor") === "c1") return { body: { items: [{ ...LISTING, id: "a2", message: "Second page squad needs a coach" }], nextCursor: null } };
      return { body: { items: [LISTING], nextCursor: "c1" } };
    },
  });
  await page.goto("/lft/?game=bgmi&online=1");
  await expect(page.getByLabel("Game")).toHaveValue("bgmi");
  await expect(page.getByLabel("Online players OK")).toBeChecked();
  await expect(page.getByText("Serious IGL looking for a squad")).toBeVisible();
  expect(asked[0]).toContain("game=bgmi");
  expect(asked[0]).toContain("online=1");
  expect(asked[0]).toContain("limit=20");

  await page.getByRole("button", { name: "Show more" }).click();
  await expect(page.getByText("Second page squad needs a coach")).toBeVisible();
  expect(asked.some((q) => q.includes("cursor=c1"))).toBe(true);
  await expect(page.getByRole("button", { name: "Show more" })).toHaveCount(0);

  await page.getByLabel("Game").selectOption("valorant");
  await expect(page).toHaveURL(/game=valorant/);
  await expect(page.getByText("Nothing matches these filters")).toBeVisible();
  await page.getByRole("button", { name: "Clear all filters" }).first().click();
  await expect(page).not.toHaveURL(/game=/);
  await expect(page.getByText("Serious IGL looking for a squad")).toBeVisible();

  await page.getByLabel("Role").selectOption("sniper");
  await expect(page.getByRole("heading", { name: /did not load/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
});

test("board: rank range goes to the API", async ({ page }) => {
  const asked: string[] = [];
  await mockV3(page, { "GET /public/lft": ({ url }) => { asked.push(url.search); return { body: { items: [], nextCursor: null } }; } });
  await page.goto("/lft/");
  await page.getByLabel("Rank step from").fill("10");
  await page.getByLabel("Rank step to").fill("40");
  await expect.poll(() => asked.some((q) => q.includes("rank_min=10") && q.includes("rank_max=40"))).toBe(true);
});

// ---------- apply flow ----------
test("apply: hints for links and numbers, the server's code in plain words, then sent", async ({ page }) => {
  let attempt = 0;
  const seen = await v3SignedIn(page, {
    ...adultOk,
    "GET /public/lft/a1": () => ({ body: LISTING }),
    "POST /v3/lft/a1/applications": () => (++attempt === 1 ? { status: 400, body: { error: "no links", code: "message_has_link" } } : { status: 201, body: { id: "ap1", status: "sent" } }),
  });
  await page.goto("/lft/listing/?id=a1");
  await expect(page.getByRole("heading", { name: "Listing" })).toBeVisible();
  await page.getByRole("button", { name: "Apply" }).click();
  const dlg = page.getByRole("dialog", { name: "Apply to this listing" });
  await expect(dlg).toBeVisible();

  await dlg.getByLabel("Message (optional)").fill("add me at https://discord.gg/abc");
  await dlg.getByLabel("Your contact").fill("raviigl");
  await expect(dlg.getByText(/looks like a link/)).toBeVisible();
  await dlg.getByRole("button", { name: "Send application" }).click();
  expect(seen.filter((s) => s.method === "POST").length).toBe(0); // blocked on the client

  await dlg.getByLabel("Message (optional)").fill("I play IGL, diamond, evenings IST");
  await dlg.getByRole("button", { name: "Send application" }).click();
  await expect(dlg.getByRole("alert")).toContainText("Links are not allowed"); // the server refused: plain words
  await dlg.getByRole("button", { name: "Send application" }).click();
  await expect(dlg.getByText(/Application sent/)).toBeVisible();
  const post = seen.filter((s) => s.method === "POST").pop();
  expect(JSON.parse(post!.body)).toEqual({ message: "I play IGL, diamond, evenings IST", contact: "raviigl" });
});

test("apply: signed-out visitors are asked to sign in, and the 18+ gate shows when not confirmed", async ({ page }) => {
  await mockV3(page, { "GET /public/lft/a1": () => ({ body: LISTING }) });
  await page.goto("/lft/listing/?id=a1");
  await expect(page.getByText("Sign in and confirm you are 18 or older to apply.")).toBeVisible();
  const p2 = await page.context().newPage();
  await v3SignedIn(p2, { "GET /public/lft/a1": () => ({ body: LISTING }), "GET /v3/me/status": () => ({ body: { adultConfirmedAt: null, resumeConsentAt: null } }) });
  await p2.goto("/lft/listing/?id=a1");
  await expect(p2.getByRole("button", { name: "I am 18 or older" })).toBeVisible();
  await expect(p2.getByRole("button", { name: "Apply" })).toHaveCount(0);
});

test("report: sends the reason", async ({ page }) => {
  const seen = await v3SignedIn(page, { ...adultOk, "GET /public/lft/a1": () => ({ body: LISTING }), "POST /v3/lft/a1/report": () => ({ status: 202, body: { ok: true } }) });
  await page.goto("/lft/listing/?id=a1");
  await page.getByRole("button", { name: "Report this listing" }).click();
  const dlg = page.getByRole("dialog", { name: "Report this listing" });
  await dlg.getByLabel("What is wrong?").selectOption("scam");
  await dlg.getByRole("button", { name: "Send report" }).click();
  await expect(dlg.getByText(/Thank you/)).toBeVisible();
  expect(JSON.parse(seen.find((s) => s.path.endsWith("/report"))!.body)).toEqual({ reason: "scam" });
});

test("new listing: validates, shows the server's error, then succeeds", async ({ page }) => {
  let n = 0;
  const seen = await v3SignedIn(page, { ...adultOk, "POST /v3/lft": () => (++n === 1 ? { status: 409, body: { error: "cap", code: "listing_cap" } } : { status: 201, body: LISTING }) });
  await page.goto("/lft/new/");
  await page.getByRole("button", { name: "Post listing" }).click();
  await expect(page.getByText("Choose a game.")).toBeVisible();
  await page.getByLabel("Game").selectOption("bgmi");
  await page.getByLabel("Message").fill("call me on 9876543210 for scrims");
  await page.getByLabel("Your contact").fill("raviigl");
  await expect(page.locator("#n-msg-err")).toContainText("phone number");
  await page.getByLabel("Message").fill("IGL looking for a serious squad, evenings IST");
  await page.getByRole("button", { name: "Post listing" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "3 open listings" })).toBeVisible();
  await page.getByRole("button", { name: "Post listing" }).click();
  await expect(page.getByRole("heading", { name: "Listing posted" })).toBeVisible();
  const body = JSON.parse(seen.filter((s) => s.method === "POST").pop()!.body);
  expect(body).toMatchObject({ kind: "looking_for_team", game: "bgmi", contact: "raviigl", expiresInDays: 14 });
});

test("my listings: bump, close, inbox with accept; contact appears only after accept", async ({ page }) => {
  let accepted = false;
  const mine = () => [{ ...LISTING, contact: "raviigl", status: "open", hidden: false, reportCount: 0, applications: 1 }];
  const seen = await v3SignedIn(page, {
    "GET /v3/me/lft": () => ({ body: { items: mine() } }),
    "GET /v3/me/lft/applications": () => ({ body: { items: [{ id: "s1", listingId: "z", status: "accepted", kind: "looking_for_team", game: "bgmi", teamName: "Wolves", listingStatus: "open", createdAt: "2030-01-01T00:00:00Z", respondedAt: null, contact: "wolves#1" }] } }),
    "GET /v3/lft/a1/applications": () => ({ body: { items: [{ id: "ap1", status: accepted ? "accepted" : "sent", message: "I can IGL", createdAt: "2030-01-01T00:00:00Z", respondedAt: null, profileSlug: null, contact: accepted ? "applicant#9" : null }] } }),
    "POST /v3/lft/a1/bump": () => ({ body: { ok: true } }),
    "POST /v3/lft/a1/close": () => ({ body: { ok: true } }),
    "POST /v3/lft-applications/ap1/respond": () => { accepted = true; return { body: { ok: true } }; },
  });
  await page.goto("/app/lft/");
  await expect(page.getByText("Contact on file: raviigl")).toBeVisible();
  await expect(page.getByText("Their contact:")).toContainText("wolves#1");
  await page.getByRole("button", { name: "Bump" }).click();
  await expect(page.getByText("Bumped to the top")).toBeVisible();
  await page.getByRole("button", { name: /Applications \(1\)/ }).click();
  await expect(page.getByText("I can IGL")).toBeVisible();
  await expect(page.getByText("applicant#9")).toHaveCount(0);
  await page.getByRole("button", { name: "Accept" }).click();
  await expect(page.getByText("applicant#9")).toBeVisible();
  expect(JSON.parse(seen.find((s) => s.path.endsWith("/respond"))!.body)).toEqual({ decision: "accept" });
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByText("Listing closed.")).toBeVisible();
});

// ---------- Esports resume ----------
test("resume: 18+, profile, game, consent (draft wording), public, withdraw puts it back to private", async ({ page }) => {
  const st = { adult: null as string | null, consent: null as string | null, profile: null as Record<string, unknown> | null };
  const own = () => ({ profile: st.profile ? { ...st.profile, adultConfirmedAt: st.adult, resumeConsentAt: st.consent } : null, adultConfirmedAt: st.adult, resumeConsentAt: st.consent });
  const seen = await v3SignedIn(page, {
    "GET /v3/me/profile": () => ({ body: own() }),
    "POST /v3/me/adult-confirmation": () => { st.adult = "2030-01-01T00:00:00.000Z"; return { body: { adultConfirmedAt: st.adult, resumeConsentAt: st.consent } }; },
    "PUT /v3/me/profile": ({ body }) => { st.profile = { visibility: "private", games: [], languages: [], ...(st.profile ?? {}), ...(body as object) }; return { body: { profile: st.profile } }; },
    "PUT /v3/me/games/bgmi": ({ body }) => { (st.profile as { games: unknown[] }).games = [{ game: "bgmi", ...(body as object) }]; return { body: {} }; },
    "POST /v3/me/resume-consent": () => { st.consent = "2030-01-02T00:00:00.000Z"; return { body: {} }; },
    "DELETE /v3/me/resume-consent": () => { st.consent = null; if (st.profile) st.profile.visibility = "private"; return { body: {} }; },
  });
  await page.goto("/app/resume/");
  await expect(page.getByRole("heading", { name: "Confirm you are 18 or older" })).toBeVisible();
  await page.getByRole("button", { name: "I am 18 or older" }).click();
  await expect(page.getByRole("heading", { name: "Confirm you are 18 or older" })).toHaveCount(0);

  await page.getByRole("button", { name: "Create profile" }).click();
  await expect(page.getByText("Use 3 to 60 characters.")).toBeVisible();
  await page.getByLabel("Profile address").fill("ravi-igl");
  await page.getByLabel("Handle").fill("RaviIGL");
  await page.getByLabel("Languages (optional)").fill("Hindi, English");
  await page.getByRole("button", { name: "Create profile" }).click();
  await expect(page.getByText("Profile saved.")).toBeVisible();
  expect(JSON.parse(seen.filter((s) => s.method === "PUT").pop()!.body)).toMatchObject({ slug: "ravi-igl", handle: "RaviIGL", languages: ["Hindi", "English"] });

  await page.getByLabel("Game", { exact: true }).selectOption("bgmi");
  await page.getByLabel("In-game name").fill("Ravi");
  await page.getByLabel("Rank", { exact: true }).fill("Diamond 3");
  await page.getByLabel("Rank step (0 to 100)").fill("17");
  await page.getByLabel("IGL").check();
  await page.getByRole("button", { name: "Save game" }).click();
  await expect(page.getByText("Game saved.")).toBeVisible();
  await expect(page.getByText("diamond 3 (rank step")).toBeVisible();
  expect(JSON.parse(seen.find((s) => s.path === "/v3/me/games/bgmi")!.body)).toEqual({ inGameName: "Ravi", rankCode: "diamond_3", rankOrdinal: 17, roles: ["igl"] });

  // consent: the wording is marked DRAFT, says what becomes public and that it can be withdrawn
  await expect(page.getByText("Draft wording").first()).toBeVisible();
  await expect(page.getByText("Your bio, your city and state")).toBeVisible();
  await expect(page.getByText(/withdraw this at any time/i)).toBeVisible();
  await expect(page.getByLabel("Public: anyone on the internet.")).toBeDisabled();
  await expect(page.getByLabel("Unlisted: anyone with the link. Not available yet.")).toBeDisabled();
  await expect(page.getByRole("button", { name: "Give consent" })).toBeDisabled();
  await page.getByLabel(/I understand what becomes public/).check();
  await page.getByRole("button", { name: "Give consent" }).click();
  await expect(page.getByText("Consent saved.")).toBeVisible();

  await expect(page.getByLabel("Public: anyone on the internet.")).toBeEnabled();
  await expect(page.getByLabel("Unlisted: anyone with the link. Not available yet.")).toBeDisabled();
  await page.getByLabel("Public: anyone on the internet.").click(); // the radio follows the server, so it flips once the save is answered
  await expect(page.getByText("Your resume is now public.")).toBeVisible();
  expect(JSON.parse(seen.filter((s) => s.method === "PUT" && s.path === "/v3/me/profile").pop()!.body)).toEqual({ visibility: "public" });
  await expect(page.getByRole("link", { name: "See your public resume" })).toBeVisible();

  await page.getByRole("button", { name: "Withdraw consent" }).click();
  await expect(page.getByText("Consent withdrawn. Your resume is private again.")).toBeVisible();
  await expect(page.getByLabel("Private: only you.")).toBeChecked();
  await expect(page.getByLabel("Public: anyone on the internet.")).toBeDisabled();
});

test("public resume shows only the public fields", async ({ page }) => {
  await mockV3(page, { "GET /public/players/ravi-igl": () => ({ body: { slug: "ravi-igl", handle: "RaviIGL", bio: "Evening IGL", city: "Pune", state: "Maharashtra", languages: ["Hindi"], games: [{ game: "bgmi", inGameName: "Ravi", rankCode: "diamond_3", rankOrdinal: 17, roles: ["igl"], userId: "SECRET-1" }], updatedAt: "2030-01-01T00:00:00Z", email: "secret@example.com", resumeConsentAt: "2030-01-01T00:00:00Z" } }) });
  await page.goto("/players/view/?s=ravi-igl");
  await expect(page.getByRole("heading", { name: "RaviIGL" })).toBeVisible();
  await expect(page.getByText("Ravi · diamond 3")).toBeVisible();
  const html = await page.content();
  for (const secret of ["SECRET-1", "secret@example.com", "resumeConsentAt"]) expect(html).not.toContain(secret);
});

test("public resume: an unknown or private address says so without guessing which", async ({ page }) => {
  await mockV3(page, { "GET /public/players/nobody": () => undefined });
  await page.goto("/players/view/?s=nobody");
  await expect(page.getByRole("heading", { name: "Not available yet" })).toBeVisible();
});

// ---------- disputes ----------
async function pngBytes(page: Page, w: number, h: number, noisy: boolean): Promise<Buffer> {
  const b64 = await page.evaluate(async ([w, h, noisy]) => {
    const c = document.createElement("canvas"); c.width = w as number; c.height = h as number;
    const ctx = c.getContext("2d")!;
    const img = ctx.createImageData(c.width, c.height);
    for (let i = 0; i < img.data.length; i += 4) { const v = noisy ? Math.floor(Math.random() * 256) : 40; img.data[i] = v; img.data[i + 1] = noisy ? Math.floor(Math.random() * 256) : 90; img.data[i + 2] = noisy ? Math.floor(Math.random() * 256) : 160; img.data[i + 3] = 255; }
    ctx.putImageData(img, 0, 0);
    const blob: Blob = await new Promise((ok) => c.toBlob((x) => ok(x!), "image/png"));
    const buf = new Uint8Array(await blob.arrayBuffer()); let s = ""; for (const x of buf) s += String.fromCharCode(x);
    return btoa(s);
  }, [w, h, noisy] as const);
  return Buffer.from(b64, "base64");
}

test("raise a dispute: captain claim once, evidence shrunk to 400 KB, per-file errors, 4 file limit", async ({ page }) => {
  const evidence: Buffer[] = [];
  const seen = await v3SignedIn(page, {
    "GET /v3/me/disputes": () => ({ body: { items: [] } }),
    "POST /v3/tournaments/gokte-cup-2026/captain-claim": () => ({ body: { team: "Alpha Wolves", tournament: { slug: "gokte-cup-2026", title: "Gokte Cup 2026" } } }),
    "POST /v3/tournaments/gokte-cup-2026/disputes": () => ({ status: 201, body: DISPUTE }),
    "POST /v3/disputes/d1/evidence": ({ request }) => { evidence.push(request.postDataBuffer()!); return { status: 201, body: { id: `v${evidence.length}`, mimeType: "image/webp", sizeBytes: 1, caption: null } }; },
  });
  await page.goto("/app/disputes/new/?t=gokte-cup-2026");
  await expect(page.getByLabel("Tournament address").first()).toHaveValue("gokte-cup-2026");

  await page.getByLabel("Captain link token").fill("abcDEF12_-captaintoken");
  await page.getByRole("button", { name: "Link my team" }).click();
  await expect(page.getByText("Linked as captain of Alpha Wolves.")).toBeVisible();
  await expect(page.getByLabel("Captain link token")).toHaveValue(""); // the secret does not stay in the page
  expect(JSON.parse(seen.find((s) => s.path.endsWith("/captain-claim"))!.body)).toEqual({ token: "abcDEF12_-captaintoken" });

  await page.getByRole("button", { name: "Raise dispute" }).click();
  await expect(page.getByText("Choose what the dispute is about.")).toBeVisible();
  await page.getByLabel("What is it about?").selectOption("wrong_score");
  await page.getByLabel("What happened?").fill("The score for match 2 was entered wrongly.");

  const big = await pngBytes(page, 1400, 900, true); // random noise: several MB as PNG, so it has to be shrunk
  expect(big.length).toBeGreaterThan(400 * 1024);
  const files = page.locator("#ev-files");
  await files.setInputFiles({ name: "lobby.png", mimeType: "image/png", buffer: big });
  await files.setInputFiles({ name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("hello") });
  await expect(page.getByText(/Ready, \d+ KB/)).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText("Only PNG, JPEG or WebP images can be attached.")).toBeVisible();

  await page.getByRole("button", { name: "Raise dispute" }).click();
  await expect(page.getByRole("heading", { name: "Dispute raised" })).toBeVisible({ timeout: 60_000 });
  expect(evidence.length).toBe(1);
  expect(evidence[0].length).toBeLessThanOrEqual(400 * 1024);
  const head = evidence[0].subarray(0, 12).toString("latin1");
  expect(head.startsWith("RIFF") && head.endsWith("WEBP") || evidence[0][0] === 0xff).toBe(true); // re-encoded: WebP or JPEG, never the original PNG
  expect(evidence[0].subarray(0, 4).toString("latin1")).not.toBe("\x89PNG");
  const raise = JSON.parse(seen.find((s) => s.path.endsWith("/disputes") && s.method === "POST")!.body);
  expect(raise).toMatchObject({ type: "wrong_score", team: "Alpha Wolves" });
});

test("evidence limit: a fifth image is refused with a per-file message", async ({ page }) => {
  await v3SignedIn(page, { "GET /v3/me/disputes": () => ({ body: { items: [] } }) });
  await page.goto("/app/disputes/new/");
  const small = await pngBytes(page, 40, 40, false);
  const files = page.locator("#ev-files");
  await files.setInputFiles([1, 2, 3, 4, 5].map((i) => ({ name: `shot${i}.png`, mimeType: "image/png", buffer: small })));
  await expect(page.getByText(/Ready, \d+ KB/)).toHaveCount(4, { timeout: 30_000 });
  await expect(page.getByText("A dispute holds at most 4 images.")).toBeVisible();
});

test("dispute page: timeline, evidence grid, overdue badge, purged image, comment", async ({ page }) => {
  const png = await pngBytes(page, 20, 20, false);
  const seen = await v3SignedIn(page, {
    "GET /v3/disputes/d1": () => ({ body: DISPUTE }),
    "POST /v3/disputes/d1/comment": () => ({ status: 201, body: {} }),
  });
  await page.route("**/esports-api.yaseenyk.workers.dev/v3/disputes/d1/evidence/v1", (r) => r.fulfill({ status: 200, contentType: "image/png", headers: { "access-control-allow-origin": "*" }, body: png }));
  await page.goto("/app/disputes/view/?id=d1");
  await expect(page.getByRole("heading", { name: "Wrong score" })).toBeVisible();
  await expect(page.getByText("Overdue")).toBeVisible();
  await expect(page.getByText("Under review").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Timeline" })).toBeVisible();
  await expect(page.getByText("Dispute raised")).toBeVisible();
  await expect(page.getByText("Status changed to Under review")).toBeVisible();
  await expect(page.getByRole("img", { name: "Evidence image" })).toBeVisible();
  await expect(page.getByText("Deleted after the retention period.")).toBeVisible();
  await page.getByLabel("Add a comment").fill("Here is the lobby screenshot.");
  await page.getByRole("button", { name: "Post comment" }).click();
  await expect(page.getByText("Comment added.")).toBeVisible();
  expect(JSON.parse(seen.find((s) => s.path.endsWith("/comment"))!.body)).toEqual({ note: "Here is the lobby screenshot." });
  // permissions drive the buttons: this role cannot resolve, and may withdraw
  await expect(page.getByRole("button", { name: "Save decision" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Withdraw dispute" })).toBeVisible();
});

test("organiser queue lists the tournament's disputes, soonest deadline first", async ({ page }) => {
  await v3SignedIn(page, { "GET /v3/tournaments/gokte-cup-2026/disputes": () => ({ body: { items: [{ ...DISPUTE, id: "d2", dueAt: "2030-02-01T00:00:00Z", overdue: false, summary: "Later one" }, { ...DISPUTE, id: "d1", summary: "Earlier one" }] } }) });
  await page.goto("/app/tournaments/disputes/?t=gokte-cup-2026");
  const items = page.locator("ul li a");
  await expect(items.first()).toContainText("Earlier one");
  await expect(page.getByText("Overdue")).toBeVisible();
});

// ---------- accessibility: WCAG 2.1 AA on every new page, desktop and 390x844 ----------
interface A11yCase { path: string; signed: boolean; handlers: Record<string, Handler> }
const A11Y: A11yCase[] = [
  { path: "/lft/", signed: false, handlers: { "GET /public/lft": () => ({ body: { items: [LISTING], nextCursor: "c" } }) } },
  { path: "/lft/listing/?id=a1", signed: true, handlers: { ...adultOk, "GET /public/lft/a1": () => ({ body: LISTING }) } },
  { path: "/lft/new/", signed: true, handlers: { ...adultOk } },
  { path: "/players/view/?s=ravi-igl", signed: false, handlers: { "GET /public/players/ravi-igl": () => ({ body: { slug: "ravi-igl", handle: "RaviIGL", bio: "Evening IGL", city: "Pune", state: null, languages: ["Hindi"], games: [{ game: "bgmi", inGameName: "Ravi", rankCode: "diamond_3", rankOrdinal: 17, roles: ["igl"] }], updatedAt: "2030-01-01T00:00:00Z" } }) } },
  { path: "/app/lft/", signed: true, handlers: { "GET /v3/me/lft": () => ({ body: { items: [{ ...LISTING, contact: "raviigl", status: "open", hidden: false, reportCount: 0, applications: 0 }] } }), "GET /v3/me/lft/applications": () => ({ body: { items: [] } }) } },
  { path: "/app/resume/", signed: true, handlers: { "GET /v3/me/profile": () => ({ body: { profile: { slug: "ravi-igl", handle: "RaviIGL", visibility: "private", games: [{ game: "bgmi", inGameName: "Ravi", rankCode: "diamond_3", rankOrdinal: 17, roles: ["igl"] }], languages: [] }, adultConfirmedAt: "2030-01-01T00:00:00Z", resumeConsentAt: null } }) } },
  { path: "/app/disputes/", signed: true, handlers: { "GET /v3/me/disputes": () => ({ body: { items: [DISPUTE] } }) } },
  { path: "/app/disputes/new/", signed: true, handlers: { "GET /v3/me/disputes": () => ({ body: { items: [] } }) } },
  { path: "/app/disputes/view/?id=d1", signed: true, handlers: { "GET /v3/disputes/d1": () => ({ body: DISPUTE }) } },
  { path: "/app/tournaments/disputes/?t=gokte-cup-2026", signed: true, handlers: { "GET /v3/tournaments/gokte-cup-2026/disputes": () => ({ body: { items: [DISPUTE] } }) } },
  // and the calm "Not available yet" state of one page in each area
  { path: "/lft/#off", signed: false, handlers: {} },
  { path: "/app/resume/#off", signed: true, handlers: {} },
];
const VIEWPORTS = [{ name: "desktop", width: 1280, height: 900 }, { name: "390x844", width: 390, height: 844 }];

for (const c of A11Y) {
  for (const vp of VIEWPORTS) {
    test(`${c.path} has no serious accessibility problems at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      if (c.signed) await v3SignedIn(page, c.handlers); else await mockV3(page, c.handlers);
      await page.goto(c.path.replace("#off", ""));
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(700);
      const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      const bad = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
      // no horizontal scroll on a phone
      const wide = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      expect(wide).toBe(false);
    });
  }
}

test("dialogs have no serious accessibility problems (apply and report)", async ({ page }) => {
  await v3SignedIn(page, { ...adultOk, "GET /public/lft/a1": () => ({ body: LISTING }) });
  await page.goto("/lft/listing/?id=a1");
  for (const name of ["Apply", "Report this listing"]) {
    await page.getByRole("button", { name, exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id)).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
  }
});

test("existing pages are untouched: the footer has no v3 links while the API is off", async ({ page }) => {
  test.skip(fs.existsSync(path.resolve("out", "tournaments", "fixture-cup-1")), "this build was made against the mock tournament API, which turns the footer link on by design");
  await page.goto("/");
  const footer = page.locator("footer");
  for (const t of ["Find a team", "Tournaments"]) await expect(footer.getByRole("link", { name: t, exact: true })).toHaveCount(0);
  await expect(page.locator("a[href^='/lft'], a[href^='/players']")).toHaveCount(0);
});

void json;
