// Run: node --import tsx --test tests/matches.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { groupByStage, isDone, matchCounts, nextMatchFor, opponentText, scoreText, stageLabel, standings, startText, statusLabel, teamNames, winnerOf } from "../src/lib/matches.ts";
import { brandCss } from "../src/lib/brand.ts";
import { PANELS, panelsFor } from "../src/components/app/panels.tsx";

let n = 0;
const m = (o) => ({ id: `m${++n}`, stage: "main", round: 1, slot: 1, a: "", b: "", status: "scheduled", scoreA: null, scoreB: null, winner: null, startsAt: null, nextId: null, nextSide: null, updatedAt: "", ...o });
const fin = (a, b, sa, sb, o = {}) => m({ a, b, scoreA: sa, scoreB: sb, status: "finished", ...o });

test("stage labels and status labels are plain words", () => {
  assert.equal(stageLabel("group:A"), "Group A");
  assert.equal(stageLabel("main"), "Matches");
  assert.equal(stageLabel("knockout"), "Knockout");
  assert.equal(stageLabel("playoffs"), "Playoffs");
  assert.equal(statusLabel("live"), "Live now");
  assert.equal(statusLabel("forfeit"), "Forfeit");
  assert.equal(statusLabel("nonsense"), "Scheduled");
});

test("groupByStage orders stages (groups, main, other, knockout), rounds and slots", () => {
  const g = groupByStage([
    m({ stage: "knockout", round: 1, slot: 1 }), m({ stage: "group:B", round: 2, slot: 1 }), m({ stage: "group:A", round: 2, slot: 2, id: "x2" }),
    m({ stage: "group:A", round: 1, slot: 1 }), m({ stage: "group:A", round: 2, slot: 1, id: "x1" }),
  ]);
  assert.deepEqual(g.map((s) => s.stage), ["group:A", "group:B", "knockout"]);
  assert.deepEqual(g[0].rounds.map((r) => r.round), [1, 2]);
  assert.deepEqual(g[0].rounds[1].matches.map((x) => x.id), ["x1", "x2"]);
  assert.equal(g[0].label, "Group A");
  assert.deepEqual(groupByStage([]), []);
});

test("winnerOf uses the stored winner, else the scores, and nothing before the match is done", () => {
  assert.equal(winnerOf(fin("A", "B", 2, 1)), "a");
  assert.equal(winnerOf(fin("A", "B", 1, 2)), "b");
  assert.equal(winnerOf(fin("A", "B", 1, 1)), "draw");
  assert.equal(winnerOf(fin("A", "B", 1, 2, { winner: "a" })), "a");
  assert.equal(winnerOf(m({ a: "A", b: "B", scoreA: 3, scoreB: 0 })), null);
  assert.equal(scoreText(fin("A", "B", 2, 1)), "2 - 1");
  assert.equal(scoreText(m()), "vs");
  assert.ok(isDone(fin("A", "B", 0, 0)) && !isDone(m({ status: "live" })));
});

test("standings: win 3, draw 1, loss 0, with the round-robin tie-breaks", () => {
  const s = standings([fin("Alpha", "Bravo", 2, 0), fin("Bravo", "Charlie", 1, 1), fin("Alpha", "Charlie", 0, 0), m({ a: "Alpha", b: "Delta" })]);
  assert.deepEqual(s.map((r) => [r.team, r.points, r.played]), [["Alpha", 4, 2], ["Charlie", 2, 2], ["Bravo", 1, 2], ["Delta", 0, 0]]);
  assert.equal(s[0].rank, 1);
  assert.equal(s[0].diff, 2);
});

test("standings tie-break: difference, then scores for, then name", () => {
  const s = standings([fin("B", "X", 3, 0), fin("A", "Y", 2, 0), fin("C", "Z", 4, 1)]);
  assert.deepEqual(s.slice(0, 3).map((r) => r.team), ["C", "B", "A"]); // all 3 points: diff +3, +3, +2; C and B tie on diff, C scored more
  const t = standings([fin("Q", "X", 1, 0), fin("P", "Y", 1, 0)]);
  assert.deepEqual(t.slice(0, 2).map((r) => r.team), ["P", "Q"]);
});

test("standings ignores names that differ only in case, empty seats and unplayed matches, and can be limited to one stage", () => {
  const s = standings([fin("alpha", "Bravo", 1, 0), fin("ALPHA ", "Charlie", 2, 0), m({ a: "", b: "Echo", status: "finished", scoreA: 1, scoreB: 0 }), m({ a: "Bravo", b: "Charlie", status: "live", scoreA: 1, scoreB: 0 })]);
  assert.equal(s.find((r) => r.team.toLowerCase() === "alpha").points, 6);
  assert.equal(s.length, 4); // Echo is named, so listed, but its match has an empty seat and is not counted
  assert.equal(s.find((r) => r.team === "Echo").played, 0);
  const g = standings([fin("A", "B", 1, 0, { stage: "group:A" }), fin("C", "D", 1, 0, { stage: "group:B" })], { stage: "group:A" });
  assert.deepEqual(g.map((r) => r.team).sort(), ["A", "B"]);
});

test("a forfeit without a score counts as 1-0 to the side that did not forfeit", () => {
  const s = standings([m({ a: "A", b: "B", status: "forfeit", winner: "b" }), m({ a: "C", b: "D", status: "finished" })]);
  assert.equal(s.find((r) => r.team === "B").points, 3);
  assert.equal(s.find((r) => r.team === "A").points, 0);
  assert.equal(s.find((r) => r.team === "C").played, 0); // finished with no scores: not counted
});

test("nextMatchFor: live first, then earliest start, then stage and round; none when done or absent", () => {
  const list = [
    fin("Alpha", "Bravo", 1, 0, { round: 1 }),
    m({ a: "Alpha", b: "Charlie", round: 3, slot: 1, id: "late" }),
    m({ a: "Delta", b: "alpha", round: 2, slot: 1, id: "mid" }),
    m({ a: "Echo", b: "Fox", round: 1, id: "other" }),
  ];
  assert.equal(nextMatchFor(list, "Alpha").id, "mid");
  assert.equal(nextMatchFor([...list, m({ a: "Alpha", b: "Zed", status: "live", round: 9, id: "now" })], "alpha").id, "now");
  const timed = [m({ a: "A", b: "B", startsAt: "2026-12-01T12:00:00Z", round: 2, id: "t2" }), m({ a: "A", b: "C", startsAt: "2026-12-01T10:00:00Z", round: 5, id: "t1" })];
  assert.equal(nextMatchFor(timed, "A").id, "t1");
  assert.equal(nextMatchFor(list, "Bravo"), null);
  assert.equal(nextMatchFor(list, ""), null);
  assert.equal(nextMatchFor(list, "Nobody"), null);
  assert.equal(opponentText(list[2], "Delta"), "vs alpha");
  assert.equal(opponentText(m({ a: "A", b: "" }), "A"), "opponent to be decided");
});

test("teamNames, matchCounts and startText", () => {
  assert.deepEqual(teamNames([m({ a: "A", b: "b" }), m({ a: "B", b: "" }), m({ a: " C ", b: "a" })]), ["A", "b", "C"]);
  assert.deepEqual(matchCounts([fin("A", "B", 1, 0), m({ status: "live" }), m()]), { total: 3, done: 1, live: 1, left: 2 });
  assert.equal(startText(m({ startsAt: "2026-12-01T10:30:00Z" }), { timeZone: "UTC" }), "10:30");
  assert.equal(startText(m()), "");
  assert.equal(startText(m({ startsAt: "junk" })), "");
});

test("brandCss keeps only safe hex colours", () => {
  assert.deepEqual(brandCss(null), {});
  assert.deepEqual(brandCss({ primary: "#112233", secondary: "red; background:url(x)" }), { "--brand-primary": "#112233" });
});

test("the panel registry has every contract id once, valid groups, loaders and roles", () => {
  const want = { run: ["scorer", "results", "ready", "stages", "runofshow"], share: ["leaderboard", "directory", "profiles", "overlay", "embed", "sponsorreport", "live", "report"], settings: ["reminders", "brand"] };
  for (const [g, ids] of Object.entries(want)) assert.deepEqual(PANELS.filter((p) => p.group === g).map((p) => p.id).sort(), [...ids].sort());
  assert.equal(new Set(PANELS.map((p) => p.id)).size, PANELS.length);
  for (const p of PANELS) { assert.equal(typeof p.load, "function"); assert.ok(p.title && p.blurb.endsWith(".")); assert.ok(p.roles.includes("owner") && p.roles.includes("editor")); }
  assert.ok(panelsFor("viewer").every((p) => p.roles.includes("viewer")));
  assert.ok(panelsFor("viewer").some((p) => p.id === "report"));
  assert.ok(!panelsFor("viewer").some((p) => p.id === "live"));
  assert.equal(panelsFor("owner", "settings").length, 2);
});
