/** Community features (college esports calendar, organiser trust score): the shapes screens work with, and pure helpers. No network, no React. */

export interface CalendarEntry {
  id: string;
  title: string;
  game: string;
  city: string;
  online: boolean;
  startsOn: string;
  endsOn: string;
  status: "listed" | "cancelled";
  registrationUrl: string | null;
  tournamentSlug: string | null;
  organiser: { name: string; slug: string | null; verified: boolean };
}
export interface CalendarPage { items: CalendarEntry[]; upcomingVerified: number; today: string }
export interface OwnEntry extends CalendarEntry { orgId: string; hidden: boolean; hiddenReason: string | null }
export interface MyCalendar { orgs: { id: string; name: string; slug: string | null }[]; items: OwnEntry[] }

export interface CommunityStatus { calendar: boolean; trust: boolean }

export interface TrustScore {
  count: number;
  minimum: number;
  average: number | null;
  aspects: { onTime: number; fair: number; communication: number } | null;
  distribution: Record<1 | 2 | 3 | 4 | 5, number> | null;
}
export interface PublicReview {
  id: string;
  displayName: string;
  verifiedAs: "checked_in" | "played";
  stars: number | null;
  review: string | null;
  createdAt: string | null;
  tournament: { slug: string; title: string | null } | null;
  reply: { text: string; at: string | null } | null;
  replyHidden: boolean;
}
export type WindowState = "no_dates" | "not_yet" | "open" | "closed";
export interface RatingWindow { state: WindowState; opensAt: string | null; closesAt: string | null; days: number }
export interface TrustSummary {
  tournament: { slug: string; title: string };
  organiser: { name: string | null; verified: boolean };
  score: TrustScore;
  reviews: PublicReview[];
  window: RatingWindow;
}
export interface OwnRating {
  id: string;
  displayName: string;
  verifiedAs: string;
  stars: number;
  onTime: number;
  fair: number;
  communication: number;
  review: string | null;
  hidden: boolean;
  hiddenReason: string | null;
  createdAt: string | null;
}
export interface RatingBody {
  stars: number; onTime: number; fair: number; communication: number; displayName: string; review?: string;
  proof: { kind: "pass" | "captain"; link?: string };
}
export interface MyTrust { adultConfirmed: boolean; isOrganiser: boolean; canReply: boolean; window: RatingWindow; myRating: OwnRating | null; suggestedName: string | null }

export const TRUST_REPORT_REASONS: { value: string; label: string }[] = [
  { value: "abuse", label: "Abusive or hateful" },
  { value: "personal_info", label: "Shares someone's personal details" },
  { value: "false_claim", label: "Not true, or the writer was not there" },
  { value: "spam", label: "Spam or advertising" },
  { value: "conflict_of_interest", label: "Written by someone involved with the organiser" },
  { value: "other", label: "Something else" },
];

// ---------------- calendar helpers ----------------

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-12" -> "December 2026". */
export const monthLabel = (ym: string): string => {
  const [y, m] = ym.split("-").map(Number);
  return `${MONTHS[(m ?? 1) - 1] ?? ""} ${y}`;
};
export const monthOf = (day: string): string => day.slice(0, 7);
export const addMonths = (ym: string, n: number): string => {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y ?? 2026, (m ?? 1) - 1 + n, 1));
  return d.toISOString().slice(0, 7);
};
/** "2026-12-05" -> "5 Dec 2026"; a range in one month -> "5 to 7 Dec 2026". */
export function dateRange(startsOn: string, endsOn: string): string {
  const f = (d: string) => `${Number(d.slice(8, 10))} ${SHORT[Number(d.slice(5, 7)) - 1] ?? ""} ${d.slice(0, 4)}`;
  if (startsOn === endsOn) return f(startsOn);
  if (startsOn.slice(0, 7) === endsOn.slice(0, 7)) return `${Number(startsOn.slice(8, 10))} to ${f(endsOn)}`;
  return `${f(startsOn)} to ${f(endsOn)}`;
}

export interface CalendarFilters { game: string; city: string }
export const NO_FILTERS: CalendarFilters = { game: "", city: "" };

/** Entries matching the game and city filters (city compared case-insensitively). */
export function filterEntries(items: readonly CalendarEntry[], f: CalendarFilters): CalendarEntry[] {
  const city = f.city.trim().toLowerCase();
  return items.filter((e) => (!f.game || e.game === f.game) && (!city || e.city.toLowerCase() === city));
}
/** Entries that touch the month (start before its end and end after its start). */
export function inMonth(items: readonly CalendarEntry[], ym: string): CalendarEntry[] {
  const first = `${ym}-01`, last = `${ym}-31`;
  return items.filter((e) => e.startsOn <= last && e.endsOn >= first);
}
/** The cities present in the data, sorted, de-duplicated case-insensitively (the filter only offers places that have events). */
export function citiesOf(items: readonly CalendarEntry[]): string[] {
  const seen = new Map<string, string>();
  for (const e of items) if (!seen.has(e.city.toLowerCase())) seen.set(e.city.toLowerCase(), e.city);
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}

export interface MonthCell { day: string | null; entries: CalendarEntry[] }
/** A Monday-first month grid: leading blanks, then one cell per day with the entries running that day. */
export function monthGrid(ym: string, items: readonly CalendarEntry[]): MonthCell[][] {
  const [y, m] = ym.split("-").map(Number);
  const first = new Date(Date.UTC(y ?? 2026, (m ?? 1) - 1, 1));
  const days = new Date(Date.UTC(y ?? 2026, m ?? 1, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7;
  const cells: MonthCell[] = Array.from({ length: lead }, () => ({ day: null, entries: [] }));
  for (let d = 1; d <= days; d++) {
    const day = `${ym}-${String(d).padStart(2, "0")}`;
    cells.push({ day, entries: items.filter((e) => e.startsOn <= day && e.endsOn >= day) });
  }
  while (cells.length % 7) cells.push({ day: null, entries: [] });
  const weeks: MonthCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

// ---------------- trust helpers ----------------

/** "4.2 out of 5 from 23 verified ratings", or why there is no number yet. */
export function scoreSentence(s: TrustScore): string {
  if (s.average === null) {
    const left = Math.max(0, s.minimum - s.count);
    return s.count === 0
      ? `No verified ratings yet. A score appears once ${s.minimum} players who took part have rated.`
      : `${s.count} verified ${s.count === 1 ? "rating" : "ratings"} so far. A score appears after ${left} more.`;
  }
  return `${s.average.toFixed(1)} out of 5 from ${s.count} verified ${s.count === 1 ? "rating" : "ratings"}.`;
}
export const verifiedLabel = (v: string): string => (v === "played" ? "Played (team captain)" : "Checked in at the event");
export const windowSentence = (w: RatingWindow): string =>
  w.state === "open" ? `Ratings for this event are open until ${w.closesAt ? w.closesAt.slice(0, 10) : "the window closes"}.`
    : w.state === "not_yet" ? "Ratings open when this event ends."
      : w.state === "closed" ? `Ratings for this event closed ${w.days} days after it ended.`
        : "This event has no dates, so it cannot be rated.";
