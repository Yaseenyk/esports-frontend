// Every design must build for every card shape it claims to support, with sane geometry and only known fields and fonts.
import test from "node:test";
import assert from "node:assert/strict";
import { THEMES, VIBES, suggest, themeById, posterFmt } from "../src/lib/idcard/themes.ts";
import { POSTERS } from "../src/lib/idcard/posters.ts";
import { FIELDS, FONTS, FORMATS, ROLES, ROLE_COLOURS, fmtOf } from "../src/lib/idcard/types.ts";
import { buildBack } from "../src/lib/idcard/back.ts";

const FMTS = Object.keys(FORMATS);

function geometryProblems(els, label) {
  const bad = [];
  const ids = new Set();
  for (const e of els) {
    if (ids.has(e.id)) bad.push(`${label}: duplicate id ${e.id}`);
    ids.add(e.id);
    for (const k of ["x", "y", "w", "h", "rot", "opacity"]) if (!Number.isFinite(e[k])) bad.push(`${label}: ${e.kind} ${k} is ${e[k]}`);
    if (e.w <= 0 || e.h <= 0) bad.push(`${label}: ${e.kind} has no size`);
    if (e.w > 400 || e.h > 400) bad.push(`${label}: ${e.kind} is huge (${e.w}x${e.h})`);
    if (e.opacity < 0 || e.opacity > 1) bad.push(`${label}: opacity ${e.opacity}`);
    if (e.kind === "field" && !(e.field in FIELDS)) bad.push(`${label}: unknown field ${e.field}`);
    if ((e.kind === "field" || e.kind === "text") && e.font && !(e.font in FONTS)) bad.push(`${label}: unknown font ${e.font}`);
    if (e.size !== undefined && !(e.size > 0 && e.size < 80)) bad.push(`${label}: odd font size ${e.size}`);
  }
  return bad;
}

test("there are 10 classic and 12 poster themes, all with unique ids", () => {
  const classic = THEMES.filter((t) => t.group === "classic"), poster = THEMES.filter((t) => t.group === "poster");
  assert.equal(classic.length, 10);
  assert.equal(poster.length, POSTERS.length);
  assert.ok(poster.length >= 12);
  assert.equal(new Set(THEMES.map((t) => t.id)).size, THEMES.length);
});

test("every theme builds for every card shape with sane geometry", () => {
  const problems = [];
  for (const th of THEMES) for (const f of FMTS) {
    const t = th.make(f);
    assert.equal(fmtOf(t), f);
    assert.equal(t.theme, th.id);
    assert.ok(t.els.length >= 4, `${th.id}/${f} is nearly empty`);
    problems.push(...geometryProblems(t.els, `${th.id}/${f}`));
    assert.ok(/^#[0-9a-f]{6}$/i.test(t.bg.a) && /^#[0-9a-f]{6}$/i.test(t.bg.b), `${th.id}/${f} background colours`);
  }
  assert.deepEqual(problems, []);
});

test("every design shows the person's name and a role", () => {
  for (const th of THEMES) for (const f of FMTS) {
    const fields = th.make(f).els.filter((e) => e.kind === "field").map((e) => e.field);
    assert.ok(fields.some((x) => x === "name" || x === "first" || x === "last"), `${th.id}/${f} has no name`);
    if (th.group === "classic") assert.ok(fields.includes("role"), `${th.id}/${f} has no role`); // some posters show role as a colour or sticker instead
  }
});

test("poster themes are drawn for their own shapes and fall back elsewhere", () => {
  for (const p of POSTERS) {
    assert.ok(p.fmts.every((f) => posterFmt(f)), `${p.id} claims a non-poster shape`);
    const own = themeById(p.id).make(p.fmts[0]);
    assert.ok(own.els.length >= 8);
    const other = themeById(p.id).make("wallet");
    assert.equal(fmtOf(other), "wallet"); // rebuilt from a classic palette, not stretched
  }
});

test("suggest() picks an existing theme that suits the shape, and is stable", () => {
  for (const f of FMTS) {
    const id = suggest(null, "Konkan Kings", f);
    const th = themeById(id);
    assert.ok(th, `no theme ${id}`);
    assert.equal(th.group === "poster", posterFmt(f), `${f} got a ${th.group} theme`);
    assert.equal(suggest(null, "Konkan Kings", f), id);
  }
  for (const v of VIBES) assert.ok(themeById(suggest(v, "Deadly Duos", "wallet")));
  assert.notEqual(new Set(["A", "B", "C", "D", "E", "F"].map((n) => suggest(null, "Team " + n, "wallet"))).size, 1); // different teams spread across themes
});

test("role colours cover every role", () => {
  for (const r of ROLES) assert.match(ROLE_COLOURS[r], /^#[0-9a-f]{6}$/i, r);
});

test("every card shape has a real size and a sensible number of columns", () => {
  for (const [k, f] of Object.entries(FORMATS)) {
    assert.ok(f.w > 10 && f.h > 10 && f.w <= 210 && f.h <= 297, k);
    assert.ok(f.cols >= 1 && f.cols * f.w <= 190 + 20, `${k}: ${f.cols} columns of ${f.w} mm will not fit on A4`);
  }
});

test("backs: every shape except the wristband gets one, with a QR, the event and the organiser", () => {
  for (const th of THEMES) for (const f of FMTS) {
    const front = th.make(f), back = buildBack(front);
    if (f === "strip") { assert.equal(back, undefined); continue; }
    assert.ok(back, `${th.id}/${f} has no back`);
    assert.deepEqual(geometryProblems(back.els, `${th.id}/${f} back`), []);
    assert.ok(back.els.some((e) => e.kind === "qr"), `${th.id}/${f} back has no QR`);
    const fields = back.els.filter((e) => e.kind === "field").map((e) => e.field);
    for (const need of ["event", "organiser", "emergency", "rules"]) assert.ok(fields.includes(need), `${th.id}/${f} back lacks ${need}`);
    assert.ok(back.els.some((e) => e.bind === "sponsor"), "back should have a sponsor slot");
    const rules = back.els.find((e) => e.field === "rules");
    assert.equal(rules.lines, true);
  }
});

test("back colours follow the front: light fronts get a light back, dark fronts a dark one", () => {
  const light = buildBack(themeById("arctic").make("wallet")), dark = buildBack(themeById("carbon").make("wallet"));
  assert.equal(light.bg.a, "#ffffff");
  assert.equal(dark.bg.a, "#0b0f14");
});
