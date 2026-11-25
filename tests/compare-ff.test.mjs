// The Free Fire hosting comparison: only facts seen on each site's own page (25 Nov 2026), a checked date and a link for every site,
// our own gaps stated, and no hype or invented numbers.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { FF_CHECKED, FF_COMPARE_DESCRIPTION, FF_COMPARE_FAQ, FF_COMPARE_PATH, FF_COMPARE_TITLE, FF_SITES, FF_US } from "../src/lib/compare-ff.ts";
import { GROWTH_PAGES } from "../src/lib/growth-pages.ts";
import { TITLE_MAX, TITLE_SUFFIX } from "../src/lib/schema.ts";

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

// The exact words read on each home page on 25 Nov 2026 (WebFetch of the page text; title and meta description for the JavaScript sites).
const READ_ON_PAGE = {
  battlezy: ["Launch and manage esports tournaments", "anyone can create and host tournaments", "BGMI, PUBG, Call of Duty, Free Fire and Mini Militia", "Battlezy is completely free to use", "does not charge fees for hosting tournaments", "free or paid", "Bracket trees are generated automatically", "Dynamic tables auto-calculate rankings", "sign-in page, and there is a Play Store link"],
  gamzone: ["ONLINE competitive mobile esports platform", "Publish your own custom room tournaments", "Enter private room lobbies", "Free Fire, BGMI and PUBG Mobile", "Free (Community)", "TBA", "preparing for full launch"],
  pointx: ["Free Fire Tournament & Point Table Platform", "Point Calculation Engine, OBS Live Broadcast Overlays & 4K Graphics Studio", "Automated Free Fire point calculation", "real-time OBS Studio browser source scoreboards"],
  battlefy: ["the simplest way to start, manage, and find esports tournaments"],
};

test("exactly the sites we could read, each with a link and the date it was checked; squads-space.com is left out and says why", () => {
  assert.equal(FF_CHECKED, "25 Nov 2026");
  assert.deepEqual(FF_SITES.map((s) => s.id), ["battlezy", "gamzone", "pointx", "battlefy"]);
  for (const s of FF_SITES) assert.match(s.url, /^https:\/\/[a-z.]+\/$/);
  const page = read("src/app/(site)/compare/free-fire-tournament-hosting-sites/page.tsx");
  assert.ok(page.includes("Checked on {FF_CHECKED}") && page.includes("href={c.url}") && page.includes("squads-space.com"));
  assert.ok(FF_COMPARE_FAQ.some((f) => f.a.includes("squads-space.com") && /did not load/.test(f.a)));
});

test("every fact marked seen is quoted from the page we read; everything else says not verified and carries no number", () => {
  for (const s of FF_SITES) {
    for (const f of [...s.what, ...s.money, ...s.features]) {
      if (f.status === "seen") assert.ok(READ_ON_PAGE[s.id].some((w) => f.text.includes(w)), `${s.id}: "${f.text}" was not on the page`);
      else { assert.equal(f.status, "not verified"); assert.ok(!/\d/.test(f.text), `${s.id}: unverified fact with a number`); }
    }
    assert.ok(s.stronger.length >= 1 && s.weaker.length >= 1 && s.verdict.length > 40, s.id);
  }
});

test("fairness: the page states what Esports Hub does not have, including no prize payouts by design", () => {
  const us = JSON.stringify(FF_US) + read("src/app/(site)/compare/free-fire-tournament-hosting-sites/page.tsx");
  for (const gap of [/no entry fees, wallets, prizes or payouts/i, /no app/i, /room id/i, /player marketplace|does not bring players/i]) assert.match(us, gap);
  assert.ok(FF_SITES.every((s) => s.weaker.join(" ").length > 30));
});

test("no hype, ratings or invented counts", () => {
  const text = JSON.stringify([FF_SITES, FF_US, FF_COMPARE_FAQ, FF_COMPARE_DESCRIPTION]);
  for (const re of [/no\.? ?1\b/i, /number one/i, /trusted by/i, /the only /i, /best in india/i, /\d[\d,]*\+? (organisers|users|players|events|downloads)/i, /rating/i]) assert.doesNotMatch(text, re);
});

test("the page is in the sitemap list, fits the title rule and ships Article, FAQPage and BreadcrumbList", () => {
  assert.ok(GROWTH_PAGES.some((p) => p.path === FF_COMPARE_PATH));
  assert.ok(FF_COMPARE_TITLE.length + TITLE_SUFFIX.length <= TITLE_MAX);
  assert.ok(FF_COMPARE_DESCRIPTION.length >= 70 && FF_COMPARE_DESCRIPTION.length <= 170, `${FF_COMPARE_DESCRIPTION.length}`);
  const page = read("src/app/(site)/compare/free-fire-tournament-hosting-sites/page.tsx");
  for (const t of ['"Article"', '"FAQPage"', '"BreadcrumbList"']) assert.ok(page.includes(t), t);
});
