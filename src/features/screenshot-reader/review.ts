/**
 * Confirm-before-save rules for the screenshot reader. Pure.
 *  - Every row starts UNCONFIRMED, including rows the person adds.
 *  - Changing any value of a row makes it unconfirmed again.
 *  - A row with a problem cannot be confirmed.
 *  - Saving is possible only when there is at least one row, every row is confirmed and none has a problem. `toSaveBody` refuses otherwise.
 */
import type { ReadRow } from "@/features/screenshot-reader/parse";

export interface ReviewRow { id: string; team: string; placement: string; kills: string; confirmed: boolean; suggestion: string | null; raw: string }
export type RowPatch = Partial<Pick<ReviewRow, "team" | "placement" | "kills">>;

export const fromRead = (rows: readonly ReadRow[]): ReviewRow[] =>
  rows.map((r) => ({ id: r.id, team: r.team, placement: r.placement === null ? "" : String(r.placement), kills: r.kills === null ? "" : String(r.kills), confirmed: false, suggestion: r.suggestion, raw: r.raw }));

const whole = (v: string, min: number, max: number): number | null => (/^\d{1,3}$/.test(v.trim()) && Number(v) >= min && Number(v) <= max ? Number(v) : null);

export function rowProblems(rows: readonly ReviewRow[], id: string): string[] {
  const r = rows.find((x) => x.id === id);
  if (!r) return [];
  const p: string[] = [];
  const team = r.team.replace(/\s+/g, " ").trim();
  if (team.length < 1 || team.length > 60 || /[<>]/.test(team)) p.push("Type the team name (1 to 60 characters).");
  if (whole(r.placement, 1, 200) === null) p.push("Placement must be a whole number from 1 to 200.");
  if (whole(r.kills, 0, 999) === null) p.push("Kills must be a whole number from 0 to 999.");
  if (team && rows.some((x) => x.id !== id && x.team.replace(/\s+/g, " ").trim().toLowerCase() === team.toLowerCase())) p.push("This team is listed twice.");
  if (r.placement.trim() && rows.some((x) => x.id !== id && x.placement.trim() !== "" && Number(x.placement) === Number(r.placement))) p.push("Two rows have this placement.");
  return p;
}

export const editRow = (rows: readonly ReviewRow[], id: string, patch: RowPatch): ReviewRow[] => rows.map((r) => (r.id === id ? { ...r, ...patch, confirmed: false } : r));
export const confirmRow = (rows: readonly ReviewRow[], id: string): ReviewRow[] => (rowProblems(rows, id).length ? [...rows] : rows.map((r) => (r.id === id ? { ...r, confirmed: true } : r)));
/**
 * "Confirm all rows without problems": the person's own action, never automatic. Rows with a problem stay unconfirmed, and saving still
 * needs every row confirmed (here and on the server, which refuses rows without confirmed: true).
 */
export const confirmClean = (rows: readonly ReviewRow[]): ReviewRow[] => rows.map((r) => (r.confirmed || rowProblems(rows, r.id).length ? r : { ...r, confirmed: true }));
/** How many rows "Confirm all rows without problems" would confirm now. */
export const cleanUnconfirmed = (rows: readonly ReviewRow[]): number => rows.filter((r) => !r.confirmed && rowProblems(rows, r.id).length === 0).length;
export const unconfirmRow = (rows: readonly ReviewRow[], id: string): ReviewRow[] => rows.map((r) => (r.id === id ? { ...r, confirmed: false } : r));
/** Removing a row can create or clear a duplicate elsewhere, so every other row is checked again: a row that now has a problem is unconfirmed. */
export function removeRow(rows: readonly ReviewRow[], id: string): ReviewRow[] {
  const left = rows.filter((r) => r.id !== id);
  return left.map((r) => (r.confirmed && rowProblems(left, r.id).length ? { ...r, confirmed: false } : r));
}
export function addRow(rows: readonly ReviewRow[]): ReviewRow[] {
  let n = rows.length + 1;
  while (rows.some((r) => r.id === `n${n}`)) n++;
  return [...rows, { id: `n${n}`, team: "", placement: "", kills: "", confirmed: false, suggestion: null, raw: "" }];
}
export const applySuggestion = (rows: readonly ReviewRow[], id: string): ReviewRow[] => rows.map((r) => (r.id === id && r.suggestion ? { ...r, team: r.suggestion, suggestion: null, confirmed: false } : r));

export function reviewSummary(rows: readonly ReviewRow[]) {
  return { total: rows.length, confirmed: rows.filter((r) => r.confirmed).length, withProblems: rows.filter((r) => rowProblems(rows, r.id).length > 0).length };
}

/** Why saving is not possible yet, in plain words, or null when it is. */
export function saveBlocker(rows: readonly ReviewRow[], matchNo: string): string | null {
  if (!/^\d{1,4}$/.test(matchNo.trim()) || Number(matchNo) < 1) return "Type the match number (1 to 9999).";
  if (rows.length === 0) return "There are no rows to save.";
  const s = reviewSummary(rows);
  if (s.withProblems) return `Fix ${s.withProblems === 1 ? "the row" : `the ${s.withProblems} rows`} with a problem first.`;
  if (s.confirmed < s.total) return `Check and confirm every row first: ${s.confirmed} of ${s.total} confirmed.`;
  return null;
}
export const canSave = (rows: readonly ReviewRow[], matchNo: string): boolean => saveBlocker(rows, matchNo) === null;

export function toSaveBody(rows: readonly ReviewRow[], matchNo: string, replace: boolean) {
  const why = saveBlocker(rows, matchNo);
  if (why) throw new Error(why);
  return { matchNo: Number(matchNo), replace, rows: rows.map((r) => ({ team: r.team.replace(/\s+/g, " ").trim(), placement: Number(r.placement), kills: Number(r.kills), confirmed: true as const })) };
}
