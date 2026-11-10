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
}

const NOISE = /(government|india|aadhaar|aadhar|unique|identification|authority|uidai|enrol|vid|address|download|issue|male|female|dob|birth|year|year of birth|signature|digitally|help|www|\.gov|\.in\b|mera|आधार|भारत)/i;

const clean = (l: string) => l.replace(/[|_~=«»“”"]+/g, " ").replace(/\s+/g, " ").trim();

export function parseAadhaar(text: string): AadhaarRead {
  const lines = text.split(/\r?\n/).map(clean).filter(Boolean);
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

  // Name: on a card it is the line just above the date of birth. Walk upwards and take the first line that looks like a name.
  const looksLikeName = (l: string) => {
    const words = l.split(" ").filter(Boolean);
    return words.length >= 2 && words.length <= 5 && /^[A-Za-z][A-Za-z .'-]+$/.test(l) && !NOISE.test(l) && words.every((w) => w.length > 1 || /^[A-Z]\.?$/.test(w));
  };
  const at = lines.findIndex((l) => /(?:DOB|D\.?O\.?B|Date\s*of\s*Birth|Year\s*of\s*Birth)/i.test(l) || (dob && l.includes(dob[1]) && l.includes(dob[3])));
  if (at > 0) for (let i = at - 1; i >= Math.max(0, at - 3); i--) if (looksLikeName(lines[i])) { out.name = lines[i]; break; }
  if (!out.name) { const f = lines.find(looksLikeName); if (f) out.name = f; }
  if (out.name) out.name = out.name.split(" ").map((w) => (w.length > 2 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w)).join(" ");
  return out;
}

export const maskAadhaar = (last4?: string) => (last4 ? `XXXX XXXX ${last4}` : "");
