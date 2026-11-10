/**
 * Reads the text that OCR found on an Aadhaar card (printed card, photocopy, or a screenshot of the e-Aadhaar) and pulls out
 * the details an ID card needs. It deliberately returns only the LAST FOUR digits of the number: the full number is never kept.
 * OCR is imperfect, so every result is shown to a person to check before it is used.
 */
export interface AadhaarRead {
  name?: string;
  dob?: string;
  yob?: string;
  gender?: "Male" | "Female" | "Transgender";
  last4?: string;
  /** Where the details came from: the QR code on the card (exact) or OCR of the printed text (check it). */
  source?: "qr" | "ocr";
  /** Secure QR only: whether UIDAI's signature on the QR checked out. "unchecked" means no certificate is installed to check against. */
  verified?: "valid" | "invalid" | "unchecked";
}

const NOISE = /(government|india|aadhaar|aadhar|unique|identification|authority|uidai|enrol|vid|address|download|issue|male|female|dob|birth|year|year of birth|signature|digitally|help|www|\.gov|\.in\b|mera|आधार|भारत)/i;

const clean = (l: string) => l.replace(/[|_~=«»“”"]+/g, " ").replace(/\s+/g, " ").trim();

/** One line of OCR output with the engine's own confidence (0 to 100) for it. */
export interface OcrLine { text: string; conf: number }

export function parseAadhaar(text: string, ocrLines?: OcrLine[]): AadhaarRead {
  const rows: OcrLine[] = (ocrLines ?? text.split(/\r?\n/).map((t) => ({ text: t, conf: 100 }))).map((l) => ({ text: clean(l.text), conf: l.conf })).filter((l) => l.text);
  const lines = rows.map((r) => r.text);
  const all = lines.join("\n");
  const out: AadhaarRead = {};

  // Number: 4-4-4 digits. Keep only the last group.
  const num = all.match(/\b(\d{4})\s?(\d{4})\s?(\d{4})\b/);
  if (num) out.last4 = num[3];

  // Date of birth, or at least the year.
  const dob = all.match(/(?:DOB|D\.?O\.?B\.?|Date\s*of\s*Birth)[^\d\n]{0,14}(\d{2})\s*[\/\-.]\s*(\d{2})\s*[\/\-.]\s*(\d{4})/i) ?? all.match(/\b(\d{2})[\/\-.](\d{2})[\/\-.]((?:19|20)\d{2})\b/);
  if (dob) out.dob = `${dob[1]}/${dob[2]}/${dob[3]}`;
  else { const y = all.match(/Year\s*of\s*Birth[^\d\n]{0,12}((?:19|20)\d{2})/i); if (y) out.yob = y[1]; }

  // FEMALE contains "MALE", so test it first.
  if (/\bFEMALE\b/i.test(all)) out.gender = "Female";
  else if (/\bMALE\b/i.test(all)) out.gender = "Male";
  else if (/TRANSGENDER/i.test(all)) out.gender = "Transgender";

  // Name. Scripts the engine cannot read (Marathi, Hindi, Tamil...) come out as junk like "dl TepR urd", so a line only counts as a
  // name if it is clean Latin text AND the engine is confident about it. The English name appears in two places on an e-Aadhaar:
  // two lines under "To", and directly above the date of birth on the card. We collect both and keep the most confident one.
  const word = /^(?:[A-Z][a-z]{1,}|[A-Z]{2,}|[A-Z]\.?)$/;
  const looksLikeName = (l: string) => {
    const words = l.split(" ").filter(Boolean);
    return words.length >= 2 && words.length <= 5 && /^[A-Za-z][A-Za-z .'-]+$/.test(l) && !NOISE.test(l) && words.every((w) => word.test(w));
  };
  const cands: OcrLine[] = [];
  const take = (i: number) => { if (rows[i] && looksLikeName(rows[i].text) && rows[i].conf >= 60) cands.push(rows[i]); };
  const to = lines.findIndex((l) => /^to$/i.test(l));
  if (to >= 0) for (let i = to + 1; i <= to + 3; i++) take(i);
  const at = lines.findIndex((l) => /(?:DOB|D\.?O\.?B|Date\s*of\s*Birth|Year\s*of\s*Birth)/i.test(l) || (dob && l.includes(dob[1]) && l.includes(dob[3])));
  if (at > 0) for (let i = at - 1; i >= Math.max(0, at - 3); i--) take(i);
  // Older cards have neither marker: fall back to any clean line.
  if (!cands.length) rows.forEach((_, i) => take(i));
  const best = cands.sort((x, y) => y.conf - x.conf || y.text.length - x.text.length)[0];
  if (best) out.name = best.text.split(" ").map((w) => (w.length > 2 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w)).join(" ");
  return out;
}

export const maskAadhaar = (last4?: string) => (last4 ? `XXXX XXXX ${last4}` : "");
