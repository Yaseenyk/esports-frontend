// Run: node --import tsx --test tests/directory.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { CONTACT_MESSAGE, applyFilters, cleanText, daysUntil, emptyFilters, emptyReason, formatDay, hasContact, hasFilters, isValidDate, listQuery, mergePages, normaliseDraft, safeRegLink, todayIso, validateBasics, validateBlurb, whenText } from "../src/lib/directory.ts";

const draft = (o = {}) => ({ title: "Spring Cup", game: "BGMI", city: "Pune", mode: "in-person", startsOn: "2026-12-01", blurb: "", ...o });
const entry = (o = {}) => ({ id: "a", title: "T", game: "BGMI", city: "Pune", mode: "in-person", startsOn: "2026-12-01", blurb: "", regLink: "", ended: false, ...o });

test("cleanText strips control characters and collapses whitespace", () => {
  assert.equal(cleanText("  a\u0000b \n\t c​ d  "), "a b c d");
});

test("hasContact catches links, emails and phone numbers but not dates or plain numbers", () => {
  for (const s of ["https://x.y", "see www.foo", "foo.gg", "a@b.co", "call 98765 43210", "+91 98765-43210", "(022) 1234 5678"]) assert.equal(hasContact(s), true, s);
  for (const s of ["Squads of 4, prize 5000", "Starts 2026-12-01", "Top 3 teams win", "12 teams, 3 rounds"]) assert.equal(hasContact(s), false, s);
});

test("isValidDate rejects impossible days", () => {
  assert.equal(isValidDate("2026-12-01"), true);
  assert.equal(isValidDate("2026-02-30"), false);
  assert.equal(isValidDate("01-12-2026"), false);
  assert.equal(isValidDate(""), false);
});

test("validateBasics: required fields, city only when not online, contact details refused", () => {
  assert.deepEqual(validateBasics(draft()), {});
  assert.ok(validateBasics(draft({ title: "ab" })).title);
  assert.ok(validateBasics(draft({ game: " " })).game);
  assert.ok(validateBasics(draft({ city: "" })).city);
  assert.deepEqual(validateBasics(draft({ city: "", mode: "online" })), {});
  assert.ok(validateBasics(draft({ startsOn: "" })).startsOn);
  assert.equal(validateBasics(draft({ title: "Join www.x.com" })).title, CONTACT_MESSAGE);
  assert.ok(validateBasics(draft({ title: "x".repeat(81) })).title);
});

test("validateBlurb: empty is fine, long and contact details are not", () => {
  assert.equal(validateBlurb(""), "");
  assert.equal(validateBlurb("Prize pool on the day"), "");
  assert.equal(validateBlurb("mail me@x.in"), CONTACT_MESSAGE);
  assert.match(validateBlurb("a".repeat(301)), /300/);
});

test("normaliseDraft drops the city of an online event and tidies text", () => {
  const n = normaliseDraft(draft({ mode: "online", city: "Pune", title: "  A   B  " }));
  assert.equal(n.city, "");
  assert.equal(n.title, "A B");
});

test("date maths", () => {
  assert.equal(daysUntil("2026-12-05", "2026-12-01"), 4);
  assert.equal(daysUntil("2026-03-01", "2026-02-28"), 1);
  assert.equal(whenText("2026-12-01", "2026-12-01"), "Today");
  assert.equal(whenText("2026-12-02", "2026-12-01"), "Tomorrow");
  assert.equal(whenText("2026-12-06", "2026-12-01"), "In 5 days");
  assert.equal(whenText("2026-11-30", "2026-12-01"), "Ended yesterday");
  assert.equal(whenText("2026-11-28", "2026-12-01"), "Ended 3 days ago");
  assert.equal(whenText("nope", "2026-12-01"), "");
  assert.equal(todayIso(new Date(2026, 0, 5)), "2026-01-05");
  assert.match(formatDay("2026-12-01"), /1 Dec(ember)? 2026/);
});

test("filters: query string, matching and emptiness", () => {
  assert.equal(listQuery(emptyFilters), "");
  assert.equal(listQuery({ game: "Free Fire", city: "", mode: "online" }, 2), "?game=Free+Fire&mode=online&page=2");
  assert.equal(hasFilters(emptyFilters), false);
  const list = [entry(), entry({ id: "b", game: "Free Fire", mode: "online", city: "" })];
  assert.deepEqual(applyFilters(list, { game: "free fire", city: "", mode: "" }).map((e) => e.id), ["b"]);
  assert.deepEqual(applyFilters(list, { game: "", city: "PUNE", mode: "in-person" }).map((e) => e.id), ["a"]);
  assert.equal(applyFilters(list, emptyFilters).length, 2);
  assert.match(emptyReason({ game: "x", city: "", mode: "" }), /Try clearing/);
  assert.match(emptyReason(emptyFilters), /No organiser/);
});

test("mergePages never repeats an entry", () => {
  assert.deepEqual(mergePages([entry()], [entry(), entry({ id: "z" })]).map((e) => e.id), ["a", "z"]);
});

test("safeRegLink only follows https registration pages", () => {
  assert.ok(safeRegLink("https://esports.streamerosai.com/register/?t=abc"));
  assert.equal(safeRegLink("javascript:alert(1)"), "");
  assert.equal(safeRegLink("http://esports.streamerosai.com/register/?t=a"), "");
  assert.equal(safeRegLink("https://esports.streamerosai.com/other"), "");
  assert.equal(safeRegLink("https://u:p@esports.streamerosai.com/register/"), "");
  assert.equal(safeRegLink(""), "");
});
