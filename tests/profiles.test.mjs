// Run: node --import tsx --test tests/profiles.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { checkLink, checkLinks, dateText, entryLines, isSlug, linkLabel, ordinal, personalProblem, recordText, summarize, teamResults, teamUrl } from "../src/lib/profiles.ts";

const m = (o) => ({ id: "x", stage: "main", round: 1, slot: 1, a: "", b: "", status: "finished", scoreA: null, scoreB: null, startsAt: null, ...o });

test("links: https only, allowed sites only, no logins", () => {
  assert.deepEqual(checkLink("https://www.instagram.com/team"), { ok: true, url: "https://www.instagram.com/team" });
  assert.equal(checkLink("https://discord.gg/abc").ok, true);
  assert.equal(checkLink("https://m.facebook.com/team").ok, true);
  for (const bad of ["", "http://instagram.com/a", "https://evil.com/instagram.com", "https://instagram.com.evil.com/", "https://u:p@instagram.com/a", "javascript:alert(1)", "instagram.com/a", "https://notx.com/a", "https://x.com/" + "a".repeat(250)]) {
    assert.equal(checkLink(bad).ok, false, bad);
  }
});

test("checkLinks drops blanks and duplicates, reports the first problem and caps at five", () => {
  assert.deepEqual(checkLinks(["", "https://x.com/a", "https://x.com/a"]), { urls: ["https://x.com/a"], error: "" });
  assert.match(checkLinks(["https://x.com/a", "http://x.com/b"]).error, /https/);
  const six = Array.from({ length: 6 }, (_, i) => `https://x.com/${i}`);
  const r = checkLinks(six);
  assert.equal(r.urls.length, 5);
  assert.match(r.error, /at most 5/);
});

test("link labels and slugs", () => {
  assert.equal(linkLabel("https://youtube.com/@a"), "YouTube");
  assert.equal(linkLabel("https://twitter.com/a"), "X");
  assert.equal(linkLabel("nonsense"), "Link");
  assert.equal(isSlug("abcdefghijkl"), true);
  assert.equal(isSlug("ABCDEFGHIJKL"), false);
  assert.equal(isSlug("short"), false);
  assert.equal(isSlug(null), false);
  assert.equal(teamUrl("https://h.example/", "abcdefghijkl"), "https://h.example/team/?s=abcdefghijkl");
});

test("personal details are flagged in free text", () => {
  assert.match(personalProblem("write to cap@example.com"), /email/);
  assert.match(personalProblem("call +91 98765 43210"), /phone/);
  assert.equal(personalProblem("Founded in 2024, 3 titles, 12 wins"), "");
});

test("teamResults counts finished matches and battle royale rows, ignoring case and unfinished matches", () => {
  const r = teamResults("alpha wolves", [
    m({ a: "Alpha Wolves", b: "B", scoreA: 2, scoreB: 1 }),
    m({ a: "C", b: "Alpha Wolves", scoreA: 3, scoreB: 0, winner: "a" }),
    m({ a: "Alpha Wolves", b: "D", scoreA: 1, scoreB: 1 }),
    m({ a: "Alpha Wolves", b: "E", status: "scheduled" }),
    m({ a: "Alpha Wolves", b: "F", status: "forfeit", winner: "a" }),
    m({ a: "X", b: "Y", scoreA: 1, scoreB: 0 }),
  ], [{ matchNo: 1, team: "Alpha Wolves", placement: 3, kills: 2 }, { matchNo: 2, team: "ALPHA WOLVES", placement: 1, kills: 5 }, { matchNo: 1, team: "Z", placement: 1, kills: 9 }]);
  assert.deepEqual(r.record, { played: 4, wins: 2, draws: 1, losses: 1 });
  assert.deepEqual(r.br, { matches: 2, bestPlacement: 1, kills: 7 });
  assert.deepEqual(teamResults("Nobody", [m({ a: "A", b: "B", scoreA: 1, scoreB: 0 })], []), { record: null, br: null });
});

test("summary adds events up and keeps the best finish", () => {
  const s = summarize([
    { eventName: "A", date: "2026-01-01", record: { played: 3, wins: 2, draws: 0, losses: 1 }, br: null },
    { eventName: "B", date: "2026-02-01", record: null, br: { matches: 4, bestPlacement: 2, kills: 10 } },
    { eventName: "C", date: "2026-03-01", record: { played: 1, wins: 0, draws: 1, losses: 0 }, br: { matches: 2, bestPlacement: 5, kills: 1 } },
  ]);
  assert.deepEqual(s, { events: 3, played: 4, wins: 2, draws: 1, losses: 1, brMatches: 6, bestPlacement: 2 });
  assert.deepEqual(summarize([]), { events: 0, played: 0, wins: 0, draws: 0, losses: 0, brMatches: 0, bestPlacement: null });
});

test("plain-word texts", () => {
  assert.equal(recordText({ played: 1, wins: 1, draws: 0, losses: 0 }), "1 match: 1 won, 0 drawn, 0 lost");
  assert.deepEqual(entryLines({ eventName: "E", date: "", record: null, br: null }), ["No results yet"]);
  assert.match(entryLines({ eventName: "E", date: "", record: null, br: { matches: 1, bestPlacement: 2, kills: 1 } })[0], /best finish 2nd in 1 match, 1 kill$/);
  assert.deepEqual([1, 2, 3, 4, 11, 12, 13, 21, 22].map(ordinal), ["1st", "2nd", "3rd", "4th", "11th", "12th", "13th", "21st", "22nd"]);
  assert.equal(dateText("2026-12-01"), "1 Dec 2026");
  assert.equal(dateText("soon"), "soon");
});
