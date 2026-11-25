// Run: node --import tsx --test tests/player-card.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { safeHref, toCardPath, toLinks, toOwnPlayerPage, toPlayerPage } from "../src/features/profiles/services/profiles.adapter.ts";
import { capPlayers, playerGateFailures, WEEK_SECONDS } from "../src/features/profiles/seo/player-gate.ts";
import { gateInputOf, playerDescription, playerJsonLd, playerTitle } from "../src/features/profiles/services/build-data.ts";
import { photoProblem, qrValue, withQr } from "../src/features/player-card/domain.ts";

const TOKEN = "AbCdEfGhIjKlMnOpQrStUv";

test("links render only as http(s), never javascript:, data: or with a login", () => {
  assert.equal(safeHref("https://twitch.tv/x"), "https://twitch.tv/x");
  assert.equal(safeHref("http://example.org/a"), "http://example.org/a");
  for (const bad of ["javascript:alert(1)", "JAVASCRIPT:alert(1)", " javascript:alert(1)", "data:text/html,<b>x</b>", "vbscript:x", "ftp://a.b", "https://u:p@a.org", "//evil.org", "x".repeat(201), 42, null]) assert.equal(safeHref(bad), null, String(bad));
  assert.deepEqual(toLinks([{ kind: "youtube", url: "javascript:alert(1)" }, { kind: "myspace", url: "https://myspace.com" }, { kind: "kick", url: "https://kick.com/a" }]), [{ kind: "kick", url: "https://kick.com/a" }]);
});

test("the QR can only ever hold a well-formed card link on this site", () => {
  assert.equal(toCardPath(`/p/?k=${TOKEN}`), `/p/?k=${TOKEN}`);
  for (const bad of [`https://evil.org/p/?k=${TOKEN}`, `/p/?k=${TOKEN}x`, "/p/?k=short", `/players/view/?s=ravi`, null, 1]) assert.equal(toCardPath(bad), null, String(bad));
  assert.equal(qrValue("https://esports.streamerosai.com/", `/p/?k=${TOKEN}`), `https://esports.streamerosai.com/p/?k=${TOKEN}`);
  assert.equal(qrValue("https://esports.streamerosai.com", "/p/?k=javascript:alert"), null);
  assert.equal(qrValue("https://esports.streamerosai.com", null), null);
});

test("own page: path follows visibility; a Link only path must be the card link", () => {
  const base = { slug: "ravi", indexable: false, indexBlockers: [], entries: [], matches: [], battleRoyale: [], certificates: [], teams: [], details: { teamName: "A", links: [], achievements: [], hiddenFields: ["bio", "nonsense"], searchOptIn: true } };
  assert.equal(toOwnPlayerPage({ page: { ...base, visibility: "private", path: "/players/view/?s=ravi", cardPath: null } }).path, null);
  assert.equal(toOwnPlayerPage({ page: { ...base, visibility: "public", path: "/players/view/?s=ravi", cardPath: `/p/?k=${TOKEN}` } }).path, "/players/view/?s=ravi");
  const u = toOwnPlayerPage({ page: { ...base, visibility: "unlisted", path: "/players/view/?s=ravi", cardPath: `/p/?k=${TOKEN}` } });
  assert.equal(u.path, null); // a slug path for a Link only page is refused
  assert.deepEqual(u.details.hiddenFields, ["bio"]);
  assert.equal(u.details.searchOptIn, true);
});

test("public page: a Link only page has no slug; odd values become safe defaults", () => {
  const p = toPlayerPage({ handle: "Ravi", slug: null, links: [{ kind: "x", url: "https://x.com/r" }], achievements: [{ title: "Cup", year: 2026 }, { title: "" }], teamName: "Wolves", visibility: "unlisted" });
  assert.equal(p.slug, null);
  assert.deepEqual(p.achievements, [{ title: "Cup", year: 2026 }]);
  assert.equal(toPlayerPage({ slug: "x" }), null);
});

test("the build's quality gate: Public, API indexable, rich bio plus a game OR a verified result", () => {
  const ok = { visibility: "public", apiIndexable: true, bioLength: 80, games: 1, verifiedResults: 0 };
  assert.deepEqual(playerGateFailures(ok), []);
  assert.deepEqual(playerGateFailures({ ...ok, bioLength: 79 }), ["thin_content"]);
  assert.deepEqual(playerGateFailures({ ...ok, bioLength: 0, games: 0, verifiedResults: 1 }), []);
  assert.deepEqual(playerGateFailures({ ...ok, visibility: "unlisted", apiIndexable: false }), ["not_public", "api_not_indexable"]);
});

test("weekly cap: at most 10 newly listed player pages in any 7 days", () => {
  const items = Array.from({ length: 12 }, (_, i) => ({ slug: `p${i}`, at: 1_000_000 + i * 60 }));
  const allowed = capPlayers(items);
  assert.equal(allowed.size, 10);
  assert.equal(allowed.has("p10"), false);
  assert.equal(capPlayers([...items, { slug: "later", at: 1_000_000 + WEEK_SECONDS + 3600 }]).has("later"), true);
});

test("title at most 60, description 70 to 170, JSON-LD has the handle and no private field", () => {
  const p = toPlayerPage({ handle: "H".repeat(40), slug: "ravi", bio: "B".repeat(400), games: [{ game: "free_fire", inGameName: "R", roles: [] }], visibility: "public", indexable: true });
  assert.ok(playerTitle(p).length <= 60);
  const d = playerDescription(p);
  assert.ok(d.length >= 70 && d.length <= 170, String(d.length));
  const short = toPlayerPage({ handle: "Ra", slug: "ravi", visibility: "public" });
  assert.ok(playerDescription(short).length >= 70);
  const ld = playerJsonLd({ ...p, slug: "ravi" }, "https://e.com/players/ravi/", "https://e.com");
  assert.equal(ld[0]["@type"], "ProfilePage");
  assert.equal(ld[0].mainEntity["@type"], "Person");
  assert.doesNotMatch(JSON.stringify(ld), /email|userId|user_id|cardPath|\/p\/\?k=/);
  assert.deepEqual(gateInputOf(p), { visibility: "public", apiIndexable: true, bioLength: 400, games: 1, verifiedResults: 0 });
});

test("card template: a QR is added when wanted and removed when not; photos are png/jpeg/webp only", () => {
  const t = { id: "t", name: "t", fmt: "portrait", bg: { a: "#000", b: "#000", angle: 0 }, els: [] };
  assert.equal(withQr(t, true, "portrait").els.filter((e) => e.kind === "qr").length, 1);
  assert.equal(withQr(withQr(t, true, "portrait"), false, "portrait").els.length, 0);
  assert.equal(photoProblem({ type: "image/svg+xml", size: 10 }), "Use a PNG, JPEG or WebP photo.");
  assert.equal(photoProblem({ type: "image/png", size: 6 * 1024 * 1024 }), "That photo is over 5 MB. Pick a smaller one.");
  assert.equal(photoProblem({ type: "image/webp", size: 1000 }), "");
});
