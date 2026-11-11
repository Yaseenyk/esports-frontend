// The embeddable widget, the loader script and the panel, with the server mocked so nothing real is touched.
import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { json, openPanel, preflight, signedIn } from "./helpers";

const API = "**/esports-api.yaseenyk.workers.dev";
const table = (title: string, head: string[], rows: string[][]) => ({ v: "table", d: { title, head, rows } });
const VIEWS = [
  { kind: "standings", payload: table("Group stage standings", ["#", "Team", "Kills", "Total"], [["1", "Alpha", "10", "30"], ["2", "Bravo", "8", "25"]]) },
  { kind: "bracket", payload: { v: "bracket", d: { title: "Knockout bracket", sections: [{ name: "", rounds: [{ name: "Semi final", matches: [{ a: "Charlie", b: "Delta" }] }] }] } } },
];
const body = { event: { name: "Spring Cup", date: "2026-12-01", venue: "City Arena" }, snapshot: { views: VIEWS, announcements: [], sponsors: [], ticker: [] }, updatedAt: "2026-12-01T09:30:00Z" };
const publicLive = (page: Page, b: unknown = body, status = 200) => page.route(`${API}/public/live/*`, (r) => r.fulfill(json(b, status)));

test("the widget shows the standings with no site header or footer, and links back", async ({ page }) => {
  await preflight(page);
  await publicLive(page);
  await page.goto("/embed/?e=demo&v=standings");
  await expect(page.getByText("Group stage standings")).toBeVisible();
  await expect(page.getByText("Spring Cup")).toBeVisible();
  await expect(page.locator("footer")).toBeHidden();
  await expect(page.getByRole("navigation")).toHaveCount(0);
  const link = page.getByRole("link", { name: "Live on Esports Hub" });
  await expect(link).toHaveAttribute("href", /\/live\/\?e=demo$/);
  await expect(link).toHaveAttribute("target", "_top");
  await expect(link).toHaveAttribute("rel", /noopener/);
  expect((await page.evaluate(() => document.querySelector('meta[name="robots"]')?.getAttribute("content"))) ?? "").toContain("noindex");
});

test("the widget shows the bracket when asked", async ({ page }) => {
  await preflight(page);
  await publicLive(page);
  await page.goto("/embed/?e=demo&v=bracket");
  await expect(page.getByText("Knockout bracket")).toBeVisible();
  await expect(page.getByText("Group stage standings")).toHaveCount(0);
});

test("a view that is not published yet says so", async ({ page }) => {
  await preflight(page);
  await publicLive(page);
  await page.goto("/embed/?e=demo&v=schedule");
  await expect(page.getByText(/schedule has not been published yet/)).toBeVisible();
});

test("the widget tells the page around it how tall it is (a number only)", async ({ page, baseURL }) => {
  await preflight(page);
  await publicLive(page);
  await page.setContent(`<!doctype html><body><script>window.__m=[];addEventListener("message",function(e){window.__m.push(e.data)})</script><iframe id="f" title="w" src="${baseURL}/embed/?e=demo&id=t1" style="width:360px;height:100px;border:0"></iframe></body>`);
  await expect.poll(async () => page.evaluate(() => (window as unknown as { __m: { type: string; height: number; id: string }[] }).__m.filter((m) => m.height > 150).length)).toBeGreaterThan(0);
  const msgs = await page.evaluate(() => (window as unknown as { __m: Record<string, unknown>[] }).__m);
  const m = msgs[msgs.length - 1]!;
  expect(Object.keys(m).sort()).toEqual(["height", "id", "type"]);
  expect(m.type).toBe("eh-embed-height");
  expect(m.id).toBe("t1");
  expect(typeof m.height).toBe("number");
});

test("the light theme has a white page and inverted renderers", async ({ page }) => {
  await preflight(page);
  await publicLive(page);
  await page.goto("/embed/?e=demo&theme=light");
  await expect(page.getByText("Group stage standings")).toBeVisible();
  const root = page.locator(".eh-root");
  await expect(root).toHaveAttribute("data-theme", "light");
  await expect(root).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(root.locator("div[style*='invert']")).toHaveCount(1);
  await page.goto("/embed/?e=demo");
  await expect(page.locator(".eh-root")).toHaveCSS("background-color", "rgb(5, 7, 10)");
});

test("not live yet and offline states are plain", async ({ page }) => {
  await preflight(page);
  await publicLive(page, { error: "not_found" }, 404);
  await page.goto("/embed/?e=nothere");
  await expect(page.getByText("Not live yet")).toBeVisible();
  await expect(page.getByRole("link", { name: "Live on Esports Hub" })).toBeVisible();
  await page.unroute(`${API}/public/live/*`);
  await page.route(`${API}/public/live/*`, (r) => r.abort());
  await page.goto("/embed/?e=other");
  await expect(page.getByText("Could not load this")).toBeVisible();
  await page.goto("/embed/");
  await expect(page.getByText("This widget is not set up right")).toBeVisible();
});

test("the loader script injects a sandboxed iframe and resizes it from our own widget only", async ({ page }) => {
  const loader = fs.readFileSync(path.join(__dirname, "..", "public", "embed.js"), "utf8");
  await page.route("https://esports.streamerosai.com/embed.js", (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: loader }));
  // The fake widget runs at our origin (the request is answered here) and reports 777 high.
  await page.route("https://esports.streamerosai.com/embed/**", (r) => r.fulfill({ status: 200, contentType: "text/html", body: `<!doctype html><body>widget<script>parent.postMessage({type:"eh-embed-height",height:777,id:"x"},"*")</script>` }));
  await page.setContent(`<!doctype html><body><div data-esports-hub="spring-cup" data-view="bracket" data-theme="light"></div><script async src="https://esports.streamerosai.com/embed.js"></script></body>`);
  const frame = page.locator("div[data-esports-hub] iframe");
  await expect(frame).toHaveCount(1);
  await expect(frame).toHaveAttribute("sandbox", "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox");
  await expect(frame).toHaveAttribute("title", "Live on Esports Hub");
  await expect(frame).toHaveAttribute("loading", "lazy");
  await expect(frame).toHaveAttribute("src", /^https:\/\/esports\.streamerosai\.com\/embed\/\?e=spring-cup&v=bracket&theme=light/);
  await expect.poll(async () => frame.evaluate((f) => (f as HTMLIFrameElement).style.height)).toBe("777px");
});

test("the panel gives the code in three steps, and offers to publish first", async ({ page }) => {
  await signedIn(page, [{ id: "e1", name: "Spring Cup", date: "2026-12-01", role: "owner" }]);
  const st = { slug: "abcd1234efgh", published: false };
  await page.route(`${API}/events/e1/**`, (r) => {
    const m = r.request().method();
    if (m === "PUT") { st.published = true; return r.fulfill(json({ ...st, snapshot: body.snapshot, updatedAt: "2026-12-01T09:00:00Z" })); }
    if (r.request().url().endsWith("/live")) return r.fulfill(json({ ...st, snapshot: body.snapshot, updatedAt: "2026-12-01T09:00:00Z" }));
    return r.fulfill(json({}, 404));
  });
  await page.goto("/app/events/?id=e1");
  await openPanel(page, "share", "embed");
  const panel = page.getByRole("region", { name: "Put it on your website" });
  await expect(panel.getByText("The live page is not published yet")).toBeVisible();
  page.once("dialog", (d) => void d.accept());
  await panel.getByRole("button", { name: "Publish the live page" }).click();
  await expect(panel.getByText("The live page is on.")).toBeVisible();
  await panel.getByRole("radio", { name: /Bracket/ }).check();
  await panel.getByRole("radio", { name: /Light/ }).check();
  const script = panel.getByLabel("Option A: script (best) code");
  await expect(script).toHaveValue(/data-esports-hub="abcd1234efgh" data-view="bracket" data-theme="light"/);
  await expect(script).toHaveValue(/embed\.js/);
  await expect(panel.getByLabel("Option B: iframe code")).toHaveValue(/<iframe src="https:\/\/esports\.streamerosai\.com\/embed\/\?e=abcd1234efgh&amp;v=bracket&amp;theme=light/);
  await expect(panel.getByText("Google Sites:")).toBeVisible();
  await expect(panel.getByRole("button", { name: "Copy" })).toHaveCount(2);
});
