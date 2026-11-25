// The Portuguese (Brazil) pages: each held out of search until a native reader approves it, linked to the English page with hreflang once approved,
// and carrying the same facts (numbers, limits, structure) as the English pages they translate.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { PT_BR_INDEXABLE, PT_BR_PAGES, PT_BR_REVIEWED, PT_BR_ROBOTS, enPathFor, hreflangFor, ptBrReviewed, ptBrRobots } from "../src/lib/pt-br.ts";
import { GAME_PAGES } from "../src/lib/game-pages.ts";
import { FREE_FIRE_PT } from "../src/lib/game-pages-pt.ts";
import { FREE_FIRE_TEAM_NAMES_PT } from "../src/content/pt-br/free-fire-team-names-ideas.ts";
import { LIVE_NOW_DRAFTS } from "../src/content/scheduled/live-now.ts";
import { toolCopy } from "../src/lib/tool-copy.ts";

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const nums = (s) => (s.match(/\d+/g) ?? []).sort().join(",");

test("the review switch is per page: the two pages approved on 24 Nov 2026 are indexable, the three added on 25 Nov are not", () => {
  // Approved by a native Brazilian Portuguese reader, as confirmed by the owner on 24 Nov 2026 (see src/lib/pt-br.ts).
  assert.match(read("src/lib/pt-br.ts"), /Approved 24 Nov 2026/, "the approval is recorded next to the switch");
  assert.deepEqual(PT_BR_REVIEWED, {
    "/pt-br/points-table/free-fire/": "2026-11-24", "/pt-br/guides/free-fire-team-names-ideas/": "2026-11-24",
    "/pt-br/tools/nick-free-fire/": null, "/pt-br/tools/conversor-de-sensibilidade/": null, "/pt-br/tools/nome-de-guilda-free-fire/": null,
  });
  assert.deepEqual(PT_BR_INDEXABLE, ["/pt-br/points-table/free-fire/", "/pt-br/guides/free-fire-team-names-ideas/"]);
  for (const p of Object.values(PT_BR_PAGES)) {
    assert.ok(p in PT_BR_REVIEWED, `${p} has an entry in the review record`);
    assert.deepEqual(ptBrRobots(p), ptBrReviewed(p) ? { index: true, follow: true } : { index: false, follow: true });
  }
  assert.equal(ptBrReviewed("/pt-br/some-new-page/"), false, "a page with no entry is unreviewed");
  assert.deepEqual(PT_BR_ROBOTS, { index: false, follow: true }, "the plain constant is the unreviewed default");
  assert.match(read("src/app/sitemap.ts"), /PT_BR_INDEXABLE\.map/);
  assert.match(read("scripts/verify-seo.mjs"), /p\.startsWith\("\/pt-br\/"\) && !PT_BR_REVIEWED\.has\(p\)/);
  for (const f of ["src/app/(pt)/pt-br/points-table/free-fire/page.tsx", "src/app/(pt)/pt-br/guides/free-fire-team-names-ideas/page.tsx"]) assert.match(read(f), /robots: ptBrRobots\(/, f);
});

test("every page has a route; hreflang (en, pt-BR, x-default) only between approved, indexable twins, never to a noindex page", () => {
  const merged = JSON.parse(read("src/content/merged-guides.json"));
  for (const [en, pt] of Object.entries(PT_BR_PAGES)) {
    // A merged English guide is noindex, so the pair is dropped; an unreviewed Portuguese page is noindex, so no pair either.
    const isMerged = Object.keys(merged).some((s) => en === `/guides/${s}/`);
    assert.deepEqual(hreflangFor(en), ptBrReviewed(pt) && !isMerged ? { en, "pt-BR": pt, "x-default": en } : undefined, en);
    assert.equal(enPathFor(pt), en);
    assert.ok(fs.existsSync(new URL(`../src/app/(pt)${pt}page.tsx`, import.meta.url)), pt);
    if (!ptBrReviewed(pt)) assert.match(read(`src/app/(pt)${pt}page.tsx`), /robots: ptBrRobots\(t\.path\)/, pt);
  }
  assert.equal(hreflangFor("/points-table/bgmi/"), undefined);
  assert.match(read("package.json"), /node scripts\/set-lang\.mjs/, "the build sets lang=pt-BR on the Portuguese pages");
});

test("the Portuguese points table page keeps the English page's facts", () => {
  const en = GAME_PAGES["free-fire"], pt = FREE_FIRE_PT;
  assert.equal(pt.preset, en.preset);
  assert.deepEqual(pt.table.rows.map((r) => nums(r.join(" "))), en.table.rows.map((r) => nums(r.join(" "))));
  assert.equal(pt.faq.length, en.faq.length);
  assert.equal(pt.steps.length, en.steps.length);
  assert.equal(pt.benefits.length, en.benefits.length);
  pt.faq.forEach((f, i) => assert.equal(nums(f.a), nums(en.faq[i].a), `FAQ ${i + 1} numbers`));
  assert.ok(pt.lead.includes("exemplo") && pt.faq.some((f) => /oficial/i.test(f.q)));
});

test("the Portuguese guide keeps the English guide's structure and numbers", () => {
  const en = LIVE_NOW_DRAFTS.find((d) => d.slug === "free-fire-team-names-ideas"), pt = FREE_FIRE_TEAM_NAMES_PT;
  assert.ok(en);
  assert.equal(pt.slug, en.slug);
  assert.equal(pt.sections.length, en.sections.length);
  assert.equal(pt.faq.length, en.faq.length);
  assert.deepEqual(pt.related, en.related);
  const ptText = pt.sections.map((s) => s.md).join(" ");
  for (const n of ["50", "4v4", "FFWS MEA 2025"]) assert.ok(ptText.includes(n), n);
  for (const m of ptText.matchAll(/\]\((\/[^)]+)\)/g)) assert.ok(/\(em inglês\)/.test(ptText.slice(m.index, m.index + m[0].length + 14)), `link ${m[1]} says it is English`);
});

test("every Portuguese tool string exists and differs from English where it is a sentence", () => {
  const en = toolCopy("en"), pt = toolCopy("pt-BR");
  const walk = (a, b, at) => {
    for (const k of Object.keys(a)) {
      assert.ok(k in b, `${at}.${k} missing in Portuguese`);
      if (typeof a[k] === "string" && a[k].split(" ").length > 3) assert.notEqual(a[k], b[k], `${at}.${k} not translated`);
      else if (a[k] && typeof a[k] === "object" && !Array.isArray(a[k])) walk(a[k], b[k], `${at}.${k}`);
    }
  };
  walk(en, pt, "copy");
  assert.equal(pt.points.ord(1), "1º");
  assert.equal(pt.points.leading("Alpha", 1), "Na liderança: Alpha, 1 ponto");
});
