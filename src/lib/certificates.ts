/**
 * Pure helpers for the certificate maker: read "Award: Name" lines, read the `?awards=` and `?names=` links the results tools
 * send, and clean everything defensively (length caps, no control characters). Nothing here touches the page or a server.
 */
export interface CertEntry { name: string; award: string }

export const MAX_ROWS = 100;
export const MAX_NAME = 80;
export const MAX_AWARD = 40;

/** Removes control characters (including line breaks and tabs), collapses spaces, trims and cuts to `max` characters. */
// Control characters, line and paragraph separators, zero-width and bidi override marks. Built from a string so the source stays plain ASCII.
const CONTROL = new RegExp("[\u0000-\u001f\u007f-\u009f\u2028\u2029\u200b-\u200f\u202a-\u202e\u2066-\u2069]", "g");

export function clean(v: string, max: number): string {
  return Array.from(String(v ?? "").replace(CONTROL, " ").replace(/\s+/g, " ").trim()).slice(0, max).join("").trim();
}

const AWARD_ALIASES: [RegExp, string][] = [
  [/^(winner|winners|1st|first|1st place|first place|champion|champions)$/i, "Winner"],
  [/^(runner[- ]?up|runners[- ]?up|2nd|second|2nd place|second place)$/i, "Runner-up"],
  [/^(3rd|third|3rd place|third place)$/i, "Third place"],
  [/^(participation|participant|participants)$/i, "Participation"],
];

/** Tidies an award label. The usual ones (winner, 2nd, third place ...) get one spelling; anything else is kept as typed. */
export function normaliseAward(v: string): string {
  const s = clean(v, MAX_AWARD);
  for (const [re, label] of AWARD_ALIASES) if (re.test(s)) return label;
  return s;
}

/** Splits `Award: Name` at the first colon. A line with no colon (or nothing before it) has no award. */
export function parseEntry(line: string): CertEntry | null {
  const raw = String(line ?? "");
  const i = raw.indexOf(":");
  const name = clean(i < 0 ? raw : raw.slice(i + 1), MAX_NAME);
  if (!name) return null;
  return { name, award: i < 0 ? "" : normaliseAward(raw.slice(0, i)) };
}

/** Reads the textarea (one `Award: Name` per line). At most 100 rows. */
export function parseAwardLines(text: string): CertEntry[] {
  const out: CertEntry[] = [];
  for (const line of String(text ?? "").split(/\r?\n/)) {
    const e = parseEntry(line);
    if (e) out.push(e);
    if (out.length >= MAX_ROWS) break;
  }
  return out;
}

/** The reverse of parseAwardLines: what goes in the textarea. */
export const entriesToText = (rows: CertEntry[]): string => rows.map((r) => (r.award ? `${r.award}: ${r.name}` : r.name)).join("\n");

/**
 * Reads `?awards=Winner:Team A|Runner-up:Team B` (and `?names=` for a plain list, which gets the award "Participation").
 * `awards` wins when both are present. Returns no rows and source null when neither gives anything usable.
 */
export function parseCertQuery(search: string): { rows: CertEntry[]; source: "awards" | "names" | null } {
  let p: URLSearchParams;
  try { p = new URLSearchParams(String(search ?? "").slice(0, 20000)); } catch { return { rows: [], source: null }; }
  const awards = p.get("awards");
  if (awards) {
    const rows: CertEntry[] = [];
    for (const part of awards.split("|")) {
      const e = parseEntry(part);
      if (e) rows.push(e);
      if (rows.length >= MAX_ROWS) break;
    }
    if (rows.length) return { rows, source: "awards" };
  }
  const names = p.get("names");
  if (names) {
    const rows: CertEntry[] = [];
    for (const part of names.split(/[|\r\n]+/)) {
      const name = clean(part, MAX_NAME);
      if (name) rows.push({ name, award: "Participation" });
      if (rows.length >= MAX_ROWS) break;
    }
    if (rows.length) return { rows, source: "names" };
  }
  return { rows: [], source: null };
}

/** The award printed on one certificate: the row's own, or the global "Award or result" box when the row has none. */
export const awardFor = (row: CertEntry, fallback: string): string => row.award || fallback;
