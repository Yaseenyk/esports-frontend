// Esports Resume and Disputes: validators, adapters (private fields never reach props), the evidence shrink loop and its sizing rules.
import test from "node:test";
import assert from "node:assert/strict";
import { canChoose, checkSlug, rankLabel, gameBody, profileBody, splitLanguages, toRankCode, validateGame, validateProfile } from "../src/features/resume/validators.ts";
import { toOwnResume, toPublicProfile } from "../src/features/resume/services/resume.adapter.ts";
import { COPY, COPY_IS_DRAFT } from "../src/features/resume/copy.ts";
import { toDetail, toList, toPermissions } from "../src/features/disputes/services/dispute.adapter.ts";
import { cleanToken, raiseBody, validateNote, validateRaise } from "../src/features/disputes/validators.ts";
import { ACCEPTED_TYPES, checkInput, fitDimensions, MAX_BYTES, MAX_FILES, planAttempts, shrinkToLimit, slotsLeft } from "../src/features/disputes/evidence.ts";
import { eventText, statusLabel } from "../src/features/disputes/domain.ts";

const LEAK = { userId: "u1", email: "a@b.c", discordId: "d1", resumeConsentAt: "2030-01-01T00:00:00Z", adultConfirmedAt: "2030-01-01T00:00:00Z", visibility: "public" };

test("resume slug rules", () => {
  assert.equal(checkSlug("ravi-igl"), "");
  for (const s of ["ab", "-abc", "abc-", "a b c", "a--b", "x".repeat(61), "café"]) assert.notEqual(checkSlug(s), "", s);
});
test("resume profile validation", () => {
  const f = { slug: "ravi-igl", handle: "RaviIGL", bio: "", city: "Pune", state: "Maharashtra", languages: "Hindi, English" };
  assert.deepEqual(validateProfile(f, true), {});
  assert.ok(validateProfile({ ...f, handle: "R" }, true).handle);
  assert.ok(validateProfile({ ...f, bio: "x".repeat(401) }, true).bio);
  assert.ok(validateProfile({ ...f, languages: "a,b,c,d,e,f,g" }, true).languages);
  assert.ok(validateProfile({ ...f, languages: "x".repeat(21) }, true).languages);
  assert.ok(validateProfile({ ...f, bio: "hi <b>" }, true).bio);
  assert.deepEqual(splitLanguages(" Hindi , ,English "), ["Hindi", "English"]);
  const body = profileBody({ ...f, bio: "  " }, true);
  assert.equal(body.bio, null);
  assert.deepEqual(body.languages, ["Hindi", "English"]);
});
test("resume game validation and rank code", () => {
  assert.equal(toRankCode("Diamond 3"), "diamond_3");
  assert.equal(toRankCode("  Conqueror!! "), "conqueror");
  assert.equal(toRankCode("x".repeat(40)).length, 24);
  const g = { game: "bgmi", inGameName: "Ravi", rankName: "Diamond 3", rankOrdinal: "17", roles: ["igl"] };
  assert.deepEqual(validateGame(g), {});
  assert.ok(validateGame({ ...g, game: "" }).game);
  assert.ok(validateGame({ ...g, rankName: "!!!" }).rankName);
  assert.ok(validateGame({ ...g, rankOrdinal: "101" }).rankOrdinal);
  assert.ok(validateGame({ ...g, rankOrdinal: "" }).rankOrdinal);
  assert.deepEqual(gameBody(g), { inGameName: "Ravi", rankCode: "diamond_3", rankOrdinal: 17, roles: ["igl"] });
});
test("rank is shown with a capital and the skill level, never as a rank step", () => {
  assert.equal(rankLabel("ace", 70), "Ace (skill level 70)");
  assert.equal(rankLabel("diamond_3", 17), "Diamond 3 (skill level 17)");
  assert.equal(rankLabel("", 0), "Unranked (skill level 0)");
});
test("resume copy: no slug jargon, one plain draft line", () => {
  assert.equal(JSON.stringify(COPY).toLowerCase().includes("slug"), false);
  assert.match(COPY.draftNotice, /^Draft wording/);
  assert.match(COPY.visibilityMakePublic, /public/i);
});
test("visibility: unlisted is never choosable; public needs 18+ and consent", () => {
  assert.equal(canChoose("private", false, false), true);
  assert.equal(canChoose("unlisted", true, true), false);
  assert.equal(canChoose("public", true, false), false);
  assert.equal(canChoose("public", false, true), false);
  assert.equal(canChoose("public", true, true), true);
});
test("consent wording lives in one file, is marked DRAFT, and says what becomes public and that it can be withdrawn", () => {
  assert.equal(COPY_IS_DRAFT, true);
  assert.ok(COPY.consentWhatBecomesPublic.length >= 4);
  assert.match(COPY.consentWithdraw, /withdraw this at any time/i);
  assert.match(COPY.consentNeverPublic, /email/i);
});
test("resume adapters: the public profile carries no private fields", () => {
  const p = toPublicProfile({ slug: "ravi-igl", handle: "RaviIGL", bio: null, city: "Pune", state: null, languages: ["Hindi"], games: [{ game: "bgmi", inGameName: "Ravi", rankCode: "diamond_3", rankOrdinal: 17, roles: ["igl"], userId: "u1" }], updatedAt: "2030-01-01T00:00:00Z", ...LEAK });
  const flat = JSON.stringify(p);
  for (const k of Object.keys(LEAK)) assert.equal(flat.includes(`"${k}"`), false, k);
  assert.equal(p.games[0].rankOrdinal, 17);
  assert.equal(toPublicProfile({}), null);
});
test("resume adapters: own resume reads consent times from the top level or the profile", () => {
  const a = toOwnResume({ profile: { slug: "ravi-igl", handle: "RaviIGL", visibility: "public", games: [], adultConfirmedAt: "2030-01-01T00:00:00Z", resumeConsentAt: "2030-01-02T00:00:00Z" } });
  assert.equal(a.profile.visibility, "public");
  assert.equal(a.resumeConsentAt, "2030-01-02T00:00:00Z");
  assert.equal(toOwnResume({ profile: null, adultConfirmedAt: null, resumeConsentAt: null }).profile, null);
  assert.equal(toOwnResume({ profile: { slug: "x-y-z", handle: "Hh", visibility: "weird" } }).profile.visibility, "private");
});

// ---- disputes ----
const D = { id: "d1", tournament: { slug: "gokte-cup-2026", title: "Gokte Cup 2026" }, type: "wrong_score", status: "under_review", summary: "The score was entered wrong", raisedByTeam: "Alpha Wolves", againstTeam: "Beta Hawks", matchId: null, matchNo: 2, outcome: null, resolutionNote: null, resolvedAt: null, dueAt: "2030-01-04T00:00:00Z", overdue: true, createdAt: "2030-01-01T00:00:00Z", updatedAt: "2030-01-02T00:00:00Z",
  events: [{ id: "e1", actorRole: "team", action: "raised", fromStatus: null, toStatus: "open", note: "The score was entered wrong", createdAt: "2030-01-01T00:00:00Z", userId: "u9" }],
  evidence: [{ id: "v1", mimeType: "image/png", sizeBytes: 183422, caption: null, createdAt: "2030-01-01T00:00:00Z", purged: false, purgeAfter: null, bytes: "AAAA" }],
  corrections: [{ matchRef: "br:2:Alpha Wolves", oldValue: { placement: 2, kills: 11 }, newValue: { placement: 1, kills: 11 } }],
  permissions: { canComment: true, canUploadEvidence: true, canWithdraw: false, transitions: ["under_review"], canResolve: false, role: "organiser" } };

test("dispute adapter: detail maps events, evidence, corrections and permissions; no user ids", () => {
  const d = toDetail({ ...D, raisedBy: "u1", ...LEAK });
  assert.equal(d.overdue, true);
  assert.equal(d.events.length, 1);
  assert.equal(d.evidence[0].sizeBytes, 183422);
  assert.deepEqual(d.corrections[0].newValue, { placement: 1, kills: 11 });
  const flat = JSON.stringify(d);
  for (const k of ["userId", "raisedBy", "email", "bytes"]) assert.equal(flat.includes(`"${k}"`), false, k);
  assert.equal(toDetail({}), null);
  assert.equal(toList({ items: [D, { x: 1 }] }).length, 1);
});
test("dispute adapter: missing permissions mean no permissions", () => {
  assert.deepEqual(toPermissions(undefined), { canComment: false, canUploadEvidence: false, canWithdraw: false, transitions: [], canResolve: false, role: "party" });
  assert.equal(toDetail({ ...D, permissions: undefined }).permissions.canResolve, false);
});
test("dispute labels", () => {
  assert.equal(statusLabel("evidence_requested"), "Evidence requested");
  assert.equal(eventText({ action: "status_resolved" }), "Status changed to Resolved");
  assert.equal(eventText({ action: "evidence_added" }), "Evidence added");
});
test("raise form validation and body", () => {
  const f = { slug: "gokte-cup-2026", type: "wrong_score", summary: "The score for match 2 was entered wrongly.", team: "", againstTeam: "", matchNo: "2" };
  assert.deepEqual(validateRaise(f), {});
  assert.ok(validateRaise({ ...f, slug: "A B" }).slug);
  assert.ok(validateRaise({ ...f, type: "" }).type);
  assert.ok(validateRaise({ ...f, summary: "short" }).summary);
  assert.ok(validateRaise({ ...f, summary: "x".repeat(1001) }).summary);
  assert.ok(validateRaise({ ...f, summary: "call me 9876543210 about it" }).summary);
  assert.deepEqual(raiseBody(f), { type: "wrong_score", summary: f.summary, matchNo: 2 });
  assert.equal(validateNote(""), "Write something first.");
  assert.equal(validateNote("fine"), "");
  assert.ok(validateNote("short", 10));
});
test("captain token: accepts a bare token or a whole link, refuses junk", () => {
  assert.equal(cleanToken("  abcDEF12_-xyz  ").token, "abcDEF12_-xyz");
  assert.equal(cleanToken("https://esports.streamerosai.com/pass/?t=abcDEF12_-xyz").token, "abcDEF12_-xyz");
  assert.ok(cleanToken("").error);
  assert.ok(cleanToken("short").error);
  assert.ok(cleanToken("has spaces and ! chars").error);
});

// ---- evidence sizing ----
test("evidence input rules: png, jpeg, webp only, not empty, not huge", () => {
  assert.deepEqual([...ACCEPTED_TYPES], ["image/png", "image/jpeg", "image/webp"]);
  assert.equal(checkInput({ name: "a.png", type: "image/png", size: 1000 }), "");
  assert.equal(checkInput({ name: "a.webp", type: "image/webp", size: 1000 }), "");
  assert.match(checkInput({ name: "a.gif", type: "image/gif", size: 1000 }), /PNG, JPEG or WebP/);
  assert.match(checkInput({ name: "a.pdf", type: "application/pdf", size: 1000 }), /PNG, JPEG or WebP/);
  assert.ok(checkInput({ name: "a.png", type: "image/png", size: 0 }));
  assert.ok(checkInput({ name: "a.png", type: "image/png", size: 16 * 1024 * 1024 }));
});
test("evidence limits: 400 KB, 4 files, slots left", () => {
  assert.equal(MAX_BYTES, 409600);
  assert.equal(MAX_FILES, 4);
  assert.equal(slotsLeft(0, 0), 4);
  assert.equal(slotsLeft(1, 2), 1);
  assert.equal(slotsLeft(3, 3), 0);
});
test("dimensions are fitted, never enlarged", () => {
  assert.deepEqual(fitDimensions(3200, 1600), { w: 1600, h: 800 });
  assert.deepEqual(fitDimensions(800, 600), { w: 800, h: 600 });
  assert.deepEqual(fitDimensions(1000, 4000), { w: 400, h: 1600 });
});
test("attempt plan goes from best quality full size down to small and low", () => {
  const p = planAttempts(2000, 1000);
  assert.deepEqual(p[0], { w: 1600, h: 800, quality: 0.85 });
  assert.ok(p.length >= 20);
  for (let i = 1; i < p.length; i++) assert.ok(p[i].w <= p[i - 1].w, "never grows");
  assert.ok(p[p.length - 1].w < p[0].w / 3);
});
const blobOf = (n) => ({ size: n });
test("shrink loop stops at the first attempt that fits", async () => {
  const calls = [];
  // pretend the encoder produces size proportional to area and quality
  const encode = async (a) => { calls.push(a); return blobOf(Math.round(a.w * a.h * a.quality * 0.5)); };
  const r = await shrinkToLimit(2000, 1000, encode);
  assert.equal(r.ok, true);
  assert.ok(r.blob.size <= MAX_BYTES);
  assert.equal(r.attempts, calls.length);
  assert.ok(calls.length > 1, "the first full-size try was too big");
  // every earlier try was too big, so the loop really stopped at the first fit
  for (const a of calls.slice(0, -1)) assert.ok(Math.round(a.w * a.h * a.quality * 0.5) > MAX_BYTES);
});
test("shrink loop: a small image is accepted on the first try", async () => {
  const r = await shrinkToLimit(300, 200, async () => blobOf(5000));
  assert.equal(r.ok, true);
  assert.equal(r.attempts, 1);
});
test("shrink loop: gives up with too_big when nothing fits, encode_failed when nothing encodes", async () => {
  assert.deepEqual(await shrinkToLimit(2000, 1000, async () => blobOf(MAX_BYTES + 1)), { ok: false, reason: "too_big" });
  assert.deepEqual(await shrinkToLimit(2000, 1000, async () => null), { ok: false, reason: "encode_failed" });
});
test("shrink loop honours a different limit", async () => {
  const r = await shrinkToLimit(100, 100, async (a) => blobOf(a.quality * 1000), 500);
  assert.equal(r.ok, true);
  assert.ok(r.blob.size <= 500);
});
