/**
 * Pure helpers for scorer mode (a referee enters results from a phone through a link): score checks, the confirm sentence, the 2 minute undo window,
 * the offline queue and battle royale validation. No browser or network code here, so all of it is unit tested (tests/scorer.test.mjs).
 */

export const UNDO_MS = 120_000;
/** The biggest score the stepper and the keypad accept. The server allows more, a phone screen never needs it. */
export const MAX_SCORE = 999;
export const MAX_KILLS = 99;
export const MAX_PLACEMENT = 200;

export type ScorerStatus = "scheduled" | "ready" | "live" | "finished" | "forfeit";
export interface ScorerMatch {
  id: string; stage: string; round: number; slot: number; a: string; b: string; status: ScorerStatus;
  scoreA: number | null; scoreB: number | null; startsAt: string | null; winner: "a" | "b" | "draw" | null;
}

// ---------- scores ----------
export const clampScore = (n: number): number => (Number.isFinite(n) ? Math.min(MAX_SCORE, Math.max(0, Math.trunc(n))) : 0);
export const stepScore = (n: number | null, delta: number): number => clampScore((n ?? 0) + delta);

/** What was typed into a score box: digits only. Empty gives null so the box can be cleared while typing. */
export function parseScore(text: string): number | null {
  const d = text.replace(/\D/g, "").slice(0, 3);
  return d === "" ? null : Number(d);
}

export function validateScore(a: number | null, b: number | null): { ok: true } | { ok: false; error: string } {
  if (a === null || b === null) return { ok: false, error: "Enter a score for both teams." };
  for (const n of [a, b]) if (!Number.isInteger(n) || n < 0 || n > MAX_SCORE) return { ok: false, error: `Scores are whole numbers from 0 to ${MAX_SCORE}.` };
  return { ok: true };
}

/** The sentence on the confirm sheet, for example "Alpha 13, Beta 9: save?". */
export function confirmText(a: string, b: string, scoreA: number, scoreB: number): string {
  return `${a} ${scoreA}, ${b} ${scoreB}: save?`;
}

export function winnerName(m: Pick<ScorerMatch, "a" | "b">, scoreA: number, scoreB: number): string | null {
  return scoreA > scoreB ? m.a : scoreB > scoreA ? m.b : null;
}

// ---------- undo window ----------
export interface UndoInfo {
  matchId: string;
  savedAt: number;
  /** What the match was before this save. null means it had no result yet. */
  prev: { status: ScorerStatus; scoreA: number | null; scoreB: number | null; winner: "a" | "b" | "draw" | null } | null;
}
export const undoLeftMs = (savedAt: number, now: number): number => Math.max(0, savedAt + UNDO_MS - now);
export const canUndo = (u: UndoInfo | null, now: number): boolean => !!u && undoLeftMs(u.savedAt, now) > 0;
/** "1:52" */
export function formatLeft(ms: number): string {
  const s = Math.ceil(Math.max(0, ms) / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** The queue item that puts a match back as it was before the last save. Nothing is hidden: a correction is flagged on the server too. */
export function undoBody(u: UndoInfo): ResultBody {
  const p = u.prev;
  if (p && p.status === "finished" && p.scoreA !== null && p.scoreB !== null) return { status: "finished", scoreA: p.scoreA, scoreB: p.scoreB };
  if (p && p.status === "forfeit" && (p.winner === "a" || p.winner === "b")) return { status: "forfeit", winner: p.winner, ...(p.scoreA !== null && p.scoreB !== null ? { scoreA: p.scoreA, scoreB: p.scoreB } : {}) };
  return { status: "live", undo: true, scoreA: p?.scoreA ?? null, scoreB: p?.scoreB ?? null };
}

// ---------- offline queue ----------
export interface ResultBody {
  status: "finished" | "forfeit" | "live";
  scoreA?: number | null;
  scoreB?: number | null;
  winner?: "a" | "b";
  undo?: boolean;
}
export interface BrBody { matchNo: number; rows: { team: string; placement: number; kills: number }[] }
export interface QueueItem {
  id: string;
  /** Same key = the newer item replaces the older one that has not been sent yet. */
  key: string;
  kind: "result" | "br";
  matchId?: string;
  body: ResultBody | BrBody;
  /** A short human sentence for the "waiting to send" list. */
  label: string;
  at: number;
}

export const resultKey = (matchId: string) => `r:${matchId}`;
export const brKey = (matchNo: number) => `b:${matchNo}`;

/** Adds an item; an unsent item for the same match (or the same battle royale match number) is replaced, so a referee who fixes a typo offline sends one result. */
export function enqueue(queue: QueueItem[], item: QueueItem): QueueItem[] {
  return [...queue.filter((q) => q.key !== item.key), item];
}

/** Where a link's waiting items are kept. Only a short fingerprint of the token goes into the name. */
export function queueStorageKey(token: string): string {
  let h = 5381;
  for (let i = 0; i < token.length; i++) h = ((h << 5) + h + token.charCodeAt(i)) | 0;
  return `eh-score-queue-${(h >>> 0).toString(36)}`;
}

/** Reads a saved queue defensively: anything damaged is dropped, never thrown. */
export function parseQueue(raw: string | null): QueueItem[] {
  if (!raw) return [];
  let v: unknown;
  try { v = JSON.parse(raw); } catch { return []; }
  if (!Array.isArray(v)) return [];
  const out: QueueItem[] = [];
  for (const x of v.slice(0, 200)) {
    if (typeof x !== "object" || x === null) continue;
    const q = x as Record<string, unknown>;
    if (typeof q.id !== "string" || typeof q.key !== "string" || (q.kind !== "result" && q.kind !== "br") || typeof q.at !== "number" || typeof q.body !== "object" || q.body === null) continue;
    if (q.kind === "result" && typeof q.matchId !== "string") continue;
    out.push({ id: q.id, key: q.key, kind: q.kind, matchId: typeof q.matchId === "string" ? q.matchId : undefined, body: q.body as QueueItem["body"], label: typeof q.label === "string" ? q.label.slice(0, 120) : "Saved result", at: q.at });
  }
  return out;
}

/** retry = keep it and try later (no signal, busy server); drop = the server said no and will keep saying no. */
export function classifyFailure(status: number | undefined): "retry" | "drop" {
  if (!status) return "retry";
  if (status === 408 || status === 429 || status >= 500) return "retry";
  return "drop";
}

export interface SendReport { remaining: QueueItem[]; sent: QueueItem[]; rejected: { item: QueueItem; status: number }[] }

/** Sends the queue in order. The first item that fails for a retryable reason stops the run (order matters: a later result may depend on an earlier one). */
export async function sendQueue(queue: QueueItem[], send: (item: QueueItem) => Promise<void>): Promise<SendReport> {
  const sent: QueueItem[] = [];
  const rejected: SendReport["rejected"] = [];
  let i = 0;
  for (; i < queue.length; i++) {
    const item = queue[i]!;
    try {
      await send(item);
      sent.push(item);
    } catch (e) {
      const status = (e as { status?: number })?.status;
      if (classifyFailure(status) === "retry") break;
      rejected.push({ item, status: status ?? 0 });
    }
  }
  return { remaining: queue.slice(i), sent, rejected };
}

/** Shows waiting results on top of what the server last said, so the referee sees their own work straight away. */
export function overlayQueue(matches: ScorerMatch[], queue: QueueItem[]): ScorerMatch[] {
  const by = new Map(queue.filter((q) => q.kind === "result" && q.matchId).map((q) => [q.matchId!, q.body as ResultBody]));
  if (by.size === 0) return matches;
  return matches.map((m) => {
    const b = by.get(m.id);
    if (!b) return m;
    const sa = b.scoreA ?? null;
    const sb = b.scoreB ?? null;
    if (b.status === "live") return { ...m, status: "live" as const, scoreA: sa, scoreB: sb, winner: null };
    const winner = b.status === "forfeit" ? (b.winner ?? null) : sa === null || sb === null ? null : sa > sb ? "a" as const : sb > sa ? "b" as const : "draw" as const;
    return { ...m, status: b.status, scoreA: sa, scoreB: sb, winner };
  });
}

// ---------- list order ----------
export const isFinal = (m: Pick<ScorerMatch, "status">) => m.status === "finished" || m.status === "forfeit";

/** Matches still to play (live first, then by start time, round and slot) and matches already done. Matches with an undecided team come last in "to play". */
export function splitMatches(matches: ScorerMatch[]): { toPlay: ScorerMatch[]; done: ScorerMatch[] } {
  const rank = (m: ScorerMatch) => (m.status === "live" ? 0 : m.a && m.b ? 1 : 2);
  const t = (m: ScorerMatch) => (m.startsAt ? Date.parse(m.startsAt) || Infinity : Infinity);
  const cmp = (x: ScorerMatch, y: ScorerMatch) => rank(x) - rank(y) || t(x) - t(y) || x.round - y.round || x.slot - y.slot || x.id.localeCompare(y.id);
  return { toPlay: matches.filter((m) => !isFinal(m)).sort(cmp), done: matches.filter(isFinal).sort((x, y) => cmp(y, x)) };
}

// ---------- battle royale ----------
export interface BrRowInput { team: string; placement: string; kills: string }
export interface BrCheck {
  ok: boolean;
  rows: { team: string; placement: number; kills: number }[];
  /** Plain-words problem per team name. */
  errors: Record<string, string>;
  /** One sentence for the whole form when something is wrong. */
  message: string | null;
}

/** Teams with both boxes empty are left out (they did not play). Placement must be 1..N and used once; kills 0..99 (empty counts as 0). */
export function validateBr(input: BrRowInput[], teamCount = input.length): BrCheck {
  const errors: Record<string, string> = {};
  const rows: BrCheck["rows"] = [];
  const byPlace = new Map<number, string>();
  const cap = Math.min(MAX_PLACEMENT, Math.max(1, teamCount));
  for (const r of input) {
    const p = r.placement.trim();
    const k = r.kills.trim();
    if (p === "" && k === "") continue;
    if (p === "") { errors[r.team] = "Enter a placement."; continue; }
    if (!/^\d+$/.test(p)) { errors[r.team] = "Placement is a whole number."; continue; }
    const placement = Number(p);
    if (placement < 1 || placement > cap) { errors[r.team] = `Placement is from 1 to ${cap}.`; continue; }
    if (k !== "" && !/^\d+$/.test(k)) { errors[r.team] = "Kills is a whole number."; continue; }
    const kills = k === "" ? 0 : Number(k);
    if (kills > MAX_KILLS) { errors[r.team] = `Kills is from 0 to ${MAX_KILLS}.`; continue; }
    const other = byPlace.get(placement);
    if (other !== undefined) {
      errors[r.team] = `Placement ${placement} is already used by ${other}.`;
      if (!errors[other]) errors[other] = `Placement ${placement} is also used by ${r.team}.`;
      continue;
    }
    byPlace.set(placement, r.team);
    rows.push({ team: r.team, placement, kills });
  }
  const bad = Object.keys(errors).length;
  const message = bad > 0 ? `Fix ${bad} team${bad === 1 ? "" : "s"} marked below.` : rows.length === 0 ? "Enter a placement for at least one team." : null;
  return { ok: bad === 0 && rows.length > 0, rows: rows.sort((x, y) => x.placement - y.placement), errors, message };
}

/** The empty form for a match number, filled from rows already saved. */
export function brFormFor(teams: string[], saved: { matchNo: number; team: string; placement: number; kills: number }[], matchNo: number): BrRowInput[] {
  const mine = new Map(saved.filter((s) => s.matchNo === matchNo).map((s) => [s.team, s]));
  return teams.map((team) => {
    const s = mine.get(team);
    return { team, placement: s ? String(s.placement) : "", kills: s ? String(s.kills) : "" };
  });
}

/** The match number after the highest saved one, 1 when nothing is saved. */
export const nextBrMatchNo = (saved: { matchNo: number }[]): number => saved.reduce((n, s) => Math.max(n, s.matchNo), 0) + 1;

// ---------- sharing ----------
export const scoreUrl = (origin: string, token: string) => `${origin.replace(/\/$/, "")}/score/?t=${encodeURIComponent(token)}`;

export function whatsappText(label: string, eventName: string, url: string, hours: number): string {
  return `Hi, you are scoring ${label} at ${eventName}. Open this link on your phone to enter results. It stops working after ${hours} hour${hours === 1 ? "" : "s"}, and only you should have it: ${url}`;
}
export const whatsappUrl = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`;

/** Hours left for the list of links: "3 h 20 min left", "Expired", "Revoked". */
export function linkStateText(l: { state: "active" | "expired" | "revoked"; expiresAt: string }, now: number): string {
  if (l.state === "revoked") return "Revoked";
  const ms = Date.parse(l.expiresAt) - now;
  if (l.state === "expired" || !(ms > 0)) return "Expired";
  const min = Math.ceil(ms / 60000);
  return min >= 60 ? `${Math.floor(min / 60)} h ${min % 60} min left` : `${min} min left`;
}
