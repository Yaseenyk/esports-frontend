/**
 * Client-side HINTS for the LFT text rules (no links, no phone numbers, plain text, 600 characters). Pure.
 * Port of the backend's `src/v3/lib/lft-text.ts`. The SERVER IS THE AUTHORITY: these checks only save a round trip, and a message that
 * passes here can still be refused (the server's error code is then shown in plain words). Keep the two in step.
 */
export const LFT_MESSAGE_MAX = 600, LFT_MESSAGE_MIN = 10, APPLICATION_MESSAGE_MAX = 400, CONTACT_MAX = 40, CONTACT_MIN = 2;

export type TextProblem = "empty" | "too_long" | "has_link" | "has_phone" | "has_markup" | "bad_contact" | "has_outside_contact";
export type TextCheck = { ok: true; text: string } | { ok: false; code: TextProblem };

const CONTROL = new RegExp("[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2066-\u2069\ufeff]", "g");
const DOT = "[.\\u3002\\uff0e\\u2024]";
const TLDS = "com|net|org|io|gg|co|in|me|tv|xyz|app|dev|link|ly|to|ink|info|biz|us|uk|ru|cc|club|site|online|live|chat|gl|be|im|fm|ws|vip|shop|store|page|tk|ml|ga|cf|gq";
const LINK_RES: RegExp[] = [
  /\b[a-z][a-z0-9+.-]{1,15}:\/\//i, /\bwww\s*\./i, /\b(?:https?|ftp)\b\s*:/i,
  new RegExp(`(?:^|[^a-z0-9])[a-z0-9-]+\\s*${DOT}\\s*(?:${TLDS})(?![a-z0-9])`, "i"),
  /\bdiscord\s*\.?\s*(?:gg|com\s*\/\s*invite)/i, /\b(?:dot|d0t)\s*(?:com|net|org|gg|io|in)\b/i, /\bt\s*\.\s*me\s*\//i, /\bwa\s*\.\s*me\b/i, /\bbit\s*\.\s*ly\b/i,
];

export function hasPhoneNumber(text: string): boolean {
  const runs = text.match(/[+(]?\d[\d\s().\-‐-―]{5,}\d/g) ?? [];
  for (const r of runs) if (r.replace(/\D/g, "").length >= 7) return true;
  return text.replace(/[^0-9]/g, "").length >= 10;
}
/** A social @handle (an at sign and 3 or more word or dot characters) or an invitation to talk somewhere else. Same rule as the server. */
const HANDLE_RE = /@[\w.]{3,}/;
const INVITE_RES: RegExp[] = [/\bdm\s+me\b/i, /\b(?:message|contact|ping|add|reach)\s+me\s+on\b/i, /\b(?:call|whatsapp|text)\s+me\b/i];
export const hasOutsideContact = (text: string): boolean => HANDLE_RE.test(text) || INVITE_RES.some((re) => re.test(text));
export const hasLink = (text: string): boolean => LINK_RES.some((re) => re.test(text));
export const cleanText = (v: string): string => v.replace(CONTROL, " ").replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();

function plain(v: string, max: number, min: number): TextCheck {
  const t = cleanText(v);
  if (t.length < min) return { ok: false, code: "empty" };
  if (Array.from(t).length > max) return { ok: false, code: "too_long" };
  if (/[<>]/.test(t)) return { ok: false, code: "has_markup" };
  if (hasLink(t)) return { ok: false, code: "has_link" };
  if (hasPhoneNumber(t)) return { ok: false, code: "has_phone" };
  if (hasOutsideContact(t)) return { ok: false, code: "has_outside_contact" };
  return { ok: true, text: t };
}
export const checkListingMessage = (v: string): TextCheck => plain(v, LFT_MESSAGE_MAX, LFT_MESSAGE_MIN);
export const checkApplicationMessage = (v: string): TextCheck => (v.trim() === "" ? { ok: true, text: "" } : plain(v, APPLICATION_MESSAGE_MAX, 0));
export function checkContact(v: string): TextCheck {
  const t = cleanText(v);
  if (t.length < CONTACT_MIN || t.length > CONTACT_MAX || !/^[\p{L}\p{N}._#@ -]+$/u.test(t)) return { ok: false, code: "bad_contact" };
  if (hasLink(t)) return { ok: false, code: "has_link" };
  if (hasPhoneNumber(t)) return { ok: false, code: "has_phone" };
  return { ok: true, text: t };
}

export const OUTSIDE_CONTACT_HINT = 'Contact details are shared only after the poster accepts an application. Remove the handle or the "DM me" line and ask people to apply here.';
/** The one line shown under the message box before anything is typed. */
export const MESSAGE_HELP = "Plain text, 10 to 600 characters. No links, phone numbers, @handles or \"DM me\" lines: contact is shared only after you accept an application.";

/** A hint in plain words for a problem, or "" when the text is fine. */
export function hintFor(what: "message" | "application" | "contact", c: TextCheck): string {
  if (c.ok) return "";
  switch (c.code) {
    case "has_link": return "This looks like a link. Links are not allowed: describe it in words.";
    case "has_phone": return "This looks like a phone number. Phone numbers are not allowed.";
    case "has_outside_contact": return OUTSIDE_CONTACT_HINT;
    case "has_markup": return "Plain text only: remove the < and > characters.";
    case "too_long": return `Too long: at most ${what === "application" ? APPLICATION_MESSAGE_MAX : LFT_MESSAGE_MAX} characters.`;
    case "bad_contact": return `Use ${CONTACT_MIN} to ${CONTACT_MAX} characters: letters, digits and . _ # @ - only.`;
    default: return what === "message" ? `Write at least ${LFT_MESSAGE_MIN} characters.` : what === "contact" ? "Add a contact handle, for example a Discord name." : "";
  }
}

export interface CreateForm {
  kind: string; game: string; roles: string[]; rankMin: string; rankMax: string; state: string; city: string; onlineOk: boolean; message: string; contact: string; expiresInDays: string; teamProfileId: string;
  /** Team matching (only sent while it is on): languages, play-hour blocks and the contacts to share after an accept. */
  languages: string[]; playHours: string[]; contacts: { discord: string; instagram: string; ign: string };
}
export type FormErrors = Partial<Record<keyof CreateForm, string>>;

const rankOk = (s: string) => s === "" || (/^\d{1,3}$/.test(s) && Number(s) <= 100);

export function validateCreate(f: CreateForm): FormErrors {
  const e: FormErrors = {};
  if (f.kind !== "looking_for_team" && f.kind !== "looking_for_player") e.kind = "Choose what you are posting.";
  if (!f.game) e.game = "Choose a game.";
  if (f.roles.length > 4) e.roles = "Pick at most 4 roles.";
  if (!rankOk(f.rankMin)) e.rankMin = "A whole number from 0 to 100.";
  if (!rankOk(f.rankMax)) e.rankMax = "A whole number from 0 to 100.";
  if (!e.rankMin && !e.rankMax && f.rankMin !== "" && f.rankMax !== "" && Number(f.rankMin) > Number(f.rankMax)) e.rankMax = "The top of the range must not be below the bottom.";
  const m = hintFor("message", checkListingMessage(f.message)); if (m) e.message = m;
  const chosen = Object.values(f.contacts ?? {}).filter((x) => x.trim());
  if (chosen.length) { const bad = chosen.map((x) => hintFor("contact", checkContact(x))).find(Boolean); if (bad) e.contacts = bad; }
  else { const c = hintFor("contact", checkContact(f.contact)); if (c) e.contact = c; }
  const d = Number(f.expiresInDays);
  if (!Number.isInteger(d) || d < 1 || d > 30) e.expiresInDays = "Choose 1 to 30 days.";
  if (f.kind === "looking_for_player" && !f.teamProfileId) e.teamProfileId = "Pick the team page you are recruiting for.";
  return e;
}

/** The JSON body for POST /v3/lft. Empty optional fields are left out; teamProfileId only for a team looking for a player. */
export function createBody(f: CreateForm): Record<string, unknown> {
  const n = (s: string) => (s === "" ? undefined : Number(s));
  return {
    kind: f.kind, game: f.game, roles: f.roles, ...(n(f.rankMin) !== undefined ? { rankMin: n(f.rankMin) } : {}), ...(n(f.rankMax) !== undefined ? { rankMax: n(f.rankMax) } : {}),
    ...(f.state.trim() ? { state: f.state.trim() } : {}), ...(f.city.trim() ? { city: f.city.trim() } : {}), onlineOk: f.onlineOk,
    message: cleanText(f.message), contact: cleanText(firstContact(f) || f.contact), expiresInDays: Number(f.expiresInDays),
    ...(f.languages?.length ? { languages: f.languages.slice(0, 5) } : {}), ...(f.playHours?.length ? { playHours: f.playHours.slice(0, 5) } : {}),
    ...(chosenContacts(f) ? { contacts: chosenContacts(f) } : {}),
    ...(f.kind === "looking_for_player" && f.teamProfileId ? { teamProfileId: f.teamProfileId } : {}),
  };
}

/** The contacts typed in the matching form, kind -> handle, or null when none was typed. */
export function chosenContacts(f: Pick<CreateForm, "contacts">): Record<string, string> | null {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(f.contacts ?? {})) if (v.trim()) out[k] = cleanText(v);
  return Object.keys(out).length ? out : null;
}
export const firstContact = (f: Pick<CreateForm, "contacts">): string => Object.values(chosenContacts(f) ?? {})[0] ?? "";
