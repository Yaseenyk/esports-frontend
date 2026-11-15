// Finding the v3 sections: menu entries, search words, the dashboard card and the menu layout. Nothing shows while the switches are off.
import test from "node:test";
import assert from "node:assert/strict";
import { fitPattern } from "../src/lib/comb.ts";
import { v3PublicEntries } from "../src/features/shared/flags.ts";
import { playerLinks } from "../src/features/shared/ui/ForPlayers.tsx";

test("public menu entries appear only for the sections that are on", () => {
  assert.deepEqual(v3PublicEntries(() => false), []);
  assert.deepEqual(v3PublicEntries((s) => s === "lft").map((e) => e.label), ["Find a team"]);
  assert.deepEqual(v3PublicEntries((s) => s === "tournaments").map((e) => e.label), ["Tournaments"]);
  assert.equal(v3PublicEntries(() => true).length, 2);
});

const matches = (e, q) => q.toLowerCase().split(/\s+/).every((w) => `${e.label} ${e.blurb} Page ${e.keywords}`.toLowerCase().includes(w));
test("menu search finds Find a team by team, find a team, player and lft, and Tournaments by its words", () => {
  const [team, tour] = v3PublicEntries(() => true);
  for (const q of ["team", "find a team", "player", "lft"]) assert.ok(matches(team, q), q);
  for (const q of ["tournament", "create tournament", "my tournaments"]) assert.ok(matches(tour, q), q);
  assert.equal(matches(tour, "lft"), false);
});

test("the dashboard player card lists only enabled sections", () => {
  assert.deepEqual(playerLinks(() => false), []);
  assert.deepEqual(playerLinks((s) => s === "resume").map((l) => l.label), ["My esports resume"]);
  assert.deepEqual(playerLinks((s) => s === "lft").map((l) => l.label), ["Team finder", "My listings"]);
  assert.deepEqual(playerLinks(() => true).map((l) => l.href), ["/app/resume/", "/lft/", "/app/lft/"]);
});

test("the honeycomb has a row for every section, however many there are", () => {
  assert.deepEqual(fitPattern([3, 4], 7), [3, 4]);
  assert.deepEqual(fitPattern([3, 4], 5), [3, 4]);
  for (const n of [8, 9, 11, 12]) { const p = fitPattern([3, 4], n); assert.ok(p.reduce((a, b) => a + b, 0) >= n); assert.ok(p.slice(0, -1).reduce((a, b) => a + b, 0) < n); }
  assert.deepEqual(fitPattern([2, 3, 2], 9), [2, 3, 2, 2]);
});
