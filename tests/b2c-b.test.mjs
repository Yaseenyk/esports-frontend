// Builder B (25 Nov 2026): squad planner, tournament alerts and LFT matching. Pure rules and the adapters' privacy behaviour.
import test from "node:test";
import assert from "node:assert/strict";
import { addDays, bestWindows, buildSlots, groupByDay, nameProblem, scrimLink, shareLink, tokenFromHash, zonedToEpoch } from "../src/features/squad-planner/domain.ts";
import { toPlan } from "../src/features/squad-planner/services/planner.api.ts";
import { placeProblem } from "../src/features/alerts/domain.ts";
import { toSettings } from "../src/features/alerts/services/alerts.api.ts";
import { filtersToApiQuery, filtersToSearch, parseFilters, parseWants } from "../src/features/lft/filters.ts";
import { toInbox, toListing, toSent } from "../src/features/lft/services/lft.adapter.ts";
import { prefillFromSearch } from "../src/features/scrims/filters.ts";
import { chosenContacts, createBody, validateCreate } from "../src/features/lft/validators.ts";
import { BLANK_CREATE } from "../src/features/lft/hooks/useLftForms.ts";
import { EMPTY_FILTERS } from "../src/features/lft/domain.ts";

test("planner: wall time in a zone to UTC, including India and a DST zone", () => {
  assert.equal(zonedToEpoch("2026-12-05", 21, 0, "Asia/Kolkata"), Date.UTC(2026, 11, 5, 15, 30) / 1000);
  assert.equal(zonedToEpoch("2026-07-01", 12, 0, "Europe/London"), Date.UTC(2026, 6, 1, 11, 0) / 1000);
  assert.equal(zonedToEpoch("2026-12-01", 12, 0, "Europe/London"), Date.UTC(2026, 11, 1, 12, 0) / 1000);
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
});

test("planner: slots for days and hours, across midnight, past slots dropped, caps", () => {
  const now = Date.UTC(2026, 11, 1, 0, 0) / 1000;
  const g = buildSlots({ firstDay: "2026-12-05", days: 2, fromHour: 21, toHour: 2, slotMinutes: 60, tz: "Asia/Kolkata" }, now);
  assert.ok(g.ok);
  assert.equal(g.slots.length, 10); // 21,22,23,0,1 on two evenings
  assert.equal(g.slots[0], Date.UTC(2026, 11, 5, 15, 30) / 1000);
  assert.equal(buildSlots({ firstDay: "2026-12-05", days: 15, fromHour: 0, toHour: 24, slotMinutes: 60, tz: "UTC" }, now).ok, false);
  assert.equal(buildSlots({ firstDay: "2026-12-05", days: 14, fromHour: 0, toHour: 24, slotMinutes: 30, tz: "UTC" }, now).ok, false); // 672 > 336
  assert.equal(buildSlots({ firstDay: "2020-01-01", days: 1, fromHour: 20, toHour: 22, slotMinutes: 60, tz: "UTC" }, now).ok, false); // all in the past
  assert.equal(buildSlots({ firstDay: "2026-12-05", days: 1, fromHour: 20, toHour: 20, slotMinutes: 60, tz: "UTC" }, now).ok, false);
});

test("planner: best windows rank by how many are free for the whole session, never overlap, need contiguous slots", () => {
  const h = 3600, s0 = 1_800_000_000 - (1_800_000_000 % h);
  const plan = { slotMinutes: 60, slots: [s0, s0 + h, s0 + 2 * h, s0 + 10 * h], people: [{ id: "a", name: "A", picks: [0, 1, 2, 3] }, { id: "b", name: "B", picks: [1, 2, 3] }, { id: "c", name: "C", picks: [2] }] };
  const one = bestWindows(plan, 1);
  assert.deepEqual(one[0], { start: s0 + 2 * h, slots: 1, free: 3, names: ["A", "B", "C"] });
  const two = bestWindows(plan, 2);
  assert.deepEqual(two.map((w) => [w.start, w.free]), [[s0 + h, 2]]); // [2,3] is not contiguous in time; [0,1] would overlap
  assert.deepEqual(bestWindows({ ...plan, people: [] }, 1), []);
});

test("planner: share link keeps the token after #, and only a valid token is read back", () => {
  const t = "A".repeat(32);
  assert.equal(shareLink("https://x.test", t), `https://x.test/squad/#t=${t}`);
  assert.equal(tokenFromHash(`#t=${t}`), t);
  assert.equal(tokenFromHash("#t=short"), null);
  assert.equal(tokenFromHash(`#t=${t}<script>`), null);
  assert.match(scrimLink(1_800_000_000, "bgmi"), /^\/scrims\/new\/\?starts=2027-01-15T08%3A00%3A00\.000Z&game=bgmi$/);
});

test("planner: names, grouping and the adapter recount (never trust a server count)", () => {
  assert.equal(nameProblem(""), "Type the name your squad knows you by.");
  assert.notEqual(nameProblem("call 98765 43210"), "");
  assert.notEqual(nameProblem("discord.gg/x"), "");
  assert.equal(nameProblem("Ravi"), "");
  const p = toPlan({ game: "bgmi", title: "T", tz: "Asia/Kolkata", slotMinutes: 60, slots: [100, 200], people: [{ id: "x", name: "A", picks: [0, 1, 9] }, { id: "", name: "nobody", picks: [0] }], counts: [99, 99], captainKey: "leak" });
  assert.deepEqual(p.counts, [1, 1]);
  assert.deepEqual(p.people, [{ id: "x", name: "A", picks: [0, 1] }]);
  assert.ok(!("captainKey" in p));
  assert.equal(groupByDay([0, 3600, 86_400], "UTC").length, 2);
});

test("scrims: the planner's link pre-fills the form in India time; junk is ignored", () => {
  assert.deepEqual(prefillFromSearch("?starts=2026-12-05T15:30:00.000Z&game=bgmi"), { game: "bgmi", day: "2026-12-05", time: "21:00", zone: "ist" });
  assert.deepEqual(prefillFromSearch("?starts=nope&game=chess"), {});
});

test("alerts: place rule and the adapter", () => {
  assert.equal(placeProblem("any"), "");
  assert.equal(placeProblem("Pune"), "");
  assert.notEqual(placeProblem("<b>"), "");
  assert.notEqual(placeProblem("x"), "");
  const s = toSettings({ status: "active", email: "a***@x.com", rules: [{ game: "bgmi", place: "pune", kind: "any" }], limits: { maxRules: 5 }, mailer: true, userId: "leak" });
  assert.equal(s.status, "active");
  assert.ok(!("userId" in s));
  assert.equal(toSettings({ status: "weird" }).status, "off");
});

test("lft: language, hours and sort live in the query string; wants only go to the API when sorting by match", () => {
  const f = parseFilters("?lang=hi&hours=night&sort=match&lang2=x");
  assert.equal(f.lang, "hi"); assert.equal(f.hours, "night"); assert.equal(f.sort, "match");
  assert.equal(parseFilters("?lang=klingon&hours=noon&sort=weird").lang, "");
  assert.equal(filtersToSearch({ ...EMPTY_FILTERS, lang: "ta" }), "?lang=ta");
  const wants = { roles: ["igl"], languages: ["hi"], hours: ["evening"] };
  assert.match(filtersToApiQuery({ ...EMPTY_FILTERS, sort: "match" }, "cur", 20, wants), /want_roles=igl&want_langs=hi&want_hours=evening/);
  assert.doesNotMatch(filtersToApiQuery({ ...EMPTY_FILTERS, sort: "match" }, "cur", 20, wants), /cursor/);
  assert.doesNotMatch(filtersToApiQuery(EMPTY_FILTERS, null, 20, wants), /want_/);
  assert.deepEqual(parseWants('{"roles":["igl","pilot"],"languages":["xx","en"]}'), { roles: ["igl"], languages: ["en"], hours: [] });
  assert.deepEqual(parseWants("not json"), { roles: [], languages: [], hours: [] });
});

test("lft: contacts are kept only for accepted requests, whatever the server sends", () => {
  const sent = toSent([{ id: "a", kind: "looking_for_player", status: "sent", contact: "x#1", contacts: { discord: "x#1" } }, { id: "b", kind: "looking_for_player", status: "accepted", contacts: { discord: "y#2", whatsapp: "999", ign: "Y" } }]);
  assert.equal(sent[0].contacts, null); assert.equal(sent[0].contact, null);
  assert.deepEqual(sent[1].contacts, { discord: "y#2", ign: "Y" }); // unknown kinds dropped
  const inbox = toInbox([{ id: "c", status: "declined", contacts: { discord: "z" } }]);
  assert.equal(inbox[0].contacts, null);
  const l = toListing({ id: "1", kind: "looking_for_team", game: "bgmi", message: "hello there", languages: ["hi", "<x>"], playHours: ["night"], match: { score: 140, reasons: ["role"] }, contact: "leak" });
  assert.deepEqual(l.languages, ["hi"]); assert.equal(l.match.score, 100); assert.ok(!("contact" in l));
});

test("lft: the create body sends chosen contacts AND the legacy single contact", () => {
  const f = { ...BLANK_CREATE, game: "bgmi", message: "Looking for a team for evening scrims", contacts: { discord: "ravi#1", instagram: "", ign: "Ravi" }, languages: ["hi"], playHours: ["night"] };
  assert.deepEqual(validateCreate(f), {});
  const b = createBody(f);
  assert.equal(b.contact, "ravi#1");
  assert.deepEqual(b.contacts, { discord: "ravi#1", ign: "Ravi" });
  assert.deepEqual(b.languages, ["hi"]);
  assert.equal(chosenContacts({ contacts: { discord: "", instagram: "", ign: "" } }), null);
  assert.ok(validateCreate({ ...f, contacts: { discord: "", instagram: "", ign: "" } }).contact); // nothing at all: asks for a contact
  assert.ok(validateCreate({ ...f, contacts: { discord: "9876543210", instagram: "", ign: "" } }).contacts);
});
