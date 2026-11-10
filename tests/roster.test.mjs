// Run: node --experimental-strip-types --no-warnings --test tests/roster.test.mjs
// All names and numbers are made up.
import test from "node:test";
import assert from "node:assert/strict";
import { parseRoster, toCsv, csvTemplate, ageOn, isMinor, findDuplicates, normaliseDob } from "../src/lib/idcard/roster.ts";
import { signPass, verifyPass, parsePass, eventKey } from "../src/lib/idcard/sign.ts";
import { pickColour, accentOf, recolour } from "../src/lib/idcard/recolor.ts";

test("CSV with a header, quotes and aliases", () => {
  const r = parseRoster('Name,Team,Role,DOB,Gender\n"Mehta, Aarav",Konkan Kings,captain,12-5-2003,Male\nDiya K,Deadly Duos,sub,2004-09-23,Female\n,Nobody,Player,,\n');
  assert.equal(r.rows.length, 2);
  assert.equal(r.skipped, 1);
  assert.equal(r.rows[0].name, "Mehta, Aarav");
  assert.equal(r.rows[0].role, "Player");
  assert.equal(r.rows[0].dob, "12/05/2003");
  assert.equal(r.rows[1].role, "Substitute");
  assert.equal(r.rows[1].dob, "23/09/2004");
});

test("text pasted from Excel (tabs) and no header", () => {
  const r = parseRoster("Aarav Mehta\tKonkan Kings\tPlayer\t12/05/2003\tMale\nKabir Sheikh\tKonkan Kings\tCoach");
  assert.equal(r.rows.length, 2);
  assert.equal(r.rows[1].role, "Coach");
});

test("a full Aadhaar number in a sheet is cut down to the last 4 digits", () => {
  const r = parseRoster("name,team,aadhaar\nAarav Mehta,Konkan Kings,9999 8888 4471\n");
  assert.equal(r.rows[0].last4, "4471");
  assert.equal(r.trimmedAadhaar, 1);
  assert.ok(!JSON.stringify(r.rows).includes("9999"));
});

test("export then import keeps the people", () => {
  const people = [{ id: "KON-001", name: 'Aarav "AM" Mehta', teamId: "t1", role: "Player", dob: "12/05/2003", last4: "4471" }];
  const csv = toCsv(people, [{ id: "t1", name: "Konkan Kings" }], () => false);
  const back = parseRoster(csv);
  assert.equal(back.rows[0].name, 'Aarav "AM" Mehta');
  assert.equal(back.rows[0].team, "Konkan Kings");
  assert.ok(parseRoster(csvTemplate()).rows.length === 2);
});

test("age and minors on the event date", () => {
  const day = new Date(2026, 11, 12); // 12 Dec 2026
  assert.equal(ageOn("12/12/2008", day), 18);
  assert.equal(ageOn("13/12/2008", day), 17);
  assert.equal(isMinor("13/12/2008", day), true);
  assert.equal(isMinor("12/12/2008", day), false);
  assert.equal(isMinor(undefined, day), false);
  assert.equal(normaliseDob("5/4/2002"), "05/04/2002");
});

test("duplicates: same card and birth date, or same name and birth date", () => {
  const d = findDuplicates([
    { id: "A", name: "Aarav Mehta", dob: "12/05/2003", last4: "4471" },
    { id: "B", name: "A. Mehta", dob: "12/05/2003", last4: "4471" },
    { id: "C", name: "aarav mehta", dob: "12/05/2003" },
    { id: "D", name: "Diya", dob: "23/09/2004", last4: "8802" },
  ]);
  assert.deepEqual(d.get("A").sort(), ["B", "C"]);
  assert.ok(!d.has("D"));
});

test("signed passes verify, and edits or copies are caught", async () => {
  const ev = eventKey("Monsoon Clash Season 2");
  assert.equal(ev, "monsoon-clash-season-2");
  const code = await signPass("correct horse", ev, "KON-001", "Player");
  assert.ok(parsePass(code));
  assert.equal((await verifyPass("correct horse", ev, "Player", code)).ok, true);
  assert.equal((await verifyPass("wrong pass", ev, "Player", code)).reason, "bad-signature");
  assert.equal((await verifyPass("correct horse", ev, "VIP", code)).reason, "bad-signature"); // role changed
  assert.equal((await verifyPass("correct horse", "other-event", "Player", code)).reason, "wrong-event");
  const edited = code.replace("KON-001", "KON-002");
  assert.equal((await verifyPass("correct horse", ev, "Player", edited)).ok, false);
  assert.equal((await verifyPass("x", ev, "Player", "hello")).reason, "format");
  assert.ok(!code.includes("correct horse"));
});

test("colour picking prefers vivid colours; recolour swaps the accent", () => {
  const px = []; // 30 vivid red pixels, lots of white and grey
  for (let i = 0; i < 30; i++) px.push(220, 30, 40, 255);
  for (let i = 0; i < 200; i++) px.push(255, 255, 255, 255, 120, 120, 120, 255);
  assert.match(pickColour(px), /^#[cd][0-9a-f][0-5][0-9a-f][2-5][0-9a-f]$/);
  const t = { id: "x", name: "x", bg: { a: "#0b0f14", b: "#111111", angle: 0 }, els: [
    { id: "1", kind: "rect", x: 0, y: 0, w: 1, h: 1, rot: 0, opacity: 1, fill: "#22c55e" },
    { id: "2", kind: "field", x: 0, y: 0, w: 1, h: 1, rot: 0, opacity: 1, color: "#22C55E" },
    { id: "3", kind: "rect", x: 0, y: 0, w: 1, h: 1, rot: 0, opacity: 1, fill: "#ffffff" },
  ] };
  assert.equal(accentOf(t), "#22c55e");
  const r = recolour(t, "#ff0000");
  assert.equal(r.els[0].fill, "#ff0000");
  assert.equal(r.els[1].color, "#ff0000");
  assert.equal(r.els[2].fill, "#ffffff");
});
