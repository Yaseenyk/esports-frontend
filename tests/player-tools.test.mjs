// The player tools added on 25 Nov 2026: name styles (Free Fire, BGMI), the reaction time and tap speed tests, and the Valorant
// crosshair code tool. Pure logic only; the pages are checked by e2e/player-tools.spec.ts.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import * as F from "../src/features/shared/fancy-text.ts";
import * as N from "../src/features/name-style/domain.ts";
import * as T from "../src/features/team-name/domain.ts";
import * as R from "../src/features/reflex/domain.ts";
import * as X from "../src/features/crosshair/domain.ts";
import { TOOL_PAGES } from "../src/lib/tool-pages.ts";
import { TOOLS } from "../src/lib/data.ts";
import { TOOL_TILES } from "../src/lib/tool-icons.ts";
import { NICK_FF_PT, SENS_PT, GUILD_PT } from "../src/lib/tool-pages-pt.ts";

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const NEW = ["free-fire-name-style", "bgmi-name-style", "reaction-time-test", "tap-speed-test", "valorant-crosshair"];

// ------------------------------------------------------------------ fancy letters and name styles

test("fancy letters: every style maps A-Z, a-z and turns back into the same plain letters for the name check", () => {
  const abc = "AbcXyz09";
  for (const s of N.STYLES) {
    const out = F.styleLetters(abc, s);
    if (s !== "plain") assert.notEqual(out, abc, s);
    assert.equal(T.unstyle(out).toLowerCase().replace(/[^a-z0-9]/g, ""), s === "script" || s === "fraktur" ? "abcxyz09" : "abcxyz09", s);
  }
  assert.equal(F.styleLetters("Chart", "double"), "ℂ𝕙𝕒𝕣𝕥", "double-struck uses the older ℂ for C");
  assert.equal(F.charCount("꧁𝐑𝐚𝐣꧂"), 5);
});

test("fancy letters: Portuguese accents (ç, ã, é) are kept and still checked", () => {
  for (const s of N.STYLES) assert.match(F.styleLetters("João Conceição é", s), /ã.*ç.*ã.*é/u, s);
  assert.equal(T.unstyle(F.styleLetters("Conceição", "bold")), "Conceicao");
  assert.equal(N.nameProblem("Conceição"), undefined);
});

test("the guild generator's stylish() still works after the refactor", () => {
  assert.equal(T.stylish("Iron Owls", "bold", "curl"), "꧁𝐈𝐫𝐨𝐧 𝐎𝐰𝐥𝐬꧂");
  assert.equal(T.stylish("Iron Owls", "smallcaps", "none"), "ɪʀᴏɴ ᴏᴡʟꜱ");
  assert.equal(T.stylish("Iron Owls", "wide", "stars"), "★Ｉｒｏｎ Ｏｗｌｓ★");
});

test("name styles: every style with the frame and clan tag, plain first, with font support labels", () => {
  const v = N.variants("Raj", "curl", "INB", "corner");
  assert.equal(v.length, N.STYLES.length);
  assert.equal(v[0].text, "『INB』꧁Raj꧂");
  assert.equal(v[0].support, "plain");
  assert.ok(v.find((x) => x.style === "bold").support === "newer");
  assert.ok(v.find((x) => x.style === "smallcaps").support === "common");
  assert.equal(N.styleName("Raj", "plain", "none", "", "bar"), "Raj");
  assert.equal(N.styleName("Raj", "plain", "none", "AB", "bar"), "AB丨Raj");
});

test("name styles: only abusive words are refused; a game name in a player's own nickname is allowed; this tool's own limits", () => {
  assert.equal(N.nameProblem(""), "empty");
  assert.equal(N.nameProblem("x".repeat(N.NAME_INPUT_MAX + 1)), "long");
  assert.equal(N.nameProblem("Raj", "TOOLONG"), "tag");
  assert.equal(N.nameProblem("FF Raj"), undefined);
  assert.equal(N.nameProblem("bitch"), "slur");
  assert.equal(N.nameProblem("𝐛𝐢𝐭𝐜𝐡"), "slur", "decorated letters cannot hide a slur");
});

test("ready-made names: 60 per game, the same every build, short, unique, checked and different per game", () => {
  for (const g of ["free-fire", "bgmi"]) {
    const a = N.readyNames(g), b = N.readyNames(g);
    assert.equal(a.length, 60, g);
    assert.deepEqual(a, b, "deterministic");
    assert.equal(new Set(a.map((n) => n.plain.toLowerCase())).size, 60);
    for (const n of a) {
      assert.ok(F.charCount(n.plain) <= N.READY_MAX, n.plain);
      assert.equal(T.checkName(n.styled).blocked, false, n.styled);
      assert.notEqual(n.styled, n.plain);
    }
  }
  assert.notDeepEqual(N.readyNames("free-fire").map((n) => n.plain), N.readyNames("bgmi").map((n) => n.plain));
  assert.ok(N.SYMBOLS.length >= 20);
});

test("name style pages claim no character limit and cite Garena only for what it says", () => {
  for (const t of [TOOL_PAGES["free-fire-name-style"], TOOL_PAGES["bgmi-name-style"], NICK_FF_PT]) {
    const text = JSON.stringify(t);
    assert.doesNotMatch(text, /\b1[0-9]-character|limit of \d|\d+ characters (max|long)/i, t.slug);
    assert.ok(t.faq.length >= 6, t.slug);
  }
  assert.ok(JSON.stringify(TOOL_PAGES["free-fire-name-style"]).includes(N.SOURCES.ffNickname));
  assert.ok(JSON.stringify(TOOL_PAGES["bgmi-name-style"]).includes(N.SOURCES.bgmiRename));
  assert.match(TOOL_PAGES["free-fire-name-style"].faq.find((f) => /How many characters/.test(f.q)).a, /could not confirm/);
});

// ------------------------------------------------------------------ reaction and tap

test("reaction: early taps and guesses do not count, the wait is random within its range, averages round", () => {
  assert.deepEqual(R.judgeTap(1000, null), { ok: false, why: "early" });
  assert.deepEqual(R.judgeTap(1000, 1200), { ok: false, why: "early" });
  assert.deepEqual(R.judgeTap(1050, 1000), { ok: false, why: "guess" });
  assert.deepEqual(R.judgeTap(1250.4, 1000), { ok: true, ms: 250 });
  assert.equal(R.randomWait(0), R.WAIT_MIN_MS);
  assert.equal(R.randomWait(1), R.WAIT_MAX_MS);
  assert.equal(R.average([200, 250, 301]), 250);
  assert.equal(R.best([300, 210, 250]), 210);
  assert.equal(R.TRIES, 5);
});

test("tap: taps per second to one decimal", () => {
  assert.equal(R.tapsPerSecond(67, 10), 6.7);
  assert.equal(R.tapsPerSecond(33, 5), 6.6);
  assert.equal(R.tapsPerSecond(10, 0), 0);
});

test("results on this device: a damaged store becomes empty; best is kept; recent is capped", () => {
  assert.deepEqual(R.parseStore("not json"), R.EMPTY_STORE);
  assert.deepEqual(R.parseStore('{"reaction":{"best":-5,"recent":["x",250]},"taps":{"5":30,"7":99}}'), { reaction: { best: undefined, recent: [250] }, taps: { 5: 30 } });
  let s = R.EMPTY_STORE;
  for (let i = 0; i < 12; i++) s = R.addReaction(s, 300 - i);
  assert.equal(s.reaction.best, 289);
  assert.equal(s.reaction.recent.length, R.RECENT_MAX);
  const a = R.addTaps(R.EMPTY_STORE, 10, 60), b = R.addTaps(a.store, 10, 50);
  assert.equal(a.isBest, true); assert.equal(b.isBest, false); assert.equal(b.store.taps["10"], 60);
});

test("reaction page quotes the benchmark with its source and date, and no invented average", () => {
  const t = JSON.stringify(TOOL_PAGES["reaction-time-test"]);
  assert.ok(t.includes(R.BENCHMARK.url) && t.includes(R.BENCHMARK.checked) && t.includes(`${R.BENCHMARK.median} milliseconds`));
  assert.match(TOOL_PAGES["tap-speed-test"].faq[0].a, /no official benchmark/);
});

// ------------------------------------------------------------------ crosshair

test("crosshair: reads a code, keeps what it does not edit, and writes only non-default keys", () => {
  const r = X.parseCode("0;s;1;P;c;5;h;0;0l;4;0o;2;0a;1;0f;0;1b;0;A;c;1;S;d;0");
  assert.ok(r.ok);
  const p = r.value.primary;
  assert.equal(p.colour, 5); assert.equal(p.outlines, false); assert.equal(p.inner.length, 4); assert.equal(p.inner.offset, 2); assert.equal(p.inner.opacity, 1); assert.equal(p.outer.show, false);
  assert.deepEqual(r.value.general, ["s", "1"]);
  assert.deepEqual(r.value.extra, [["0f", "0"]]);
  assert.deepEqual(r.value.rest, ["A", "c", "1", "S", "d", "0"]);
  assert.equal(X.encodeCode(r.value), "0;s;1;P;c;5;h;0;0l;4;0o;2;0a;1;1b;0;0f;0;A;c;1;S;d;0");
  // Re-reading the written code gives the same crosshair.
  assert.deepEqual(X.parseCode(X.encodeCode(r.value)).value.primary, p);
});

test("crosshair: defaults give the shortest code; bad codes are refused with a reason", () => {
  assert.equal(X.encodeCode(X.fresh()), "0");
  assert.ok(X.parseCode("0").ok);
  assert.deepEqual(X.parseCode(""), { ok: false, error: "empty" });
  assert.deepEqual(X.parseCode("1;P;c;5"), { ok: false, error: "start" });
  assert.deepEqual(X.parseCode("0;P;c"), { ok: false, error: "pairs" });
  assert.ok(X.parseCode(" 0;P;c;1; ").ok, "spaces and a trailing ; are tolerated");
  const v = X.fresh(); v.primary.dot = true; v.primary.inner.split = true; v.primary.inner.vertical = 9;
  assert.equal(X.encodeCode(v), "0;P;d;1;0v;9;0g;1");
});

test("crosshair: values are clamped to the decoders' ranges; custom colours are previewed and kept, not written fresh", () => {
  const r = X.parseCode("0;P;t;99;0l;-3;1o;500;a;7");
  assert.equal(r.value.primary.outlineThickness, 6); assert.equal(r.value.primary.inner.length, 0); assert.equal(r.value.primary.outer.offset, 40); assert.equal(r.value.primary.dotOpacity, 1);
  const c = X.parseCode("0;P;c;8;u;FF8800FF;h;0");
  assert.equal(c.value.primary.custom, "#FF8800");
  assert.equal(X.colourHex(c.value.primary), "#FF8800");
  assert.match(X.encodeCode(c.value), /c;8.*u;FF8800FF/);
  const swapped = { ...c.value, primary: { ...c.value.primary, colour: 1, custom: undefined } };
  assert.equal(X.encodeCode(swapped), "0;P;c;1;h;0", "picking a preset drops the custom keys");
  assert.deepEqual(X.parseCode("0;P;u;XYZ"), { ok: false, error: "value" });
});

test("crosshair: preview shapes, favourites and share links", () => {
  const p = structuredClone(X.DEFAULTS);
  const rects = X.previewRects(p);
  assert.equal(rects.length, 16, "4 inner + 4 outer lines, each with an outline behind");
  p.outlines = false; p.outer.show = false; p.dot = true;
  assert.equal(X.previewRects(p).length, 5);
  assert.deepEqual(X.parseFavourites('[{"name":"a","code":"0;P;c;1"},{"name":"b","code":"bad"},5]'), [{ name: "a", code: "0;P;c;1" }]);
  const f = X.addFavourite(X.addFavourite([], "One", "0;P;c;1"), "  ", "0;P;c;1");
  assert.deepEqual(f, [{ name: "My crosshair", code: "0;P;c;1" }]);
  assert.equal(X.shareLink("https://esports.streamerosai.com", "0;P;c;1"), "https://esports.streamerosai.com/tools/valorant-crosshair/?c=0%3BP%3Bc%3B1");
});

// ------------------------------------------------------------------ registration

test("the new tools are registered everywhere a tool must be: TOOLS, TOOL_PAGES, icons, the /tools/ hub", () => {
  const hub = read("src/app/(site)/tools/page.tsx");
  for (const slug of NEW) {
    assert.ok(TOOLS.find((t) => t.slug === slug && t.href === `/tools/${slug}/`), slug);
    assert.ok(TOOL_PAGES[slug]?.updated, slug);
    assert.ok(TOOL_TILES[slug], slug);
    assert.ok(hub.includes(`slug: "${slug}"`), slug);
    assert.ok(fs.existsSync(new URL(`../src/app/(site)/tools/${slug}/page.tsx`, import.meta.url)), slug);
    const t = TOOL_PAGES[slug];
    assert.ok(t.title.length <= 60 && t.description.length <= 155, `${slug} title ${t.title.length} meta ${t.description.length}`);
    assert.equal((t.intro.match(/[.!?](\s|$)/g) ?? []).length, 2, `${slug}: two-sentence answer-first intro`);
    assert.doesNotMatch(t.intro, /welcome/i);
  }
  for (const t of [NICK_FF_PT, SENS_PT, GUILD_PT]) assert.ok(t.title.length <= 60 && t.description.length <= 155, t.path);
});

test("no analytics label carries typed text, and the tool areas are masked from Clarity", () => {
  for (const f of ["src/features/name-style/hooks/useNameStyle.ts", "src/features/reflex/hooks/useReaction.ts", "src/features/reflex/hooks/useTapSpeed.ts", "src/features/crosshair/hooks/useCrosshair.ts"]) {
    for (const m of read(f).matchAll(/sendEvent\(([^)]*)\)/g)) assert.match(m[1], /^"tool_complete", "[a-z-]+"$/, f);
  }
  for (const f of ["src/features/name-style/ui/NameStyleTool.tsx", "src/features/reflex/ui/ReactionTool.tsx", "src/features/reflex/ui/TapTool.tsx", "src/features/crosshair/ui/CrosshairTool.tsx"]) assert.match(read(f), /data-clarity-mask="true"/, f);
});
