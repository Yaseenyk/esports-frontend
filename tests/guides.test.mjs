// The guides are the site's main content, so they are checked like code: complete fields, working links, and numbers that agree with the tools.
import test from "node:test";
import assert from "node:assert/strict";
import { GUIDES, guideBySlug } from "../src/content/guides.ts";
import { standings, EXAMPLE_SCALE } from "../src/lib/points.ts";
import { TOOLS } from "../src/lib/data.ts";
import { TOOL_PAGES } from "../src/lib/tool-pages.ts";

const slugs = new Set(GUIDES.map((g) => g.slug));
const knownPaths = new Set(["/gate/", "/about/", "/contact/", "/privacy/", "/terms/", "/tools/", "/guides/", ...TOOLS.map((t) => t.href), ...GUIDES.map((g) => `/guides/${g.slug}/`)]);
const textOf = (g) => [g.intro, ...g.sections.flatMap((s) => [s.h2, ...s.blocks.flatMap((b) => (b.t === "p" || b.t === "note" || b.t === "h3" ? [b.x] : b.t === "ul" || b.t === "ol" ? b.items : b.t === "table" ? [...b.head, ...b.rows.flat()] : []))])];

test("every guide has a unique slug, title and description and complete fields", () => {
  assert.ok(GUIDES.length >= 21);
  assert.equal(new Set(GUIDES.map((g) => g.title)).size, GUIDES.length, "duplicate title");
  assert.equal(new Set(GUIDES.map((g) => g.seoTitle ?? g.title)).size, GUIDES.length, "duplicate tab title");
  assert.equal(new Set(GUIDES.map((g) => g.description)).size, GUIDES.length, "duplicate description");
  assert.equal(slugs.size, GUIDES.length);
  for (const g of GUIDES) {
    assert.match(g.slug, /^[a-z0-9-]+$/);
    assert.ok(g.title.length >= 20 && g.title.length <= 100, `${g.slug} title length`);
    assert.ok((g.seoTitle ?? g.title).length <= 56, `${g.slug} tab title is ${(g.seoTitle ?? g.title).length} characters: too long for a search result`);
    assert.ok(g.description.length >= 100 && g.description.length <= 165, `${g.slug} description is ${g.description.length} characters`);
    assert.match(g.published, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(g.updated >= g.published);
    assert.ok(g.sections.length >= 4, `${g.slug} needs more sections`);
    assert.ok(g.minutes >= 4 && g.minutes <= 15);
  }
});

test("each guide is long enough to be useful", () => {
  for (const g of GUIDES) {
    const words = textOf(g).join(" ").split(/\s+/).length;
    assert.ok(words >= 450, `${g.slug} has only ${words} words`);
  }
});

test("every internal link and every related guide points at something that exists", () => {
  for (const g of GUIDES) {
    for (const r of g.related) assert.ok(slugs.has(r), `${g.slug} relates to a missing guide ${r}`);
    assert.ok(knownPaths.has(g.cta.href), `${g.slug} CTA goes to ${g.cta.href}`);
    for (const t of textOf(g)) for (const m of t.matchAll(/\[([^\]]+)\]\(([^)]*)\)/g)) assert.ok(knownPaths.has(m[2]), `${g.slug} links to unknown ${m[2]}`);
  }
});

test("no guide contains placeholder wording or invented statistics markers", () => {
  for (const g of GUIDES) {
    const all = [...textOf(g), g.answer ?? "", ...(g.faq ?? []).flatMap((f) => [f.q, f.a])].join(" ");
    for (const bad of ["TODO", "lorem", "coming soon", "made-up", "XXX", "TBD", "placeholder", "insert here"]) assert.ok(!all.toLowerCase().includes(bad.toLowerCase()), `${g.slug} contains ${bad}`);
  }
});

test("the points guide's worked example is the same code and numbers as the calculator", () => {
  const g = guideBySlug("points-table");
  const tables = g.sections.flatMap((s) => s.blocks).filter((b) => b.t === "table");
  const final = tables.find((t) => t.head.includes("Total"));
  const expected = standings([
    { name: "Alpha", matches: [{ placement: 1, kills: 5 }, { placement: 4, kills: 2 }, { placement: 2, kills: 3 }] },
    { name: "Bravo", matches: [{ placement: 2, kills: 6 }, { placement: 1, kills: 4 }, { placement: 5, kills: 1 }] },
    { name: "Charlie", matches: [{ placement: 3, kills: 2 }, { placement: 2, kills: 7 }, { placement: 1, kills: 4 }] },
    { name: "Delta", matches: [{ placement: 4, kills: 3 }, { placement: 3, kills: 1 }, { placement: 3, kills: 6 }] },
  ], EXAMPLE_SCALE);
  assert.deepEqual(final.rows.map((r) => [r[1], Number(r[5])]), expected.map((s) => [s.name, s.total]));
  assert.equal(expected[0].name, "Charlie");
  assert.equal(expected[0].total, 34); // 5+2 + 6+7 + 10+4
});

test("format arithmetic quoted in the formats guide is right", () => {
  const roundRobin = (n) => (n * (n - 1)) / 2;
  assert.equal(roundRobin(6), 15);
  assert.equal(roundRobin(8), 28);
  assert.equal(16 - 1, 15); // single elimination: n - 1
  assert.equal(4 * roundRobin(4) + 7, 31); // 4 groups of 4, then 8 teams in a knockout (7 matches)
  assert.equal(16 - 11, 5); // 11 teams round up to 16: five byes
  const all = textOf(guideBySlug("choosing-a-tournament-format")).join(" ");
  for (const claim of ["15 matches", "n − 1", "2n − 2", "n × (n − 1) ÷ 2", "5 teams get byes", "Total 31 matches"]) assert.ok(all.includes(claim), `missing claim: ${claim}`);
});

test("every public tool page has the fields search results need", () => {
  for (const [slug, t] of Object.entries(TOOL_PAGES)) {
    assert.equal(t.slug, slug);
    assert.ok(t.title.length <= 56, `${slug} title ${t.title.length}`);
    assert.ok(t.description.length >= 100 && t.description.length <= 165, `${slug} description ${t.description.length}`);
    assert.ok(t.faq.length >= 3 && t.steps.length >= 4 && t.benefits.length === 3, `${slug} content`);
    for (const g of t.guides ?? []) assert.ok(slugs.has(g), `${slug} links to missing guide ${g}`);
  }
  assert.deepEqual(Object.keys(TOOL_PAGES).sort(), TOOLS.map((t) => t.slug).sort());
});

import { THEMES } from "../src/lib/idcard/themes.ts";
import { FORMATS } from "../src/lib/idcard/types.ts";
import { LANGS } from "../src/lib/i18n.ts";
import { CARD_DESIGNS, CARD_SHAPES, LANGUAGES_COUNT } from "../src/lib/facts.ts";

test("the numbers shown on the home page match the code they describe", () => {
  assert.equal(CARD_DESIGNS, THEMES.length);
  assert.equal(CARD_SHAPES, Object.keys(FORMATS).length);
  assert.equal(LANGUAGES_COUNT, LANGS.length);
});

test("every guide has a short answer and real FAQ items, and links in them resolve", () => {
  for (const g of GUIDES) {
    assert.ok(g.answer && g.answer.length >= 120 && g.answer.length <= 420, `${g.slug} answer length ${g.answer?.length}`);
    assert.ok(g.faq && g.faq.length >= 3 && g.faq.length <= 8, `${g.slug} needs 3 to 8 FAQ items`);
    assert.equal(new Set(g.faq.map((f) => f.q)).size, g.faq.length, `${g.slug} repeats a question`);
    for (const f of g.faq) {
      assert.ok(f.q.length >= 15 && f.a.length >= 40, `${g.slug} FAQ too thin: ${f.q}`);
      for (const m of (f.a + g.answer).matchAll(/\[([^\]]+)\]\(([^)]*)\)/g)) assert.ok(knownPaths.has(m[2]), `${g.slug} FAQ links to unknown ${m[2]}`);
    }
  }
});

test("every guide links to its matching tool and to at least two other guides, and is linked from somewhere", () => {
  const inbound = new Map(GUIDES.map((g) => [g.slug, 0]));
  for (const g of GUIDES) {
    const body = textOf(g).join(" ");
    assert.ok(/\]\(\/(tools|gate)\//.test(body) || g.cta.href.startsWith("/tools/") || g.cta.href === "/gate/", `${g.slug} has no link to a tool`);
    const guideLinks = new Set([...g.related, ...[...body.matchAll(/\]\(\/guides\/([a-z0-9-]+)\//g)].map((m) => m[1])]);
    guideLinks.delete(g.slug);
    assert.ok(guideLinks.size >= 2, `${g.slug} links to only ${guideLinks.size} other guides`);
    assert.ok(g.related.length >= 2 && g.related.length <= 4, `${g.slug} related count`);
    for (const s of guideLinks) inbound.set(s, (inbound.get(s) ?? 0) + 1);
  }
  for (const [s, n] of TOOL_PAGES ? Object.values(TOOL_PAGES).flatMap((t) => (t.guides ?? []).map((s) => [s, 1])) : []) inbound.set(s, (inbound.get(s) ?? 0) + n);
  for (const [s, n] of inbound) assert.ok(n >= 1, `no page links to guide ${s}`);
});

test("computed examples in the second batch match the tools' own code", async () => {
  const { fixtures, matchCount } = await import("../src/lib/roundrobin.ts");
  const { seedOrder } = await import("../src/lib/seeding.ts");
  const rr = textOf(guideBySlug("round-robin-schedule")).join(" ");
  assert.equal(matchCount(6), 15);
  assert.equal(fixtures(["a", "b", "c", "d", "e", "f"]).length, 5);
  assert.ok(rr.includes("15 matches") && rr.includes("28"));
  assert.deepEqual(seedOrder(8), [1, 8, 4, 5, 2, 7, 3, 6]);
  const tb = textOf(guideBySlug("tournament-bracket-template")).join(" ");
  assert.ok(tb.includes("1 v 8, 4 v 5, 2 v 7, 3 v 6"));
  const fc = textOf(guideBySlug("football-cricket-tournament-maker")).join(" ");
  assert.equal(2 * matchCount(4) + 3, 15);
  assert.ok(fc.includes("Total 15 matches"));
});

test("every public tool page links to guides that exist and has a rich how-to", () => {
  for (const [slug, t] of Object.entries(TOOL_PAGES)) {
    assert.ok((t.guides ?? []).length >= 3, `${slug} needs at least 3 guide links`);
    assert.ok(t.faq.length >= 4, `${slug} needs at least 4 FAQ items`);
    assert.ok(t.lead.length >= 120, `${slug} lead too short`);
  }
});
