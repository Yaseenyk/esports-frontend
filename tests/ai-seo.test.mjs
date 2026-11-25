// Sitewide AI-search and SEO rules (25 Nov 2026): titles within 60 characters as rendered, llms.txt built from the page data,
// one Organization with real sameAs, tools that carry @id/publisher/author, and hreflang only between indexable twins.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { TITLE_MAX, TITLE_SUFFIX, pageTitle, organizationJsonLd } from "../src/lib/schema.ts";
import { TOOL_PAGES } from "../src/lib/tool-pages.ts";
import { ALL_GAME_PAGES } from "../src/lib/game-pages.ts";
import { LISTED_GUIDES } from "../src/content/guides.ts";
import { TOOLS } from "../src/lib/data.ts";
import { factSentences, llmsFullTxt, llmsTxt, playerTools, portuguesePages } from "../src/lib/llms.ts";

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const rendered = (t) => { const v = pageTitle(t); return typeof v === "string" ? v + TITLE_SUFFIX : v.absolute; };

test("pageTitle keeps every rendered title within 60 characters and keeps the brand when it fits", () => {
  assert.equal(pageTitle("About Esports Hub"), "About Esports Hub");
  assert.deepEqual(pageTitle("x".repeat(50)), { absolute: "x".repeat(50) });
  const all = [...Object.values(TOOL_PAGES).map((p) => p.title), ...ALL_GAME_PAGES.map((p) => p.title), ...LISTED_GUIDES.map((g) => g.seoTitle ?? g.title)];
  for (const t of all) assert.ok(rendered(t).length <= TITLE_MAX || t.length > TITLE_MAX, `${t} renders as ${rendered(t).length}`);
  for (const t of all) assert.ok(t.length <= TITLE_MAX, `raw title over ${TITLE_MAX}: ${t}`);
});

test("the team name generator no longer targets Free Fire guild names (the guild page does)", () => {
  assert.doesNotMatch(TOOL_PAGES["team-name-generator"].title, /guild/i);
  assert.match(TOOL_PAGES["team-name-generator"].title, /BGMI/);
  assert.match(TOOL_PAGES["free-fire-guild-name"].title, /guild/i);
});

test("llms.txt lists every tool once, the player tools in their own group, the Portuguese pages and the comparison", () => {
  const txt = llmsTxt(new Date("2026-11-25T00:00:00Z"));
  for (const t of TOOLS) assert.equal(txt.split(`(https://esports.streamerosai.com${t.href})`).length - 1, 1, t.href);
  const players = txt.slice(txt.indexOf("## Free tools for players"), txt.indexOf("## Points tables"));
  assert.ok(playerTools().length >= 3);
  for (const t of playerTools()) assert.ok(players.includes(t.href), t.href);
  assert.ok(portuguesePages().length >= 2);
  for (const p of portuguesePages()) assert.ok(txt.includes(p.path), p.path);
  assert.ok(txt.includes("/compare/free-tournament-software-india/"));
  assert.ok(txt.includes("/llms-full.txt"));
  assert.ok(txt.includes(`${TOOLS.length} free tools`) && txt.includes(`${LISTED_GUIDES.length} guides`));
});

test("the fact block states no user counts, ratings or invented numbers", () => {
  const facts = factSentences(new Date("2026-11-25T00:00:00Z")).join(" ");
  assert.doesNotMatch(facts, /\b(users|downloads|visitors|rating|trusted by|million|lakh)\b/i);
  const nums = (facts.match(/\b\d+\b/g) ?? []).map(Number);
  assert.ok(nums.includes(TOOLS.length) && nums.includes(LISTED_GUIDES.length));
});

test("llms-full.txt carries the text of every tool page and live guide", () => {
  const full = llmsFullTxt();
  for (const g of LISTED_GUIDES) assert.ok(full.includes(`/guides/${g.slug}/`), g.slug);
  for (const t of TOOLS) assert.ok(full.includes(t.href), t.href);
  for (const p of Object.values(TOOL_PAGES).filter((p) => TOOLS.some((t) => t.slug === p.slug))) assert.ok(full.includes(p.faq[0].q), p.slug);
});

test("Organization: one helper, real sameAs only, emitted by both the English and the Portuguese layout", () => {
  const org = organizationJsonLd();
  assert.equal(org["@id"], "https://esports.streamerosai.com/#org");
  assert.deepEqual(org.sameAs, ["https://github.com/Yaseenyk/esports-frontend"]);
  for (const f of ["src/app/(site)/layout.tsx", "src/app/(pt)/layout.tsx"]) assert.match(read(f), /organizationJsonLd\(\)/, f);
});

test("the 404 page clears the root robots tag so only Next's noindex is left", () => {
  assert.match(read("src/app/not-found.tsx"), /robots: null/);
});

test("/about/ shows the same fact block as llms.txt, and the site description names players as well as organisers", async () => {
  assert.match(read("src/app/(site)/about/page.tsx"), /factSentences\(\)/);
  const { SITE_DESCRIPTION } = await import("../src/lib/facts.ts");
  assert.match(SITE_DESCRIPTION, /players/);
});
