// The brand kit: the panel (three steps) and the live page that wears it. The server is mocked, so nothing real is touched.
import { expect, test, type Page } from "@playwright/test";
import zlib from "node:zlib";
import { json, openPanel, preflight, signedIn } from "./helpers";

const API = "**/esports-api.yaseenyk.workers.dev";
const EVENT = { id: "e1", key: "cup", name: "Spring Cup", game: "BGMI", organiser: "", date: "2026-12-01", venue: "", emergency: "", rules: "", settings: {}, updatedAt: "", role: "owner" };

function crc(buf: Buffer) { let c = ~0; for (const b of buf) { c ^= b; for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1; } return ~c >>> 0; }
function chunk(type: string, data: Buffer) { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); }
/** A real, small, decodable PNG, so the browser can shrink it. */
function tinyPng(w: number, h: number) {
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  const row = Buffer.concat([Buffer.from([0]), Buffer.alloc(w * 3, 0x80)]);
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(Buffer.concat(Array(h).fill(row)))), chunk("IEND", Buffer.alloc(0))]);
}
const LOGO = `data:image/png;base64,${tinyPng(8, 8).toString("base64")}`;

interface Kit { name: string; logo: string | null; primaryColor: string; secondaryColor: string }
/** The brand routes, kept in one object so each test can read what was saved. */
async function mockBrand(page: Page, start: { account: Kit | null; event: Kit | null }, role = "owner") {
  const st = { ...start };
  const eff = () => (st.event ? { brand: st.event, source: "event" } : st.account ? { brand: st.account, source: "account" } : { brand: null, source: "none" });
  await page.route(`${API}/brand`, async (r) => {
    const m = r.request().method();
    if (m === "PUT") st.account = r.request().postDataJSON();
    if (m === "DELETE") st.account = null;
    await r.fulfill(json(st.account ? { brand: st.account, source: "account" } : { brand: null, source: "none" }));
  });
  await page.route(`${API}/events/e1/brand`, async (r) => {
    const m = r.request().method();
    if (m === "PUT") st.event = r.request().postDataJSON();
    if (m === "DELETE") st.event = null;
    await r.fulfill(json(eff()));
  });
  await page.route(`${API}/events/e1`, (r) => r.fulfill(json({ ...EVENT, role })));
  return st;
}

test("the panel walks through logo, colours and saving for this event only", async ({ page }) => {
  await signedIn(page, [EVENT]);
  const st = await mockBrand(page, { account: null, event: null });
  await page.goto("/app/events/?id=e1");
  await openPanel(page, "settings", "brand");
  const panel = page.getByRole("region", { name: "Your logo and colours" });
  await expect(panel.getByText("No kit saved yet.")).toBeVisible();
  await expect(panel.getByRole("heading", { name: /Upload your logo/ })).toBeVisible();
  await expect(panel.getByRole("heading", { name: /Pick two colours/ })).toBeVisible();
  await panel.getByLabel(/Choose a logo/).setInputFiles({ name: "logo.png", mimeType: "image/png", buffer: tinyPng(600, 300) });
  await expect(panel.getByRole("img", { name: "Your logo on a light background" })).toBeVisible();
  await expect(panel.getByRole("img", { name: "Your logo on a dark background" })).toBeVisible();
  // a too-dark colour warns, and the fix button makes it readable
  await panel.getByLabel("Main colour", { exact: true }).fill("#101040");
  await expect(panel.getByText(/too dark to read/)).toBeVisible();
  await panel.getByRole("button", { name: /easier to read/ }).click();
  await expect(panel.getByText(/too dark to read/)).toHaveCount(0); // the fix made the main colour readable (a colour pair can still carry its own, separate note)
  await panel.getByRole("button", { name: "Use for this event only" }).click();
  await expect(panel.getByText(/Only Spring Cup uses this logo/)).toBeVisible();
  expect(st.event?.primaryColor).toMatch(/^#[0-9a-f]{6}$/);
  expect(st.event?.logo).toMatch(/^data:image\/(png|jpeg);base64,/);
  expect(st.account).toBeNull();
});

test("saving for all events, then removing with a confirmation", async ({ page }) => {
  await signedIn(page, [EVENT]);
  const st = await mockBrand(page, { account: { name: "Acme", logo: null, primaryColor: "#22d3ee", secondaryColor: "#a855f7" }, event: null });
  await page.goto("/app/events/?id=e1");
  await openPanel(page, "settings", "brand");
  const panel = page.getByRole("region", { name: "Your logo and colours" });
  await expect(panel.getByText("This event uses your account kit.")).toBeVisible();
  const nameBox = panel.getByLabel("Brand name (shown next to the logo)");
  await expect(nameBox).toHaveValue("Acme");
  await nameBox.fill("Acme Esports");
  await panel.getByRole("button", { name: "Use for all my events" }).click();
  await expect(panel.getByText(/Every event of yours/)).toBeVisible();
  expect(st.account?.name).toBe("Acme Esports");
  await panel.getByText("More options").click();
  await panel.getByRole("button", { name: "Remove my all-events kit" }).click();
  await expect(panel.getByRole("alertdialog")).toBeVisible();
  await panel.getByRole("button", { name: "No, keep it" }).click();
  expect(st.account).not.toBeNull(); // nothing is removed on a single tap
  await panel.getByRole("button", { name: "Remove my all-events kit" }).click();
  await panel.getByRole("button", { name: "Yes, remove it" }).click();
  await expect(panel.getByText(/Removed your account kit/)).toBeVisible();
  expect(st.account).toBeNull();
});

test("a viewer sees the kit but has no save or remove buttons", async ({ page }) => {
  await signedIn(page, [{ ...EVENT, role: "viewer" }]);
  await mockBrand(page, { account: null, event: { name: "Acme", logo: null, primaryColor: "#22d3ee", secondaryColor: "#a855f7" } }, "viewer");
  await page.goto("/app/events/?id=e1");
  await openPanel(page, "settings", "brand");
  const panel = page.getByRole("region", { name: "Your logo and colours" });
  await expect(panel.getByText(/only the owner or an editor can change/)).toBeVisible();
  await expect(panel.getByRole("button", { name: "Use for this event only" })).toHaveCount(0);
});

const livePage = () => ({ event: { name: "Spring Cup", date: "2026-12-01", venue: "City Arena" }, snapshot: { views: [], announcements: [{ text: "Round 2 starts at 3 pm", at: "2026-12-01T09:30:00Z" }], sponsors: [], ticker: [] }, updatedAt: "2026-12-01T09:30:00Z" });

test("the public live page wears the brand: logo in the header and the share button in the main colour", async ({ page }) => {
  await preflight(page);
  await page.route(`${API}/public/live/*`, (r) => r.fulfill(json(livePage())));
  await page.route(`${API}/public/brand/*`, (r) => r.fulfill(json({ brand: { name: "Acme Esports", logo: LOGO, primaryColor: "#ffee00", secondaryColor: "#a855f7" } })));
  await page.goto("/live/?e=demo");
  await expect(page.getByRole("img", { name: "Acme Esports logo" })).toBeVisible();
  const share = page.getByRole("button", { name: "Share", exact: true });
  await expect(share).toHaveCSS("background-color", "rgb(255, 238, 0)");
  await expect(share).toHaveCSS("color", "rgb(0, 0, 0)"); // black text on yellow
});

test("the live page looks normal when there is no brand or the brand call fails", async ({ page }) => {
  await preflight(page);
  await page.route(`${API}/public/live/*`, (r) => r.fulfill(json(livePage())));
  await page.route(`${API}/public/brand/*`, (r) => r.fulfill(json({ error: "not_found" }, 404)));
  await page.goto("/live/?e=demo");
  await expect(page.getByRole("heading", { level: 1, name: "Spring Cup" }).first()).toBeVisible();
  await expect(page.getByRole("img", { name: /logo/i })).toHaveCount(0);
});
