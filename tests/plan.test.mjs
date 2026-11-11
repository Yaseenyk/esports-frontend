import test from "node:test";
import assert from "node:assert/strict";
import { buildPack, doubleWaves, fmtDuration, nextSteps, planTournament, roundRobinSlots, rulesLines, singleWaves } from "../src/lib/plan.ts";
import { buildSchedule, summary } from "../src/lib/schedule.ts";
import { matchCount } from "../src/lib/roundrobin.ts";
import { EXAMPLE_SCALE } from "../src/lib/points.ts";
import { registrationText } from "../src/lib/regform.ts";
import { TOOLS } from "../src/lib/data.ts";

const br = (o = {}) => planTournament({ kind: "br", teams: 48, rooms: 2, hours: 6, start: "10:00", ...o });
const h2h = (o = {}) => planTournament({ kind: "h2h", teams: 8, rooms: 1, hours: 8, start: "10:00", ...o });

test("duration text", () => {
  assert.equal(fmtDuration(440), "7 h 20 min");
  assert.equal(fmtDuration(300), "5 h");
  assert.equal(fmtDuration(45), "45 min");
});

test("battle royale: lobbies are ceil(teams / teams per lobby), with 12 as the default", () => {
  assert.equal(br({ teams: 48 }).lobbies, 4);
  assert.equal(br({ teams: 49 }).lobbies, 5);
  assert.equal(br({ teams: 12 }).lobbies, 1);
  assert.equal(br({ teams: 30, perLobby: 15 }).lobbies, 2);
  const p = br({ teams: 30 });
  assert.equal(p.lobbies, 3);
  assert.equal(p.teamsPerLobby, 10); // balanced, never more than 12
});

test("battle royale: matches per lobby are the most that fit, checked against buildSchedule", () => {
  const p = br({ teams: 30, rooms: 2, hours: 5 });
  assert.equal(p.fitMax, 4);
  const ok = buildSchedule({ start: "10:00", matches: 3 * 4, duration: 35, gap: 10, lobbies: 2, breakEvery: 3, breakLength: 30 });
  assert.equal(summary({ start: "10:00", matches: 12, duration: 35, gap: 10, lobbies: 2, breakEvery: 3, breakLength: 30 }, ok).totalMinutes, 290);
  assert.ok(290 <= 300);
  const over = buildSchedule({ start: "10:00", matches: 15, duration: 35, gap: 10, lobbies: 2, breakEvery: 3, breakLength: 30 });
  assert.ok(summary({ start: "10:00", matches: 15, duration: 35, gap: 10, lobbies: 2, breakEvery: 3, breakLength: 30 }, over).totalMinutes > 300);
  assert.equal(p.matchesPerLobby, 4);
  assert.equal(p.totalMatches, 12);
  assert.equal(p.verdict.fits, true);
  assert.equal(p.verdict.text, "Fits in your time: ends 14:50");
  assert.equal(p.rows.length, 6);
  assert.equal(p.rows[0].start, "10:00");
  assert.equal(p.rows[2].breakAfter, 30);
});

test("battle royale: every lobby plays the same number of games and none plays twice in one slot", () => {
  for (const [teams, rooms] of [[48, 2], [30, 3], [100, 4], [12, 5]]) {
    const p = br({ teams, rooms, hours: 12 });
    const seen = new Map();
    for (const r of p.rows) {
      const lobbiesNow = r.items.map((x) => x.match(/Lobby (\d+)/)?.[1] ?? "1");
      assert.equal(new Set(lobbiesNow).size, lobbiesNow.length, "a lobby plays twice at once");
      assert.ok(r.items.length <= rooms);
      for (const l of lobbiesNow) seen.set(l, (seen.get(l) ?? 0) + 1);
    }
    assert.equal(seen.size, p.lobbies);
    for (const n of seen.values()) assert.equal(n, p.matchesPerLobby);
  }
});

test("battle royale: the recommendation is capped at six matches and the rest is slack", () => {
  const p = br({ teams: 12, rooms: 1, hours: 12 });
  assert.ok(p.fitMax > 6);
  assert.equal(p.matchesPerLobby, 6);
});

test("battle royale: finals are only suggested when there is time left, and never for one lobby", () => {
  assert.equal(br({ teams: 12, hours: 12 }).finals, null);
  const roomy = br({ teams: 30, rooms: 3, hours: 12 });
  assert.ok(roomy.finals);
  assert.equal(roomy.finals.teams, 12);
  const tight = br({ teams: 30, rooms: 2, hours: 5 });
  assert.equal(tight.finals, null);
});

test("battle royale: not enough time gives the does-not-fit verdict with options", () => {
  const p = br({ teams: 96, rooms: 1, hours: 2 });
  assert.equal(p.verdict.fits, false);
  assert.equal(p.fitMax, 0);
  assert.equal(p.matchesPerLobby, 1);
  assert.match(p.verdict.text, /^Does not fit: needs \d+ h( \d+ min)?, you have 2 h\. Options: fewer teams, more rooms/);
});

test("battle royale: the points scale is the example scale from the points library", () => {
  const p = br();
  assert.deepEqual(p.scale, EXAMPLE_SCALE);
  assert.match(p.scaleLines[0], /Example points \(not an official scale\): 1st 10, 2nd 6, 3rd 5/);
});

test("single elimination: n - 1 matches, and the waves add up for byes too", () => {
  for (const n of [2, 3, 5, 8, 11, 16, 33, 64]) {
    const { waves } = singleWaves(n);
    assert.equal(waves.flat().length, n - 1, `n=${n}`);
    assert.equal(waves.length, Math.ceil(Math.log2(n)), `n=${n} rounds`);
  }
});

test("double elimination: the real bracket gives 2n - 2 matches, plus a reset final that may be needed", () => {
  for (const n of [3, 4, 5, 8, 9, 13, 16, 31, 32]) {
    const d = doubleWaves(n);
    const real = d.waves.flat().filter((x) => x !== "GF2");
    assert.equal(real.length, 2 * n - 2, `n=${n}`);
    assert.equal(d.waves.at(-1)[0], "GF2");
  }
  assert.equal(doubleWaves(2), null);
});

test("round robin: n(n-1)/2 matches, packed so no team plays twice at once", () => {
  for (const [n, rooms] of [[4, 1], [6, 2], [7, 3], [8, 4], [10, 2]]) {
    const r = roundRobinSlots(n, rooms);
    assert.equal(r.matches, matchCount(n));
    assert.equal(r.slots.flat().length, matchCount(n));
    for (const s of r.slots) {
      assert.ok(s.length <= rooms);
      const teams = s.flatMap((x) => x.split(" v "));
      assert.equal(new Set(teams).size, teams.length);
    }
    assert.equal(r.rounds, n % 2 ? n : n - 1);
  }
});

test("head to head: counts shown for each format come from the libraries", () => {
  const p = h2h({ teams: 8, rooms: 2, hours: 10 });
  const by = (id) => p.options.find((o) => o.id === id);
  assert.equal(by("single").matches, 7);
  assert.equal(by("double").matches, 14);
  assert.equal(by("double").extra, 1);
  assert.equal(by("roundrobin").matches, 28);
  assert.equal(by("roundrobin").rounds, 7);
  assert.equal(by("single").rounds, 3);
  // The time of each option is buildSchedule over its slots, one slot at a time.
  const cfg = { start: "10:00", duration: 30, gap: 10, lobbies: 1, breakEvery: 3, breakLength: 30 };
  for (const o of p.options) {
    const slots = buildSchedule({ ...cfg, matches: o.slots });
    assert.equal(summary({ ...cfg, matches: o.slots }, slots).totalMinutes, o.minutes, o.id);
  }
});

test("head to head: recommends the format that fits, with an alternative and a reason", () => {
  const small = h2h({ teams: 6, rooms: 1, hours: 12 });
  assert.equal(small.chosen, "roundrobin");
  assert.equal(small.verdict.fits, true);
  assert.ok(small.alternative);
  assert.ok(small.reason.length > 20);
  const mid = h2h({ teams: 16, rooms: 2, hours: 15 });
  assert.equal(mid.options.find((o) => o.id === "roundrobin").fits, false);
  assert.equal(mid.chosen, "double");
  const tight = h2h({ teams: 16, rooms: 2, hours: 6.25 });
  assert.equal(tight.chosen, "single");
  assert.equal(tight.alternative, "double");
});

test("head to head: a field that cannot fit says so with the exact numbers", () => {
  const p = h2h({ teams: 16, rooms: 1, hours: 3 });
  assert.equal(p.verdict.fits, false);
  assert.equal(p.chosen, "single");
  assert.match(p.verdict.text, /^Does not fit: needs 11 h 50 min, you have 3 h\. Options: fewer teams, more rooms, a shorter format/);
  const ok = h2h({ teams: 4, rooms: 2, hours: 5 });
  assert.match(ok.verdict.text, /^Fits in your time: ends \d\d:\d\d/);
});

test("head to head: a chosen format overrides the recommendation", () => {
  const p = h2h({ teams: 8, rooms: 2, hours: 12, format: "single" });
  assert.equal(p.chosen, "single");
  assert.equal(p.rows.flatMap((r) => r.items).length, 7);
});

test("odd, small and large inputs are handled, and bad ones give a plain error", () => {
  assert.equal(h2h({ teams: 2 }).ok, true);
  assert.equal(h2h({ teams: 2 }).chosen, "single");
  assert.equal(h2h({ teams: 65 }).ok, false);
  assert.equal(planTournament({ kind: "br", teams: 1, rooms: 1, hours: 4, start: "10:00" }).ok, false);
  assert.equal(br({ start: "25:00" }).ok, false);
  assert.equal(br({ rooms: 0 }).ok, false);
  assert.equal(br({ hours: 0 }).ok, false);
  assert.equal(br({ teams: 500, perLobby: 2, hours: 24, rooms: 100 }).ok, true);
  assert.match(h2h({ teams: 0 }).error, /between 2 and 64/);
});

test("a schedule past midnight is shown with its day marker", () => {
  const p = h2h({ teams: 8, rooms: 1, hours: 24, start: "20:00", format: "roundrobin" });
  assert.match(p.verdict.finish, /\(\+1d\)/);
});

test("the text pack has every part, with the numbers filled in and the organiser's decisions left in brackets", () => {
  const p = br({ teams: 48, rooms: 2, hours: 6 });
  const text = buildPack(p, { event: "Monsoon Clash", preset: "squad" });
  for (const part of ["TOURNAMENT PLAN: Monsoon Clash", "1. SUMMARY", "2. FORMAT", "3. SCHEDULE", "4. POINTS SCALE", "5. RULES (DRAFT)", "6. SIGN-UP FORM", "7. NEXT STEPS"]) assert.ok(text.includes(part), part);
  assert.ok(text.includes("Monsoon Clash: team registration"));
  assert.ok(text.includes("A team has 4 players and up to 1 substitute"));
  assert.ok(text.includes("room for 48 teams"));
  assert.ok(text.includes("The first match starts at 10:00"));
  assert.ok(text.includes("planned for 35 minutes"));
  assert.ok(text.includes("[age rule]") && text.includes("[Prizes and how they are paid") && text.includes("[order of tie-breakers]"));
  assert.ok(text.includes("/tools/points-table/") && text.includes("/tools/registration/") && text.includes("/tools/schedule/"));
  assert.ok(text.includes(registrationText("squad", "Monsoon Clash")));
  assert.ok(!/undefined|NaN/.test(text));
});

test("the Markdown pack uses headings, a table and a fenced sign-up form", () => {
  const md = buildPack(h2h({ teams: 8, rooms: 2, hours: 10 }), { event: "", preset: "five" }, "md");
  assert.ok(md.startsWith("# Tournament plan: [Event name]"));
  assert.ok(md.includes("## 3. Schedule") && md.includes("| Round | Start | End | Matches |") && md.includes("| --- |"));
  assert.ok(md.includes("```"));
  assert.ok(!/undefined|NaN/.test(md));
});

test("the pack never invents prize or legal terms", () => {
  const rules = rulesLines(br(), { event: "X", preset: "squad" }).join("\n");
  assert.ok(!/Rs\s?\d|₹|\$\d|prize money of|will be paid/i.test(rules));
  assert.ok(rules.includes("[Prizes and how they are paid"));
});

test("next steps link to the tool that matches the format, and every link is a real tool", () => {
  const slugs = new Set(TOOLS.map((t) => t.href));
  const forBr = nextSteps(br());
  assert.ok(forBr.some((s) => s.href === "/tools/points-table/"));
  for (const [format, href] of [["single", "/tools/brackets/"], ["double", "/tools/double-elimination/"], ["roundrobin", "/tools/round-robin/"]]) {
    assert.ok(nextSteps(h2h({ teams: 8, hours: 12, format })).some((s) => s.href === href), format);
  }
  for (const s of [...forBr, ...nextSteps(h2h())]) assert.ok(slugs.has(s.href), s.href);
});

test("there are twelve tools and the planner is one of them", () => {
  assert.equal(TOOLS.length, 12);
  assert.ok(TOOLS.some((t) => t.slug === "plan" && t.href === "/tools/plan/"));
});
