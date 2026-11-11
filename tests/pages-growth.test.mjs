// The search-growth pages: the poster tool, the BGMI and Free Fire points table pages, the comparison and the rewritten tool pages.
// Titles and descriptions have length limits, every FAQ has real depth, links resolve and the comparison states only facts we read.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { TOOL_PAGES } from "../src/lib/tool-pages.ts";
import { GAME_PAGES } from "../src/lib/game-pages.ts";
import { COMPARE_DESCRIPTION, COMPARE_FAQ, COMPARE_LEAD, COMPARE_PATH, COMPARE_TITLE, COMPETITORS, CHECKED } from "../src/lib/compare.ts";
import { GROWTH_PAGES } from "../src/lib/growth-pages.ts";
import { GUIDES } from "../src/content/guides.ts";
import { TOOLS } from "../src/lib/data.ts";

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const toolPages = Object.values(TOOL_PAGES), gamePages = Object.values(GAME_PAGES);
const withMeta = [
  ...toolPages.map((p) => ({ id: `/tools/${p.slug}/`, title: p.title, description: p.description, faq: p.faq })),
  ...gamePages.map((p) => ({ id: p.path, title: p.title, description: p.description, faq: p.faq })),
  { id: COMPARE_PATH, title: COMPARE_TITLE, description: COMPARE_DESCRIPTION, faq: COMPARE_FAQ },
];
const SUFFIX = " · Esports Hub".length;

test("every title is at most 70 characters with the site name added, and every description is 70 to 170", () => {
  for (const p of withMeta) {
    assert.ok(p.title.length + SUFFIX <= 70, `${p.id} title is ${p.title.length + SUFFIX} with the site name`);
    assert.ok(p.description.length >= 70 && p.description.length <= 170, `${p.id} description is ${p.description.length}`);
  }
});

test("titles and descriptions are unique across all pages", () => {
  assert.equal(new Set(withMeta.map((p) => p.title)).size, withMeta.length);
  assert.equal(new Set(withMeta.map((p) => p.description)).size, withMeta.length);
});

test("each rewritten title starts with the keyword the page targets", () => {
  const starts = {
    "/tools/poster/": "Tournament poster maker", "/tools/points-table/": "Points table maker", "/tools/schedule/": "Free fixture maker",
    "/tools/round-robin/": "Round robin tournament", "/tools/brackets/": "Free tournament bracket", "/tools/check-in/": "QR code attendance",
    "/tools/display-screen/": "Online scoreboard", "/points-table/bgmi/": "BGMI points table", "/points-table/free-fire/": "Free Fire points table",
    [COMPARE_PATH]: "Free tournament software",
  };
  for (const [id, start] of Object.entries(starts)) { const p = withMeta.find((x) => x.id === id); assert.ok(p, id); assert.ok(p.title.startsWith(start), `${id}: "${p.title}" should start with "${start}"`); }
  assert.ok(TOOL_PAGES["poster"].description.toLowerCase().includes("free fire"));
});

test("every page has at least 7 FAQ items of 350 to 1100 characters, and no question or answer repeats across pages", () => {
  const qs = new Set(), as = new Set();
  for (const p of withMeta) {
    assert.ok(p.faq.length >= 7, `${p.id} has ${p.faq.length} questions`);
    for (const { q, a } of p.faq) {
      assert.ok(q.trim().endsWith("?"), `${p.id}: "${q}"`);
      assert.ok(a.length >= 350 && a.length <= 1100, `${p.id}: answer to "${q}" is ${a.length} characters`);
      const k = q.toLowerCase().trim();
      assert.ok(!qs.has(k), `duplicate question: ${q}`); assert.ok(!as.has(a), `repeated answer: ${q}`);
      qs.add(k); as.add(a);
    }
  }
});

test("the poster tool is in TOOLS with a page entry, a route and a sitemap place", () => {
  assert.ok(TOOLS.some((t) => t.slug === "poster" && t.href === "/tools/poster/"));
  assert.ok(TOOL_PAGES["poster"] && TOOL_PAGES["poster"].benefits.length === 3 && TOOL_PAGES["poster"].steps.length >= 4);
  assert.ok(fs.existsSync(new URL("../src/app/(site)/tools/poster/page.tsx", import.meta.url)));
  assert.ok(read("src/app/sitemap.ts").includes("TOOLS.map") && read("src/app/sitemap.ts").includes("GROWTH_PAGES"));
  assert.match(read("src/app/(site)/tools/page.tsx"), /slug: "poster"/);
});

test("the game pages live outside the noindex group at their own routes and name an example scale", () => {
  assert.deepEqual(Object.values(GAME_PAGES).map((g) => g.path).sort(), ["/points-table/bgmi/", "/points-table/free-fire/"]);
  for (const g of gamePages) {
    assert.ok(fs.existsSync(new URL(`../src/app/(site)${g.path}page.tsx`, import.meta.url)), g.path);
    assert.ok(!/^\/(games|events|communities|manage|arcade|live|display)\//.test(g.path));
    assert.ok(g.lead.toLowerCase().includes("example"), `${g.path} lead should say the scale is an example`);
    assert.ok(g.lead.length >= 120 && g.steps.length >= 4 && g.benefits.length === 3);
    assert.ok(g.faq.some((f) => /official/i.test(f.q)), `${g.path} should have a question about what is official`);
  }
  const pt = read("src/components/tools/PointsTable.tsx");
  assert.ok(pt.includes("preset-note") && /not \{pre\.game\}&apos;s official scale/.test(pt), "the points table shows the example note");
});

test("internal links resolve: guides exist, breadcrumb parents and growth paths have routes", () => {
  const slugs = new Set(GUIDES.map((g) => g.slug)), tools = new Set(TOOLS.map((t) => t.href));
  for (const p of [...toolPages, ...gamePages]) for (const g of p.guides ?? []) assert.ok(slugs.has(g), `${p.slug} links to missing guide ${g}`);
  for (const g of gamePages) assert.ok(tools.has(g.crumb.href), `${g.path} breadcrumb parent ${g.crumb.href}`);
  const pt = read("src/components/tools/PointsTable.tsx");
  for (const m of pt.matchAll(/\/guides\/([a-z0-9-]+)\//g)) assert.ok(slugs.has(m[1]), `PointsTable links to missing guide ${m[1]}`);
  for (const p of GROWTH_PAGES) assert.ok(fs.existsSync(new URL(`../src/app/(site)${p.path}page.tsx`, import.meta.url)), `no route for ${p.path}`);
  const page = read("src/app/(site)/compare/free-tournament-software-india/page.tsx");
  assert.ok(page.includes("TOOLS.map") && page.includes("href=\"/tools/\""));
  for (const t of TOOLS) assert.ok(fs.existsSync(new URL(`../src/app/(site)${t.href}page.tsx`, import.meta.url)), `no route for ${t.href}`);
});

// ------------------------------------------------------------------ the comparison page

/** Phrases that appeared in docs/seo-serp-usp-2026-11.md section 2 (pages read on 11 Nov 2026). A statement marked "seen" must contain one of them. */
const WHITELIST = [
  "Free to start", "Live online brackets", "Templates by team count", "PDF export",
  "Starter (Free)", "one admin", "Auto-scheduling", "without signing up", "public page with a share link and a QR code", "TV mode",
  "share-ready image for WhatsApp", "14 themes", "18K+ organisers",
  "$90, $120 and $1,200", "free trial", "on request for charities", "5 teams and 2 draft scoreboards", "lower thirds", "does not include esports",
  "Standard is $0", "$12 per month", "$0.75", "256 participants", "512 participants", "Ad removal, embed themes and file uploads",
];

test("the comparison covers exactly the five products we read, no others", () => {
  assert.deepEqual(COMPETITORS.map((c) => c.site), ["bracketmaker.app", "score7.io", "pointstablemaker.com", "obscoreboard.com", "challonge.com"]);
  const all = JSON.stringify([COMPETITORS, COMPARE_FAQ, COMPARE_LEAD]).toLowerCase();
  for (const other of ["toornament", "keepthescore", "playinga", "leaguelobster", "andern", "esportsamaze", "tournamentsoftware", "justtourney", "leaguerepublic", "overlayon"]) assert.ok(!all.includes(other), `mentions ${other}, which is not one of the five`);
});

test("every statement we mark as seen matches a fact from the research notes, and every other one says not verified", () => {
  for (const c of COMPETITORS) {
    for (const f of [...c.price, ...c.free, ...c.seen]) {
      assert.ok(f.status === "seen" || f.status === "not verified", `${c.id}: bad status`);
      if (f.status === "seen") assert.ok(WHITELIST.some((w) => f.text.includes(w)), `${c.id}: "${f.text}" is not in the research notes`);
      else assert.ok(!/\d/.test(f.text.replace(/^[^:]*/, "")), `${c.id}: an unverified fact must not carry a number`);
    }
    assert.ok([...c.price, ...c.free, ...c.seen].length >= 3 && c.stronger.length >= 1 && c.weaker.length >= 1 && c.verdict.length > 40, `${c.id} is incomplete`);
  }
  // Prices are written exactly as seen.
  const all = JSON.stringify(COMPETITORS);
  for (const fragment of ["$90, $120 and $1,200", "$12 per month", "$6.99 per month", "$0.75", "256 participants", "512 participants"]) assert.ok(all.includes(fragment), fragment);
  for (const unseen of ["score7.io", "pointstablemaker.com", "bracketmaker.app"]) {
    const c = COMPETITORS.find((x) => x.site === unseen);
    assert.ok([...c.price, ...c.free].some((f) => f.status === "not verified"), `${unseen} must list at least one unverified price or limit`);
  }
});

test("fairness: the page admits the real gaps the research found", () => {
  const w = (site) => COMPETITORS.find((c) => c.site === site).weaker.join(" ").toLowerCase();
  assert.ok(/public event page with a qr code/.test(w("score7.io")));
  assert.ok(/256 participants/.test(w("challonge.com")));
  assert.ok(/professional broadcast tool/.test(w("obscoreboard.com")));
  assert.ok(/presets/.test(w("pointstablemaker.com")));
});

test("no hype or invented claims in the comparison and the new pages", () => {
  const banned = [/no\.? ?1\b/i, /number one/i, /#1\b/, /trusted by/i, /only tool/i, /the only /i, /world'?s best/i, /best in india/i, /india'?s best/i, /\d[\d,]*\+? (organisers|users|events|downloads)/i];
  const text = JSON.stringify([COMPETITORS.map((c) => [c.stronger, c.verdict]), COMPARE_FAQ, COMPARE_LEAD, TOOL_PAGES["poster"], gamePages]);
  for (const re of banned) {
    const m = re.exec(text.replace("18K+ organisers", "").replace("(18K+ organisers, which we did not verify)", ""));
    assert.ok(!m, `banned claim ${re}: ${m && text.slice(Math.max(0, m.index - 40), m.index + 60)}`);
  }
});

test("the comparison page states when it was checked and ships Article, FAQPage and BreadcrumbList data", () => {
  assert.equal(CHECKED, "11 Nov 2026");
  const page = read("src/app/(site)/compare/free-tournament-software-india/page.tsx");
  assert.ok(page.includes("Last checked: {CHECKED}"));
  for (const t of ["\"Article\"", "\"FAQPage\"", "\"BreadcrumbList\""]) assert.ok(page.includes(t), t);
  assert.ok(page.includes("not verified"));
  assert.equal(COMPARE_PATH, "/compare/free-tournament-software-india/");
});

test("the rewritten tool pages keep every claim to what the product does", () => {
  const t = TOOL_PAGES;
  // The points table is battle royale only: the page must send cricket and football to the round robin tool.
  assert.ok(/round robin/i.test(t["points-table"].lead));
  assert.ok(!/net run rate/i.test(t["points-table"].lead));
  // The schedule tool times matches; it does not choose pairings.
  assert.ok(/pairings/i.test(t["schedule"].lead) && /round robin/i.test(t["schedule"].lead));
  // The live page needs an account, and the bracket page says so.
  assert.ok(/free account/i.test(t["brackets"].lead));
  // Check-in is about events, not classroom registers.
  assert.ok(/event attendance/i.test(t["check-in"].lead));
  // The scoreboard page names the real features: sponsor strip, ticker, OBS, no plugin.
  const d = t["display-screen"].lead.toLowerCase();
  for (const w of ["sponsor", "ticker", "obs", "no plugin"]) assert.ok(d.includes(w), w);
});

test("SEO pass 12 Nov: the student page, related links, game tables and the home title", async () => {
  const { STUDENT_PAGE, STUDENT_PATH } = await import("../src/lib/student-page.ts");
  assert.ok(STUDENT_PAGE.title.length + SUFFIX <= 70 && STUDENT_PAGE.description.length >= 70 && STUDENT_PAGE.description.length <= 170);
  assert.ok(/does not issue official/i.test(STUDENT_PAGE.lead));
  assert.ok(GROWTH_PAGES.some((p) => p.path === STUDENT_PATH));
  const real = new Set([...TOOLS.map((t) => t.href), ...GROWTH_PAGES.map((p) => p.path)]);
  for (const p of [...toolPages, ...gamePages, STUDENT_PAGE]) for (const r of p.related ?? []) assert.ok(real.has(r.href), `${p.slug} links to missing page ${r.href}`);
  for (const g of gamePages) assert.ok(g.table && g.table.rows.length >= 6 && /not the official scale/.test(g.table.caption), g.path);
  assert.ok(TOOL_PAGES["points-table"].related.some((r) => r.href === "/points-table/bgmi/") && TOOL_PAGES["points-table"].related.some((r) => r.href === "/points-table/free-fire/"));
  assert.ok(/generator/i.test(TOOL_PAGES["brackets"].title) && /generator/i.test(TOOL_PAGES["brackets"].h1));
  assert.ok(read("src/app/(site)/page.tsx").includes("India") && read("src/app/layout.tsx").includes("for India"));
});
