/**
 * The tournament form: field rules, slug rules, request bodies. Pure (no network, no React). The server is the authority; these
 * mirror API.md section 2 and `esports-backend/src/v3/lib/slug.ts` so a person sees the problem before they press save.
 */
import { FORMAT_NAMES, GAME_NAMES } from "@/features/tournaments/domain";
import type { OrganiserTournament } from "@/features/tournaments/organiser/domain";

export interface TournamentForm {
  title: string; game: string; format: string; venue: string; city: string; state: string;
  summary: string; description: string; rules: string; maxTeams: string; startsAt: string; endsAt: string; slug: string;
}
export type FormErrors = Partial<Record<keyof TournamentForm, string>>;

export const BLANK_FORM: TournamentForm = { title: "", game: "", format: "", venue: "online", city: "", state: "", summary: "", description: "", rules: "", maxTeams: "", startsAt: "", endsAt: "", slug: "" };

export const GAME_OPTIONS = Object.entries(GAME_NAMES).map(([value, label]) => ({ value, label }));
export const FORMAT_OPTIONS = Object.entries(FORMAT_NAMES).map(([value, label]) => ({ value, label }));
export const VENUE_OPTIONS = [{ value: "online", label: "Online" }, { value: "offline", label: "In person (offline)" }, { value: "hybrid", label: "Hybrid (online and in person)" }];

export const LIMITS = { titleMin: 3, title: 120, summary: 300, description: 8000, rules: 8000, place: 60, maxTeamsMin: 2, maxTeamsMax: 1024 } as const;

// ---- slug ----

/** Same list as the backend (`slug.ts`). The server also checks it; this gives the answer while typing. */
export const RESERVED_SLUGS: readonly string[] = [
  "admin", "api", "app", "auth", "login", "logout", "register", "signup", "sign-in", "sign-up", "me", "new", "edit", "settings", "account", "dashboard",
  "tournaments", "tournament", "players", "player", "teams", "team", "lft", "looking-for-team", "looking-for-player", "disputes", "dispute", "discord",
  "public", "live", "events", "event", "games", "cities", "about", "contact", "help", "support", "terms", "privacy", "legal", "static", "assets", "null",
  "undefined", "esports", "hub", "official", "moderator", "staff", "system", "root", "streamer", "streamerosai",
];
const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,58}[a-z0-9]$/;

export type SlugReason = "format" | "reserved" | "double_hyphen";
export type SlugCheck = { ok: true; slug: string } | { ok: false; reason: SlugReason };

export function checkSlug(input: string): SlugCheck {
  const s = input.trim().toLowerCase();
  if (!SLUG_RE.test(s)) return { ok: false, reason: "format" };
  if (s.includes("--")) return { ok: false, reason: "double_hyphen" };
  if (RESERVED_SLUGS.includes(s)) return { ok: false, reason: "reserved" };
  return { ok: true, slug: s };
}

export const SLUG_WORDS: Record<SlugReason, string> = {
  format: "Use 3 to 60 characters: lower-case letters, digits and hyphens, starting and ending with a letter or digit.",
  reserved: "That address is reserved. Try another one.",
  double_hyphen: "Use single hyphens only, not two in a row.",
};

/** A suggested address from a title, in the same shape the server derives. */
export function slugify(text: string, max = 48): string {
  return text.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, max).replace(/-+$/g, "");
}

// ---- dates: the browser's datetime-local input is local time; the API wants ISO UTC ----

const pad = (n: number): string => String(n).padStart(2, "0");
export function isoToLocalInput(iso: string | null | undefined): string {
  const t = iso ? new Date(iso) : null;
  if (!t || Number.isNaN(t.getTime())) return "";
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}T${pad(t.getHours())}:${pad(t.getMinutes())}`;
}
export function localInputToIso(v: string): string | null {
  if (!v.trim()) return null;
  const t = new Date(v);
  return Number.isNaN(t.getTime()) ? null : t.toISOString();
}

// ---- description: simple Markdown typed, plain text stored (API.md: "Plain text only") ----

/** What the public page will show. The page prints text as it is stored, so formatting marks are removed when the form is saved. Pure. */
export function markdownToPlain(md: string): string {
  return md
    .replace(/\r\n?/g, "\n")
    .replace(/^```[^\n]*$/gm, "")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)\s]+)[^)]*\)/g, "$1 ($2)")
    .replace(/<((?:https?:\/\/|mailto:)[^>\s]+)>/g, "$1")
    .replace(/^ {0,3}#{1,6}[ \t]+/gm, "")
    .replace(/^ {0,3}>[ \t]?/gm, "")
    .replace(/^ {0,3}([-*_])([ \t]*\1){2,}[ \t]*$/gm, "")
    .replace(/^([ \t]*)[-*+][ \t]+/gm, "$1• ")
    .replace(/(\*\*|__)(.+?)\1/g, "$2")
    .replace(/(^|[^\w*])\*([^*\n]+)\*(?!\w)/g, "$1$2")
    .replace(/(^|[^\w])_([^_\n]+)_(?!\w)/g, "$1$2")
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/`([^`\n]*)`/g, "$1")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ---- validation ----

const len = (s: string): number => Array.from(s.trim()).length;
const hasMarkup = (s: string): boolean => /[<>]/.test(s);

export interface ValidateOptions { slugLocked?: boolean }

export function validateForm(f: TournamentForm, opt: ValidateOptions = {}): FormErrors {
  const e: FormErrors = {};
  const t = f.title.trim();
  if (len(t) < LIMITS.titleMin) e.title = `Write at least ${LIMITS.titleMin} characters.`;
  else if (len(t) > LIMITS.title) e.title = `At most ${LIMITS.title} characters.`;
  else if (hasMarkup(t)) e.title = "Plain text only: remove the < and > characters.";
  if (!f.game) e.game = "Choose the game.";
  if (!f.format) e.format = "Choose the format.";
  if (!["online", "offline", "hybrid"].includes(f.venue)) e.venue = "Choose online, in person or hybrid.";
  for (const k of ["city", "state"] as const) {
    if (len(f[k]) > LIMITS.place) e[k] = `At most ${LIMITS.place} characters.`;
    else if (hasMarkup(f[k])) e[k] = "Plain text only: remove the < and > characters.";
  }
  if (len(f.summary) > LIMITS.summary) e.summary = `At most ${LIMITS.summary} characters.`;
  else if (hasMarkup(f.summary)) e.summary = "Plain text only: remove the < and > characters.";
  const plain = markdownToPlain(f.description);
  if (len(plain) > LIMITS.description) e.description = `At most ${LIMITS.description} characters.`;
  else if (hasMarkup(plain)) e.description = "Plain text only: remove the < and > characters (a Markdown link is fine).";
  if (len(f.rules) > LIMITS.rules) e.rules = `At most ${LIMITS.rules} characters.`;
  else if (hasMarkup(f.rules)) e.rules = "Plain text only: remove the < and > characters.";
  if (f.maxTeams.trim() !== "") {
    const n = Number(f.maxTeams);
    if (!/^\d+$/.test(f.maxTeams.trim()) || n < LIMITS.maxTeamsMin || n > LIMITS.maxTeamsMax) e.maxTeams = `A whole number from ${LIMITS.maxTeamsMin} to ${LIMITS.maxTeamsMax}.`;
  }
  const s = f.startsAt ? localInputToIso(f.startsAt) : null, en = f.endsAt ? localInputToIso(f.endsAt) : null;
  if (f.startsAt && !s) e.startsAt = "That date and time is not valid.";
  if (f.endsAt && !en) e.endsAt = "That date and time is not valid.";
  if (s && en && Date.parse(en) < Date.parse(s)) e.endsAt = "The end cannot be before the start.";
  if (!opt.slugLocked && f.slug.trim() !== "") {
    const c = checkSlug(f.slug);
    if (!c.ok) e.slug = SLUG_WORDS[c.reason];
  }
  return e;
}

// ---- request bodies ----

const orNull = (s: string): string | null => (s.trim() ? s.trim() : null);

/** What the form holds for a saved tournament. The description is shown as stored (plain text). */
export function fromTournament(t: OrganiserTournament): TournamentForm {
  return {
    title: t.title, game: t.game, format: t.format, venue: t.venue, city: t.city ?? "", state: t.state ?? "", summary: t.summary ?? "", description: t.description ?? "", rules: t.rules ?? "",
    maxTeams: t.maxTeams === null ? "" : String(t.maxTeams), startsAt: isoToLocalInput(t.startsAt), endsAt: isoToLocalInput(t.endsAt), slug: t.slug,
  };
}

/** Create body: empty optional fields are left out; an empty slug lets the server derive one from the title. */
export function toCreateBody(f: TournamentForm): Record<string, unknown> {
  const b: Record<string, unknown> = { title: f.title.trim(), game: f.game, format: f.format, venue: f.venue };
  if (f.slug.trim()) b.slug = f.slug.trim().toLowerCase();
  for (const k of ["city", "state", "summary", "rules"] as const) if (f[k].trim()) b[k] = f[k].trim();
  const d = markdownToPlain(f.description);
  if (d) b.description = d;
  if (f.maxTeams.trim()) b.maxTeams = Number(f.maxTeams);
  const s = localInputToIso(f.startsAt), e = localInputToIso(f.endsAt);
  if (s) b.startsAt = s;
  if (e) b.endsAt = e;
  return b;
}

/** Edit body: only what changed. A cleared optional field is sent as null (API.md). The slug goes only while it is unlocked and changed. */
export function toUpdateBody(f: TournamentForm, saved: OrganiserTournament): Record<string, unknown> {
  const was = fromTournament(saved);
  const b: Record<string, unknown> = {};
  if (f.title.trim() !== was.title) b.title = f.title.trim();
  for (const k of ["game", "format", "venue"] as const) if (f[k] !== was[k]) b[k] = f[k];
  for (const k of ["city", "state", "summary", "rules"] as const) if (f[k].trim() !== was[k].trim()) b[k] = orNull(f[k]);
  const d = markdownToPlain(f.description);
  if (d !== was.description.trim()) b.description = d || null;
  if (f.maxTeams.trim() !== was.maxTeams) b.maxTeams = f.maxTeams.trim() ? Number(f.maxTeams) : null;
  if (f.startsAt !== was.startsAt) b.startsAt = localInputToIso(f.startsAt);
  if (f.endsAt !== was.endsAt) b.endsAt = localInputToIso(f.endsAt);
  if (!saved.publishedAt && f.slug.trim().toLowerCase() !== saved.slug) b.slug = f.slug.trim().toLowerCase();
  return b;
}

export const isDirty = (f: TournamentForm, saved: OrganiserTournament): boolean => Object.keys(toUpdateBody(f, saved)).length > 0;

/** Maps a server error code to the form field it belongs to, so the message sits next to the field. */
export function fieldForCode(code: string | undefined): keyof TournamentForm | null {
  if (!code) return null;
  if (code.startsWith("slug_")) return "slug";
  const m = /^invalid_(title|game|format|venue|city|state|summary|description|rules|maxTeams|startsAt|endsAt)$/.exec(code);
  return m ? (m[1] as keyof TournamentForm) : null;
}
