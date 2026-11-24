// The OBS overlay kit (src/features/overlay-kit): feeds built from the tools' own ranking, sanitizing, the three overlays' data,
// the # link (settings and data snapshot), the flag, and the build step that removes the pages while the flag is off.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  COUNT_MAX, DEFAULT_SETTINGS, areaBox, badgeTone, countFor, decodeSettings, decodeSnapshot, encodeSettings, encodeSnapshot, feedFromMapLeague,
  feedFromStandings, initials, kitUrl, parseSettings, pickFeed, pickPlayers, pointsTableData, sameFeed, sanitizeFeed, sanitizePlayers, teamCards, topFraggers,
} from "../src/features/overlay-kit/domain.ts";
import { overlayKitOn } from "../src/features/overlay-kit/flag.ts";
import { EXAMPLE_SCALE, standings } from "../src/lib/points.ts";
import { mapLeagueTable } from "../src/features/map-league/domain.ts";
import { fixtures } from "../src/lib/roundrobin.ts";

const TEAMS = [
  { name: "Alpha", matches: [{ placement: 1, kills: 5 }, { placement: 4, kills: 2 }] },
  { name: "Bravo", matches: [{ placement: 2, kills: 6 }, { placement: 1, kills: 4 }] },
  { name: "Charlie", matches: [{ placement: 3, kills: 2 }, { placement: 2, kills: 7 }] },
];
const brFeed = (at = 1000) => feedFromStandings(standings(TEAMS, EXAMPLE_SCALE), { source: "free-fire", matches: 2, at });

test("a battle royale feed keeps the points tool's own order, ranks and tie-breakers", () => {
  const rows = standings(TEAMS, EXAMPLE_SCALE);
  const f = brFeed();
  assert.equal(f.mode, "br");
  assert.equal(f.title, "Free Fire standings");
  assert.deepEqual(f.teams.map((t) => t.team), rows.map((r) => r.name));
  assert.deepEqual(f.teams.map((t) => [t.rank, t.points, t.kills, t.wins]), rows.map((r) => [r.rank, r.total, r.kills, r.wins]));
  assert.equal(f.teams[0].team, "Bravo"); // 6 + 10 placement + 10 kills = 26
  assert.equal(f.teams[0].played, 2);
  assert.equal(f.teams[0].lost, null);
});

test("a league feed keeps the map league's order (points, maps, rounds, head-to-head)", () => {
  const teams = ["A", "B", "C"];
  const rounds = fixtures(teams, false);
  const results = rounds.map((rd) => rd.map((f) => (f.a === "A" || f.b === "A" ? (f.a === "A" ? [{ a: 13, b: 5 }] : [{ a: 5, b: 13 }]) : [{ a: 13, b: 11 }])));
  const rows = mapLeagueTable(teams, rounds, results);
  const f = feedFromMapLeague(rows);
  assert.equal(f.mode, "league");
  assert.equal(f.source, "valorant");
  assert.deepEqual(f.teams.map((t) => t.team), rows.map((r) => r.team));
  assert.equal(f.teams[0].team, "A");
  assert.deepEqual([f.teams[0].wins, f.teams[0].lost, f.teams[0].kills], [2, 0, null]);
});

test("sanitizing refuses wrong shapes and trims everything to plain text", () => {
  assert.equal(sanitizeFeed(null), null);
  assert.equal(sanitizeFeed({ v: 2, source: "bgmi", mode: "br", teams: [] }), null);
  assert.equal(sanitizeFeed({ v: 1, source: "evil", mode: "br", teams: [] }), null);
  const f = sanitizeFeed({ v: 1, source: "bgmi", mode: "br", title: "x\u0000y", at: 5, teams: [{ team: "  A\nB  ", rank: -3, points: "12", kills: -1, wins: 1.7 }, { team: "" }, "junk", { team: "Z".repeat(200), rank: 2 }] });
  assert.equal(f.title, "x y");
  assert.equal(f.teams.length, 2);
  assert.deepEqual(f.teams[0], { rank: 1, team: "A B", points: 12, kills: 0, wins: 1, played: 0, lost: null });
  assert.equal(f.teams[1].team.length, 60);
  const p = sanitizePlayers({ v: 1, at: 1, players: [{ name: "Neo", team: "Alpha", kills: "7" }, { name: " ", kills: 3 }, { name: "Max", kills: 123456 }] });
  assert.deepEqual(p.players, [{ name: "Neo", team: "Alpha", kills: 7 }, { name: "Max", team: "", kills: 9999 }]);
  assert.equal(sanitizePlayers({ v: 1, players: "no" }), null);
});

test("the newest data wins: live feeds against a link snapshot, filtered by source", () => {
  const ff = brFeed(100), bg = { ...brFeed(200), source: "bgmi" }, snap = brFeed(150);
  assert.equal(pickFeed([ff, bg], "auto"), bg);
  assert.equal(pickFeed([ff, bg], "free-fire"), ff);
  assert.equal(pickFeed([ff, null, snap], "free-fire"), snap);
  assert.equal(pickFeed([], "auto"), null);
  assert.equal(pickPlayers([{ v: 1, players: [], at: 3 }, { v: 1, players: [], at: 9 }, null]).at, 9);
  assert.ok(sameFeed(brFeed(1), brFeed(2)));
  assert.ok(!sameFeed(brFeed(1), { ...brFeed(1), title: "Other" }));
});

test("the points overlay reuses the display system's table, with the strong column on the points", () => {
  const d = pointsTableData(brFeed(), 2);
  assert.deepEqual(d.head, ["#", "Team", "Kills", "Wins", "Pts"]);
  assert.equal(d.strong, 4);
  assert.deepEqual(d.rows, [["1", "Bravo", "10", "1", "26"], ["2", "Alpha", "7", "1", "21"]]);
  const lg = pointsTableData({ v: 1, source: "valorant", mode: "league", title: "League table", at: 0, teams: [{ rank: 1, team: "A", points: 6, kills: null, wins: 2, played: 2, lost: 0 }] }, 10);
  assert.deepEqual(lg.head, ["#", "Team", "P", "W", "L", "Pts"]);
  assert.deepEqual(lg.rows[0], ["1", "A", "2", "2", "0", "6"]);
});

test("top fraggers: player kills first, equal kills share a rank; otherwise team kills; a league has none", () => {
  const players = { v: 1, at: 1, players: [{ name: "Zed", team: "A", kills: 4 }, { name: "Ana", team: "B", kills: 9 }, { name: "Bo", team: "A", kills: 4 }, { name: "Cy", team: "C", kills: 1 }] };
  const p = topFraggers(brFeed(), players, 3);
  assert.equal(p.kind, "players");
  assert.deepEqual(p.rows.map((r) => [r.rank, r.name, r.kills]), [[1, "Ana", 9], [2, "Bo", 4], [2, "Zed", 4]]);
  const t = topFraggers(brFeed(), { v: 1, at: 1, players: [] }, 5);
  assert.equal(t.kind, "teams");
  assert.deepEqual(t.rows.map((r) => [r.rank, r.name, r.kills]), [[1, "Bravo", 10], [2, "Charlie", 9], [3, "Alpha", 7]]);
  assert.equal(topFraggers({ ...brFeed(), mode: "league" }, null, 5).kind, "none");
  assert.equal(topFraggers(null, null, 5).kind, "none");
});

test("team cards: top n by rank, or the one named team (any case); drawn badge letters and a stable colour", () => {
  assert.deepEqual(teamCards(brFeed(), 2).map((t) => t.team), ["Bravo", "Alpha"]);
  assert.deepEqual(teamCards(brFeed(), 4, " charlie ").map((t) => [t.team, t.rank]), [["Charlie", 3]]);
  assert.deepEqual(teamCards(brFeed(), 4, "Nobody"), []);
  assert.deepEqual(teamCards(null, 4), []);
  assert.equal(initials("Night Ravens"), "NR");
  assert.equal(initials("alpha"), "AL");
  assert.equal(initials("  "), "?");
  assert.equal(initials("Team #1 Rocks"), "T1");
  assert.equal(badgeTone("Alpha"), badgeTone(" alpha "));
});

test("settings: every value is checked, defaults are left out of the link, and bad input falls back", () => {
  assert.deepEqual(parseSettings(new URLSearchParams("")), DEFAULT_SETTINGS);
  const s = parseSettings(new URLSearchParams("v=cards&theme=neon&safe=40&scale=9&n=99&area=right&team=%20Alpha%0A&src=bgmi"));
  assert.deepEqual(s, { view: "cards", theme: "neon", safe: 15, scale: 2, n: COUNT_MAX.cards, area: "right", team: "Alpha", src: "bgmi" });
  const bad = parseSettings(new URLSearchParams("v=hack&theme=<x>&safe=-2&scale=abc&n=-1&area=top&src=http"));
  assert.deepEqual(bad, { ...DEFAULT_SETTINGS, safe: 0 });
  assert.equal(encodeSettings(DEFAULT_SETTINGS), "v=points");
  assert.equal(encodeSettings({ ...DEFAULT_SETTINGS, view: "points", team: "Alpha" }), "v=points"); // a team only matters for cards
  assert.equal(countFor({ ...DEFAULT_SETTINGS, view: "fraggers" }), 5);
  assert.equal(countFor({ ...DEFAULT_SETTINGS, view: "cards", n: 2 }), 2);
  assert.deepEqual(areaBox("right"), { left: 66, top: 0, width: 34, height: 100 });
});

test("the OBS link: settings and snapshot round-trip after the #, with no query string", () => {
  const settings = { ...DEFAULT_SETTINGS, view: "cards", theme: "stadium", safe: 7.5, area: "bottom", team: "Bravo", src: "free-fire" };
  const players = { v: 1, at: 5, players: [{ name: "Ana", team: "Bravo", kills: 9 }] };
  const url = kitUrl("https://esports.streamerosai.com/", settings, { feed: brFeed(), players });
  assert.match(url, /^https:\/\/esports\.streamerosai\.com\/overlay-kit\/live\/#v=cards&/);
  assert.ok(!url.includes("?"), "nothing in a query string");
  const back = decodeSettings(new URL(url).hash);
  assert.deepEqual(back.settings, settings);
  assert.deepEqual(back.snapshot.feed, brFeed());
  assert.deepEqual(back.snapshot.players, players);
  // Without data, there is no d= part at all.
  assert.ok(!kitUrl("https://x.test", settings).includes("d="));
  assert.ok(!kitUrl("https://x.test", settings, { feed: null, players: { v: 1, at: 1, players: [] } }).includes("d="));
});

test("a damaged, hand-edited or oversized snapshot gives empty data, never an error; unicode names survive", () => {
  assert.deepEqual(decodeSnapshot("!!!"), { feed: null, players: null });
  assert.deepEqual(decodeSnapshot(""), { feed: null, players: null });
  assert.deepEqual(decodeSnapshot("a".repeat(70_000)), { feed: null, players: null });
  const evil = Buffer.from(JSON.stringify({ f: { v: 1, source: "bgmi", mode: "br", teams: [{ team: "<script>alert(1)</script>" }] } })).toString("base64url");
  assert.equal(decodeSnapshot(evil).feed.teams[0].team, "<script>alert(1)</script>"); // kept as text; React prints it as text
  const hindi = { ...brFeed(), teams: [{ ...brFeed().teams[0], team: "शेर दल" }] };
  assert.equal(decodeSnapshot(encodeSnapshot({ feed: hindi, players: null })).feed.teams[0].team, "शेर दल");
});

test("the flag is off unless set to 1, true or on", () => {
  assert.equal(overlayKitOn(undefined), false);
  assert.equal(overlayKitOn(""), false);
  assert.equal(overlayKitOn("0"), false);
  assert.equal(overlayKitOn("1"), true);
  assert.equal(overlayKitOn("on"), true);
});

test("the build removes the overlay kit pages while the flag is off, and keeps them when it is on", () => {
  const script = path.resolve("scripts/prune-v3.mjs");
  const run = (flag) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kit-"));
    fs.mkdirSync(path.join(dir, "out", "overlay-kit", "live"), { recursive: true });
    fs.writeFileSync(path.join(dir, "out", "overlay-kit", "index.html"), "<h1>kit</h1>");
    fs.writeFileSync(path.join(dir, "out", "overlay-kit", "live", "index.html"), "<h1>live</h1>");
    const env = { ...process.env }; delete env.NEXT_PUBLIC_OVERLAY_KIT; if (flag) env.NEXT_PUBLIC_OVERLAY_KIT = flag;
    execFileSync(process.execPath, [script], { cwd: dir, env, stdio: "pipe" });
    const kept = fs.existsSync(path.join(dir, "out", "overlay-kit"));
    fs.rmSync(dir, { recursive: true, force: true });
    return kept;
  };
  assert.equal(run(""), false);
  assert.equal(run("1"), true);
});

test("the example feed is labelled, loses to any real table, and the subtitle does not repeat the game", async () => {
  const D = await import("../src/features/overlay-kit/domain.ts");
  const ex = D.exampleFeed("free-fire");
  assert.equal(ex.title, D.EXAMPLE_TITLE);
  assert.match(ex.title, /Example data/);
  assert.equal(ex.at, 0);
  const real = { ...ex, title: "Real", at: 5 };
  assert.equal(D.pickFeed([ex, real], "auto").title, "Real");
  assert.equal(D.exampleFeed("valorant").mode, "league");
  assert.equal(D.pointsTableData({ ...ex, title: "Free Fire standings" }, 5).subtitle, undefined);
  assert.equal(D.pointsTableData({ ...ex, title: "Night cup" }, 5).subtitle, "Free Fire");
});
