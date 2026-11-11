// Run: node --import tsx --test tests/results.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { MAX_PROOF_CHARS, checkProofDataUrl, checkProofFile, checkScores, claimsAgree, disputedMatches, fitWidth, fromSides, outcomeText, reportError, reportUrl, sortQueue, statusLabel, statusText, stepScore, toSides, tokenFromSearch, whatsappText, PROOF_ATTEMPTS } from "../src/lib/results.ts";

test("the token comes from ?t= and must look like a token", () => {
  const t = "abcdefghijklmnopqrstuvwx";
  assert.equal(tokenFromSearch(`?t=${t}`), t);
  assert.equal(tokenFromSearch("?t=short"), null);
  assert.equal(tokenFromSearch(""), null);
  assert.equal(tokenFromSearch(`?t=${"a".repeat(65)}`), null);
  assert.equal(tokenFromSearch("?t=has space has space has space"), null);
});

test("the report link keeps the token in the query", () => {
  assert.equal(reportUrl("https://x.test/", "abc_-"), "https://x.test/report/?t=abc_-");
});

test("scores are whole numbers from 0 to 999", () => {
  assert.deepEqual(checkScores(2, 1), { ok: true, a: 2, b: 1 });
  assert.deepEqual(checkScores("3", " 0 "), { ok: true, a: 3, b: 0 });
  assert.equal(checkScores(-1, 0).ok, false);
  assert.equal(checkScores(1.5, 0).ok, false);
  assert.equal(checkScores("", 0).ok, false);
  assert.equal(checkScores("abc", 1).ok, false);
  assert.equal(checkScores(1000, 0).ok, false);
  assert.equal(checkScores(999, 999).ok, true);
  assert.match(checkScores(null, 1).message, /whole numbers/);
});

test("the stepper never leaves 0 to 999", () => {
  assert.equal(stepScore(0, -1), 0);
  assert.equal(stepScore(999, 1), 999);
  assert.equal(stepScore(4, 1), 5);
  assert.equal(stepScore(NaN, 1), 1);
});

test("my score and their score map to the match sides and back", () => {
  assert.deepEqual(toSides("a", 3, 1), { scoreA: 3, scoreB: 1 });
  assert.deepEqual(toSides("b", 3, 1), { scoreA: 1, scoreB: 3 });
  assert.deepEqual(fromSides("b", 1, 3), { mine: 3, theirs: 1 });
  assert.deepEqual(fromSides("a", 1, 3), { mine: 1, theirs: 3 });
});

test("outcome sentences are plain", () => {
  assert.equal(outcomeText(2, 1, "Beta"), "You won 2 to 1 against Beta");
  assert.equal(outcomeText(0, 3, "Beta"), "You lost 0 to 3 against Beta");
  assert.equal(outcomeText(1, 1, ""), "A draw, 1 all, against the other team");
});

const claim = (id, matchId, team, scoreA, scoreB, status = "pending") => ({ id, matchId, team, scoreA, scoreB, status });

test("a dispute is two pending claims from different teams with different scores", () => {
  const d = disputedMatches([claim("1", "m1", "Alpha", 2, 1), claim("2", "m1", "Beta", 1, 2), claim("3", "m2", "Gamma", 1, 0), claim("4", "m2", "Delta", 1, 0), claim("5", "m3", "Eps", 1, 0)]);
  assert.deepEqual([...d], ["m1"]);
  assert.equal(disputedMatches([claim("1", "m1", "Alpha", 2, 1), claim("2", "m1", "Beta", 1, 2, "rejected")]).size, 0);
  assert.equal(disputedMatches([]).size, 0);
  assert.equal(claimsAgree({ scoreA: 1, scoreB: 2 }, { scoreA: 1, scoreB: 2 }), true);
  assert.equal(claimsAgree({ scoreA: 1, scoreB: 2 }, { scoreA: 2, scoreB: 1 }), false);
});

test("status words say what happens next", () => {
  assert.match(statusText("pending"), /Waiting for approval/);
  assert.match(statusText("approved"), /recorded/);
  assert.match(statusText("rejected", "blurry"), /blurry/);
  assert.match(statusText("rejected"), /send it again/);
  assert.equal(statusLabel("rejected"), "Not accepted");
});

test("the WhatsApp text has the link on its own line and warns not to share it", () => {
  const t = whatsappText("Alpha Wolves", "Spring Cup", "https://x.test/report/?t=abc");
  assert.ok(t.endsWith("\nhttps://x.test/report/?t=abc"));
  assert.match(t, /Alpha Wolves/);
  assert.match(t, /Spring Cup/);
  assert.match(t, /do not share/);
  assert.match(whatsappText("", "", "u"), /your team/);
});

test("proof files and data URLs are checked like the server does", () => {
  assert.equal(checkProofFile("image/png", 1000).ok, true);
  assert.equal(checkProofFile("application/pdf", 1000).ok, false);
  assert.equal(checkProofFile("image/jpeg", 0).ok, false);
  assert.equal(checkProofFile("image/jpeg", 13_000_000).ok, false);
  assert.equal(checkProofDataUrl("data:image/jpeg;base64,AAAA").ok, true);
  assert.equal(checkProofDataUrl("data:image/gif;base64,AAAA").ok, false);
  assert.equal(checkProofDataUrl("data:text/html;base64,AAAA").ok, false);
  assert.equal(checkProofDataUrl("data:image/png;base64," + "A".repeat(MAX_PROOF_CHARS)).ok, false);
  assert.equal(checkProofDataUrl("data:image/png;base64," + "A".repeat(MAX_PROOF_CHARS - 30)).ok, true);
});

test("shrinking tries smaller and smaller and never enlarges", () => {
  for (let i = 1; i < PROOF_ATTEMPTS.length; i++) {
    assert.ok(PROOF_ATTEMPTS[i].width < PROOF_ATTEMPTS[i - 1].width);
    assert.ok(PROOF_ATTEMPTS[i].quality < PROOF_ATTEMPTS[i - 1].quality);
  }
  assert.deepEqual(fitWidth(2000, 1000, 1000), { w: 1000, h: 500 });
  assert.deepEqual(fitWidth(400, 300, 1000), { w: 400, h: 300 });
  assert.deepEqual(fitWidth(0, 5, 100), { w: 1, h: 1 });
});

test("errors are explained in plain words", () => {
  assert.match(reportError(404), /new one/);
  assert.match(reportError(409, "This match already has a result."), /already has a result/);
  assert.match(reportError(413), /too big/);
  assert.match(reportError(415), /PNG/);
  assert.match(reportError(429), /Wait/);
  assert.match(reportError(500), /Nothing was sent/);
  assert.match(reportError(undefined), /Nothing was sent/);
});

test("the queue puts disputes first, then the oldest pending, then decided newest first", () => {
  const q = sortQueue([
    { id: "d1", status: "approved", createdAt: "2026-01-01T01:00:00Z" },
    { id: "p2", status: "pending", createdAt: "2026-01-01T03:00:00Z" },
    { id: "d2", status: "rejected", createdAt: "2026-01-01T02:00:00Z" },
    { id: "p1", status: "pending", createdAt: "2026-01-01T02:00:00Z" },
    { id: "x", status: "pending", disputed: true, createdAt: "2026-01-01T04:00:00Z" },
  ]);
  assert.deepEqual(q.map((i) => i.id), ["x", "p1", "p2", "d2", "d1"]);
});
