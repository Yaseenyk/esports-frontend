// Sample-detection, the per-tab people draft, and the honest roster-save messages. All names are made up.
import test from "node:test";
import assert from "node:assert/strict";
import { SAMPLE_PEOPLE, SAMPLE_EVENT, SAMPLE_ORGANISER, BLANK_INFO, isSamplePerson, sampleDetails } from "../src/lib/idcard/samples.ts";
import { DEFAULT_INFO, ROLES } from "../src/lib/idcard/types.ts";
import { slimPeople, readDraft, lossSignature, hasLossy } from "../src/lib/idcard/draft.ts";
import { explainRoster, explain } from "../src/lib/api/cloud.ts";

const demo = { event: SAMPLE_EVENT, organiser: SAMPLE_ORGANISER, info: DEFAULT_INFO, people: SAMPLE_PEOPLE };

test("the untouched demo lists every sample detail", () => {
  const d = sampleDetails(demo);
  assert.equal(d.length, 4);
  assert.ok(d.some((x) => x.includes("12 sample people")));
  assert.ok(d.some((x) => x.includes("+91 00000 00000")));
});

test("a blank event with no people has no sample details", () => {
  assert.deepEqual(sampleDetails({ event: "", organiser: "", info: BLANK_INFO, people: [] }), []);
});

test("renaming a sample person makes them yours; the others stay sample", () => {
  const people = SAMPLE_PEOPLE.map((p, i) => (i === 0 ? { ...p, name: "Real Player" } : p));
  assert.equal(isSamplePerson(people[0]), false);
  assert.equal(isSamplePerson(people[1]), true);
  assert.ok(sampleDetails({ ...demo, people }).some((x) => x.includes("11 sample people")));
  assert.equal(isSamplePerson({ id: "NEW-1", name: "Aarav Mehta" }), false); // demo name with an id of your own is yours
});

test("people draft keeps text only and never dob, gender, last4 or photos", () => {
  const slim = slimPeople([{ id: "A-1", name: "Real", teamId: "t1", role: "Coach", zones: "Hall", dob: "01/01/2000", gender: "Male", last4: "1234", photo: "data:image/png;base64,AAAA" }]);
  const raw = JSON.stringify({ people: slim });
  assert.ok(!/dob|gender|last4|photo|01\/01\/2000|1234|AAAA/.test(raw));
  const back = readDraft(raw, ROLES);
  assert.deepEqual(back, [{ id: "A-1", name: "Real", teamId: "t1", role: "Coach", zones: "Hall" }]);
});

test("a removed-everyone draft restores as empty, garbage restores as null", () => {
  assert.deepEqual(readDraft(JSON.stringify({ people: [] }), ROLES), []);
  assert.equal(readDraft("not json", ROLES), null);
  assert.equal(readDraft(null, ROLES), null);
  assert.deepEqual(readDraft(JSON.stringify({ people: [{ id: 1 }, { id: "x", name: "N", teamId: "t", role: "Wizard" }] }), ROLES)?.map((p) => p.role), ["Player"]);
});

test("restored sample people get their demo picture back, renamed ones do not", () => {
  const r = readDraft(JSON.stringify({ people: slimPeople([SAMPLE_PEOPLE[0], { ...SAMPLE_PEOPLE[1], name: "Mine" }]) }), ROLES);
  assert.ok(r[0].photo?.startsWith("/samples/"));
  assert.equal(r[1].photo, undefined);
});

test("unsaved-loss signature: demo data is free to lose, user photos and dates are not", () => {
  assert.equal(lossSignature(SAMPLE_PEOPLE), "");
  const mine = { id: "X-1", name: "Me", teamId: "t1", role: "Player", dob: "02/02/2001" };
  assert.equal(hasLossy(mine), true);
  const sig = lossSignature([mine]);
  assert.notEqual(sig, "");
  assert.equal(lossSignature([{ ...mine }]), sig);
  assert.notEqual(lossSignature([{ ...mine, photo: "data:image/png;base64,QQ" }]), sig);
  assert.equal(lossSignature([{ id: "X-2", name: "Text only", teamId: "t1", role: "Player" }]), "");
});

test("roster 400 gets its own message, other statuses keep the generic text", () => {
  assert.match(explainRoster({ status: 400 }), /people list/);
  assert.equal(explainRoster({ status: 500 }), explain({ status: 500 }));
  assert.equal(explain({ status: 400 }), "The server did not accept that. Check what you typed.");
});
