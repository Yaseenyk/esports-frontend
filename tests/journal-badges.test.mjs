// Run: node --import tsx --test tests/journal-badges.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { buckets, csvCell, draftBody, draftProblems, emptyDraft, journalCsv, periodKey, periodLabel, summarise } from "../src/features/journal/domain.ts";
import { toEntry, toList } from "../src/features/journal/services/journal.adapter.ts";
import { BADGE_IDS, BADGES } from "../src/features/badges/domain.ts";
import { toOwnBadges, toPublicBadges } from "../src/features/badges/services/badges.adapter.ts";
import { toPlayerPage } from "../src/features/profiles/services/profiles.adapter.ts";
import { HIDEABLE } from "../src/features/profiles/domain.ts";
import { selfLoggedStats, storyLayout, storyQr, verifiedStats } from "../src/features/player-card/story.ts";
import { SAFE, SIZES } from "../src/lib/share-cards.ts";

const e = (over = {}) => ({ id: "a".repeat(32), playedOn: "2026-11-20", game: "bgmi", mode: null, map: null, placement: null, kills: 3, damage: null, notes: null, createdAt: null, updatedAt: null, ...over });
const TOKEN = "AbCdEfGhIjKlMnOpQrStUv";

test("journal form: real past day, whole numbers in range, plain text", () => {
  const ok = { ...emptyDraft("2026-11-25"), kills: "4", placement: "1" };
  assert.deepEqual(draftProblems(ok, "2026-11-25"), {});
  const bad = draftProblems({ ...ok, playedOn: "2026-11-26", kills: "x", placement: "0", damage: "-5", notes: "<b>", mode: "m".repeat(41), game: "chess" }, "2026-11-25");
  assert.deepEqual(Object.keys(bad).sort(), ["damage", "game", "kills", "mode", "notes", "placement", "playedOn"]);
  assert.ok(draftProblems({ ...ok, playedOn: "2026-02-30" }, "2026-11-25").playedOn);
  assert.deepEqual(draftBody({ ...ok, mode: "  Squad ", damage: "" }), { playedOn: "2026-11-25", game: "bgmi", mode: "Squad", map: null, placement: 1, kills: 4, damage: null, notes: null });
});

test("progress: weeks start Monday, empty periods are kept, averages ignore missing placements", () => {
  assert.equal(periodKey("2026-11-25", "week"), "2026-11-23");
  assert.equal(periodKey("2026-11-23", "week"), "2026-11-23");
  assert.equal(periodKey("2026-11-29", "week"), "2026-11-23");
  assert.equal(periodLabel("2026-11", "month"), "Nov 2026");
  const rows = [e({ playedOn: "2026-11-02", kills: 2, placement: 4 }), e({ playedOn: "2026-11-03", kills: 4 }), e({ playedOn: "2026-11-20", kills: 9, placement: 1, game: "free_fire" })];
  const w = buckets(rows, "week");
  assert.deepEqual(w.map((b) => [b.key, b.matches, b.avgKills, b.avgPlacement]), [["2026-11-02", 2, 3, 4], ["2026-11-09", 0, null, null], ["2026-11-16", 1, 9, 1]]);
  assert.deepEqual(buckets(rows, "week", "free_fire").map((b) => b.matches), [1]);
  assert.deepEqual(buckets(rows, "month").map((b) => b.matches), [3]);
  assert.equal(buckets([], "week").length, 0);
  assert.deepEqual(summarise(rows), { matches: 3, kills: 15, avgKills: 5, avgPlacement: 2.5, bestPlacement: 1, wins: 1 });
});

test("CSV: quoted, formula cells defused, oldest first, BOM for spreadsheets", () => {
  assert.equal(csvCell("=HYPERLINK(\"x\")"), "\"'=HYPERLINK(\"\"x\"\")\"");
  for (const s of ["+1", "-1", "@SUM(A1)", "\tx"]) assert.ok(csvCell(s).startsWith("\"'"), s);
  assert.equal(csvCell(7), "\"7\"");
  assert.equal(csvCell(null), "");
  const csv = journalCsv([e({ playedOn: "2026-11-21", notes: "=cmd|' /C calc'!A0" }), e({ playedOn: "2026-11-01" })]);
  const lines = csv.replace(/^﻿/, "").trim().split("\r\n");
  assert.equal(lines[0], "date,game,mode,map,placement,kills,damage,notes");
  assert.ok(lines[1].startsWith("\"2026-11-01\""));
  assert.ok(lines[2].includes("\"'=cmd"));
});

test("journal adapter drops malformed rows", () => {
  assert.equal(toEntry({ id: "x", playedOn: "nope", game: "bgmi", kills: 1 }), null);
  assert.equal(toEntry({ id: "x", playedOn: "2026-11-01", game: "bgmi", kills: "1" }), null);
  const l = toList({ items: [e(), { junk: true }], cap: 2000 });
  assert.equal(l.items.length, 1);
  assert.equal(l.cap, 2000);
});

test("badges: the same ids as the backend list; unknown ids and server-sent titles never render", () => {
  assert.deepEqual(BADGE_IDS, ["first_tournament", "first_result", "first_win", "verified_5", "verified_10", "verified_25", "first_scrim", "first_event", "player_card"]);
  for (const b of BADGES) assert.match(b.rule, /^[A-Z].*\.$/);
  assert.deepEqual(toPublicBadges([{ id: "first_win", title: "<img src=x>" }, { id: "admin", title: "Hacker" }, { id: "first_win" }]), [{ id: "first_win", title: "First win" }]);
  const own = toOwnBadges({ items: [{ id: "first_result", earned: true, hidden: true }, { id: "made_up", earned: true }], sectionHidden: true });
  assert.equal(own.items.length, 1);
  assert.deepEqual([own.items[0].earned, own.items[0].hidden, own.sectionHidden], [true, true, true]);
  assert.deepEqual(toPlayerPage({ handle: "Ravi", badges: [{ id: "player_card" }] }).badges, [{ id: "player_card", title: "Player card" }]);
  assert.deepEqual(toPlayerPage({ handle: "Ravi" }).badges, []);
  assert.ok(HIDEABLE.some((h) => h.value === "badges"));
});

test("story card: verified tiles only from real counts; self-logged only from the journal summary", () => {
  assert.deepEqual(verifiedStats(null), []);
  assert.deepEqual(verifiedStats({ tournaments: 2, matches: { played: 0, wins: 0 }, battleRoyale: { matches: 6, wins: 1, kills: 1234 } }).map((s) => s.value), ["2", "1 of 6", "1,234"]);
  assert.deepEqual(selfLoggedStats({ matches: 0, avgKills: null, avgPlacement: null, wins: 0 }), []);
  assert.equal(selfLoggedStats({ matches: 5, avgKills: 3.25, avgPlacement: null, wins: 1 }).length, 3);
});

test("story card QR: the card link or the public page, nothing else", () => {
  assert.equal(storyQr("https://esports.streamerosai.com/", `/p/?k=${TOKEN}`, "ravi"), `https://esports.streamerosai.com/p/?k=${TOKEN}`);
  assert.equal(storyQr("https://esports.streamerosai.com", null, "ravi-op"), "https://esports.streamerosai.com/players/view/?s=ravi-op");
  for (const [c, s] of [["https://evil.org/p/?k=x", null], [null, "Ravi/../x"], [null, null]]) assert.equal(storyQr("https://esports.streamerosai.com", c, s), null);
});

test("story card layout: everything stays inside the safe zone (250 px clear top and bottom on a story)", () => {
  const stat = (n) => Array.from({ length: n }, (_, i) => ({ label: `L${i}`, value: String(i) }));
  const full = { handle: "Ravi", subtitle: "BGMI · IGL · Wolves", verified: stat(4), badges: ["First win", "First scrim"], selfLogged: stat(4), qr: "https://x/p/?k=1", qrCaption: "Scan", footer: "Made with Esports Hub" };
  const min = { ...full, subtitle: "", verified: [], badges: [], selfLogged: null, qr: null };
  for (const format of ["story", "portrait"]) {
    for (const input of [full, min, { ...full, selfLogged: null }]) {
      const { blocks, h } = storyLayout(input, format);
      assert.equal(h, SIZES[format].h);
      for (const b of blocks) {
        assert.ok(b.y >= SAFE[format].top, `${format} ${b.kind} top ${b.y}`);
        assert.ok(b.y + b.h <= h - SAFE[format].bottom, `${format} ${b.kind} bottom ${b.y + b.h}`);
      }
      assert.ok(blocks.some((b) => b.kind === "handle") && blocks.some((b) => b.kind === "footer"));
      if (input.verified.length) assert.ok(blocks.some((b) => b.kind === "verified"), `${format}: verified is never dropped`);
      if (input.qr) assert.ok(blocks.some((b) => b.kind === "qr"), `${format}: the QR is never dropped`);
    }
  }
  assert.equal(SAFE.story.top, 250);
  assert.equal(SAFE.story.bottom, 250);
  // a full story keeps the self-logged block the player asked for
  assert.ok(storyLayout(full, "story").blocks.some((b) => b.kind === "self"));
});
