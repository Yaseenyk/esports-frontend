/**
 * Turns the text Tesseract read from a results screenshot into rows (team, placement, kills). Pure, so the unit tests can feed fixture text.
 * Reading is often wrong: every row this returns still has to be checked and confirmed by a person (see review.ts). Nothing here guesses a value
 * it did not read: a missing placement or kill count stays empty.
 */
export interface ReadRow { id: string; team: string; placement: number | null; kills: number | null; raw: string; suggestion: string | null }

const KILL_WORDS = /^(kills?|k|elims?|eliminations?|finishes|fin|pts|points?)$/i;
const HEADER_WORDS = /^(rank|#|no\.?|pos|position|place|placement|team|teams|squad|name|kills?|elims?|finishes|pts|points?|total|match|result|results)$/i;

/** Digits that OCR often reads as letters (O for 0, l or I for 1, S for 5, B for 8, Z for 2), only inside a short token that has a real digit. */
export function fixDigits(token: string): string {
  if (!/^[0-9OoIl|SsBZ]{1,3}$/.test(token) || !/[0-9]/.test(token)) return token;
  return token.replace(/[Oo]/g, "0").replace(/[Il|]/g, "1").replace(/[Ss]/g, "5").replace(/B/g, "8").replace(/Z/g, "2");
}
const asInt = (token: string, max: number): number | null => {
  const t = fixDigits(token);
  if (!/^\d{1,3}$/.test(t)) return null;
  const n = Number(t);
  return n <= max ? n : null;
};

/** Similarity 0..1 of two names (Levenshtein on letters and digits only, case-insensitive). */
export function similarity(a: string, b: string): number {
  const x = a.toLowerCase().replace(/[^a-z0-9]/g, ""), y = b.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!x || !y) return 0;
  if (x === y) return 1;
  const d: number[] = Array.from({ length: y.length + 1 }, (_, j) => j);
  for (let i = 1; i <= x.length; i++) {
    let prev = d[0]!;
    d[0] = i;
    for (let j = 1; j <= y.length; j++) {
      const tmp = d[j]!;
      d[j] = Math.min(d[j]! + 1, d[j - 1]! + 1, prev + (x[i - 1] === y[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return 1 - d[y.length]! / Math.max(x.length, y.length);
}

/** The event's team closest to what was read, when it is close enough to be worth offering (never applied without the person's tap). */
export function closestTeam(read: string, known: readonly string[], min = 0.6): string | null {
  let best: string | null = null, score = 0;
  for (const k of known) { const s = similarity(read, k); if (s > score) { score = s; best = k; } }
  return best !== null && score >= min ? best : null;
}

function parseLine(line: string): { placement: number | null; team: string; kills: number | null } | null {
  const clean = line.replace(/[|•·,;]+/g, " ").replace(/\s+/g, " ").trim();
  if (!/[A-Za-z]/.test(clean)) return null;
  const tokens = clean.split(" ");
  if (tokens.every((t) => HEADER_WORDS.test(t))) return null;
  let placement: number | null = null;
  const first = /^#?([0-9OoIl]{1,3})(st|nd|rd|th|\.|\)|:|-)?$/i.exec(tokens[0] ?? "");
  if (first) {
    placement = asInt(first[1]!, 200);
    if (placement !== null && placement >= 1) tokens.shift(); else placement = null;
  }
  const trailing: number[] = [];
  while (tokens.length > 1) {
    const last = tokens[tokens.length - 1]!;
    if (KILL_WORDS.test(last)) { tokens.pop(); continue; }
    const n = asInt(last.replace(/^(\d+)(k|kills?)$/i, "$1"), 999);
    if (n === null) break;
    trailing.unshift(n);
    tokens.pop();
  }
  const team = tokens.join(" ").replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9)\]]+$/g, "").trim().slice(0, 60);
  if (!/[A-Za-z]/.test(team)) return null;
  // With two trailing numbers (kills then points, the usual column order) the first is the kill count.
  const kills = trailing.length ? trailing[0]! : null;
  if (placement === null && kills === null) return null;
  return { placement, team, kills };
}

/** Rows found in the text, in reading order. Exact (case-insensitive) team names are written the event's way; close ones are offered as a suggestion. */
export function parseResultsText(text: string, knownTeams: readonly string[] = []): ReadRow[] {
  const out: ReadRow[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.length > 200) continue;
    const p = parseLine(line);
    if (!p) continue;
    const exact = knownTeams.find((k) => k.trim().toLowerCase() === p.team.toLowerCase());
    const suggestion = exact ? null : closestTeam(p.team, knownTeams);
    out.push({ id: `r${out.length + 1}`, team: exact ?? p.team, placement: p.placement, kills: p.kills, raw: line.slice(0, 120), suggestion });
    if (out.length >= 100) break;
  }
  return out;
}
