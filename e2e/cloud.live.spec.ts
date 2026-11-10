const openMenu = async (page: import("@playwright/test").Page) => { const t = page.getByRole("button", { name: /Save, open or share/ }); if (await t.isVisible() && (await t.getAttribute("aria-expanded")) !== "true") await t.click(); }; // phones keep Save / Open / Online in a menu
// Runs against the REAL deployed backend with a throw-away account, so it is skipped unless asked for:
//   LIVE=1 PORT=4173 npx playwright test e2e/cloud.live.spec.ts --project=desktop
// (4173 is one of the origins the backend allows. Build first with NEXT_PUBLIC_API_URL set.)
import { expect, test } from "@playwright/test";

test.skip(!process.env.LIVE, "live backend test, run on request");
test.describe.configure({ mode: "serial" });

const email = `live+${Date.now()}@example.com`;
const password = `Live-${Math.random().toString(36).slice(2)}-A1`;
const API = "https://esports-api.yaseenyk.workers.dev";

test("sign up, save online, live check-in on a second page, pass link, invite and approval", async ({ page, context }) => {
  await page.goto("/tools/id-cards/");
  await openMenu(page);
  await page.getByRole("button", { name: /^Online/ }).click();
  const dlg = page.getByRole("dialog", { name: "Cloud" });
  await dlg.getByRole("tab", { name: "Create account" }).click();
  await dlg.getByLabel("Your name").fill("Live Test");
  await dlg.getByLabel("Email").fill(email);
  await dlg.getByLabel("Password").fill(password);
  await dlg.getByRole("button", { name: "Create account" }).click();

  await expect(dlg.getByText(/Signed in as/)).toBeVisible({ timeout: 20_000 });
  await dlg.getByRole("button", { name: /Save this event online/ }).click();
  await expect(dlg.getByText(/Saved\./)).toBeVisible({ timeout: 90_000 });
  await expect(dlg.getByText(/12 people sent/)).toBeVisible();

  // Saving again changes nothing, so it sends nothing.
  await dlg.getByRole("button", { name: /Save changes online/ }).click();
  await expect(dlg.getByText(/People were already up to date, 0 photos uploaded/)).toBeVisible({ timeout: 30_000 });

  // A gate key for one door.
  await dlg.getByRole("tab", { name: "Live check-in" }).click();
  await dlg.getByRole("button", { name: "Create key" }).click();
  const key = (await dlg.locator("p.font-mono").first().innerText()).trim();
  expect(key).toMatch(/^gk_/);

  // Pass codes come from the owner's own API, as the cards use them.
  const token = await page.evaluate(() => JSON.parse(localStorage.getItem("eh-session-v1")!).token as string);
  const link = await page.evaluate(() => JSON.parse(localStorage.getItem("eh-cloud-link-v1")!) as { id: string });
  const passes = (await (await fetch(`${API}/events/${link.id}/passes`, { headers: { authorization: `Bearer ${token}` } })).json()) as { personId: string; code: string }[];
  expect(passes).toHaveLength(12);

  // The gate phone.
  const gate = await context.newPage();
  await gate.goto("/tools/check-in/");
  await gate.getByRole("tab", { name: /Live/ }).click();
  await gate.getByLabel("Gate key").fill(key);
  await gate.getByRole("button", { name: "Connect" }).click();
  await expect(gate.getByText(/Connected\. 0 of 12 checked in/)).toBeVisible({ timeout: 20_000 });
  await gate.getByLabel("Pass code").fill(passes[0]!.code);
  await gate.getByRole("button", { name: "Check", exact: true }).click();
  await expect(gate.getByText(/Genuine pass: let them in/)).toBeVisible({ timeout: 20_000 });
  await gate.getByLabel("Pass code").fill(passes[0]!.code);
  await gate.getByRole("button", { name: "Check", exact: true }).click();
  await expect(gate.getByText(/Already checked in/)).toBeVisible({ timeout: 20_000 });
  await gate.getByLabel("Pass code").fill(passes[1]!.code.replace(/.$/, "x"));
  await gate.getByRole("button", { name: "Check", exact: true }).click();
  await expect(gate.getByText(/Not a valid pass/)).toBeVisible({ timeout: 20_000 });

  // Gate phone loses signal: the scan is kept, clearly marked unverified, then sent when signal returns.
  await gate.context().setOffline(true);
  await gate.getByLabel("Pass code").fill(passes[2]!.code);
  await gate.getByRole("button", { name: "Check", exact: true }).click();
  await expect(gate.getByText(/No signal: not verified yet/)).toBeVisible({ timeout: 20_000 });
  await expect(gate.getByText(/1 scan waiting for signal/)).toBeVisible();
  await gate.context().setOffline(false);
  await gate.evaluate(() => window.dispatchEvent(new Event("online")));
  await expect(gate.getByText(/waiting for signal/)).toHaveCount(0, { timeout: 30_000 });

  // The owner sees both arrivals.
  await dlg.getByRole("tab", { name: "Save & sync" }).click();
  await dlg.getByRole("tab", { name: "Live check-in" }).click();
  await expect(dlg.getByText(/2 of 12 checked in/)).toBeVisible({ timeout: 40_000 });

  // A private pass link.
  await dlg.getByRole("tab", { name: "Player invites" }).click();
  await dlg.getByRole("button", { name: "Get link" }).click();
  const passUrl = (await dlg.locator("p.font-mono").last().innerText()).trim();
  const pp = await context.newPage();
  await pp.goto(passUrl.replace(/^https?:\/\/[^/]+/, ""));
  await expect(pp.getByRole("heading", { name: "Monsoon Clash Season 2" })).toBeVisible({ timeout: 20_000 });

  // An invite: a player adds themselves, the organiser approves.
  await dlg.getByRole("button", { name: /Make link/ }).click();
  const joinUrl = (await dlg.locator("p.font-mono", { hasText: "/join/" }).innerText()).trim();
  const jp = await context.newPage();
  await jp.goto(joinUrl.replace(/^https?:\/\/[^/]+/, ""));
  await jp.getByLabel(/Your name/).fill("Test Joiner");
  await jp.getByRole("button", { name: "Send to the organiser" }).click();
  await expect(jp.getByText("Sent. Thank you.")).toBeVisible({ timeout: 20_000 });
  await dlg.getByRole("tab", { name: "Save & sync" }).click();
  await dlg.getByRole("tab", { name: "Player invites" }).click();
  await expect(dlg.getByText("Test Joiner")).toBeVisible({ timeout: 20_000 });
  await dlg.getByRole("button", { name: "Approve" }).click();
  await expect(dlg.getByText("Nobody is waiting.")).toBeVisible({ timeout: 20_000 });

  // Clean up the throw-away event.
  const del = await fetch(`${API}/events/${link.id}`, { method: "DELETE", headers: { authorization: `Bearer ${token}` } });
  expect(del.status).toBe(200);
});
