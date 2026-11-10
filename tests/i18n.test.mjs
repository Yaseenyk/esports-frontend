import test from "node:test";
import assert from "node:assert/strict";
import { KEYS, LANGS, translate, isLang } from "../src/lib/i18n.ts";

const VARS = { team: "@team", step: "@step", n: "@n" };
const holes = (s) => (s.match(/@(team|step|n)/g) || []).sort().join(",");

test("every line exists in Hindi and Marathi, so nothing silently falls back to English", () => {
  for (const lang of ["hi", "mr"]) for (const k of KEYS) assert.notEqual(translate(lang, k), translate("en", k), `${lang}.${k} is missing or identical to English`);
});

test("translations keep every placeholder the English line has", () => {
  for (const lang of ["hi", "mr"]) for (const k of KEYS) assert.equal(holes(translate(lang, k, VARS)), holes(translate("en", k, VARS)), `${lang}.${k}`);
});

test("Hindi and Marathi lines are written in Devanagari", () => {
  for (const lang of ["hi", "mr"]) for (const k of ["join_title", "privacy", "sent_body", "pass_note", "gate_ok", "guide0", "guide3"]) assert.match(translate(lang, k, VARS), /[\u0900-\u097F]/, `${lang}.${k}`);
});

test("placeholders are filled in and an unknown language falls back to English", () => {
  assert.equal(translate("en", "join_title", { team: "Konkan Kings" }), "Join Konkan Kings");
  assert.match(translate("hi", "join_title", { team: "Konkan Kings" }), /Konkan Kings/);
  assert.equal(translate("xx", "send"), "Send to the organiser");
  assert.ok(isLang("mr") && !isLang("fr"));
  assert.deepEqual(LANGS.map((l) => l.code), ["en", "hi", "mr"]);
});

test("the four step guides and all roles are translated", () => {
  for (const k of ["guide0", "guide1", "guide2", "guide3", "role_Player", "role_Substitute", "role_Coach", "role_Manager", "role_Staff", "step_event", "step_people", "step_design", "step_print"]) assert.ok(KEYS.includes(k), k);
});
