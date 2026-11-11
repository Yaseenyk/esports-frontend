// Run: npx tsx --test tests/report.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { buildReport, clock } from "../src/lib/report.ts";

const event = { name: "Spring Cup", date: "2026-12-01", venue: "Pune" };
const teams = [{ id: "t1", name: "Kings" }, { id: "t2", name: "Queens" }];
const people = [
  { id: "a", teamId: "t1", role: "Player", minor: false },
  { id: "b", teamId: "t1", role: "Player", minor: true },
  { id: "c", teamId: "t2", role: "Coach", minor: false },
  { id: "d", teamId: "t2", role: "Player", minor: false },
  { id: "e", teamId: "", role: "Guest", minor: false },
];

test("empty event", () => {
  const r = buildReport({ event, people: [], teams: [], checkins: [] });
  assert.equal(r.total, 0); assert.equal(r.percent, 0); assert.equal(r.peak, null); assert.deepEqual(r.buckets, []);
  assert.match(r.summary, /No people have been added/);
});

test("people but no check-ins", () => {
  const r = buildReport({ event, people, teams, checkins: [] });
  assert.equal(r.present, 0); assert.equal(r.noShows, 5); assert.equal(r.first, null); assert.equal(r.under18, 1);
  assert.match(r.summary, /Nobody has been checked in yet. 5 people/);
});

test("counts, percent, roles and teams", () => {
  const r = buildReport({ event, people, teams, checkins: [
    { personId: "a", at: "2026-12-01T09:05:00Z" }, { personId: "b", at: "2026-12-01T09:20:00Z" },
    { personId: "c", at: "2026-12-01T09:10:00Z" }, { personId: "a", at: "2026-12-01T09:50:00Z" }, // earliest wins, no double count
    { personId: "ghost", at: "2026-12-01T09:11:00Z" }, { personId: "d", at: "not a date" },
  ] });
  assert.equal(r.present, 3); assert.equal(r.noShows, 2); assert.equal(r.percent, 60);
  assert.deepEqual(r.byRole.find((x) => x.label === "Player"), { label: "Player", present: 2, total: 3 });
  assert.deepEqual(r.byTeam.find((x) => x.label === "Kings"), { label: "Kings", present: 2, total: 2 });
  assert.deepEqual(r.byTeam.find((x) => x.label === "No team"), { label: "No team", present: 0, total: 1 });
  assert.equal(r.first, "09:05"); assert.equal(r.last, "09:20");
  assert.equal(r.peak.label, "09:00"); assert.equal(r.peak.count, 2);
  assert.equal(r.buckets[0].label, "09:00");
  assert.equal(r.buckets.reduce((s, b) => s + b.count, 0), 3);
});

test("one team only", () => {
  const r = buildReport({ event, people: [{ id: "x", teamId: "t1", role: "Player" }], teams: [teams[0]], checkins: [{ personId: "x", at: "2026-12-01T10:00:00Z" }] });
  assert.equal(r.percent, 100); assert.equal(r.byTeam.length, 1); assert.equal(r.buckets.length, 1);
  assert.match(r.summary, /1 of 1 person \(100%\)/);
});

test("arrivals cross midnight and gaps are filled with zero", () => {
  const r = buildReport({ event, people, teams, checkins: [{ personId: "a", at: "2026-12-01T23:50:00Z" }, { personId: "b", at: "2026-12-02T00:20:00Z" }] });
  assert.deepEqual(r.buckets.map((b) => [b.label, b.count]), [["23:45", 1], ["00:00", 0], ["00:15", 1]]);
  assert.equal(r.first, "23:50"); assert.equal(r.last, "00:20");
});

test("time zone offset shifts labels, not buckets", () => {
  const r = buildReport({ event, people, teams, checkins: [{ personId: "a", at: "2026-12-01T09:05:00Z" }], tzOffsetMin: 330 });
  assert.equal(r.first, "14:35"); assert.equal(clock(Date.parse("2026-12-01T00:00:00Z"), 330), "05:30");
});

test("the report holds no names", () => {
  const r = buildReport({ event, people: [{ id: "a", name: "Asha Verma", teamId: "t1", role: "Player" }], teams, checkins: [{ personId: "a", at: "2026-12-01T09:05:00Z" }] });
  assert.ok(!JSON.stringify(r).includes("Asha"));
});
