/**
 * Result corrections entered when a dispute is resolved (API.md section 5, "Corrections"). Pure: drafts, validation, the request payload
 * and the "old value" text. The server is the authority (it reads the old value itself and never overwrites a legacy row); this checks
 * what it can before the request and shows the person what is being replaced.
 */
export interface CurrentMatch { id: string; stage: string; round: number; slot: number; a: string; b: string; scoreA: number | null; scoreB: number | null; winner: string | null }
export interface CurrentBr { matchNo: number; team: string; placement: number; kills: number }
export interface CurrentResults { matches: CurrentMatch[]; br: CurrentBr[] }

export type Winner = "" | "a" | "b" | "draw";
export type DraftKind = "match" | "br";
/** One correction being typed. Numbers stay strings while typing. */
export interface CorrectionDraft { key: string; kind: DraftKind; matchId: string; scoreA: string; scoreB: string; winner: Winner; matchNo: string; team: string; placement: string; kills: string }
export type DraftField = "matchId" | "scoreA" | "scoreB" | "winner" | "matchNo" | "team" | "placement" | "kills";
export type DraftErrors = Partial<Record<DraftField, string>>;

export const MAX_CORRECTIONS = 10;
export const BOUNDS = { score: [0, 100000], matchNo: [1, 10000], placement: [1, 100], kills: [0, 200] } as const;

export const blankDraft = (kind: DraftKind, key: string, seed: Partial<CorrectionDraft> = {}): CorrectionDraft =>
  ({ key, kind, matchId: "", scoreA: "", scoreB: "", winner: "", matchNo: "", team: "", placement: "", kills: "", ...seed });

/** Corrections are only accepted with a resolved, upheld or partly upheld decision. */
export const correctionsAllowed = (status: string, outcome: string): boolean => status === "resolved" && (outcome === "upheld" || outcome === "partially_upheld");

const whole = (s: string, lo: number, hi: number): number | null => {
  const t = s.trim();
  if (!/^\d{1,6}$/.test(t)) return null;
  const n = Number(t);
  return n >= lo && n <= hi ? n : null;
};
const range = (lo: number, hi: number): string => `A whole number from ${lo} to ${hi}.`;
const targetOf = (d: CorrectionDraft): string => (d.kind === "match" ? `m:${d.matchId.trim()}` : `b:${d.matchNo.trim()}:${d.team.trim().toLowerCase()}`);

const findMatch = (d: CorrectionDraft, cur: CurrentResults | null): CurrentMatch | undefined => cur?.matches.find((m) => m.id === d.matchId.trim());
const findBr = (d: CorrectionDraft, cur: CurrentResults | null): CurrentBr | undefined => cur?.br.find((r) => String(r.matchNo) === d.matchNo.trim() && r.team === d.team.trim());

export function validateDraft(d: CorrectionDraft, cur: CurrentResults | null): DraftErrors {
  const e: DraftErrors = {};
  if (d.kind === "match") {
    if (!d.matchId.trim()) e.matchId = "Choose the match.";
    else if (cur && !findMatch(d, cur)) e.matchId = "That match is not in this tournament.";
    const a = whole(d.scoreA, ...BOUNDS.score), b = whole(d.scoreB, ...BOUNDS.score);
    if (a === null) e.scoreA = range(...BOUNDS.score);
    if (b === null) e.scoreB = range(...BOUNDS.score);
    if (!d.winner) e.winner = "Choose the winner, or draw.";
    else if (a !== null && b !== null) {
      if (d.winner === "a" && a < b) e.winner = "Side A cannot win with fewer points than side B.";
      else if (d.winner === "b" && b < a) e.winner = "Side B cannot win with fewer points than side A.";
      else if (d.winner === "draw" && a !== b) e.winner = "A draw needs equal scores.";
    }
    const old = findMatch(d, cur);
    if (old && !e.scoreA && !e.scoreB && !e.winner && old.scoreA === a && old.scoreB === b && old.winner === d.winner) e.scoreA = "Same as the current result. Change at least one value.";
  } else {
    if (whole(d.matchNo, ...BOUNDS.matchNo) === null) e.matchNo = range(...BOUNDS.matchNo);
    if (!d.team.trim()) e.team = "Enter the team name exactly as in the results.";
    else if (cur && !e.matchNo && !findBr(d, cur)) e.team = "That team has no result in this match.";
    const p = whole(d.placement, ...BOUNDS.placement), k = whole(d.kills, ...BOUNDS.kills);
    if (p === null) e.placement = range(...BOUNDS.placement);
    if (k === null) e.kills = range(...BOUNDS.kills);
    const old = findBr(d, cur);
    if (old && p !== null && k !== null && old.placement === p && old.kills === k) e.placement = "Same as the current result. Change at least one value.";
  }
  return e;
}

export interface CorrectionsCheck { byKey: Record<string, DraftErrors>; general: string; ok: boolean }

export function validateCorrections(drafts: readonly CorrectionDraft[], cur: CurrentResults | null): CorrectionsCheck {
  const byKey: Record<string, DraftErrors> = {};
  const seen = new Set<string>();
  let general = "";
  if (drafts.length > MAX_CORRECTIONS) general = `At most ${MAX_CORRECTIONS} corrections in one decision.`;
  for (const d of drafts) {
    const e = validateDraft(d, cur);
    const t = targetOf(d);
    if (seen.has(t) && !e.matchId && !e.team) { if (d.kind === "match") e.matchId = "This match is already corrected above."; else e.team = "This result is already corrected above."; }
    seen.add(t);
    byKey[d.key] = e;
  }
  return { byKey, general, ok: !general && Object.values(byKey).every((e) => Object.keys(e).length === 0) };
}

/** The API.md `corrections` payload. Call only after validation. */
export function correctionPayload(drafts: readonly CorrectionDraft[]): Record<string, unknown>[] {
  return drafts.map((d) => (d.kind === "match"
    ? { matchId: d.matchId.trim(), scoreA: Number(d.scoreA), scoreB: Number(d.scoreB), winner: d.winner }
    : { matchNo: Number(d.matchNo), team: d.team.trim(), placement: Number(d.placement), kills: Number(d.kills) }));
}

const winnerText = (w: string | null, a: string, b: string): string => (w === "a" ? `${a} won` : w === "b" ? `${b} won` : w === "draw" ? "draw" : "no winner set");

/** "Current: Alpha 13 - 9 Beta, Alpha won", or null when the current result is not known on this screen. */
export function oldValueText(d: CorrectionDraft, cur: CurrentResults | null): string | null {
  if (d.kind === "match") {
    const m = findMatch(d, cur);
    return m ? `${m.a} ${m.scoreA ?? "-"} - ${m.scoreB ?? "-"} ${m.b}, ${winnerText(m.winner, m.a, m.b)}` : null;
  }
  const r = findBr(d, cur);
  return r ? `${r.team} placed ${r.placement} with ${r.kills} kills in match ${r.matchNo}` : null;
}

export const matchLabel = (m: CurrentMatch): string => `${m.stage} round ${m.round}, slot ${m.slot}: ${m.a} vs ${m.b}${m.scoreA !== null ? ` (${m.scoreA}-${m.scoreB ?? "-"})` : ""}`;

/** `br:2:Alpha Wolves` / `match:<id>` (what the API calls `matchRef`) in words. */
export function refLabel(ref: string): string {
  const br = /^br:(\d+):(.*)$/.exec(ref);
  if (br) return `Battle royale match ${br[1]}, ${br[2]}`;
  if (ref.startsWith("match:")) return "Head-to-head match";
  return ref;
}

/** Old and new values as one short phrase: `placement 2, kills 11`. */
export const valueText = (v: Record<string, number | string>): string => Object.entries(v).map(([k, x]) => `${k.replace(/([A-Z])/g, " $1").toLowerCase()} ${x}`).join(", ");
