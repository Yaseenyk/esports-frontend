// Run: node --import tsx --test tests/scorer.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import {
  UNDO_MS, brFormFor, brKey, canUndo, classifyFailure, clampScore, confirmText, enqueue, formatLeft, linkStateText, nextBrMatchNo, overlayQueue, parseQueue,
  parseScore, queueStorageKey, resultKey, scoreUrl, sendQueue, splitMatches, stepScore, undoBody, undoLeftMs, validateBr, validateScore, whatsappText, whatsappUrl,
} from "../src/lib/scorer.ts";

const m = (o) => ({ id: "m1", stage: "main", round: 1, slot: 1, a: "Alpha", b: "Beta", status: "scheduled", scoreA: null, scoreB: null, startsAt: null, winner: null, ...o });
const item = (o) => ({ id: `i${Math.random()}`, key: resultKey("m1"), kind: "result", matchId: "m1", body: { status: "finished", scoreA: 1, scoreB: 0 }, label: "x", at: 1, ...o });

test("scores: stepping clamps, typing keeps digits only, validation says what is wrong", () => {
  assert.equal(stepScore(null, 1), 1);
  assert.equal(stepScore(0, -1), 0);
  assert.equal(stepScore(999, 1), 999);
  assert.equal(clampScore(NaN), 0);
  assert.equal(clampScore(12.9), 12);
  assert.equal(parseScore(""), null);
  assert.equal(parseScore("1a3"), 13);
  assert.equal(parseScore("12345"), 123);
  assert.equal(validateScore(13, 9).ok, true);
  assert.equal(validateScore(0, 0).ok, true);
  assert.match(validateScore(null, 9).error, /both teams/);
  assert.equal(validateScore(-1, 2).ok, false);
  assert.equal(validateScore(1.5, 2).ok, false);
  assert.equal(validateScore(1000, 2).ok, false);
});

test("the confirm sentence names both teams and both scores", () => {
  assert.equal(confirmText("Team A", "Team B", 13, 9), "Team A 13, Team B 9: save?");
});

test("undo lasts two minutes, counts down, and never goes negative", () => {
  const u = { matchId: "m1", savedAt: 1000, prev: null };
  assert.equal(UNDO_MS, 120000);
  assert.equal(undoLeftMs(1000, 1000), 120000);
  assert.equal(canUndo(u, 1000 + 119999), true);
  assert.equal(canUndo(u, 1000 + 120000), false);
  assert.equal(canUndo(null, 5), false);
  assert.equal(undoLeftMs(1000, 999999), 0);
  assert.equal(formatLeft(112000), "1:52");
  assert.equal(formatLeft(0), "0:00");
  assert.equal(formatLeft(61), "0:01");
});

test("undo puts back the earlier result, or reopens the match when there was none", () => {
  assert.deepEqual(undoBody({ matchId: "m1", savedAt: 0, prev: { status: "finished", scoreA: 3, scoreB: 2, winner: "a" } }), { status: "finished", scoreA: 3, scoreB: 2 });
  assert.deepEqual(undoBody({ matchId: "m1", savedAt: 0, prev: { status: "forfeit", scoreA: null, scoreB: null, winner: "b" } }), { status: "forfeit", winner: "b" });
  assert.deepEqual(undoBody({ matchId: "m1", savedAt: 0, prev: null }), { status: "live", undo: true, scoreA: null, scoreB: null });
  assert.deepEqual(undoBody({ matchId: "m1", savedAt: 0, prev: { status: "live", scoreA: 4, scoreB: 1, winner: null } }), { status: "live", undo: true, scoreA: 4, scoreB: 1 });
});

test("the queue keeps one waiting item per match, so a fixed typo sends once", () => {
  const first = item({ id: "a", body: { status: "finished", scoreA: 1, scoreB: 0 } });
  const other = item({ id: "b", key: resultKey("m2"), matchId: "m2" });
  const fix = item({ id: "c", body: { status: "finished", scoreA: 2, scoreB: 0 } });
  const q = enqueue(enqueue(enqueue([], first), other), fix);
  assert.deepEqual(q.map((x) => x.id), ["b", "c"]);
  assert.notEqual(brKey(1), brKey(2));
  assert.notEqual(brKey(1), resultKey("1"));
});

test("a saved queue is read defensively", () => {
  assert.deepEqual(parseQueue(null), []);
  assert.deepEqual(parseQueue("{not json"), []);
  assert.deepEqual(parseQueue('{"a":1}'), []);
  const good = item({ id: "ok" });
  const out = parseQueue(JSON.stringify([good, 5, null, { id: 1 }, { ...good, kind: "weird", id: "w" }, { ...good, matchId: undefined, id: "nomatch" }]));
  assert.deepEqual(out.map((x) => x.id), ["ok"]);
  assert.match(queueStorageKey("abc"), /^eh-score-queue-/);
  assert.notEqual(queueStorageKey("abc"), queueStorageKey("abd"));
  assert.ok(!queueStorageKey("secrettoken").includes("secret"));
});

test("failures: no signal, busy or broken server retry; a refusal does not", () => {
  assert.equal(classifyFailure(undefined), "retry");
  assert.equal(classifyFailure(0), "retry");
  assert.equal(classifyFailure(408), "retry");
  assert.equal(classifyFailure(429), "retry");
  assert.equal(classifyFailure(503), "retry");
  assert.equal(classifyFailure(400), "drop");
  assert.equal(classifyFailure(404), "drop");
  assert.equal(classifyFailure(409), "drop");
});

test("sending: in order, stops at the first retryable failure, reports refusals", async () => {
  const q = [item({ id: "1" }), item({ id: "2" }), item({ id: "3" }), item({ id: "4" })];
  const seen = [];
  const r = await sendQueue(q, async (it) => {
    seen.push(it.id);
    if (it.id === "2") throw Object.assign(new Error("no"), { status: 409 });
    if (it.id === "3") throw Object.assign(new Error("offline"), { status: 0 });
  });
  assert.deepEqual(seen, ["1", "2", "3"]);
  assert.deepEqual(r.sent.map((x) => x.id), ["1"]);
  assert.deepEqual(r.rejected.map((x) => [x.item.id, x.status]), [["2", 409]]);
  assert.deepEqual(r.remaining.map((x) => x.id), ["3", "4"]);
  const all = await sendQueue(q, async () => undefined);
  assert.equal(all.remaining.length, 0);
  assert.equal(all.sent.length, 4);
});

test("waiting results show on top of the server's matches", () => {
  const ms = [m({ id: "m1" }), m({ id: "m2", status: "live", scoreA: 1, scoreB: 1 })];
  const q = [item({ body: { status: "finished", scoreA: 13, scoreB: 9 } }), item({ id: "z", key: resultKey("m2"), matchId: "m2", body: { status: "forfeit", winner: "b" } })];
  const out = overlayQueue(ms, q);
  assert.deepEqual([out[0].status, out[0].scoreA, out[0].scoreB, out[0].winner], ["finished", 13, 9, "a"]);
  assert.deepEqual([out[1].status, out[1].winner], ["forfeit", "b"]);
  assert.equal(overlayQueue(ms, []), ms);
  assert.equal(ms[0].status, "scheduled");
});

test("match list: live first, ready before undecided, finished apart and newest first", () => {
  const list = [
    m({ id: "tbd", a: "", b: "" }),
    m({ id: "later", startsAt: "2026-12-01T12:00:00Z", slot: 2 }),
    m({ id: "soon", startsAt: "2026-12-01T10:00:00Z", slot: 3 }),
    m({ id: "live", status: "live", slot: 9 }),
    m({ id: "d1", status: "finished", scoreA: 1, scoreB: 0, round: 1 }),
    m({ id: "d2", status: "forfeit", winner: "a", round: 2 }),
  ];
  const { toPlay, done } = splitMatches(list);
  assert.deepEqual(toPlay.map((x) => x.id), ["live", "soon", "later", "tbd"]);
  assert.deepEqual(done.map((x) => x.id), ["d2", "d1"]);
});

const row = (team, placement, kills = "") => ({ team, placement, kills });

test("battle royale: duplicates, bad numbers and empty forms are caught with the team named", () => {
  const ok = validateBr([row("A", "2", "5"), row("B", "1", "7"), row("C", "", "")]);
  assert.equal(ok.ok, true);
  assert.deepEqual(ok.rows, [{ team: "B", placement: 1, kills: 7 }, { team: "A", placement: 2, kills: 5 }]);
  assert.equal(ok.message, null);

  const dup = validateBr([row("A", "1", "2"), row("B", "1", "3"), row("C", "2", "0")]);
  assert.equal(dup.ok, false);
  assert.match(dup.errors.B, /Placement 1 is already used by A/);
  assert.match(dup.errors.A, /also used by B/);
  assert.match(dup.message, /Fix 2 teams/);

  assert.match(validateBr([row("A", "", "3")]).errors.A, /Enter a placement/);
  assert.match(validateBr([row("A", "x", "")]).errors.A, /whole number/);
  assert.match(validateBr([row("A", "0", ""), row("B", "2", "")]).errors.A, /1 to 2/);
  assert.match(validateBr([row("A", "3", ""), row("B", "1", "")]).errors.A, /1 to 2/);
  assert.match(validateBr([row("A", "1", "abc")]).errors.A, /Kills/);
  assert.match(validateBr([row("A", "1", "100")]).errors.A, /0 to 99/);
  const none = validateBr([row("A", "", ""), row("B", "", "")]);
  assert.equal(none.ok, false);
  assert.match(none.message, /at least one team/);
  assert.equal(validateBr([row("A", "1", "")]).rows[0].kills, 0);
});

test("battle royale form follows the chosen match number", () => {
  const saved = [{ matchNo: 1, team: "A", placement: 2, kills: 4 }, { matchNo: 2, team: "B", placement: 1, kills: 9 }];
  assert.deepEqual(brFormFor(["A", "B"], saved, 1), [row("A", "2", "4"), row("B", "", "")]);
  assert.deepEqual(brFormFor(["A", "B"], saved, 3), [row("A", "", ""), row("B", "", "")]);
  assert.equal(nextBrMatchNo(saved), 3);
  assert.equal(nextBrMatchNo([]), 1);
});

test("sharing: the link, the WhatsApp text and the state of a link in plain words", () => {
  assert.equal(scoreUrl("https://esports.streamerosai.com/", "abc_-"), "https://esports.streamerosai.com/score/?t=abc_-");
  const t = whatsappText("Lobby A referee", "Spring Cup", "https://x/score/?t=1", 12);
  assert.match(t, /Lobby A referee at Spring Cup/);
  assert.match(t, /12 hours/);
  assert.match(whatsappText("a", "b", "u", 1), /1 hour,/);
  assert.ok(whatsappUrl(t).startsWith("https://wa.me/?text="));
  const now = Date.parse("2026-12-01T10:00:00Z");
  assert.equal(linkStateText({ state: "revoked", expiresAt: "2099-01-01T00:00:00Z" }, now), "Revoked");
  assert.equal(linkStateText({ state: "expired", expiresAt: "2026-01-01T00:00:00Z" }, now), "Expired");
  assert.equal(linkStateText({ state: "active", expiresAt: "2026-12-01T13:20:00Z" }, now), "3 h 20 min left");
  assert.equal(linkStateText({ state: "active", expiresAt: "2026-12-01T10:25:00Z" }, now), "25 min left");
  assert.equal(linkStateText({ state: "active", expiresAt: "2026-12-01T09:00:00Z" }, now), "Expired");
});
