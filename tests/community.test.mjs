// Community features: calendar index rule, adapters (fixed field lists), calendar helpers, trust wording, form validation.
import test from "node:test";
import assert from "node:assert/strict";
import { calendarIndexable, countUpcoming, MIN_UPCOMING_FOR_INDEX, todayIst } from "../src/features/community/seo.ts";
import { addMonths, citiesOf, dateRange, filterEntries, inMonth, monthGrid, monthLabel, scoreSentence, windowSentence } from "../src/features/community/domain.ts";
import { toCalendarPage, toEntry, toMyCalendar, toMyTrust, toStatus, toTrustSummary } from "../src/features/community/services/community.adapter.ts";
import { toBody, EMPTY_FORM } from "../src/features/community/hooks/useMyCalendar.ts";
import { ratingProblem } from "../src/features/community/ui/RatingForm.tsx";

const e = (over = {}) => ({ id: "c1", title: "Techfest Valorant Cup", game: "valorant", city: "Pune", online: false, startsOn: "2030-12-05", endsOn: "2030-12-06", status: "listed", registrationUrl: "https://forms.example.org/r", tournamentSlug: null, organiser: { name: "Test College", slug: "test-college", verified: true }, ...over });

test("index rule: 5 upcoming, listed, verified entries; cancelled, past and unverified ones do not count", () => {
  assert.equal(MIN_UPCOMING_FOR_INDEX, 5);
  const today = "2030-12-01";
  const ok = Array.from({ length: 4 }, () => ({ startsOn: "2030-12-05", endsOn: "2030-12-06", status: "listed", verified: true }));
  assert.equal(calendarIndexable(ok, today), false);
  assert.equal(calendarIndexable([...ok, { startsOn: "2030-12-01", endsOn: "2030-12-01", status: "listed", verified: true }], today), true); // ends today: still upcoming
  for (const extra of [{ startsOn: "2030-11-01", endsOn: "2030-11-30", status: "listed", verified: true }, { startsOn: "2030-12-05", endsOn: "2030-12-05", status: "cancelled", verified: true }, { startsOn: "2030-12-05", endsOn: "2030-12-05", status: "listed", verified: false }]) {
    assert.equal(countUpcoming([...ok, extra], today), 4, JSON.stringify(extra));
  }
  assert.match(todayIst(Date.UTC(2030, 0, 1, 20, 0)), /^2030-01-02$/); // 20:00 UTC is already the next day in India
});

test("calendar adapter keeps a fixed field list and drops bad rows, links and slugs", () => {
  const raw = { items: [{ ...e(), orgId: "o1", createdBy: "u1", hidden: true }, { ...e({ id: "c2", startsOn: "5 Dec" }) }, { ...e({ id: "c3", registrationUrl: "http://x.org/a", tournamentSlug: "BAD SLUG" }) }, null], upcomingVerified: 7, today: "2030-12-01", extra: 1 };
  const p = toCalendarPage(raw);
  assert.equal(p.items.length, 2);
  assert.deepEqual(Object.keys(p.items[0]).sort(), ["city", "endsOn", "game", "id", "online", "organiser", "registrationUrl", "startsOn", "status", "title", "tournamentSlug"]);
  assert.equal(p.items[1].registrationUrl, null);
  assert.equal(p.items[1].tournamentSlug, null);
  assert.equal(p.upcomingVerified, 7);
  assert.equal(toEntry({ ...e(), registrationUrl: "https://x.org/r?t=secret" }).registrationUrl, null); // a query string never reaches a link
  const mine = toMyCalendar({ orgs: [{ id: "o1", name: "Test College", slug: null }, { id: "", name: "x" }], items: [{ ...e(), orgId: "o1", hidden: true, hiddenReason: "spam" }] });
  assert.equal(mine.orgs.length, 1);
  assert.deepEqual([mine.items[0].hidden, mine.items[0].hiddenReason], [true, "spam"]);
  assert.deepEqual(toStatus({ calendar: true, trust: "yes" }), { calendar: true, trust: false });
});

test("calendar helpers: filters, months, grid, wording", () => {
  const items = [e(), e({ id: "c2", game: "bgmi", city: "nagpur", startsOn: "2031-01-30", endsOn: "2031-02-02" }), e({ id: "c3", city: "Nagpur" })];
  assert.deepEqual(filterEntries(items, { game: "", city: "NAGPUR" }).map((x) => x.id), ["c2", "c3"]);
  assert.deepEqual(filterEntries(items, { game: "bgmi", city: "" }).map((x) => x.id), ["c2"]);
  assert.deepEqual(citiesOf(items), ["nagpur", "Pune"]);
  assert.deepEqual(inMonth(items, "2031-02").map((x) => x.id), ["c2"]);
  assert.equal(addMonths("2030-12", 1), "2031-01");
  assert.equal(monthLabel("2031-02"), "February 2031");
  assert.equal(dateRange("2030-12-05", "2030-12-05"), "5 Dec 2030");
  assert.equal(dateRange("2030-12-05", "2030-12-07"), "5 to 7 Dec 2030");
  assert.equal(dateRange("2031-01-30", "2031-02-02"), "30 Jan 2031 to 2 Feb 2031");
  const grid = monthGrid("2030-12", items);
  assert.ok(grid.every((w) => w.length === 7));
  assert.equal(grid[0].findIndex((c) => c.day === "2030-12-01"), 6); // 1 Dec 2030 is a Sunday, Monday-first grid
  assert.deepEqual(grid.flat().find((c) => c.day === "2030-12-06").entries.map((x) => x.id), ["c1", "c3"]);
});

test("trust adapter: no stars or breakdown without an average, fixed fields, bad rows dropped", () => {
  const s = toTrustSummary({
    tournament: { slug: "gokte-cup", title: "Gokte Cup" }, organiser: { name: "Gokte College", verified: true, orgId: "o1" },
    score: { count: 3, minimum: 5, average: null, aspects: { onTime: 4 }, distribution: { 5: 3 } },
    reviews: [{ id: "r1", displayName: "Riya K", verifiedAs: "played", stars: 9, review: "Good", userId: "u1", proofRef: "person:P1", tournament: { slug: "gokte-cup", title: "Gokte Cup" }, reply: { text: "Thanks", at: "2030-01-01" } }, { id: "r2" }],
    window: { state: "open", opensAt: "2030-01-01T00:00:00Z", closesAt: "2030-01-31T00:00:00Z", days: 30 },
  });
  assert.equal(s.score.aspects, null);
  assert.equal(s.score.distribution, null);
  assert.equal(s.reviews.length, 1);
  assert.equal(s.reviews[0].stars, null); // 9 is not a star value
  assert.deepEqual(Object.keys(s.reviews[0]).sort(), ["createdAt", "displayName", "id", "replyHidden", "reply", "review", "stars", "tournament", "verifiedAs"].sort());
  assert.equal(JSON.stringify(s).includes("u1"), false);
  assert.equal(toTrustSummary({ tournament: {} }), null);
  const me = toMyTrust({ adultConfirmed: true, isOrganiser: false, canReply: false, window: { state: "weird" }, myRating: { id: "x", stars: 4 }, suggestedName: "Riya" });
  assert.equal(me.window.state, "no_dates");
  assert.equal(me.myRating.stars, 4);
});

test("trust wording says why there is no number yet", () => {
  assert.match(scoreSentence({ count: 0, minimum: 5, average: null, aspects: null, distribution: null }), /No verified ratings yet/);
  assert.match(scoreSentence({ count: 3, minimum: 5, average: null, aspects: null, distribution: null }), /3 verified ratings so far\. A score appears after 2 more/);
  assert.equal(scoreSentence({ count: 6, minimum: 5, average: 4.25, aspects: null, distribution: null }), "4.3 out of 5 from 6 verified ratings.");
  assert.match(windowSentence({ state: "closed", opensAt: null, closesAt: null, days: 30 }), /closed 30 days/);
});

test("forms: the calendar body and the rating form validation", () => {
  assert.deepEqual(toBody({ ...EMPTY_FORM, orgId: "o1", title: " Fest Cup ", city: " Pune ", startsOn: "2030-12-05", registrationUrl: " " }), { title: "Fest Cup", game: "bgmi", city: "Pune", online: false, startsOn: "2030-12-05", endsOn: "2030-12-05", registrationUrl: null, tournamentSlug: null });
  assert.equal(toBody({ ...EMPTY_FORM, startsOn: "2030-12-05" }, "cancelled").status, "cancelled");
  const f = { link: "https://esports.streamerosai.com/pass/?t=abc", stars: "5", onTime: "4", fair: "4", communication: "3", displayName: "Riya K", review: "" };
  assert.equal(ratingProblem(f), null);
  assert.match(ratingProblem({ ...f, link: "" }), /link/);
  assert.match(ratingProblem({ ...f, fair: "" }), /all four/);
  assert.match(ratingProblem({ ...f, review: "short" }), /10 to 1000/);
  assert.match(ratingProblem({ ...f, displayName: "R" }), /2 to 40/);
  assert.match(ratingProblem({ ...f, review: "<script>alert(1)</script> long enough" }), /Plain text/);
});
