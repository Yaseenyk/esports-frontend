// Trust signals on the points table pages: who runs the site, the scoring rules the calculator really uses, the "Safe to use" box and the
// trust questions in each FAQ. The box makes claims about the code, so the code it relies on is checked here too.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { OWNER, PAGE_SCALES, TRUST_COPY, battleRoyaleRules, leagueRules, personJsonLd, scaleText, trustFaq } from "../src/features/tool-trust/domain.ts";
import { EXAMPLE_SCALE, CODM_EXAMPLE_SCALE } from "../src/lib/points.ts";
import { DEFAULT_MAP_LEAGUE } from "../src/features/map-league/domain.ts";
import { GAME_PAGES, VALORANT_PAGE } from "../src/lib/game-pages.ts";
import { FREE_FIRE_PT } from "../src/lib/game-pages-pt.ts";
import { TOOL_PAGES } from "../src/lib/tool-pages.ts";
import { beaconBody } from "../src/lib/track.ts";

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const nums = (s) => (s.match(/\d+(\.\d+)?/g) ?? []).map(Number);

test("the owner and the Person node match the portfolio's sitewide entity (portfolio src/lib/seo.ts)", () => {
  assert.equal(OWNER.personId, "https://yk.streamerosai.com/#person");
  assert.equal(OWNER.linkedin, "https://www.linkedin.com/in/yaseen-yk");
  assert.equal(OWNER.github, "https://github.com/Yaseenyk");
  const p = personJsonLd();
  assert.equal(p["@type"], "Person");
  assert.equal(p["@id"], OWNER.personId);
  assert.equal(p.name, "Yaseen Khatib");
  assert.deepEqual(p.sameAs, ["https://yk.streamerosai.com/", OWNER.linkedin, OWNER.github]);
  for (const k of ["aggregateRating", "review"]) assert.ok(!(k in p));
});

test("the scoring rules are built from the calculator's real scales, not typed by hand", () => {
  assert.deepEqual(PAGE_SCALES.bgmi, EXAMPLE_SCALE);
  assert.deepEqual(PAGE_SCALES["free-fire"], EXAMPLE_SCALE);
  assert.deepEqual(PAGE_SCALES["cod-mobile"], CODM_EXAMPLE_SCALE);
  assert.equal(scaleText(EXAMPLE_SCALE, "en"), "1st 10, 2nd 6, 3rd 5, 4th 4, 5th 3, 6th 2, 7th 1, 8th 1");
  assert.equal(scaleText(EXAMPLE_SCALE, "pt-BR"), "1º 10, 2º 6, 3º 5, 4º 4, 5º 3, 6º 2, 7º 1, 8º 1");
  const ff = battleRoyaleRules("Free Fire", EXAMPLE_SCALE);
  assert.match(ff.lead, /Free Fire points table/);
  assert.equal(ff.lead.split(/(?<=\.)\s/).length, 2, "two plain sentences");
  assert.ok(ff.items[0].includes(scaleText(EXAMPLE_SCALE, "en")) && ff.items[0].includes("9th place and below: 0"));
  assert.match(ff.items[1], new RegExp(`${EXAMPLE_SCALE.perKill} per kill`));
  assert.ok(battleRoyaleRules("COD Mobile", CODM_EXAMPLE_SCALE).items[0].includes("10th 1. 11th place and below: 0"));
  const v = leagueRules("Valorant");
  assert.ok(v.items[0].startsWith(`Points when the page opens: ${DEFAULT_MAP_LEAGUE.win} for a match win, ${DEFAULT_MAP_LEAGUE.loss} for a loss. Matches are best of 1, 3 or 5.`));
  for (const r of [ff, v]) assert.ok(r.items.some((i) => /change/.test(i)), "says organisers can change the points");
});

test("the example tables on the pages show the same numbers as the calculator starts with", () => {
  for (const [key, scale] of [["bgmi", EXAMPLE_SCALE], ["free-fire", EXAMPLE_SCALE], ["cod-mobile", CODM_EXAMPLE_SCALE]]) {
    const rows = GAME_PAGES[key].table.rows;
    const shown = rows.slice(0, -1).flatMap((r) => { const n = nums(r[1])[0]; const places = nums(r[0]); return places.length > 1 ? places.map(() => n) : [n]; });
    assert.deepEqual(shown, scale.placement, key);
    assert.equal(nums(rows.at(-1)[1])[0], scale.perKill, `${key} kill points`);
  }
});

test("every points table page answers the four trust questions once, and the FAQ data is the one the page renders", () => {
  const pages = [["Free Fire points table", GAME_PAGES["free-fire"]], ["BGMI points table", GAME_PAGES.bgmi], ["COD Mobile points table", GAME_PAGES["cod-mobile"]], ["Valorant points table", VALORANT_PAGE], ["points table maker", TOOL_PAGES["points-table"]]];
  for (const [name, page] of pages) {
    const qs = page.faq.map((f) => f.q);
    for (const q of [`Is the ${name} safe to use?`, `Do I need an account to use the ${name}?`, `Is the ${name} free?`, `Which points system does the ${name} use?`]) {
      assert.equal(qs.filter((x) => x === q).length, 1, `${name}: "${q}"`);
    }
    assert.equal(new Set(qs).size, qs.length, `${name}: no repeated question`);
    assert.ok(!qs.includes("Is my data saved or sent anywhere?"), "the old data question is merged into the safety question");
    const sys = page.faq.find((f) => f.q.startsWith("Which points system")).a;
    assert.match(sys, /step (1|2)|first step/, `${name}: says where the points can be changed`);
  }
  // The Portuguese page has the three trust questions too, in the same places as the English Free Fire page.
  const en = GAME_PAGES["free-fire"].faq, pt = FREE_FIRE_PT.faq;
  assert.equal(pt.length, en.length);
  assert.deepEqual(pt.slice(-3).map((f) => f.q), ["A tabela de pontos de Free Fire é segura?", "Preciso de conta para usar a tabela de pontos de Free Fire?", "A tabela de pontos de Free Fire é grátis?"]);
  assert.deepEqual(en.slice(-3), trustFaq("Free Fire points table"));
});

test("the 'Safe to use' claims hold in the code", () => {
  // The calculators make no network call of their own and are masked for Clarity; Pulse click labels inside them are fixed words.
  for (const f of ["src/components/tools/PointsTable.tsx", "src/features/map-league/ui/MapLeagueTool.tsx", "src/features/map-league/hooks/useMapLeague.ts", "src/features/share-result/hooks/useShareResult.ts", "src/lib/share-cards.ts", "src/components/display/useScreen.ts", "src/features/overlay-kit/services/kit-store.ts"]) {
    const src = read(f);
    assert.ok(!/\bfetch\s*\(|XMLHttpRequest|sendBeacon/.test(src), `${f} calls the network`);
  }
  for (const f of ["src/components/tools/PointsTable.tsx", "src/features/map-league/ui/MapLeagueTool.tsx"]) {
    const src = read(f);
    assert.match(src, /<div className="space-y-5" data-clarity-mask="true">/, `${f} is masked for Clarity`);
    // Any control whose aria-label carries a team name must carry a fixed data-pulse-label too.
    // A control's attributes up to its handler, where these files put aria-label and data-pulse-label.
    const named = [...src.matchAll(/<(input|button)\b[^\n]*?(onChange|onClick)=/g)].filter((m) => /aria-label=\{(?:[^{}]|\{[^{}]*\})*?(?:\$\{)?(t\.name|f\.a|f\.b)/.test(m[0]));
    assert.ok(named.length >= 2, `${f}: the controls named after teams were not found`);
    for (const m of named) assert.match(m[0], /data-pulse-label="[a-z ]+"/, `${f}: ${m[0].slice(0, 80)}`);
  }
  // The only event the tools send carries the tool id and nothing typed.
  assert.equal(beaconBody("tool_complete", "points-table"), '{"v":1,"e":"tool_complete","d":"points-table"}');
  assert.match(read("src/components/tools/PointsTable.tsx"), /sendEvent\("tool_complete", "points-table"\)/);
  // No ads, no payment, no account in the tool.
  assert.ok(!/useAuth|getToken|login/i.test(read("src/components/tools/PointsTable.tsx")));
  for (const lang of ["en", "pt-BR"]) assert.equal(TRUST_COPY[lang].safe.length, 5);
});
