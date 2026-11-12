/**
 * Pure rules and wording for the club screens (Phase 2a-ii). No network and no React, so the unit tests can run them directly.
 * Words in the UI: "your club". The personal organisation is never named. Roles in a club are "admin" and "member".
 */
import type { AppContext, OrgRole } from "./api/context";
export type { OrgRole };

export type ContextOrg = AppContext["orgs"][number];

export const CAP = { read: "org.read", people: "org.people.manage", events: "org.events.create", audit: "org.audit.read" } as const;

/** The club screens exist only when the server said so AND the person belongs to a team organisation. Anything else: today's app. */
export const teamOrgOf = (ctx: AppContext | undefined | null): ContextOrg | null =>
  ctx && ctx.features.teamOrgs ? ctx.orgs.find((o) => o.kind === "team" && o.status !== "pending_deletion") ?? null : null;

/** True when the flag is on and the only organisation is the person's own (the "Make it a club" offer). */
export const personalOnly = (ctx: AppContext | undefined | null): boolean =>
  !!ctx && ctx.features.teamOrgs && !ctx.orgs.some((o) => o.kind === "team") && ctx.orgs.some((o) => o.kind === "personal");

export type OrgNav = { label: string; href: string } | null;
/** The one extra navigation entry, or null (then the navigation is exactly today's). */
export function orgNav(ctx: AppContext | undefined | null): OrgNav {
  if (!ctx || !ctx.features.teamOrgs) return null;
  if (teamOrgOf(ctx)) return { label: "Your club", href: "/app/org/" };
  return personalOnly(ctx) ? { label: "Make it a club", href: "/app/org/convert/" } : null;
}

export const can = (org: Pick<ContextOrg, "caps"> | null | undefined, cap: string): boolean => !!org && org.caps.includes(cap);

// ---- API shapes (see docs/ecosystem/org-api.md) ----
export interface OrgDetail { id: string; name: string; kind: string; status: string; role: OrgRole; caps: string[]; createdAt: string; counts: { members: number; events: number } }
export interface OrgMember { userId: string; name: string; email: string | null; role: OrgRole; addedAt: string; isYou: boolean }
export interface OrgMembers { role: OrgRole; members: OrgMember[] }
export interface OrgInvitation { id: string; email: string; role: OrgRole; createdAt: string; expiresAt: string; expired: boolean; invitedBy: string }
export interface CreatedInvitation { id: string; email: string; role: OrgRole; createdAt: string; expiresAt: string; token: string; link: string }
export interface NeedsYou { pendingResults: number; pendingRegistrations: number; teamsNotReady: number }
export interface OrgEventRow { id: string; key: string; name: string; game: string; date: string; startsOn: string | null; createdAt: string; createdBy: string; group: "live" | "upcoming" | "past" | "undated"; needsYou: NeedsYou }
export interface OrgEvents { org: { id: string; name: string; kind: string; role: OrgRole }; today: string; groups: Record<"live" | "upcoming" | "past" | "undated", number>; total: number; needsYou: NeedsYou; events: OrgEventRow[]; next: string | null }
export interface AuditEntry { id: string; at: string; actorType: string; actorId: string | null; eventId: string | null; action: string; targetType: string | null; targetId: string | null; reasonCode: string | null; meta: unknown }
export interface ConvertPreview { orgId: string; eventCount: number; sentence: string; primaryButton: string; secondaryButton: string }

// ---- the person's own day, for GET /orgs/:id/events?today= ----
export const localDay = (d = new Date()): string => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// ---- people: who may do what ----
export interface MemberActions { changeRole: OrgRole | null; remove: boolean; leave: boolean; leaveBlocked: boolean }

/**
 * What each row offers. Only an admin changes roles or removes others; nobody changes their own role (the server answers self_role_change);
 * anyone may leave, but the only admin may not (sole_owner) until another admin exists. `changeRole` is the role the button would give.
 */
export function memberActions(viewerRole: OrgRole, target: OrgMember, members: OrgMember[]): MemberActions {
  const admins = members.filter((m) => m.role === "admin").length;
  const you = target.isYou;
  const leaveBlocked = you && target.role === "admin" && admins <= 1;
  return {
    changeRole: viewerRole === "admin" && !you ? (target.role === "admin" ? "member" : "admin") : null,
    remove: viewerRole === "admin" && !you,
    leave: you,
    leaveBlocked,
  };
}

export const LAST_ADMIN_HINT = "You are the only admin of this club. Make someone else an admin first, then you can leave.";

export const roleLabel = (r: OrgRole): string => (r === "admin" ? "Admin" : "Member");
export const ROLE_EXPLAIN: Record<OrgRole, string> = {
  admin: "Admins can invite and remove people, change roles, and see the activity log, as well as everything members can do.",
  member: "Members can see the club and its events and create events. They cannot manage people.",
};

/** The sentence that asks before a role changes. Making someone an admin is the escalation, so it says what that gives. */
export function roleChangeQuestion(name: string, to: OrgRole): string {
  return to === "admin"
    ? `Make ${name} an admin? They will be able to invite and remove people, change roles and see the activity log.`
    : `Make ${name} a member? They will no longer be able to manage people or see the activity log.`;
}
export const removeQuestion = (name: string, wasAdmin: boolean): string =>
  `Remove ${name} from your club?${wasAdmin ? " They are an admin." : ""} They lose access to the club's events on their very next action. Events they created stay with the club.`;
export const leaveQuestion = "Leave this club? You lose access to its events straight away. An admin would have to invite you again.";

// ---- plain errors ----
interface Err { status?: number; serverError?: string; detail?: { code?: string } }
const codeOf = (e: unknown): string | undefined => (e as Err | null)?.detail?.code;
const statusOf = (e: unknown): number | undefined => (e as Err | null)?.status;
const said = (e: unknown): string | undefined => { const s = (e as Err | null)?.serverError; return typeof s === "string" && s.trim() ? s.trim() : undefined; };

/** One place that turns the club API's refusals into sentences a person can act on. The server's own sentence wins when it sent one. */
export function orgError(e: unknown, what: "people" | "invite" | "convert" | "read" | "leave" | "revoke" = "read"): string {
  const code = codeOf(e), status = statusOf(e);
  if (code === "org_suspended") return "This club is paused, so changes are switched off for now. You can still look at everything.";
  if (code === "self_role_change") return "You cannot change your own role. Ask another admin.";
  if (code === "last_admin") return "A club needs at least one admin. Make someone else an admin first.";
  if (code === "sole_owner") return said(e) ?? "You are the only admin of this club. Hand over the club first: make someone else an admin, then leave.";
  if (code === "limit_reached") return said(e) ?? "This club has reached its limit of 50 people, or that person is already in 10 clubs.";
  if (code === "already_club") return "This is already a club.";
  if (code === "not_sole_member") return "Other people already share your events, so this space cannot be turned into a club. Ask them to ask you to invite them instead.";
  if (status === 429) return "Too many tries. Wait a few minutes and try again.";
  if (status === 404) return what === "revoke" ? "That invitation is already gone. Refresh the list." : "That was not found. It may have been removed, or you may not belong to this club any more.";
  if (status === 403) return said(e) ?? "Only a club admin can do that.";
  if (status === 400) return said(e) ?? (what === "invite" ? "Check the email address and try again." : "The server did not accept that. Check what you typed.");
  if (typeof status === "number" && status >= 500) return "The server had a problem. Try again in a moment.";
  if (typeof status === "number") return said(e) ?? "The server did not accept that.";
  return "Could not reach the server. Check your connection.";
}

/** Errors from POST /me/invitations/accept. `verify` means the page should offer to send the verification email. */
export function acceptError(e: unknown): { text: string; verify: boolean; tryOtherAccount: boolean } {
  const code = codeOf(e), status = statusOf(e), server = said(e);
  switch (code) {
    case "email_unverified": return { text: server ?? "Verify your email address first, then open this link again.", verify: true, tryOtherAccount: false };
    case "wrong_email": return { text: server ?? "This invitation was sent to a different email address. Sign in with that address, or ask your admin to invite the one you use.", verify: false, tryOtherAccount: true };
    case "invitation_expired": return { text: server ?? "This invitation has expired (they last 7 days). Ask your admin to send a new one.", verify: false, tryOtherAccount: false };
    case "invitation_used": return { text: server ?? "This invitation has already been used. If that was you, it worked: open the app.", verify: false, tryOtherAccount: false };
    case "limit_reached": return { text: server ?? "This club is full, or you are already in 10 clubs.", verify: false, tryOtherAccount: false };
    case "invitation_invalid": return { text: server ?? "This invitation is not valid. It may have been cancelled. Ask your admin to send a new one.", verify: false, tryOtherAccount: false };
    default: break;
  }
  if (status === 429) return { text: "Too many tries. Wait a few minutes and try again.", verify: false, tryOtherAccount: false };
  if (status === 404) return { text: "This invitation is not valid. It may have been cancelled. Ask your admin to send a new one.", verify: false, tryOtherAccount: false };
  if (typeof status === "number" && status >= 500) return { text: "The server had a problem. Try again in a moment.", verify: false, tryOtherAccount: false };
  return { text: typeof status === "number" ? server ?? "The server did not accept that invitation." : "Could not reach the server. Check your connection.", verify: false, tryOtherAccount: false };
}

/** Where the person goes after accepting. */
export function acceptedNext(r: { kind?: string; orgId?: string; eventId?: string }): { href: string; label: string } {
  if (r.kind === "event" && r.eventId) return { href: `/app/events/?id=${encodeURIComponent(r.eventId)}`, label: "Open the event" };
  return { href: "/app/org/", label: "Open your club" };
}
export const acceptedText = (r: { kind?: string; role?: string }): string =>
  r.kind === "event"
    ? r.role === "owner" ? "You already own this event, so nothing changed." : "You now have access to the event."
    : r.role === "admin" ? "You joined the club as an admin." : "You joined the club.";

// ---- invitations ----
export const validEmail = (s: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim()) && s.trim().length <= 254;

const DAY = 86_400_000;
/** "6 days left", "less than a day left" or "expired". `now` is injectable for tests. */
export function expiryText(expiresAt: string, expired: boolean, now = Date.now()): string {
  const left = new Date(expiresAt).getTime() - now;
  if (expired || !(left > 0)) return "Expired";
  const d = Math.floor(left / DAY);
  return d >= 1 ? `${d} day${d === 1 ? "" : "s"} left` : "Less than a day left";
}

// ---- convert ----
export const CLUB_NAME_MAX = 80;
export const clubNameProblem = (n: string): string | null => {
  const t = n.trim();
  if (!t) return "Type the name of your club, college or cafe.";
  if (t.length > CLUB_NAME_MAX) return `Use at most ${CLUB_NAME_MAX} characters.`;
  return null;
};

// ---- activity ----
const ACTIONS: Record<string, string> = {
  "org.converted": "{actor} turned this space into a club",
  "invitation.created": "{actor} invited someone",
  "invitation.accepted": "{actor} accepted an invitation",
  "invitation.revoked": "{actor} cancelled an invitation",
  "member.added": "{target} joined the club",
  "member.role_changed": "{actor} changed the role of {target}",
  "member.removed": "{actor} removed {target}",
  "member.left": "{actor} left the club",
  "event.guest_added": "{actor} added a guest to an event",
};
/** One plain line for an audit row. Only ids are stored, so names come from the member list; a person who has left is "someone who left". */
export function auditLine(e: AuditEntry, names: Record<string, string>): string {
  const who = (id: string | null) => (id ? names[id] ?? "Someone who has left" : "The system");
  const actor = e.actorType === "system" ? "The system" : who(e.actorId);
  const target = e.targetType === "user" ? who(e.targetId) : "someone";
  const tpl = ACTIONS[e.action];
  if (!tpl) return `${actor}: ${e.action}`;
  return tpl.replace("{actor}", actor).replace("{target}", target);
}

// ---- export and deletion (OD-Z) ----
export const EXPORT_CONTAINS = "Your name and email, your clubs and roles, your events (name, game, date, venue and counts), your brand kits and your team pages.";
export const EXPORT_NOT_CONTAINS_FALLBACK = "Rosters, photos, registrations, proofs, contact messages, your password.";
export const exportFileName = (d = new Date()): string => `esports-hub-my-data-${d.toISOString().slice(0, 10)}.json`;

export interface DeletionPreview { events: { deleted: { id: string; name: string }[]; deletedCount: number; needsTypedCount: boolean; handedOver: { id: string; name: string; newOwnerName: string }[]; conflicts: { id: string; name: string; newOwnerName: string }[]; needDeleteConfirmation: { id: string; name: string }[]; tooManyShared: boolean }; clubs: { blocking: { id: string; name: string }[]; deletedWithAccount: number } }

export const deletionSentence = (n: number): string => `Deleting your account will delete ${n} ${n === 1 ? "event" : "events"} and everything in ${n === 1 ? "it" : "them"}.`;

/** The plain lines shown above the delete button. Empty when there is nothing to warn about beyond the usual text. */
export function deletionLines(p: DeletionPreview): string[] {
  const out: string[] = [];
  const n = p.events.deletedCount;
  if (n > 0) out.push(deletionSentence(n));
  if (p.events.handedOver.length) out.push(`${p.events.handedOver.length} ${p.events.handedOver.length === 1 ? "event goes" : "events go"} to a co-organiser instead: ${p.events.handedOver.slice(0, 5).map((e) => `${e.name} (to ${e.newOwnerName})`).join(", ")}.`);
  if (p.clubs.blocking.length) out.push(`You are the only admin of ${p.clubs.blocking.map((c) => c.name).join(", ")}, and other people use it. Hand it over first (People page), then delete your account.`);
  if (p.events.conflicts.length) out.push(`${p.events.conflicts[0]!.newOwnerName} cannot take over ${p.events.conflicts[0]!.name} yet, so nothing can be deleted until that is sorted out.`);
  if (p.events.tooManyShared) out.push("You share more than 50 events with other organisers. Remove some co-organisers or delete some events first.");
  return out;
}

/** The number the person must type when more than 20 events would go. Empty string when no typing is needed. */
export const typedCountNeeded = (p: DeletionPreview | undefined): number | null => (p && p.events.needsTypedCount ? p.events.deletedCount : null);
export const typedCountOk = (typed: string, need: number | null): boolean => need === null || (/^\d{1,6}$/.test(typed.trim()) && Number(typed.trim()) === need);

// ---- the organisation select on event creation and copy ----
export interface OrgChoice { value: string; label: string }
/**
 * Options for "Where does this event live?". Empty (select hidden) unless the flag is on and a club exists. `value: ""` means send no orgId
 * (the server's default: the person's own space, or for a copy, the source event's club). A converted person has no separate personal
 * space, so the club is the default and a single option is not worth a select.
 */
export function orgChoices(ctx: AppContext | undefined | null, defaultLabel: string): OrgChoice[] {
  if (!ctx || !ctx.features.teamOrgs) return [];
  const teams = ctx.orgs.filter((o) => o.kind === "team" && o.status === "active" && can(o, CAP.events));
  if (!teams.length) return [];
  const hasPersonal = ctx.orgs.some((o) => o.kind === "personal");
  const opts: OrgChoice[] = [{ value: "", label: defaultLabel }, ...teams.map((t) => ({ value: t.id, label: t.name }))];
  return hasPersonal || teams.length > 1 ? opts : [];
}
/** orgId to send: only a value that is one of the offered options, and never empty. */
export const chosenOrgId = (value: string, options: OrgChoice[]): string | undefined => (value && options.some((o) => o.value === value) ? value : undefined);

// ---- registration acknowledgement ----
export interface Ack { version: string; text: string }
/** The tick is needed when the server offered wording and this form has no stored acknowledgement yet. Absent wording means today's behaviour. */
export const ackRequired = (ack: Ack | null | undefined, form: { ackAt?: string | null } | null | undefined): boolean => !!ack && typeof ack.text === "string" && ack.text.length > 0 && !form?.ackAt;
