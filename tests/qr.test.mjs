// Run: node --experimental-strip-types --no-warnings --test tests/qr.test.mjs
// The payloads are built here from made-up details, following the Secure QR layout that was confirmed against a real card.
import test from "node:test";
import assert from "node:assert/strict";
import zlib from "node:zlib";
import { parseQrPayload } from "../src/lib/idcard/qr.ts";

function secureQr({ ver = "V5", ref = "123420260711101530123", name = "Ravi Shankar Patil", dob = "04-02-1998", g = "M" } = {}) {
  const f = [ver, "3", ref, name, dob, g, "S/O Shankar Patil,", "Sampledistrict", "", "H NO-12 Sample Wadi,", "", "000000", "Sample PO", "Samplestate", "Sample Street", "", "Sampletown"];
  const parts = f.map((x) => Buffer.from(x, "latin1"));
  const photo = Buffer.from([0xff, 0x4f, 0xff, 0x51, 0, 0x2f, 0, 0]); // stands in for the JPEG2000 photo
  const buf = Buffer.concat([...parts.flatMap((p) => [p, Buffer.from([255])]), photo]);
  return BigInt("0x" + zlib.gzipSync(buf).toString("hex")).toString(10);
}

test("secure QR: exact details, last 4 only", async () => {
  const r = await parseQrPayload(secureQr());
  assert.equal(r.name, "Ravi Shankar Patil");
  assert.equal(r.dob, "04/02/1998");
  assert.equal(r.gender, "Male");
  assert.equal(r.last4, "1234");
  assert.ok(!JSON.stringify(r).includes("2026071110"));
});

test("secure QR: other versions and genders", async () => {
  for (const ver of ["V2", "V3", "V4", "V5"]) assert.equal((await parseQrPayload(secureQr({ ver }))).name, "Ravi Shankar Patil");
  assert.equal((await parseQrPayload(secureQr({ g: "F" }))).gender, "Female");
  assert.equal((await parseQrPayload(secureQr({ g: "T" }))).gender, "Transgender");
});

test("old XML QR keeps only the last 4 digits", async () => {
  const xml = '<?xml version="1.0"?><PrintLetterBarcodeData uid="999988881234" name="Ravi Shankar Patil" gender="M" yob="1998" dob="04-02-1998" co="S/O Shankar" />';
  const r = await parseQrPayload(xml);
  assert.equal(r.name, "Ravi Shankar Patil");
  assert.equal(r.last4, "1234");
  assert.equal(r.dob, "04/02/1998");
  assert.ok(!JSON.stringify(r).includes("9999"));
});

test("not an Aadhaar QR is rejected", async () => {
  assert.equal(await parseQrPayload("https://example.com"), null);
  assert.equal(await parseQrPayload("1234567890".repeat(40)), null);
});
