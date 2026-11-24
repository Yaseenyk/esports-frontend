/**
 * Scrim times. The API stores and returns UTC; the site shows India time (IST, UTC+05:30, no daylight saving) by default, with the viewer's device
 * time as an option. Pure: no React, no network. Dates typed in forms are "YYYY-MM-DD" and "HH:MM".
 */
export type Zone = "ist" | "device";
export const IST_OFFSET_MIN = 330;
const pad = (n: number) => String(n).padStart(2, "0");

const parseDay = (day: string): [number, number, number] | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!m) return null;
  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return [y, mo, d];
};
const parseTime = (t: string): [number, number] | null => {
  const m = /^(\d{2}):(\d{2})$/.exec(t);
  if (!m) return null;
  const h = Number(m[1]), mi = Number(m[2]);
  return h > 23 || mi > 59 ? null : [h, mi];
};

/** An India-time date and time to a UTC ISO string, or null when either part is not valid. */
export function istToUtcIso(day: string, time: string): string | null {
  const d = parseDay(day), t = parseTime(time);
  if (!d || !t) return null;
  return new Date(Date.UTC(d[0], d[1] - 1, d[2], t[0], t[1]) - IST_OFFSET_MIN * 60_000).toISOString();
}
/** A date and time on the viewer's device clock to a UTC ISO string. */
export function deviceToUtcIso(day: string, time: string): string | null {
  const d = parseDay(day), t = parseTime(time);
  if (!d || !t) return null;
  const ms = new Date(d[0], d[1] - 1, d[2], t[0], t[1]).getTime();
  return Number.isFinite(ms) ? new Date(ms).toISOString() : null;
}
export const toUtcIso = (zone: Zone, day: string, time: string): string | null => (zone === "ist" ? istToUtcIso(day, time) : deviceToUtcIso(day, time));

/** One whole India-time day as a UTC range [from, to): the board's date filter. */
export function istDayRange(day: string): { from: string; to: string } | null {
  const from = istToUtcIso(day, "00:00");
  if (!from) return null;
  return { from, to: new Date(Date.parse(from) + 86_400_000).toISOString() };
}

/** Today's date in India, "YYYY-MM-DD". */
export function todayIst(now: number = Date.now()): string {
  const d = new Date(now + IST_OFFSET_MIN * 60_000);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** "Sat 6 Dec, 9:00 pm IST" (or the device's zone). Empty for a bad date. */
export function slotTimeText(iso: string | null, zone: Zone = "ist"): string {
  const ms = iso ? Date.parse(iso) : NaN;
  if (!Number.isFinite(ms)) return "";
  const text = new Date(ms).toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", ...(zone === "ist" ? { timeZone: "Asia/Kolkata" } : {}) });
  return zone === "ist" ? `${text} IST` : `${text} (your time)`;
}

/** Minutes until a slot starts (negative once it has started). */
export const minutesUntil = (iso: string, now: number = Date.now()): number => Math.round((Date.parse(iso) - now) / 60_000);
