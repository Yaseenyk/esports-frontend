/** Pure helpers for email reminders: templates, scheduling, masking and the daily budget in words. No network, no React. */

export type TemplateId = "tomorrow" | "closing" | "results" | "custom";
export type Audience = "organiser" | "captain" | "both";

export interface TemplateContext { eventName: string; date?: string; venue?: string }
export interface Template { id: TemplateId; title: string; blurb: string; render: (c: TemplateContext) => { subject: string; body: string } }

/** The wording captains agree to on the registration form. The server stores this text with the time they ticked the box. */
export const CONSENT_TEXT = "Email me updates about this event. I agree that Esports Hub may email me about this event only, such as a reminder before it starts and the results. Every email has an unsubscribe link.";

const when = (c: TemplateContext) => [c.date, c.venue].filter(Boolean).join(", ");
const clean = (s: string) => s.replace(/\s+/g, " ").trim();

export const TEMPLATES: Template[] = [
  {
    id: "tomorrow", title: "Starts tomorrow", blurb: "A short reminder the day before.",
    render: (c) => ({ subject: `${clean(c.eventName)} starts tomorrow`, body: `Hello,\n\nThis is a reminder that ${clean(c.eventName)} starts tomorrow${when(c) ? ` (${when(c)})` : ""}.\n\nPlease arrive on time and bring what you need to check in. If something has changed for your team, tell the organiser as soon as you can.\n\nSee you there.` }),
  },
  {
    id: "closing", title: "Registration closes soon", blurb: "Nudge teams to finish signing up.",
    render: (c) => ({ subject: `Registration for ${clean(c.eventName)} closes soon`, body: `Hello,\n\nRegistration for ${clean(c.eventName)} closes soon. If your team has not finished signing up, please do it now so your place is not lost.\n\nIf you have already registered, you do not need to do anything.` }),
  },
  {
    id: "results", title: "Results are up", blurb: "Tell everyone the results are ready.",
    render: (c) => ({ subject: `Results are up for ${clean(c.eventName)}`, body: `Hello,\n\nThe results of ${clean(c.eventName)} are ready. Thank you to every team for playing.\n\nAsk the organiser if you want to see the final standings.` }),
  },
  {
    id: "custom", title: "Custom message", blurb: "Write your own short message.",
    render: (c) => ({ subject: `A message about ${clean(c.eventName)}`, body: "Hello,\n\n" }),
  },
];

export const templateById = (id: TemplateId): Template => TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[TEMPLATES.length - 1]!;

// ---- checks that mirror the server, so the form can explain a problem before sending ----
const LINK_RE = /https?:\/\/|www\.|mailto:/i;
export const SUBJECT_MAX = 120;
export const BODY_MAX = 2000;

export function checkMessage(subject: string, body: string): string | null {
  const s = subject.trim(), b = body.trim();
  if (s.length < 3) return "Write a subject of at least 3 characters.";
  if (s.length > SUBJECT_MAX) return `The subject can be at most ${SUBJECT_MAX} characters.`;
  if (/[\r\n]/.test(s)) return "The subject must be a single line.";
  if (b.length < 5) return "Write a message of at least 5 characters.";
  if (b.length > BODY_MAX) return `The message can be at most ${BODY_MAX} characters.`;
  if (LINK_RE.test(s) || LINK_RE.test(b)) return "Links are not allowed in reminders. Every email already has an unsubscribe link.";
  return null;
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/** a***@gmail.com */
export function maskEmail(email: string): string {
  const at = email.lastIndexOf("@");
  if (at < 1) return "***";
  return `${email[0]}***${email.slice(at)}`;
}

/** What the email will look like as plain text, for the preview. Matches the server footer. */
export function previewText(subject: string, body: string, eventName: string): string {
  return `Subject: ${subject.replace(/[\r\n]+/g, " ").trim()}\n\n${body.trim()}\n\n--\nYou get this email because you chose email updates about ${eventName}.\nUnsubscribe from this event: (a personal link goes here)`;
}

// ---- scheduling ----
/** The value of a <input type="datetime-local"> ("2026-12-01T09:30", the person's own clock) as an ISO time, or null when it is empty or not a date. */
export function localInputToIso(v: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** "Tue 1 Dec 2026, 9:30 am" in the viewer's local time, with the time zone name so nobody has to guess. */
export function localTimeText(iso: string, tz?: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const text = d.toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: tz });
  const name = new Intl.DateTimeFormat("en", { timeZoneName: "short", timeZone: tz }).formatToParts(d).find((p) => p.type === "timeZoneName")?.value ?? "";
  return name ? `${text} (${name})` : text;
}

export const MAX_AHEAD_DAYS = 90;
/** null when the time can be scheduled, otherwise the sentence to show. */
export function checkSendAt(iso: string | null, now = Date.now()): string | null {
  if (iso === null) return "Pick a date and time, or choose Send now.";
  const t = Date.parse(iso);
  if (t < now - 5 * 60_000) return "That time has already passed. Pick a time in the future.";
  if (t > now + MAX_AHEAD_DAYS * 86_400_000) return `Pick a time within ${MAX_AHEAD_DAYS} days.`;
  return null;
}

/** Minimum value for a datetime-local input: now, rounded up to the next minute, in the person's own clock. */
export function nowLocalInput(now = new Date()): string {
  const d = new Date(now.getTime() + 60_000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

// ---- budget maths and words ----
export interface Limits { dayLimit: number; eventDayLimit: number; sentToday: number; eventSentToday: number; remainingToday: number }

/** How many emails can still go out today for this event. */
export const remainingToday = (l: Limits) => Math.max(0, Math.min(l.dayLimit - l.sentToday, l.eventDayLimit - l.eventSentToday));

/** The daily limit in plain words. */
export function limitWords(l: Limits): string {
  const left = remainingToday(l);
  const base = `The free email plan allows about ${l.dayLimit} emails a day across Esports Hub, and ${l.eventDayLimit} a day for one event.`;
  if (left === 0) return `${base} Today's limit has been reached, so nothing more goes out until midnight UTC (5:30 am India time). Reminders that are due wait and go out after that.`;
  return `${base} ${l.sentToday} ${l.sentToday === 1 ? "has" : "have"} been sent today across the site, so up to ${left} more can go out for this event today.`;
}

/** A warning when the chosen audience is too big for one day, otherwise null. */
export function audienceWarning(count: number, l: Limits): string | null {
  if (count === 0) return "Nobody would get this. Captains are emailed only if they gave an address and agreed when they registered.";
  if (count > l.eventDayLimit) return `That is ${count} people, but one event can send at most ${l.eventDayLimit} emails a day. Choose fewer people.`;
  return null;
}

/** How many people will get it, from the two checkboxes. */
export function audienceCount(counts: { organisers: number; captains: number }, who: { organisers: boolean; captains: boolean }): number {
  return (who.organisers ? counts.organisers : 0) + (who.captains ? counts.captains : 0);
}

export function audienceOf(who: { organisers: boolean; captains: boolean }): Audience | null {
  return who.organisers && who.captains ? "both" : who.organisers ? "organiser" : who.captains ? "captain" : null;
}

export type JobStatus = "pending" | "sending" | "sent" | "cancelled" | "failed";
export function statusLabel(s: string): string {
  return ({ pending: "Waiting to be sent", sending: "Going out now", sent: "Sent", cancelled: "Cancelled", failed: "Could not be sent" } as Record<string, string>)[s] ?? s;
}
export const audienceLabel = (a: string) => (a === "organiser" ? "Organisers" : a === "captain" ? "Captains who agreed" : "Organisers and captains who agreed");
