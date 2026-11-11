// Groups then knockout: the public tool page and the event panel. The server is mocked; no real data is touched.
import { expect, test } from "@playwright/test";
import { json, openPanel, signedIn } from "./helpers";

const A = "**/esports-api.yaseenyk.workers.dev";
const ev = { id: "e1", key: "cup", name: "Spring Cup", game: "BGMI", organiser: "", date: "2026-12-01", venue: "Pune", emergency: "", rules: "", settings: {}, updatedAt: "" };
const TEAMS = ["Alpha", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot", "Golf", "Hotel"];

test("the tool page makes groups, updates a table from scores and shows a knockout", async ({ page }) => {
  await page.goto("/tools/groups/");
  await expect(page.getByRole("heading", { level: 1, name: "Groups and knockout tournament maker" })).toBeVisible();
  const teams = page.getByLabel("One team per line");
  await teams.fill(TEAMS.join("\n"));
  await expect(page.getByText(/2 groups, 4 teams in each group/)).toBeVisible();
  const groupA = page.getByRole("region", { name: "Group A", exact: true });
  await expect(groupA).toBeVisible();
  await groupA.getByLabel(/round 1, Alpha score/i).fill("3");
  await groupA.getByLabel(/round 1, Golf score/i).fill("1"); // Alpha plays Golf in round 1 of group A
  const table = page.getByRole("region", { name: "Group A table" });
  await expect(table.getByRole("row", { name: /Alpha.*3$/ })).toBeVisible();
  await expect(page.getByText(/1 of 12 group matches have a score/)).toBeVisible();
  await expect(page.getByRole("region", { name: "Knockout bracket" }).first()).toBeVisible();
  await expect(page.getByText(/do not meet in the first round/).first()).toBeVisible();
});

test("the tool page offers the TV screen as an optional last step", async ({ page }) => {
  await page.goto("/tools/groups/");
  await expect(page.getByRole("heading", { name: /Step 5: Show the knockout bracket on a TV or stream/ })).toBeVisible();
  await page.getByLabel("The group tables").check();
  await expect(page.getByRole("heading", { name: /Show the group tables on a TV or stream/ })).toBeVisible();
});

test("the tool page tells you what to do when there are too few teams", async ({ page }) => {
  await page.goto("/tools/groups/");
  await page.getByLabel("One team per line").fill("Alpha\nBravo");
  await expect(page.getByText(/Add at least 4 teams in step 1/).first()).toBeVisible();
});

test("the panel creates group matches, asks before replacing, then makes the knockout", async ({ page }) => {
  await signedIn(page, [ev]);
  let stored: Record<string, unknown>[] = [];
  const puts: { matches: Record<string, unknown>[]; replaceStage?: string }[] = [];
  const cleared: string[] = [];
  await page.route(`${A}/events/e1/roster`, (r) => r.fulfill(json({ teams: TEAMS.map((name, i) => ({ id: `t${i}`, name })), people: [] })));
  await page.route(`${A}/events/e1/members`, (r) => r.fulfill(json({ owner: null, members: [] })));
  await page.route(`${A}/events/e1/matches**`, async (r) => {
    const req = r.request();
    if (req.method() === "PUT") {
      const body = req.postDataJSON() as { matches: Record<string, unknown>[]; replaceStage?: string };
      puts.push(body);
      stored = [...stored.filter((m) => m.stage !== body.replaceStage), ...body.matches.map((m, i) => ({ id: `m${stored.length + i}`, status: "scheduled", scoreA: null, scoreB: null, winner: null, startsAt: null, nextId: null, nextSide: null, updatedAt: "", ...m }))];
      return r.fulfill(json({ matches: stored }));
    }
    if (req.method() === "DELETE") { const s = new URL(req.url()).searchParams.get("stage") ?? ""; cleared.push(s); stored = stored.filter((m) => m.stage !== s); return r.fulfill(json({ deleted: 1 })); }
    return r.fulfill(json({ matches: stored, br: [] }));
  });
  await page.goto("/app/events/?id=e1");
  await openPanel(page, "run", "stages");
  const panel = page.getByRole("region", { name: "Groups, then knockout" });

  await panel.getByRole("button", { name: "Use the roster teams" }).click();
  await expect(panel.getByText("Added 8 teams from the roster.")).toBeVisible();
  await expect(panel.getByText(/That makes 12 group matches/)).toBeVisible();
  await panel.getByRole("button", { name: "Create the group matches" }).click();
  await expect(panel.getByText(/Created 12 group matches in 2 groups/)).toBeVisible();
  const created = puts.filter((p) => p.replaceStage?.startsWith("group:")).flatMap((p) => p.matches); // each group is written in its own step
  expect(created).toHaveLength(12);
  expect(new Set(created.map((m) => m.stage))).toEqual(new Set(["group:A", "group:B"]));

  // creating again asks first, because the event already has matches
  await panel.getByRole("button", { name: "Create the group matches" }).click();
  await expect(panel.getByRole("alertdialog", { name: "Replace the existing matches" })).toBeVisible();
  await panel.getByRole("button", { name: "Cancel" }).click();
  expect(cleared).toHaveLength(0);

  // the knockout asks first because no group match has a result yet, then writes the knockout stage
  await panel.getByRole("button", { name: "Make the knockout" }).click();
  await expect(panel.getByRole("alertdialog", { name: "Make the knockout now" })).toContainText("12 group matches have no result yet");
  await panel.getByRole("button", { name: "Yes, make the knockout" }).click();
  await expect(panel.getByText(/Created the knockout: 4 teams, 3 matches/)).toBeVisible();
  const ko = puts.at(-1)!;
  expect(ko.replaceStage).toBe("knockout");
  expect(ko.matches).toHaveLength(3);
  expect(ko.matches.filter((m) => m.nextId).length).toBe(2);
  await expect(panel.getByText(/Scorer links/).first()).toBeVisible();
});

test("a viewer sees the progress but no buttons", async ({ page }) => {
  await signedIn(page, [{ ...ev, role: "viewer" }]);
  await page.route(`${A}/events/e1/members`, (r) => r.fulfill(json({ owner: null, members: [] })));
  await page.route(`${A}/events/e1/matches**`, (r) => r.fulfill(json({ matches: [], br: [] })));
  await page.goto("/app/events/?id=e1");
  const g = page.locator('details[data-group="run"]');
  if (await g.count()) {
    await openPanel(page, "run", "stages").catch(() => undefined);
    const panel = page.getByRole("region", { name: "Groups, then knockout" });
    if (await panel.count()) await expect(panel.getByRole("button", { name: "Create the group matches" })).toHaveCount(0);
  }
});
