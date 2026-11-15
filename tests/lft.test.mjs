// LFT board: client-side text hints, form validation, query-string filters, adapters (no author id, no contact before accept).
import test from "node:test";
import assert from "node:assert/strict";
import { checkApplicationMessage, checkContact, checkListingMessage, createBody, hintFor, validateCreate } from "../src/features/lft/validators.ts";
import { filtersToApiQuery, filtersToSearch, hasAnyFilter, parseFilters } from "../src/features/lft/filters.ts";
import { toBoardPage, toInbox, toListing, toMyListings, toSent } from "../src/features/lft/services/lft.adapter.ts";
import { toFailure, explainFailure } from "../src/features/shared/failure.ts";
import { EMPTY_FILTERS } from "../src/features/lft/domain.ts";

const ok = (s) => assert.equal(checkListingMessage(s).ok, true, s);
const no = (s, code) => { const r = checkListingMessage(s); assert.equal(r.ok, false, s); assert.equal(r.code, code, s); };

test("message hints: plain text passes", () => {
  ok("IGL looking for a serious BGMI squad, evenings IST, diamond+");
  ok("Rank 17, 4.2 KD, scrims at 9pm");
});
test("message hints: links are caught in the usual disguises", () => {
  for (const s of ["join https://discord.gg/abc please", "see www.example.com now ok", "message me on discord.gg slash abc", "visit example dot com today", "t.me/somechannel is ours", "wa.me number here ok", "my page: example.com ok"]) no(s, "has_link");
});
test("message hints: phone numbers are caught", () => {
  no("call me on 98765 43210 anytime", "has_phone");
  no("whatsapp +91 98765-43210 today", "has_phone");
  no("my number is 9876543210 ok", "has_phone");
});
test("message hints: markup, length and emptiness", () => {
  no("hello <b>world</b> squad here", "has_markup");
  no("short", "empty");
  no("x".repeat(601), "too_long");
  assert.equal(checkListingMessage("y".repeat(600)).ok, true);
});
test("message hints: a handle or an invitation to talk elsewhere is caught, the friendly reason says why", () => {
  for (const s of ["IGL here, DM me on insta @rohan_igl", "ping me on discord after 9pm ok", "add me on steam for scrims", "reach me on telegram please", "whatsapp me for trials ok", "just text me for a trial game", "call me for a trial game ok", "message me on instagram for scrims", "contact me on discord any time", "DM me anytime for scrims"]) no(s, "has_outside_contact");
  assert.match(hintFor("message", checkListingMessage("DM me on insta @rohan_igl")), /Contact details are shared only after the poster accepts an application\. Remove the handle or the "DM me" line and ask people to apply here\./);
  assert.equal(checkApplicationMessage("I play evenings, ping me on discord").ok, false);
});
test("message hints: ordinary words that look close are fine", () => {
  for (const s of ["Looking for a squad, we scrim at 9pm every day", "I can message the team captain once accepted", "Ace-rank sniper, 2 @ a time pushes", "Email style a@b is not used here ok ok"]) ok(s);
  assert.equal(checkContact("rohan_igl#1234").ok, true); // the contact field may hold a handle: it is never shown before accept
  assert.equal(checkContact("@rohan_igl").ok, true);
});
test("hints are plain words and empty when fine", () => {
  assert.equal(hintFor("message", checkListingMessage("a good message about my squad")), "");
  assert.match(hintFor("message", checkListingMessage("call 9876543210 now ok")), /phone number/);
  assert.match(hintFor("message", checkListingMessage("see https://x.gg ok ok")), /link/);
});
test("application message may be empty but not link-y", () => {
  assert.equal(checkApplicationMessage("").ok, true);
  assert.equal(checkApplicationMessage("   ").ok, true);
  assert.equal(checkApplicationMessage("x".repeat(401)).ok, false);
  assert.equal(checkApplicationMessage("add me at example.com").ok, false);
});
test("contact: handles pass, links and numbers do not", () => {
  for (const c of ["raviigl", "Ravi#1234", "ravi_igl.9", "ravi igl"]) assert.equal(checkContact(c).ok, true, c);
  assert.equal(checkContact("a").ok, false);
  assert.equal(checkContact("x".repeat(41)).ok, false);
  assert.equal(checkContact("ravi<script>").ok, false);
  assert.equal(checkContact("https://discord.gg/x").ok, false);
  assert.equal(checkContact("9876543210").ok, false);
});

const form = (over = {}) => ({ kind: "looking_for_team", game: "bgmi", roles: ["igl"], rankMin: "10", rankMax: "20", state: "Maharashtra", city: "Pune", onlineOk: true, message: "Serious IGL looking for a squad, evenings only", contact: "raviigl", expiresInDays: "14", teamProfileId: "", ...over });
test("create form: valid form has no errors", () => assert.deepEqual(validateCreate(form()), {}));
test("create form: each rule", () => {
  assert.ok(validateCreate(form({ game: "" })).game);
  assert.ok(validateCreate(form({ roles: ["igl", "support", "sniper", "scout", "entry"] })).roles);
  assert.ok(validateCreate(form({ rankMin: "101" })).rankMin);
  assert.ok(validateCreate(form({ rankMin: "30", rankMax: "20" })).rankMax);
  assert.ok(validateCreate(form({ message: "https://x.gg me" })).message);
  assert.ok(validateCreate(form({ contact: "" })).contact);
  assert.ok(validateCreate(form({ expiresInDays: "31" })).expiresInDays);
  assert.ok(validateCreate(form({ kind: "looking_for_player", teamProfileId: "" })).teamProfileId);
  assert.equal(validateCreate(form({ kind: "looking_for_player", teamProfileId: "t1" })).teamProfileId, undefined);
});
test("create body: optional fields are left out, teamProfileId only for a team", () => {
  const b = createBody(form({ rankMin: "", rankMax: "", state: "", city: "", teamProfileId: "t1" }));
  assert.equal("rankMin" in b, false);
  assert.equal("state" in b, false);
  assert.equal("teamProfileId" in b, false);
  assert.equal(createBody(form({ kind: "looking_for_player", teamProfileId: "t1" })).teamProfileId, "t1");
  assert.equal(createBody(form()).expiresInDays, 14);
});

test("filters: parse keeps only valid values", () => {
  const f = parseFilters("?game=bgmi&kind=looking_for_team&role=igl&rank_min=10&rank_max=99&state=Maharashtra&city=Pune&online=1");
  assert.deepEqual(f, { game: "bgmi", kind: "looking_for_team", role: "igl", rankMin: "10", rankMax: "99", state: "Maharashtra", city: "Pune", online: true });
  const bad = parseFilters("?game=chess&kind=x&role=wizard&rank_min=abc&rank_max=500&online=yes&state=<b>x</b>");
  assert.equal(bad.game, ""); assert.equal(bad.kind, ""); assert.equal(bad.role, ""); assert.equal(bad.rankMin, ""); assert.equal(bad.rankMax, ""); assert.equal(bad.online, false);
  assert.equal(bad.state.includes("<"), false);
});
test("filters: round trip and API query", () => {
  const f = parseFilters("?game=valorant&online=1&rank_min=5");
  assert.equal(filtersToSearch(f), "?game=valorant&rank_min=5&online=1");
  assert.equal(filtersToSearch(EMPTY_FILTERS), "");
  assert.equal(hasAnyFilter(f), true);
  assert.equal(hasAnyFilter(EMPTY_FILTERS), false);
  assert.equal(filtersToApiQuery(f, "1795_ab"), "?game=valorant&rank_min=5&online=1&limit=20&cursor=1795_ab");
  assert.equal(filtersToApiQuery(EMPTY_FILTERS), "?limit=20");
});

const L = { id: "a1", kind: "looking_for_team", game: "bgmi", roles: ["igl"], rankMin: 10, rankMax: 20, state: "Maharashtra", city: "Pune", onlineOk: true, message: "hello squad", teamName: null, createdAt: "2030-01-01T00:00:00Z", lastBumpedAt: "2030-01-02T00:00:00Z", expiresAt: "2030-01-15T00:00:00Z" };
test("adapter: a public listing carries no author, email or contact even if the server sends them", () => {
  const l = toListing({ ...L, authorId: "u1", userId: "u1", email: "a@b.c", contact: "raviigl" });
  for (const k of ["authorId", "userId", "email", "contact"]) assert.equal(k in l, false, k);
  assert.equal(toBoardPage({ items: [L, { nope: 1 }], nextCursor: "c1" }).items.length, 1);
  assert.equal(toBoardPage({}).nextCursor, null);
});
test("adapter: contact is kept for my own listing, and only for an accepted application", () => {
  assert.equal(toMyListings([{ ...L, contact: "raviigl", status: "open", hidden: false, reportCount: 2, applications: 3 }])[0].contact, "raviigl");
  const inbox = toInbox([{ id: "1", status: "sent", message: "hi", contact: "leak" }, { id: "2", status: "accepted", message: "yo", contact: "ok#1", profileSlug: "ravi" }, { id: "3", status: "declined", contact: "leak2" }]);
  assert.equal(inbox[0].contact, null);
  assert.equal(inbox[1].contact, "ok#1");
  assert.equal(inbox[2].contact, null);
  const sent = toSent([{ id: "1", kind: "looking_for_team", game: "bgmi", status: "sent", contact: "leak" }, { id: "2", kind: "looking_for_player", game: "bgmi", status: "accepted", contact: "auth#1", teamName: "Wolves" }]);
  assert.equal(sent[0].contact, null);
  assert.equal(sent[1].contact, "auth#1");
});

test("failures: 404 is 'not available yet', and server codes become plain words", () => {
  assert.equal(toFailure({ status: 404 }).kind, "unavailable");
  assert.match(explainFailure(toFailure({ status: 404 })), /not available yet/i);
  assert.equal(toFailure({ status: 401 }).kind, "unauthorized");
  assert.equal(toFailure({ status: 429 }).kind, "limited");
  assert.equal(toFailure(new Error("network")).kind, "error");
  const f = toFailure({ status: 400, serverError: "Links not allowed", detail: { code: "message_has_link" } });
  assert.match(explainFailure(f), /Links are not allowed/);
  assert.match(explainFailure(toFailure({ status: 409, detail: { code: "listing_cap" } })), /3 open listings/);
  assert.match(explainFailure(toFailure({ status: 429, detail: { code: "bump_too_soon" } })), /24 hours/);
});
