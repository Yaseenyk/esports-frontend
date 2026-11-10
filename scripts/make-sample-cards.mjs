// Builds the demo "sample cards" shown in the ID card tool. Everything is invented.
// Step 1 (this file): make scannable Secure QR codes from made-up details, following the same layout real cards use.
// Step 2: python scripts/compose-sample-cards.py puts each QR on a clearly watermarked card image in public/samples/.
// Run: node scripts/make-sample-cards.mjs && python scripts/compose-sample-cards.py
import fs from "node:fs";
import zlib from "node:zlib";
import path from "node:path";
import QRCode from "qrcode";

export const PEOPLE = [
  { file: "aarav-mehta", name: "Aarav Mehta", dob: "12-05-2003", g: "M", last4: "4471", num: "0000 0000 4471", co: "S/O Rajesh Mehta,", house: "Flat 402 Sample Heights,", street: "Sample Road", vtc: "Pune", district: "Pune", state: "Maharashtra", pin: "411001" },
  { file: "diya-kulkarni", name: "Diya Kulkarni", dob: "23-09-2004", g: "F", last4: "8802", num: "0000 0000 8802", co: "D/O Suresh Kulkarni,", house: "House 17 Sample Colony,", street: "Sample Lane", vtc: "Kolhapur", district: "Kolhapur", state: "Maharashtra", pin: "416001" },
  { file: "rohan-deshmukh", name: "Rohan Deshmukh", dob: "02-11-2002", g: "M", last4: "1936", num: "0000 0000 1936", co: "S/O Anil Deshmukh,", house: "H NO-9 Sample Nagar,", street: "Sample Street", vtc: "Ratnagiri", district: "Ratnagiri", state: "Maharashtra", pin: "415612" },
];

function securePayload(p) {
  const ref = p.last4 + "20261105120000123"; // first 4 digits = last 4 of the (fake) number, then a 17-digit timestamp
  const f = ["V5", "3", ref, p.name, p.dob, p.g, p.co, p.district, "", p.house, "", p.pin, p.vtc, p.state, p.street, "", p.vtc];
  const parts = f.map((x) => Buffer.from(x, "latin1"));
  const filler = Buffer.from([0xff, 0x4f, 0xff, 0x51, 0, 0x2f, 0, 0]); // no photo in the dummy data
  const buf = Buffer.concat([...parts.flatMap((x) => [x, Buffer.from([255])]), filler]);
  return BigInt("0x" + zlib.gzipSync(buf, { level: 9 }).toString("hex")).toString(10);
}

const out = path.resolve("scripts/.tmp-qr");
fs.mkdirSync(out, { recursive: true });
for (const p of PEOPLE) {
  const text = securePayload(p);
  await QRCode.toFile(path.join(out, p.file + ".png"), [{ data: text, mode: "numeric" }], { errorCorrectionLevel: "L", margin: 2, scale: 4 });
  console.log(p.file, "digits:", text.length);
}
fs.writeFileSync(path.join(out, "people.json"), JSON.stringify(PEOPLE, null, 2));
