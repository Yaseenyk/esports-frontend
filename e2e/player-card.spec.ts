// Player card with a QR that opens the player's page (25 Nov 2026). The API is MOCKED (route interception): nothing reaches the real backend.
// Run one project at a time:  npx playwright test e2e/player-card.spec.ts --project=desktop  (then --project=phone)
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { adultOk, mockV3, v3SignedIn } from "./v3-helpers";

test.setTimeout(120_000);

const TOKEN = "AbCdEfGhIjKlMnOpQrStUv";
const axe = async (page: Page) => {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)).toBe(false);
};

const CARD_PAGE = {
  kind: "player", slug: null, handle: "RaviIGL", bio: "Entry fragger from Pune", city: "Pune", state: "Maharashtra", languages: ["Hindi"], teamName: "Alpha Wolves",
  games: [{ game: "bgmi", inGameName: "RaviOP", rankCode: null, rankOrdinal: null, roles: ["igl"] }],
  links: [{ kind: "youtube", url: "https://www.youtube.com/@ravi" }, { kind: "website", url: "javascript:alert(1)" }],
  achievements: [{ title: "Pune LAN finalist", year: 2030 }],
  stats: { source: "verified_results", tournaments: 1, matches: { played: 0, wins: 0, losses: 0, draws: 0 }, battleRoyale: { matches: 2, wins: 1, kills: 18, bestPlacement: 1 } },
  visibility: "unlisted", indexable: false, teams: [], matches: [], battleRoyale: [{ tournament: { slug: "gokte-cup", title: "Gokte Cup" }, team: "Alpha Wolves", matchNo: 1, placement: 1, kills: 11, corrected: false }],
  certificates: [], updatedAt: "2030-01-06T00:00:00.000Z",
};

test("the QR page: shows what the player shared, drops the token from the address, noindex and no referrer", async ({ page }) => {
  const seen = await mockV3(page, { [`GET /public/profiles/cards/${TOKEN}`]: () => ({ body: CARD_PAGE }) });
  await page.goto(`/p/?k=${TOKEN}`);
  await expect(page.getByRole("heading", { level: 1, name: "RaviIGL" })).toBeVisible();
  expect(page.url()).not.toContain(TOKEN); // removed from the address bar (history.replaceState)
  expect(seen.some((s) => s.path === `/public/profiles/cards/${TOKEN}`)).toBe(true);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  await expect(page.locator('meta[name="referrer"]').first()).toHaveAttribute("content", "no-referrer");
  await expect(page.getByText("Current team:")).toContainText("Alpha Wolves");
  await expect(page.getByRole("heading", { name: /Stats/ })).toContainText("Verified");
  await expect(page.getByText("Pune LAN finalist")).toBeVisible();
  await expect(page.getByText("Added by the player and not checked")).toBeVisible();
  const yt = page.getByRole("link", { name: /YouTube/ });
  await expect(yt).toHaveAttribute("rel", "nofollow ugc noopener noreferrer");
  await expect(yt).toHaveAttribute("target", "_blank");
  await expect(page.locator('a[href^="javascript:"]')).toHaveCount(0);
  await expect(page.locator("[data-clarity-mask]")).toHaveCount(1);
  await expect(page.getByRole("link", { name: "Sign in to report this page" })).toBeVisible();
  // a reload still works from this tab's storage, and the token stays out of the address
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "RaviIGL" })).toBeVisible();
  expect(page.url()).not.toContain(TOKEN);
  await axe(page);
});

test("the QR page renders player text as text, never as HTML", async ({ page }) => {
  await mockV3(page, { [`GET /public/profiles/cards/${TOKEN}`]: () => ({ body: { ...CARD_PAGE, handle: "<img src=x onerror=alert(1)>", bio: "<script>window.__x=1</script>" } }) });
  let dialog = false;
  page.on("dialog", (d) => { dialog = true; void d.dismiss(); });
  await page.goto(`/p/?k=${TOKEN}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("<img src=x onerror=alert(1)>");
  await expect(page.locator("article img[src='x']")).toHaveCount(0);
  expect(await page.evaluate(() => (window as unknown as { __x?: number }).__x)).toBeUndefined();
  expect(dialog).toBe(false);
});

test("a reset, private or unknown card link and a malformed one show the same not-available page", async ({ page }) => {
  const seen = await mockV3(page); // every card link is the API's 404
  await page.goto(`/p/?k=${TOKEN}`);
  await expect(page.getByRole("heading", { level: 1, name: "This player page is not available" })).toBeVisible();
  await page.goto("/p/?k=not-a-token");
  await expect(page.getByRole("heading", { level: 1, name: "This player page is not available" })).toBeVisible();
  expect(seen.filter((s) => s.path.startsWith("/public/profiles/cards/")).map((s) => s.path)).toEqual([`/public/profiles/cards/${TOKEN}`]); // a malformed token is never sent
  await axe(page);
});

test("a signed-in visitor reports a card page by its link", async ({ page }) => {
  const seen = await v3SignedIn(page, { [`GET /public/profiles/cards/${TOKEN}`]: () => ({ body: CARD_PAGE }), [`POST /v3/profiles/cards/${TOKEN}/report`]: () => ({ status: 202, body: { ok: true } }) });
  await page.goto(`/p/?k=${TOKEN}`);
  await page.getByRole("button", { name: "Report this page" }).click();
  await page.getByLabel("What is wrong?").selectOption("minor_exposed");
  await page.getByRole("button", { name: "Send report" }).click();
  await expect(page.getByText("Thank you. A moderator will look at it.")).toBeVisible();
  expect(JSON.parse(seen.find((s) => s.path === `/v3/profiles/cards/${TOKEN}/report`)!.body).reason).toBe("minor_exposed");
});

// ---------- the owner's side ----------
const PROFILE = { slug: "ravi", handle: "RaviIGL", bio: null, city: null, state: null, languages: [], visibility: "private", games: [{ game: "bgmi", inGameName: "RaviOP", rankCode: "", rankOrdinal: 0, roles: ["igl"] }], stats: null, adultConfirmedAt: "2030-01-01T00:00:00.000Z", resumeConsentAt: "2030-01-01T00:00:00.000Z", createdAt: "2030-01-01T00:00:00.000Z", updatedAt: "2030-01-01T00:00:00.000Z" };
const DETAILS = { teamName: "Alpha Wolves", links: [], achievements: [], hiddenFields: [], searchOptIn: false };
const own = (over: Record<string, unknown> = {}) => ({ page: { slug: "ravi", visibility: "private", path: null, cardPath: null, cardCreatedAt: null, details: DETAILS, indexable: false, indexBlockers: ["not_public", "search_off"], hiddenByModeration: false, teams: [], entries: [], matches: [], battleRoyale: [], certificates: [], ...over } });
const statusOk = { "GET /v3/me/status": () => ({ body: { adultConfirmedAt: "2030-01-01T00:00:00.000Z", resumeConsentAt: "2030-01-01T00:00:00.000Z" } }) };

test("player card studio: a private profile gets one clear step to share first, and nothing is created", async ({ page }) => {
  const seen = await v3SignedIn(page, { ...statusOk, "GET /v3/me/profile": () => ({ body: { profile: PROFILE } }), "GET /v3/me/player-page": () => ({ body: own() }) });
  await page.goto("/app/player-card/");
  await expect(page.getByRole("heading", { level: 1, name: "My player card" })).toBeVisible();
  await expect(page.getByLabel("Name or handle")).toHaveValue("RaviIGL");
  await expect(page.getByTestId("share-first")).toBeVisible();
  await expect(page.getByRole("link", { name: "Choose who can see my page" })).toHaveAttribute("href", "/app/resume/#pp-h");
  await expect(page.getByTestId("qr-value")).toHaveCount(0);
  expect(seen.some((s) => s.method !== "GET")).toBe(false); // never publishes or creates anything on its own
  await axe(page);
});

test("player card studio: a shared profile makes its card link on request and the QR holds that link", async ({ page }) => {
  let made = false;
  const seen = await v3SignedIn(page, {
    ...statusOk, "GET /v3/me/profile": () => ({ body: { profile: { ...PROFILE, visibility: "unlisted" } } }),
    "GET /v3/me/player-page": () => ({ body: own({ visibility: "unlisted", ...(made ? { cardPath: `/p/?k=${TOKEN}`, path: `/p/?k=${TOKEN}` } : {}) }) }),
    "POST /v3/me/player-page/card-link": () => { made = true; return { body: own({ visibility: "unlisted", cardPath: `/p/?k=${TOKEN}`, path: `/p/?k=${TOKEN}` }) }; },
  });
  await page.goto("/app/player-card/");
  await page.getByRole("button", { name: "Use my player page" }).click();
  await expect(page.getByTestId("qr-value")).toHaveText(new RegExp(`/p/\\?k=${TOKEN}$`));
  expect(seen.filter((s) => s.path === "/v3/me/player-page/card-link")).toHaveLength(1);
  await expect(page.getByTestId("player-card").locator("svg path")).not.toHaveCount(0); // the QR is drawn
  await page.getByRole("radio", { name: /No QR code/ }).check();
  await expect(page.getByTestId("qr-value")).toHaveCount(0);
  await page.getByLabel("Photo (optional)").setInputFiles({ name: "x.svg", mimeType: "image/svg+xml", buffer: Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'/>") });
  await expect(page.getByText("Use a PNG, JPEG or WebP photo.")).toBeVisible();
  await axe(page);
});

test("player card studio: with no profile yet it says to create one first", async ({ page }) => {
  await v3SignedIn(page, { ...statusOk, "GET /v3/me/profile": () => ({ body: { profile: null, adultConfirmedAt: "2030-01-01T00:00:00.000Z", resumeConsentAt: null } }), "GET /v3/me/player-page": () => ({ body: { page: null } }) });
  await page.goto("/app/player-card/");
  await expect(page.getByRole("heading", { name: "Create your player profile first" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Create my profile" })).toHaveAttribute("href", "/app/resume/");
});

test("edit screen: links are checked, each field has a show/hide switch, search is opt-in, the QR link can be reset", async ({ page }) => {
  const bodies: Record<string, unknown>[] = [];
  const seen = await v3SignedIn(page, {
    ...adultOk, ...statusOk, "GET /v3/me/profile": () => ({ body: { profile: { ...PROFILE, visibility: "public" } } }),
    "GET /v3/me/player-page": () => ({ body: own({ visibility: "public", path: "/players/view/?s=ravi", cardPath: `/p/?k=${TOKEN}` }) }),
    "PUT /v3/me/player-page/details": ({ body }) => { bodies.push(body as Record<string, unknown>); return { body: own({ visibility: "public", path: "/players/view/?s=ravi", cardPath: `/p/?k=${TOKEN}`, details: { ...DETAILS, ...(body as object) } }) }; },
    "POST /v3/me/player-page/card-link/reset": () => ({ body: own({ visibility: "public", path: "/players/view/?s=ravi", cardPath: "/p/?k=ZZZZZZZZZZZZZZZZZZZZZZ" }) }),
  });
  await page.goto("/app/resume/");
  await expect(page.getByRole("heading", { name: "What your page shows" })).toBeVisible();
  await page.getByLabel("Address", { exact: true }).fill("javascript:alert(1)");
  await page.getByRole("button", { name: "Add link" }).click();
  await expect(page.getByText("Use an address that starts with https://")).toBeVisible();
  expect(bodies).toHaveLength(0);
  await page.getByLabel("Address", { exact: true }).fill("https://www.youtube.com/@ravi");
  await page.getByRole("button", { name: "Add link" }).click();
  await expect(page.getByText("Links saved.")).toBeVisible();
  expect(bodies.at(-1)).toEqual({ links: [{ kind: "youtube", url: "https://www.youtube.com/@ravi" }] });
  await page.getByRole("checkbox", { name: "Bio", exact: true }).uncheck();
  await page.getByRole("button", { name: "Save what shows" }).click();
  await expect(page.getByText("Your choices are saved.")).toBeVisible();
  expect(bodies.at(-1)).toEqual({ hiddenFields: ["bio"] });
  await page.getByRole("checkbox", { name: /Show my profile in Google search/ }).check();
  await expect(page.getByText(/Search is on/)).toBeVisible();
  expect(bodies.at(-1)).toEqual({ searchOptIn: true });
  await page.getByRole("button", { name: "Reset QR link" }).click();
  await expect(page.getByText("Cards you already printed or shared will stop opening your page.")).toBeVisible();
  await page.getByRole("button", { name: "Yes, reset the QR link" }).click();
  await expect(page.getByText(/New QR link made/)).toBeVisible();
  expect(seen.filter((s) => s.path === "/v3/me/player-page/card-link/reset")).toHaveLength(1);
  await axe(page);
});
