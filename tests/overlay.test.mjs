// Run: node --import tsx --test tests/overlay.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_OVERLAY, OVERLAY_VIEWS, availableViews, buildOverlayUrl, clockText, lowerThird, matchBoard, parseOverlayParams, payloadOf, viewAvailability } from "../src/lib/overlay.ts";

const table = (head, rows) => ({ v: "table", d: { title: "T", head, rows } });
const snap = (over = {}) => ({ views: [], announcements: [], sponsors: [], ticker: [], ...over });
const m = (o) => ({ id: "x", stage: "main", round: 1, slot: 1, a: "Alpha", b: "Bravo", status: "scheduled", scoreA: null, scoreB: null, startsAt: null, ...o });
const TZ = { timeZone: "UTC" };

test("parse: defaults and validation of every parameter", () => {
  assert.deepEqual(parseOverlayParams(""), DEFAULT_OVERLAY);
  const p = parseOverlayParams("?e=Abc-123&v=bracket&theme=neon&bg=solid&scale=1.5&team=%20Team%20%20Red%20");
  assert.deepEqual(p, { e: "abc-123", v: "bracket", theme: "neon", bg: "solid", scale: 1.5, team: "Team Red" });
  assert.equal(parseOverlayParams("e=../../x").e, "");
  assert.equal(parseOverlayParams("e=ab").e, "");
  assert.equal(parseOverlayParams("v=hacked").v, "standings");
  assert.equal(parseOverlayParams("theme=nope").theme, "dark");
  assert.equal(parseOverlayParams("bg=ff0000").bg, "transparent");
  assert.equal(parseOverlayParams("scale=99").scale, 2.5);
  assert.equal(parseOverlayParams("scale=0").scale, 0.5);
  assert.equal(parseOverlayParams("scale=abc").scale, 1);
  assert.equal(parseOverlayParams("scale=").scale, 1);
  assert.equal(parseOverlayParams("team=" + "x".repeat(200)).team.length, 60);
  assert.equal(parseOverlayParams("team=a%00b%0Ac").team, "a b c");
  assert.equal(parseOverlayParams(new URLSearchParams("v=ticker")).v, "ticker");
});

test("every view name round-trips through the link", () => {
  for (const v of OVERLAY_VIEWS) assert.equal(parseOverlayParams(buildOverlayUrl("https://x.test", { e: "demo1", v }).split("?")[1]).v, v);
});

test("build: short link by default, options only when changed, round-trips", () => {
  assert.equal(buildOverlayUrl("https://x.test/", { e: "demo1", v: "standings" }), "https://x.test/overlay/?e=demo1&v=standings");
  const url = buildOverlayUrl("https://x.test", { e: "demo1", v: "nextmatch", theme: "gold", bg: "solid", scale: 1.25, team: "Team Red & Co" });
  assert.equal(url, "https://x.test/overlay/?e=demo1&v=nextmatch&theme=gold&bg=solid&scale=1.25&team=Team+Red+%26+Co");
  assert.deepEqual(parseOverlayParams(url.split("?")[1]), { e: "demo1", v: "nextmatch", theme: "gold", bg: "solid", scale: 1.25, team: "Team Red & Co" });
});

test("build: invalid options are cleaned, never written into the link", () => {
  const url = buildOverlayUrl("https://x.test", { e: "demo1", v: "nope", theme: "zzz", scale: 50 });
  assert.equal(url, "https://x.test/overlay/?e=demo1&v=standings&scale=2.5");
});

test("availability comes from the snapshot and the matches", () => {
  const none = viewAvailability(snap());
  assert.ok(OVERLAY_VIEWS.every((v) => none[v] === false));
  const s = snap({ views: [{ kind: "standings", payload: table(["#", "Team"], [["1", "A"]]) }, { kind: "schedule", payload: { v: "schedule", d: { title: "S", slots: [] } } }], ticker: ["hi"] });
  const a = viewAvailability(s);
  assert.deepEqual([a.standings, a.league, a.schedule, a.bracket, a.countdown, a.matches, a.nextmatch, a.ticker, a.sponsors], [true, false, true, false, false, false, true, true, false]);
  assert.deepEqual(availableViews(snap({ sponsors: [{ name: "Acme" }] }), [m({})]), ["matches", "nextmatch", "sponsors"]);
  assert.equal(payloadOf(s, "league"), null);
  assert.equal(payloadOf(null, "league"), null);
});

test("clockText writes a friendly time", () => {
  assert.equal(clockText("2026-12-01T15:40:00Z", TZ), "3:40 pm");
  assert.equal(clockText("2026-12-01T09:05:00Z", TZ), "9:05 am");
  assert.equal(clockText(null), "");
  assert.equal(clockText("nope"), "");
});

test("lower third: live match wins and shows the score", () => {
  const ms = [m({ id: "1", status: "live", scoreA: 7, scoreB: 5 }), m({ id: "2", a: "C", b: "D", startsAt: "2026-12-01T15:40:00Z" })];
  const t = lowerThird(ms, null, "", new Date(), TZ);
  assert.equal(t.kind, "live");
  assert.equal(t.text, "LIVE: Alpha 7 - 5 Bravo");
});

test("lower third: a live match with no score yet says vs", () => {
  assert.equal(lowerThird([m({ status: "live" })], null).text, "LIVE: Alpha vs Bravo");
});

test("lower third: next match with a time, earliest first, unplayed only", () => {
  const ms = [
    m({ id: "1", a: "Done", b: "Over", status: "finished", scoreA: 1, scoreB: 0 }),
    m({ id: "2", a: "Late", b: "Team", startsAt: "2026-12-01T18:00:00Z" }),
    m({ id: "3", a: "C", b: "D", startsAt: "2026-12-01T15:40:00Z" }),
  ];
  assert.equal(lowerThird(ms, null, "", new Date(), TZ).text, "NEXT: C vs D at 3:40 pm");
});

test("lower third: no time and no team name read plainly", () => {
  assert.equal(lowerThird([m({ a: "Alpha", b: "" })], null).text, "NEXT: Alpha vs TBD");
});

test("lower third: team filter and finished matches", () => {
  const ms = [m({ id: "1", a: "X", b: "Y", status: "live", scoreA: 1, scoreB: 1 }), m({ id: "2", a: "Red", b: "Blue", round: 2, startsAt: "2026-12-01T15:40:00Z" })];
  assert.equal(lowerThird(ms, null, "red", new Date(), TZ).text, "NEXT: Red vs Blue at 3:40 pm");
  assert.equal(lowerThird(ms, null, "Nobody").kind, "none");
  assert.equal(lowerThird([m({ status: "finished", scoreA: 1, scoreB: 0 })], null).kind, "none");
  assert.equal(lowerThird([], null).kind, "none");
});

test("lower third: falls back to the published schedule", () => {
  const day = "2026-12-01";
  const s = snap({ views: [{ kind: "schedule", payload: { v: "schedule", d: { title: "S", date: day, slots: [{ n: 1, start: "10:00", end: "11:00", label: "Alpha vs Bravo" }, { n: 2, start: "12:00", end: "13:00", label: "Red vs Blue" }] } } }] });
  assert.equal(lowerThird([], s, "", new Date(2026, 11, 1, 10, 30)).text, "LIVE: Alpha vs Bravo");
  assert.equal(lowerThird([], s, "", new Date(2026, 11, 1, 11, 30)).text, "NEXT: Red vs Blue at 12:00");
  assert.equal(lowerThird([], s, "red", new Date(2026, 11, 1, 10, 30)).text, "NEXT: Red vs Blue at 12:00");
  assert.equal(lowerThird([], s, "", new Date(2026, 11, 1, 20, 0)).kind, "none");
});

test("matchBoard: live, next in order, recent newest first, team filter, blank matches skipped", () => {
  const ms = [
    m({ id: "a", round: 1, status: "finished", scoreA: 2, scoreB: 1 }),
    m({ id: "b", round: 2, status: "finished", scoreA: 0, scoreB: 3, a: "C", b: "D" }),
    m({ id: "c", round: 3, status: "live", a: "E", b: "F" }),
    m({ id: "d", round: 4, a: "G", b: "H" }),
    m({ id: "e", round: 5, a: "", b: "" }),
  ];
  const b = matchBoard(ms);
  assert.deepEqual(b.live.map((x) => x.id), ["c"]);
  assert.deepEqual(b.next.map((x) => x.id), ["d"]);
  assert.deepEqual(b.recent.map((x) => x.id), ["b", "a"]);
  assert.deepEqual(matchBoard(ms, "alpha").recent.map((x) => x.id), ["a"]);
  assert.equal(matchBoard([]).live.length, 0);
});
