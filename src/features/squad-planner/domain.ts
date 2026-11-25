/**
 * Squad availability planner: plain types and pure rules (no React, no network). Times are UTC epoch seconds on the wire; the plan has its own
 * time zone (India by default) and every viewer sees the times in their own device zone.
 */
export interface PlanPerson { id: string; name: string; picks: number[] }
export interface Plan { game: string; title: string; tz: string; slotMinutes: 30 | 60; slots: number[]; people: PlanPerson[]; counts: number[]; expiresAt: string; /** After a vote: the id of this browser's own row. */ mine?: string }
export interface CreatedPlan { token: string; captainKey: string; expiresAt: string }

export const MAX_SLOTS = 336, MAX_DAYS = 14, NAME_MAX = 24, TITLE_MAX = 60, MAX_PEOPLE = 20;
export const DEFAULT_TZ = "Asia/Kolkata";
export const ZONES: { value: string; label: string }[] = [
  { value: "Asia/Kolkata", label: "India (IST)" }, { value: "Asia/Dhaka", label: "Bangladesh" }, { value: "Asia/Kathmandu", label: "Nepal" }, { value: "Asia/Karachi", label: "Pakistan" },
  { value: "Asia/Dubai", label: "Gulf (Dubai)" }, { value: "Asia/Singapore", label: "Singapore" }, { value: "Europe/London", label: "UK" }, { value: "America/Sao_Paulo", label: "Brazil (Sao Paulo)" }, { value: "UTC", label: "UTC" },
];

const pad = (n: number) => String(n).padStart(2, "0");

/** The zone's offset from UTC in minutes at an instant (DST aware, through Intl). */
export function zoneOffsetMin(ms: number, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(new Date(ms));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? "0");
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour") % 24, get("minute"), get("second"));
  return Math.round((asUtc - Math.floor(ms / 1000) * 1000) / 60_000);
}

/** A wall-clock time in `tz` ("2026-12-05", hour, minute) to UTC epoch seconds. Two passes handle a DST change. */
export function zonedToEpoch(day: string, hour: number, minute: number, tz: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!m) return null;
  const guess = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), hour, minute);
  let ms = guess - zoneOffsetMin(guess, tz) * 60_000;
  ms = guess - zoneOffsetMin(ms, tz) * 60_000;
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : null;
}

/** "YYYY-MM-DD" plus n days. */
export function addDays(day: string, n: number): string {
  const [y, mo, d] = day.split("-").map(Number) as [number, number, number];
  const t = new Date(Date.UTC(y, mo - 1, d + n));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}
/** Today in a zone, "YYYY-MM-DD". */
export function todayIn(tz: string, now = Date.now()): string {
  const off = zoneOffsetMin(now, tz);
  const t = new Date(now + off * 60_000);
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

export interface GridSpec { firstDay: string; days: number; fromHour: number; toHour: number; slotMinutes: 30 | 60; tz: string }
export type GridCheck = { ok: true; slots: number[] } | { ok: false; problem: string };

/**
 * The slot starts for "these days, from this hour to that hour, in this zone". toHour may be 24 (midnight) or less than fromHour (the window
 * crosses midnight, as late-night scrims do: 21 to 2 means 21:00 to 02:00 the next morning). Slots in the past are left out.
 */
export function buildSlots(g: GridSpec, nowSec = Math.floor(Date.now() / 1000)): GridCheck {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(g.firstDay)) return { ok: false, problem: "Pick the first day." };
  if (!Number.isInteger(g.days) || g.days < 1 || g.days > MAX_DAYS) return { ok: false, problem: `Pick 1 to ${MAX_DAYS} days.` };
  if (!Number.isInteger(g.fromHour) || !Number.isInteger(g.toHour) || g.fromHour < 0 || g.fromHour > 23 || g.toHour < 0 || g.toHour > 24 || g.fromHour === g.toHour % 24) return { ok: false, problem: "Pick a start and an end hour that are different." };
  const span = ((g.toHour - g.fromHour + 24) % 24 || 24) * 60;
  const per = span / g.slotMinutes;
  const out: number[] = [];
  for (let d = 0; d < g.days; d++) {
    const first = zonedToEpoch(addDays(g.firstDay, d), g.fromHour, 0, g.tz);
    if (first === null) return { ok: false, problem: "That date is not valid." };
    for (let i = 0; i < per; i++) {
      const t = first + i * g.slotMinutes * 60;
      if (t > nowSec - 60 && (out.length === 0 || t > out[out.length - 1]!)) out.push(t);
    }
  }
  if (out.length === 0) return { ok: false, problem: "Every slot you picked is already in the past." };
  if (out.length > MAX_SLOTS) return { ok: false, problem: `That is ${out.length} slots; a plan can have at most ${MAX_SLOTS}. Pick fewer days or hours.` };
  return { ok: true, slots: out };
}

export interface Window { start: number; slots: number; free: number; names: string[] }
/**
 * The best times to play: windows of `length` consecutive slots (no gap between them), ranked by how many people are free for the WHOLE window,
 * then by earliest. Only windows where at least one person is free. At most `limit` windows, never overlapping each other.
 */
export function bestWindows(plan: Pick<Plan, "slots" | "people" | "slotMinutes">, length: number, limit = 5): Window[] {
  const step = plan.slotMinutes * 60;
  const n = plan.slots.length;
  const sets = plan.people.map((p) => new Set(p.picks));
  const cands: (Window & { i: number })[] = [];
  for (let i = 0; i + length <= n; i++) {
    let contiguous = true;
    for (let k = 1; k < length; k++) if (plan.slots[i + k]! - plan.slots[i + k - 1]! !== step) { contiguous = false; break; }
    if (!contiguous) continue;
    const names = plan.people.filter((_, pi) => { for (let k = 0; k < length; k++) if (!sets[pi]!.has(i + k)) return false; return true; }).map((p) => p.name);
    if (names.length) cands.push({ i, start: plan.slots[i]!, slots: length, free: names.length, names });
  }
  cands.sort((a, b) => b.free - a.free || a.start - b.start);
  const out: Window[] = [];
  const used = new Set<number>();
  for (const c of cands) {
    if (out.length >= limit) break;
    let clash = false;
    for (let k = 0; k < length; k++) if (used.has(c.i + k)) clash = true;
    if (clash) continue;
    for (let k = 0; k < length; k++) used.add(c.i + k);
    out.push({ start: c.start, slots: c.slots, free: c.free, names: c.names });
  }
  return out;
}

/** "Sat 6 Dec" in the viewer's zone. */
export const dayLabel = (sec: number, tz?: string): string => new Date(sec * 1000).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", ...(tz ? { timeZone: tz } : {}) });
/** "9:00 pm" in the viewer's zone. */
export const timeLabel = (sec: number, tz?: string): string => new Date(sec * 1000).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", ...(tz ? { timeZone: tz } : {}) });
/** A key for grouping slots by the viewer's local day. */
export const dayKey = (sec: number, tz?: string): string => new Date(sec * 1000).toLocaleDateString("en-CA", tz ? { timeZone: tz } : {});

/** Slots grouped by the viewer's local day, keeping each slot's index in the plan. */
export function groupByDay(slots: number[], tz?: string): { key: string; label: string; items: { index: number; start: number }[] }[] {
  const out: { key: string; label: string; items: { index: number; start: number }[] }[] = [];
  slots.forEach((start, index) => {
    const key = dayKey(start, tz);
    let g = out[out.length - 1];
    if (!g || g.key !== key) { g = { key, label: dayLabel(start, tz), items: [] }; out.push(g); }
    g.items.push({ index, start });
  });
  return out;
}

/** A display name: 1 to 24 characters, no < >, no links or digits runs that look like phone numbers (the server checks again). */
export function nameProblem(v: string): string {
  const t = v.trim();
  if (!t) return "Type the name your squad knows you by.";
  if (Array.from(t).length > NAME_MAX) return `At most ${NAME_MAX} characters.`;
  if (/[<>]/.test(t) || /https?:|www\.|\.(com|gg|in|io)\b/i.test(t) || t.replace(/\D/g, "").length >= 7 || /@[\w.]{3,}/.test(t)) return "Plain names only: no links, phone numbers or @handles.";
  return "";
}

/** The share link. The token sits after # so it never reaches a server log, an analytics hit or a Referer header. */
export const shareLink = (origin: string, token: string): string => `${origin}/squad/#t=${token}`;
/** Reads the token from a location hash ("#t=..."). */
export function tokenFromHash(hash: string): string | null {
  const m = /(?:^#|&)t=([A-Za-z0-9_-]{32})(?:&|$)/.exec(hash);
  return m ? m[1]! : null;
}

/** A random per-browser key (base64url, 43 characters) from the Web Crypto API. */
export function randomKey(): string {
  const b = crypto.getRandomValues(new Uint8Array(32));
  let s = "";
  for (const x of b) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** The scrim finder's "post a slot" form, pre-filled with this time (UTC ISO) and game. */
export const scrimLink = (startSec: number, game: string): string => `/scrims/new/?starts=${encodeURIComponent(new Date(startSec * 1000).toISOString())}&game=${encodeURIComponent(game)}`;
