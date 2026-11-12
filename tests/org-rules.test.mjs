// Run: node --import tsx --test tests/org-*.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import {
  orgNav, teamOrgOf, personalOnly, memberActions, orgError, acceptError, acceptedNext, acceptedText, validEmail, expiryText, clubNameProblem,
  auditLine, deletionSentence, deletionLines, typedCountNeeded, typedCountOk, orgChoices, chosenOrgId, ackRequired, roleChangeQuestion, can, CAP, exportFileName, localDay,
} from "../src/lib/org.ts";
import { normaliseContext, safeOrgRole } from "../src/lib/api/context.ts";

const admin = { userId: "a", name: "Asha", email: "a@x.in", role: "admin", addedAt: "", isYou: true };
const bob = { userId: "b", name: "Bob", email: "b@x.in", role: "member", addedAt: "", isYou: false };
const cat = { userId: "c", name: "Cat", email: null, role: "admin", addedAt: "", isYou: false };

const ctx = (over = {}) => normaliseContext({ user: { id: "u", email: "u@x.in", emailVerified: true }, orgs: [], features: { teamOrgs: true }, ...over });
const team = { id: "org-t", name: "Chess Club", kind: "team", status: "active", role: "admin", caps: ["org.read", "org.people.manage", "org.events.create", "org.audit.read"] };
const personal = { id: "org-p", name: "x", kind: "personal", status: "active", role: "admin", caps: ["org.read", "org.people.manage", "org.events.create", "org.audit.read"] };

test("navigation: no entry unless the flag is on; club or offer otherwise", () => {
  assert.equal(orgNav(undefined), null);
  assert.equal(orgNav(normaliseContext(null)), null);
  assert.equal(orgNav(ctx({ features: { teamOrgs: false }, orgs: [team] })), null);
  assert.equal(orgNav(ctx({ orgs: [personal] })).href, "/app/org/convert/");
  assert.equal(orgNav(ctx({ orgs: [personal, team] })).href, "/app/org/");
  assert.equal(orgNav(ctx({ orgs: [] })), null);
  assert.equal(teamOrgOf(ctx({ features: { teamOrgs: false }, orgs: [team] })), null);
  assert.equal(personalOnly(ctx({ orgs: [personal, team] })), false);
});

test("context: org roles are admin or member; unknown is member, never admin", () => {
  assert.equal(safeOrgRole("admin"), "admin");
  for (const r of [undefined, null, "owner", "Admin", "root", 1]) assert.equal(safeOrgRole(r), "member");
  const c = ctx({ orgs: [{ id: "o", kind: "team", role: "weird" }, team] });
  assert.deepEqual(c.orgs.map((o) => o.orgRole), ["member", "admin"]);
  assert.equal(c.orgs[0].status, "active");
  assert.equal(can(c.orgs[0], CAP.people), false);
  assert.equal(can(c.orgs[1], CAP.audit), true);
});

test("people: only admins change roles or remove, nobody changes their own role, the last admin cannot leave", () => {
  const all = [admin, bob, cat];
  assert.deepEqual(memberActions("admin", bob, all), { changeRole: "admin", remove: true, leave: false, leaveBlocked: false });
  assert.deepEqual(memberActions("admin", cat, all), { changeRole: "member", remove: true, leave: false, leaveBlocked: false });
  assert.deepEqual(memberActions("admin", admin, all), { changeRole: null, remove: false, leave: true, leaveBlocked: false });
  assert.equal(memberActions("admin", admin, [admin, bob]).leaveBlocked, true);
  const me = { ...bob, isYou: true };
  assert.deepEqual(memberActions("member", me, [admin, me]), { changeRole: null, remove: false, leave: true, leaveBlocked: false });
  const other = { ...admin, isYou: false };
  assert.deepEqual(memberActions("member", other, [other, me]), { changeRole: null, remove: false, leave: false, leaveBlocked: false });
  assert.match(roleChangeQuestion("Bob", "admin"), /invite and remove people/);
});

test("errors: plain sentences, the server's own wording wins, codes map", () => {
  const e = (status, code, serverError) => ({ status, serverError, detail: code ? { code } : undefined });
  assert.match(orgError(e(409, "last_admin")), /at least one admin/);
  assert.match(orgError(e(403, "self_role_change")), /your own role/);
  assert.equal(orgError(e(409, "sole_owner", "You are the only admin of this club. Hand over the club first: make someone else an admin, then leave.")), "You are the only admin of this club. Hand over the club first: make someone else an admin, then leave.");
  assert.match(orgError(e(403, "org_suspended")), /paused/);
  assert.match(orgError(e(404)), /not found/i);
  assert.match(orgError(e(404), "revoke"), /already gone/);
  assert.match(orgError(e(429)), /Too many/);
  assert.match(orgError({}), /Could not reach/);
  assert.match(orgError(e(500)), /server had a problem/);
  assert.doesNotMatch(orgError(e(409, "not_sole_member")), /workspace|space\b.*org/i);
});

test("accept: every refusal has plain words and the right next action", () => {
  const e = (status, code, serverError) => ({ status, serverError, detail: { code } });
  const un = acceptError(e(403, "email_unverified"));
  assert.equal(un.verify, true);
  assert.match(un.text, /Verify your email/);
  const wrong = acceptError(e(403, "wrong_email", "This invitation was sent for j***@gmail.com. Sign in with that address, or ask your admin to invite the one you use."));
  assert.equal(wrong.tryOtherAccount, true);
  assert.match(wrong.text, /j\*\*\*@gmail\.com/);
  assert.match(acceptError(e(409, "invitation_expired")).text, /expired/);
  assert.match(acceptError(e(409, "invitation_used")).text, /already been used/);
  assert.match(acceptError(e(404, "invitation_invalid")).text, /not valid/);
  assert.match(acceptError(e(409, "limit_reached")).text, /full|10 clubs/);
  assert.match(acceptError({ status: 404 }).text, /not valid/);
  assert.match(acceptError({}).text, /Could not reach/);
  assert.deepEqual(acceptedNext({ kind: "org", orgId: "o" }), { href: "/app/org/", label: "Open your club" });
  assert.match(acceptedNext({ kind: "event", eventId: "e 1" }).href, /id=e%201$/);
  assert.match(acceptedText({ kind: "event", role: "owner" }), /already own/);
});

test("invite: email check and expiry wording", () => {
  assert.equal(validEmail("a@b.co"), true);
  for (const b of ["", "a@b", "a b@c.d", "@x.y", "a@@b.c"]) assert.equal(validEmail(b), false, b);
  const now = Date.parse("2026-12-01T00:00:00Z");
  assert.equal(expiryText("2026-12-07T00:00:00Z", false, now), "6 days left");
  assert.equal(expiryText("2026-12-02T00:00:00Z", false, now), "1 day left");
  assert.equal(expiryText("2026-12-01T10:00:00Z", false, now), "Less than a day left");
  assert.equal(expiryText("2026-12-09T00:00:00Z", true, now), "Expired");
  assert.equal(expiryText("2026-11-30T00:00:00Z", false, now), "Expired");
});

test("convert: name rules (1 to 80 characters)", () => {
  assert.ok(clubNameProblem(""));
  assert.ok(clubNameProblem("   "));
  assert.equal(clubNameProblem("Chess Club"), null);
  assert.equal(clubNameProblem("x".repeat(80)), null);
  assert.ok(clubNameProblem("x".repeat(81)));
});

test("activity: ids become names, a person who left stays plain, unknown actions never crash", () => {
  const names = { a: "You", b: "Bob" };
  assert.equal(auditLine({ action: "member.removed", actorType: "user", actorId: "a", targetType: "user", targetId: "b" }, names), "You removed Bob");
  assert.equal(auditLine({ action: "member.left", actorType: "user", actorId: "zz", targetType: null, targetId: null }, names), "Someone who has left left the club");
  assert.equal(auditLine({ action: "org.converted", actorType: "user", actorId: "a" }, names), "You turned this space into a club");
  assert.equal(auditLine({ action: "member.added", actorType: "system", actorId: null, targetType: "user", targetId: "b" }, names), "Bob joined the club");
  assert.match(auditLine({ action: "future.thing", actorType: "user", actorId: "a" }, names), /future\.thing/);
});

test("deletion preview: plain count, singular, blocking club, typed number", () => {
  assert.equal(deletionSentence(3), "Deleting your account will delete 3 events and everything in them.");
  assert.equal(deletionSentence(1), "Deleting your account will delete 1 event and everything in it.");
  const p = (over = {}) => ({ events: { deleted: [], deletedCount: 0, needsTypedCount: false, handedOver: [], conflicts: [], needDeleteConfirmation: [], tooManyShared: false, ...over.events }, clubs: { blocking: [], deletedWithAccount: 0, ...over.clubs } });
  assert.deepEqual(deletionLines(p()), []);
  assert.match(deletionLines(p({ events: { deletedCount: 2 } }))[0], /2 events/);
  assert.match(deletionLines(p({ clubs: { blocking: [{ id: "o", name: "Chess Club" }] } }))[0], /only admin of Chess Club/);
  assert.equal(typedCountNeeded(p({ events: { deletedCount: 25, needsTypedCount: true } })), 25);
  assert.equal(typedCountNeeded(p({ events: { deletedCount: 25 } })), null);
  assert.equal(typedCountNeeded(undefined), null);
  assert.equal(typedCountOk("", null), true);
  assert.equal(typedCountOk("25", 25), true);
  assert.equal(typedCountOk(" 25 ", 25), true);
  assert.equal(typedCountOk("24", 25), false);
  assert.equal(typedCountOk("", 25), false);
  assert.equal(typedCountOk("25abc", 25), false);
});

test("export: file name carries the date only", () => {
  assert.equal(exportFileName(new Date("2026-11-12T10:00:00Z")), "esports-hub-my-data-2026-11-12.json");
  assert.match(localDay(new Date(2026, 0, 5)), /^2026-01-05$/);
});

test("orgId is offered only to people who belong to a club and have a real choice", () => {
  assert.deepEqual(orgChoices(undefined, "x"), []);
  assert.deepEqual(orgChoices(ctx({ features: { teamOrgs: false }, orgs: [personal, team] }), "x"), []);
  assert.deepEqual(orgChoices(ctx({ orgs: [personal] }), "x"), []);
  assert.deepEqual(orgChoices(ctx({ orgs: [team] }), "x"), []); // converted: the club is the default, nothing to choose
  const opts = orgChoices(ctx({ orgs: [personal, team] }), "Just me");
  assert.deepEqual(opts.map((o) => o.value), ["", "org-t"]);
  assert.equal(chosenOrgId("", opts), undefined);
  assert.equal(chosenOrgId("org-t", opts), "org-t");
  assert.equal(chosenOrgId("org-evil", opts), undefined);
  assert.equal(orgChoices(ctx({ orgs: [personal, { ...team, status: "suspended" }] }), "x").length, 0);
});

test("acknowledgement: needed only when the server offers wording and the form has none stored", () => {
  const ack = { version: "interim-1", text: "I confirm." };
  assert.equal(ackRequired(undefined, null), false);
  assert.equal(ackRequired(null, { ackAt: null }), false);
  assert.equal(ackRequired({ version: "v", text: "" }, null), false);
  assert.equal(ackRequired(ack, null), true);
  assert.equal(ackRequired(ack, { ackAt: null }), true);
  assert.equal(ackRequired(ack, { ackAt: "2026-11-01T00:00:00Z" }), false);
});
