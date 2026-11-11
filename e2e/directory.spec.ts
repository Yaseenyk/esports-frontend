// The public events list and the organiser's "List this event" panel, with the server mocked.
import { expect, test } from "@playwright/test";
import { json, openPanel, preflight, signedIn } from "./helpers";

const API = "**/esports-api.yaseenyk.workers.dev";
const future = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
const e = (i: number, o: Record<string, unknown> = {}) => ({ id: `ev${i}`, title: `Cup ${i}`, game: i % 2 ? "BGMI" : "Free Fire", city: "Pune", mode: "in-person", startsOn: future(5), blurb: `About cup ${i}`, regLink: `https://esports.streamerosai.com/register/?t=tok${i}`, ended: false, ...o });

test("tournaments page: cards, filters, show more and the report confirm step", async ({ page }) => {
  await preflight(page);
  const reports: unknown[] = [];
  await page.route(`${API}/public/directory**`, (r) => {
    const u = new URL(r.request().url());
    if (r.request().method() === "POST") return r.fallback();
    const online = u.searchParams.get("mode") === "online";
    return r.fulfill(json({ entries: online ? [] : [e(1), e(2)], page: 1, hasMore: !online, games: ["BGMI", "Free Fire"], cities: ["Pune"] }));
  });
  await page.route(`${API}/public/directory/ev1/report`, async (r) => { reports.push(r.request().postDataJSON()); await r.fulfill(json({ ok: true }, 201)); });
  await page.goto("/tournaments/");
  await expect(page.getByRole("heading", { level: 1, name: "Find a tournament" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cup 1" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Register your team/ }).first()).toHaveAttribute("href", /\/register\/\?t=tok1/);
  await expect(page.getByRole("button", { name: "Show more" })).toBeVisible();
  expect((await page.evaluate(() => document.querySelector('meta[name="robots"]')?.getAttribute("content"))) ?? "").toContain("noindex");

  await page.getByRole("button", { name: /Report this listing/ }).first().click();
  await expect(page.getByRole("dialog", { name: "Report this listing?" })).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();
  expect(reports).toHaveLength(0);
  await page.getByRole("button", { name: /Report this listing/ }).first().click();
  await page.getByRole("button", { name: "Yes, report it" }).click();
  await expect(page.getByText(/We have noted your report/)).toBeVisible();
  expect(reports).toHaveLength(1);

  await page.getByRole("button", { name: "Online", exact: true }).click();
  await expect(page.getByRole("button", { name: "Online", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("No listed events match those choices.")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).first().click();
  await expect(page.getByRole("heading", { name: "Cup 1" })).toBeVisible();
});

test("tournaments page: error state offers retry; empty state says why and how to list", async ({ page }) => {
  await preflight(page);
  let fail = true;
  await page.route(`${API}/public/directory**`, (r) => (fail ? r.fulfill(json({ error: "x" }, 500)) : r.fulfill(json({ entries: [], page: 1, hasMore: false, games: [], cities: [] }))));
  await page.goto("/tournaments/");
  await expect(page.getByRole("alert").filter({ hasText: /\S/ })).toContainText("server had a problem");
  fail = false;
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByText("No organiser has listed an upcoming event yet.")).toBeVisible();
  await expect(page.getByText("List this event publicly").first()).toBeVisible();
});

test("panel: three steps, preview, list, then remove with a confirm", async ({ page }) => {
  await signedIn(page, [{ id: "e1", key: "k", name: "Spring Cup", game: "BGMI", organiser: "Org", date: future(9), venue: "Hall", emergency: "", rules: "", settings: {}, updatedAt: "2026-01-01T00:00:00Z", role: "owner" }]);
  let entry: unknown = null;
  const puts: any[] = [];
  await page.route(`${API}/events/e1/directory`, async (r) => {
    if (r.request().method() === "PUT") {
      const b = r.request().postDataJSON();
      puts.push(b);
      entry = { listed: b.listed, title: b.title ?? "Spring Cup", game: b.game ?? "BGMI", city: b.city ?? "Pune", mode: b.mode ?? "in-person", startsOn: b.startsOn ?? future(9), blurb: b.blurb ?? "", updatedAt: "2026-01-01T00:00:00Z" };
      return r.fulfill(json({ entry, reports: 0, hidden: false }));
    }
    return r.fulfill(json({ entry, hasRegistration: true, reports: 0, hidden: false, defaults: { title: "Spring Cup", game: "BGMI", city: "", mode: "in-person", startsOn: future(9) } }));
  });
  await page.goto("/app/events/?id=e1");
  await openPanel(page, "share", "directory");
  await expect(page.getByText("Not listed")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Event name" })).toHaveValue("Spring Cup");
  await page.getByRole("textbox", { name: /^City/ }).fill("Pune");
  await page.getByRole("button", { name: "Next: describe it" }).click();
  await page.getByRole("textbox", { name: /Description/ }).fill("Call me on 98765 43210");
  await page.getByRole("button", { name: "Next: preview" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "contact details" })).toBeVisible();
  await page.getByRole("textbox", { name: /Description/ }).fill("Squads of four");
  await page.getByRole("button", { name: "Next: preview" }).click();
  await page.getByRole("button", { name: "List this event publicly" }).click();
  await expect(page.getByText(/now on the public list/)).toBeVisible();
  expect(puts[0]).toMatchObject({ listed: true, title: "Spring Cup", blurb: "Squads of four" });
  await expect(page.getByText("Listed publicly")).toBeVisible();
  await page.getByRole("button", { name: "Remove from the list" }).click();
  expect(puts).toHaveLength(1); // nothing yet: it asks first
  await page.getByRole("button", { name: "Yes, remove it" }).click();
  await expect(page.getByText(/Removed from the public list/)).toBeVisible();
  expect(puts[1]).toEqual({ listed: false });
});
