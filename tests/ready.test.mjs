// Run: node --import tsx --test tests/ready.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { canMarkNow, captainState, clockOffset, forfeitConsequence, graceDeadlineMs, groupBoard, lateSides, msToStart, needsNoShowConfirm, parseGrace, spanText, tokenFromSearch, validGrace } from "../src/lib/ready.ts";

const T0 = Date.parse("2026-12-01T10:00:00Z");
const min = (n) => n * 60_000;
const iso = (offsetMin) => new Date(T0 + min(offsetMin)).toISOString();
let n = 0;
const bm = (o = {}) => ({ id: `m${++n}`, stage: "main", round: 1, slot: n, a: "Alpha", b: "Beta", status: "scheduled", startsAt: iso(0), aReady: false, bReady: false, aReadyAt: null, bReadyAt: null, graceDeadline: null, late: [], ...o });
const cm = (o = {}) => ({ id: "c1", stage: "main", round: 1, opponent: "Beta", startsAt: iso(30), status: "scheduled", youReady: false, opponentReady: false, minutesToGrace: 40, canMark: true, ...o });

test("grace validation accepts whole numbers 0 to 120 only", () => {
  assert.ok(validGrace(0) && validGrace(10) && validGrace(120));
  assert.ok(!validGrace(-1) && !validGrace(121) && !validGrace(1.5) && !validGrace("5") && !validGrace(NaN));
  assert.equal(parseGrace(" 15 "), 15);
  assert.equal(parseGrace("0"), 0);
  assert.equal(parseGrace(""), null);
  assert.equal(parseGrace("-3"), null);
  assert.equal(parseGrace("1.5"), null);
  assert.equal(parseGrace("121"), null);
  assert.equal(parseGrace("1e2"), null);
});

test("deadline and time to start", () => {
  assert.equal(graceDeadlineMs(iso(0), 10), T0 + min(10));
  assert.equal(graceDeadlineMs(null, 10), null);
  assert.equal(graceDeadlineMs("nonsense", 10), null);
  assert.equal(msToStart(iso(5), T0), min(5));
  assert.equal(msToStart(iso(-5), T0), -min(5));
  assert.equal(msToStart(null, T0), null);
});

test("captains can tap from 60 minutes before the start until the match is live", () => {
  assert.equal(canMarkNow("scheduled", iso(61), T0), false);
  assert.equal(canMarkNow("scheduled", iso(60), T0), true);
  assert.equal(canMarkNow("ready", iso(5), T0), true);
  assert.equal(canMarkNow("scheduled", iso(-20), T0), true);
  assert.equal(canMarkNow("live", iso(-1), T0), false);
  assert.equal(canMarkNow("finished", iso(0), T0), false);
  assert.equal(canMarkNow("scheduled", null, T0), false);
});

test("spanText uses short plain words", () => {
  assert.equal(spanText(0), "now");
  assert.equal(spanText(-5), "now");
  assert.equal(spanText(45_000), "45 s");
  assert.equal(spanText(min(12)), "12 min");
  assert.equal(spanText(min(65)), "1 h 5 min");
  assert.equal(spanText(min(120)), "2 h");
  assert.equal(spanText(min(60 * 26)), "1 d 2 h");
});

test("clock offset corrects a wrong phone clock", () => {
  assert.equal(clockOffset(iso(5), T0), min(5));
  assert.equal(clockOffset(undefined, T0), 0);
  assert.equal(clockOffset("bad", T0), 0);
});

test("captain state covers every situation", () => {
  const g = 10;
  assert.equal(captainState(cm({ opponent: "" }), g, T0), "noOpponent");
  assert.equal(captainState(cm({ status: "live" }), g, T0), "live");
  assert.equal(captainState(cm({ youReady: true, opponentReady: true }), g, T0), "both");
  assert.equal(captainState(cm({ youReady: true }), g, T0), "waiting");
  assert.equal(captainState(cm({ startsAt: iso(90) }), g, T0), "early");
  assert.equal(captainState(cm({ startsAt: iso(30) }), g, T0), "ready");
  assert.equal(captainState(cm({ startsAt: iso(-5) }), g, T0), "ready"); // inside grace
  assert.equal(captainState(cm({ startsAt: iso(-11) }), g, T0), "late");
  assert.equal(captainState(cm({ startsAt: iso(-10) }), g, T0), "ready"); // exactly on the deadline is not late yet
  assert.equal(captainState(cm({ startsAt: iso(-1) }), 0, T0), "late");
});

test("lateSides: only teams that are not ready, past the deadline, and not on a live match", () => {
  assert.deepEqual(lateSides(bm({ startsAt: iso(-11) }), 10, T0), ["a", "b"]);
  assert.deepEqual(lateSides(bm({ startsAt: iso(-11), aReady: true }), 10, T0), ["b"]);
  assert.deepEqual(lateSides(bm({ startsAt: iso(-11), aReady: true, bReady: true }), 10, T0), []);
  assert.deepEqual(lateSides(bm({ startsAt: iso(-5) }), 10, T0), []);
  assert.deepEqual(lateSides(bm({ startsAt: iso(-11), status: "live" }), 10, T0), []);
  assert.deepEqual(lateSides(bm({ startsAt: null }), 10, T0), []);
  assert.deepEqual(lateSides(bm({ startsAt: iso(-11), b: "" }), 10, T0), ["a"]);
});

test("groupBoard splits late, ready and starting soon, sorted by start, and only counts live", () => {
  const soon2 = bm({ startsAt: iso(40) });
  const soon1 = bm({ startsAt: iso(20) });
  const late = bm({ startsAt: iso(-20), aReady: true });
  const both = bm({ startsAt: iso(-30), aReady: true, bReady: true, status: "ready" });
  const live = bm({ status: "live" });
  const done = bm({ status: "finished" });
  const g = groupBoard([soon2, late, both, live, soon1, done], 10, T0);
  assert.deepEqual(g.soon.map((m) => m.id), [soon1.id, soon2.id]);
  assert.deepEqual(g.late.map((m) => m.id), [late.id]);
  assert.deepEqual(g.ready.map((m) => m.id), [both.id]);
  assert.equal(g.live, 1);
  assert.deepEqual(groupBoard([], 10, T0), { soon: [], late: [], ready: [], live: 0 });
});

test("forfeit consequence names the winner and asks for a no-show confirmation when nobody is ready", () => {
  const m = bm();
  assert.match(forfeitConsequence(m, "a", false), /Alpha will be recorded as a forfeit and Beta will win/);
  assert.doesNotMatch(forfeitConsequence(m, "a", false), /no one showed up/);
  assert.match(forfeitConsequence(m, "b", true), /Beta will be recorded as a forfeit and Alpha will win/);
  assert.match(forfeitConsequence(m, "b", true), /no one showed up/);
  assert.equal(needsNoShowConfirm(bm({ bReady: true }), "a"), false);
  assert.equal(needsNoShowConfirm(bm({ bReady: true }), "b"), true);
  assert.equal(needsNoShowConfirm(bm(), "a"), true);
});

test("token from the query string must look like a captain token", () => {
  assert.equal(tokenFromSearch("?t=" + "a".repeat(32)), "a".repeat(32));
  assert.equal(tokenFromSearch("?t=short"), null);
  assert.equal(tokenFromSearch(""), null);
  assert.equal(tokenFromSearch("?t=" + encodeURIComponent("<script>".repeat(5))), null);
  assert.equal(tokenFromSearch("?t=" + "a".repeat(65)), null);
});
