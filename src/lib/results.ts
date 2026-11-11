/** Pure helpers for captain result submission. No browser, no network: everything here is unit tested (tests/results.test.mjs). */

export const MAX_SCORE = 999;
export const MAX_NOTE = 200;
/** The server accepts a proof of at most this many characters of data URL (about 150 KB of picture). */
export const MAX_PROOF_CHARS = 200_000;

export type SubStatus = "pending" | "approved" | "rejected";
export type Side = "a" | "b";

/** The team link token from `?t=`: 20 to 64 URL-safe characters, anything else is no token. */
export function tokenFromSearch(search: string): string | null {
  const t = new URLSearchParams(search).get("t") ?? "";
  return /^[A-Za-z0-9_-]{20,64}$/.test(t) ? t : null;
}

/** The address a captain opens. The token stays in the query so the static page needs no route per team. */
export function reportUrl(origin: string, token: string): string {
  return `${origin.replace(/\/$/, "")}/report/?t=${encodeURIComponent(token)}`;
}

export type ScoreCheck = { ok: true; a: number; b: number } | { ok: false; message: string };

/** A score is a whole number from 0 to 999. Text from a box is accepted when it is plain digits. */
export function checkScores(a: unknown, b: unknown): ScoreCheck {
  const num = (v: unknown) => (typeof v === "number" ? v : typeof v === "string" && /^\d{1,4}$/.test(v.trim()) ? Number(v.trim()) : NaN);
  const x = num(a), y = num(b);
  if (!Number.isInteger(x) || !Number.isInteger(y)) return { ok: false, message: "Enter both scores as whole numbers." };
  if (x < 0 || y < 0) return { ok: false, message: "A score cannot be below 0." };
  if (x > MAX_SCORE || y > MAX_SCORE) return { ok: false, message: `A score cannot be above ${MAX_SCORE}.` };
  return { ok: true, a: x, b: y };
}

/** Keeps a stepper value inside 0 to MAX_SCORE. */
export const stepScore = (v: number, by: 1 | -1): number => Math.min(MAX_SCORE, Math.max(0, (Number.isFinite(v) ? Math.trunc(v) : 0) + by));

/** The captain enters "my score" and "their score"; the server stores the score of side a and of side b of the match. */
export function toSides(side: Side, mine: number, theirs: number): { scoreA: number; scoreB: number } {
  return side === "a" ? { scoreA: mine, scoreB: theirs } : { scoreA: theirs, scoreB: mine };
}
export function fromSides(side: Side, scoreA: number, scoreB: number): { mine: number; theirs: number } {
  return side === "a" ? { mine: scoreA, theirs: scoreB } : { mine: scoreB, theirs: scoreA };
}

/** Plain sentence for the result of a match from the captain's point of view. */
export function outcomeText(mine: number, theirs: number, opponent: string): string {
  const o = opponent || "the other team";
  return mine > theirs ? `You won ${mine} to ${theirs} against ${o}` : mine < theirs ? `You lost ${mine} to ${theirs} against ${o}` : `A draw, ${mine} all, against ${o}`;
}

export interface Claim { id: string; matchId: string; team: string; scoreA: number; scoreB: number; status: SubStatus }

/** Match ids where two pending claims from different teams do not agree on the score. */
export function disputedMatches(claims: Claim[]): Set<string> {
  const out = new Set<string>();
  const pending = claims.filter((c) => c.status === "pending");
  for (const c of pending) {
    if (pending.some((o) => o.matchId === c.matchId && o.team !== c.team && (o.scoreA !== c.scoreA || o.scoreB !== c.scoreB))) out.add(c.matchId);
  }
  return out;
}

/** Two claims for the same match that say the same thing. */
export const claimsAgree = (x: { scoreA: number; scoreB: number }, y: { scoreA: number; scoreB: number }) => x.scoreA === y.scoreA && x.scoreB === y.scoreB;

/** What the captain reads about one submission. */
export function statusText(s: SubStatus, reason?: string | null): string {
  if (s === "pending") return "Sent to the organiser. Waiting for approval.";
  if (s === "approved") return "Approved by the organiser. The result is recorded.";
  return reason ? `Not accepted: ${reason}` : "Not accepted by the organiser. You can send it again.";
}
export const statusLabel = (s: SubStatus) => (s === "pending" ? "Waiting" : s === "approved" ? "Approved" : "Not accepted");

/** The text a captain gets on WhatsApp. Plain words, the link on its own line so it stays tappable. */
export function whatsappText(team: string, eventName: string, url: string): string {
  const t = team.trim() || "your team";
  const e = eventName.trim() || "the tournament";
  return `Hi ${t} captain! After each match for ${e}, open this link, enter the score and add a screenshot as proof. The organiser checks it and approves it.\nThis link is only for ${t}, please do not share it outside your team.\n${url}`;
}

export type ProofCheck = { ok: true } | { ok: false; message: string };

/** Checks a picked file before shrinking: only pictures the browser can read, and nothing absurdly large. */
export function checkProofFile(type: string, size: number): ProofCheck {
  if (!/^image\/(png|jpeg|webp|gif|bmp)$/.test(type)) return { ok: false, message: "Choose a screenshot or photo (PNG or JPEG). Other file types cannot be sent." };
  if (size <= 0) return { ok: false, message: "That file is empty." };
  if (size > 12_000_000) return { ok: false, message: "That picture is very large. Choose one under 12 MB." };
  return { ok: true };
}

/** Checks a finished data URL against the server's rules, so a failure is explained before anything is sent. */
export function checkProofDataUrl(d: string): ProofCheck {
  if (!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(d)) return { ok: false, message: "The screenshot must be a PNG, JPEG or WebP picture." };
  if (d.length > MAX_PROOF_CHARS) return { ok: false, message: "The screenshot is still too big after shrinking (limit 200 KB). Try a smaller one." };
  return { ok: true };
}

/** The sizes tried, in order, when shrinking a screenshot: JPEG at falling width and quality until it fits. */
export const PROOF_ATTEMPTS: { width: number; quality: number }[] = [
  { width: 1280, quality: 0.8 }, { width: 1024, quality: 0.7 }, { width: 900, quality: 0.6 }, { width: 720, quality: 0.5 }, { width: 560, quality: 0.45 },
];

/** Scales to at most `maxW` wide, never bigger than the original. */
export function fitWidth(w: number, h: number, maxW: number): { w: number; h: number } {
  if (!(w > 0) || !(h > 0)) return { w: 1, h: 1 };
  const k = Math.min(1, maxW / w);
  return { w: Math.max(1, Math.round(w * k)), h: Math.max(1, Math.round(h * k)) };
}

/** Plain sentence for a failed call, with the reasons a captain can act on. */
export function reportError(status: number | undefined, serverMessage?: string): string {
  if (status === 404) return "This link or this match was not found. The organiser may have replaced your link. Ask them for a new one.";
  if (status === 409) return serverMessage || "That is not possible right now. The match may already have a result.";
  if (status === 413) return "The screenshot is too big. Choose a smaller one.";
  if (status === 415) return "The screenshot must be a PNG, JPEG or WebP picture.";
  if (status === 429) return "Too many tries. Wait a few minutes and try again.";
  if (status === 400) return serverMessage || "Check the scores and try again.";
  if (status && status >= 500) return "The server had a problem. Nothing was sent. Try again in a moment.";
  return "Could not reach the server. Nothing was sent. Check your connection and try again.";
}

/** Organiser queue order: disputes first, then other pending (oldest first), then decided ones (newest first). */
export function sortQueue<T extends { status: SubStatus; disputed?: boolean; createdAt: string }>(list: T[]): T[] {
  const rank = (s: T) => (s.status === "pending" ? (s.disputed ? 0 : 1) : 2);
  return [...list].sort((x, y) => rank(x) - rank(y) || (rank(x) === 2 ? y.createdAt.localeCompare(x.createdAt) : x.createdAt.localeCompare(y.createdAt)));
}
