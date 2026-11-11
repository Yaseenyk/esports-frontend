// Groups then knockout: splitting, fixtures, standings and tie-breaks, who goes through, and the cross-group knockout (property style).
import test from "node:test";
import assert from "node:assert/strict";
import {
  buildKnockout, clampSettings, defaultSettings, groupFixtures, groupMatches, groupName, groupsFromMatches, groupTablesView, knockoutView,
  maxGroups, playKnockout, qualifiers, splitGroups, standings, togglePick,
} from "../src/lib/stages.ts";

const names = (n) => Array.from({ length: n }, (_, i) => `Team ${String(i + 1).padStart(2, "0")}`);
const res = (a, b, scoreA, scoreB) => ({ a, b, scoreA, scoreB });

test("splitGroups: sizes differ by at most one for every N and G", () => {
  for (let n = 4; n <= 64; n++) for (let g = 2; g <= maxGroups(n); g++) for (const mode of ["deal", "snake"]) {
    const gs = splitGroups(names(n), g, mode);
    assert.equal(gs.length, g, `${n}/${g}`);
    const sizes = gs.map((x) => x.teams.length);
    assert.ok(Math.max(...sizes) - Math.min(...sizes) <= 1, `${n} teams, ${g} groups, ${mode}: ${sizes}`);
    assert.equal(sizes.reduce((a, b) => a + b, 0), n);
    assert.equal(new Set(gs.flatMap((x) => x.teams)).size, n, "every team exactly once");
    assert.deepEqual(gs.map((x) => x.name), Array.from({ length: g }, (_, i) => groupName(i)));
  }
});

test("splitGroups: deal goes round and round, snake reverses every row (pots)", () => {
  const t = names(8);
  assert.deepEqual(splitGroups(t, 4, "deal").map((g) => g.teams), [[t[0], t[4]], [t[1], t[5]], [t[2], t[6]], [t[3], t[7]]]);
  assert.deepEqual(splitGroups(t, 4, "snake").map((g) => g.teams), [[t[0], t[7]], [t[1], t[6]], [t[2], t[5]], [t[3], t[4]]]);
  // the top G teams (pot 1) are always in different groups when seeded by pots
  const pots = splitGroups(names(30), 6, "snake");
  assert.equal(new Set(pots.map((g) => g.teams[0])).size, 6);
  // an incomplete last pot: 10 teams in 4 groups, row 3 runs the same way as row 1, so teams 9 and 10 go to groups A and B
  const part = splitGroups(names(10), 4, "snake");
  assert.deepEqual(part.map((g) => g.teams.length), [3, 3, 2, 2]);
  assert.ok(part[0].teams.includes("Team 09") && part[1].teams.includes("Team 10"));
});

test("splitGroups: sanitises input (repeats, too few teams, too many groups, too many teams)", () => {
  assert.deepEqual(splitGroups(["A", "B", "C"], 2), []);
  assert.equal(splitGroups(["A", "a", "B", "C", "D"], 2).flatMap((g) => g.teams).length, 4);
  assert.equal(splitGroups(names(6), 8).length, 3, "no group smaller than two teams");
  assert.equal(splitGroups(names(80), 3).flatMap((g) => g.teams).length, 64);
  assert.equal(splitGroups(names(16), 20).length, 8);
  assert.equal(splitGroups(names(16), 1).length, 2);
});

test("settings: defaults and clamping stay inside what is possible", () => {
  for (let n = 4; n <= 64; n++) {
    const d = defaultSettings(n);
    assert.ok(d.groups >= 2 && d.groups <= maxGroups(n));
    assert.ok(d.advance >= 1 && d.advance <= Math.floor(n / d.groups));
  }
  assert.deepEqual(defaultSettings(16), { groups: 4, advance: 2, thirds: 0, mode: "deal" });
  const c = clampSettings(8, { groups: 4, advance: 4, thirds: 5, mode: "snake" });
  assert.equal(c.advance, 2);
  assert.equal(c.thirds, 0, "groups of two have no third place");
  assert.equal(clampSettings(24, { groups: 4, advance: 2, thirds: 9, mode: "deal" }).thirds, 3);
});

test("groupFixtures: everyone plays everyone once, no empty seat leaks out", () => {
  for (const size of [2, 3, 4, 5, 6, 7, 8, 9]) {
    const g = { name: "A", teams: names(size) };
    const rounds = groupFixtures(g);
    const pairs = rounds.flat().map((f) => [f.a, f.b].sort().join("|"));
    assert.equal(pairs.length, (size * (size - 1)) / 2);
    assert.equal(new Set(pairs).size, pairs.length);
    for (const f of rounds.flat()) { assert.ok(g.teams.includes(f.a) && g.teams.includes(f.b)); assert.notEqual(f.a, f.b); }
    for (const rd of rounds) { const used = rd.flatMap((f) => [f.a, f.b]); assert.equal(new Set(used).size, used.length, "no team twice in a round"); }
  }
});

test("groupMatches: match shape, stage names, rounds and slots counted from 1", () => {
  const gs = splitGroups(names(10), 2);
  const ms = groupMatches(gs);
  assert.equal(ms.length, 20);
  assert.deepEqual([...new Set(ms.map((m) => m.stage))], ["group:A", "group:B"]);
  assert.ok(ms.every((m) => m.round >= 1 && m.slot >= 1 && m.a && m.b));
  assert.equal(new Set(ms.map((m) => `${m.stage}|${m.round}|${m.slot}`)).size, ms.length);
});

test("standings: 3 for a win, 1 for a draw, 0 for a loss", () => {
  const rows = standings(["A", "B", "C"], [res("A", "B", 2, 0), res("B", "C", 1, 1), res("A", "C", 0, 3)]);
  assert.deepEqual(rows.map((r) => [r.team, r.points, r.played]), [["C", 4, 2], ["A", 3, 2], ["B", 1, 2]]);
  assert.deepEqual(rows.map((r) => r.rank), [1, 2, 3]);
  assert.equal(rows[0].diff, 3);
});

test("standings: a match counts only when both scores are in", () => {
  const rows = standings(["A", "B"], [res("A", "B", 3, null)]);
  assert.deepEqual(rows.map((r) => r.played), [0, 0]);
  assert.deepEqual(rows.map((r) => r.team), ["A", "B"], "no results: by name");
});

test("tie-break 1: score difference beats scores for", () => {
  // A and B both have 4 points. A scored more in total (3), B has the better difference (+3 against +1).
  const rows = standings(["A", "B", "C"], [res("A", "C", 3, 2), res("B", "C", 3, 0), res("A", "B", 0, 0)]);
  assert.deepEqual(rows.map((r) => [r.team, r.points]), [["B", 4], ["A", 4], ["C", 0]].map(([t, p]) => [t, p]));
  assert.ok(rows[0].diff > rows[1].diff && rows[0].for === rows[1].for);
});

test("tie-break 2: scores for when points and difference are level", () => {
  const rows = standings(["A", "B", "C", "D"], [res("A", "C", 3, 2), res("B", "D", 1, 0), res("A", "D", 0, 1), res("B", "C", 0, 0)]);
  // A: W 3-2, L 0-1 => 3 pts, diff 0, for 3. B: W 1-0, D 0-0 => 4 pts. D: L 0-1, W 1-0 => 3 pts diff 0, for 1.
  const a = rows.findIndex((r) => r.team === "A"), d = rows.findIndex((r) => r.team === "D");
  assert.ok(a < d, "A scored more for the same points and difference");
});

test("tie-break 3: head-to-head decides when points, difference and scores for are all equal", () => {
  // A: W 1-0 over B, L 0-1 to X, D 0-0 with Y => 4 points, diff 0, for 1. B: L, W 1-0 over Y, D 0-0 with X => 4 points, diff 0, for 1.
  const build = (ab) => standings(["A", "B", "X", "Y"], [res("A", "B", ab[0], ab[1]), res("A", "X", 0, 1), res("B", "Y", 1, 0), res("A", "Y", 0, 0), res("B", "X", 0, 0), res("X", "Y", 0, 0)]);
  const rows = build([1, 0]);
  const ia = rows.findIndex((r) => r.team === "A"), ib = rows.findIndex((r) => r.team === "B");
  assert.equal(rows[ia].points, rows[ib].points);
  assert.equal(rows[ia].diff, rows[ib].diff);
  assert.equal(rows[ia].for, rows[ib].for);
  assert.ok(ia < ib, "A beat B so A is ahead");
});

test("tie-break 4: name last, so the table never changes between runs", () => {
  const rows = standings(["Zed", "Amy", "Bob"], [res("Zed", "Amy", 1, 1), res("Amy", "Bob", 1, 1), res("Zed", "Bob", 1, 1)]);
  assert.deepEqual(rows.map((r) => r.team), ["Amy", "Bob", "Zed"]);
  assert.deepEqual(standings(["Bob", "Zed", "Amy"], [res("Zed", "Amy", 1, 1), res("Amy", "Bob", 1, 1), res("Zed", "Bob", 1, 1)]).map((r) => r.team), ["Amy", "Bob", "Zed"]);
});

test("qualifiers: top K of each group, seeded winners first then runners-up", () => {
  const gs = splitGroups(names(12), 3);
  const tables = gs.map((g) => ({ name: g.name, rows: standings(g.teams, groupFixtures(g).flat().map((f, i) => res(f.a, f.b, i % 3, (i + 1) % 2))) }));
  for (const k of [1, 2, 3, 4]) {
    const q = qualifiers(tables, k);
    assert.equal(q.length, 3 * k);
    assert.ok(q.every((x, i, a) => i === 0 || a[i - 1].place <= x.place), "places ascend");
    for (const t of tables) assert.equal(q.filter((x) => x.group === t.name).length, k);
  }
});

test("qualifiers: best third-placed teams come last and are the best of the next places", () => {
  const tables = [
    { name: "A", rows: standings(["a1", "a2", "a3"], [res("a1", "a2", 1, 0), res("a1", "a3", 1, 0), res("a2", "a3", 1, 0)]) },
    { name: "B", rows: standings(["b1", "b2", "b3"], [res("b1", "b2", 1, 0), res("b1", "b3", 1, 0), res("b2", "b3", 5, 0)]) },
    { name: "C", rows: standings(["c1", "c2", "c3"], [res("c1", "c2", 1, 0), res("c1", "c3", 1, 0), res("c2", "c3", 1, 1)]) },
  ];
  const q = qualifiers(tables, 1, 0);
  assert.equal(q.length, 3);
  const withThirds = qualifiers(tables, 2, 1);
  assert.equal(withThirds.length, 7);
  const last = withThirds[6];
  assert.equal(last.place, 3);
  assert.equal(last.team, "c3", "c3 has a point, the other third-placed teams have none");
  assert.equal(qualifiers(tables, 2, 99).length, 9, "cannot take more extras than there are groups");
  assert.equal(qualifiers(tables, 9).length, 9, "advance cannot be more than the smallest group");
  assert.deepEqual(qualifiers([], 2), []);
});

/** Shared checks for a built knockout. */
function checkBracket(ko, count, label) {
  const { matches } = ko;
  assert.equal(matches.length, count - 1, `${label}: a knockout of ${count} teams has ${count - 1} matches`);
  assert.equal(new Set(matches.map((m) => m.id)).size, matches.length, `${label}: ids unique`);
  assert.ok(matches.every((m) => /^[A-Za-z0-9._~-]{1,48}$/.test(m.id)), `${label}: ids are valid`);
  const byId = new Map(matches.map((m) => [m.id, m]));
  const finals = matches.filter((m) => !m.nextId);
  assert.equal(finals.length, 1, `${label}: exactly one final`);
  assert.equal(finals[0].nextSide, null);
  for (const m of matches) {
    assert.equal(m.nextId === null, m.nextSide === null);
    if (m.nextId) assert.ok(byId.has(m.nextId), `${label}: nextId exists`);
    if (m.nextId) assert.ok(byId.get(m.nextId).round > m.round, `${label}: winners move forward`);
  }
  // every match reaches the final
  for (const m of matches) { let c = m, hops = 0; while (c.nextId && hops++ < 20) c = byId.get(c.nextId); assert.equal(c.id, finals[0].id, `${label}: ${m.id} reaches the final`); }
  // every slot is filled exactly once: from a name or from exactly one feeder
  for (const m of matches) for (const side of ["a", "b"]) {
    const feeders = matches.filter((f) => f.nextId === m.id && f.nextSide === side).length;
    const named = m[side] !== "";
    assert.equal(feeders + (named ? 1 : 0), 1, `${label}: ${m.id} side ${side} is filled once`);
  }
  // slots numbered 1..n in each round
  for (const r of new Set(matches.map((m) => m.round))) assert.deepEqual(matches.filter((m) => m.round === r).map((m) => m.slot).sort((x, y) => x - y), matches.filter((m) => m.round === r).map((_, i) => i + 1));
}

/** Qualifier list for G groups of the given size, K advancing and E extra. */
function quals(G, perGroup, K, E = 0) {
  const gs = splitGroups(names(G * perGroup), G);
  const tables = gs.map((g) => ({ name: g.name, rows: standings(g.teams, []) }));
  return qualifiers(tables, K, E);
}

test("knockout: every team appears exactly once and the counts are right, for every sensible setup", () => {
  let checked = 0;
  for (let G = 2; G <= 8; G++) for (let per = 2; per <= 8; per++) for (let K = 1; K <= Math.min(4, per); K++) for (let E = 0; E <= (per > K ? G - 1 : 0); E += Math.max(1, Math.floor(G / 2))) {
    const q = quals(G, per, K, E);
    if (q.length < 2) continue;
    const ko = buildKnockout(q, "t");
    const label = `G${G} per${per} K${K} E${E}`;
    checkBracket(ko, q.length, label);
    const placed = ko.matches.flatMap((m) => [m.a, m.b]).filter(Boolean);
    assert.deepEqual([...placed].sort(), q.map((x) => x.team).sort(), `${label}: every qualifier placed once`);
    assert.equal(ko.size, 2 ** Math.ceil(Math.log2(q.length)));
    assert.equal(ko.byes, ko.size - q.length);
    assert.equal(ko.roundNames.length, Math.log2(ko.size));
    assert.equal(ko.roundNames.at(-1), "Final");
    checked++;
  }
  assert.ok(checked > 200);
});

test("knockout: no same-group first-round match whenever that can be avoided", () => {
  let checked = 0;
  for (let G = 2; G <= 8; G++) for (let per = 2; per <= 8; per++) for (let K = 1; K <= Math.min(4, per); K++) for (let E = 0; E <= (per > K ? G - 1 : 0); E++) {
    const q = quals(G, per, K, E);
    if (q.length < 2) continue;
    const ko = buildKnockout(q, "t");
    const group = new Map(q.map((x) => [x.team, x.group]));
    const firstRound = ko.matches.filter((m) => m.round === 1);
    const clashes = firstRound.filter((m) => group.get(m.a) === group.get(m.b)).length;
    assert.equal(clashes, ko.sameGroupFirstRound, "the reported count is true");
    // Avoidable when no group has more than half of the teams that actually play in round 1.
    const playing = firstRound.flatMap((m) => [m.a, m.b]);
    const counts = new Map();
    for (const t of playing) counts.set(group.get(t), (counts.get(group.get(t)) ?? 0) + 1);
    const avoidable = Math.max(0, ...counts.values()) <= playing.length / 2;
    if (avoidable) assert.equal(clashes, 0, `G${G} per${per} K${K} E${E} has ${clashes} same-group first-round matches`);
    checked++;
  }
  assert.ok(checked > 200);
});

test("knockout: the classic cases come out as A1 v B2 and B1 v A2", () => {
  const q = quals(2, 4, 2);
  const ko = buildKnockout(q, "t");
  const first = ko.matches.filter((m) => m.round === 1).map((m) => `${m.a}|${m.b}`);
  assert.equal(first.length, 2);
  const grp = (t) => q.find((x) => x.team === t).group;
  for (const m of ko.matches.filter((x) => x.round === 1)) assert.notEqual(grp(m.a), grp(m.b));
  // four groups, top two: the eight teams play four first-round matches, each between two different groups
  const q4 = quals(4, 4, 2);
  const k4 = buildKnockout(q4, "t");
  assert.equal(k4.matches.filter((m) => m.round === 1).length, 4);
  assert.equal(k4.sameGroupFirstRound, 0);
  assert.deepEqual(k4.roundNames, ["Quarter-finals", "Semi-finals", "Final"]);
});

test("knockout: odd group counts, byes and non power-of-two fields", () => {
  const q = quals(3, 4, 2); // 6 teams
  const ko = buildKnockout(q, "t");
  assert.equal(ko.size, 8);
  assert.equal(ko.byes, 2);
  checkBracket(ko, 6, "3x2");
  assert.equal(ko.matches.filter((m) => m.round === 1).length, 2, "two byes leave two round-1 matches");
  // the two best seeds (group winners) have the byes: they are named in round 2
  const r2 = ko.matches.filter((m) => m.round === 2).flatMap((m) => [m.a, m.b]).filter(Boolean);
  assert.equal(r2.length, 2);
  assert.ok(r2.every((t) => q.find((x) => x.team === t).place === 1));
  // 5 groups: ten qualifiers
  checkBracket(buildKnockout(quals(5, 4, 2), "t"), 10, "5x2");
  // a field of two and three
  const two = buildKnockout(quals(2, 2, 1), "t");
  assert.equal(two.matches.length, 1);
  assert.equal(two.roundNames[0], "Final");
  assert.equal(two.matches[0].nextId, null);
  const three = buildKnockout(quals(3, 2, 1), "t");
  checkBracket(three, 3, "three");
  assert.equal(three.byes, 1);
  // nobody to play
  assert.equal(buildKnockout([], "t").matches.length, 0);
  assert.equal(buildKnockout(quals(2, 2, 1).slice(0, 1), "t").matches.length, 0);
});

test("knockout: ids use the prefix and fit the server's 48 characters", () => {
  const ko = buildKnockout(quals(8, 8, 4), "abcd1234efgh");
  assert.ok(ko.matches.every((m) => m.id.startsWith("abcd1234efgh-") && m.id.length <= 48));
  checkBracket(ko, 32, "8x4");
});

test("knockout: the result is repeatable (same input, same bracket)", () => {
  const q = quals(6, 5, 3, 2);
  assert.deepEqual(buildKnockout(q, "t"), buildKnockout(q, "t"));
});

test("playKnockout: winners move on, one champion, changing a pick clears what depended on it", () => {
  const q = quals(4, 4, 2);
  const ko = buildKnockout(q, "t");
  let picks = {};
  for (const r of [1, 2, 3]) {
    for (const m of playKnockout(ko.matches, picks).matches.filter((x) => x.round === r)) { assert.ok(m.a && m.b, "both teams known before the match"); picks = togglePick(ko.matches, picks, m.id, "a"); }
  }
  const done = playKnockout(ko.matches, picks);
  assert.ok(done.champion, "there is a champion");
  assert.equal(done.matches.filter((m) => m.winner).length, 7);
  // pick the other team in a first-round match: later picks that depended on it go
  const first = ko.matches.find((m) => m.round === 1);
  const changed = togglePick(ko.matches, picks, first.id, "b");
  assert.ok(Object.keys(changed).length < Object.keys(picks).length + 1);
  assert.equal(playKnockout(ko.matches, changed).champion, null);
  // tapping the same team again takes it back
  assert.equal(togglePick(ko.matches, { [first.id]: "a" }, first.id, "a")[first.id], undefined);
  // a pick for a match whose teams are not known yet is ignored
  const final = ko.matches.find((m) => !m.nextId);
  assert.equal(playKnockout(ko.matches, { [final.id]: "a" }).champion, null);
});

test("groupsFromMatches: rebuilds groups, results and tables from the match model", () => {
  const gs = splitGroups(names(8), 2);
  const planned = groupMatches(gs).map((m, i) => ({ ...m, status: i < 3 ? "finished" : "scheduled", scoreA: i < 3 ? 2 : null, scoreB: i < 3 ? 1 : null, winner: i < 3 ? "a" : null }));
  const other = { stage: "knockout", round: 1, slot: 1, a: "x", b: "y", status: "scheduled", scoreA: null, scoreB: null };
  const states = groupsFromMatches([...planned.reverse(), other]);
  assert.deepEqual(states.map((s) => s.group.name), ["A", "B"]);
  assert.equal(states[0].group.teams.length, 4);
  assert.equal(states[0].total + states[1].total, 12);
  assert.equal(states[0].done + states[1].done, 3);
  assert.equal(states[0].rows.length, 4);
  // forfeit without scores counts as a 1-0 win
  const f = groupsFromMatches([{ stage: "group:A", round: 1, slot: 1, a: "P", b: "Q", status: "forfeit", scoreA: null, scoreB: null, winner: "b" }]);
  assert.deepEqual(f[0].rows.map((r) => [r.team, r.points]), [["Q", 3], ["P", 0]]);
});

test("screens: bracket and group tables payloads", () => {
  const q = quals(2, 4, 2);
  const ko = buildKnockout(q, "t");
  const v = knockoutView(ko, {});
  assert.equal(v.v, "bracket");
  assert.equal(v.d.sections[0].rounds.length, 2);
  assert.equal(v.d.champion, undefined);
  const gs = splitGroups(names(6), 2);
  const t = groupTablesView(gs.map((g) => ({ name: g.name, rows: standings(g.teams, []) })));
  assert.equal(t.v, "table");
  assert.equal(t.d.rows.length, 6);
  assert.equal(t.d.rows[0].length, t.d.head.length);
});
