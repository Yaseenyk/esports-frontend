import test from "node:test";
import assert from "node:assert/strict";
import { buildProject, parseProject, designToJson, parseDesign } from "../src/lib/idcard/project.ts";
import { DEFAULT_INFO } from "../src/lib/idcard/types.ts";
import { THEMES } from "../src/lib/idcard/themes.ts";

const state = () => ({
  event: "Monsoon Clash", game: "BGMI", organiser: "Konkan Gamers Guild", fmt: "poster",
  info: { ...DEFAULT_INFO, passphrase: "s3cret-passphrase", sponsorLogo: "data:image/png;base64,AAAA" },
  teams: [{ id: "t1", name: "Konkan Kings", logo: "data:image/png;base64,BBBB" }, { id: "t2", name: "Deadly Duos" }],
  templates: { t1: THEMES[0].make("wallet") },
  people: [{ id: "KON-001", name: "Aarav Mehta", teamId: "t1", role: "Player", dob: "12/05/2003", last4: "4471", zones: "Main hall", photo: "data:image/webp;base64,CCCC", cutout: true }],
});

test("saving leaves the signing passphrase out unless asked", () => {
  assert.equal(buildProject(state(), false).info.passphrase, undefined);
  assert.ok(!JSON.stringify(buildProject(state(), false)).includes("s3cret"));
  assert.equal(buildProject(state(), true).info.passphrase, "s3cret-passphrase");
});

test("a saved project opens again with everything in it", () => {
  const s = state();
  const r = parseProject(JSON.stringify(buildProject(s, false)));
  assert.ok(!("error" in r));
  const p = r.project;
  assert.equal(p.event.name, "Monsoon Clash");
  assert.equal(p.event.fmt, "poster");
  assert.deepEqual(p.teams, s.teams);
  assert.deepEqual(p.people, s.people);
  assert.equal(p.info.sponsorLogo, s.info.sponsorLogo);
  assert.equal(p.templates.t1.els.length, s.templates.t1.els.length);
});

test("damaged or foreign files are refused with a clear message", () => {
  const bad = (text) => parseProject(text).error;
  assert.match(bad("not json"), /valid JSON/);
  assert.match(bad(JSON.stringify({ hello: 1 })), /not a project file/);
  assert.match(bad(JSON.stringify({ app: "esports-hub-idcards", v: 2 })), /not a project file/);
  const ok = buildProject(state(), false);
  assert.match(bad(JSON.stringify({ ...ok, teams: [] })), /no valid teams/);
  assert.match(bad(JSON.stringify({ ...ok, people: [{ id: 1 }] })), /damaged/);
  assert.match(bad(JSON.stringify({ ...ok, event: {} })), /no event/);
});

test("an unknown card shape falls back to a wallet card, and missing settings get defaults", () => {
  const ok = buildProject(state(), false);
  const r = parseProject(JSON.stringify({ ...ok, event: { ...ok.event, fmt: "hologram" }, info: { venue: "Pune" } }));
  assert.equal(r.project.event.fmt, "wallet");
  assert.equal(r.project.info.venue, "Pune");
  assert.equal(r.project.info.rules, DEFAULT_INFO.rules);
});

test("a design file round-trips and rejects other files", () => {
  const t = THEMES[3].make("badge");
  const r = parseDesign(designToJson(t));
  assert.equal(r.design.theme, t.theme);
  assert.equal(r.design.els.length, t.els.length);
  assert.ok(parseDesign("{}").error);
  assert.ok(parseDesign("nope").error);
  assert.ok(parseDesign(JSON.stringify({ app: "esports-hub-design", v: 1, design: { els: "x" } })).error);
});
