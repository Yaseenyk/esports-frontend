/** Pure helpers for "Run this event again": default names, date maths, option validation and the privacy filter for people. No network, no React. */

export type Role = "owner" | "editor" | "viewer";

export interface DuplicateInclude {
  teams: boolean;
  people: boolean;
  registrationForm: boolean;
  liveExtras: boolean;
  /** Never copied: a new event is never listed publicly until its owner publishes it. Always false. */
  directory: false;
  members: boolean;
  matches: boolean;
}

export const NAME_MAX = 120;
export const PEOPLE_WARNING = "Names and teams only. Photos, birth dates, consent and passes are never copied.";

/** What is ticked at first: the safe things. People start unticked; so do editors and viewers. */
export const DEFAULT_INCLUDE: DuplicateInclude = { teams: true, people: false, registrationForm: true, liveExtras: true, directory: false, members: false, matches: true };

export interface IncludeOption { key: Exclude<keyof DuplicateInclude, "directory">; label: string; hint: string; ownerOnly?: boolean; warning?: string }

/** The checkboxes, in order, with plain labels and one-line explanations. */
export const OPTIONS: IncludeOption[] = [
  { key: "teams", label: "Teams", hint: "Team names and logos, so you do not type them again." },
  { key: "people", label: "People", hint: "Players, coaches and staff, ready for new passes.", warning: PEOPLE_WARNING },
  { key: "registrationForm", label: "Registration form text", hint: "Title, intro and settings. It gets a new link and starts closed." },
  { key: "liveExtras", label: "Sponsors and ticker", hint: "Sponsor names and logos and the news ticker. The live page starts unpublished with a new address." },
  { key: "matches", label: "Structure of matches", hint: "Rounds and pairings only. Every score, result and winner starts empty." },
  { key: "members", label: "Editors and viewers", hint: "The same people get the same access to the new event.", ownerOnly: true },
];

/** Things that are never copied, said once in the dialog. */
export const NEVER_COPIED = "Never copied: photos, birth dates, consent, passes, check-ins, gate keys, invite links, registrations received, announcements, reports and reminders.";

export function stripCopySuffix(name: string): string {
  return name.replace(/\s*\(copy(?: \d+)?\)\s*$/i, "").trim();
}

/** "Spring Cup" becomes "Spring Cup (copy)"; copying a copy does not stack suffixes. Always within the server's 120 characters. */
export function defaultName(name: string): string {
  const base = stripCopySuffix(name) || "Event";
  const suffix = " (copy)";
  return base.slice(0, NAME_MAX - suffix.length).trim() + suffix;
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})([\s\S]*)$/;

/** Adds days to a date that starts YYYY-MM-DD (anything after the date, such as a time, is kept). Anything else returns null: free-text dates are never guessed. */
export function addDays(date: string, days: number): string | null {
  const m = ISO_DATE.exec(date.trim());
  if (!m) return null;
  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  const t = Date.UTC(y, mo - 1, d);
  const chk = new Date(t);
  if (chk.getUTCFullYear() !== y || chk.getUTCMonth() !== mo - 1 || chk.getUTCDate() !== d) return null;
  const out = new Date(t + days * 86_400_000);
  const p = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${p(out.getUTCFullYear(), 4)}-${p(out.getUTCMonth() + 1)}-${p(out.getUTCDate())}${m[4]}`;
}

export const sameTimeNextWeek = (date: string): string | null => addDays(date, 7);

/** The name for a weekly run: when the old name holds the old date, the new date replaces it; otherwise the usual "(copy)". */
export function nextWeekName(name: string, oldDate: string, newDate: string): string {
  const od = oldDate.trim().slice(0, 10);
  const nd = newDate.trim().slice(0, 10);
  if (od && nd && name.includes(od)) return name.split(od).join(nd).slice(0, NAME_MAX);
  return defaultName(name);
}

/** Returns a plain-words problem with the choices, or null when they are fine. */
export function includeProblem(inc: DuplicateInclude, role: Role): string | null {
  if (inc.people && !inc.teams) return "People come over with their teams. Tick Teams too, or untick People.";
  if (inc.members && role !== "owner") return "Only the owner of the event can bring editors and viewers over.";
  return null;
}

export function nameProblem(name: string): string | null {
  const n = name.trim();
  if (!n) return "Give the new event a name.";
  if (n.length > NAME_MAX) return `Keep the name to ${NAME_MAX} characters or fewer.`;
  return null;
}

export function dateProblem(date: string): string | null {
  return date.trim().length > 40 ? "Keep the date to 40 characters or fewer." : null;
}

/** Makes the choices safe to send: unknown values become false, People without Teams is switched off, owner-only options are dropped for editors. */
export function normaliseInclude(raw: Partial<Record<string, unknown>>, role: Role): DuplicateInclude {
  const t = (k: string) => raw[k] === true;
  const teams = t("teams");
  return { teams, people: teams && t("people"), registrationForm: t("registrationForm"), liveExtras: t("liveExtras"), directory: false, members: role === "owner" && t("members"), matches: t("matches") };
}

export interface DuplicateRequest { name: string; date?: string; include: DuplicateInclude }

export function buildRequest(name: string, date: string, include: DuplicateInclude, role: Role): DuplicateRequest {
  const body: DuplicateRequest = { name: name.trim(), include: normaliseInclude(include as unknown as Record<string, unknown>, role) };
  if (date.trim()) body.date = date.trim();
  return body;
}

/** One line per choice, for the summary step. */
export function summaryLines(name: string, date: string, inc: DuplicateInclude): string[] {
  const out = [`New event: ${name.trim() || "(no name yet)"}${date.trim() ? `, ${date.trim()}` : ""}.`];
  out.push("Brought over: event details, venue, emergency contact and rules.");
  const on = OPTIONS.filter((o) => inc[o.key]).map((o) => o.label.toLowerCase());
  out.push(on.length ? `Also brought over: ${on.join(", ")}.` : "Nothing else is brought over.");
  const off = OPTIONS.filter((o) => !inc[o.key]).map((o) => o.label.toLowerCase());
  if (off.length) out.push(`Left behind: ${off.join(", ")}.`);
  out.push(NEVER_COPIED);
  return out;
}

export interface PersonLike { id: string; name: string; teamId: string; role: string; zones?: unknown; minor?: boolean; guardian?: boolean; [k: string]: unknown }
export interface SafePerson { id: string; name: string; teamId: string; role: string; zones: string[]; minor: boolean; guardian: false }

/**
 * What a copied person looks like. Only name, team, role and zones travel (the same rule the server applies), plus the minor flag so a child stays
 * protected; consent is reset, so the new organiser records it again. Photos, birth dates, Aadhaar digits, passes and anything else are dropped.
 */
export function safePerson(p: PersonLike): SafePerson {
  const z = p.zones;
  const zones = Array.isArray(z) ? z.filter((x): x is string => typeof x === "string").slice(0, 20) : typeof z === "string" && z ? [z] : [];
  return { id: p.id, name: p.name, teamId: p.teamId, role: p.role, zones, minor: p.minor === true, guardian: false };
}
export const safePeople = (list: PersonLike[]): SafePerson[] => list.map(safePerson);

/** The new event's address in the app. */
export const eventHref = (id: string) => `/app/events/?id=${encodeURIComponent(id)}`;
