// Dispute result corrections: drafts, validation, the API.md payload, old-value text, adapters. Pure: no network.
import test from "node:test";
import assert from "node:assert/strict";
import { blankDraft, correctionPayload, correctionsAllowed, matchLabel, oldValueText, refLabel, validateCorrections, validateDraft, valueText, MAX_CORRECTIONS } from "../src/features/disputes/corrections.ts";
import { toCurrentResults, toDetail } from "../src/features/disputes/services/dispute.adapter.ts";

const CUR = toCurrentResults({
  matches: [{ id: "m1", stage: "main", round: 1, slot: 1, a: "Alpha", b: "Beta", scoreA: 13, scoreB: 9, winner: "a", secret: "x" }, { nope: 1 }],
  br: [{ matchNo: 2, team: "Alpha Wolves", placement: 2, kills: 11 }, { matchNo: 2, team: "Beta Hawks", placement: 3, kills: 4 }, { matchNo: "x" }],
});
const match = (over = {}) => blankDraft("match", "k1", { matchId: "m1", scoreA: "13", scoreB: "11", winner: "a", ...over });
const br = (over = {}) => blankDraft("br", "k2", { matchNo: "2", team: "Alpha Wolves", placement: "1", kills: "11", ...over });

test("corrections are allowed only with a resolved, upheld or partly upheld decision", () => {
  assert.equal(correctionsAllowed("resolved", "upheld"), true);
  assert.equal(correctionsAllowed("resolved", "partially_upheld"), true);
  assert.equal(correctionsAllowed("resolved", "no_action"), false);
  assert.equal(correctionsAllowed("rejected", "rejected"), false);
  assert.equal(correctionsAllowed("rejected", "upheld"), false);
});

test("head-to-head: valid, and each field is checked", () => {
  assert.deepEqual(validateDraft(match(), CUR), {});
  assert.deepEqual(validateDraft(match(), null), {});
  assert.equal(validateDraft(match({ matchId: "" }), CUR).matchId, "Choose the match.");
  assert.equal(validateDraft(match({ matchId: "zzz" }), CUR).matchId, "That match is not in this tournament.");
  assert.equal(validateDraft(match({ matchId: "zzz" }), null).matchId, undefined); // unknown without the current results: the server checks
  assert.match(validateDraft(match({ scoreA: "" }), CUR).scoreA, /whole number from 0 to 100000/);
  assert.match(validateDraft(match({ scoreB: "-1" }), CUR).scoreB, /whole number/);
  assert.match(validateDraft(match({ scoreA: "100001" }), CUR).scoreA, /whole number/);
  assert.match(validateDraft(match({ scoreA: "1.5" }), CUR).scoreA, /whole number/);
  assert.equal(validateDraft(match({ winner: "" }), CUR).winner, "Choose the winner, or draw.");
});
test("head-to-head: the winner has to agree with the scores", () => {
  assert.match(validateDraft(match({ scoreA: "3", scoreB: "5", winner: "a" }), CUR).winner, /Side A cannot win/);
  assert.match(validateDraft(match({ scoreA: "5", scoreB: "3", winner: "b" }), CUR).winner, /Side B cannot win/);
  assert.match(validateDraft(match({ scoreA: "5", scoreB: "3", winner: "draw" }), CUR).winner, /equal scores/);
  assert.deepEqual(validateDraft(match({ scoreA: "4", scoreB: "4", winner: "draw" }), CUR), {});
  assert.deepEqual(validateDraft(match({ scoreA: "0", scoreB: "0", winner: "a" }), CUR), {}); // a forfeit can have no scores
});
test("head-to-head: unchanged from the current result is refused when it is known", () => {
  assert.match(validateDraft(match({ scoreA: "13", scoreB: "9", winner: "a" }), CUR).scoreA, /Same as the current result/);
  assert.equal(validateDraft(match({ scoreA: "13", scoreB: "9", winner: "a" }), null).scoreA, undefined);
});
test("battle royale: bounds, team in the results, unchanged", () => {
  assert.deepEqual(validateDraft(br(), CUR), {});
  assert.match(validateDraft(br({ matchNo: "0" }), CUR).matchNo, /1 to 10000/);
  assert.match(validateDraft(br({ matchNo: "" }), CUR).matchNo, /1 to 10000/);
  assert.equal(validateDraft(br({ team: "" }), CUR).team, "Enter the team name exactly as in the results.");
  assert.equal(validateDraft(br({ team: "Gamma" }), CUR).team, "That team has no result in this match.");
  assert.equal(validateDraft(br({ team: "Gamma" }), null).team, undefined);
  assert.match(validateDraft(br({ placement: "0" }), CUR).placement, /1 to 100/);
  assert.match(validateDraft(br({ placement: "101" }), CUR).placement, /1 to 100/);
  assert.match(validateDraft(br({ kills: "201" }), CUR).kills, /0 to 200/);
  assert.deepEqual(validateDraft(br({ kills: "0" }), CUR), {});
  assert.match(validateDraft(br({ placement: "2", kills: "11" }), CUR).placement, /Same as the current result/);
});
test("a list: duplicates and the cap are caught", () => {
  const ok = validateCorrections([match(), br()], CUR);
  assert.equal(ok.ok, true);
  const dup = validateCorrections([match(), match({ key: "k9", scoreB: "12" })], CUR);
  assert.equal(dup.ok, false);
  assert.match(dup.byKey.k9.matchId, /already corrected/);
  const dupBr = validateCorrections([br(), br({ key: "k9", placement: "4" })], CUR);
  assert.match(dupBr.byKey.k9.team, /already corrected/);
  const many = Array.from({ length: MAX_CORRECTIONS + 1 }, (_, i) => br({ key: `c${i}`, matchNo: String(i + 1), team: `T${i}` }));
  const cap = validateCorrections(many, null);
  assert.match(cap.general, /At most 10/);
  assert.equal(cap.ok, false);
  assert.equal(validateCorrections([], CUR).ok, true);
});
test("payload is exactly the API.md shape", () => {
  assert.deepEqual(correctionPayload([match({ matchId: " m1 " }), br({ team: " Alpha Wolves " })]), [
    { matchId: "m1", scoreA: 13, scoreB: 11, winner: "a" },
    { matchNo: 2, team: "Alpha Wolves", placement: 1, kills: 11 },
  ]);
  assert.deepEqual(correctionPayload([]), []);
});
test("old value text: shown when the current results know the row, null otherwise", () => {
  assert.equal(oldValueText(match(), CUR), "Alpha 13 - 9 Beta, Alpha won");
  assert.equal(oldValueText(br(), CUR), "Alpha Wolves placed 2 with 11 kills in match 2");
  assert.equal(oldValueText(match(), null), null);
  assert.equal(oldValueText(match({ matchId: "nope" }), CUR), null);
  assert.equal(oldValueText(br({ team: "Nope" }), CUR), null);
});
test("labels: match label and the API's matchRef in words, values as a phrase", () => {
  assert.equal(matchLabel(CUR.matches[0]), "main round 1, slot 1: Alpha vs Beta (13-9)");
  assert.equal(refLabel("br:2:Alpha Wolves"), "Battle royale match 2, Alpha Wolves");
  assert.equal(refLabel("match:abc"), "Head-to-head match");
  assert.equal(refLabel("other"), "other");
  assert.equal(valueText({ placement: 2, kills: 11 }), "placement 2, kills 11");
  assert.equal(valueText({ scoreA: 13, scoreB: 9, winner: "a" }), "score a 13, score b 9, winner a");
});
test("current-results adapter keeps a fixed field list and drops junk rows", () => {
  assert.equal(CUR.matches.length, 1);
  assert.equal("secret" in CUR.matches[0], false);
  assert.equal(CUR.br.length, 2);
  assert.deepEqual(toCurrentResults(null), { matches: [], br: [] });
});
test("dispute detail still carries corrections for the timeline", () => {
  const d = toDetail({ id: "d1", tournament: { slug: "s", title: "T" }, corrections: [{ matchRef: "br:2:Alpha Wolves", oldValue: { placement: 2, kills: 11 }, newValue: { placement: 1, kills: 11 } }], permissions: { canResolve: true } });
  assert.equal(d.corrections.length, 1);
  assert.equal(d.permissions.canResolve, true);
});
