/**
 * The event report: plain numbers worked out from the roster and the check-ins. Pure functions, no network, no page.
 * Privacy: the report holds counts only. It never carries a person's name, so the PDF is safe to forward.
 * Arrivals come from the time each person was checked in (the `at` of a check-in). Arrivals are counted in 15-minute buckets.
 */
export interface ReportEvent { name: string; date?: string; venue?: string }
export interface ReportPerson { id: string; teamId?: string | null; role?: string; minor?: boolean }
export interface ReportTeam { id: string; name: string }
export interface ReportCheckin { personId: string; at: string }
export interface Count { label: string; present: number; total: number }
export interface Bucket { start: number; label: string; count: number }
export interface Report {
  event: ReportEvent;
  total: number; present: number; noShows: number; percent: number;
  byRole: Count[]; byTeam: Count[];
  under18: number;
  buckets: Bucket[]; peak: Bucket | null; first: string | null; last: string | null;
  summary: string;
}

export const BUCKET_MS = 15 * 60_000;
const MAX_BUCKETS = 96;
const NO_TEAM = "No team";

const pad = (n: number) => String(n).padStart(2, "0");
/** "HH:MM" for a time, shifted by `offsetMin` minutes from UTC (the page passes the browser's own offset; tests use 0). */
export function clock(ms: number, offsetMin = 0): string {
  const d = new Date(ms + offsetMin * 60_000);
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}
const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

function tally(people: ReportPerson[], presentIds: Set<string>, key: (p: ReportPerson) => string): Count[] {
  const m = new Map<string, Count>();
  for (const p of people) {
    const k = key(p);
    const c = m.get(k) ?? { label: k, present: 0, total: 0 };
    c.total++; if (presentIds.has(p.id)) c.present++;
    m.set(k, c);
  }
  return [...m.values()].sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));
}

export function buildReport({ event, people, teams, checkins, tzOffsetMin = 0 }: {
  event: ReportEvent; people: ReportPerson[]; teams: ReportTeam[]; checkins: ReportCheckin[]; tzOffsetMin?: number;
}): Report {
  const known = new Set(people.map((p) => p.id));
  // One arrival per person: the earliest valid time. Check-ins for someone not on the roster are ignored.
  const firstAt = new Map<string, number>();
  for (const c of checkins) {
    const t = Date.parse(c.at);
    if (!known.has(c.personId) || !Number.isFinite(t)) continue;
    const prev = firstAt.get(c.personId);
    if (prev === undefined || t < prev) firstAt.set(c.personId, t);
  }
  const present = new Set([...firstAt.keys()]);
  const teamName = new Map(teams.map((t) => [t.id, t.name]));
  const byRole = tally(people, present, (p) => p.role?.trim() || "Other");
  const byTeam = tally(people, present, (p) => (p.teamId && teamName.get(p.teamId)) || NO_TEAM);

  const times = [...firstAt.values()].sort((a, b) => a - b);
  let buckets: Bucket[] = [], peak: Bucket | null = null;
  if (times.length) {
    const startOf = (t: number) => Math.floor(t / BUCKET_MS) * BUCKET_MS;
    const counts = new Map<number, number>();
    for (const t of times) counts.set(startOf(t), (counts.get(startOf(t)) ?? 0) + 1);
    const from = startOf(times[0]!), to = startOf(times[times.length - 1]!);
    const span = (to - from) / BUCKET_MS + 1;
    const starts = span <= MAX_BUCKETS ? Array.from({ length: span }, (_, i) => from + i * BUCKET_MS) : [...counts.keys()].sort((a, b) => a - b);
    buckets = starts.map((s) => ({ start: s, label: clock(s, tzOffsetMin), count: counts.get(s) ?? 0 }));
    peak = buckets.reduce((best, b) => (b.count > best.count ? b : best), buckets[0]!);
  }
  const first = times.length ? clock(times[0]!, tzOffsetMin) : null;
  const last = times.length ? clock(times[times.length - 1]!, tzOffsetMin) : null;

  const total = people.length, n = present.size;
  const percent = pct(n, total);
  const under18 = people.filter((p) => p.minor).length;

  let summary: string;
  if (total === 0) summary = "No people have been added to this event yet.";
  else if (n === 0) summary = `Nobody has been checked in yet. ${total} ${total === 1 ? "person is" : "people are"} on the list.`;
  else {
    const end = clock(peak!.start + BUCKET_MS, tzOffsetMin);
    summary = `${n} of ${total} ${total === 1 ? "person" : "people"} (${percent}%) checked in, ${total - n} did not. The busiest quarter hour was ${peak!.label} to ${end}, with ${peak!.count} ${peak!.count === 1 ? "arrival" : "arrivals"}. The first arrival was at ${first} and the last at ${last}.`;
  }
  return { event, total, present: n, noShows: total - n, percent, byRole, byTeam, under18, buckets, peak, first, last, summary };
}
