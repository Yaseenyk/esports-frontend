// The Valorant league table (src/features/map-league/domain.ts): best-of reading, points, map and round difference, head-to-head.
import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_MAP_LEAGUE, mapLeagueTable, mapLeagueView, mapsToWin, matchOutcome, progress } from "../src/features/map-league/domain.ts";
import { BYE, fixtures } from "../src/lib/roundrobin.ts";

const m = (a, b) => ({ a, b });
/** Builds results[round][fixture] from a list of [teamA, teamB, maps], whichever side the fixture lists first. */
function results(rounds, list) {
  return rounds.map((rd) => rd.map((f) => {
    const hit = list.find(([x, y]) => (x === f.a && y === f.b) || (x === f.b && y === f.a));
    if (!hit) return [];
    const [x, , maps] = hit;
    return x === f.a ? maps : maps.map((s) => m(s.b, s.a));
  }));
}
const order = (rows) => rows.map((r) => r.team);

test("maps to win: 1 of 1, 2 of 3, 3 of 5", () => {
  assert.deepEqual([1, 3, 5].map(mapsToWin), [1, 2, 3]);
});

test("a best of 3 is decided at two maps; extra maps are ignored, a level map is flagged, half-typed maps do not count", () => {
  const done = matchOutcome([m(13, 7), m(13, 11), m(5, 13)], 3);
  assert.equal(done.status, "done"); assert.equal(done.winner, "a");
  assert.deepEqual([done.mapsA, done.mapsB, done.roundsA, done.roundsB, done.showMaps], [2, 0, 26, 18, 2]);
  const split = matchOutcome([m(13, 7), m(9, 13)], 3);
  assert.equal(split.status, "partial"); assert.equal(split.winner, null); assert.equal(split.showMaps, 3);
  const decider = matchOutcome([m(13, 7), m(9, 13), m(14, 16)], 3);
  assert.equal(decider.winner, "b"); assert.deepEqual([decider.mapsA, decider.mapsB], [1, 2]);
  assert.equal(matchOutcome([m(12, 12)], 1).status, "level");
  assert.equal(matchOutcome([m(13, null)], 1).status, "partial");
  const empty = matchOutcome([], 5);
  assert.equal(empty.status, "empty"); assert.equal(empty.showMaps, 1);
});

test("best of 1: three teams on 3 points each are separated by round difference", () => {
  const teams = ["A", "B", "C"], rounds = fixtures(teams);
  const rows = mapLeagueTable(teams, rounds, results(rounds, [["A", "B", [m(13, 5)]], ["B", "C", [m(13, 11)]], ["C", "A", [m(13, 10)]]]));
  assert.deepEqual(order(rows), ["A", "C", "B"]);
  assert.deepEqual(rows.map((r) => [r.points, r.played, r.won, r.lost, r.roundDiff]), [[3, 2, 1, 1, 5], [3, 2, 1, 1, 1], [3, 2, 1, 1, -6]]);
  assert.ok(rows.every((r) => r.tieBreak === "rounds"));
});

test("best of 3: map difference comes before round difference", () => {
  const teams = ["A", "B", "C"], rounds = fixtures(teams);
  const s = { ...DEFAULT_MAP_LEAGUE, bestOf: 3 };
  const rows = mapLeagueTable(teams, rounds, results(rounds, [
    ["A", "B", [m(13, 11), m(13, 11)]],          // A 2-0, +4 rounds
    ["B", "C", [m(13, 0), m(0, 13), m(13, 0)]],  // B 2-1, +13 rounds
    ["C", "A", [m(13, 0), m(0, 13), m(13, 0)]],  // C 2-1, +13 rounds
  ]), s);
  // Maps: A 2-0 and 1-2 = +1; B 0-2 and 2-1 = -1; C 1-2 and 2-1 = 0. Rounds alone would put B or C first; maps put A first.
  assert.deepEqual(order(rows), ["A", "C", "B"]);
  assert.deepEqual(rows.map((r) => r.mapDiff), [1, 0, -1]);
  assert.ok(rows.every((r) => r.tieBreak === "maps"));
});

test("head-to-head decides teams level on points, maps and rounds; then team name", () => {
  const teams = ["A", "B", "C", "D"], rounds = fixtures(teams);
  const rows = mapLeagueTable(teams, rounds, results(rounds, [
    ["A", "B", [m(13, 11)]], ["A", "C", [m(11, 13)]], ["A", "D", [m(13, 5)]],
    ["B", "C", [m(13, 11)]], ["B", "D", [m(13, 5)]], ["C", "D", [m(5, 13)]],
  ]));
  // A and B: 6 points, maps +1, rounds +8 each, and A beat B. C and D: 3 points, maps -1, rounds -8 each, and D beat C.
  assert.deepEqual(order(rows), ["A", "B", "D", "C"]);
  assert.deepEqual(rows.map((r) => r.tieBreak), ["head-to-head", "head-to-head", "head-to-head", "head-to-head"]);
  // Played twice, each winning once by the same score: nothing separates them but the name.
  const two = ["Zeta", "Alpha"], r2 = fixtures(two, true);
  const rows2 = mapLeagueTable(two, r2, r2.map((rd) => rd.map(() => [m(13, 9)])));
  assert.deepEqual(order(rows2), ["Alpha", "Zeta"]);
  assert.deepEqual(rows2.map((r) => r.tieBreak), ["name", "name"]);
});

test("points per win and loss are editable, unfinished matches give nothing, and byes are skipped", () => {
  const teams = ["A", "B", "C"], rounds = fixtures(teams);
  assert.ok(rounds.flat().some((f) => f.a === BYE || f.b === BYE), "three teams means a bye each round");
  const res = results(rounds, [["A", "B", [m(13, 4)]], ["B", "C", [m(13, null)]]]);
  const rows = mapLeagueTable(teams, rounds, res, { bestOf: 1, win: 2, loss: 1 });
  const by = Object.fromEntries(rows.map((r) => [r.team, r]));
  assert.equal(by.A.points, 2); assert.equal(by.B.points, 1); assert.equal(by.C.points, 0);
  assert.equal(by.C.played, 0);
  assert.deepEqual(progress(rounds, res, 1), { done: 1, total: 3 });
});

test("the screen view shows map difference only for best of 3 or 5, and points are the highlighted column", () => {
  const teams = ["A", "B"], rounds = fixtures(teams);
  const rows = mapLeagueTable(teams, rounds, results(rounds, [["A", "B", [m(13, 3), m(13, 8)]]]), { ...DEFAULT_MAP_LEAGUE, bestOf: 3 });
  const v3 = mapLeagueView(rows, 3);
  assert.deepEqual(v3.d.head, ["#", "Team", "P", "W", "L", "Maps", "Rounds", "Pts"]);
  assert.deepEqual(v3.d.rows[0], ["1", "A", "1", "1", "0", "+2", "+15", "3"]);
  assert.equal(v3.d.strong, 7);
  assert.equal(v3.d.subtitle, "Best of 3");
  assert.deepEqual(mapLeagueView(rows, 1).d.head, ["#", "Team", "P", "W", "L", "Rounds", "Pts"]);
});
