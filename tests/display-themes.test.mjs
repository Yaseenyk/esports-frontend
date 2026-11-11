// Every screen design must be readable, complete and selectable from a link.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DISPLAY_THEMES, THEME_IDS, contrast, fontCss, rankStyle, surface, themeById } from "../src/lib/display-themes.ts";
import { lookFrom } from "../src/lib/display.ts";
import { FONTS } from "../src/lib/idcard/types.ts";

const ROWS = ["pill", "slab", "slant", "outline", "glass", "stripe"];
const RANKS = ["plain", "block", "circle"];
const HEADS = ["plain", "bar", "underline"];
const HEX = /^#[0-9a-f]{6}$/i;

test("there are at least 14 designs with unique ids and names, and the three original ids still work", () => {
  assert.ok(DISPLAY_THEMES.length >= 14);
  assert.equal(new Set(THEME_IDS).size, THEME_IDS.length);
  assert.equal(new Set(DISPLAY_THEMES.map((t) => t.name)).size, DISPLAY_THEMES.length);
  for (const id of ["dark", "neon", "light"]) assert.ok(THEME_IDS.includes(id), `${id} must keep working for links already shared`);
});

test("every design is complete and uses only known fonts and styles", () => {
  for (const t of DISPLAY_THEMES) {
    assert.ok(t.name && t.tags.length, t.id);
    assert.ok(["Stream", "Venue", "Light"].includes(t.group), t.id);
    assert.ok(t.font in FONTS, `${t.id}: font ${t.font}`);
    assert.ok(ROWS.includes(t.rows) && RANKS.includes(t.rank) && HEADS.includes(t.head), t.id);
    for (const k of ["fg", "soft", "accent", "accent2", "on", "base"]) assert.match(t[k], HEX, `${t.id}.${k}`);
    assert.equal(t.medals.length, 3);
    t.medals.forEach((m) => assert.match(m, HEX));
    assert.ok(t.radius >= 0 && t.radius < 5, `${t.id} radius`);
    assert.ok(fontCss(t).length > 5);
  }
});

test("text is readable on every design (WCAG AA)", () => {
  for (const t of DISPLAY_THEMES) {
    assert.ok(contrast(t.fg, t.base) >= 7, `${t.id}: main text ${contrast(t.fg, t.base).toFixed(1)}:1`); // a TV is read from across a room, so aim above AA
    assert.ok(contrast(t.soft, t.base) >= 4.5, `${t.id}: soft text ${contrast(t.soft, t.base).toFixed(1)}:1`);
    assert.ok(contrast(t.accent, t.base) >= 4.5, `${t.id}: accent on the screen ${contrast(t.accent, t.base).toFixed(1)}:1`);
    assert.ok(contrast(t.on, t.accent) >= 4.5, `${t.id}: text on the accent colour ${contrast(t.on, t.accent).toFixed(1)}:1`);
    t.medals.forEach((m, i) => assert.ok(contrast(m, t.base) >= 3 || contrast("#0b0b0b", m) >= 4.5, `${t.id}: medal ${i + 1}`));
  }
});

test("the designs differ in structure, not only in colour", () => {
  const sig = new Set(DISPLAY_THEMES.map((t) => [t.rows, t.rank, t.head, t.font].join("|")));
  assert.ok(sig.size >= 10, `only ${sig.size} different structures`);
  for (const r of ROWS) assert.ok(DISPLAY_THEMES.some((t) => t.rows === r), `no design uses ${r} rows`);
});

test("surface and rank styles return plain, finite CSS for every design and row", () => {
  for (const t of DISPLAY_THEMES) for (let i = 0; i < 6; i++) {
    for (const st of [surface(t, i), rankStyle(t, i)]) for (const [k, v] of Object.entries(st)) assert.ok(typeof v === "string" || typeof v === "number", `${t.id}.${k}`);
  }
  assert.notEqual(surface(themeById("dark"), 0).background, surface(themeById("arctic"), 1).background);
  assert.equal(themeById("nope").id, "dark");
  assert.equal(themeById(null).id, "dark");
});

test("a link can pick any design, and an unknown one falls back safely", () => {
  for (const id of THEME_IDS) assert.equal(lookFrom(new URLSearchParams(`theme=${id}`)).theme, id);
  assert.equal(lookFrom(new URLSearchParams("theme=__proto__")).theme, "dark");
  assert.equal(lookFrom(new URLSearchParams("theme=<script>")).theme, "dark");
});

test("the page copy states the real number of designs", () => {
  const src = readFileSync(new URL("../src/lib/tool-pages.ts", import.meta.url), "utf8");
  assert.ok(src.includes(`${DISPLAY_THEMES.length} screen designs`), `tool-pages.ts must say "${DISPLAY_THEMES.length} screen designs"`);
});
