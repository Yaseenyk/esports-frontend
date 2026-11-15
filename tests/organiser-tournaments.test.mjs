// Organiser tournament screens: form rules, slug rules, request bodies, markdown to plain text, the state machine and its explanations,
// the live thin-page checklist and the adapters. All pure: no network.
import test from "node:test";
import assert from "node:assert/strict";
import { BLANK_FORM, checkSlug, fieldForCode, fromTournament, isDirty, isoToLocalInput, localInputToIso, markdownToPlain, slugify, toCreateBody, toUpdateBody, validateForm, RESERVED_SLUGS } from "../src/features/tournaments/organiser/form.ts";
import { blockedReason, countUndecided, explainTransitionError, MOVES, transitionOptions } from "../src/features/tournaments/organiser/state-machine.ts";
import { pageChecklist, checklistReady } from "../src/features/tournaments/organiser/checklist.ts";
import { toEventLite, toEventLiteList, toOrganiserTournament } from "../src/features/tournaments/services/organiser.adapter.ts";
import { toFailure, explainFailure } from "../src/features/shared/failure.ts";

const long = (n, c = "a") => (c + " ").repeat(Math.ceil(n / 2)).slice(0, n);
const SERVER = {
  id: "t1", eventId: "e1", slug: "gokte-cup-2026", title: "Gokte Cup 2026", game: "bgmi", format: "battle_royale_points", status: "draft", venue: "offline", city: "Pune", state: "Maharashtra",
  summary: "A".repeat(90), description: "D".repeat(220), rules: null, maxTeams: 16, startsAt: "2026-12-20T04:30:00.000Z", endsAt: null, publishedAt: null, seoReady: false,
  seoFailures: ["published", "registration_or_results"], discordGuildId: "SECRET", createdAt: "x", updatedAt: "2026-11-15T09:00:00.000Z",
};
const saved = (over = {}) => toOrganiserTournament({ ...SERVER, ...over });
const good = { ...BLANK_FORM, title: "Gokte Cup 2026", game: "bgmi", format: "battle_royale_points" };

// ---- slug ----
test("slug: format, double hyphen and reserved words are named", () => {
  assert.deepEqual(checkSlug("Gokte-Cup-2026"), { ok: true, slug: "gokte-cup-2026" });
  for (const s of ["ab", "-abc", "abc-", "a b c", "x".repeat(61), "caf\u00e9-cup"]) assert.equal(checkSlug(s).reason, "format", s);
  assert.equal(checkSlug("gokte--cup").reason, "double_hyphen");
  for (const s of ["admin", "tournaments", "new", "Disputes", "streamerosai"]) assert.equal(checkSlug(s).reason, "reserved", s);
  assert.ok(RESERVED_SLUGS.includes("api"));
});
test("slug: slugify derives the shape the server derives", () => {
  assert.equal(slugify("Gokte Cup 2026!"), "gokte-cup-2026");
  assert.equal(slugify("  Caf\u00e9 \u2014 Showdown  "), "cafe-showdown");
  assert.equal(slugify("x".repeat(80)).length, 48);
  assert.equal(slugify("***"), "");
});

// ---- dates ----
test("dates: local input and ISO round-trip, bad input is null", () => {
  const iso = "2026-12-20T04:30:00.000Z";
  assert.equal(localInputToIso(isoToLocalInput(iso)), iso);
  assert.equal(localInputToIso(""), null);
  assert.equal(localInputToIso("not a date"), null);
  assert.equal(isoToLocalInput(null), "");
  assert.equal(isoToLocalInput("garbage"), "");
});

// ---- markdown to plain text ----
test("markdown: marks are removed, links keep their address, lists become bullets", () => {
  assert.equal(markdownToPlain("# Gokte Cup\n\n**Bold** and *italic* and `code`"), "Gokte Cup\n\nBold and italic and code");
  assert.equal(markdownToPlain("- one\n- two\n* three"), "\u2022 one\n\u2022 two\n\u2022 three");
  assert.equal(markdownToPlain("See [the rules](https://example.com/rules) now"), "See the rules (https://example.com/rules) now");
  assert.equal(markdownToPlain("> quoted\n\n---\n\nend"), "quoted\n\nend");
  assert.equal(markdownToPlain("<https://example.com>"), "https://example.com");
  assert.equal(markdownToPlain("snake_case_name stays"), "snake_case_name stays");
  assert.equal(markdownToPlain("a\n\n\n\n\nb"), "a\n\nb");
});
test("markdown: plain text is left alone (round trip is stable)", () => {
  const plain = "Squads of four. Matches start at 6 pm.\n\n\u2022 Room ID at 5:45 pm\n\u2022 No emulators";
  assert.equal(markdownToPlain(plain), plain);
  assert.equal(markdownToPlain(markdownToPlain("## Rules\n- **No** hacks")), markdownToPlain("## Rules\n- **No** hacks"));
});

// ---- validation ----
test("validateForm: a valid form has no errors", () => {
  assert.deepEqual(validateForm(good), {});
});
test("validateForm: required fields, lengths, markup, maxTeams, date order, slug", () => {
  const e = validateForm({ ...BLANK_FORM, title: "ab", maxTeams: "1", summary: "x".repeat(301), city: "<b>", description: "a <b> b", slug: "Bad Slug", startsAt: "2026-12-21T10:00", endsAt: "2026-12-20T10:00", rules: "<x>" });
  assert.match(e.title, /at least 3/);
  assert.equal(e.game, "Choose the game.");
  assert.equal(e.format, "Choose the format.");
  assert.match(e.maxTeams, /2 to 1024/);
  assert.match(e.summary, /At most 300/);
  assert.match(e.city, /Plain text/);
  assert.match(e.description, /Plain text/);
  assert.match(e.rules, /Plain text/);
  assert.match(e.endsAt, /cannot be before/);
  assert.match(e.slug, /Use 3 to 60/);
  assert.equal(validateForm({ ...good, maxTeams: "1025" }).maxTeams.length > 0, true);
  assert.equal(validateForm({ ...good, maxTeams: "2" }).maxTeams, undefined);
  assert.equal(validateForm({ ...good, maxTeams: "1024" }).maxTeams, undefined);
});
test("validateForm: a locked slug is not validated; reserved slug is rejected while unlocked", () => {
  assert.equal(validateForm({ ...good, slug: "ADMIN" }).slug, "That address is reserved. Try another one.");
  assert.equal(validateForm({ ...good, slug: "ADMIN" }, { slugLocked: true }).slug, undefined);
  assert.equal(validateForm({ ...good, slug: "" }).slug, undefined); // empty: the server derives one
});
test("validateForm: a Markdown link in the description is fine (it is converted before it is checked)", () => {
  assert.equal(validateForm({ ...good, description: "Join at [our group](https://example.com) now" }).description, undefined);
});

// ---- bodies ----
test("create body: empty optional fields are left out, text is trimmed, slug lower-cased, dates become ISO", () => {
  const b = toCreateBody({ ...good, title: "  Gokte Cup 2026 ", slug: " Gokte-Cup ", city: " Pune ", summary: "", description: "# About\nText", maxTeams: "16", startsAt: "2026-12-20T10:00" });
  assert.equal(b.title, "Gokte Cup 2026");
  assert.equal(b.slug, "gokte-cup");
  assert.equal(b.city, "Pune");
  assert.equal("summary" in b, false);
  assert.equal("state" in b, false);
  assert.equal(b.description, "About\nText");
  assert.equal(b.maxTeams, 16);
  assert.match(b.startsAt, /^2026-12-20T\d\d:\d\d:00\.000Z$/);
  assert.equal("endsAt" in b, false);
  assert.deepEqual(Object.keys(toCreateBody(good)).sort(), ["format", "game", "title", "venue"]);
});
test("update body: only what changed, cleared optional fields are null, slug only while unlocked", () => {
  const t = saved();
  const f = fromTournament(t);
  assert.equal(isDirty(f, t), false);
  assert.deepEqual(toUpdateBody(f, t), {});
  assert.deepEqual(toUpdateBody({ ...f, title: "New title here" }, t), { title: "New title here" });
  assert.deepEqual(toUpdateBody({ ...f, city: "", maxTeams: "" }, t), { city: null, maxTeams: null });
  assert.deepEqual(toUpdateBody({ ...f, startsAt: "" }, t), { startsAt: null });
  assert.deepEqual(toUpdateBody({ ...f, description: "" }, t), { description: null });
  assert.deepEqual(toUpdateBody({ ...f, slug: "New-Slug-Here" }, t), { slug: "new-slug-here" });
  const published = saved({ publishedAt: "2026-11-16T00:00:00.000Z", status: "published" });
  assert.deepEqual(toUpdateBody({ ...fromTournament(published), slug: "other-slug" }, published), {}); // locked: never sent
  assert.equal(isDirty({ ...f, game: "valorant" }, t), true);
});
test("fieldForCode puts server errors next to their field", () => {
  assert.equal(fieldForCode("slug_taken"), "slug");
  assert.equal(fieldForCode("slug_reserved"), "slug");
  assert.equal(fieldForCode("invalid_title"), "title");
  assert.equal(fieldForCode("invalid_maxTeams"), "maxTeams");
  assert.equal(fieldForCode("invalid_endsAt"), "endsAt");
  assert.equal(fieldForCode("tournament_final"), null);
  assert.equal(fieldForCode(undefined), null);
});

// ---- state machine ----
test("state machine: the moves match API.md", () => {
  assert.deepEqual(MOVES.draft, ["published", "cancelled"]);
  assert.deepEqual(MOVES.published, ["registration_open", "cancelled"]);
  assert.deepEqual(MOVES.registration_open, ["registration_closed", "cancelled"]);
  assert.deepEqual(MOVES.registration_closed, ["live", "cancelled"]);
  assert.deepEqual(MOVES.live, ["completed", "cancelled"]);
  assert.deepEqual(MOVES.completed, []);
  assert.deepEqual(MOVES.cancelled, []);
});
const ctx = (over = {}) => ({ description: "x".repeat(220), startsAt: "2026-12-20T04:30:00.000Z", openDisputes: 0, dirty: false, ...over });
test("transitionOptions: only legal moves, cancel last, nothing from a finished tournament", () => {
  assert.deepEqual(transitionOptions("draft", ctx()).map((o) => o.to), ["published", "cancelled"]);
  assert.deepEqual(transitionOptions("live", ctx()).map((o) => o.to), ["completed", "cancelled"]);
  assert.deepEqual(transitionOptions("completed", ctx()), []);
  assert.deepEqual(transitionOptions("cancelled", ctx()), []);
  assert.deepEqual(transitionOptions("nonsense", ctx()), []);
  assert.equal(transitionOptions("draft", ctx()).find((o) => o.to === "cancelled").destructive, true);
});
test("blocked: registration_open needs a description and a start date, and says which", () => {
  assert.match(blockedReason("registration_open", ctx({ description: null })), /a description\. Add it/);
  assert.match(blockedReason("registration_open", ctx({ startsAt: null })), /a start date\. Add it/);
  assert.match(blockedReason("registration_open", ctx({ description: " ", startsAt: null })), /a description and a start date\. Add them/);
  assert.equal(blockedReason("registration_open", ctx()), "");
  const o = transitionOptions("published", ctx({ description: null })).find((x) => x.to === "registration_open");
  assert.equal(o.blocked, true);
  assert.match(o.reason, /description/);
});
test("blocked: completed waits for open disputes; unknown count does not block (the server checks)", () => {
  assert.match(blockedReason("completed", ctx({ openDisputes: 1 })), /1 dispute is still undecided/);
  assert.match(blockedReason("completed", ctx({ openDisputes: 3 })), /3 disputes are still undecided/);
  assert.equal(blockedReason("completed", ctx({ openDisputes: 0 })), "");
  assert.equal(blockedReason("completed", ctx({ openDisputes: null })), "");
  assert.equal(blockedReason("cancelled", ctx({ openDisputes: 5 })), "");
});
test("blocked: unsaved edits block every move", () => {
  for (const o of transitionOptions("draft", ctx({ dirty: true }))) { assert.equal(o.blocked, true); assert.match(o.reason, /Save your changes first/); }
});
test("countUndecided counts open, evidence_requested, under_review, escalated only", () => {
  assert.equal(countUndecided(["open", "evidence_requested", "under_review", "escalated", "resolved", "rejected", "withdrawn"]), 4);
  assert.equal(countUndecided([]), 0);
});
test("explainTransitionError turns the server codes into words", () => {
  assert.match(explainTransitionError("needs_description_and_start", "registration_open"), /description and a start date/);
  assert.match(explainTransitionError("disputes_open", "completed"), /undecided/);
  assert.match(explainTransitionError("bad_transition", "live"), /Live/);
  assert.equal(explainTransitionError("something_else", "live"), "");
});

// ---- checklist: the same guard as the build ----
test("checklist: an empty draft fails the lines it should", () => {
  const items = pageChecklist(BLANK_FORM, null);
  const missing = items.filter((i) => !i.ok).map((i) => i.key);
  assert.deepEqual(missing, ["title_unique", "summary_80", "description_200", "start_date", "registration_or_results", "published"]);
  assert.equal(items.find((i) => i.key === "venue").ok, true); // online counts by itself
  assert.equal(checklistReady(items), false);
});
test("checklist: lengths are counted live, description by its plain text", () => {
  const f = { ...good, title: "Gokte Cup 2026", summary: "s".repeat(79), description: "# " + "d".repeat(199), startsAt: "2026-12-20T10:00", venue: "offline", city: "" };
  let m = Object.fromEntries(pageChecklist(f, null).map((i) => [i.key, i.ok]));
  assert.equal(m.summary_80, false);
  assert.equal(m.description_200, false); // the "# " mark is not counted
  assert.equal(m.venue, false); // offline needs a city
  m = Object.fromEntries(pageChecklist({ ...f, summary: "s".repeat(80), description: "# " + "d".repeat(200), city: "Pune" }, null).map((i) => [i.key, i.ok]));
  assert.equal(m.summary_80 && m.description_200 && m.venue && m.start_date && m.title_unique, true);
});
test("checklist: all green needs registration open (or results) and a publish", () => {
  const t = saved({ status: "registration_open", publishedAt: "2026-11-16T00:00:00.000Z", seoFailures: [] });
  assert.equal(checklistReady(pageChecklist(fromTournament(t), t)), true);
  const draft = saved();
  const m = Object.fromEntries(pageChecklist(fromTournament(draft), draft).map((i) => [i.key, i.ok]));
  assert.equal(m.published, false);
  assert.equal(m.registration_or_results, false);
});
test("checklist: a title the server said is taken stays failing until it changes", () => {
  const t = saved({ seoFailures: ["title_unique", "published"] });
  assert.equal(pageChecklist(fromTournament(t), t).find((i) => i.key === "title_unique").ok, false);
  assert.equal(pageChecklist({ ...fromTournament(t), title: "A different title" }, t).find((i) => i.key === "title_unique").ok, true);
});

// ---- adapters ----
test("adapter: a fixed field list, no ids of other things, bad payloads are null", () => {
  const t = toOrganiserTournament(SERVER);
  assert.equal(t.slug, "gokte-cup-2026");
  assert.equal(t.seoFailures.length, 2);
  assert.equal("discordGuildId" in t, false);
  assert.equal("createdAt" in t, false);
  assert.equal(toOrganiserTournament({ id: "x" }), null);
  assert.equal(toOrganiserTournament(null), null);
  assert.equal(toOrganiserTournament({ ...SERVER, venue: "mars" }).venue, "online");
});
test("adapter: events keep id, name, game, date and the caller's role; junk is dropped", () => {
  const l = toEventLiteList([{ id: "e1", name: "Cup", game: "BGMI", date: "2026-12-01", role: "owner", settings: { secret: 1 } }, { name: "no id" }, 5]);
  assert.deepEqual(l, [{ id: "e1", name: "Cup", game: "BGMI", date: "2026-12-01", role: "owner" }]);
  assert.deepEqual(toEventLiteList("nope"), []);
});

// ---- failure words used by these screens ----
test("failures: a 404 is 'not available yet'; tournament codes have plain words", () => {
  assert.equal(toFailure({ status: 404 }).kind, "unavailable");
  assert.match(explainFailure({ kind: "conflict", status: 409, code: "slug_locked" }), /cannot change once the page has been published/);
  assert.match(explainFailure({ kind: "conflict", status: 409, code: "slug_taken" }), /already taken/);
  assert.match(explainFailure({ kind: "conflict", status: 409, code: "disputes_open" }), /open dispute/);
  assert.match(explainFailure({ kind: "conflict", status: 409, code: "needs_description_and_start" }), /description and a start date/);
});

test("adapter: an event answer without a role is unknown (empty), never viewer (the real GET /events/:id has no role field)", () => {
  assert.deepEqual(toEventLite({ id: "e1", name: "Cup", game: "BGMI", date: "2026-12-01" }), { id: "e1", name: "Cup", game: "BGMI", date: "2026-12-01", role: "" });
});
