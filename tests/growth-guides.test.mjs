// The growth batch of guides (poster, custom room, cricket, fixtures, Hinglish): presence, links, depth, wording and limits.
import test from "node:test";
import assert from "node:assert/strict";
import { GUIDES, guideBySlug } from "../src/content/guides.ts";
import { TOOLS } from "../src/lib/data.ts";

const SLUGS = [
  "free-fire-tournament-poster", "cricket-tournament-poster-ideas", "college-fest-esports-poster", "pubg-mobile-custom-room-results",
  "run-a-custom-room-tournament", "cricket-league-points-table", "fixture-maker-for-football-and-cricket", "id-card-kaise-banaye", "certificate-kaise-banaye",
];
const slugs = new Set(GUIDES.map((g) => g.slug));
// Pages owned by other workstreams that are guaranteed to exist.
const known = new Set(["/gate/", "/about/", "/contact/", "/privacy/", "/terms/", "/tools/", "/guides/", "/tools/poster/", "/points-table/bgmi/", "/points-table/free-fire/", "/id-card-maker/student/", ...TOOLS.map((t) => t.href), ...GUIDES.map((g) => `/guides/${g.slug}/`)]);
const blocks = (g) => g.sections.flatMap((s) => [s.h2, ...s.blocks.flatMap((b) => (b.t === "p" || b.t === "note" || b.t === "h3" ? [b.x] : b.t === "ul" || b.t === "ol" ? b.items : b.t === "table" ? [...b.head, ...b.rows.flat()] : []))]);
const everything = (g) => [g.title, g.seoTitle ?? "", g.description, g.intro, g.answer ?? "", ...blocks(g), ...(g.faq ?? []).flatMap((f) => [f.q, f.a])];

test("all nine growth guides exist with the exact slugs and the shared publish date", () => {
  for (const s of SLUGS) {
    const g = guideBySlug(s);
    assert.ok(g, `missing ${s}`);
    assert.equal(g.published, "2026-11-12");
  }
});

test("each growth guide has depth: words, 6 FAQs, answer box, sections", () => {
  for (const s of SLUGS) {
    const g = guideBySlug(s);
    const words = everything(g).join(" ").split(/\s+/).length;
    assert.ok(words >= 850, `${s} has only ${words} words`);
    assert.equal(g.faq.length, 6, `${s} needs exactly 6 FAQs`);
    for (const f of g.faq) assert.ok(f.a.length >= 350 && f.a.length <= 900, `${s} FAQ ${f.a.length} chars: ${f.q}`);
    assert.ok(g.answer.length >= 120 && g.answer.length <= 420, `${s} answer length`);
    assert.ok(g.sections.some((x) => /mistake|galti/i.test(x.h2)), `${s} needs a common mistakes section`);
    assert.ok(g.sections.some((x) => x.blocks.some((b) => b.t === "ol")), `${s} needs step by step`);
  }
});

test("titles and descriptions stay inside search limits", () => {
  for (const s of SLUGS) {
    const g = guideBySlug(s);
    assert.ok((g.seoTitle ?? g.title).length <= 56, `${s} tab title ${(g.seoTitle ?? g.title).length}`);
    assert.ok(g.title.length <= 100);
    assert.ok(g.description.length >= 100 && g.description.length <= 165, `${s} description ${g.description.length}`);
  }
});

test("internal links resolve, each guide links its tool and at least two other guides", () => {
  for (const s of SLUGS) {
    const g = guideBySlug(s);
    for (const r of g.related) assert.ok(slugs.has(r) && r !== s, `${s} related ${r}`);
    assert.ok(g.related.length >= 2 && g.related.length <= 4);
    assert.ok(known.has(g.cta.href), `${s} CTA ${g.cta.href}`);
    const text = [g.intro, g.answer, ...blocks(g)].join(" ");
    for (const m of text.matchAll(/\[([^\]]+)\]\(([^)]*)\)/g)) assert.ok(known.has(m[2]), `${s} links to unknown ${m[2]}`);
    assert.ok(/\]\(\/tools\//.test(text), `${s} links no tool`);
    const gl = new Set([...g.related, ...[...text.matchAll(/\]\(\/guides\/([a-z0-9-]+)\//g)].map((m) => m[1])]);
    gl.delete(s);
    assert.ok(gl.size >= 2, `${s} links only ${gl.size} guides`);
  }
});

test("game points-table and poster routes are linked from the guides that need them", () => {
  const all = (s) => blocks(guideBySlug(s)).join(" ") + guideBySlug(s).intro;
  assert.ok(all("free-fire-tournament-poster").includes("](/tools/poster/)"));
  assert.ok(all("pubg-mobile-custom-room-results").includes("](/points-table/bgmi/)"));
  assert.ok(all("run-a-custom-room-tournament").includes("](/points-table/free-fire/)"));
});

test("no placeholder wording, banned superlatives or invented claims in the new guides", () => {
  const banned = [/\bno\.? ?1\b/i, /best in india/i, /only tool/i, /\bnumber one\b/i, /\bguaranteed? (rank|top)/i, /trusted by/i, /\bbest (tool|maker|free)\b/i];
  const placeholders = ["TODO", "lorem", "coming soon", "made-up", "XXX", "TBD", "placeholder", "insert here", "sample data", "prototype"];
  for (const s of SLUGS) {
    const all = everything(guideBySlug(s)).join(" ");
    for (const re of banned) assert.ok(!re.test(all), `${s} matches banned ${re}`);
    for (const p of placeholders) assert.ok(!all.toLowerCase().includes(p.toLowerCase()), `${s} contains ${p}`);
    assert.ok(!/\[(number|date|name)\]/i.test(all), `${s} has an unfilled bracket`);
  }
});

test("the cricket guide is honest that net run rate is not computed", () => {
  const g = guideBySlug("cricket-league-points-table");
  const all = everything(g).join(" ");
  assert.ok(/does not (calculate|compute) net run rate|not net run rate|No\. Net run rate/.test(all));
  assert.ok(g.faq.some((f) => /net run rate/i.test(f.q) && /^No/.test(f.a)));
});

test("custom room worked example agrees with the points code", async () => {
  const { standings, EXAMPLE_SCALE } = await import("../src/lib/points.ts");
  const g = guideBySlug("pubg-mobile-custom-room-results");
  const final = g.sections.flatMap((s) => s.blocks).find((b) => b.t === "table" && b.head.includes("Total"));
  const ranked = standings([
    { name: "Night Owls", matches: [{ placement: 2, kills: 4 }, { placement: 1, kills: 7 }, { placement: 3, kills: 3 }] },
    { name: "Red Fang", matches: [{ placement: 1, kills: 5 }, { placement: 4, kills: 2 }, { placement: 2, kills: 6 }] },
    { name: "Blue Hawks", matches: [{ placement: 3, kills: 6 }, { placement: 2, kills: 3 }, { placement: 1, kills: 5 }] },
    { name: "Storm Five", matches: [{ placement: 4, kills: 1 }, { placement: 3, kills: 4 }, { placement: 4, kills: 2 }] },
  ], EXAMPLE_SCALE);
  assert.deepEqual(final.rows.map((r) => [r[1], Number(r[5])]), ranked.map((s) => [s.name, s.total]));
  assert.equal(ranked[0].name, "Blue Hawks");
  assert.equal(ranked[0].total, 35);
});

test("the fixture guide's counts match the round robin code", async () => {
  const { matchCount, fixtures } = await import("../src/lib/roundrobin.ts");
  assert.equal(matchCount(5), 10);
  assert.equal(fixtures(["a", "b", "c", "d", "e"]).length, 5);
  const t = guideBySlug("fixture-maker-for-football-and-cricket").sections.flatMap((s) => s.blocks).find((b) => b.t === "table" && b.head.includes("Sits out"));
  assert.equal(t.rows.length, 5);
  assert.equal(new Set(t.rows.map((r) => r[3])).size, 5, "every team sits out once");
});

test("the Hinglish guides are in Roman script (no Devanagari)", () => {
  for (const s of ["id-card-kaise-banaye", "certificate-kaise-banaye"]) {
    assert.ok(!/[ऀ-ॿ]/.test(everything(guideBySlug(s)).join(" ")), `${s} contains Devanagari`);
    assert.ok(/kaise/i.test(guideBySlug(s).title));
  }
});

test("home page facts match the code, and the site description fits the limits", async () => {
  const { SCREEN_DESIGNS, SITE_DESCRIPTION } = await import("../src/lib/facts.ts");
  const { DISPLAY_THEMES } = await import("../src/lib/display-themes.ts");
  assert.equal(SCREEN_DESIGNS, DISPLAY_THEMES.length);
  assert.ok(SITE_DESCRIPTION.length >= 70 && SITE_DESCRIPTION.length <= 170);
  assert.ok(!/\bno\.? ?1\b|best in india|only tool/i.test(SITE_DESCRIPTION));
});
