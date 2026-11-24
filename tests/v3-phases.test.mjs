// Phases 3-5 (24 Nov 2026): profiles, scrim finder, tournament directory. Pure pieces only (adapters, time, filters, the index rule).
import test from "node:test";
import assert from "node:assert/strict";
import { deviceToUtcIso, istDayRange, istToUtcIso, slotTimeText, todayIst } from "../src/features/scrims/time.ts";
import { boardSearch, parseBoardFilters, validateSlotForm, EMPTY_FORM } from "../src/features/scrims/filters.ts";
import { boardQuery, toBoardPage, toIncoming, toMySlot, toSent, toSlot } from "../src/features/scrims/services/scrims.api.ts";
import { toOwnPlayerPage, toOwnTeamPage, toPlayerPage, toTeamPage, toTeamPageList, toVisibility } from "../src/features/profiles/services/profiles.adapter.ts";
import { BLOCKER_TEXT, VISIBILITY_CHOICES, visibilityLabel } from "../src/features/profiles/domain.ts";
import { MIN_UPCOMING_FOR_INDEX, directoryIndexable, filterItems, isUpcoming, safeRegisterUrl } from "../src/features/directory/domain.ts";
import { toDirectory, toItem } from "../src/features/directory/services/directory.api.ts";

// ---------------- scrims: time ----------------
test("IST input is stored as UTC (IST = UTC+05:30, no daylight saving)", () => {
  assert.equal(istToUtcIso("2026-12-06", "21:00"), "2026-12-06T15:30:00.000Z");
  assert.equal(istToUtcIso("2026-12-06", "02:00"), "2026-12-05T20:30:00.000Z");
  for (const [d, t] of [["2026-13-01", "10:00"], ["2026-12-06", "25:00"], ["06-12-2026", "10:00"], ["", ""]]) assert.equal(istToUtcIso(d, t), null);
  assert.match(deviceToUtcIso("2026-12-06", "21:00") ?? "", /^2026-12-0[56]T/);
});
test("a board day is the whole India day as a UTC range", () => {
  assert.deepEqual(istDayRange("2026-12-06"), { from: "2026-12-05T18:30:00.000Z", to: "2026-12-06T18:30:00.000Z" });
  assert.equal(istDayRange("nope"), null);
});
test("today in India and times shown in IST by default", () => {
  assert.equal(todayIst(Date.parse("2026-12-05T19:00:00Z")), "2026-12-06"); // 00:30 IST next day
  assert.equal(todayIst(Date.parse("2026-12-05T18:00:00Z")), "2026-12-05");
  const s = slotTimeText("2026-12-06T15:30:00.000Z");
  assert.match(s, /IST$/);
  assert.match(s, /9:00/);
  assert.match(slotTimeText("2026-12-06T15:30:00.000Z", "device"), /your time/);
  assert.equal(slotTimeText(null), "");
});

// ---------------- scrims: filters and form ----------------
test("board filters round-trip through the query string; a bad day is dropped", () => {
  const f = parseBoardFilters("?game=bgmi&region=india&day=2026-12-06&x=1");
  assert.deepEqual(f, { game: "bgmi", region: "india", day: "2026-12-06" });
  assert.equal(boardSearch(f), "?game=bgmi&region=india&day=2026-12-06");
  assert.equal(parseBoardFilters("?day=tomorrow").day, "");
  assert.equal(boardSearch({ game: "", region: "", day: "" }), "");
});
test("the API query sends the India day as a UTC range", () => {
  const q = new URLSearchParams(boardQuery({ game: "bgmi", region: "", day: "2026-12-06" }, "c1").slice(1));
  assert.equal(q.get("from"), "2026-12-05T18:30:00.000Z");
  assert.equal(q.get("to"), "2026-12-06T18:30:00.000Z");
  assert.equal(q.get("cursor"), "c1");
  assert.equal(q.get("region"), null);
});
test("post-a-scrim checks: team, game, time window, slots, a handle not an email", () => {
  const now = Date.parse("2026-12-01T00:00:00Z");
  const e = validateSlotForm({ ...EMPTY_FORM }, now);
  assert.ok(e.teamProfileId && e.game && e.day);
  const ok = { ...EMPTY_FORM, teamProfileId: "t1", game: "bgmi", day: "2026-12-02", time: "21:00", slots: "4", contact: "capt#1" };
  assert.deepEqual(validateSlotForm(ok, now), {});
  assert.match(validateSlotForm({ ...ok, day: "2026-12-01", time: "05:35" }, now).day ?? "", /15 minutes/); // 00:05 UTC
  assert.match(validateSlotForm({ ...ok, day: "2027-01-15" }, now).day ?? "", /30 days/);
  assert.ok(validateSlotForm({ ...ok, slots: "25" }, now).slots);
  assert.match(validateSlotForm({ ...ok, contact: "me@example.com" }, now).contact ?? "", /email/);
});

// ---------------- scrims: adapters ----------------
const SLOT = { id: "s1", game: "bgmi", startsAt: "2026-12-06T15:30:00.000Z", region: "india", server: null, skillNote: "T2", slotsTotal: 2, slotsLeft: 1, teamName: "Alpha", createdAt: "2026-12-01T00:00:00.000Z" };
test("slot adapters: bad rows are dropped, own fields only on my slots", () => {
  assert.equal(toSlot({ id: 3 }), null);
  assert.deepEqual(toBoardPage({ items: [SLOT, { nope: 1 }], nextCursor: "c" }).items.map((s) => s.id), ["s1"]);
  assert.equal(toSlot(SLOT).mine, false);
  const mine = toMySlot({ ...SLOT, status: "full", expired: false, hidden: false, contact: "alpha#1", requests: { pending: 2, accepted: 1 } });
  assert.deepEqual([mine.status, mine.contact, mine.requests.pending], ["full", "alpha#1", 2]);
});
test("a contact is only ever kept on an ACCEPTED request (even if a server sent one by mistake)", () => {
  assert.equal(toIncoming({ id: "q", status: "sent", contact: "leak" }).contact, null);
  assert.equal(toIncoming({ id: "q", status: "accepted", contact: "beta" }).contact, "beta");
  assert.equal(toSent({ id: "q", status: "declined", contact: "leak" }).contact, null);
  assert.equal(toSent({ id: "q", status: "accepted", contact: "alpha" }).contact, "alpha");
});

// ---------------- profiles ----------------
test("visibility words: Private (default), Link only, Public", () => {
  assert.deepEqual(VISIBILITY_CHOICES.map((c) => c.label), ["Private", "Link only", "Public"]);
  assert.equal(toVisibility("weird"), "private");
  assert.equal(visibilityLabel("unlisted"), "Link only");
  for (const k of ["not_public", "no_verified_results", "adult_required", "consent_required", "hidden_by_moderation"]) assert.ok(BLOCKER_TEXT[k], k);
});
const PLAYER = {
  kind: "player", slug: "ravi", handle: "Ravi", bio: null, city: "Pune", state: null, languages: ["Hindi", 4], games: [{ game: "bgmi", inGameName: "R", rankCode: null, rankOrdinal: null, roles: ["igl"] }],
  stats: { tournaments: 1, matches: { played: 1, wins: 1, losses: 0, draws: 0 }, battleRoyale: { matches: 0, wins: 0, kills: 0, bestPlacement: null } }, visibility: "public", indexable: true,
  teams: [{ name: "Alpha", games: ["bgmi"], tournaments: 1, teamPageSlug: null }],
  matches: [{ tournament: { slug: "cup", title: "Cup" }, team: "Alpha", stage: "main", round: 1, opponent: "Unlisted team", scoreFor: 13, scoreAgainst: 9, result: "win", corrected: false, playedAt: null }, { result: "maybe" }],
  battleRoyale: [], certificates: [{ id: "cup:alpha", tournament: { slug: "cup", title: "Cup", game: "bgmi" }, team: "Alpha", completedOn: null, record: { played: 1, wins: 1, draws: 0, losses: 0 }, battleRoyale: null, source: "verified_results" }, { noId: true }], updatedAt: null,
};
test("player page adapter: odd rows are dropped, never a crash", () => {
  const p = toPlayerPage(PLAYER);
  assert.equal(p.matches.length, 1);
  assert.equal(p.certificates.length, 1);
  assert.deepEqual(p.languages, ["Hindi"]);
  assert.equal(toPlayerPage({ slug: 1 }), null);
  assert.equal(toPlayerPage(null), null);
});
test("team page adapter keeps only https links", () => {
  const t = toTeamPage({ slug: "abcdefghijkl", name: "Delta", blurb: "", links: ["https://instagram.com/x", "javascript:alert(1)", "http://x.com"], visibility: "unlisted", indexable: false, tournaments: [], matches: [], battleRoyale: [], certificates: [] });
  assert.deepEqual(t.links, ["https://instagram.com/x"]);
  assert.equal(t.visibility, "unlisted");
});
test("owner views: no profile gives null; team list keeps the consent statement", () => {
  assert.equal(toOwnPlayerPage({ page: null }), null);
  const own = toOwnPlayerPage({ page: { slug: "ravi", visibility: "private", path: "/players/view/?s=ravi", indexable: false, indexBlockers: ["not_public"], hiddenByModeration: false, entries: [{ itemKey: "cup:alpha", tournament: { slug: "cup" }, team: "Alpha", hidden: true }], teams: [], matches: [], battleRoyale: [], certificates: [] } });
  assert.deepEqual([own.visibility, own.entries[0].hidden, own.indexBlockers], ["private", true, ["not_public"]]);
  assert.equal(toOwnTeamPage({ page: {} }), null);
  assert.equal(toTeamPageList({ items: [{ id: "t1", name: "D" }, {}], consentStatement: "X" }).items.length, 1);
});

// ---------------- directory ----------------
test("the directory is indexable only from 5 upcoming public tournaments", () => {
  assert.equal(MIN_UPCOMING_FOR_INDEX, 5);
  assert.equal(directoryIndexable(0), false);
  assert.equal(directoryIndexable(4), false);
  assert.equal(directoryIndexable(5), true);
  assert.equal(directoryIndexable(Number.NaN), false);
});
test("upcoming = public, not finished, with a start date, not over yet", () => {
  const now = Date.parse("2026-12-01T00:00:00Z");
  assert.equal(isUpcoming({ status: "registration_open", startsAt: "2026-12-05T00:00:00Z", endsAt: null }, now), true);
  assert.equal(isUpcoming({ status: "live", startsAt: "2026-11-30T10:00:00Z", endsAt: null }, now), true); // within a day of the start
  assert.equal(isUpcoming({ status: "published", startsAt: "2026-11-20T00:00:00Z", endsAt: "2026-11-21T00:00:00Z" }, now), false);
  assert.equal(isUpcoming({ status: "completed", startsAt: "2026-12-05T00:00:00Z", endsAt: null }, now), false);
  assert.equal(isUpcoming({ status: "draft", startsAt: "2026-12-05T00:00:00Z", endsAt: null }, now), false);
  assert.equal(isUpcoming({ status: "published", startsAt: null, endsAt: null }, now), false);
});
test("directory items: our own register link only; filters by game and city (any case)", () => {
  assert.equal(safeRegisterUrl("/register/?t=abcDEF123_-xyz"), "/register/?t=abcDEF123_-xyz");
  for (const bad of ["https://evil.example/register/?t=abcdefgh", "/register/?t=<x>", "javascript:alert(1)", "/register/?t=a"]) assert.equal(safeRegisterUrl(bad), null, bad);
  const base = { slug: "cup-one", title: "Cup", game: "bgmi", status: "registration_open", city: "Pune", registration: { open: true, registered: 1, spotsLeft: 3 }, registerUrl: "https://evil.example/x" };
  const item = toItem(base);
  assert.equal(item.registerUrl, null);
  assert.equal(item.pagePath, "/tournaments/cup-one/");
  assert.equal(toItem({ ...base, slug: "Bad Slug" }), null);
  const d = toDirectory({ items: [base, { ...base, slug: "cup-two", game: "valorant", city: "mumbai" }], total: 2, cities: [{ city: "Pune", count: 1 }], games: [] });
  assert.equal(d.total, 2);
  assert.deepEqual(filterItems(d.items, { game: "", city: "PUNE" }).map((i) => i.slug), ["cup-one"]);
  assert.deepEqual(filterItems(d.items, { game: "valorant", city: "" }).map((i) => i.slug), ["cup-two"]);
});

// ---------------- scrim manager (phase 4b) ----------------
import { toEntry, toRoster, toSchedule } from "../src/features/scrims/services/manager.api.ts";
test("manager adapters: roster seats, open numbers, waitlist; poster-only fields stay null for a team", () => {
  const r = toRoster({ role: "team", slot: { slotsTotal: 3, status: "open" }, seats: [{ slotNo: 2, teamName: "B", you: true }], openSeats: [1, 3, "x"], waitlist: [{ position: 1, teamName: "W", status: "offered", offerExpiresAt: "2030-01-01T00:00:00.000Z" }] });
  assert.deepEqual([r.role, r.slotsTotal, r.seats[0].contact, r.seats[0].requestId], ["team", 3, null, null]);
  assert.deepEqual(r.openSeats, [1, 3]);
  assert.equal(r.waitlist[0].status, "offered");
  assert.equal(toRoster({ role: "boss" }).role, "team");
  const e = toEntry({ id: "w", status: "waiting", position: 2 });
  assert.deepEqual([e.status, e.position, e.offerExpiresAt], ["waiting", 2, null]);
  const s = toSchedule({ id: "sc", timeOfDay: "21:00", daysAhead: 3, active: true, days: [{ day: "2030-12-06", skipped: true }] });
  assert.deepEqual([s.timeOfDay, s.daysAhead, s.active, s.days[0].skipped, s.days[0].slotId], ["21:00", 3, true, true, null]);
});
