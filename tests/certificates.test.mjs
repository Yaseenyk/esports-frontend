// Run: npx tsx --test tests/certificates.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { parseCertQuery, parseAwardLines, parseEntry, normaliseAward, entriesToText, awardFor, clean } from "../src/lib/certificates.ts";

test("awards query becomes one row per award", () => {
  const q = parseCertQuery("?awards=Winner:Team A|Runner-up:Team B|Third place:Team C");
  assert.equal(q.source, "awards");
  assert.deepEqual(q.rows, [{ name: "Team A", award: "Winner" }, { name: "Team B", award: "Runner-up" }, { name: "Team C", award: "Third place" }]);
});

test("plain names get Participation", () => {
  const q = parseCertQuery("?names=Asha|Ravi");
  assert.equal(q.source, "names");
  assert.deepEqual(q.rows, [{ name: "Asha", award: "Participation" }, { name: "Ravi", award: "Participation" }]);
});

test("awards wins over names; nothing usable gives no rows", () => {
  assert.equal(parseCertQuery("?awards=Winner:X&names=Y").rows[0].name, "X");
  assert.deepEqual(parseCertQuery("?awards=|:|&names="), { rows: [], source: null });
  assert.deepEqual(parseCertQuery(""), { rows: [], source: null });
});

test("defensive: caps, control characters, odd award spellings", () => {
  const many = Array.from({ length: 150 }, (_, i) => `Winner:P${i}`).join("|");
  assert.equal(parseCertQuery(`?awards=${encodeURIComponent(many)}`).rows.length, 100);
  const long = parseCertQuery(`?awards=Winner:${"x".repeat(200)}`).rows[0];
  assert.equal(long.name.length, 80);
  assert.equal(clean("A\u0000B\u0007\nC", 80), "A B C");
  assert.equal(parseEntry("Winner: <b>Hi</b>").name, "<b>Hi</b>");
  assert.equal(normaliseAward("runner up"), "Runner-up"); assert.equal(normaliseAward("1st"), "Winner"); assert.equal(normaliseAward("Best Rookie"), "Best Rookie");
});

test("textarea lines: award is optional, first colon splits, blank lines skipped", () => {
  const rows = parseAwardLines("Winner: Team A\n\nAsha Verma\nBest Player: Ravi: the Great\r\n  :  \n");
  assert.deepEqual(rows, [{ name: "Team A", award: "Winner" }, { name: "Asha Verma", award: "" }, { name: "Ravi: the Great", award: "Best Player" }]);
  assert.equal(entriesToText(rows), "Winner: Team A\nAsha Verma\nBest Player: Ravi: the Great");
  assert.equal(awardFor(rows[1], "Participant"), "Participant"); assert.equal(awardFor(rows[0], "Participant"), "Winner");
});
