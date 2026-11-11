/** Pure helpers for the public events listing: text hygiene, validation, filters and date maths. No network, no DOM. */

export type Mode = "in-person" | "online" | "hybrid";
export const MODES: { id: Mode; label: string }[] = [
  { id: "in-person", label: "In person" },
  { id: "online", label: "Online" },
  { id: "hybrid", label: "Both" },
];
export const modeLabel = (m: string) => MODES.find((x) => x.id === m)?.label ?? m;

export const LIMITS = { title: 80, game: 40, city: 40, blurb: 300 } as const;
export const CONTACT_MESSAGE = "Please do not put contact details here: players register through the link";

export interface DirectoryDraft { title: string; game: string; city: string; mode: Mode; startsOn: string; blurb: string }
export interface DirectoryEntry { id: string; title: string; game: string; city: string; mode: Mode; startsOn: string; blurb: string; regLink: string; ended: boolean }
export interface Filters { game: string; city: string; mode: Mode | "" }

/** Removes control and invisible characters and collapses whitespace. */
export function cleanText(s: string): string {
  return s.replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2066-\u2069\ufeff]/g, " ").replace(/\s+/g, " ").trim();
}

const URL_RE = /(https?:|ftp:|www\.)|\b[a-z0-9-]+\.(com|in|net|org|io|gg|tv|co|me|app|link|ly|to|xyz|info|live|club)\b/i;
const MAIL_RE = /\S@\S|\(at\)/i;
const PHONE_RE = /(?:\+?\d[\s().-]{0,2}){10,}/;
/** True when the text carries a web address, an email address or a phone number. Plain dates such as 2026-12-01 are fine. */
export function hasContact(s: string): boolean {
  if (URL_RE.test(s) || MAIL_RE.test(s)) return true;
  return PHONE_RE.test(s.replace(/\d{4}-\d{2}-\d{2}/g, ""));
}

export function isValidDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export type Problems = Partial<Record<keyof DirectoryDraft, string>>;

/** Step 1 fields: what the event is. */
export function validateBasics(d: DirectoryDraft): Problems {
  const p: Problems = {};
  const title = cleanText(d.title), game = cleanText(d.game), city = cleanText(d.city);
  if (title.length < 3) p.title = "Give the event a name of at least 3 letters.";
  else if (title.length > LIMITS.title) p.title = `Keep the name to ${LIMITS.title} characters.`;
  else if (hasContact(title)) p.title = CONTACT_MESSAGE;
  if (!game) p.game = "Say which game it is.";
  else if (game.length > LIMITS.game) p.game = `Keep the game to ${LIMITS.game} characters.`;
  else if (hasContact(game)) p.game = CONTACT_MESSAGE;
  if (d.mode !== "online" && !city) p.city = "Add the city, or choose Online.";
  else if (city.length > LIMITS.city) p.city = `Keep the city to ${LIMITS.city} characters.`;
  else if (hasContact(city)) p.city = CONTACT_MESSAGE;
  if (!isValidDate(d.startsOn)) p.startsOn = "Choose the day the event starts.";
  return p;
}

/** Step 2: the one-line description. It may be empty, but never carries contact details. */
export function validateBlurb(blurb: string): string {
  const b = cleanText(blurb);
  if (b.length > LIMITS.blurb) return `Keep it to ${LIMITS.blurb} characters (now ${b.length}).`;
  if (hasContact(b)) return CONTACT_MESSAGE;
  return "";
}

/** The draft exactly as it will be sent: trimmed, collapsed, and with no city for an online event. */
export function normaliseDraft(d: DirectoryDraft): DirectoryDraft {
  return { title: cleanText(d.title), game: cleanText(d.game), city: d.mode === "online" ? "" : cleanText(d.city), mode: d.mode, startsOn: d.startsOn, blurb: cleanText(d.blurb) };
}

// ---- date maths (all in plain calendar days, no time zones) ----
export const todayIso = (now: Date = new Date()) => {
  const y = now.getFullYear(), m = String(now.getMonth() + 1).padStart(2, "0"), d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
const dayNumber = (iso: string) => Math.round(Date.parse(`${iso}T00:00:00Z`) / 86400000);
export function daysUntil(startsOn: string, today: string): number {
  if (!isValidDate(startsOn) || !isValidDate(today)) return NaN;
  return dayNumber(startsOn) - dayNumber(today);
}
/** "Today", "Tomorrow", "In 5 days", "Ended 2 days ago". */
export function whenText(startsOn: string, today: string): string {
  const n = daysUntil(startsOn, today);
  if (Number.isNaN(n)) return "";
  if (n === 0) return "Today";
  if (n === 1) return "Tomorrow";
  if (n > 1) return `In ${n} days`;
  if (n === -1) return "Ended yesterday";
  return `Ended ${-n} days ago`;
}
export function formatDay(iso: string): string {
  if (!isValidDate(iso)) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!)).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

// ---- filters ----
export const emptyFilters: Filters = { game: "", city: "", mode: "" };
export const hasFilters = (f: Filters) => !!(f.game || f.city || f.mode);

/** Query string for the public list; empty parts are left out. */
export function listQuery(f: Filters, page = 1): string {
  const q = new URLSearchParams();
  if (f.game) q.set("game", f.game);
  if (f.city) q.set("city", f.city);
  if (f.mode) q.set("mode", f.mode);
  if (page > 1) q.set("page", String(page));
  const s = q.toString();
  return s ? `?${s}` : "";
}

/** Same rule as the server, used to filter what is already on screen: game and city ignore case, mode matches exactly. */
export function applyFilters(list: DirectoryEntry[], f: Filters): DirectoryEntry[] {
  const g = f.game.toLowerCase(), c = f.city.toLowerCase();
  return list.filter((e) => (!g || e.game.toLowerCase() === g) && (!c || e.city.toLowerCase() === c) && (!f.mode || e.mode === f.mode));
}

/** Only an https link to a registration page is ever followed from a card (the server builds it; this is a second check). */
export function safeRegLink(link: string): string {
  try {
    const u = new URL(link);
    return u.protocol === "https:" && !u.username && !u.password && u.pathname.startsWith("/register") ? u.toString() : "";
  } catch { return ""; }
}

/** Plain-words explanation for the empty state. */
export function emptyReason(f: Filters): string {
  if (hasFilters(f)) return "No listed events match those choices. Try clearing a filter.";
  return "No organiser has listed an upcoming event yet.";
}

/** Merges the next page after the ones already shown, without repeats. */
export function mergePages(shown: DirectoryEntry[], next: DirectoryEntry[]): DirectoryEntry[] {
  const seen = new Set(shown.map((e) => e.id));
  return [...shown, ...next.filter((e) => !seen.has(e.id))];
}
