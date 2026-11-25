/**
 * Personal match journal (backend flag v3.journal). Pure: shapes, form rules, progress buckets and the CSV export. No I/O.
 * Every number here is SELF-LOGGED by the player: it is private, never verified and never shown as a verified stat.
 */
import { GAMES } from "@/features/shared/games";

export interface JournalEntry {
  id: string; playedOn: string; game: string; mode: string | null; map: string | null; placement: number | null; kills: number; damage: number | null; notes: string | null;
  createdAt: string | null; updatedAt: string | null;
}
export interface JournalList { items: JournalEntry[]; count: number; cap: number }

/** The same limits the server checks (backend src/v3/lib/journal.ts). */
export const LIMITS = { MAX_ENTRIES: 2000, MODE_MAX: 40, MAP_MAX: 40, NOTES_MAX: 500, PLACEMENT_MAX: 100, KILLS_MAX: 200, DAMAGE_MAX: 100_000, FIRST_DAY: "2015-01-01" } as const;

/** The form: every field as typed (strings), checked by `draftProblems` and turned into the API body by `draftBody`. */
export interface Draft { playedOn: string; game: string; mode: string; map: string; placement: string; kills: string; damage: string; notes: string }
export type DraftField = keyof Draft;
export const emptyDraft = (today: string, game = "bgmi"): Draft => ({ playedOn: today, game, mode: "", map: "", placement: "", kills: "", damage: "", notes: "" });
export const draftOf = (e: JournalEntry): Draft => ({
  playedOn: e.playedOn, game: e.game, mode: e.mode ?? "", map: e.map ?? "", placement: e.placement === null ? "" : String(e.placement), kills: String(e.kills), damage: e.damage === null ? "" : String(e.damage), notes: e.notes ?? "",
});

/** Today in the player's own calendar (not UTC), as YYYY-MM-DD. */
export function localDay(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function isCalendarDay(v: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!m) return false;
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))).toISOString().slice(0, 10) === v;
}

const whole = (s: string, min: number, max: number): boolean => /^\d+$/.test(s.trim()) && Number(s) >= min && Number(s) <= max;

/** What is wrong with the form, field by field (empty object = fine). `today` is the player's local day. */
export function draftProblems(d: Draft, today: string): Partial<Record<DraftField, string>> {
  const out: Partial<Record<DraftField, string>> = {};
  if (!isCalendarDay(d.playedOn)) out.playedOn = "Pick the day you played.";
  else if (d.playedOn > today) out.playedOn = "The day cannot be in the future.";
  else if (d.playedOn < LIMITS.FIRST_DAY) out.playedOn = "Pick a day from 2015 on.";
  if (!GAMES.some((g) => g.value === d.game)) out.game = "Pick a game.";
  if (!whole(d.kills, 0, LIMITS.KILLS_MAX)) out.kills = `Kills: a whole number from 0 to ${LIMITS.KILLS_MAX}.`;
  if (d.placement.trim() && !whole(d.placement, 1, LIMITS.PLACEMENT_MAX)) out.placement = `Placement: a whole number from 1 to ${LIMITS.PLACEMENT_MAX}, or leave it empty.`;
  if (d.damage.trim() && !whole(d.damage, 0, LIMITS.DAMAGE_MAX)) out.damage = `Damage: a whole number from 0 to ${LIMITS.DAMAGE_MAX}, or leave it empty.`;
  for (const [k, max] of [["mode", LIMITS.MODE_MAX], ["map", LIMITS.MAP_MAX], ["notes", LIMITS.NOTES_MAX]] as const) {
    if (Array.from(d[k].trim()).length > max) out[k] = `At most ${max} characters.`;
    else if (/[<>]/.test(d[k])) out[k] = "Use plain text (no < or >).";
  }
  return out;
}

/** The API body. Empty optional fields are sent as null (on an edit that clears them). */
export function draftBody(d: Draft): Record<string, unknown> {
  const opt = (s: string) => (s.trim() ? s.trim() : null);
  const optNum = (s: string) => (s.trim() ? Number(s) : null);
  return { playedOn: d.playedOn, game: d.game, mode: opt(d.mode), map: opt(d.map), placement: optNum(d.placement), kills: Number(d.kills), damage: optNum(d.damage), notes: opt(d.notes) };
}

// ---------------------------------------------------------------- progress
export type Period = "week" | "month";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const utc = (day: string) => new Date(`${day}T00:00:00Z`);

/** The period a day falls in: the Monday that starts its week ("2026-11-23"), or its month ("2026-11"). */
export function periodKey(day: string, p: Period): string {
  if (p === "month") return day.slice(0, 7);
  const d = utc(day);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}
export function periodLabel(key: string, p: Period): string {
  if (p === "month") return `${MONTHS[Number(key.slice(5, 7)) - 1]} ${key.slice(0, 4)}`;
  return `${Number(key.slice(8, 10))} ${MONTHS[Number(key.slice(5, 7)) - 1]}`;
}
function nextKey(key: string, p: Period): string {
  if (p === "month") {
    const y = Number(key.slice(0, 4)), m = Number(key.slice(5, 7));
    return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
  }
  const d = utc(key);
  d.setUTCDate(d.getUTCDate() + 7);
  return d.toISOString().slice(0, 10);
}

export interface Bucket { key: string; label: string; matches: number; kills: number; avgKills: number | null; avgPlacement: number | null; bestPlacement: number | null }
const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Progress per week or month, oldest first: the last `limit` periods up to the newest entry, with empty periods kept (as 0 matches and no average),
 * so the time axis is even. `game` limits it to one game ("" = all).
 */
export function buckets(entries: readonly JournalEntry[], p: Period, game = "", limit = 12): Bucket[] {
  const rows = entries.filter((e) => !game || e.game === game);
  if (rows.length === 0) return [];
  const by = new Map<string, JournalEntry[]>();
  for (const e of rows) { const k = periodKey(e.playedOn, p); by.set(k, [...(by.get(k) ?? []), e]); }
  const keys = [...by.keys()].sort();
  const all: string[] = [];
  for (let k = keys[0]!; k <= keys[keys.length - 1]!; k = nextKey(k, p)) all.push(k);
  return all.slice(-limit).map((k) => {
    const xs = by.get(k) ?? [];
    const placed = xs.filter((x) => x.placement !== null).map((x) => x.placement!);
    const kills = xs.reduce((n, x) => n + x.kills, 0);
    return {
      key: k, label: periodLabel(k, p), matches: xs.length, kills,
      avgKills: xs.length ? round1(kills / xs.length) : null,
      avgPlacement: placed.length ? round1(placed.reduce((a, b) => a + b, 0) / placed.length) : null,
      bestPlacement: placed.length ? Math.min(...placed) : null,
    };
  });
}

export interface Summary { matches: number; kills: number; avgKills: number | null; avgPlacement: number | null; bestPlacement: number | null; wins: number }
export function summarise(entries: readonly JournalEntry[]): Summary {
  const placed = entries.filter((e) => e.placement !== null).map((e) => e.placement!);
  const kills = entries.reduce((n, e) => n + e.kills, 0);
  return {
    matches: entries.length, kills, avgKills: entries.length ? round1(kills / entries.length) : null,
    avgPlacement: placed.length ? round1(placed.reduce((a, b) => a + b, 0) / placed.length) : null,
    bestPlacement: placed.length ? Math.min(...placed) : null, wins: placed.filter((x) => x === 1).length,
  };
}

// ---------------------------------------------------------------- CSV
/** One CSV cell: quoted, quotes doubled, and a leading = + - @ (or tab/CR) defused with an apostrophe so a spreadsheet never runs it as a formula. */
export function csvCell(v: string | number | null): string {
  if (v === null) return "";
  let s = String(v);
  if (typeof v === "string" && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}
export const CSV_HEADER = ["date", "game", "mode", "map", "placement", "kills", "damage", "notes"] as const;
/** The owner's journal as CSV (oldest first), made in the browser. A note says these are self-logged numbers. */
export function journalCsv(entries: readonly JournalEntry[]): string {
  const rows = [...entries].sort((a, b) => a.playedOn.localeCompare(b.playedOn));
  const lines = [CSV_HEADER.join(","), ...rows.map((e) => [e.playedOn, e.game, e.mode, e.map, e.placement, e.kills, e.damage, e.notes].map(csvCell).join(","))];
  return `﻿${lines.join("\r\n")}\r\n`;
}
export const csvFileName = (today: string) => `match-journal-${today}.csv`;
