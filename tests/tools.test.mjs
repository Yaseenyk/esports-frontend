import test from "node:test";
import assert from "node:assert/strict";
import { BYE, fixtures, matchCount, table } from "../src/lib/roundrobin.ts";
import { buildSchedule, formatTime, parseTime, summary } from "../src/lib/schedule.ts";

const names = (n) => Array.from({ length: n }, (_, i) => `T${i + 1}`);
const real = (rounds) => rounds.flat().filter((f) => f.a !== BYE && f.b !== BYE);

test("round robin: every pair meets exactly once, for even and odd team counts", () => {
  for (const n of [2, 3, 4, 5, 6, 7, 8, 9, 12]) {
    const rounds = fixtures(names(n));
    const pairs = real(rounds).map((f) => [f.a, f.b].sort().join("-"));
    assert.equal(new Set(pairs).size, pairs.length, `n=${n} repeats a pair`);
    assert.equal(pairs.length, matchCount(n), `n=${n} match count`);
    assert.equal(rounds.length, n % 2 ? n : n - 1, `n=${n} round count`);
  }
});

test("round robin: no team plays twice in a round, and odd fields give each team one bye", () => {
  for (const n of [4, 5, 8, 9]) {
    const rounds = fixtures(names(n));
    for (const rd of rounds) { const seen = rd.flatMap((f) => [f.a, f.b]).filter((x) => x !== BYE); assert.equal(new Set(seen).size, seen.length); }
    if (n % 2) for (const t of names(n)) assert.equal(rounds.flat().filter((f) => (f.a === t && f.b === BYE) || (f.b === t && f.a === BYE)).length, 1, `${t} should have exactly one bye`);
  }
});

test("double round robin doubles the matches and swaps sides", () => {
  const single = fixtures(names(6)), double = fixtures(names(6), true);
  assert.equal(real(double).length, matchCount(6, true));
  assert.equal(double.length, single.length * 2);
  const first = single[0][0], again = double[single.length][0];
  assert.deepEqual([again.a, again.b], [first.b, first.a]);
  assert.deepEqual(fixtures(["only one"]), []);
  assert.deepEqual(fixtures(["", " "]), []);
});

test("league table: points, difference, tie-break order and unfinished matches", () => {
  const teams = ["Alpha", "Bravo", "Charlie"];
  const rounds = fixtures(teams);
  // Fill every real match: whoever is listed first wins 2-0, except Bravo vs Charlie draws 1-1.
  const scores = rounds.map((rd) => rd.map((f) => (f.a === BYE || f.b === BYE ? { a: null, b: null } : [f.a, f.b].sort().join() === "Bravo,Charlie" ? { a: 1, b: 1 } : { a: 2, b: 0 })));
  const rows = table(teams, rounds, scores);
  assert.equal(rows.reduce((n, r) => n + r.played, 0), 6);
  assert.equal(rows.reduce((n, r) => n + r.points, 0), rows.reduce((n, r) => n + 3 * r.won + r.drawn, 0));
  assert.deepEqual(rows.map((r) => r.rank), [1, 2, 3]);
  // a match with a missing score is not counted
  const partial = table(teams, rounds, rounds.map((rd) => rd.map(() => ({ a: 1, b: null }))));
  assert.ok(partial.every((r) => r.played === 0 && r.points === 0));
  // same results, same table, and ties fall back to name
  const tied = table(["Zed", "Amy"], fixtures(["Zed", "Amy"]), [[{ a: 1, b: 1 }]]);
  assert.deepEqual(tied.map((r) => r.team), ["Amy", "Zed"]);
});

test("schedule: slots, lobbies, gaps and a longer break", () => {
  const input = { start: "10:00", matches: 7, duration: 40, gap: 10, lobbies: 2, breakEvery: 2, breakLength: 30 };
  const slots = buildSchedule(input);
  assert.equal(slots.length, 4); // 7 matches, 2 at a time
  assert.deepEqual(slots.map((s) => s.matches), [[1, 2], [3, 4], [5, 6], [7]]);
  assert.deepEqual([slots[0].start, slots[0].end], ["10:00", "10:40"]);
  assert.deepEqual([slots[1].start, slots[1].end], ["10:50", "11:30"]);
  assert.equal(slots[1].breakAfter, 30); // after the second slot
  assert.deepEqual([slots[2].start, slots[2].end], ["12:10", "12:50"]); // 11:30 + 10 gap + 30 break
  assert.equal(slots[3].breakAfter, 0);
  const sum = summary(input, slots);
  assert.equal(sum.finish, slots[3].end);
  assert.equal(sum.slots, 4);
});

test("schedule: no break after the last slot, and bad input is refused", () => {
  const s = buildSchedule({ start: "09:30", matches: 4, duration: 30, gap: 0, lobbies: 2, breakEvery: 1, breakLength: 15 });
  assert.equal(s.at(-1).breakAfter, 0);
  assert.equal(buildSchedule({ start: "25:00", matches: 4, duration: 30, gap: 0, lobbies: 2, breakEvery: 0, breakLength: 0 }), null);
  assert.equal(buildSchedule({ start: "10:00", matches: 0, duration: 30, gap: 0, lobbies: 2, breakEvery: 0, breakLength: 0 }), null);
  assert.equal(buildSchedule({ start: "10:00", matches: 4, duration: 30.5, gap: 0, lobbies: 2, breakEvery: 0, breakLength: 0 }), null);
  assert.equal(parseTime("9:05"), 545);
  assert.equal(parseTime("nope"), null);
  assert.equal(formatTime(1500), "01:00 (+1d)");
});

test("schedule matches the worked example in the formats guide: 19 matches, 4 lobbies, 40 minutes", () => {
  const input = { start: "10:00", matches: 19, duration: 40, gap: 0, lobbies: 4, breakEvery: 0, breakLength: 0 };
  assert.equal(summary(input, buildSchedule(input)).slots, 5);
});
