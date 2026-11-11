/**
 * Pure logic for the live page: what an organiser publishes (a snapshot), how a tool's view is merged into it, how limits are kept,
 * which teams and next match can be worked out, and how times are written. No browser or network code, so all of it is unit tested.
 */
import { secondsUntil, slotNow, slotTime, validate, type BracketData, type Payload, type ScheduleData, type TableData } from "./display";

export type LiveKind = "standings" | "league" | "schedule" | "bracket" | "countdown";
export interface LiveView { kind: LiveKind; payload: Payload }
export interface Announcement { text: string; at: string }
export interface Sponsor { name: string; logo?: string }
export interface LiveSnapshot { views: LiveView[]; announcements: Announcement[]; sponsors: Sponsor[]; ticker: string[] }
export interface LiveState { slug: string | null; published: boolean; snapshot: LiveSnapshot | null; updatedAt: string | null }
export interface PublicLive { event: { name: string; date: string; venue: string }; snapshot: LiveSnapshot; updatedAt: string | null }

export const LIMITS = { views: 5, announcements: 10, announcementText: 140, sponsors: 4, sponsorName: 40, logoChars: 60000, ticker: 5, tickerLine: 80, bytes: 250_000 } as const;

export const KIND_ORDER: LiveKind[] = ["standings", "league", "schedule", "bracket", "countdown"];
export const KIND_LABEL: Record<LiveKind, string> = { standings: "Standings", league: "Table", schedule: "Schedule", bracket: "Bracket", countdown: "Countdown" };

export const emptySnapshot = (): LiveSnapshot => ({ views: [], announcements: [], sponsors: [], ticker: [] });

/** Which live view a tool's payload becomes. A table with a Kills column is a battle royale standing; any other table is a league table. */
export function kindOf(p: Payload): LiveKind {
  if (p.v === "table") return p.d.head.some((h) => /^kills?$/i.test(h.trim())) ? "standings" : "league";
  return p.v;
}

const kindFits = (k: LiveKind, p: Payload) => (k === "standings" || k === "league" ? p.v === "table" : p.v === k);

const LOGO = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;
/** True for an image data URL the server accepts: png, jpeg or webp, under 60000 characters. */
export const isLogo = (s: unknown): s is string => typeof s === "string" && s.length <= LIMITS.logoChars && LOGO.test(s);

/** Cuts everything to the limits the server enforces, drops what is invalid, and keeps one view per kind. Never throws. */
export function trimSnapshot(x: unknown): LiveSnapshot {
  const s = (x && typeof x === "object" ? x : {}) as Partial<Record<keyof LiveSnapshot, unknown>>;
  const views: LiveView[] = [];
  if (Array.isArray(s.views)) for (const v of s.views as { kind?: unknown; payload?: unknown }[]) {
    const kind = v?.kind as LiveKind;
    if (!KIND_ORDER.includes(kind) || views.some((o) => o.kind === kind)) continue;
    const payload = validate(v.payload);
    if (payload && kindFits(kind, payload) && views.length < LIMITS.views) views.push({ kind, payload });
  }
  const announcements: Announcement[] = [];
  if (Array.isArray(s.announcements)) for (const a of s.announcements as { text?: unknown; at?: unknown }[]) {
    const text = typeof a?.text === "string" ? a.text.trim().slice(0, LIMITS.announcementText) : "";
    const at = typeof a?.at === "string" && !Number.isNaN(Date.parse(a.at)) ? a.at : "";
    if (text && at) announcements.push({ text, at });
  }
  announcements.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  const sponsors: Sponsor[] = [];
  if (Array.isArray(s.sponsors)) for (const p of s.sponsors as { name?: unknown; logo?: unknown }[]) {
    const name = typeof p?.name === "string" ? p.name.trim().slice(0, LIMITS.sponsorName) : "";
    if (name && sponsors.length < LIMITS.sponsors) sponsors.push(isLogo(p.logo) ? { name, logo: p.logo } : { name });
  }
  const ticker = Array.isArray(s.ticker) ? (s.ticker as unknown[]).filter((t): t is string => typeof t === "string").map((t) => t.trim().slice(0, LIMITS.tickerLine)).filter(Boolean).slice(0, LIMITS.ticker) : [];
  return { views, announcements: announcements.slice(0, LIMITS.announcements), sponsors, ticker };
}

export const snapshotBytes = (s: LiveSnapshot) => JSON.stringify(s).length;
export const tooBig = (s: LiveSnapshot) => snapshotBytes(s) > LIMITS.bytes;

/** Puts a tool's view into a snapshot: replaces the view of the same kind, keeps everything else (announcements, sponsors, ticker, other views). */
export function mergeView(current: LiveSnapshot | null, payload: Payload): LiveSnapshot {
  const base = trimSnapshot(current ?? emptySnapshot());
  const kind = kindOf(payload);
  const views = base.views.some((v) => v.kind === kind) ? base.views.map((v) => (v.kind === kind ? { kind, payload } : v)) : [...base.views, { kind, payload }];
  return trimSnapshot({ ...base, views });
}

/** Replaces only the extras (announcements, sponsors, ticker), keeping the views exactly as they are. */
export function withExtras(current: LiveSnapshot | null, extras: Partial<Pick<LiveSnapshot, "announcements" | "sponsors" | "ticker">>): LiveSnapshot {
  const base = current ?? emptySnapshot();
  return trimSnapshot({ views: base.views, announcements: extras.announcements ?? base.announcements, sponsors: extras.sponsors ?? base.sponsors, ticker: extras.ticker ?? base.ticker });
}

/** Views in tab order. */
export const orderedViews = (s: LiveSnapshot): LiveView[] => [...s.views].sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind));

// ---- teams ----
const PLACEHOLDER = /^(tbd|bye|)$/i;
const nameColumn = (d: TableData) => { const i = d.head.findIndex((h) => /team|name|player/i.test(h)); return i >= 0 ? i : 1; };

/** Every team name found in the table rows (team column), bracket matches, in first-seen order, without duplicates and without TBD or Bye. */
export function teamsOf(s: LiveSnapshot | null): string[] {
  const seen = new Map<string, string>();
  const add = (n: string | undefined) => { const t = (n ?? "").trim(); if (!PLACEHOLDER.test(t) && !seen.has(t.toLowerCase())) seen.set(t.toLowerCase(), t); };
  for (const v of s?.views ?? []) {
    if (v.payload.v === "table") { const c = nameColumn(v.payload.d); v.payload.d.rows.forEach((r) => add(r[c])); }
    else if (v.payload.v === "bracket") v.payload.d.sections.forEach((sec) => sec.rounds.forEach((r) => r.matches.forEach((m) => { add(m.a); add(m.b); })));
  }
  return [...seen.values()];
}

// ---- next match ----
export interface NextMatch { source: "bracket" | "schedule"; title: string; detail: string }
const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
const ymd = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;

/** The first bracket match this team still has to play. Says so when the opponent is not known yet, and when the team is out. Null when the team is not in the bracket. */
export function nextInBracket(d: BracketData, team: string): NextMatch | null {
  let played = false, lost = false;
  for (const sec of d.sections) for (const r of sec.rounds) for (const m of r.matches) {
    const side = same(m.a, team) ? 0 : same(m.b, team) ? 1 : -1;
    if (side < 0) continue;
    const other = side === 0 ? m.b : m.a;
    const where = [sec.name, r.name].filter(Boolean).join(", ");
    if (m.w === undefined) {
      if (PLACEHOLDER.test(m.a.trim()) || PLACEHOLDER.test(m.b.trim())) {
        if (/^bye$/i.test(other.trim())) { played = true; continue; } // a bye is not a match to play
        return { source: "bracket", title: "Your next match", detail: `${where}: waiting to find out who you play.` };
      }
      return { source: "bracket", title: "Your next match", detail: `${where}: ${team} vs ${other}.` };
    }
    played = true; lost = m.w !== side;
  }
  return played && lost ? { source: "bracket", title: "Bracket", detail: `${team} is out of this bracket.` } : null;
}

/** The first schedule slot whose label names this team and that has not finished yet. A schedule that never names the team gives nothing. */
export function nextInSchedule(d: ScheduleData, team: string, now = new Date()): NextMatch | null {
  const day = d.date ?? ymd(now), t = now.getTime(), needle = team.trim().toLowerCase();
  if (!needle) return null;
  for (const s of d.slots) {
    if (!s.label.toLowerCase().includes(needle)) continue;
    const end = slotTime(day, s.end), start = slotTime(day, s.start);
    if (Number.isNaN(start) || Number.isNaN(end) || end <= t) continue;
    return { source: "schedule", title: "Your next match", detail: `${start <= t ? "On now" : `Starts ${s.start}`}: ${s.label}.` };
  }
  return null;
}

/** Everything that can be said about this team's next match from the published data. An empty list means the data does not say. */
export function nextMatches(s: LiveSnapshot | null, team: string, now = new Date()): NextMatch[] {
  if (!team) return [];
  const out: NextMatch[] = [];
  for (const v of s?.views ?? []) {
    if (v.payload.v === "bracket") { const m = nextInBracket(v.payload.d, team); if (m) out.push(m); }
    if (v.payload.v === "schedule") { const m = nextInSchedule(v.payload.d, team, now); if (m) out.push(m); }
  }
  return out;
}

// ---- time ----
/** An announcement time in the viewer's own time zone: "14:05" today, "12 Dec, 14:05" on another day. */
export function formatLocalTime(iso: string, now = Date.now(), o: { locale?: string; timeZone?: string } = {}): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  const f = (opt: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(o.locale ?? "en-GB", { timeZone: o.timeZone, ...opt });
  const day = (x: number) => f({ year: "numeric", month: "numeric", day: "numeric" }).format(x);
  const time = f({ hour: "2-digit", minute: "2-digit", hour12: false }).format(t);
  return day(t) === day(now) ? time : `${f({ day: "numeric", month: "short" }).format(t)}, ${time}`;
}

/** "just now", "12 s ago", "3 min ago". */
export function agoText(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s} s ago`;
  const m = Math.floor(s / 60);
  return m < 60 ? `${m} min ago` : `${Math.floor(m / 60)} h ago`;
}

/** The public address of an event's live page. */
export const liveUrl = (origin: string, slug: string) => `${origin.replace(/\/$/, "")}/live/?e=${encodeURIComponent(slug)}`;

// ---- standings cards (phone layout) ----
export interface StandingCard { key: string; rank: number; name: string; total: string; totalLabel: string; parts: { label: string; value: string }[] }
const RANK_HEAD = /^(#|no\.?|rank|pos\.?|position)$/i;
const TOTAL_HEAD = /^(total|total pts|total points|pts|points|score)$/i;

/**
 * Turns any table payload into ranked cards, whatever its columns are called: the name column is the one headed team, name or player (else the second, else the first),
 * the rank column is one headed # or rank (or a first column of plain numbers), the headline number is the table's `strong` column, else a Total or Points column,
 * else the last column. Every other column with a value becomes a chip (label and value). Rows without a name are dropped.
 */
export function standingCards(d: TableData): StandingCard[] {
  const head = d.head;
  const found = head.findIndex((h) => /team|name|player/i.test(h));
  const nameCol = found >= 0 ? found : head.length > 1 ? 1 : 0;
  let rankCol = head.findIndex((h, i) => i !== nameCol && RANK_HEAD.test(h.trim()));
  if (rankCol < 0 && nameCol > 0 && d.rows.length > 0 && d.rows.every((r) => /^\d+$/.test((r[0] ?? "").trim()))) rankCol = 0;
  const free = (i: number) => i >= 0 && i < head.length && i !== nameCol && i !== rankCol;
  let totalCol = typeof d.strong === "number" && free(d.strong) ? d.strong : -1;
  if (totalCol < 0) for (let i = head.length - 1; i >= 0; i--) if (free(i) && TOTAL_HEAD.test(head[i]!.trim())) { totalCol = i; break; }
  if (totalCol < 0 && free(head.length - 1)) totalCol = head.length - 1;
  const cards: StandingCard[] = [];
  d.rows.forEach((r, idx) => {
    const name = (r[nameCol] ?? "").trim();
    if (!name) return;
    const n = rankCol >= 0 ? parseInt(r[rankCol] ?? "", 10) : NaN;
    const parts = head.flatMap((h, i) => (i === nameCol || i === rankCol || i === totalCol || !(r[i] ?? "").trim() ? [] : [{ label: h.trim() || `Col ${i + 1}`, value: (r[i] ?? "").trim() }]));
    cards.push({ key: String(idx), rank: Number.isFinite(n) && n > 0 ? n : idx + 1, name, total: totalCol >= 0 ? (r[totalCol] ?? "").trim() : "", totalLabel: totalCol >= 0 ? head[totalCol]!.trim() : "", parts });
  });
  return cards;
}

/** The card in first place (lowest rank, the first one on a tie), or null for an empty table. */
export function leaderOf(cards: StandingCard[]): StandingCard | null {
  let best: StandingCard | null = null;
  for (const c of cards) if (!best || c.rank < best.rank) best = c;
  return best;
}

/** Cards whose name contains the search text (ignoring case). An empty search keeps everything. */
export function filterCards(cards: StandingCard[], q: string): StandingCard[] {
  const needle = q.trim().toLowerCase();
  return needle ? cards.filter((c) => c.name.toLowerCase().includes(needle)) : cards;
}

// ---- schedule timeline ----
export type SlotState = "past" | "now" | "next" | "later";
export interface ScheduleRow { index: number; n: number; start: string; end: string; label: string; breakAfter: number; state: SlotState; startsIn: string }

/** "Starts in 12 min", "Starts in 1 h 30 min", "Starts in under a minute". Empty when the time is not known. */
export function startsInText(sec: number | null): string {
  if (sec === null) return "";
  if (sec < 60) return "Starts in under a minute";
  const m = Math.ceil(sec / 60);
  if (m < 60) return `Starts in ${m} min`;
  const h = Math.floor(m / 60), r = m % 60;
  return `Starts in ${h} h${r ? ` ${r} min` : ""}`;
}

/** Every slot with its state (past, now, next, later) and, for the next one, how long until it starts. */
export function scheduleRows(d: ScheduleData, now = new Date()): ScheduleRow[] {
  const { current, next } = slotNow(d, now);
  const t = now.getTime(), day = d.date ?? ymd(now);
  const ends = d.slots.map((s) => slotTime(day, s.end)).filter((x) => !Number.isNaN(x));
  const allOver = current < 0 && next < 0 && ends.length > 0 && Math.max(...ends) <= t;
  return d.slots.map((s, i) => {
    const state: SlotState = i === current ? "now" : i === next && current !== i ? "next" : (current >= 0 ? i < current : next >= 0 ? i < next : allOver) ? "past" : "later";
    return { index: i, n: s.n, start: s.start, end: s.end, label: s.label, breakAfter: s.breakAfter ?? 0, state, startsIn: state === "next" ? startsInText(secondsUntil(d, s.start, now)) : "" };
  });
}

// ---- bracket rounds ----
export interface BracketRound { key: string; label: string; section: string; matches: { a: string; b: string; w?: 0 | 1 }[]; decided: number; total: number }

/** Every round of every section, in order, for the round chips. With more than one section (double elimination) the label carries the section name. */
export function bracketRounds(d: BracketData): BracketRound[] {
  const out: BracketRound[] = [];
  const multi = d.sections.length > 1;
  d.sections.forEach((sec, si) => sec.rounds.forEach((r, ri) => {
    const base = r.name.trim() || `Round ${ri + 1}`;
    const decided = r.matches.filter((m) => m.w !== undefined || /^bye$/i.test(m.a.trim()) || /^bye$/i.test(m.b.trim())).length;
    out.push({ key: `${si}-${ri}`, label: multi && sec.name.trim() ? `${sec.name.trim()}: ${base}` : base, section: sec.name.trim(), matches: r.matches, decided, total: r.matches.length });
  }));
  return out;
}

/** The round to show first: the earliest one that still has a match to play, else the last (final) round. */
export function currentRoundIndex(rounds: BracketRound[]): number {
  const i = rounds.findIndex((r) => r.decided < r.total);
  return i >= 0 ? i : Math.max(0, rounds.length - 1);
}
