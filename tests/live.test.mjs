// Run: node --import tsx --test tests/live.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { LIMITS, agoText, bracketRounds, currentRoundIndex, filterCards, leaderOf, scheduleRows, standingCards, startsInText, emptySnapshot, formatLocalTime, isLogo, kindOf, liveUrl, mergeView, nextInBracket, nextInSchedule, nextMatches, orderedViews, snapshotBytes, teamsOf, tooBig, trimSnapshot, withExtras } from "../src/lib/live.ts";

const table = (head, rows) => ({ v: "table", d: { title: "T", head, rows } });
const standings = table(["#", "Team", "Kills", "Total"], [["1", "Alpha", "10", "30"], ["2", "Bravo", "8", "25"]]);
const league = table(["#", "Team", "P", "Pts"], [["1", "Charlie", "2", "6"], ["2", "alpha", "2", "3"]]);
const bracket = { v: "bracket", d: { title: "B", sections: [{ name: "", rounds: [
  { name: "Semi", matches: [{ a: "Alpha", b: "Bravo", w: 0 }, { a: "Charlie", b: "Delta" }] },
  { name: "Final", matches: [{ a: "Alpha", b: "TBD" }] },
] }] } };
const schedule = { v: "schedule", d: { title: "S", date: "2026-12-01", slots: [{ n: 1, start: "10:00", end: "10:40", label: "Alpha vs Bravo" }, { n: 2, start: "11:00", end: "11:40", label: "Charlie vs Delta" }] } };
const countdown = { v: "countdown", d: { title: "C", at: "2026-12-01T10:00:00Z" } };

test("kind mapping: Kills column is standings, other tables are league", () => {
  assert.equal(kindOf(standings), "standings");
  assert.equal(kindOf(table(["#", "Team", "KILLS"], [])), "standings");
  assert.equal(kindOf(league), "league");
  assert.equal(kindOf(table(["#", "Team", "Skills"], [])), "league");
  assert.equal(kindOf(schedule), "schedule");
  assert.equal(kindOf(bracket), "bracket");
  assert.equal(kindOf(countdown), "countdown");
});

test("merge replaces the same kind and keeps announcements, sponsors, ticker and other views", () => {
  const base = { views: [{ kind: "standings", payload: standings }, { kind: "bracket", payload: bracket }], announcements: [{ text: "Hi", at: "2026-12-01T09:00:00Z" }], sponsors: [{ name: "Acme" }], ticker: ["Welcome"] };
  const next = table(["#", "Team", "Kills", "Total"], [["1", "Zed", "1", "1"]]);
  const m = mergeView(base, next);
  assert.equal(m.views.length, 2);
  assert.equal(m.views.find((v) => v.kind === "standings").payload.d.rows[0][1], "Zed");
  assert.deepEqual(m.announcements, base.announcements);
  assert.deepEqual(m.sponsors, [{ name: "Acme" }]);
  assert.deepEqual(m.ticker, ["Welcome"]);
  assert.equal(mergeView(null, league).views[0].kind, "league");
  assert.equal(mergeView(m, league).views.length, 3);
});

test("trim enforces every limit and drops what the server would refuse", () => {
  const long = "x".repeat(500);
  const good = "data:image/png;base64,AAAA";
  const s = trimSnapshot({
    views: [{ kind: "standings", payload: standings }, { kind: "standings", payload: standings }, { kind: "bracket", payload: standings }, { kind: "nope", payload: standings }],
    announcements: Array.from({ length: 15 }, (_, i) => ({ text: `${long}${i}`, at: new Date(2026, 11, 1, 0, i).toISOString() })).concat([{ text: "", at: "2026-12-01T00:00:00Z" }, { text: "bad time", at: "x" }]),
    sponsors: [{ name: long, logo: good }, { name: "B", logo: "javascript:alert(1)" }, { name: "" }, { name: "C" }, { name: "D" }, { name: "E" }],
    ticker: [long, " ", "b", "c", "d", "e", "f"],
  });
  assert.equal(s.views.length, 1);
  assert.equal(s.announcements.length, LIMITS.announcements);
  assert.ok(s.announcements.every((a) => a.text.length <= LIMITS.announcementText));
  assert.ok(Date.parse(s.announcements[0].at) > Date.parse(s.announcements[1].at), "newest first");
  assert.equal(s.sponsors.length, LIMITS.sponsors);
  assert.equal(s.sponsors[0].name.length, LIMITS.sponsorName);
  assert.equal(s.sponsors[0].logo, good);
  assert.equal(s.sponsors[1].logo, undefined);
  assert.equal(s.ticker.length, LIMITS.ticker);
  assert.equal(s.ticker[0].length, LIMITS.tickerLine);
  assert.deepEqual(trimSnapshot(null), emptySnapshot());
  assert.deepEqual(trimSnapshot("junk"), emptySnapshot());
});

test("logo check: only png, jpeg, webp data URLs under 60000 characters", () => {
  assert.ok(isLogo("data:image/jpeg;base64,/9j/4AAQ"));
  assert.ok(isLogo("data:image/webp;base64,UklGRg=="));
  assert.ok(!isLogo("data:image/svg+xml;base64,PHN2Zz4="));
  assert.ok(!isLogo("https://example.com/a.png"));
  assert.ok(!isLogo("data:image/png;base64," + "A".repeat(LIMITS.logoChars)));
  assert.ok(!isLogo(undefined));
});

test("size check and extras replacement keep the views", () => {
  assert.ok(!tooBig(emptySnapshot()));
  const big = { ...emptySnapshot(), views: [{ kind: "league", payload: table(["#", "Team"], Array.from({ length: 200 }, (_, i) => [String(i), "T".repeat(80)])) }] };
  assert.ok(snapshotBytes(big) > 15000);
  const e = withExtras({ ...emptySnapshot(), views: [{ kind: "standings", payload: standings }], ticker: ["old"] }, { ticker: ["new"] });
  assert.equal(e.views.length, 1);
  assert.deepEqual(e.ticker, ["new"]);
});

test("teams come from table team columns and bracket names, deduplicated, without TBD or Bye", () => {
  const t = teamsOf({ ...emptySnapshot(), views: [{ kind: "standings", payload: standings }, { kind: "league", payload: league }, { kind: "bracket", payload: bracket }] });
  assert.deepEqual(t, ["Alpha", "Bravo", "Charlie", "Delta"]);
  assert.deepEqual(teamsOf(null), []);
  assert.deepEqual(teamsOf({ ...emptySnapshot(), views: [{ kind: "bracket", payload: { v: "bracket", d: { title: "", sections: [{ name: "", rounds: [{ name: "R", matches: [{ a: "A", b: "Bye" }] }] }] } } }] }), ["A"]);
});

test("next match from the bracket: opponent, unknown opponent, out, and not present", () => {
  const d = bracket.d;
  assert.match(nextInBracket(d, "Charlie").detail, /Charlie vs Delta/);
  assert.match(nextInBracket(d, "alpha").detail, /waiting to find out/);
  assert.match(nextInBracket(d, "Bravo").detail, /out of this bracket/);
  assert.equal(nextInBracket(d, "Nobody"), null);
});

test("next match from the schedule only when a label names the team and it is not over", () => {
  const at = (h, m) => new Date(2026, 11, 1, h, m);
  assert.match(nextInSchedule(schedule.d, "Charlie", at(10, 30)).detail, /Starts 11:00: Charlie vs Delta/);
  assert.match(nextInSchedule(schedule.d, "Alpha", at(10, 10)).detail, /On now/);
  assert.equal(nextInSchedule(schedule.d, "Alpha", at(12, 0)), null, "already finished");
  assert.equal(nextInSchedule({ ...schedule.d, slots: [{ n: 1, start: "10:00", end: "10:40", label: "Round 1" }] }, "Alpha", at(9, 0)), null, "never guesses");
  assert.equal(nextInSchedule(schedule.d, "", at(9, 0)), null);
  const both = nextMatches({ ...emptySnapshot(), views: [{ kind: "schedule", payload: schedule }, { kind: "bracket", payload: bracket }] }, "Charlie", at(9, 0));
  assert.deepEqual(both.map((x) => x.source).sort(), ["bracket", "schedule"]);
  assert.deepEqual(nextMatches(null, "Charlie"), []);
  assert.deepEqual(nextMatches({ ...emptySnapshot(), views: [{ kind: "league", payload: league }] }, ""), []);
});

test("tabs are ordered standings, table, schedule, bracket, countdown", () => {
  const o = orderedViews({ ...emptySnapshot(), views: [{ kind: "countdown", payload: countdown }, { kind: "bracket", payload: bracket }, { kind: "league", payload: league }, { kind: "standings", payload: standings }] });
  assert.deepEqual(o.map((v) => v.kind), ["standings", "league", "bracket", "countdown"]);
});

test("time formatting is local, short, and says the day only when it is not today", () => {
  const now = Date.parse("2026-12-01T12:00:00Z");
  assert.equal(formatLocalTime("2026-12-01T14:05:00Z", now, { timeZone: "UTC" }), "14:05");
  assert.equal(formatLocalTime("2026-12-01T14:05:00Z", now, { timeZone: "Asia/Kolkata" }), "19:35");
  assert.equal(formatLocalTime("2026-12-03T09:00:00Z", now, { timeZone: "UTC" }), "3 Dec, 09:00");
  assert.equal(formatLocalTime("nonsense", now), "");
  assert.equal(agoText(1000), "just now");
  assert.equal(agoText(12_000), "12 s ago");
  assert.equal(agoText(185_000), "3 min ago");
  assert.equal(agoText(7_300_000), "2 h ago");
  assert.equal(liveUrl("https://x.dev/", "abc123"), "https://x.dev/live/?e=abc123");
});

test("standing cards: rank, name, headline number and chips from different column layouts", () => {
  const c = standingCards({ title: "T", head: ["#", "Team", "M1", "M2", "Kills", "Total"], rows: [["1", "Alpha", "17", "9", "12", "38"], ["2", "Bravo", "8", "", "5", "13"], ["", "", "1", "1", "1", "1"]] });
  assert.equal(c.length, 2, "rows without a name are dropped");
  assert.deepEqual([c[0].rank, c[0].name, c[0].total, c[0].totalLabel], [1, "Alpha", "38", "Total"]);
  assert.deepEqual(c[0].parts.map((p) => `${p.label} ${p.value}`), ["M1 17", "M2 9", "Kills 12"]);
  assert.deepEqual(c[1].parts.map((p) => p.label), ["M1", "Kills"], "empty cells give no chip");
  // strong column wins; no rank column means row order; name found by header
  const s = standingCards({ title: "T", head: ["Player", "Pts", "Kills"], strong: 2, rows: [["Zed", "9", "4"], ["Yan", "7", "6"]] });
  assert.deepEqual([s[1].rank, s[1].name, s[1].total, s[1].parts[0].label], [2, "Yan", "6", "Pts"]);
  // unknown layout: second column is the name, a numeric first column is the rank, last column is the headline
  const u = standingCards({ title: "T", head: ["A", "B", "C"], rows: [["3", "Foo", "50"], ["4", "Bar", "40"]] });
  assert.deepEqual([u[0].rank, u[0].name, u[0].total], [3, "Foo", "50"]);
  // a single column still works and an empty table gives nothing
  assert.deepEqual(standingCards({ title: "T", head: ["Team"], rows: [["Solo"]] }).map((x) => [x.name, x.total]), [["Solo", ""]]);
  assert.deepEqual(standingCards({ title: "T", head: [], rows: [] }), []);
});

test("leader and filter", () => {
  const c = standingCards(standings.d);
  assert.equal(leaderOf(c).name, "Alpha");
  assert.equal(leaderOf([]), null);
  assert.equal(leaderOf(standingCards({ title: "", head: ["#", "Team"], rows: [["2", "B"], ["1", "A"], ["1", "C"]] })).name, "A");
  assert.deepEqual(filterCards(c, " BRA ").map((x) => x.name), ["Bravo"]);
  assert.equal(filterCards(c, "").length, 2);
  assert.equal(filterCards(c, "zzz").length, 0);
});

test("schedule rows: past, now, next, later and the starts-in text", () => {
  const d = { title: "S", date: "2026-12-01", slots: [{ n: 1, start: "10:00", end: "10:40", label: "A", breakAfter: 20 }, { n: 2, start: "11:00", end: "11:40", label: "B" }, { n: 3, start: "12:00", end: "12:40", label: "C" }] };
  const at = (h, m) => new Date(2026, 11, 1, h, m);
  const st = (rows) => rows.map((r) => r.state);
  assert.deepEqual(st(scheduleRows(d, at(10, 10))), ["now", "next", "later"]);
  assert.deepEqual(st(scheduleRows(d, at(10, 50))), ["past", "next", "later"]);
  assert.equal(scheduleRows(d, at(10, 48))[1].startsIn, "Starts in 12 min");
  assert.equal(scheduleRows(d, at(10, 10))[0].startsIn, "");
  assert.equal(scheduleRows(d, at(10, 10))[0].breakAfter, 20);
  assert.deepEqual(st(scheduleRows(d, at(13, 0))), ["past", "past", "past"]);
  assert.deepEqual(st(scheduleRows(d, at(9, 0))), ["next", "later", "later"]);
  assert.equal(startsInText(null), "");
  assert.equal(startsInText(30), "Starts in under a minute");
  assert.equal(startsInText(719), "Starts in 12 min");
  assert.equal(startsInText(90 * 60), "Starts in 1 h 30 min");
  assert.equal(startsInText(2 * 3600), "Starts in 2 h");
});

test("bracket round chips and the round to open first", () => {
  const d = { title: "B", sections: [{ name: "", rounds: [
    { name: "Quarter-finals", matches: [{ a: "A", b: "B", w: 0 }, { a: "C", b: "D", w: 1 }] },
    { name: "Semi-finals", matches: [{ a: "A", b: "D" }, { a: "E", b: "Bye" }] },
    { name: "", matches: [{ a: "TBD", b: "TBD" }] },
  ] }] };
  const r = bracketRounds(d);
  assert.deepEqual(r.map((x) => x.label), ["Quarter-finals", "Semi-finals", "Round 3"]);
  assert.deepEqual(r.map((x) => [x.decided, x.total]), [[2, 2], [1, 2], [0, 1]]);
  assert.equal(currentRoundIndex(r), 1);
  assert.equal(currentRoundIndex(r.map((x) => ({ ...x, decided: x.total }))), 2, "all done opens the final");
  assert.equal(currentRoundIndex([]), 0);
  const dbl = bracketRounds({ title: "", sections: [{ name: "Winners", rounds: [{ name: "R1", matches: [] }] }, { name: "Losers", rounds: [{ name: "R1", matches: [] }] }] });
  assert.deepEqual(dbl.map((x) => x.label), ["Winners: R1", "Losers: R1"]);
});

test("pollMs hint: clamped to 10 s..300 s, absent or invalid keeps the current 20 s / 60 s behaviour", async () => {
  const { clampPollMs, pollBounds, POLL_DEFAULT } = await import("../src/lib/live.ts");
  assert.equal(clampPollMs(20000), 20000);
  assert.equal(clampPollMs(120000), 120000);
  assert.equal(clampPollMs(1), 10000);
  assert.equal(clampPollMs(9_999_999), 300000);
  for (const bad of [undefined, null, "20000", NaN, Infinity, {}]) assert.equal(clampPollMs(bad), null);
  assert.deepEqual(pollBounds(null), POLL_DEFAULT);
  assert.deepEqual(pollBounds(null), { minMs: 20000, maxMs: 60000 });
  assert.deepEqual(pollBounds(20000), { minMs: 20000, maxMs: 60000 });
  assert.deepEqual(pollBounds(120000), { minMs: 120000, maxMs: 120000 });
  assert.deepEqual(pollBounds(300000), { minMs: 300000, maxMs: 300000 });
});
