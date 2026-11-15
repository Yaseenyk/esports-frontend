// Adapters: API shape -> domain, and private fields never reach UI props.
import test from "node:test";
import assert from "node:assert/strict";
import { toCard, toCardList, toDetail, toLive } from "../src/features/tournaments/services/tournament.adapter.ts";

const LEAK = { id: "abc", eventId: "ev1", userId: "u1", email: "a@b.c", password: "pw", lobbyId: "l1", captainContact: "x", discordGuildId: "g" };
const card = { slug: "gokte-cup-2026", title: "Gokte Cup 2026", game: "bgmi", format: "battle_royale_points", status: "registration_open", summary: "A real summary.", venue: "offline", city: "Pune", state: "Maharashtra", startsAt: "2030-12-20T04:30:00Z", endsAt: null, maxTeams: 16, publishedAt: "2030-11-01T10:00:00Z", seoReady: true };

test("toCard keeps the known fields and drops everything else", () => {
  const c = toCard({ ...card, ...LEAK });
  assert.equal(c.slug, "gokte-cup-2026");
  for (const k of Object.keys(LEAK)) assert.equal(k in c, false, k);
  assert.deepEqual(Object.keys(c).sort(), ["city", "endsAt", "format", "game", "maxTeams", "publishedAt", "seoReady", "slug", "startsAt", "state", "status", "summary", "title", "venue"]);
});

test("toCard rejects rows without a usable slug or title", () => {
  assert.equal(toCard({ ...card, slug: "Bad Slug!" }), null);
  assert.equal(toCard({ ...card, title: "" }), null);
  assert.equal(toCard(null), null);
  assert.deepEqual(toCardList({ items: [card, { nope: 1 }, "x"] }).map((c) => c.slug), ["gokte-cup-2026"]);
  assert.deepEqual(toCardList(undefined), []);
});

test("toDetail maps registration, teams, schedule and the corrected marker", () => {
  const d = toDetail({
    tournament: { ...card, ...LEAK, description: "Full text", rules: "Rules" },
    registration: { open: true, registered: 9, approved: 6, spotsLeft: 7, ...LEAK },
    teams: [{ name: "Alpha Wolves", teamSlug: "alpha-wolves", ...LEAK }, { name: "", teamSlug: "x" }],
    schedule: [{ stage: "main", round: 1, slot: 1, teamA: "Alpha Wolves", teamB: "Unlisted team", startsAt: "2030-12-20T05:00:00Z", status: "scheduled", lobbyId: "l" }],
    results: { matches: [{ stage: "main", round: 1, slot: 1, teamA: "A", teamB: "B", status: "finished", scoreA: 13, scoreB: 9, winner: "a", corrected: false }],
      battleRoyale: [{ matchNo: 1, team: "Alpha Wolves", placement: 1, kills: 11, corrected: true, original: { placement: 2, kills: 11 } }] },
    hasResults: true,
  });
  assert.equal(d.registration.spotsLeft, 7);
  assert.equal(d.teams.length, 1);
  assert.equal(d.schedule[0].teamB, "Unlisted team");
  assert.deepEqual(d.results.battleRoyale[0].original, { placement: 2, kills: 11 });
  assert.equal(d.results.battleRoyale[0].corrected, true);
  assert.equal(d.results.matches[0].corrected, false);
  const flat = JSON.stringify(d);
  for (const v of Object.values(LEAK)) assert.equal(flat.includes(`"${v}"`), false, v);
});

test("toDetail survives a hostile or empty payload", () => {
  assert.equal(toDetail({}), null);
  const d = toDetail({ tournament: card });
  assert.equal(d.hasResults, false);
  assert.deepEqual(d.teams, []);
  assert.equal(d.registration.registered, 0);
  const odd = toDetail({ tournament: card, registration: { registered: -5, spotsLeft: "many" }, teams: "no", results: { matches: [null, 3] } });
  assert.equal(odd.registration.registered, 0);
  assert.equal(odd.registration.spotsLeft, null);
});

test("toLive keeps counts only", () => {
  const l = toLive({ slug: "a", status: "registration_open", registered: 9, spotsLeft: 7, open: true, ...LEAK });
  assert.deepEqual(l, { slug: "a", status: "registration_open", registered: 9, spotsLeft: 7, open: true });
  assert.equal(toLive({}), null);
});
