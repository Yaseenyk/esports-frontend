/**
 * Sponsor report: pure helpers (date ranges, chart shapes, honest wording). No browser or network code.
 * Honesty rule: the numbers are PAGE LOADS. They are never described as viewers, reach, audience or unique people.
 */
export type SourceId = "live" | "overlay" | "embed";
export type PeriodId = "7d" | "30d" | "event";

export interface Day { day: string; hits: number }
export interface ViewCount { source: string; view: string; hits: number }
export interface SponsorReportData {
  from: string; to: string; total: number; days: Day[];
  bySource: Record<SourceId, number>; byView: ViewCount[]; peak: Day | null;
}

export const MAX_DAYS = 90;
const DAY_MS = 86_400_000;
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

export const SOURCE_LABEL: Record<SourceId, string> = { live: "Live page", overlay: "Stream overlay", embed: "Embedded widgets" };
export const SOURCE_ORDER: SourceId[] = ["live", "overlay", "embed"];
export const PERIODS: { id: PeriodId; label: string }[] = [
  { id: "7d", label: "Last 7 days" }, { id: "30d", label: "Last 30 days" }, { id: "event", label: "Whole event" },
];

export const LOADS_NOT_PEOPLE = "This counts page loads, not unique people.";
export const SPONSORS_SHOWN = "Every page load showed these sponsors.";
export const HOW_COUNTED = "Each time the live page, a stream overlay or an embedded widget opens, one is added to a daily counter. Nothing else is kept: no names, no addresses, no cookies and no record of who looked. One person opening the page ten times is ten loads, and a reload counts again. A browser that asks not to be tracked is not counted at all, and a repeat within 30 seconds is counted once, so these are loads, not people, and the true number may be a little higher.";

const pad = (n: number) => String(n).padStart(2, "0");
export const isoDay = (ms: number): string => { const d = new Date(ms); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`; };
export const parseDay = (s: string): number | null => { if (!DAY_RE.test(s)) return null; const ms = Date.parse(`${s}T00:00:00Z`); return Number.isNaN(ms) || isoDay(ms) !== s ? null : ms; };

/**
 * The dates (UTC, the same days the counters use) for a period ending today.
 * "Whole event" starts on the event date when that is within the last 90 days and not in the future; otherwise it is the last 90 days, the most the report holds.
 */
export function rangeFor(period: PeriodId, now: number, eventDate?: string): { from: string; to: string; capped: boolean } {
  const today = Math.floor(now / DAY_MS) * DAY_MS;
  if (period === "7d") return { from: isoDay(today - 6 * DAY_MS), to: isoDay(today), capped: false };
  if (period === "30d") return { from: isoDay(today - 29 * DAY_MS), to: isoDay(today), capped: false };
  const oldest = today - (MAX_DAYS - 1) * DAY_MS;
  const start = eventDate ? parseDay(eventDate.slice(0, 10)) : null;
  if (start === null) return { from: isoDay(oldest), to: isoDay(today), capped: false };
  if (start > today) return { from: isoDay(today), to: isoDay(today), capped: false };
  if (start < oldest) return { from: isoDay(oldest), to: isoDay(today), capped: true };
  return { from: isoDay(start), to: isoDay(today), capped: false };
}

export const periodLabel = (p: PeriodId, r: { from: string; to: string }) => `${PERIODS.find((x) => x.id === p)?.label ?? ""} (${r.from} to ${r.to})`;

/** Every day from `from` to `to`, with 0 where nothing was counted, so a quiet day is a visible zero rather than a gap. */
export function fillDays(days: Day[], from: string, to: string): Day[] {
  const a = parseDay(from), b = parseDay(to);
  if (a === null || b === null || b < a) return [];
  const m = new Map(days.map((d) => [d.day, d.hits]));
  const out: Day[] = [];
  for (let t = a; t <= b && out.length < MAX_DAYS; t += DAY_MS) { const d = isoDay(t); out.push({ day: d, hits: m.get(d) ?? 0 }); }
  return out;
}

export const peakOf = (days: Day[]): Day | null => days.reduce<Day | null>((best, d) => (d.hits > 0 && (!best || d.hits > best.hits) ? d : best), null);
export const sumDays = (days: Day[]) => days.reduce((s, d) => s + d.hits, 0);

/** "3 Dec" for a UTC date string. */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function shortDay(s: string): string { const ms = parseDay(s); if (ms === null) return s; const d = new Date(ms); return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`; }

export interface Bar { day: string; hits: number; x: number; y: number; w: number; h: number; peak: boolean }
/** Bar geometry for an SVG of the given size. Bars start at 0 (never a cut axis), and a day with 0 loads has height 0. */
export function chartBars(days: Day[], width: number, height: number): { bars: Bar[]; max: number } {
  const n = days.length, max = Math.max(1, ...days.map((d) => d.hits));
  const gap = n > 45 ? 1 : 3, w = n ? Math.max(1, (width - gap * (n - 1)) / n) : 0;
  const peak = peakOf(days);
  return { max, bars: days.map((d, i) => { const h = (d.hits / max) * height; return { day: d.day, hits: d.hits, x: i * (w + gap), y: height - h, w, h, peak: !!peak && d.day === peak.day }; }) };
}

const loads = (n: number) => `${n} page ${n === 1 ? "load" : "loads"}`;
/** The text alternative of the chart: every number, in words. */
export function chartText(days: Day[]): string {
  if (!days.length) return "No days to show.";
  return `Page loads for each day. ${days.map((d) => `${shortDay(d.day)}: ${d.hits}`).join(". ")}.`;
}

/** One honest sentence about the period. Never says people, viewers, reach or audience. */
export function summaryText(d: Pick<SponsorReportData, "total" | "peak">, periodName: string): string {
  if (d.total === 0) return `No page loads were counted in ${periodName.toLowerCase()}.`;
  const peak = d.peak ? ` The busiest day was ${shortDay(d.peak.day)}, with ${loads(d.peak.hits)}.` : "";
  return `${periodName}: ${loads(d.total)}.${peak}`;
}

export const sourceRows = (bySource: Record<SourceId, number>) => SOURCE_ORDER.map((id) => ({ id, label: SOURCE_LABEL[id], hits: bySource[id] ?? 0 }));
/** Share of loads for the rows, as whole percentages for display only. */
export const percentOf = (n: number, total: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

/** What a view code is called on screen. Unknown codes are shown as they are, as text. */
export function viewLabel(source: string, view: string): string {
  if (!view) return source === "live" ? "Whole page" : "Whole screen";
  const names: Record<string, string> = { table: "Standings table", schedule: "Schedule", bracket: "Bracket", countdown: "Countdown", standings: "Standings", league: "League table", sponsors: "Sponsors" };
  return names[view] ?? view;
}

export function pdfFileName(eventName: string): string {
  const base = (eventName || "event").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").slice(0, 40) || "event";
  return `${base}-sponsor-report.pdf`;
}

export const reportPath = (eventId: string, from: string, to: string) => `/events/${encodeURIComponent(eventId)}/sponsor-report?from=${from}&to=${to}`;
