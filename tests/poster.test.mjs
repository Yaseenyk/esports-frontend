// The poster maker: the layout maths, the text helpers, the looks and the footer honeycomb arithmetic. Drawing needs a browser and is covered in e2e/growth.spec.ts.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { cleanPoster, fitTitle, formatPosterDate, MAX_POSTER_SPONSORS, POSTER_FORMATS, POSTER_SIZES, POSTER_TEMPLATES, posterFileName, posterLayout, posterText, sponsorBoxes, templateById, wrapLines } from "../src/lib/poster-cards.ts";
import { FOOTER_TEXT } from "../src/lib/share-cards.ts";
import { THEME_IDS } from "../src/lib/display-themes.ts";
import { TOOLS } from "../src/lib/data.ts";

const measure = (s) => s.length * 10;
const ALL = { info: true, prize: true, organiser: true, sponsors: true };
const NONE = { info: false, prize: false, organiser: false, sponsors: false };
const inside = (r, w, h) => r.x >= 0 && r.y >= 0 && r.x + r.w <= w && r.y + r.h <= h;
const blocks = (L) => [L.tag, L.title, L.info, L.prize, L.organiser, L.sponsors, L.footer].filter(Boolean);

test("the three shapes are 4:5, 9:16 and square at phone resolution", () => {
  assert.deepEqual([...POSTER_FORMATS].sort(), ["poster", "square", "story"]);
  assert.deepEqual([POSTER_SIZES.poster.w, POSTER_SIZES.poster.h], [1080, 1350]);
  assert.deepEqual([POSTER_SIZES.story.w, POSTER_SIZES.story.h], [1080, 1920]);
  assert.deepEqual([POSTER_SIZES.square.w, POSTER_SIZES.square.h], [1080, 1080]);
});

test("there are looks for Free Fire, BGMI, Valorant, cricket and football, each on a real display design", () => {
  assert.deepEqual(POSTER_TEMPLATES.map((t) => t.id), ["free-fire", "bgmi", "valorant", "cricket", "football"]);
  for (const t of POSTER_TEMPLATES) assert.ok(THEME_IDS.includes(t.theme), `${t.id} uses unknown design ${t.theme}`);
  assert.equal(new Set(POSTER_TEMPLATES.map((t) => t.theme)).size, POSTER_TEMPLATES.length, "each look has its own design");
  assert.equal(templateById("nope").id, "free-fire");
});

test("cleanPoster trims fields, collapses spaces and keeps two sponsors at most", () => {
  const c = cleanPoster({ event: "  Spring   Cup ".padEnd(200, "x"), date: "", venue: "  Hall ", game: "", prize: "", organiser: "", sponsors: [{ name: "A" }, { name: "B", logo: "data:image/png;base64,AA==" }, { name: "C" }] });
  assert.ok(c.event.length <= 60 && c.event.startsWith("Spring Cup"));
  assert.equal(c.venue, "Hall");
  assert.equal(c.sponsors.length, MAX_POSTER_SPONSORS);
  assert.equal(c.sponsors[1].logo, "data:image/png;base64,AA==");
  assert.ok(!("logo" in c.sponsors[0]));
});

test("formatPosterDate writes a real date in words and leaves other text alone", () => {
  assert.equal(formatPosterDate("2026-12-05"), "5 December 2026");
  assert.equal(formatPosterDate("2027-01-31"), "31 January 2027");
  assert.equal(formatPosterDate("2026-02-30"), "2026-02-30");
  assert.equal(formatPosterDate("Saturday 6 PM"), "Saturday 6 PM");
  assert.equal(formatPosterDate(""), "");
});

test("wrapLines breaks at spaces, cuts the last line with an ellipsis and cuts a word that is too wide", () => {
  assert.deepEqual(wrapLines("Inter College Cup", 100, measure, 4), ["Inter", "College", "Cup"]);
  assert.deepEqual(wrapLines("Inter College Cup", 130, measure, 4), ["Inter College", "Cup"]);
  const cut = wrapLines("one two three four five six seven eight", 60, measure, 2);
  assert.equal(cut.length, 2); assert.ok(cut[1].endsWith("…")); assert.ok(cut.every((l) => measure(l) <= 60));
  const long = wrapLines("Supercalifragilistic", 50, measure, 3);
  assert.equal(long.length, 1); assert.ok(measure(long[0]) <= 50 && long[0].endsWith("…"));
  assert.deepEqual(wrapLines("", 100, measure), []);
});

test("fitTitle picks the biggest size that fits, smaller for longer names, and never overflows the box", () => {
  const at = (s, size) => s.length * size * 0.5;
  const short = fitTitle("Spring Cup", 900, 600, at), long = fitTitle("Inter-College Free Fire Championship Season Two Grand Finals", 900, 600, at);
  assert.ok(short.size >= long.size && short.size <= 190);
  for (const r of [short, long]) {
    assert.ok(r.lines.length <= 4);
    assert.ok(r.lines.length * r.size * 1.04 <= 600 + 0.001 || r.size === 56);
    assert.ok(r.lines.every((l) => at(l, r.size) <= 900));
  }
});

test("every layout stays inside the poster, in order from the top, with no blocks overlapping", () => {
  for (const f of POSTER_FORMATS) {
    const { w, h } = POSTER_SIZES[f];
    for (const has of [ALL, NONE, { ...ALL, sponsors: false }, { ...NONE, prize: true }]) {
      const L = posterLayout(f, has), list = blocks(L).sort((a, b) => a.y - b.y);
      for (const r of list) assert.ok(inside(r, w, h), `${f}: block outside the poster ${JSON.stringify(r)}`);
      for (let i = 1; i < list.length; i++) assert.ok(list[i - 1].y + list[i - 1].h <= list[i].y, `${f}: blocks overlap`);
      assert.ok(L.title.h >= 200, `${f}: title area only ${L.title.h}px tall`);
      assert.equal(Boolean(L.info), has.info); assert.equal(Boolean(L.prize), has.prize); assert.equal(Boolean(L.organiser), has.organiser); assert.equal(Boolean(L.sponsors), has.sponsors);
    }
  }
});

test("a block with nothing in it gives its room to the title", () => {
  for (const f of POSTER_FORMATS) assert.ok(posterLayout(f, NONE).title.h > posterLayout(f, ALL).title.h + 300);
  assert.ok(posterLayout("story", ALL).title.h > posterLayout("square", ALL).title.h);
});

test("sponsor boxes are equal, at most 300 wide, inside the strip and apart", () => {
  const strip = { x: 72, y: 100, w: 936, h: 120 };
  assert.deepEqual(sponsorBoxes(0, strip), []);
  for (const n of [1, 2]) {
    const b = sponsorBoxes(n, strip);
    assert.equal(b.length, n);
    for (const r of b) { assert.ok(r.w <= 300 && r.x >= strip.x && r.x + r.w <= strip.x + strip.w); assert.equal(r.h, strip.h); }
    if (n === 2) assert.ok(b[0].x + b[0].w < b[1].x);
  }
});

test("the WhatsApp text has only what was typed, one fact per line, and the footer", () => {
  const t = posterText({ event: "Spring Cup", date: "2026-12-05", venue: "", game: "BGMI", prize: "Trophy", organiser: "Tech Club", sponsors: [{ name: "Acme" }, { name: "" }] });
  assert.deepEqual(t.split("\n"), ["Spring Cup", "BGMI", "5 December 2026", "Prize: Trophy", "Organised by Tech Club", "Sponsors: Acme", FOOTER_TEXT]);
  const bare = posterText({ event: "Cup", date: "", venue: "", game: "", prize: "", organiser: "", sponsors: [] });
  assert.deepEqual(bare.split("\n"), ["Cup", FOOTER_TEXT]);
  assert.ok(!/undefined|null/.test(t + bare));
});

test("file names are safe and say the shape", () => {
  assert.equal(posterFileName("Spring Cup 2026!", "poster"), "spring-cup-2026-poster.png");
  assert.equal(posterFileName("Spring Cup", "story"), "spring-cup-story.png");
  assert.equal(posterFileName("", "square"), "tournament-square.png");
  assert.ok(/^[a-z0-9.-]+$/.test(posterFileName("Ünï Cup / ?", "square")));
});

test("the footer honeycomb has a tile for every tool and both layouts add up to the tool count", () => {
  const src = fs.readFileSync(new URL("../src/components/SiteFooter.tsx", import.meta.url), "utf8");
  const tiles = [...src.matchAll(/^\s+"?([a-z-]+)"?: \{ label: "/gm)].map((m) => m[1]);
  for (const t of TOOLS) assert.ok(tiles.includes(t.slug), `no footer tile for ${t.slug}`);
  const wide = JSON.parse(/fx-comb-wide[^]*?chunk\(slugs, (\[[\d, ]+\])\)/.exec(src)[1]);
  const narrow = JSON.parse(/fx-comb-narrow[^]*?chunk\(slugs, (\[[\d, ]+\])\)/.exec(src)[1]);
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  assert.equal(sum(wide), TOOLS.length, "wide layout");
  assert.equal(sum(narrow), TOOLS.length, "narrow layout");
  // Wide rows have the same count (every second row is shifted half a hexagon). Narrow rows are centred, so neighbours must differ by one to interlock.
  assert.ok(wide.every((n) => n === wide[0]) && wide[0] <= 5);
  for (let i = 1; i < narrow.length; i++) assert.equal(Math.abs(narrow[i] - narrow[i - 1]), 1);
  assert.ok(Math.max(...narrow) <= 3, "narrow rows must fit a 320px phone");
});
