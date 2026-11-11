// Run: node --import tsx --test tests/duplicate.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_INCLUDE, NAME_MAX, OPTIONS, PEOPLE_WARNING, addDays, buildRequest, dateProblem, defaultName, eventHref, includeProblem, nameProblem, nextWeekName,
  normaliseInclude, safePeople, safePerson, sameTimeNextWeek, stripCopySuffix, summaryLines,
} from "../src/lib/duplicate.ts";

test("default name adds (copy), never stacks, and stays within the limit", () => {
  assert.equal(defaultName("Spring Cup"), "Spring Cup (copy)");
  assert.equal(defaultName("Spring Cup (copy)"), "Spring Cup (copy)");
  assert.equal(defaultName("Spring Cup (copy 2)"), "Spring Cup (copy)");
  assert.equal(defaultName(""), "Event (copy)");
  assert.ok(defaultName("x".repeat(300)).length <= NAME_MAX);
  assert.equal(stripCopySuffix("A (Copy)"), "A");
});

test("date maths: +7 days across month, year and leap days; time kept; free text refused", () => {
  assert.equal(sameTimeNextWeek("2026-12-01"), "2026-12-08");
  assert.equal(sameTimeNextWeek("2026-12-28"), "2027-01-04");
  assert.equal(addDays("2028-02-25", 7), "2028-03-03");
  assert.equal(addDays("2027-02-25", 7), "2027-03-04");
  assert.equal(addDays("2026-12-01 18:00", 7), "2026-12-08 18:00");
  assert.equal(addDays("2026-12-01T18:00", -1), "2026-11-30T18:00");
  assert.equal(addDays("1 December 2026", 7), null);
  assert.equal(addDays("2026-02-31", 7), null);
  assert.equal(addDays("", 7), null);
});

test("weekly name: the old date in the name moves to the new date, else (copy)", () => {
  assert.equal(nextWeekName("Friday Night 2026-12-01", "2026-12-01", "2026-12-08"), "Friday Night 2026-12-08");
  assert.equal(nextWeekName("Friday Night", "2026-12-01", "2026-12-08"), "Friday Night (copy)");
});

test("defaults: safe things ticked, people and members not, directory never", () => {
  assert.deepEqual(DEFAULT_INCLUDE, { teams: true, people: false, registrationForm: true, liveExtras: true, directory: false, members: false, matches: true });
  assert.ok(OPTIONS.find((o) => o.key === "people").warning === PEOPLE_WARNING);
  assert.equal(PEOPLE_WARNING, "Names and teams only. Photos, birth dates, consent and passes are never copied.");
  assert.ok(OPTIONS.find((o) => o.key === "members").ownerOnly);
  assert.ok(OPTIONS.find((o) => o.key === "people").ownerOnly, "an editor must not be able to copy the people of an event");
  assert.ok(!OPTIONS.some((o) => o.key === "directory"));
});

test("include validation: people need teams, members need the owner", () => {
  assert.equal(includeProblem(DEFAULT_INCLUDE, "editor"), null);
  assert.match(includeProblem({ ...DEFAULT_INCLUDE, teams: false, people: true }, "owner"), /Tick Teams/);
  assert.match(includeProblem({ ...DEFAULT_INCLUDE, members: true }, "editor"), /owner/);
  assert.equal(includeProblem({ ...DEFAULT_INCLUDE, members: true }, "owner"), null);
});

test("normaliseInclude only lets true through and fixes impossible combinations", () => {
  assert.deepEqual(normaliseInclude({ teams: "yes", people: true, directory: true, members: true }, "owner"), { teams: false, people: false, registrationForm: false, liveExtras: false, directory: false, members: true, matches: false });
  assert.equal(normaliseInclude({ teams: true, people: true, members: true }, "editor").members, false);
  assert.equal(normaliseInclude({ teams: true, people: true }, "owner").people, true);
});

test("name and date problems", () => {
  assert.ok(nameProblem("   "));
  assert.equal(nameProblem("Cup"), null);
  assert.ok(nameProblem("x".repeat(NAME_MAX + 1)));
  assert.ok(dateProblem("x".repeat(41)));
  assert.equal(dateProblem(""), null);
});

test("buildRequest trims, omits an empty date and never sends directory true", () => {
  assert.deepEqual(buildRequest("  Cup  ", "", { ...DEFAULT_INCLUDE }, "editor"), { name: "Cup", include: DEFAULT_INCLUDE });
  const r = buildRequest("Cup", " 2026-12-08 ", { ...DEFAULT_INCLUDE, directory: true, members: true }, "owner");
  assert.equal(r.date, "2026-12-08");
  assert.equal(r.include.directory, false);
  assert.equal(r.include.members, true);
});

test("summary names what comes and what stays", () => {
  const s = summaryLines("Cup 2", "2026-12-08", DEFAULT_INCLUDE).join("\n");
  assert.match(s, /Cup 2, 2026-12-08/);
  assert.match(s, /Also brought over: teams, registration form text, sponsors and ticker, structure of matches/);
  assert.match(s, /Left behind: people, editors and viewers/);
  assert.match(s, /Never copied: photos, birth dates, consent, passes/);
});

test("privacy filter keeps only name, team, role, zones and the minor flag; consent resets", () => {
  const p = safePerson({ id: "A1", name: "Asha", teamId: "t1", role: "Player", zones: ["Stage", 7], minor: true, guardian: true, photoUrl: "/events/e/photos/A1", dob: "2010-01-01", aadhaar: "1234", code: "EH1.x", checkedIn: true, guardianPhone: "999" });
  assert.deepEqual(p, { id: "A1", name: "Asha", teamId: "t1", role: "Player", zones: ["Stage"], minor: true, guardian: false });
  assert.deepEqual(Object.keys(p).sort(), ["guardian", "id", "minor", "name", "role", "teamId", "zones"]);
  assert.equal(safePerson({ id: "B", name: "B", teamId: "t", role: "Coach", zones: "VIP" }).zones[0], "VIP");
  assert.equal(safePerson({ id: "B", name: "B", teamId: "t", role: "Coach" }).minor, false);
  assert.equal(safePeople([{ id: "a", name: "a", teamId: "t", role: "r", guardian: true }])[0].guardian, false);
});

test("event link", () => {
  assert.equal(eventHref("abc 1"), "/app/events/?id=abc%201");
});
