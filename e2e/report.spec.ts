// Event report panel and certificates pre-filled from results. The server is mocked; no real data is touched.
import { expect, test } from "@playwright/test";
import fs from "node:fs";
import { json, openPanel, signedIn } from "./helpers";

const A = "**/esports-api.yaseenyk.workers.dev";
const ev = { id: "e1", key: "cup", name: "Spring Cup", game: "BGMI", organiser: "", date: "2026-12-01", venue: "Pune", emergency: "", rules: "", settings: {}, updatedAt: "" };
const person = (id: string, name: string, teamId: string, role = "Player", minor = false) => ({ id, name, teamId, role, minor, guardian: minor, photoUrl: null });

async function mockEvent(page: import("@playwright/test").Page, people: unknown[], checkins: unknown[], checkedIn = checkins.length) {
  await signedIn(page, [ev]);
  await page.route(`${A}/events/e1/roster`, (r) => r.fulfill(json({ teams: [{ id: "t1", name: "Kings" }, { id: "t2", name: "Queens" }], people })));
  await page.route(`${A}/events/e1/checkins**`, (r) => r.fulfill(json({ checkins, total: people.length, checkedIn })));
  await page.route(`${A}/events/e1/registration`, (r) => r.fulfill(json({ form: null, counts: { pending: 0, approved: 0, rejected: 0 } })));
  await page.route(`${A}/events/e1/members`, (r) => r.fulfill(json({ owner: null, members: [] })));
}

test("the event report shows the numbers, an accessible chart, and downloads a one page PDF", async ({ page }) => {
  test.setTimeout(90_000);
  const people = [person("a", "Asha", "t1"), person("b", "Ravi", "t1", "Player", true), person("c", "Meera", "t2", "Coach"), person("d", "Kabir", "t2")];
  const checkins = [
    { personId: "a", name: "Asha", team: "Kings", role: "Player", at: "2026-12-01T09:05:00Z" },
    { personId: "b", name: "Ravi", team: "Kings", role: "Player", at: "2026-12-01T09:10:00Z" },
    { personId: "c", name: "Meera", team: "Queens", role: "Coach", at: "2026-12-01T09:40:00Z" },
  ];
  await mockEvent(page, people, checkins);
  await page.goto("/app/events/?id=e1");
  await openPanel(page, "share", "report");
  const panel = page.getByRole("region", { name: "Event report" });
  await expect(panel.getByText(/3 of 4 people \(75%\) checked in/)).toBeVisible();
  await expect(panel.getByRole("img", { name: /Arrivals every 15 minutes/ })).toBeVisible();
  await expect(panel.getByText("Kings").first()).toBeVisible();
  const [dl] = await Promise.all([page.waitForEvent("download", { timeout: 60_000 }), panel.getByRole("button", { name: "Download the report (PDF)" }).click()]);
  expect(dl.suggestedFilename()).toBe("Spring-Cup-report.pdf");
  const bytes = fs.readFileSync((await dl.path())!);
  expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
  expect((bytes.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length).toBe(1);
});

test("the event report button is off, with a plain reason, when the event has no people", async ({ page }) => {
  await mockEvent(page, [], []);
  await page.goto("/app/events/?id=e1");
  await openPanel(page, "share", "report");
  const panel = page.getByRole("region", { name: "Event report" });
  await expect(panel.getByRole("button", { name: "Download the report (PDF)" })).toBeDisabled();
  await expect(panel.getByText(/Add people to this event first/)).toBeVisible();
});

test("the event report says so when the numbers cannot be loaded", async ({ page }) => {
  await signedIn(page, [ev]);
  await page.route(`${A}/events/e1/roster`, (r) => r.fulfill(json({ error: "boom" }, 500)));
  await page.route(`${A}/events/e1/checkins**`, (r) => r.fulfill(json({ checkins: [], total: 0, checkedIn: 0 })));
  await page.route(`${A}/events/e1/registration`, (r) => r.fulfill(json({ form: null, counts: { pending: 0, approved: 0, rejected: 0 } })));
  await page.route(`${A}/events/e1/members`, (r) => r.fulfill(json({ owner: null, members: [] })));
  await page.goto("/app/events/?id=e1");
  await openPanel(page, "share", "report");
  const panel = page.getByRole("region", { name: "Event report" });
  await expect(panel.getByRole("button", { name: "Download the report (PDF)" })).toBeDisabled({ timeout: 20_000 });
});

test("certificates open pre-filled from an awards link, each certificate with its own award", async ({ page }) => {
  await page.goto("/tools/certificates/?awards=" + encodeURIComponent("Winner:Team A|Runner-up:Team B|Third place:Team C"));
  await expect(page.getByText("Pre-filled from your results. Check the names and press Download.")).toBeVisible();
  const box = page.getByLabel("Award and name, one per line");
  await expect(box).toHaveValue("Winner: Team A\nRunner-up: Team B\nThird place: Team C");
  await expect(page.getByRole("button", { name: /Download PDF \(3\)/ })).toBeEnabled();
  await expect(page.getByText(/as Winner in/).first()).toBeVisible();
  await box.fill("Runner-up: Team B\nTeam D");
  await expect(page.getByText(/as Runner-up in/).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /Download PDF \(2\)/ })).toBeVisible();
});

test("certificates pre-fill from a plain names link as Participation, and strip junk from the link", async ({ page }) => {
  await page.goto("/tools/certificates/?names=" + encodeURIComponent("Asha Verma|Ravi%00Shah"));
  await expect(page.getByLabel("Award and name, one per line")).toHaveValue(/Participation: Asha Verma\nParticipation: Ravi/);
  await expect(page.getByText(/as Participation in/).first()).toBeVisible();
});

test("certificates without a link keep the plain names list", async ({ page }) => {
  await page.goto("/tools/certificates/");
  await expect(page.getByLabel("Names, one per line")).toBeVisible();
  await expect(page.getByText("Pre-filled from your results.")).toHaveCount(0);
});
