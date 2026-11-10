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

// ---- double elimination ----
import { build, resolve, slots, isPlayable } from "../src/lib/doubleelim.ts";

/** Plays the whole bracket with the better seed (lower number) always winning. Returns the picks and how many real matches were played. */
function playOut(teams) {
  const b = build(teams);
  const picks = {};
  let played = 0;
  for (let pass = 0; pass < 200; pass++) {
    let moved = false;
    for (const m of b.matches) {
      if (m.id === "GF2" || picks[m.id] !== undefined) continue;
      const s = slots(b, m, picks);
      if (isPlayable(s)) { picks[m.id] = s[0].seed < s[1].seed ? 0 : 1; played++; moved = true; }
    }
    if (!moved) break;
  }
  return { b, picks, played };
}

test("double elimination: match counts follow 2n - 2 for powers of two, with the final", () => {
  for (const [n, size] of [[4, 4], [8, 8], [16, 16]]) {
    const b = build(Array.from({ length: n }, (_, i) => `T${i + 1}`));
    assert.equal(b.size, size);
    const ids = b.matches.map((m) => m.id);
    assert.equal(new Set(ids).size, ids.length, "match ids are unique");
    assert.equal(b.matches.filter((m) => m.bracket === "W").length, n - 1);
    assert.equal(b.matches.filter((m) => m.bracket === "L").length, n - 2);
    assert.equal(b.matches.filter((m) => m.bracket !== "F").length + 1, 2 * n - 2); // winners + losers + the first final; a reset final adds one more only if needed
  }
});

test("double elimination: every reference points at a real match, for any number of teams", () => {
  for (let n = 3; n <= 33; n++) {
    const b = build(Array.from({ length: n }, (_, i) => `T${i + 1}`));
    const ids = new Set(b.matches.map((m) => m.id));
    for (const m of b.matches) for (const r of [m.a, m.b]) if (r.t === "winner" || r.t === "loser") assert.ok(ids.has(r.of), `n=${n} ${m.id} refers to missing ${r.of}`);
  }
  assert.equal(build(["a", "b"]), null);
  assert.equal(build(Array.from({ length: 65 }, (_, i) => `T${i}`)), null);
});

test("double elimination: with the better seed always winning, exactly 2n - 2 matches are played and seed 1 wins", () => {
  for (let n = 3; n <= 20; n++) {
    const { b, picks, played } = playOut(Array.from({ length: n }, (_, i) => `T${i + 1}`));
    assert.equal(played, 2 * n - 2, `n=${n} should need ${2 * n - 2} matches, played ${played}`);
    const gf = b.matches.find((m) => m.id === "GF");
    assert.equal(picks.GF, 0, `n=${n}: the unbeaten team wins the first final`);
    const champ = resolve(b, { t: "winner", of: "GF" }, picks);
    assert.deepEqual([champ.kind, champ.seed], ["team", 1]);
    assert.ok(gf);
  }
});

test("double elimination: a team that loses once drops to the losers bracket, and a second loss ends its run", () => {
  const { b, picks } = playOut(["A", "B", "C", "D"]);
  // W1-1: A v D, W1-2: B v C. Losers D and C meet in L1-1.
  const l11 = slots(b, b.matches.find((m) => m.id === "L1-1"), picks);
  assert.deepEqual(l11.map((s) => s.name).sort(), ["C", "D"]);
  // The grand final is between the winners-bracket champion and the losers-bracket champion.
  const gf = slots(b, b.matches.find((m) => m.id === "GF"), picks);
  assert.equal(gf[0].name, "A");
  assert.equal(gf[1].name, "B"); // B lost once (to A in the winners final) and then won the losers bracket
});

test("double elimination: a bye leaves no phantom team and advances the other team", () => {
  const b = build(["A", "B", "C"]); // size 4, seed 4 is a bye
  const w11 = b.matches.find((m) => m.id === "W1-1");
  assert.deepEqual(slots(b, w11, {}).map((s) => s.kind), ["team", "bye"]);
  const w21 = slots(b, b.matches.find((m) => m.id === "W2-1"), {});
  assert.equal(w21[0].name, "A"); // seed 1 advances without playing
  assert.equal(slots(b, b.matches.find((m) => m.id === "L1-1"), {})[0].kind, "bye"); // nobody dropped from the bye match
});

test("double elimination: the reset final is needed only when the losers-bracket team wins the first final", () => {
  const { b, picks } = playOut(["A", "B", "C", "D"]);
  assert.equal(picks.GF, 0);
  const upset = { ...picks, GF: 1 };
  const gf2 = slots(b, b.matches.find((m) => m.id === "GF2"), upset);
  assert.ok(isPlayable(gf2));
  assert.equal(resolve(b, { t: "winner", of: "GF2" }, upset).kind, "tbd");
  assert.equal(resolve(b, { t: "winner", of: "GF2" }, { ...upset, GF2: 0 }).name, "A");
});
