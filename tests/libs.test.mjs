import test from "node:test";
import assert from "node:assert/strict";
import { EXAMPLE_SCALE, matchPoints, parsePlacement, standings } from "../src/lib/points.ts";
import { BYE, DEFAULT_POINTS, fixtures, matchCount, table } from "../src/lib/roundrobin.ts";
import { buildSchedule, formatTime, parseTime, summary } from "../src/lib/schedule.ts";
import { build, champion, dependents, isPlayable, setPick, slots } from "../src/lib/doubleelim.ts";
import { seedOrder, uniqueTeams } from "../src/lib/seeding.ts";
import { decode, encode, lookFrom, remaining, secondsUntil, slotNow, slotTime, validate } from "../src/lib/display.ts";

// A small seeded random generator, so a failing property test fails the same way every time.
const rng = (seed) => () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
const names = (n) => Array.from({ length: n }, (_, i) => `Team ${i + 1}`);

// ---------- seeding ----------

test("seedOrder: a permutation of 1..n where seeds 1 and 2 can only meet in the final", () => {
  for (const n of [2, 4, 8, 16, 32, 64]) {
    const o = seedOrder(n);
    assert.deepEqual([...o].sort((a, b) => a - b), Array.from({ length: n }, (_, i) => i + 1));
    if (n >= 4) {
      assert.ok(o.indexOf(1) < n / 2 && o.indexOf(2) >= n / 2, `n=${n}: 1 and 2 are in opposite halves`);
      assert.equal(o[1], n, "seed 1 meets the lowest seed first");
    }
  }
});

test("uniqueTeams: trims, collapses spaces, drops blanks and repeats (any capitals), keeps order and the first spelling", () => {
  assert.deepEqual(uniqueTeams(["  Alpha ", "", "alpha", "ALPHA", "Be   ta", "be ta", "\t", "Gamma"]), ["Alpha", "Be ta", "Gamma"]);
  assert.deepEqual(uniqueTeams(["a", "b", "c", "d"], 2), ["a", "b"]);
  assert.deepEqual(uniqueTeams([]), []);
});

test("uniqueTeams: emoji, Devanagari and very long names pass through untouched", () => {
  const long = "x".repeat(500);
  assert.deepEqual(uniqueTeams(["\u{1F525} Fire", "कोंकण किंग्स", long, long]), ["\u{1F525} Fire", "कोंकण किंग्स", long]);
});

// ---------- points ----------

test("points: a hand-worked example (placement points + kills) and the order", () => {
  // scale 10,6,5,4,3,2,1,1 and 1 per kill
  const teams = [
    { name: "A", matches: [{ placement: 1, kills: 5 }, { placement: 4, kills: 2 }] }, // 10+5 + 4+2 = 21
    { name: "B", matches: [{ placement: 2, kills: 6 }, { placement: 1, kills: 4 }] }, // 6+6 + 10+4 = 26
    { name: "C", matches: [{ placement: 9, kills: 3 }, { placement: 12, kills: 0 }] }, // beyond the scale: 0 + 3 = 3
  ];
  const s = standings(teams, EXAMPLE_SCALE);
  assert.deepEqual(s.map((r) => [r.name, r.total, r.rank]), [["B", 26, 1], ["A", 21, 2], ["C", 3, 3]]);
  assert.deepEqual(s[0].perMatch, [12, 14]);
  assert.equal(s[0].killPoints, 10);
  assert.equal(s[0].placementPoints, 16);
});

test("points: a blank, negative or NaN kill count counts as zero and never poisons a total", () => {
  const t = [{ name: "A", matches: [{ placement: 1, kills: NaN }, { placement: 2, kills: -4 }, { placement: 3, kills: Infinity }] }];
  const [r] = standings(t, EXAMPLE_SCALE);
  assert.equal(Number.isFinite(r.total), true);
  assert.equal(r.total, 10 + 6 + 5);
  assert.equal(matchPoints({ placement: 0, kills: 2 }, EXAMPLE_SCALE), 2, "placement 0 (not entered) scores no placement points");
});

test("points: a match with no placement entered does not win the last-match tie-break", () => {
  // Equal totals, wins and kills. B did not enter the last placement (0), so A, who finished 3rd, must rank first.
  const scale = { placement: [5, 3, 2], perKill: 0 };
  const teams = [
    { name: "B", matches: [{ placement: 3, kills: 0 }, { placement: 0, kills: 0 }] },
    { name: "A", matches: [{ placement: 3, kills: 0 }, { placement: 3, kills: 0 }] },
  ];
  const s = standings(teams, scale);
  assert.equal(s[0].name, "A", "a placed finish beats an empty one");
});

test("points: ties are flagged, ranks are 1..n, and the order does not depend on the input order", () => {
  const r = rng(7);
  const base = names(10).map((name) => ({ name, matches: Array.from({ length: 4 }, () => ({ placement: 1 + Math.floor(r() * 12), kills: Math.floor(r() * 6) })) }));
  const a = standings(base, EXAMPLE_SCALE);
  const b = standings([...base].reverse(), EXAMPLE_SCALE);
  assert.deepEqual(a.map((x) => x.name), b.map((x) => x.name));
  assert.deepEqual(a.map((x) => x.rank), a.map((_, i) => i + 1));
  for (let i = 1; i < a.length; i++) assert.ok(a[i - 1].total >= a[i].total, "totals never increase down the table");
  for (const row of a) assert.equal(row.tied, a.some((o) => o !== row && o.total === row.total));
});

test("points: no teams, and teams with no matches, give a table without errors", () => {
  assert.deepEqual(standings([], EXAMPLE_SCALE), []);
  const [x] = standings([{ name: "Solo", matches: [] }], EXAMPLE_SCALE);
  assert.equal(x.total, 0);
  assert.equal(x.lastPlacement, null);
});

test("points: scale text parsing accepts commas and spaces, refuses junk, negatives and endless lists", () => {
  assert.deepEqual(parsePlacement("10, 6 5,4"), [10, 6, 5, 4]);
  assert.deepEqual(parsePlacement("12.5, 0"), [12.5, 0]);
  for (const bad of ["", "   ", "a,b", "5,-1", "5,,x", "1e999", Array(101).fill("1").join(",")]) assert.equal(parsePlacement(bad), null, JSON.stringify(bad.slice(0, 12)));
});

// ---------- round robin ----------

test("round robin: property check for 2 to 21 teams, single and double", () => {
  for (let n = 2; n <= 21; n++) {
    for (const double of [false, true]) {
      const t = names(n);
      const rounds = fixtures(t, double);
      const per = n % 2 ? n : n - 1;
      assert.equal(rounds.length, per * (double ? 2 : 1), `n=${n} rounds`);
      const real = rounds.flat().filter((f) => f.a !== BYE && f.b !== BYE);
      assert.equal(real.length, matchCount(n, double), `n=${n} matches`);
      const seen = new Map();
      for (const f of real) { const k = [f.a, f.b].sort().join("|"); seen.set(k, (seen.get(k) ?? 0) + 1); }
      assert.equal(seen.size, (n * (n - 1)) / 2, `n=${n} every pair appears`);
      for (const c of seen.values()) assert.equal(c, double ? 2 : 1, `n=${n} each pair ${double ? "twice" : "once"}`);
      for (const rd of rounds) {
        const who = rd.flatMap((f) => [f.a, f.b]).filter((x) => x !== BYE);
        assert.equal(new Set(who).size, who.length, `n=${n} nobody twice in a round`);
        assert.equal(who.length, n, `n=${n} every team is listed once per round (the one with the bye as "has a bye")`);
        assert.equal(rd.filter((f) => f.a !== BYE && f.b !== BYE).length, Math.floor(n / 2), `n=${n} matches in a round`);
        assert.ok(rd.every((f) => f.a !== f.b), "nobody plays themselves");
      }
      if (double) { // the second half repeats the first with sides swapped
        const half = rounds.length / 2;
        for (let r = 0; r < half; r++) assert.deepEqual(rounds[r + half].map((f) => [f.b, f.a]), rounds[r].map((f) => [f.a, f.b]));
      }
    }
  }
});

test("round robin: no team is stuck on the same side every time (home and away is spread)", () => {
  for (const n of [6, 8, 10]) {
    const first = new Map();
    for (const rd of fixtures(names(n))) for (const f of rd) first.set(f.a, (first.get(f.a) ?? 0) + 1);
    const counts = names(n).map((t) => first.get(t) ?? 0);
    assert.ok(Math.max(...counts) - Math.min(...counts) <= 1, `n=${n}: ${counts.join(",")}`);
  }
});

test("round robin: duplicate names (any capitals), blanks and spaces are cleaned, so nobody plays themselves", () => {
  const rounds = fixtures(["  A ", "a", "B", "", "b", "C"]);
  const teams = new Set(rounds.flat().flatMap((f) => [f.a, f.b]).filter((x) => x !== BYE));
  assert.deepEqual([...teams].sort(), ["A", "B", "C"]);
  assert.equal(rounds.flat().filter((f) => f.a !== BYE && f.b !== BYE).length, 3);
  assert.deepEqual(fixtures(["Only"]), []);
  assert.deepEqual(fixtures([]), []);
  assert.deepEqual(fixtures(["x", "X", " x "]), []);
});

test("round robin: a team really called Bye is a team, not an empty seat", () => {
  const rounds = fixtures(["Bye", "Alpha", "Gamma"]);
  const real = rounds.flat().filter((f) => f.a !== BYE && f.b !== BYE);
  assert.equal(real.length, 3, "three real matches for three teams");
  assert.ok(real.some((f) => f.a === "Bye" || f.b === "Bye"));
  const rows = table(["Bye", "Alpha", "Gamma"], rounds, rounds.map((rd) => rd.map(() => ({ a: 1, b: 0 }))));
  assert.equal(rows.reduce((n, r) => n + r.played, 0), 6);
});

test("round robin: 200 pasted names, emoji and very long names do not break the maths", () => {
  const big = Array.from({ length: 200 }, (_, i) => `Team ${i % 150}`); // 150 distinct, 50 repeats
  const rounds = fixtures(big);
  assert.equal(rounds.length, 149);
  assert.equal(rounds.flat().length, (150 * 149) / 2);
  const odd = ["\u{1F525} Fire", "\u{1F4A7} Water", "x".repeat(300)];
  assert.equal(fixtures(odd).flat().filter((f) => f.a !== BYE && f.b !== BYE).length, 3);
});

test("round robin table: wins, draws, points, difference, ranks and an unfilled score are handled", () => {
  const t = ["A", "B", "C"];
  const rounds = fixtures(t);
  const real = rounds.flat().filter((f) => f.a !== BYE && f.b !== BYE);
  // A beats B 2-0, B draws C 1-1, C vs A not played yet.
  const scores = rounds.map((rd) => rd.map((f) => {
    const k = [f.a, f.b].sort().join("");
    if (k === "AB") return f.a === "A" ? { a: 2, b: 0 } : { a: 0, b: 2 };
    if (k === "BC") return { a: 1, b: 1 };
    return { a: null, b: 5 }; // half filled counts as not played
  }));
  assert.equal(real.length, 3);
  const rows = table(t, rounds, scores, DEFAULT_POINTS);
  const by = Object.fromEntries(rows.map((r) => [r.team, r]));
  assert.deepEqual([by.A.points, by.B.points, by.C.points], [3, 1, 1]);
  assert.deepEqual([by.A.played, by.B.played, by.C.played], [1, 2, 1]);
  assert.equal(by.A.diff, 2);
  assert.equal(by.B.diff, -2);
  assert.equal(rows[0].team, "A");
  assert.deepEqual(rows.map((r) => r.rank), [1, 2, 3]);
  assert.equal(rows[1].team, "C", "C beats B on difference (0 against -2)");
});

test("round robin table: custom points and an empty field", () => {
  const rounds = fixtures(["A", "B"]);
  const rows = table(["A", "B"], rounds, [[{ a: 0, b: 1 }]], { win: 2, draw: 0, loss: -1 });
  assert.equal(rows.find((r) => r.team === "B").points, 2);
  assert.equal(rows.find((r) => r.team === "A").points, -1);
  assert.deepEqual(table([], [], []), []);
});

// ---------- schedule ----------

const base = { start: "10:00", matches: 19, duration: 40, gap: 10, lobbies: 4, breakEvery: 3, breakLength: 30 };
const clockMinutes = (label) => { const m = /^(\d\d):(\d\d)(?: \(\+(\d+)d\))?$/.exec(label); return Number(m[3] ?? 0) * 1440 + Number(m[1]) * 60 + Number(m[2]); };

test("schedule: times parse and print, including past midnight", () => {
  assert.equal(parseTime("00:00"), 0);
  assert.equal(parseTime("23:59"), 1439);
  assert.equal(parseTime(" 9:05 "), 545);
  for (const bad of ["24:00", "12:60", "", "ab", "1200", "-1:00", "12:5"]) assert.equal(parseTime(bad), null, bad);
  assert.equal(formatTime(1440), "00:00 (+1d)");
  assert.equal(formatTime(1440 + 70), "01:10 (+1d)");
  assert.equal(formatTime(2 * 1440 + 5), "00:05 (+2d)");
});

test("schedule: crossing midnight keeps order and labels the next day", () => {
  const slots = buildSchedule({ start: "23:00", matches: 4, duration: 30, gap: 10, lobbies: 1, breakEvery: 0, breakLength: 0 });
  assert.deepEqual(slots.map((s) => [s.start, s.end]), [["23:00", "23:30"], ["23:40", "00:10 (+1d)"], ["00:20 (+1d)", "00:50 (+1d)"], ["01:00 (+1d)", "01:30 (+1d)"]]);
  assert.equal(summary({ start: "23:00", matches: 4, duration: 30, gap: 10, lobbies: 1, breakEvery: 0, breakLength: 0 }, slots).finish, "01:30 (+1d)");
});

test("schedule: property check, no overlaps, strictly ordered, every match once, the summary agrees", () => {
  const r = rng(11);
  for (let k = 0; k < 300; k++) {
    const i = { start: `${String(Math.floor(r() * 24)).padStart(2, "0")}:${String(Math.floor(r() * 60)).padStart(2, "0")}`, matches: 1 + Math.floor(r() * 60), duration: 1 + Math.floor(r() * 90), gap: Math.floor(r() * 30), lobbies: 1 + Math.floor(r() * 8), breakEvery: Math.floor(r() * 5), breakLength: Math.floor(r() * 60) };
    const slots = buildSchedule(i);
    assert.ok(slots, JSON.stringify(i));
    const flat = slots.flatMap((s) => s.matches);
    assert.deepEqual(flat, Array.from({ length: i.matches }, (_, n) => n + 1), "every match exactly once, in order");
    assert.ok(slots.every((s) => s.matches.length >= 1 && s.matches.length <= i.lobbies));
    let prevEnd = -Infinity;
    for (const s of slots) {
      const a = clockMinutes(s.start), b = clockMinutes(s.end);
      assert.equal(b - a, i.duration, "each slot lasts the duration");
      assert.ok(a >= prevEnd + (prevEnd === -Infinity ? 0 : 0) && (prevEnd === -Infinity || a >= prevEnd + i.gap), `no overlap: ${JSON.stringify(i)}`);
      prevEnd = b + s.breakAfter;
    }
    assert.equal(slots[slots.length - 1].breakAfter, 0, "no break after the last slot");
    const sum = summary(i, slots);
    assert.equal(sum.finish, slots[slots.length - 1].end);
    assert.equal(sum.totalMinutes, clockMinutes(slots[slots.length - 1].end) - parseTime(i.start));
  }
});

test("schedule: a longer break lands after every Nth slot and only when more matches follow", () => {
  const slots = buildSchedule({ ...base, matches: 12, lobbies: 4 }); // exactly 3 slots, the 3rd would break but nothing follows
  assert.equal(slots.length, 3);
  assert.deepEqual(slots.map((s) => s.breakAfter), [0, 0, 0]);
  const more = buildSchedule({ ...base, matches: 13 });
  assert.equal(more[2].breakAfter, 30);
  assert.equal(clockMinutes(more[3].start) - clockMinutes(more[2].end), 10 + 30, "gap plus break");
});

test("schedule: bad input is refused, extremes work", () => {
  for (const bad of [{ start: "" }, { matches: 0 }, { matches: 501 }, { duration: 0 }, { lobbies: 0 }, { lobbies: 101 }, { gap: -1 }, { matches: 1.5 }, { duration: NaN }, { breakEvery: -1 }]) assert.equal(buildSchedule({ ...base, ...bad }), null, JSON.stringify(bad));
  assert.equal(buildSchedule({ ...base, matches: 500, lobbies: 1 }).length, 500);
  assert.equal(buildSchedule({ ...base, matches: 1, lobbies: 100 }).length, 1);
});

// ---------- double elimination ----------

/** Plays a whole bracket. `choose(a, b)` returns 0 or 1. Returns the picks and how many matches were played. */
function play(b, choose) {
  const picks = {};
  let played = 0;
  for (let guard = 0; guard < 1000; guard++) {
    let moved = false;
    for (const m of b.matches) {
      if (picks[m.id] !== undefined) continue;
      if (m.id === "GF2" && picks.GF !== 1) continue; // the reset is only played when the losers-bracket team wins the first final
      const s = slots(b, m, picks);
      if (!isPlayable(s)) continue;
      picks[m.id] = choose(s[0], s[1], m);
      played++; moved = true;
    }
    if (!moved) break;
  }
  return { picks, played };
}

test("double elimination: refuses fewer than 3 or more than 64 teams, ignores blanks and repeats", () => {
  assert.equal(build(["A", "B"]), null);
  assert.equal(build(["A", "B", "b", " ", ""]), null, "repeats do not count as extra teams");
  assert.equal(build(names(65)), null);
  assert.ok(build(names(64)));
  assert.ok(build(["A", "B", "C", "", "c"]));
});

test("double elimination: for every size 3 to 64, every real match is reachable and exactly one champion emerges after 2n-2 or 2n-1 matches", () => {
  for (let n = 3; n <= 64; n++) {
    const b = build(names(n));
    assert.equal(b.size, 2 ** Math.ceil(Math.log2(n)));
    // top seed always wins: the winners-bracket champion wins the first final, so no reset
    const top = play(b, (x, y) => (x.seed <= y.seed ? 0 : 1));
    assert.equal(top.played, 2 * n - 2, `n=${n} top seeds winning plays 2n-2`);
    assert.equal(champion(b, top.picks)?.seed, 1, `n=${n} seed 1 wins`);
    // the losers-bracket team always wins the first final: a reset is needed
    const upset = play(b, (x, y, m) => (m.id === "GF" ? 1 : x.seed <= y.seed ? 0 : 1));
    assert.equal(upset.played, 2 * n - 1, `n=${n} with a reset plays 2n-1`);
    assert.ok(champion(b, upset.picks), `n=${n} the reset gives a champion`);
    // Nothing is left unplayed that could be played: every match with two real teams has a result
    for (const m of b.matches) {
      const s = slots(b, m, upset.picks);
      if (isPlayable(s)) assert.notEqual(upset.picks[m.id], undefined, `n=${n} ${m.id} reachable and played`);
    }
  }
});

test("double elimination: random results, every team loses at most twice and exactly one team is unbeaten-or-champion", () => {
  const r = rng(5);
  for (const n of [3, 5, 6, 7, 9, 12, 17, 24, 33, 63, 64]) {
    for (let k = 0; k < 5; k++) {
      const b = build(names(n));
      const { picks, played } = play(b, () => (r() < 0.5 ? 0 : 1));
      assert.ok(played === 2 * n - 2 || played === 2 * n - 1, `n=${n} played ${played}`);
      const losses = new Map();
      for (const m of b.matches) {
        const p = picks[m.id];
        if (p === undefined) continue;
        const s = slots(b, m, picks);
        const loser = s[p === 0 ? 1 : 0];
        losses.set(loser.name, (losses.get(loser.name) ?? 0) + 1);
      }
      for (const [name, c] of losses) assert.ok(c <= 2, `${name} lost ${c} times`);
      const champ = champion(b, picks);
      assert.ok(champ, `n=${n} has a champion`);
      assert.ok((losses.get(champ.name) ?? 0) <= 1, "the champion lost at most once");
      assert.equal([...losses.values()].filter((c) => c === 2).length, n - 1, `n=${n}: everyone but the champion lost twice`);
    }
  }
});

test("double elimination: 3, 5 and 6 teams give the right byes and sizes", () => {
  for (const [n, size, byes] of [[3, 4, 1], [5, 8, 3], [6, 8, 2], [8, 8, 0]]) {
    const b = build(names(n));
    assert.equal(b.size, size);
    const first = b.matches.filter((m) => m.bracket === "W" && m.round === 1);
    const byeCount = first.reduce((c, m) => c + (m.a.t === "bye" ? 1 : 0) + (m.b.t === "bye" ? 1 : 0), 0);
    assert.equal(byeCount, byes, `n=${n}`);
    assert.ok(first.every((m) => !(m.a.t === "bye" && m.b.t === "bye")), "never two byes in one match");
    const seeds = first.flatMap((m) => [m.a, m.b]).filter((x) => x.t === "team").map((x) => x.seed).sort((a, b) => a - b);
    assert.deepEqual(seeds, Array.from({ length: n }, (_, i) => i + 1));
  }
});

test("double elimination: duplicate names are treated as one team, so a seed can never meet itself", () => {
  const b = build(["A", "a", "B", "C", "c"]);
  assert.ok(b);
  const { picks } = play(b, (x, y) => (x.seed <= y.seed ? 0 : 1));
  for (const m of b.matches) { const [x, y] = slots(b, m, picks); if (x.kind === "team" && y.kind === "team") assert.notEqual(x.name, y.name); }
});

test("double elimination: changing an early result clears every later result built on it, so none can point at a different team", () => {
  const b = build(names(8));
  let { picks } = play(b, (x, y) => (x.seed <= y.seed ? 0 : 1));
  const before = Object.keys(picks).length;
  assert.equal(before, 14);
  const next = setPick(b, picks, "W1-1", 1); // seed 8 "beats" seed 1
  assert.equal(next["W1-1"], 1);
  for (const id of dependents(b, "W1-1")) assert.equal(next[id], undefined, `${id} should be cleared`);
  assert.equal(next["W1-2"], 0, "an unrelated match keeps its result");
  assert.equal(next["W1-4"], 0);
  assert.equal(champion(b, next), null, "no champion while the final depends on a cleared result");
  // taking a result back clears the same things
  const taken = setPick(b, picks, "W2-1", undefined);
  assert.equal(taken["W2-1"], undefined);
  assert.equal(taken["GF"], undefined);
  // setting the same result again changes nothing
  assert.equal(setPick(b, picks, "W1-1", 0), picks);
});

test("double elimination: the reset final depends on the first final and on both bracket champions", () => {
  const b = build(names(4));
  assert.ok(dependents(b, "GF").includes("GF2"));
  assert.ok(dependents(b, "W2-1").includes("GF2"));
  assert.ok(dependents(b, "L2-1").includes("GF2"));
  let { picks } = play(b, (x, y, m) => (m.id === "GF" ? 1 : x.seed <= y.seed ? 0 : 1));
  assert.notEqual(picks.GF2, undefined);
  picks = setPick(b, picks, "GF", 0);
  assert.equal(picks.GF2, undefined, "switching the first final clears the stale reset result");
  assert.ok(champion(b, picks), "the winners-bracket champion wins outright");
});

// ---------- display links and screens ----------

test("display: schedule labels past midnight are read as the next day", () => {
  const day = "2026-11-11";
  assert.equal(slotTime(day, "10:30"), new Date(2026, 10, 11, 10, 30).getTime());
  assert.equal(slotTime(day, "00:10 (+1d)"), new Date(2026, 10, 12, 0, 10).getTime());
  assert.equal(slotTime(day, "01:00 (+2d)"), new Date(2026, 10, 13, 1, 0).getTime());
  assert.ok(Number.isNaN(slotTime(day, "soon")));
  assert.ok(Number.isNaN(slotTime("yesterday", "10:00")));
});

test("display: the round on now is found after midnight, with and without a date in the link", () => {
  const slots = buildSchedule({ start: "23:00", matches: 4, duration: 30, gap: 10, lobbies: 1, breakEvery: 0, breakLength: 0 });
  const d = { title: "x", slots: slots.map((s) => ({ n: s.slot, start: s.start, end: s.end, label: "" })) };
  // 00:25 on the 12th: the third slot (00:20 to 00:50 +1d) is on
  assert.deepEqual(slotNow(d, new Date(2026, 10, 12, 0, 25)), { current: 2, next: 3 });
  // 23:35: between the first and second slot
  assert.deepEqual(slotNow(d, new Date(2026, 10, 11, 23, 35)), { current: -1, next: 1 });
  // a link that names its day does not borrow yesterday
  assert.equal(slotNow({ ...d, date: "2026-11-12" }, new Date(2026, 10, 12, 0, 25)).current, -1);
  // before it starts and after it ends
  assert.deepEqual(slotNow(d, new Date(2026, 10, 11, 9, 0)), { current: -1, next: 0 });
  assert.deepEqual(slotNow({ ...d, date: "2026-11-11" }, new Date(2026, 10, 12, 12, 0)), { current: -1, next: -1 }, "finished");
  assert.equal(secondsUntil(d, "23:40", new Date(2026, 10, 11, 23, 35)), 300);
  assert.equal(secondsUntil(d, "00:20 (+1d)", new Date(2026, 10, 11, 23, 50)), 1800);
  assert.equal(secondsUntil(d, "soon"), null);
});

test("display: a link round-trips emoji, Devanagari and quotes, and shows them only as text", async () => {
  const p = { v: "table", d: { title: "\u{1F3C6} कोंकण \"Cup\"", head: ["#", "Team"], rows: [["1", "<img src=x onerror=alert(1)>"], ["2", "á \u{1F525}"]] } };
  const back = await decode(await encode(p));
  assert.equal(back.d.title, p.d.title);
  assert.equal(back.d.rows[0][1], "<img src=x onerror=alert(1)>", "markup is kept as plain text, never interpreted (the screen renders text nodes only)");
  assert.equal(back.d.rows[1][1], p.d.rows[1][1]);
});

test("display: hostile objects never throw; they are refused or trimmed", () => {
  for (const x of [null, undefined, 5, "x", [], {}, { v: "table" }, { v: "table", d: { head: null, rows: [] } }, { v: "table", d: { head: ["a"], rows: [null, 5, "x"] } }, { v: "schedule", d: { slots: [null] } }, { v: "schedule", d: { slots: "no" } }, { v: "bracket", d: { sections: [null] } }, { v: "bracket", d: { sections: [{ rounds: [{ matches: [null] }] }] } }, { v: "countdown", d: { at: "nonsense" } }, { v: "evil", d: {} }]) {
    assert.doesNotThrow(() => validate(x), JSON.stringify(x));
  }
  const long = validate({ v: "table", d: { title: "t".repeat(5000), head: Array(40).fill("h"), rows: Array(500).fill(Array(40).fill("c".repeat(500))) } });
  assert.equal(long, null, "more than 200 rows is refused");
  const ok = validate({ v: "table", d: { title: "t".repeat(5000), head: Array(40).fill("h"), rows: Array(10).fill(Array(40).fill("c".repeat(500))) } });
  assert.equal(ok.d.title.length, 100);
  assert.equal(ok.d.head.length, 14);
  assert.equal(ok.d.rows[0].length, 14);
  assert.equal(ok.d.rows[0][0].length, 80);
});

test("display: damaged links are refused without throwing", async () => {
  for (const bad of ["", "z.", "p.", "z.AAAA", "z.!!!!", "p.%%%", "x.abc", "p." + "A".repeat(200_001)]) assert.equal(await decode(bad), null, bad.slice(0, 12));
});

test("display: look settings stay inside safe limits", () => {
  const l = lookFrom(new URLSearchParams("theme=neon&bg=ff00aa&safe=99&scale=0.1&names=1"));
  assert.deepEqual([l.theme, l.bg, l.safe, l.scale, l.names], ["neon", "#ff00aa", 15, 0.5, true]);
  const bad = lookFrom(new URLSearchParams("theme=<script>&bg=red;}body{display:none&safe=abc&scale=NaN"));
  assert.equal(bad.theme, "dark");
  assert.equal(bad.bg, "#05070a", "a bad colour falls back, so it can never inject CSS");
  assert.equal(bad.safe, 3);
  assert.equal(bad.scale, 1);
  assert.equal(lookFrom(new URLSearchParams("bg=transparent")).bg, "transparent");
});

test("display: countdown never goes negative and splits cleanly across days", () => {
  const at = "2026-11-11T12:00:00Z", t = Date.parse(at);
  assert.deepEqual(remaining(at, t + 5000), { ms: 0, days: 0, hours: 0, minutes: 0, seconds: 0, done: true });
  const r = remaining(at, t - (2 * 86400 + 3 * 3600 + 4 * 60 + 5) * 1000);
  assert.deepEqual([r.days, r.hours, r.minutes, r.seconds, r.done], [2, 3, 4, 5, false]);
});
