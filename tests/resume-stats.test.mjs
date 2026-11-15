// Resume stats: only platform-computed numbers (source verified_results) reach the public resume; empty or foreign shapes are dropped.
import test from "node:test";
import assert from "node:assert/strict";
import { toPublicProfile, toStats } from "../src/features/resume/services/resume.adapter.ts";

const stats = { source: "verified_results", basis: "team_captain", tournaments: 3, matches: { played: 10, wins: 6, losses: 3, draws: 1 }, battleRoyale: { matches: 4, wins: 1, kills: 22, bestPlacement: 1, averagePlacement: 5.5 }, byGame: [{ game: "bgmi", teamName: "leak" }] };

test("stats are copied field by field", () => {
  const s = toStats(stats);
  assert.deepEqual(s, { tournaments: 3, matches: { played: 10, wins: 6, losses: 3, draws: 1 }, battleRoyale: { matches: 4, wins: 1, kills: 22, bestPlacement: 1 } });
});
test("all-zero stats and a payload that is not verified_results give null", () => {
  assert.equal(toStats({ ...stats, tournaments: 0, matches: { played: 0 }, battleRoyale: { matches: 0 } }), null);
  assert.equal(toStats({ ...stats, source: "self_reported" }), null);
  assert.equal(toStats(undefined), null);
});
test("the public profile carries stats and tolerates their absence", () => {
  assert.equal(toPublicProfile({ slug: "ravi-igl", handle: "RaviIGL", stats }).stats.tournaments, 3);
  assert.equal(toPublicProfile({ slug: "ravi-igl", handle: "RaviIGL" }).stats, null);
});
