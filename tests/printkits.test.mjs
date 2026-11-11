import test from "node:test";
import assert from "node:assert/strict";
import {
  pageMm, unitOf, clampInt, cleanTeams, chunk, rowsCapacity, truncateToFit, fitText, wrapLines, fitBlock,
  signTexts, SIGN_PRESETS, bracketGeometry, nextPow2, roundName, buildKit, matchCapacity, brLayout, incidentLayout, defaultOrient, MAX_PAGES,
} from "../src/lib/printkits.ts";
import { PRINTKITS_PAGE } from "../src/lib/tool-page-printkits.ts";

// 1 unit of text size is 1 mm per character (monospace stand-in for the canvas)
const m = (t, s) => Array.from(t).length * s * 0.5;

test("page sizes", () => {
  assert.deepEqual(pageMm("A4", "portrait"), { w: 210, h: 297 });
  assert.deepEqual(pageMm("A3", "landscape"), { w: 420, h: 297 });
  assert.deepEqual(pageMm("B5", "portrait"), { w: 210, h: 297 });
  assert.equal(unitOf(420, 297), 297 / 210);
});

test("clampInt", () => {
  assert.equal(clampInt(5.9, 1, 10), 5);
  assert.equal(clampInt(-3, 1, 10), 1);
  assert.equal(clampInt(99, 1, 10), 10);
  assert.equal(clampInt("abc", 1, 10, 4), 4);
  assert.equal(clampInt(NaN, 2, 10), 2);
});

test("cleanTeams trims, dedupes, caps and strips control characters", () => {
  assert.deepEqual(cleanTeams("  A  \n\na\nB\u0007C\r\nD"), ["A", "B C", "D"]);
  assert.equal(cleanTeams("x".repeat(200))[0].length, 60);
  assert.equal(cleanTeams("a\nb\nc\nd", 2).length, 2);
  assert.equal(Array.from(cleanTeams("🔥".repeat(80))[0]).length, 60);
  assert.deepEqual(cleanTeams("टीम अल्फा\nटीम बीटा"), ["टीम अल्फा", "टीम बीटा"]);
});

test("chunk and rowsCapacity", () => {
  assert.deepEqual(chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
  assert.deepEqual(chunk([], 3), []);
  assert.deepEqual(chunk([1, 2], 0), [[1], [2]]);
  assert.equal(rowsCapacity(100, 24), 4);
  assert.equal(rowsCapacity(5, 24), 1);
});

test("truncateToFit", () => {
  assert.equal(truncateToFit(m, "short", 100, 4), "short");
  const t = truncateToFit(m, "abcdefghijklmnop", 10, 2);
  assert.ok(t.endsWith("…") && m(t, 2) <= 10, t);
  assert.equal(truncateToFit(m, "abc", 0.1, 2), "…");
  assert.equal(truncateToFit(m, "🔥🔥🔥🔥🔥🔥", 4, 2).includes("\ud83d\u0000"), false);
});

test("fitText shrinks, then cuts", () => {
  assert.deepEqual(fitText(m, "abc", 100, 10, 4), { text: "abc", size: 10, shrunk: false, cut: false });
  const s = fitText(m, "a".repeat(20), 40, 10, 4);
  assert.ok(s.shrunk && !s.cut && s.size < 10 && m(s.text, s.size) <= 40.0001);
  const c = fitText(m, "a".repeat(100), 40, 10, 4);
  assert.ok(c.cut && c.size === 4 && m(c.text, c.size) <= 40);
  assert.equal(fitText(m, "", 10, 10, 4).text, "");
  // minimum larger than maximum must not loop or exceed
  assert.ok(fitText(m, "aaaa", 1, 3, 9).size <= 3);
});

test("wrapLines", () => {
  const lines = wrapLines(m, "one two three four", 12, 2);
  assert.ok(lines.every((l) => m(l, 2) <= 12), JSON.stringify(lines));
  assert.equal(lines.join(" "), "one two three four");
  const long = wrapLines(m, "aaaaaaaaaaaaaaaaaaaa", 10, 2);
  assert.ok(long.length > 1 && long.every((l) => m(l, 2) <= 10));
  assert.deepEqual(wrapLines(m, "   ", 10, 2), []);
});

test("fitBlock picks the biggest size that fits and cuts as a last resort", () => {
  const b = fitBlock(m, "Registration desk", 60, 40, 30, 6);
  assert.ok(b.size <= 30 && b.size >= 6 && b.lines.length * b.size * 1.15 <= 40.001);
  assert.equal(b.cut, false);
  const tiny = fitBlock(m, "word ".repeat(200), 20, 12, 10, 8);
  assert.ok(tiny.cut && tiny.lines.length >= 1 && tiny.lines.at(-1).endsWith("…"));
  const small = fitBlock(m, "Hi", 100, 100, 30, 6);
  assert.equal(small.size, 30);
});

test("signTexts: presets, languages and custom lines", () => {
  const s = signTexts(["registration", "checkin", "nope"], "Parking\n  \nFirst  aid", { hi: true, mr: false });
  assert.deepEqual(s.map((x) => x.en), ["Registration", "Check-in", "Parking", "First aid"]);
  assert.equal(s[0].hi, "पंजीकरण"); assert.equal(s[0].mr, undefined); assert.equal(s[1].hi, undefined);
  assert.equal(signTexts(["registration"], "", { hi: false, mr: true })[0].mr, "नोंदणी");
  assert.deepEqual(signTexts([], "", { hi: true, mr: true }), []);
  assert.equal(signTexts([], "x".repeat(300), { hi: false, mr: false })[0].en.length, 80);
  // the eight asked-for words exist, and only certain translations are present
  assert.deepEqual(SIGN_PRESETS.map((p) => p.en), ["Registration", "Check-in", "Players only", "Team captains", "Volunteers", "Press", "Toilets", "Stage"]);
  assert.equal(SIGN_PRESETS.find((p) => p.id === "checkin").hi, undefined);
  assert.equal(SIGN_PRESETS.find((p) => p.id === "captains").mr, undefined);
});

test("nextPow2 and round names", () => {
  assert.deepEqual([2, 3, 5, 8, 9, 17, 32].map(nextPow2), [2, 4, 8, 8, 16, 32, 32]);
  assert.deepEqual([0, 1, 2, 3].map((r) => roundName(r, 4, 16)), ["Round of 16", "Quarter-finals", "Semi-finals", "Final"]);
  assert.equal(roundName(0, 5, 32), "Round of 32");
  assert.equal(roundName(0, 1, 2), "Final");
});

const area = { x: 10, y: 50, w: 400, h: 200 };
const names = (n) => Array.from({ length: n }, (_, i) => `T${i + 1}`);

test("bracketGeometry: too few teams", () => {
  assert.equal(bracketGeometry([], area), null);
  assert.equal(bracketGeometry(["A"], area), null);
});

test("bracketGeometry: counts of boxes for 2..32 teams", () => {
  for (const n of [2, 3, 4, 5, 8, 12, 16, 17, 31, 32]) {
    const g = bracketGeometry(names(n), area);
    const size = nextPow2(n);
    assert.equal(g.size, size); assert.equal(g.byes, size - n); assert.equal(g.teams, n);
    assert.equal(g.boxes.length, size - 1, `boxes for ${n}`);
    assert.equal(g.links.length, size - 1);
    assert.equal(g.roundNames.length, g.rounds);
  }
});

test("bracketGeometry: more than 32 teams are cut to 32", () => {
  const g = bracketGeometry(names(40), area);
  assert.equal(g.size, 32); assert.equal(g.byes, 0); assert.equal(g.teams, 32);
});

test("bracketGeometry: every box stays inside the area and boxes of a round do not overlap", () => {
  for (const n of [2, 6, 16, 32]) {
    const g = bracketGeometry(names(n), area);
    const eps = 1e-6, all = [...g.boxes, g.champion];
    for (const b of all) {
      assert.ok(b.x >= area.x - eps && b.x + b.w <= area.x + area.w + eps, `x ${n}`);
      assert.ok(b.y >= area.y - eps && b.y + b.h <= area.y + area.h + eps, `y ${n}`);
    }
    for (let r = 0; r < g.rounds; r++) {
      const col = g.boxes.filter((b) => b.round === r).sort((a, b) => a.y - b.y);
      for (let i = 1; i < col.length; i++) assert.ok(col[i].y >= col[i - 1].y + col[i - 1].h - eps, `overlap r${r} n${n}`);
    }
  }
});

test("bracketGeometry: seeding, byes and advancement", () => {
  const g8 = bracketGeometry(names(8), area);
  const r0 = g8.boxes.filter((b) => b.round === 0).sort((a, b) => a.index - b.index);
  assert.deepEqual(r0.map((b) => [b.a, b.b]), [["T1", "T8"], ["T4", "T5"], ["T2", "T7"], ["T3", "T6"]]);
  assert.ok(g8.boxes.every((b) => !b.aBye && !b.bBye && !b.aAuto && !b.bAuto));
  const g6 = bracketGeometry(names(6), area); // size 8: seeds 7 and 8 missing
  const f = g6.boxes.filter((b) => b.round === 0).sort((a, b) => a.index - b.index);
  assert.equal(f[0].b, "Bye"); assert.ok(f[0].bBye && !f[0].aBye);
  assert.equal(f[2].b, "Bye");
  assert.equal(f.filter((b) => b.aBye || b.bBye).length, 2);
  const r1 = g6.boxes.filter((b) => b.round === 1).sort((a, b) => a.index - b.index);
  assert.equal(r1[0].a, "T1"); assert.ok(r1[0].aAuto);
  assert.equal(r1[1].a, "T2"); assert.ok(r1[1].aAuto);
  assert.equal(r1[0].b, ""); assert.equal(r1[1].b, "");
  // no match ever has two byes
  for (const n of [3, 5, 9, 17]) assert.ok(bracketGeometry(names(n), area).boxes.every((b) => !(b.aBye && b.bBye)));
});

test("bracketGeometry: connectors run left to right into the next round", () => {
  const g = bracketGeometry(names(8), area);
  for (const l of g.links) { assert.ok(l.x2 > l.x1); assert.ok(l.xm > l.x1 && l.xm < l.x2); }
  const final = g.boxes.find((b) => b.round === 2);
  assert.ok(Math.abs(g.champion.y - final.y) < 1e-9);
});

test("bracketGeometry: two teams is a single final", () => {
  const g = bracketGeometry(["A", "B"], area);
  assert.equal(g.rounds, 1); assert.equal(g.boxes.length, 1);
  assert.deepEqual([g.boxes[0].a, g.boxes[0].b], ["A", "B"]);
});

const base = { event: "Cup", date: "1 Dec", paper: "A4", orient: "portrait", teams: [], count: 1, signIds: [], custom: "", hi: false, mr: false };

test("layout capacities are sane and A3 holds at least as much as A4", () => {
  const a4 = pageMm("A4", "portrait"), a3 = pageMm("A3", "portrait");
  assert.ok(matchCapacity(a4.w, a4.h) >= 6);
  assert.ok(matchCapacity(a3.w, a3.h) >= matchCapacity(a4.w, a4.h) - 1);
  const wide = pageMm("A4", "landscape");
  assert.ok(matchCapacity(wide.w, wide.h) >= 1 && matchCapacity(wide.w, wide.h) < matchCapacity(a4.w, a4.h));
  const lay = brLayout(a4.w, a4.h, 5);
  assert.ok(lay.cap >= 12 && lay.rowH <= 15 && lay.rowH >= 9);
  assert.ok(incidentLayout(a4.w, a4.h).rows >= 8);
});

test("buildKit match: pairs teams and paginates", () => {
  const cap = matchCapacity(210, 297);
  const p = buildKit({ ...base, kind: "match", teams: names(5), count: 2 });
  assert.equal(p.length, 1);
  assert.deepEqual(p[0].rows.slice(0, 3).map((r) => [r.a, r.b]), [["T1", "T2"], ["T3", "T4"], ["T5", ""]]);
  const big = buildKit({ ...base, kind: "match", teams: names(100), count: 1 });
  assert.equal(big.length, Math.ceil(50 / cap));
  assert.equal(big.flatMap((x) => x.rows).length, 50);
  assert.equal(big.at(-1).rows.at(-1).no, 50);
  const blank = buildKit({ ...base, kind: "match", count: 20 });
  assert.equal(blank.flatMap((x) => x.rows).length, 20);
});

test("buildKit br: one page set per game, rows for every team, splits when long", () => {
  const p = buildKit({ ...base, kind: "br", teams: names(12), count: 3 });
  assert.equal(p.length, 3);
  assert.deepEqual(p.map((x) => x.game), [1, 2, 3]);
  assert.ok(p.every((x) => x.rows.length === 12 && x.games === 3));
  const blank = buildKit({ ...base, kind: "br", count: 1 });
  assert.equal(blank[0].rows.length, 12); assert.equal(blank[0].rows[0].team, "");
  const cap = brLayout(210, 297, 200).cap;
  const long = buildKit({ ...base, kind: "br", teams: names(cap + 5), count: 1 });
  assert.equal(long.length, 2); assert.equal(long[1].rows.length, 5); assert.equal(long[1].rows[0].no, cap + 1);
  assert.ok(long.every((x) => x.rowH >= 9 && x.rowH <= 15));
});

test("buildKit referee, signs, bracket", () => {
  const r = buildKit({ ...base, kind: "referee", count: 3 });
  assert.deepEqual(r.map((x) => x.type), ["referee", "incident", "referee", "incident", "referee", "incident"]);
  const s = buildKit({ ...base, kind: "signs", signIds: ["toilets", "press"], custom: "Parking", count: 2, hi: true });
  assert.equal(s.length, 6);
  assert.equal(s[0].sign.en, "Press");
  const b = buildKit({ ...base, kind: "bracket", orient: "landscape", teams: names(10) });
  assert.equal(b.length, 1); assert.equal(b[0].geo.size, 16);
  assert.ok(b[0].w > b[0].h);
  assert.equal(buildKit({ ...base, kind: "bracket", teams: ["A"] })[0].geo, null);
  assert.equal(buildKit({ ...base, kind: "signs" }).length, 0);
});

test("buildKit caps pages and sanitises counts", () => {
  assert.ok(buildKit({ ...base, kind: "referee", count: 20 }).length <= MAX_PAGES);
  assert.ok(buildKit({ ...base, kind: "match", count: 99999 }).length <= MAX_PAGES);
  assert.equal(buildKit({ ...base, kind: "bracket", teams: names(4), count: NaN }).length, 1);
  assert.equal(buildKit({ ...base, kind: "signs", signIds: ["press"], count: 50 }).length, 5);
});

test("defaultOrient", () => {
  assert.equal(defaultOrient("bracket"), "landscape");
  assert.equal(defaultOrient("match"), "portrait");
});

test("the page text follows the tool page rules", () => {
  const p = PRINTKITS_PAGE;
  assert.ok(p.title.length <= 56 && /^printable/i.test(p.title), p.title.length);
  assert.ok(p.description.length >= 70 && p.description.length <= 170, `description ${p.description.length}`);
  assert.ok(p.faq.length >= 7);
  const seen = new Set();
  for (const { q, a } of p.faq) {
    assert.ok(q.endsWith("?"), q);
    assert.ok(a.length >= 350 && a.length <= 1100, `${q}: ${a.length}`);
    assert.ok(!seen.has(q.toLowerCase()));
    seen.add(q.toLowerCase());
  }
  assert.ok(p.steps.length >= 3 && p.benefits.length >= 3 && p.guides.length >= 3);
});
