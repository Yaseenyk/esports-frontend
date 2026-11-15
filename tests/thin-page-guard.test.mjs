// The thin-page guard (frontend copy), its parity with the backend copy, the weekly cap, and the JSON-LD / metadata helpers that depend on it.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { seoVerdict, judgePages, maxInAnyWeek, titleCountsOf, guardInput, WEEKLY_CAP, WEEK_SECONDS } from "../src/features/tournaments/seo/thin-page-guard.ts";
import { sportsEventJsonLd, breadcrumbJsonLd } from "../src/features/tournaments/seo/jsonld.ts";
import { tournamentTitle, tournamentDescription, TITLE_MAX } from "../src/features/tournaments/seo/metadata.ts";

const fx = JSON.parse(fs.readFileSync(new URL("./fixtures/seo-guard-cases.json", import.meta.url), "utf8"));
const fill = (v) => (v === "SUMMARY80" ? "s".repeat(80) : v === "DESC200" ? "d".repeat(200) : v);
const build = (over = {}) => {
  const base = Object.fromEntries(Object.entries(fx.good).map(([k, v]) => [k, fill(v)]));
  const o = Object.fromEntries(Object.entries(over).map(([k, v]) => [k, v === "S79" ? "s".repeat(79) : v === "D199" ? "d".repeat(199) : v]));
  return { ...base, ...o };
};

for (const c of fx.cases) {
  test(`guard fixture: ${c.name}`, () => {
    const v = seoVerdict(build(c.override));
    assert.equal(v.ready, c.ready);
    assert.deepEqual(v.failures, c.failures);
  });
}

test("parity: the synced block equals the backend file when the backend repo is next to this one", (t) => {
  const backend = new URL("../../esports-backend/src/v3/lib/seo-guard.ts", import.meta.url);
  if (!fs.existsSync(backend)) return t.skip("backend repo not checked out here (CI)");
  const front = fs.readFileSync(new URL("../src/features/tournaments/seo/thin-page-guard.ts", import.meta.url), "utf8");
  const block = front.split("// ---- SYNCED with esports-backend/src/v3/lib/seo-guard.ts: begin ----")[1].split("// ---- SYNCED with esports-backend/src/v3/lib/seo-guard.ts: end ----")[0];
  const code = (s) => s.replace(/\r/g, "").split("\n").filter((l) => l.trim() && !/^\s*(\/\/|\/\*|\*)/.test(l)).join("\n").trim();
  const back = fs.readFileSync(backend, "utf8");
  assert.equal(code(block), code(back.slice(back.indexOf("export interface SeoGuardInput"))));
});

const src = (over = {}) => ({ slug: "a-cup", title: "Gokte Cup 2026", summary: "s".repeat(90), description: "d".repeat(250), startsAt: "2030-12-20T04:30:00Z", venue: "offline", city: "Pune", status: "registration_open", hasResults: false, publishedAt: "2030-11-01T10:00:00Z", apiSeoReady: true, ...over });

test("a page is indexable only when the guard AND the API agree", () => {
  assert.equal(judgePages([src()])[0].indexable, true);
  const api = judgePages([src({ apiSeoReady: false })])[0];
  assert.equal(api.indexable, false);
  assert.deepEqual(api.failures, ["api_not_ready"]);
  assert.equal(judgePages([src({ summary: "short" })])[0].indexable, false);
});

test("two tournaments with the same title are both thin (title_unique)", () => {
  const v = judgePages([src({ slug: "a" }), src({ slug: "b", title: "gokte cup 2026" })]);
  assert.deepEqual(v.map((x) => x.indexable), [false, false]);
  assert.deepEqual(v[0].failures, ["title_unique"]);
});

test("the guard input marks a unique title from the counts", () => {
  const items = [src({ slug: "a" }), src({ slug: "b", title: "Other Cup Name" })];
  assert.equal(guardInput(items[0], titleCountsOf(items)).titleIsUnique, true);
});

test("weekly cap: 12 pages published in one week, only 10 are indexable, the newest two are held", () => {
  const items = Array.from({ length: 12 }, (_, i) => src({ slug: `cup-${i}`, title: `Weekly Cup Number ${i}`, publishedAt: `2030-11-0${1 + (i % 6)}T${String(10 + i).padStart(2, "0")}:00:00Z` }));
  const v = judgePages(items);
  assert.equal(v.filter((x) => x.indexable).length, WEEKLY_CAP);
  const held = v.filter((x) => !x.indexable);
  assert.equal(held.length, 2);
  assert.ok(held.every((h) => h.failures.join() === "weekly_cap"));
});

test("weekly cap: pages more than a week apart do not count against each other", () => {
  const items = Array.from({ length: 12 }, (_, i) => src({ slug: `cup-${i}`, title: `Spaced Cup Number ${i}`, publishedAt: new Date(Date.UTC(2030, 0, 1 + i * 2)).toISOString() }));
  assert.equal(judgePages(items).filter((x) => x.indexable).length, 12);
});

test("maxInAnyWeek counts a rolling window", () => {
  const d = WEEK_SECONDS / 7;
  assert.equal(maxInAnyWeek([0, d, 2 * d, 8 * d]), 3);
  assert.equal(maxInAnyWeek([]), 0);
});

const detail = (over = {}) => ({ slug: "a-cup", title: "Gokte Cup 2026", game: "bgmi", format: "battle_royale_points", status: "registration_open", summary: "s".repeat(90), description: "d".repeat(250), rules: null, venue: "offline", city: "Pune", state: "Maharashtra", startsAt: "2030-12-20T04:30:00Z", endsAt: "2030-12-21T12:00:00Z", maxTeams: 16, publishedAt: "2030-11-01T10:00:00Z", seoReady: true, ...over });
const ctx = (over = {}) => ({ indexable: true, url: "https://x.test/tournaments/a-cup/", image: "https://x.test/tournaments/a-cup/og.png", siteUrl: "https://x.test", ...over });

test("JSON-LD: valid SportsEvent for an indexable page", () => {
  const ld = sportsEventJsonLd(detail(), ctx());
  assert.equal(ld["@type"], "SportsEvent");
  for (const k of ["name", "startDate", "endDate", "eventStatus", "eventAttendanceMode", "location", "url", "image", "description"]) assert.ok(ld[k], k);
  assert.equal(ld.eventAttendanceMode, "https://schema.org/OfflineEventAttendanceMode");
  assert.equal(ld.location["@type"], "Place");
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(ld)));
});

test("JSON-LD: online is a VirtualLocation, hybrid is both, mode follows venue", () => {
  assert.equal(sportsEventJsonLd(detail({ venue: "online" }), ctx()).location["@type"], "VirtualLocation");
  const h = sportsEventJsonLd(detail({ venue: "hybrid" }), ctx());
  assert.equal(h.eventAttendanceMode, "https://schema.org/MixedEventAttendanceMode");
  assert.equal(h.location.length, 2);
});

test("JSON-LD: never for a thin page, a held page, a draft or a cancelled page", () => {
  assert.equal(sportsEventJsonLd(detail(), ctx({ indexable: false })), null);
  assert.equal(sportsEventJsonLd(detail({ status: "draft" }), ctx()), null);
  assert.equal(sportsEventJsonLd(detail({ status: "cancelled" }), ctx()), null);
  assert.equal(sportsEventJsonLd(detail({ startsAt: null }), ctx()), null);
  assert.equal(sportsEventJsonLd(detail({ description: null }), ctx()), null);
});

test("JSON-LD: carries nothing the public payload does not (no organizer invented)", () => {
  const ld = sportsEventJsonLd(detail(), ctx());
  assert.equal("organizer" in ld, false);
  assert.equal(breadcrumbJsonLd("https://x.test", "A", "https://x.test/tournaments/a/").itemListElement.length, 3);
});

test("metadata: title is at most 65 characters and keeps the brand suffix when it can", () => {
  assert.equal(tournamentTitle({ title: "Gokte Cup 2026", game: "bgmi" }), "Gokte Cup 2026 | BGMI tournament | Esports Hub");
  const long = tournamentTitle({ title: "A Very Long Inter College Esports Championship 2026 Finals", game: "free_fire" });
  assert.ok(long.length <= TITLE_MAX, long);
  assert.ok(tournamentTitle({ title: "x".repeat(120), game: "bgmi" }).length <= TITLE_MAX);
});

test("metadata: description is the organiser's summary, at most 160 characters", () => {
  assert.equal(tournamentDescription({ summary: "Short and real summary.", description: "ignored" }), "Short and real summary.");
  assert.ok(tournamentDescription({ summary: "word ".repeat(80), description: null }).length <= 160);
});
