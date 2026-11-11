// Run: node --import tsx --test tests/leaderboard.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import {
  COMMON_SCALE, DEFAULT_SETTINGS, TIEBREAKS, addDay, buildLeague, dayRangeText, daysProblem, leagueUrl, movementInfo, normalizeDays, numberMatches, ordinal,
  parseSettings, removeDay, rowFor, rowText, scoringText, tableFor, tieBreakText, updateDay,
} from "../src/lib/league.ts";

let n = 0;
const m = (o) => ({ id: `m${++n}`, stage: "main", round: 1, slot: 1, a: "", b: "", status: "scheduled", scoreA: null, scoreB: null, startsAt: null, ...o });
const fin = (a, b, sa, sb, o = {}) => m({ a, b, scoreA: sa, scoreB: sb, status: "finished", ...o });
const S = (o = {}) => ({ ...DEFAULT_SETTINGS, ...o });
const row = (l, day, team) => rowFor(tableFor(l, day), team);

test("empty season: no tables of substance, no crash", () => {
  const l = buildLeague({ matches: [], br: [], settings: S() });
  assert.equal(l.empty, true);
  assert.equal(l.days.length, 1);
  assert.equal(l.days[0].label, "Season");
  assert.deepEqual(l.tables[0].rows, []);
  assert.equal(l.latest, 0);
  assert.equal(tableFor(l, 5), l.tables[0]);
});

test("garbage input does not crash", () => {
  const l = buildLeague({ matches: [], br: undefined, settings: { title: 5, scale: "x", days: [{}, null, 3] } });
  assert.equal(l.empty, true);
  const l2 = buildLeague({ matches: [fin("A", "B", 1, 0)], br: [{ matchNo: 1, team: "A", placement: "x", kills: NaN }, null].filter(Boolean), settings: S() });
  assert.equal(l2.tables[0].rows.length, 2);
});

test("head-to-head: win, draw and loss points come from the settings", () => {
  const ms = [fin("Alpha", "Beta", 2, 1), fin("Alpha", "Gamma", 1, 1, { slot: 2 }), fin("Beta", "Gamma", 0, 3, { slot: 3 })];
  const l = buildLeague({ matches: ms, br: [], settings: S() });
  const t = l.tables[0].rows;
  assert.deepEqual(t.map((r) => [r.team, r.points]), [["Gamma", 4], ["Alpha", 4], ["Beta", 0]]);
  const custom = buildLeague({ matches: ms, br: [], settings: S({ winPts: 2, drawPts: 0.5, lossPts: -1 }) });
  assert.equal(row(custom, 0, "Alpha").points, 2.5);
  assert.equal(row(custom, 0, "Beta").points, -2);
  assert.equal(row(custom, 0, "Gamma").points, 2.5);
});

test("tie-breaks: points, then wins, then score difference, then kills, then name; fully level teams share a rank", () => {
  assert.equal(TIEBREAKS.length, 5);
  assert.match(tieBreakText(), /points.*wins.*score difference.*kills.*name/);
  // A and B both 3 points; A has one win, B three draws -> A above B
  const ms = [
    fin("A", "X", 1, 0), fin("A", "Y", 0, 1, { slot: 2 }), fin("A", "Z", 0, 1, { slot: 3 }),
    fin("B", "X", 1, 1, { slot: 4 }), fin("B", "Y", 1, 1, { slot: 5 }), fin("B", "Z", 1, 1, { slot: 6 }),
  ];
  const l = buildLeague({ matches: ms, br: [], settings: S({ winPts: 3, drawPts: 1, lossPts: 0 }) });
  const a = row(l, 0, "A"), b = row(l, 0, "B");
  assert.equal(a.points, 3);
  assert.equal(b.points, 3);
  assert.ok(a.rank < b.rank);
  assert.equal(a.tied, false);
  // difference decides when wins are level
  const d = buildLeague({ matches: [fin("P", "Q", 3, 0), fin("R", "Q", 1, 0, { slot: 2 })], br: [], settings: S() });
  assert.deepEqual(d.tables[0].rows.map((r) => r.team), ["P", "R", "Q"]);
  // fully level: same rank, name order, both flagged tied
  const e = buildLeague({ matches: [fin("Zed", "Amy", 1, 1)], br: [], settings: S() });
  assert.deepEqual(e.tables[0].rows.map((r) => [r.team, r.rank, r.tied]), [["Amy", 1, true], ["Zed", 1, true]]);
  const f = buildLeague({ matches: [fin("Zed", "Amy", 1, 1), fin("Cy", "Amy", 0, 2, { slot: 2 })], br: [], settings: S() });
  assert.deepEqual(f.tables[0].rows.map((r) => [r.team, r.rank]), [["Amy", 1], ["Zed", 2], ["Cy", 3]]);
});

test("battle royale: placement scale plus kills, tie-break on first places then kills", () => {
  const br = [
    { matchNo: 1, team: "Alpha", placement: 1, kills: 4 }, { matchNo: 1, team: "Beta", placement: 2, kills: 6 }, { matchNo: 1, team: "Gamma", placement: 9, kills: 1 },
    { matchNo: 2, team: "Alpha", placement: 3, kills: 0 }, { matchNo: 2, team: "Beta", placement: 1, kills: 0 }, { matchNo: 2, team: "Gamma", placement: 2, kills: 2 },
  ];
  const l = buildLeague({ matches: [], br, settings: S({ scale: [10, 6, 5], perKill: 1 }) });
  const t = l.tables[0].rows;
  assert.deepEqual(t.map((r) => [r.team, r.points, r.kills, r.firsts]), [["Beta", 22, 6, 1], ["Alpha", 19, 4, 1], ["Gamma", 9, 3, 0]]);
  assert.equal(l.empty, false);
  // levelled by points, more wins then kills decide
  const l2 = buildLeague({ matches: [], br: [{ matchNo: 1, team: "X", placement: 1, kills: 0 }, { matchNo: 1, team: "Y", placement: 2, kills: 4 }], settings: S({ scale: [8, 4], perKill: 1 }) });
  assert.deepEqual(l2.tables[0].rows.map((r) => [r.team, r.points]), [["X", 8], ["Y", 8]]);
  assert.equal(row(l2, 0, "X").tied, false);
});

test("battle royale rows with no team, a bad placement or a repeated game are ignored; kills clamp to 0", () => {
  const br = [
    { matchNo: 1, team: "", placement: 1, kills: 1 }, { matchNo: 1, team: "A", placement: 0, kills: 1 }, { matchNo: 0, team: "A", placement: 1, kills: 1 },
    { matchNo: 1, team: "B", placement: 1, kills: -5 }, { matchNo: 1, team: " b ", placement: 2, kills: 3 }, { matchNo: 1, team: "C", placement: 1.5, kills: 1 },
  ];
  const l = buildLeague({ matches: [], br, settings: S({ scale: [10, 5], perKill: 2 }) });
  const t = l.tables[0].rows;
  assert.deepEqual(t.map((r) => r.team).sort(), ["A", "B", "C"]);
  assert.equal(row(l, 0, "A").played, 0);
  assert.equal(row(l, 0, "B").points, 10);
  assert.equal(row(l, 0, "B").played, 1);
});

test("mixed head-to-head and battle royale add into one total", () => {
  const l = buildLeague({
    matches: [fin("Alpha", "Beta", 1, 0)],
    br: [{ matchNo: 1, team: "Alpha", placement: 2, kills: 3 }, { matchNo: 1, team: "Beta", placement: 1, kills: 0 }],
    settings: S({ scale: [10, 6], perKill: 1 }),
  });
  assert.equal(row(l, 0, "Alpha").points, 3 + 6 + 3);
  assert.equal(row(l, 0, "Beta").points, 10);
  assert.equal(row(l, 0, "Alpha").played, 2);
});

test("unfinished matches, blank sides, same team twice and unplayed teams", () => {
  const ms = [
    fin("A", "B", 1, 0), m({ a: "C", b: "D" }), m({ a: "E", b: "F", status: "live", scoreA: 1, scoreB: 0 }),
    fin("", "G", 1, 0), fin("H", "h ", 1, 0), fin("a", " A", 2, 0),
  ];
  const l = buildLeague({ matches: ms, br: [], settings: S() });
  const t = l.tables[0].rows;
  assert.equal(t.length, 8); // A B C D E F G H, each once
  assert.equal(row(l, 0, "C").played, 0);
  assert.equal(row(l, 0, "C").points, 0);
  assert.equal(row(l, 0, "A").points, 3);
  assert.equal(row(l, 0, "G").played, 0);
  assert.equal(row(l, 0, "  b").team, "B");
});

test("a forfeit with no score counts for the side that did not forfeit; a finished match with no scores and no winner is skipped", () => {
  const ms = [m({ a: "A", b: "B", status: "forfeit", winner: "b" }), m({ a: "C", b: "D", status: "finished" }), m({ a: "E", b: "F", status: "finished", winner: "draw" })];
  const l = buildLeague({ matches: ms, br: [], settings: S() });
  assert.equal(row(l, 0, "B").points, 3);
  assert.equal(row(l, 0, "B").diff, 1);
  assert.equal(row(l, 0, "A").points, 0);
  assert.equal(row(l, 0, "C").played, 0);
  assert.equal(row(l, 0, "E").points, 1);
});

test("match numbers follow the match list order", () => {
  const ms = [m({ id: "k", stage: "knockout", round: 1, slot: 1 }), m({ id: "g2", stage: "group:A", round: 2, slot: 1 }), m({ id: "g1", stage: "group:A", round: 1, slot: 1 })];
  const nums = numberMatches(ms);
  assert.deepEqual([nums.get("g1"), nums.get("g2"), nums.get("k")], [1, 2, 3]);
});

test("days: per-day points, cumulative tables, rank movement and form", () => {
  const ms = [
    fin("A", "B", 2, 0, { id: "d1" }), fin("C", "D", 0, 1, { id: "d2", slot: 2 }),
    fin("B", "C", 3, 0, { id: "d3", slot: 3 }), fin("A", "D", 0, 1, { id: "d4", slot: 4 }),
  ];
  const settings = S({ days: [{ label: "Day 1", fromMatch: 1, toMatch: 2 }, { label: "Day 2", fromMatch: 3, toMatch: 4 }] });
  const l = buildLeague({ matches: ms, br: [], settings });
  assert.equal(l.days.length, 2);
  assert.equal(l.latest, 1);
  assert.deepEqual(l.tables.map((t) => t.results), [2, 2]);
  const d1 = l.tables[0].rows, d2 = l.tables[1].rows;
  assert.deepEqual(d1.map((r) => [r.team, r.points]), [["A", 3], ["D", 3], ["C", 0], ["B", 0]]);
  assert.deepEqual(d1.map((r) => r.movement), [null, null, null, null]);
  // day 2: D 6, A and B 3 each (level on points, wins, difference and kills: they share rank 2), C 0
  assert.deepEqual(d2.map((r) => [r.team, r.rank, r.points, r.dayPoints]), [["D", 1, 6, 3], ["A", 2, 3, 0], ["B", 2, 3, 3], ["C", 4, 0, 0]]);
  assert.equal(row(l, 1, "D").movement, 1); // 2nd -> 1st
  assert.equal(row(l, 1, "A").movement, -1); // 1st -> 2nd
  assert.equal(row(l, 1, "B").movement, 2); // 4th -> 2nd
  assert.equal(row(l, 1, "C").movement, -1); // 3rd -> 4th
  assert.deepEqual(row(l, 1, "A").form.map((f) => f.kind), ["W", "L"]);
  assert.deepEqual(row(l, 0, "A").form.map((f) => f.kind), ["W"]);
});

test("form keeps the last five, oldest first, with text for each", () => {
  const ms = [];
  for (let i = 1; i <= 7; i++) ms.push(fin("A", `O${i}`, i % 2 ? 1 : 0, i % 2 ? 0 : 1, { id: `f${i}`, slot: i }));
  const l = buildLeague({ matches: ms, br: [{ matchNo: 9, team: "A", placement: 3, kills: 0 }], settings: S({ scale: [3, 2, 1] }) });
  const f = row(l, 0, "A").form;
  assert.equal(f.length, 5);
  assert.ok(f.every((x) => x.label && x.short));
  assert.deepEqual(f.map((x) => x.kind), ["L", "W", "L", "W", "P"]);
  assert.equal(f.at(-1).short, "3rd");
  assert.equal(f.at(-1).label, "3rd place");
});

test("matches outside every day go into an extra 'Other matches' day; matches before the first day too", () => {
  const ms = [fin("A", "B", 1, 0, { id: "a1" }), fin("A", "C", 1, 0, { id: "a2", slot: 2 }), fin("A", "D", 1, 0, { id: "a3", slot: 3 })];
  const l = buildLeague({ matches: ms, br: [], settings: S({ days: [{ label: "Day 1", fromMatch: 2, toMatch: 2 }] }) });
  assert.equal(l.days.length, 2);
  assert.equal(l.days[1].label, "Other matches");
  assert.equal(l.days[1].auto, true);
  assert.equal(row(l, 0, "A").points, 3);
  assert.equal(row(l, 1, "A").points, 9);
  const none = buildLeague({ matches: ms, br: [], settings: S({ days: [{ label: "All", fromMatch: 1, toMatch: 9 }] }) });
  assert.equal(none.days.length, 1);
});

test("one day only: no movement anywhere", () => {
  const l = buildLeague({ matches: [fin("A", "B", 1, 0)], br: [], settings: S({ days: [{ label: "Finals", fromMatch: 1, toMatch: 3 }] }) });
  assert.equal(l.tables.length, 1);
  assert.ok(l.tables[0].rows.every((r) => r.movement === null));
});

test("a day with no results yet keeps the standings and shows no movement", () => {
  const l = buildLeague({ matches: [fin("A", "B", 1, 0, { id: "z1" }), m({ id: "z2", a: "A", b: "B", slot: 2 })], br: [], settings: S({ days: [{ label: "Day 1", fromMatch: 1, toMatch: 1 }, { label: "Day 2", fromMatch: 2, toMatch: 2 }] }) });
  assert.equal(l.latest, 0);
  assert.equal(l.tables[1].results, 0);
  assert.ok(l.tables[1].rows.every((r) => r.movement === 0));
  assert.ok(l.tables[1].rows.every((r) => r.dayPoints === 0));
});

test("a team first seen on day 2 is 'New', not a jump", () => {
  const l = buildLeague({
    matches: [fin("A", "B", 1, 0, { id: "n1" }), fin("A", "C", 1, 0, { id: "n2", slot: 2 })], br: [],
    settings: S({ days: [{ label: "Day 1", fromMatch: 1, toMatch: 1 }, { label: "Day 2", fromMatch: 2, toMatch: 2 }] }),
  });
  assert.equal(row(l, 1, "C").movement, null);
  assert.equal(row(l, 1, "A").movement, 0);
  assert.equal(movementInfo(null).text, "New");
});

test("battle royale days use the game number", () => {
  const br = [];
  for (let g = 1; g <= 4; g++) { br.push({ matchNo: g, team: "A", placement: g <= 2 ? 1 : 2, kills: 0 }, { matchNo: g, team: "B", placement: g <= 2 ? 2 : 1, kills: 0 }); }
  const l = buildLeague({ matches: [], br, settings: S({ scale: [10, 4], days: [{ label: "Day 1", fromMatch: 1, toMatch: 2 }, { label: "Day 2", fromMatch: 3, toMatch: 4 }] }) });
  assert.equal(row(l, 0, "A").points, 20);
  assert.equal(row(l, 0, "B").points, 8);
  assert.equal(row(l, 1, "A").dayPoints, 8);
  assert.equal(row(l, 1, "B").dayPoints, 20);
  assert.equal(row(l, 1, "A").points, 28);
  assert.equal(row(l, 1, "B").points, 28);
  assert.equal(row(l, 1, "A").tied, true);
  assert.equal(l.tables[0].results, 2);
});

test("movement words and arrows", () => {
  assert.deepEqual(movementInfo(2), { arrow: "▲", text: "Up 2 places" });
  assert.deepEqual(movementInfo(1), { arrow: "▲", text: "Up 1 place" });
  assert.deepEqual(movementInfo(-1), { arrow: "▼", text: "Down 1 place" });
  assert.deepEqual(movementInfo(-3), { arrow: "▼", text: "Down 3 places" });
  assert.deepEqual(movementInfo(0), { arrow: "–", text: "No change" });
});

test("rowText reads as a sentence", () => {
  const l = buildLeague({ matches: [fin("A", "B", 1, 0)], br: [], settings: S() });
  assert.match(rowText(row(l, 0, "A")), /^1st: A, 3 points, 3 on this day, New\.$/);
  assert.match(rowText(row(l, 0, "B")), /0 points/);
  assert.equal(rowFor(tableFor(l, 0), ""), null);
  assert.equal(rowFor(null, "A"), null);
});

test("ordinal, scoring text and day text", () => {
  assert.deepEqual([1, 2, 3, 4, 11, 12, 13, 21, 22, 101, 111].map(ordinal), ["1st", "2nd", "3rd", "4th", "11th", "12th", "13th", "21st", "22nd", "101st", "111th"]);
  const t = scoringText(S({ scale: COMMON_SCALE, perKill: 1 }));
  assert.equal(t.length, 2);
  assert.match(t[0], /win is 3 points, a draw is 1 and a loss is 0/);
  assert.match(t[1], /1st place scores 10, 2nd place scores 6/);
  assert.match(t[1], /Each kill is worth 1/);
  assert.equal(scoringText(S({ scale: [], perKill: 0 })).length, 1);
  assert.match(scoringText(S({ scale: [], perKill: 2 }))[1], /placement scores nothing/);
  assert.equal(dayRangeText({ label: "Day 1", fromMatch: 1, toMatch: 6 }), "Day 1 = matches 1 to 6");
  assert.equal(dayRangeText({ label: "Final", fromMatch: 12, toMatch: 12 }), "Final = match 12");
});

test("parseSettings is lenient and safe", () => {
  assert.deepEqual(parseSettings(null), DEFAULT_SETTINGS);
  assert.deepEqual(parseSettings("x"), DEFAULT_SETTINGS);
  const s = parseSettings({ title: "  T ", scale: [5, -1, "x", 3], perKill: "2", winPts: 2, days: [{ label: "", fromMatch: 3, toMatch: 5 }, { label: "Overlap", fromMatch: 4, toMatch: 9, date: "2026-12-01" }, { fromMatch: 0, toMatch: 3 }, { fromMatch: 5, toMatch: 2 }] });
  assert.equal(s.title, "T");
  assert.deepEqual(s.scale, [5, 3]);
  assert.equal(s.perKill, 1);
  assert.equal(s.winPts, 2);
  assert.deepEqual(s.days, [{ label: "Day 1", fromMatch: 3, toMatch: 5 }, { label: "Overlap", fromMatch: 6, toMatch: 9, date: "2026-12-01" }]);
});

test("day editing keeps days in order and valid", () => {
  let d = addDay([]);
  assert.deepEqual(d, [{ label: "Day 1", fromMatch: 1, toMatch: 5 }]);
  d = addDay(d);
  assert.deepEqual(d[1], { label: "Day 2", fromMatch: 6, toMatch: 10 });
  d = updateDay(d, 0, { toMatch: 8 });
  assert.deepEqual([d[0].toMatch, d[1].fromMatch, d[1].toMatch], [8, 9, 10]);
  d = updateDay(d, 0, { toMatch: 20 });
  assert.deepEqual([d[1].fromMatch, d[1].toMatch], [21, 21]);
  assert.equal(daysProblem(d), null);
  d = removeDay(d, 0);
  assert.equal(d.length, 1);
  assert.equal(daysProblem([{ label: "", fromMatch: 1, toMatch: 2 }]), "Day 1 needs a name.");
  assert.match(daysProblem([{ label: "A", fromMatch: 3, toMatch: 2 }]), /ends before/);
  assert.match(daysProblem([{ label: "A", fromMatch: 1, toMatch: 3 }, { label: "B", fromMatch: 3, toMatch: 4 }]), /shares matches/);
  assert.match(daysProblem([{ label: "A", fromMatch: 0, toMatch: 3 }]), /whole match numbers/);
  let many = [];
  for (let i = 0; i < 40; i++) many = addDay(many);
  assert.equal(many.length, 31);
  assert.deepEqual(normalizeDays([{ label: "A", fromMatch: 9998, toMatch: 9999 }, { label: "B", fromMatch: 1, toMatch: 2 }]).length, 1);
});

test("leagueUrl puts the slug in the query", () => {
  assert.equal(leagueUrl("https://x.test/", "abc234"), "https://x.test/league/?s=abc234");
});
