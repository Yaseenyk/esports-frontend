/** Pure helpers for the ready-check: deadline maths, state derivation and validation windows. No network, no DOM. */

export const DEFAULT_GRACE = 10;
export const MAX_GRACE = 120;
/** A captain can tap "we are here" from this long before the start. */
export const READY_WINDOW_MIN = 60;

export interface BoardMatch {
  id: string; stage: string; round: number; slot: number; a: string; b: string; status: string; startsAt: string | null;
  aReady: boolean; bReady: boolean; aReadyAt: string | null; bReadyAt: string | null; graceDeadline: string | null; late: ("a" | "b")[];
}
export interface BoardData { settings: { graceMinutes: number }; serverTime: string; matches: BoardMatch[] }

export interface CaptainMatch {
  id: string; stage: string; round: number; opponent: string; startsAt: string; status: string;
  youReady: boolean; opponentReady: boolean; minutesToGrace: number; canMark: boolean;
}
export interface CaptainData { team: string; eventName: string; graceMinutes: number; serverTime: string; matches: CaptainMatch[] }

const time = (iso: string | null): number | null => { if (!iso) return null; const t = Date.parse(iso); return Number.isNaN(t) ? null : t; };

/** True for a whole number of minutes the organiser may choose (0 means no grace: late the moment the match is due). */
export function validGrace(n: unknown): n is number { return typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= MAX_GRACE; }

/** Parses what the organiser typed into a grace period, or null when it is not a whole number from 0 to 120. */
export function parseGrace(text: string): number | null {
  const t = text.trim();
  if (!/^\d{1,3}$/.test(t)) return null;
  const n = Number(t);
  return validGrace(n) ? n : null;
}

/** The moment a team counts as late (epoch ms), or null when the match has no start time. */
export function graceDeadlineMs(startsAt: string | null, graceMinutes: number): number | null {
  const s = time(startsAt);
  return s === null ? null : s + graceMinutes * 60_000;
}

/** Milliseconds from `now` to the start, negative once it is due. Null with no start time. */
export function msToStart(startsAt: string | null, now: number): number | null {
  const s = time(startsAt);
  return s === null ? null : s - now;
}

/** May a captain change their ready state now? Only for a match that has not gone live, from 60 minutes before the start. */
export function canMarkNow(status: string, startsAt: string | null, now: number): boolean {
  if (status !== "scheduled" && status !== "ready") return false;
  const s = time(startsAt);
  return s !== null && now >= s - READY_WINDOW_MIN * 60_000;
}

/** Short words for a time span: "12 min", "1 h 5 min", "45 s", "now". */
export function spanText(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return s === 0 ? "now" : `${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60), r = m % 60;
  if (h >= 24) { const d = Math.floor(h / 24); return `${d} d ${h % 24} h`; }
  return r ? `${h} h ${r} min` : `${h} h`;
}

/** Clock-corrected "now": the phone clock may be off, so the server time from the last answer sets an offset. */
export function clockOffset(serverTime: string | undefined, localNow: number): number {
  const t = time(serverTime ?? null);
  return t === null ? 0 : t - localNow;
}

export type CaptainState = "noOpponent" | "live" | "both" | "waiting" | "early" | "late" | "ready";

/**
 * What the captain card should say.
 *  noOpponent: opponent not decided; live: match started; both: both teams ready; waiting: you are ready, opponent not yet;
 *  early: more than 60 minutes before the start; late: past the grace period and you have not tapped; ready: your turn to tap.
 */
export function captainState(m: CaptainMatch, graceMinutes: number, now: number): CaptainState {
  if (!m.opponent) return "noOpponent";
  if (m.status === "live") return "live";
  if (m.youReady && m.opponentReady) return "both";
  if (m.youReady) return "waiting";
  if (!canMarkNow(m.status, m.startsAt, now)) return "early";
  const d = graceDeadlineMs(m.startsAt, graceMinutes);
  return d !== null && now > d ? "late" : "ready";
}

/** Which sides of a board match are late right now: past the grace deadline, not ready, and the match not live. */
export function lateSides(m: BoardMatch, graceMinutes: number, now: number): ("a" | "b")[] {
  if (m.status === "live") return [];
  const d = graceDeadlineMs(m.startsAt, graceMinutes);
  if (d === null || now <= d) return [];
  const out: ("a" | "b")[] = [];
  if (m.a && !m.aReady) out.push("a");
  if (m.b && !m.bReady) out.push("b");
  return out;
}

export interface BoardGroups { soon: BoardMatch[]; late: BoardMatch[]; ready: BoardMatch[]; live: number }

const byStart = (x: BoardMatch, y: BoardMatch) => (time(x.startsAt) ?? Infinity) - (time(y.startsAt) ?? Infinity) || x.round - y.round || x.slot - y.slot;

/** Groups the board: Late (someone missing past the deadline), Ready (both here), Starting soon (everything else). Live matches are only counted. */
export function groupBoard(matches: BoardMatch[], graceMinutes: number, now: number): BoardGroups {
  const g: BoardGroups = { soon: [], late: [], ready: [], live: 0 };
  for (const m of matches) {
    if (m.status === "live") { g.live++; continue; }
    if (m.status !== "scheduled" && m.status !== "ready") continue;
    if (m.aReady && m.bReady) g.ready.push(m);
    else if (lateSides(m, graceMinutes, now).length) g.late.push(m);
    else g.soon.push(m);
  }
  g.soon.sort(byStart); g.late.sort(byStart); g.ready.sort(byStart);
  return g;
}

/** The sentence on the confirm sheet: what exactly happens when the organiser presses the button. */
export function forfeitConsequence(m: { a: string; b: string }, side: "a" | "b", noShow: boolean): string {
  const team = side === "a" ? m.a : m.b, other = side === "a" ? m.b : m.a;
  return `${team} will be recorded as a forfeit and ${other} will win this match. If the match leads to a next round, ${other} moves on. ${noShow ? "Neither team has marked itself here, so you are confirming that no one showed up. " : ""}You can still correct the result afterwards from the matches list.`;
}

/** A forfeit needs the other team to be present, unless the organiser confirms that no one showed up. */
export function needsNoShowConfirm(m: BoardMatch, side: "a" | "b"): boolean {
  return !(side === "a" ? m.bReady : m.aReady);
}

/** Reads the token from a query string such as "?t=abc". Returns null when it is missing or not a plausible token. */
export function tokenFromSearch(search: string): string | null {
  const t = new URLSearchParams(search).get("t") ?? "";
  return /^[A-Za-z0-9_-]{20,64}$/.test(t) ? t : null;
}
