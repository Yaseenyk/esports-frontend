// Run: node --import tsx --test tests/embed.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { EMBED_ORIGIN, clampHeight, cleanTeam, embedUrl, heightFromMessage, iframeSnippet, isSlug, isTheme, isView, parseEmbedQuery, scriptSnippet } from "../src/lib/embed.ts";

const LOADER = fs.readFileSync(new URL("../public/embed.js", import.meta.url), "utf8");

test("slug, view and theme validation", () => {
  assert.ok(isSlug("abcd1234efgh") && isSlug("my-cup-26"));
  for (const s of ["ab", "A-bc", "a b c", "x".repeat(41), "a/../b", "", null, 5]) assert.equal(isSlug(s), false, String(s));
  assert.ok(isView("bracket") && !isView("countdown") && !isView(undefined));
  assert.ok(isTheme("light") && !isTheme("blue"));
});

test("embedUrl builds a safe address and falls back to defaults", () => {
  assert.equal(embedUrl({ slug: "spring-cup" }), `${EMBED_ORIGIN}/embed/?e=spring-cup&v=standings&theme=dark`);
  assert.equal(embedUrl({ slug: "spring-cup", view: "matches", theme: "light", team: "Team A&B" }), `${EMBED_ORIGIN}/embed/?e=spring-cup&v=matches&theme=light&team=Team%20A%26B`);
  assert.equal(embedUrl({ slug: "spring-cup", view: "evil", theme: "x" }), `${EMBED_ORIGIN}/embed/?e=spring-cup&v=standings&theme=dark`);
  assert.equal(embedUrl({ slug: "bad slug" }), "");
  assert.equal(embedUrl({ slug: "spring-cup", id: "eh1" }, "http://localhost:3000/"), "http://localhost:3000/embed/?e=spring-cup&v=standings&theme=dark&id=eh1");
});

test("team names are plain text, trimmed and capped", () => {
  assert.equal(cleanTeam("  Alpha\u0000\n "), "Alpha");
  assert.equal(cleanTeam("x".repeat(100)).length, 60);
  assert.equal(cleanTeam(5), "");
});

test("parseEmbedQuery", () => {
  assert.deepEqual(parseEmbedQuery("?e=spring-cup&v=bracket&theme=light&team=Alpha&id=eh2"), { slug: "spring-cup", view: "bracket", theme: "light", team: "Alpha", id: "eh2" });
  assert.deepEqual(parseEmbedQuery("?e=spring-cup&v=zzz&id=<b>"), { slug: "spring-cup", view: "standings", theme: "dark", team: "", id: "" });
  assert.equal(parseEmbedQuery("?v=bracket"), null);
  assert.equal(parseEmbedQuery("?e=NO"), null);
});

test("height clamping is 120 to 2000 in whole pixels", () => {
  assert.equal(clampHeight(5), 120);
  assert.equal(clampHeight(480.4), 480);
  assert.equal(clampHeight(99999), 2000);
  assert.equal(clampHeight(Infinity), 120);
  assert.equal(clampHeight("300"), 300);
  assert.equal(clampHeight("abc"), 120);
  assert.equal(clampHeight(undefined), 120);
});

test("message validation: our origin, our type, a finite number", () => {
  const ok = { type: "eh-embed-height", height: 500, id: "eh1" };
  assert.equal(heightFromMessage(EMBED_ORIGIN, ok), 500);
  assert.equal(heightFromMessage(EMBED_ORIGIN, { ...ok, height: 9000 }), 2000);
  assert.equal(heightFromMessage("https://evil.example", ok), null);
  assert.equal(heightFromMessage(EMBED_ORIGIN, { ...ok, type: "other" }), null);
  assert.equal(heightFromMessage(EMBED_ORIGIN, { ...ok, height: "500" }), null);
  assert.equal(heightFromMessage(EMBED_ORIGIN, { ...ok, height: NaN }), null);
  assert.equal(heightFromMessage(EMBED_ORIGIN, null), null);
  assert.equal(heightFromMessage(EMBED_ORIGIN, "eh-embed-height"), null);
});

test("snippets are valid, escaped and use the right address", () => {
  const f = iframeSnippet({ slug: "spring-cup", view: "bracket", theme: "light", team: 'A"<b>' });
  assert.match(f, /^<iframe src="https:\/\/esports\.streamerosai\.com\/embed\/\?e=spring-cup&amp;v=bracket&amp;theme=light&amp;team=/);
  assert.ok(!f.includes("<b>") && f.includes('sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"') && f.includes('loading="lazy"') && f.includes("title="));
  const s = scriptSnippet({ slug: "spring-cup", view: "schedule", theme: "dark", team: 'A"<b>' });
  assert.ok(s.includes('data-esports-hub="spring-cup"') && s.includes('data-view="schedule"') && s.includes('data-team="A&quot;&lt;b&gt;"') && s.includes('src="https://esports.streamerosai.com/embed.js"'));
  assert.equal(iframeSnippet({ slug: "x" }), "");
  assert.equal(scriptSnippet({ slug: "x" }), "");
});

// ---- public/embed.js, run in a VM with a fake document ----
function runLoader(divs, readyState = "complete") {
  const listeners = {}, docL = {};
  const mkEl = (attrs) => {
    const a = { ...attrs };
    return { children: [], style: {}, getAttribute: (k) => (k in a ? a[k] : null), setAttribute(k, v) { a[k] = String(v); }, appendChild(c) { this.children.push(c); }, attrs: a };
  };
  const els = divs.map(mkEl);
  const document = {
    readyState,
    querySelectorAll: (sel) => (sel === "[data-esports-hub]" ? els : []),
    createElement: (t) => { const e = mkEl({}); e.tag = t; e.contentWindow = { id: Math.random() }; return e; },
    addEventListener: (n, fn) => { docL[n] = fn; },
  };
  const window = { addEventListener: (n, fn) => { listeners[n] = fn; } };
  vm.runInNewContext(LOADER, { window, document, isFinite, Math, encodeURIComponent, String });
  const frames = els.map((e) => e.children[0]);
  return { els, frames, message: (m) => listeners.message(m), docL };
}

test("embed.js is tiny and ES5-only", () => {
  assert.ok(Buffer.byteLength(LOADER) < 2048, `size ${Buffer.byteLength(LOADER)}`);
  assert.ok(!/=>|\b(let|const)\b|`/.test(LOADER.replace(/\/\*[\s\S]*?\*\//, "")), "no ES2015 syntax");
});

test("embed.js injects a sandboxed lazy iframe whose address matches embedUrl", () => {
  const { frames } = runLoader([{ "data-esports-hub": "spring-cup", "data-view": "bracket", "data-theme": "light", "data-team": " Alpha " }, { "data-esports-hub": "spring-cup" }]);
  const [a, b] = frames;
  assert.equal(a.src, embedUrl({ slug: "spring-cup", view: "bracket", theme: "light", team: "Alpha", id: "eh1" }));
  assert.equal(b.src, embedUrl({ slug: "spring-cup", id: "eh2" }));
  assert.equal(a.attrs.sandbox, "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox");
  assert.equal(a.attrs.loading, "lazy");
  assert.equal(a.attrs.title, "Live on Esports Hub");
  assert.ok(a.style.cssText.includes("width:100%"));
});

test("embed.js ignores bad slugs and never builds one div twice", () => {
  const { frames, els } = runLoader([{ "data-esports-hub": "no" }, { "data-esports-hub": "Bad Slug" }, { "data-esports-hub": "ok-slug", "data-eh-ready": "1" }, { "data-esports-hub": "ok-slug", "data-view": "x", "data-theme": "x" }]);
  assert.deepEqual(frames.map(Boolean), [false, false, false, true]);
  assert.match(frames[3].src, /v=standings&theme=dark/);
  assert.equal(els[3].attrs["data-eh-ready"], "1");
});

test("embed.js waits for the page when it is still loading", () => {
  const { frames, docL } = runLoader([{ "data-esports-hub": "spring-cup" }], "loading");
  assert.equal(frames[0], undefined);
  assert.equal(typeof docL.DOMContentLoaded, "function");
});

test("embed.js resizes only from our origin and only the matching frame", () => {
  const r = runLoader([{ "data-esports-hub": "spring-cup" }, { "data-esports-hub": "other-cup" }]);
  const [a, b] = r.frames;
  const T = "eh-embed-height";
  const msg = (over) => ({ origin: EMBED_ORIGIN, source: a.contentWindow, data: { type: T, height: 640, id: "eh1" }, ...over });
  r.message(msg());
  assert.equal(a.style.height, "640px");
  assert.equal(b.style.height, undefined);
  r.message(msg({ data: { type: T, height: 5 } })); assert.equal(a.style.height, "120px");
  r.message(msg({ data: { type: T, height: 50000 } })); assert.equal(a.style.height, "2000px");
  const before = a.style.height;
  r.message(msg({ origin: "https://evil.example", data: { type: T, height: 777 } })); assert.equal(a.style.height, before);
  r.message(msg({ source: { other: 1 } })); assert.equal(a.style.height, before);
  r.message(msg({ data: { type: "x", height: 300 } })); assert.equal(a.style.height, before);
  r.message(msg({ data: { type: T, height: "300" } })); assert.equal(a.style.height, before);
  r.message(msg({ data: { type: T, height: NaN } })); assert.equal(a.style.height, before);
  r.message(msg({ data: null })); assert.equal(a.style.height, before);
  // the loader and the library agree on every height
  for (const h of [0, 1, 119.5, 120, 480, 1999.6, 2000, 2001, 1e9]) { r.message(msg({ data: { type: T, height: h } })); assert.equal(a.style.height, `${heightFromMessage(EMBED_ORIGIN, { type: T, height: h })}px`); }
});
