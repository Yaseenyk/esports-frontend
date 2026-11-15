// Draws the sample cards shown on /id-card-maker/esports/ with the ID card studio's OWN renderers (the same PNG export the Print step uses).
// Everything on them is a placeholder: no real players, teams or events. Run after `npm run build`:
//   node scripts/serve-out.mjs (PORT=4311) in one terminal, then  PORT=4311 node scripts/make-esports-samples.mjs
// Output goes to public/samples/esports/ and is committed.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { chromium } from "@playwright/test";

const BASE = `http://localhost:${process.env.PORT || 4311}`;
const OUT = path.resolve("public/samples/esports");
const tmp = path.resolve("scripts/.tmp-esports");
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(tmp, { recursive: true });

const project = (fmt) => ({
  v: 1, app: "esports-hub-idcards", savedAt: "2026-11-15T00:00:00.000Z",
  event: { name: "Sample Cup 2026", game: "Multi-game", organiser: "Sample Organiser", fmt },
  info: { date: "2026-12-12", venue: "Sample venue", emergency: "Organiser desk: +91 00000 00000", rules: "Carry or wear this card at all times\nPasses cannot be shared or copied\nFollow the organisers' instructions", sign: true, passphrase: "sample-passphrase-not-real" },
  teams: [{ id: "ta", name: "Team Alpha" }, { id: "tb", name: "Team Bravo" }],
  templates: {},
  people: [
    { id: "ALP-001", name: "Player One", teamId: "ta", role: "Player" },
    { id: "ALP-002", name: "Player Two", teamId: "ta", role: "Substitute" },
    { id: "ALP-003", name: "Coach Sample", teamId: "ta", role: "Coach" },
    { id: "BRA-001", name: "Player Three", teamId: "tb", role: "Player" },
  ],
});

const browser = await chromium.launch({ channel: process.env.CI ? undefined : "chrome" });
async function run(fmt, picks) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  const page = await ctx.newPage(); page.on("dialog", (d) => d.accept());
  await page.goto(`${BASE}/tools/id-cards/`);
  await page.getByRole("button", { name: "Open the ID card maker" }).click();
  const file = path.join(tmp, `${fmt}.json`); fs.writeFileSync(file, JSON.stringify(project(fmt)));
  await page.locator("input[type=file][accept*='json']").setInputFiles(file);
  await page.locator("ol").getByText("4 people").waitFor();
  await page.locator("ol button").filter({ hasText: "Print" }).first().click();
  for (const [id, face, name] of picks) {
    const card = page.locator(`[data-pid="${id}"][data-face="${face}"]`).first();
    await card.scrollIntoViewIfNeeded(); await card.hover();
    const [dl] = await Promise.all([page.waitForEvent("download"), card.getByRole("button", { name: "PNG" }).click()]);
    await dl.saveAs(path.join(OUT, name)); console.log("saved", name);
  }
  await ctx.close();
}
await run("wallet", [["ALP-001", "front", "wallet-player-front.png"], ["ALP-001", "back", "wallet-player-back.png"]]);
await run("portrait", [["BRA-001", "front", "lanyard-player-front.png"]]);
await browser.close();
fs.rmSync(tmp, { recursive: true, force: true });
// Shrink to WebP (700 px wide, 520 px for upright cards) and drop the PNGs.
execFileSync("python", ["-c", "import glob,os
from PIL import Image
for f in glob.glob('public/samples/esports/*.png'):
 im=Image.open(f).convert('RGB'); w=700 if im.width>im.height else 520
 im=im.resize((w,round(im.height*w/im.width)),Image.LANCZOS); im.save(f[:-4]+'.webp','WEBP',quality=86); os.remove(f)"]);
