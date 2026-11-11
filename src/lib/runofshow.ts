/** Run of show: pure helpers (templates, time maths, shifting, ordering, now and next). No network, no DOM. */

export type RosStatus = "todo" | "doing" | "done";
export interface RosItem { id: string; atTime: string; dayOffset: number; title: string; ownerName: string; status: RosStatus; notes: string }
export interface RosLink { active: boolean; showNotes: boolean; createdAt: string }
/** What a volunteer sees. Notes are only present when the organiser chose to show them. */
export interface PublicRos {
  event: { name: string; date: string; venue: string };
  items: { id: string; atTime: string; dayOffset: number; title: string; ownerName: string; status: RosStatus; notes?: string }[];
  showNotes: boolean;
}

export const LIMITS = { items: 200, title: 100, owner: 60, notes: 300, maxDay: 30 } as const;
export const STATUS_LABEL: Record<RosStatus, string> = { todo: "To do", doing: "Doing now", done: "Done" };
export const STATUSES: RosStatus[] = ["todo", "doing", "done"];

// ---------- time ----------
const HM = /^([01]?\d|2[0-3]):([0-5]\d)$/;
/** "9:30" or "09:30" to minutes after midnight, or null. */
export function parseHM(t: string): number | null {
  const m = HM.exec(t.trim());
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}
export const isValidTime = (t: string): boolean => parseHM(t) !== null;
/** Minutes after midnight (0 to 1439) to "HH:MM". */
export const formatHM = (min: number): string => { const m = ((Math.round(min) % 1440) + 1440) % 1440; return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`; };
/** "13:05" to "1:05 pm". Anything that is not a time is returned unchanged. */
export function displayTime(t: string): string {
  const m = parseHM(t);
  if (m === null) return t;
  const h = Math.floor(m / 60), mm = m % 60;
  return `${h % 12 === 0 ? 12 : h % 12}:${String(mm).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
}
/** Minutes from the start of event day (day 0, 00:00). A bad time counts as 0. */
export const absMinutes = (i: Pick<RosItem, "atTime" | "dayOffset">): number => (parseHM(i.atTime) ?? 0) + Math.max(0, i.dayOffset || 0) * 1440;
export const dayText = (offset: number): string => (offset <= 0 ? "" : offset === 1 ? "next day" : `day ${offset + 1}`);
export const whenText = (i: Pick<RosItem, "atTime" | "dayOffset">): string => [displayTime(i.atTime), dayText(i.dayOffset)].filter(Boolean).join(", ");

// ---------- templates (suggestions only: the organiser edits everything) ----------
export interface RosTemplate { id: string; title: string; blurb: string; items: { atTime: string; title: string; notes?: string; dayOffset?: number }[] }
export const TEMPLATES: RosTemplate[] = [
  {
    id: "college", title: "College fest esports day", blurb: "A day on campus: doors, tech check, briefing, matches, a break and the prize giving.",
    items: [
      { atTime: "08:00", title: "Venue open for the crew" }, { atTime: "09:00", title: "Setup and tech check of every PC or phone station" },
      { atTime: "10:00", title: "Doors open and check-in starts" }, { atTime: "10:45", title: "Captains' briefing" },
      { atTime: "11:00", title: "Opening and welcome" }, { atTime: "11:15", title: "Matches: first round" },
      { atTime: "13:00", title: "Lunch break" }, { atTime: "14:00", title: "Matches: semi finals" },
      { atTime: "16:00", title: "Final" }, { atTime: "17:00", title: "Prize giving" }, { atTime: "17:30", title: "Pack up and venue handover" },
    ],
  },
  {
    id: "weekend", title: "Weekend custom-room tournament", blurb: "Online lobbies over a weekend: room ids, rounds and results.",
    items: [
      { atTime: "17:00", title: "Share room ids and passwords with captains" }, { atTime: "17:30", title: "Captains' briefing (rules and points)" },
      { atTime: "18:00", title: "Round 1 starts" }, { atTime: "19:30", title: "Break and standings posted" },
      { atTime: "20:00", title: "Round 2 starts" }, { atTime: "21:30", title: "Day 1 results announced" },
      { atTime: "17:00", dayOffset: 1, title: "Day 2: room ids shared with captains" },
      { atTime: "18:00", dayOffset: 1, title: "Final rounds" }, { atTime: "20:30", dayOffset: 1, title: "Prize giving and thanks" },
    ],
  },
  {
    id: "cafe", title: "Gaming cafe league night", blurb: "An evening at a cafe: stations ready, a league night and a short wrap-up.",
    items: [
      { atTime: "16:00", title: "Stations checked and updated" }, { atTime: "17:00", title: "Doors open" },
      { atTime: "17:30", title: "Tech check and seating" }, { atTime: "17:45", title: "Captains' briefing" },
      { atTime: "18:00", title: "Matches: round 1" }, { atTime: "19:30", title: "Break" },
      { atTime: "19:45", title: "Matches: round 2" }, { atTime: "21:00", title: "Prize giving" }, { atTime: "21:30", title: "Close up" },
    ],
  },
];

let seq = 0;
/** A local id for an item that the server has not seen yet. The server replaces it on save. */
export const localId = (): string => `n${Date.now().toString(36)}${(seq++).toString(36)}`;
export const newItem = (over: Partial<RosItem> = {}): RosItem => ({ id: localId(), atTime: "09:00", dayOffset: 0, title: "", ownerName: "", status: "todo", notes: "", ...over });

/** The items of a template as editable rows. */
export function fromTemplate(id: string): RosItem[] {
  const t = TEMPLATES.find((x) => x.id === id);
  if (!t) return [];
  return t.items.map((i) => newItem({ atTime: i.atTime, title: i.title, notes: i.notes ?? "", dayOffset: i.dayOffset ?? 0 }));
}

// ---------- editing ----------
export function clampItem(i: RosItem): RosItem {
  const day = Number.isFinite(i.dayOffset) ? Math.min(LIMITS.maxDay, Math.max(0, Math.floor(i.dayOffset))) : 0;
  return { ...i, dayOffset: day, title: i.title.slice(0, LIMITS.title), ownerName: i.ownerName.slice(0, LIMITS.owner), notes: i.notes.slice(0, LIMITS.notes), status: STATUSES.includes(i.status) ? i.status : "todo" };
}
/** Moves the item at `from` one place up (-1) or down (+1). Out of range returns the same list. */
export function moveItem<T>(list: T[], from: number, dir: -1 | 1): T[] {
  const to = from + dir;
  if (from < 0 || from >= list.length || to < 0 || to >= list.length) return list;
  const out = list.slice();
  [out[from], out[to]] = [out[to]!, out[from]!];
  return out;
}
/** Chronological order (day, then time). Items at the same time keep their current order. */
export function sortByTime<T extends Pick<RosItem, "atTime" | "dayOffset">>(list: T[]): T[] {
  return list.map((it, k) => ({ it, k })).sort((a, b) => absMinutes(a.it) - absMinutes(b.it) || a.k - b.k).map((x) => x.it);
}
/** Moves every item by N minutes (negative earlier). Rolls over midnight into the next day. Stops at the start of event day: returns clamped = true if any item had to stop there. */
export function shiftItems(list: RosItem[], minutes: number): { items: RosItem[]; clamped: boolean } {
  const n = Math.trunc(minutes);
  let clamped = false;
  const max = LIMITS.maxDay * 1440 + 1439;
  const items = list.map((i) => {
    let abs = absMinutes(i) + n;
    if (abs < 0) { abs = 0; clamped = true; }
    if (abs > max) { abs = max; clamped = true; }
    return { ...i, atTime: formatHM(abs), dayOffset: Math.floor(abs / 1440) };
  });
  return { items, clamped };
}
export const progress = (list: { status: RosStatus }[]) => ({ done: list.filter((i) => i.status === "done").length, total: list.length });
/** A list is ready to save when every item has a title and a valid time. Returns the first problem in words, or null. */
export function firstProblem(list: RosItem[]): string | null {
  if (list.length > LIMITS.items) return `A run of show can have at most ${LIMITS.items} items.`;
  for (let k = 0; k < list.length; k++) {
    const i = list[k]!;
    if (!i.title.trim()) return `Item ${k + 1} needs a title.`;
    if (!isValidTime(i.atTime)) return `Item ${k + 1} needs a time like 09:30.`;
  }
  return null;
}
/** The body sent to the server: trimmed, times in HH:MM. */
export function toPayload(list: RosItem[]) {
  return list.map((i) => { const c = clampItem(i); return { id: c.id, atTime: formatHM(parseHM(c.atTime) ?? 0), dayOffset: c.dayOffset, title: c.title.trim(), ownerName: c.ownerName.trim(), status: c.status, notes: c.notes.trim() }; });
}

// ---------- people ----------
export const owners = (list: { ownerName: string }[]): string[] => {
  const seen = new Map<string, string>();
  for (const i of list) { const n = i.ownerName.trim(); if (n && !seen.has(n.toLowerCase())) seen.set(n.toLowerCase(), n); }
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
};
/** Items whose owner field mentions the name ("Asha" matches "Asha / Ravi"). An empty name keeps everything. */
export function filterByOwner<T extends { ownerName: string }>(list: T[], name: string): T[] {
  const q = name.trim().toLowerCase();
  return q ? list.filter((i) => i.ownerName.toLowerCase().includes(q)) : list;
}

// ---------- now and next ----------
const DAY_RE = /^(\d{4})-(\d{2})-(\d{2})/;
/** Whole days from the event's date to the date of `at` (local calendar days). 0 when the event date is unknown or not a date. */
export function daysSince(eventDate: string, at: Date): number {
  const m = DAY_RE.exec(eventDate || "");
  if (!m) return 0;
  const start = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const today = Date.UTC(at.getFullYear(), at.getMonth(), at.getDate());
  return Math.round((today - start) / 86_400_000);
}
/** Minutes from event-day midnight to `at`. Without a usable event date, today is treated as event day. */
export const nowAbs = (eventDate: string, at: Date): number => daysSince(eventDate, at) * 1440 + at.getHours() * 60 + at.getMinutes();

export interface NowNext<T> { now: T | null; next: T | null; minutesToNext: number | null }
/**
 * `now` is the latest item that has started and is not done (an item marked "doing" wins), `next` is the first item that has not started yet.
 * Items marked done are never "now". Order of the input does not matter.
 */
export function nowNext<T extends Pick<RosItem, "atTime" | "dayOffset" | "status">>(list: T[], at: Date, eventDate = ""): NowNext<T> {
  const t = nowAbs(eventDate, at);
  const sorted = sortByTime(list);
  const started = sorted.filter((i) => absMinutes(i) <= t);
  const doing = started.filter((i) => i.status === "doing");
  const now = doing.length ? doing[doing.length - 1]! : ([...started].reverse().find((i) => i.status !== "done") ?? null);
  const next = sorted.find((i) => absMinutes(i) > t) ?? null;
  return { now, next, minutesToNext: next ? absMinutes(next) - t : null };
}
export function inText(min: number): string {
  if (min < 1) return "less than a minute";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

// ---------- the volunteer link ----------
export const TOKEN_RE = /^[A-Za-z0-9_-]{20,64}$/;
export const runUrl = (origin: string, token: string): string => `${origin.replace(/\/+$/, "")}/run/?t=${encodeURIComponent(token)}`;
export const readToken = (search: string): string => { const t = new URLSearchParams(search).get("t") ?? ""; return TOKEN_RE.test(t) ? t : ""; };
export const ownerKey = (token: string): string => `eh-run-owner-${token.slice(0, 8)}`;
