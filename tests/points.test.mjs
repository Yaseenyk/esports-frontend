import test from "node:test";
import assert from "node:assert/strict";
import { EXAMPLE_SCALE, matchPoints, parsePlacement, standings } from "../src/lib/points.ts";

test("a match scores placement points plus kill points", () => {
  assert.equal(matchPoints({ placement: 1, kills: 7 }, EXAMPLE_SCALE), 17);
  assert.equal(matchPoints({ placement: 3, kills: 0 }, EXAMPLE_SCALE), 5);
  assert.equal(matchPoints({ placement: 12, kills: 4 }, EXAMPLE_SCALE), 4); // beyond the list: kills only
  assert.equal(matchPoints({ placement: 2, kills: 3 }, { placement: [15, 12], perKill: 2 }), 18);
});

const teams = [
  { name: "Alpha", matches: [{ placement: 1, kills: 5 }, { placement: 4, kills: 2 }, { placement: 2, kills: 3 }] },
  { name: "Bravo", matches: [{ placement: 2, kills: 6 }, { placement: 1, kills: 4 }, { placement: 5, kills: 1 }] },
  { name: "Charlie", matches: [{ placement: 3, kills: 2 }, { placement: 2, kills: 7 }, { placement: 1, kills: 4 }] },
];

test("worked example: totals and order", () => {
  const s = standings(teams, EXAMPLE_SCALE);
  assert.deepEqual(s.map((x) => [x.name, x.total]), [["Charlie", 5 + 2 + 6 + 7 + 10 + 4], ["Bravo", 6 + 6 + 10 + 4 + 3 + 1], ["Alpha", 10 + 5 + 4 + 2 + 6 + 3]]);
  assert.deepEqual(s.map((x) => x.rank), [1, 2, 3]);
  assert.equal(s[0].wins, 1);
});

test("ties go to more wins, then more kills, then the last match, then name", () => {
  const eq = (n) => ({ name: n, matches: [] });
  const base = { placement: [10, 6, 5], perKill: 1 };
  // equal totals (10): A has a win, B has none
  const wins = standings([{ name: "B", matches: [{ placement: 2, kills: 4 }] }, { name: "A", matches: [{ placement: 1, kills: 0 }] }], base);
  assert.deepEqual(wins.map((x) => x.name), ["A", "B"]);
  assert.ok(wins.every((x) => x.tied));
  // equal totals and wins: more kills first
  const kills = standings([{ name: "B", matches: [{ placement: 3, kills: 5 }] }, { name: "A", matches: [{ placement: 2, kills: 4 }] }], base);
  assert.deepEqual(kills.map((x) => x.name), ["B", "A"]); // both 10 points and no wins: B has 5 kills to A's 4
  // fully equal: alphabetical, and always the same answer
  const same = standings([{ name: "Zed", matches: [{ placement: 1, kills: 1 }] }, { name: "Amy", matches: [{ placement: 1, kills: 1 }] }], base);
  assert.deepEqual(same.map((x) => x.name), ["Amy", "Zed"]);
  assert.deepEqual(standings([eq("x")], base).map((x) => x.total), [0]);
});

test("a scale typed by a person is checked", () => {
  assert.deepEqual(parsePlacement("10, 6 5 4,3"), [10, 6, 5, 4, 3]);
  assert.equal(parsePlacement(""), null);
  assert.equal(parsePlacement("10, six"), null);
  assert.equal(parsePlacement("10, -1"), null);
});
