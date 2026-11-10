import test from "node:test";
import assert from "node:assert/strict";
import { rosterPayload, fingerprint } from "../src/lib/cloud/sync.ts";

const people = [{ id: "A-1", name: "Aarav", teamId: "t1", role: "Player", dob: "12/05/2003", gender: "Male", last4: "4471", zones: "Main hall", photo: "data:image/png;base64,AAAA", guardian: true }];

test("only what the server stores is sent: no birth date, gender, Aadhaar digits or photo", () => {
  const body = rosterPayload([{ id: "t1", name: "Kings" }], people, () => true);
  const sent = JSON.stringify(body);
  for (const secret of ["12/05/2003", "Male", "4471", "base64"]) assert.ok(!sent.includes(secret), secret);
  assert.deepEqual(body.people[0], { id: "A-1", name: "Aarav", teamId: "t1", role: "Player", zones: "Main hall", minor: true, guardian: true });
});

test("a team logo is sent only when there is one", () => {
  const body = rosterPayload([{ id: "t1", name: "Kings", logo: "data:image/png;base64,BBBB" }, { id: "t2", name: "Duos", logo: null }], [], () => false);
  assert.equal(body.teams[0].logo, "data:image/png;base64,BBBB");
  assert.ok(!("logo" in body.teams[1]));
});

test("an unnamed person is sent as Unnamed, not as an empty name the server would refuse", () => {
  assert.equal(rosterPayload([], [{ ...people[0], name: "" }], () => false).people[0].name, "Unnamed");
});

test("the fingerprint tells 'same as last save' from 'changed' without keeping the data", () => {
  const a = rosterPayload([{ id: "t1", name: "Kings" }], people, () => false);
  assert.equal(fingerprint(a), fingerprint(JSON.parse(JSON.stringify(a))));
  assert.notEqual(fingerprint(a), fingerprint(rosterPayload([{ id: "t1", name: "Kings" }], [{ ...people[0], role: "Coach" }], () => false)));
  assert.ok(!fingerprint(a).includes("Aarav"));
});
