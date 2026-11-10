// Field-level accuracy of the Aadhaar readers on made-up records.
//  - QR path: 600 random cards through the real Secure QR layout (V2-V5) and the old XML layout. This must be exact.
//  - Text path (OCR fallback): the same kind of records written as printed-card text with realistic noise. It is allowed to miss
//    some, so the test sets a floor and prints the score, which is the number to watch if the parser is changed.
import test from "node:test";
import assert from "node:assert/strict";
import zlib from "node:zlib";
import { parseQrPayload } from "../src/lib/idcard/qr.ts";
import { parseAadhaar } from "../src/lib/idcard/aadhaar.ts";

// A small deterministic random source, so a failure can be reproduced.
let seed = 20261110;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
const FIRST = ["Aarav", "Diya", "Rohan", "Sneha", "Kabir", "Vihaan", "Ananya", "Ishita", "Arjun", "Meera", "Zoya", "Aditya", "Priya", "Rahul", "Fatima", "Gurpreet", "Lakshmi", "Mohammed", "Neha", "Siddharth", "Tanvi", "Yash", "Pooja", "Imran"];
const LAST = ["Mehta", "Kulkarni", "Deshmukh", "Iyer", "Sheikh", "Patil", "Nair", "Joshi", "Reddy", "Pawar", "Khan", "Chavan", "Sharma", "Singh", "Verma", "Gupta", "Banerjee", "D'Souza", "Rao", "Naidu"];
const record = () => {
  const parts = [pick(FIRST)];
  if (rnd() < 0.5) parts.push(pick(FIRST));
  parts.push(pick(LAST));
  if (rnd() < 0.12) parts[0] = parts[0].slice(0, 1) + ".";
  const d = 1 + Math.floor(rnd() * 28), m = 1 + Math.floor(rnd() * 12), y = 1975 + Math.floor(rnd() * 35);
  return { name: parts.join(" "), d, m, y, g: pick(["M", "F", "M", "F", "T"]), last4: String(1000 + Math.floor(rnd() * 9000)) };
};
const two = (n) => String(n).padStart(2, "0");
const GENDER = { M: "Male", F: "Female", T: "Transgender" };

function secureQr(r, ver) {
  const ref = `${r.last4}${"20261110101530123"}`;
  const f = [ver, "3", ref, r.name, `${two(r.d)}-${two(r.m)}-${r.y}`, r.g, "S/O Someone,", "District", "", "H NO-1 Lane,", "", "000000", "PO", "State", "Street", "", "Town"];
  const bytes = Buffer.concat([...f.flatMap((x) => [Buffer.from(x, "latin1"), Buffer.from([255])]), Buffer.from([0xff, 0x4f, 0xff, 0x51, 0, 0x2f, 0, 0])]);
  return BigInt("0x" + zlib.gzipSync(bytes).toString("hex")).toString(10);
}
const xmlQr = (r) => `<?xml version="1.0"?><PrintLetterBarcodeData uid="9999${"8888"}${r.last4}" name="${r.name}" gender="${r.g}" yob="${r.y}" dob="${two(r.d)}-${two(r.m)}-${r.y}" />`;

test("QR path: 600 cards, every field exact", async () => {
  const miss = { name: 0, dob: 0, gender: 0, last4: 0 };
  let n = 0;
  for (let i = 0; i < 600; i++) {
    const r = record();
    const payload = i % 6 === 5 ? xmlQr(r) : secureQr(r, ["V2", "V3", "V4", "V5"][i % 4]);
    const out = await parseQrPayload(payload);
    n++;
    assert.ok(out, `card ${i} was not read`);
    if (out.name !== r.name) miss.name++;
    if (out.dob !== `${two(r.d)}/${two(r.m)}/${r.y}`) miss.dob++;
    if (out.gender !== GENDER[r.g]) miss.gender++;
    if (out.last4 !== r.last4) miss.last4++;
    assert.ok(!JSON.stringify(out).includes("2026111010"), "no full reference may be kept");
  }
  console.log(`QR benchmark: ${n} cards, misses ${JSON.stringify(miss)}`);
  assert.deepEqual(miss, { name: 0, dob: 0, gender: 0, last4: 0 });
});

// ---- the printed-text fallback ----
const CONFUSE = { O: "0", 0: "O", l: "1", 1: "l", I: "l", S: "5", 5: "S", B: "8" };
function noisy(text, level) { return [...text].map((c) => (/[A-Za-z0-9]/.test(c) && rnd() < level && CONFUSE[c] ? CONFUSE[c] : c)).join(""); }
function printedText(r, style, noise) {
  const dob = `${two(r.d)}/${two(r.m)}/${r.y}`;
  const num = `${1000 + Math.floor(rnd() * 8999)} ${1000 + Math.floor(rnd() * 8999)} ${r.last4}`;
  const g = { M: "MALE", F: "FEMALE", T: "TRANSGENDER" }[r.g];
  const lines = {
    card: ["Government of India", r.name, `DOB: ${dob}`, g, num, "Mera Aadhaar, Meri Pehchaan"],
    old: ["GOVERNMENT OF INDIA", "| " + r.name + " |", `Date of Birth : ${dob.replace(/\//g, "-")}`, g, num, "VID : 9123 4567 8901 2345"],
    eaadhaar: ["Unique Identification Authority of India", `${r.name}`, "S/O Someone, Lane 4,", `Date of Birth/DOB: ${dob}`, g, num, "VID: 9123 4567 8901 2345"],
  }[style];
  // Noise only touches the number and the date line, the way real OCR slips; names are read as printed.
  return lines.map((l, i) => (i === 0 || l === r.name || l.includes(r.name) ? l : noisy(l, noise))).join("\n");
}

test("text path: field accuracy on printed-card layouts (reported, with a floor)", () => {
  const styles = ["card", "old", "eaadhaar"];
  const total = { name: 0, dob: 0, gender: 0, last4: 0 }, ok = { ...total };
  const N = 450;
  for (let i = 0; i < N; i++) {
    const r = record();
    const noise = [0, 0.02, 0.05][i % 3];
    const out = parseAadhaar(printedText(r, styles[i % 3], noise));
    total.name++; total.dob++; total.gender++; total.last4++;
    if (out.name === r.name) ok.name++;
    if (out.dob === `${two(r.d)}/${two(r.m)}/${r.y}`) ok.dob++;
    if (out.gender === GENDER[r.g]) ok.gender++;
    if (out.last4 === r.last4) ok.last4++;
  }
  const pct = (k) => Math.round((ok[k] / total[k]) * 1000) / 10;
  console.log(`Text benchmark (${total.name} cards): name ${pct("name")}%, dob ${pct("dob")}%, gender ${pct("gender")}%, last4 ${pct("last4")}%`);
  assert.ok(pct("name") >= 90, "name accuracy fell");
  assert.ok(pct("gender") >= 95, "gender accuracy fell");
  assert.ok(pct("last4") >= 90, "last-4 accuracy fell");
  assert.ok(pct("dob") >= 85, "date of birth accuracy fell");
});
