// Run: node --experimental-strip-types --no-warnings --test tests/uidai.test.mjs
// Uses a throw-away RSA key and certificate made with openssl, so the signature check is proved without UIDAI's real certificate.
// (Skipped automatically if openssl is not installed.)
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createSign } from "node:crypto";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import zlib from "node:zlib";
import { spkiFromCert, verifyUnpacked, verdictFor } from "../src/lib/idcard/uidai.ts";

function makeKey(cn) {
  const d = mkdtempSync(join(tmpdir(), "uidai-"));
  execFileSync("openssl", ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-keyout", join(d, "k.pem"), "-out", join(d, "c.pem"), "-subj", `/CN=${cn}`, "-days", "2"], { stdio: "ignore" });
  execFileSync("openssl", ["x509", "-in", join(d, "c.pem"), "-outform", "der", "-out", join(d, "c.der")], { stdio: "ignore" });
  return { key: readFileSync(join(d, "k.pem"), "utf8"), cert: new Uint8Array(readFileSync(join(d, "c.der"))) };
}
let have = true;
try { execFileSync("openssl", ["version"], { stdio: "ignore" }); } catch { have = false; }

// The unpacked layout of a Secure QR: fields, then a (here fake) photo, then a 256-byte signature over everything before it.
const body = Buffer.concat([Buffer.from("V5\xff3\xff1234202611101530123\xffRavi Shankar Patil\xff04-02-1998\xffM\xff", "latin1"), Buffer.from([0xff, 0x4f, 0xff, 0x51, 1, 2, 3, 4])]);
const sign = (key, data) => createSign("RSA-SHA256").update(data).sign(key);

test("public key is found inside a real X.509 certificate", { skip: !have }, () => {
  const { cert } = makeKey("test-uidai");
  const spki = spkiFromCert(cert);
  assert.equal(spki[0], 0x30);
  assert.ok(spki.length > 250 && spki.length < 600);
  assert.throws(() => spkiFromCert(new Uint8Array([1, 2, 3, 4])));
});

test("a genuine signature verifies; edits and the wrong certificate do not", { skip: !have }, async () => {
  const a = makeKey("uidai-a"), b = makeKey("someone-else");
  const unpacked = new Uint8Array(Buffer.concat([body, sign(a.key, body)]));
  assert.equal(unpacked.length, body.length + 256);
  assert.equal(await verifyUnpacked(unpacked, a.cert), true);
  const edited = new Uint8Array(unpacked); edited[20] ^= 1; // one changed letter in the name
  assert.equal(await verifyUnpacked(edited, a.cert), false);
  assert.equal(await verifyUnpacked(unpacked, b.cert), false);
  assert.equal(await verifyUnpacked(new Uint8Array(100), a.cert), false);
});

test("verdicts: unchecked without a certificate, valid or invalid with one", { skip: !have }, async () => {
  const a = makeKey("uidai-a"), b = makeKey("other");
  const unpacked = new Uint8Array(Buffer.concat([body, sign(a.key, body)]));
  assert.equal(await verdictFor(unpacked, []), "unchecked");
  assert.equal(await verdictFor(unpacked, [a.cert]), "valid");
  assert.equal(await verdictFor(unpacked, [b.cert]), "invalid");
  assert.equal(await verdictFor(unpacked, [b.cert, a.cert]), "valid"); // UIDAI rotates certificates: any matching one is enough
});
