/** A timed match schedule: matches in parallel lobbies, a gap between slots, and a longer break every few slots. Pure functions. */
export interface ScheduleInput {
  /** Start time as "HH:MM", 24 hour. */
  start: string;
  matches: number;
  /** Minutes one match takes. */
  duration: number;
  /** Minutes between the end of one slot and the start of the next (joining, results, resetting). */
  gap: number;
  /** How many matches can run at the same time (lobbies, rooms or stations). */
  lobbies: number;
  /** A longer break after this many slots. 0 means none. */
  breakEvery: number;
  /** Minutes the longer break lasts. */
  breakLength: number;
}
export interface Slot { slot: number; start: string; end: string; matches: number[]; breakAfter: number }

export function parseTime(t: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim());
  if (!m) return null;
  const h = Number(m[1]), min = Number(m[2]);
  return h < 24 && min < 60 ? h * 60 + min : null;
}
export const formatTime = (minutes: number): string => {
  const day = Math.floor(minutes / 1440), m = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}${day > 0 ? ` (+${day}d)` : ""}`;
};

/** Returns the slots, or null if an input is invalid. */
export function buildSchedule(i: ScheduleInput): Slot[] | null {
  const start = parseTime(i.start);
  const ints = [i.matches, i.duration, i.lobbies].every((n) => Number.isInteger(n) && n >= 1) && [i.gap, i.breakEvery, i.breakLength].every((n) => Number.isInteger(n) && n >= 0);
  if (start === null || !ints || i.matches > 500 || i.lobbies > 100) return null;
  const slots: Slot[] = [];
  let t = start, next = 1;
  for (let s = 1; next <= i.matches; s++) {
    const here = Array.from({ length: Math.min(i.lobbies, i.matches - next + 1) }, (_, k) => next + k);
    next += here.length;
    const end = t + i.duration;
    const longBreak = i.breakEvery > 0 && s % i.breakEvery === 0 && next <= i.matches ? i.breakLength : 0;
    slots.push({ slot: s, start: formatTime(t), end: formatTime(end), matches: here, breakAfter: longBreak });
    t = end + i.gap + longBreak;
  }
  return slots;
}

/** When the last match ends, and the total time from the first start. */
export function summary(i: ScheduleInput, slots: Slot[]) {
  const first = parseTime(i.start)!;
  const slotsCount = slots.length;
  const lastEnd = first + slotsCount * i.duration + (slotsCount - 1) * i.gap + slots.reduce((n, s) => n + s.breakAfter, 0);
  return { slots: slotsCount, finish: formatTime(lastEnd), totalMinutes: lastEnd - first };
}
