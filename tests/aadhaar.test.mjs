// Run: node --experimental-strip-types --test tests/aadhaar.test.mjs
// All text below is made up. It imitates what OCR returns for a printed card, a photocopy and an e-Aadhaar screenshot.
import test from "node:test";
import assert from "node:assert/strict";
import { parseAadhaar, maskAadhaar } from "../src/lib/idcard/aadhaar.ts";

test("printed card layout", () => {
  const r = parseAadhaar(`Government of India
Asha Kumari Verma
DOB: 14/03/2001
FEMALE
4821 7365 0912
Mera Aadhaar, Meri Pehchaan`);
  assert.equal(r.name, "Asha Kumari Verma");
  assert.equal(r.dob, "14/03/2001");
  assert.equal(r.gender, "Female");
  assert.equal(r.last4, "0912");
});

test("male is not confused with female, noisy photocopy", () => {
  const r = parseAadhaar(`GOVERNMENT OF INDIA
| Ravi  Shankar |
Date of Birth : 02-11-1998
MALE
9304 1127 5588
VID : 9123 4567 8901 2345`);
  assert.equal(r.gender, "Male");
  assert.equal(r.dob, "02/11/1998");
  assert.equal(r.name, "Ravi Shankar");
  assert.equal(r.last4, "5588");
});

test("year of birth only", () => {
  const r = parseAadhaar(`Unique Identification Authority of India
Imran Sheikh
Year of Birth : 1995
Male
1111 2222 3333`);
  assert.equal(r.yob, "1995");
  assert.equal(r.dob, undefined);
  assert.equal(r.name, "Imran Sheikh");
});

test("never exposes more than the last four digits", () => {
  const r = parseAadhaar("Test Person\nDOB: 01/01/2000\nMale\n1234 5678 9012");
  assert.ok(!JSON.stringify(r).includes("5678"));
  assert.equal(maskAadhaar(r.last4), "XXXX XXXX 9012");
});

test("nothing found returns empty", () => {
  assert.deepEqual(parseAadhaar("hello"), {});
});
