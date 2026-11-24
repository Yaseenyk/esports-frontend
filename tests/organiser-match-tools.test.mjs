// Organiser match tools (flags v3.rooms, v3.recaps, v3.screenshots): recap templates, OCR text parsing from fixture text, the confirm-before-save
// rules, the room form and captain-link parsing, and the adapters. All pure: no network.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { brRecap, buildRecap, h2hRecap, joinNames, ordinal, plural, recapTargets, standingsAfter } from "../src/features/match-recap/recap.ts";
import { toRecapFacts } from "../src/features/match-recap/services/recap.api.ts";
import { closestTeam, fixDigits, parseResultsText, similarity } from "../src/features/screenshot-reader/parse.ts";
import { addRow, applySuggestion, canSave, cleanUnconfirmed, confirmClean, confirmRow, editRow, fromRead, removeRow, reviewSummary, rowProblems, saveBlocker, toSaveBody, unconfirmRow } from "../src/features/screenshot-reader/review.ts";
import { toShotContext } from "../src/features/screenshot-reader/services/screenshots.api.ts";
import { BLANK_ROOM, extractCaptainToken, matchText, revealText, toCreateBody, validateRoomForm } from "../src/features/match-rooms/domain.ts";
import { toCaptainRoom, toOrganiserRoom, toRevealed, toRoomsState } from "../src/features/match-rooms/services/rooms.api.ts";
import { toToolSwitches } from "../src/features/organiser-tools/services/tools.api.ts";

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const SCORING = { title: "Season", scale: [10, 6, 5, 4], perKill: 1, winPts: 3, drawPts: 1, lossPts: 0 };
const br = (matchNo, team, placement, kills, corrected = false) => ({ matchNo, team, placement, kills, corrected });
const FACTS = {
  event: { id: "e1", name: "Gokte Cup", game: "BGMI" }, publicPath: "/tournaments/gokte-cup/", scoring: SCORING, matches: [],
  battleRoyale: [
    br(1, "Alpha Wolves", 1, 5), br(1, "Beta Hawks", 2, 8), br(1, "Gamma Squad", 3, 2), br(1, "Delta Owls", 4, 0),
    br(2, "Delta Owls", 1, 12), br(2, "Gamma Squad", 2, 9), br(2, "Alpha Wolves", 3, 0), br(2, "Beta Hawks", 4, 1),
  ],
};

// ------------------------------------------------------------------ recap templates
test("small words: plural, ordinal, joinNames", () => {
  assert.equal(plural(1, "kill"), "1 kill");
  assert.equal(plural(0, "kill"), "0 kills");
  assert.equal(plural(2, "match", "matches"), "2 matches");
  assert.deepEqual([1, 2, 3, 4, 11, 12, 13, 21, 22, 23, 101, 111].map(ordinal), ["1st", "2nd", "3rd", "4th", "11th", "12th", "13th", "21st", "22nd", "23rd", "101st", "111th"]);
  assert.equal(joinNames(["A"]), "A");
  assert.equal(joinNames(["A", "B"]), "A and B");
  assert.equal(joinNames(["A", "B", "C"]), "A, B and C");
});

test("standings use only the organiser's scale and kill points, then kills, then name", () => {
  const s1 = standingsAfter(FACTS.battleRoyale, SCORING, 1);
  assert.deepEqual(s1.map((x) => [x.team, x.points, x.rank]), [["Alpha Wolves", 15, 1], ["Beta Hawks", 14, 2], ["Gamma Squad", 7, 3], ["Delta Owls", 4, 4]]);
  const s2 = standingsAfter(FACTS.battleRoyale, SCORING, 2);
  assert.deepEqual(s2.map((x) => [x.team, x.points, x.kills, x.rank]), [["Delta Owls", 26, 12, 1], ["Gamma Squad", 22, 11, 2], ["Alpha Wolves", 20, 5, 3], ["Beta Hawks", 19, 9, 4]]);
  // a tie on points and kills shares the rank
  const tie = standingsAfter([br(1, "A", 1, 0), br(1, "B", 1, 0)], { ...SCORING, scale: [10, 10] }, 1);
  assert.deepEqual(tie.map((x) => x.rank), [1, 1]);
});

test("battle royale recap: winner, top kills, 2nd place, new leader and a climber, all from entered results", () => {
  const r = brRecap(FACTS, 2);
  assert.ok(r);
  assert.equal(r.title, "Gokte Cup: Match 2 recap");
  assert.deepEqual(r.lines, [
    "Delta Owls won Match 2 with 12 kills.",
    "That was the most kills in the match.",
    "Gamma Squad came 2nd with 9 kills.",
    "Delta Owls took the lead on 26 points after 2 matches.",
    "Gamma Squad climbed to 2nd (from 3rd).",
  ]);
  assert.equal(r.footer, "Made with Esports Hub · esports.streamerosai.com/tournaments/gokte-cup");
  assert.ok(r.text.startsWith("Gokte Cup: Match 2 recap\n\nDelta Owls won Match 2"));
  assert.ok(r.text.endsWith(r.footer));
  assert.equal(r.payload.v, "table");
  assert.equal(r.payload.d.subtitle, "Standings after Match 2");
  assert.deepEqual(r.payload.d.head, ["#", "Team", "Kills", "Pts"]);
  assert.deepEqual(r.payload.d.rows[0], ["1", "Delta Owls", "12", "26"]);
});

test("first match: the leader line says 'lead', no climbers; another team's kills and shared kills are named", () => {
  const r = brRecap(FACTS, 1);
  assert.deepEqual(r.lines, ["Alpha Wolves won Match 1 with 5 kills.", "Beta Hawks had the most kills (8).", "Beta Hawks came 2nd with 8 kills.", "Alpha Wolves lead the table on 15 points after 1 match."]);
  const shared = brRecap({ ...FACTS, scoring: null, battleRoyale: [br(7, "A", 1, 1), br(7, "B", 2, 4), br(7, "C", 3, 4)] }, 7);
  assert.equal(shared.lines[1], "B and C shared the most kills (4 each).");
  const zero = brRecap({ ...FACTS, scoring: null, battleRoyale: [br(1, "A", 1, 0)] }, 1);
  assert.deepEqual(zero.lines, ["A won Match 1 with 0 kills."]);
});

test("without the organiser's points rules there are no points or standings, and the picture shows the match as entered", () => {
  const r = brRecap({ ...FACTS, scoring: null }, 2);
  assert.ok(r.lines.every((l) => !/points|lead|climbed/.test(l)), r.lines.join(" | "));
  assert.equal(r.payload.d.subtitle, "Match 2 result");
  assert.deepEqual(r.payload.d.head, ["#", "Team", "Kills"]);
  assert.deepEqual(r.payload.d.rows.map((x) => x[1]), ["Delta Owls", "Gamma Squad", "Alpha Wolves", "Beta Hawks"]);
});

test("a corrected result says so, an unknown match gives no recap, and no public page means the home page link", () => {
  const r = brRecap({ ...FACTS, publicPath: null, battleRoyale: [br(1, "A", 1, 3, true)] }, 1);
  assert.ok(r.lines.includes("Some results in this match were corrected after a dispute."));
  assert.equal(r.footer, "Made with Esports Hub · esports.streamerosai.com");
  assert.equal(brRecap(FACTS, 99), null);
  assert.equal(h2hRecap(FACTS, "nope"), null);
});

test("head-to-head recap: a win, a draw, a forfeit; only finished matches are offered", () => {
  const m = (over) => ({ id: "m1", stage: "main", round: 2, slot: 1, teamA: "Alpha", teamB: "Beta", status: "finished", scoreA: 13, scoreB: 9, winner: "a", corrected: false, ...over });
  const f = { ...FACTS, battleRoyale: [], matches: [m({}), m({ id: "m2", winner: "b", scoreA: 1, scoreB: 2, stage: "playoffs", round: 1 }), m({ id: "m3", winner: "draw", scoreA: 1, scoreB: 1 }), m({ id: "m4", status: "forfeit", winner: "a", scoreA: null, scoreB: null }), m({ id: "m5", status: "scheduled", winner: null })] };
  assert.deepEqual(h2hRecap(f, "m1").lines, ["Alpha beat Beta 13-9 in round 2."]);
  assert.deepEqual(h2hRecap(f, "m2").lines, ["Beta beat Alpha 2-1 in playoffs round 1."]);
  assert.deepEqual(h2hRecap(f, "m3").lines, ["Alpha and Beta drew 1-1 in round 2."]);
  assert.deepEqual(h2hRecap(f, "m4").lines, ["Alpha went through by forfeit against Beta in round 2."]);
  assert.deepEqual(h2hRecap(f, "m4").payload.d.rows, [["1", "Alpha", "W"], ["2", "Beta", "L"]]);
  assert.equal(h2hRecap(f, "m5"), null);
  assert.deepEqual(recapTargets(f).map((t) => t.target.kind === "h2h" ? t.target.id : t.target.matchNo), ["m1", "m2", "m3", "m4"]);
  assert.deepEqual(recapTargets(FACTS).map((t) => t.label), ["Match 2", "Match 1"]);
  assert.equal(buildRecap(f, { kind: "h2h", id: "m1" }).title, "Gokte Cup: Alpha vs Beta");
});

test("the recap is deterministic: the same results always give the same text", () => {
  assert.equal(brRecap(FACTS, 2).text, brRecap(structuredClone(FACTS), 2).text);
});

test("recap facts adapter: reads fields one by one and only accepts a tournament path as the link", () => {
  const f = toRecapFacts({ event: { id: "e1", name: "Cup", game: "bgmi" }, publicPath: "https://evil.example/", scoring: { scale: [10, "x", 5], perKill: 1 }, battleRoyale: [{ matchNo: 1, team: "A", placement: 1, kills: 2, extra: "x" }, { team: 5 }], matches: [{ id: "m1", teamA: "A", teamB: "B", scoreA: 1, scoreB: 0, winner: "a", status: "finished" }] });
  assert.equal(f.publicPath, null);
  assert.deepEqual(f.scoring.scale, [10, 5]);
  assert.equal(f.battleRoyale.length, 1);
  assert.equal("extra" in f.battleRoyale[0], false);
  assert.equal(toRecapFacts({ event: { id: "e1" }, publicPath: "/tournaments/gokte-cup/" }).publicPath, "/tournaments/gokte-cup/");
  assert.equal(toRecapFacts({ event: { id: "e1" }, scoring: null }).scoring, null);
  assert.equal(toRecapFacts({}), null);
});

// ------------------------------------------------------------------ OCR parsing (fixture text)
test("digit fixes only touch short tokens that already have a digit", () => {
  assert.equal(fixDigits("l1"), "11");
  assert.equal(fixDigits("1O"), "10");
  assert.equal(fixDigits("O"), "O");
  assert.equal(fixDigits("Owls"), "Owls");
  assert.equal(fixDigits("S5"), "55");
});

test("similarity and the closest event team", () => {
  assert.equal(similarity("Alpha Wolves", "alpha wolves"), 1);
  assert.ok(similarity("De1ta 0wls", "Delta Owls") > 0.7);
  assert.equal(closestTeam("De1ta 0wls", ["Alpha Wolves", "Delta Owls"]), "Delta Owls");
  assert.equal(closestTeam("Zzzz", ["Alpha Wolves"]), null);
});

test("a battle royale results screenshot's text becomes rows; nothing is guessed", () => {
  const known = ["Alpha Wolves", "Beta Hawks", "Gamma Squad", "Delta Owls", "Echo Esports", "Foxtrot Five"];
  const rows = parseResultsText(read("tests/fixtures/ocr-results-br.txt"), known);
  assert.deepEqual(rows.map((r) => [r.team, r.placement, r.kills, r.suggestion]), [
    ["Alpha Wolves", 1, 12, null],
    ["Beta Hawks", 2, 8, null],
    ["Gamma Squad", 3, 5, null],
    ["De1ta 0wls", 4, 3, "Delta Owls"], // misread name: kept as read, the event's name is only OFFERED
    ["Echo Esports", 5, 11, null], // "l1 kills" read as 11
    ["Foxtrot Five O", 6, null, "Foxtrot Five"], // the kill count could not be read: left empty for the person
  ]);
  assert.ok(rows.every((r) => r.raw.length > 0));
});

test("header lines, noise and empty text give no rows; lines without a rank keep the placement empty", () => {
  assert.deepEqual(parseResultsText(""), []);
  assert.deepEqual(parseResultsText("RANK TEAM KILLS\nSpectating...\n12345"), []);
  const r = parseResultsText("Team Nova 7 kills");
  assert.deepEqual(r.map((x) => [x.team, x.placement, x.kills]), [["Team Nova", null, 7]]);
  assert.equal(parseResultsText(Array.from({ length: 150 }, (_, i) => `${i + 1} Team${i} 1`).join("\n")).length, 100);
});

// ------------------------------------------------------------------ confirm before save
test("every row starts unconfirmed and saving is blocked until all are confirmed", () => {
  let rows = fromRead(parseResultsText("1 Alpha 12\n2 Beta 8"));
  assert.ok(rows.every((r) => r.confirmed === false));
  assert.equal(canSave(rows, "3"), false);
  assert.match(saveBlocker(rows, "3"), /0 of 2 confirmed/);
  assert.throws(() => toSaveBody(rows, "3", false), /confirm every row/);
  rows = confirmRow(rows, "r1");
  assert.match(saveBlocker(rows, "3"), /1 of 2 confirmed/);
  rows = confirmRow(rows, "r2");
  assert.equal(saveBlocker(rows, "3"), null);
  assert.deepEqual(toSaveBody(rows, "3", false), { matchNo: 3, replace: false, rows: [{ team: "Alpha", placement: 1, kills: 12, confirmed: true }, { team: "Beta", placement: 2, kills: 8, confirmed: true }] });
  assert.match(saveBlocker(rows, ""), /match number/);
  assert.match(saveBlocker(rows, "0"), /match number/);
});

test("changing a confirmed row unconfirms it; a row with a problem cannot be confirmed", () => {
  let rows = fromRead(parseResultsText("1 Alpha 12\n2 Beta 8"));
  rows = confirmRow(confirmRow(rows, "r1"), "r2");
  rows = editRow(rows, "r1", { kills: "13" });
  assert.equal(rows[0].confirmed, false);
  assert.equal(rows[1].confirmed, true);
  rows = editRow(rows, "r1", { placement: "2" }); // duplicate placement
  assert.deepEqual(rowProblems(rows, "r1"), ["Two rows have this placement."]);
  assert.equal(confirmRow(rows, "r1")[0].confirmed, false);
  rows = editRow(rows, "r1", { placement: "1", team: "" });
  assert.ok(rowProblems(rows, "r1").some((p) => /team name/.test(p)));
  rows = editRow(rows, "r1", { team: "beta" });
  assert.ok(rowProblems(rows, "r1").includes("This team is listed twice."));
  assert.deepEqual(reviewSummary(rows), { total: 2, confirmed: 1, withProblems: 2 });
  assert.match(saveBlocker(rows, "1"), /Fix the 2 rows/);
});

test("a row read without kills cannot be confirmed until the person types them; removing and adding rows", () => {
  let rows = fromRead(parseResultsText("1 Alpha 12\n2 Beta"));
  // "2 Beta" alone has a rank but no kills: kept with kills empty
  assert.equal(rows.length, 2);
  assert.equal(rows[1].kills, "");
  assert.equal(confirmRow(rows, "r2")[1].confirmed, false);
  rows = confirmRow(editRow(rows, "r2", { kills: "4" }), "r2");
  assert.equal(rows[1].confirmed, true);
  rows = addRow(rows);
  assert.equal(rows.length, 3);
  assert.equal(rows[2].confirmed, false);
  assert.equal(canSave(rows, "1"), false); // the blank added row blocks saving
  rows = removeRow(rows, rows[2].id);
  rows = confirmRow(rows, "r1");
  assert.equal(canSave(rows, "1"), true);
  assert.equal(canSave([], "1"), false);
  assert.equal(unconfirmRow(rows, "r1")[0].confirmed, false);
});

test("using a suggested team name is the person's choice and also unconfirms the row", () => {
  let rows = fromRead(parseResultsText("4 De1ta 0wls 3", ["Delta Owls"]));
  assert.equal(rows[0].team, "De1ta 0wls");
  rows = confirmRow(rows, "r1");
  rows = applySuggestion(rows, "r1");
  assert.equal(rows[0].team, "Delta Owls");
  assert.equal(rows[0].confirmed, false);
  assert.equal(rows[0].suggestion, null);
});

test("screenshot context adapter", () => {
  assert.deepEqual(toShotContext({ event: { id: "e1", name: "Cup" }, canEdit: true, teams: ["A", 5], matchNumbers: [1, 2, "x"], nextMatchNo: 3 }), { event: { id: "e1", name: "Cup" }, canEdit: true, teams: ["A"], matchNumbers: [1, 2], nextMatchNo: 3 });
  assert.equal(toShotContext({}), null);
});

test("the screenshot is never uploaded: the save body carries only confirmed rows of text and numbers", () => {
  const src = read("src/features/screenshot-reader/services/screenshots.api.ts") + read("src/features/screenshot-reader/hooks/useScreenshotReader.ts");
  assert.doesNotMatch(src, /FormData|readAsDataURL|toDataURL|arrayBuffer\(\)|v3Put/);
  assert.match(read("src/features/screenshot-reader/ui/ScreenshotScreen.tsx"), /Reading can be wrong/);
});

// ------------------------------------------------------------------ rooms
test("captain links: the whole link or the token alone; anything else is refused", () => {
  const tok = "abcdefghijklmnopqrstuvwx_-12";
  assert.equal(extractCaptainToken(`https://esports.streamerosai.com/report/?t=${tok}`), tok);
  assert.equal(extractCaptainToken(`https://esports.streamerosai.com/ready/#t=${tok}`), tok);
  assert.equal(extractCaptainToken(`  ${tok}  `), tok);
  assert.equal(extractCaptainToken("short"), null);
  assert.equal(extractCaptainToken("https://example.com/?x=1"), null);
  assert.equal(extractCaptainToken(""), null);
});

test("room form: name, start, reveal time and credentials", () => {
  const now = Date.parse("2026-12-01T10:00:00Z");
  const ok = { ...BLANK_ROOM, label: "Match 3 lobby", startsAt: "2026-12-01T18:30", revealMinutesBefore: "15", roomId: "1234567", password: "tiger" };
  assert.deepEqual(validateRoomForm(ok, { creating: true, now }), {});
  const e = validateRoomForm({ ...BLANK_ROOM, revealMinutesBefore: "181", roomId: "a\nb", password: "x".repeat(41) }, { creating: true, now });
  assert.deepEqual(Object.keys(e).sort(), ["label", "password", "revealMinutesBefore", "roomId", "startsAt"]);
  assert.deepEqual(validateRoomForm({ ...ok, roomId: "", password: "" }, { creating: false, now }), {});
  const body = toCreateBody({ ...ok, roomId: " 1234567 " });
  assert.equal(body.roomId, "1234567");
  assert.equal(body.matchId, null);
  assert.equal(body.revealMinutesBefore, 15);
  assert.ok(typeof body.startsAt === "string" && body.startsAt.endsWith("Z"));
});

test("room words", () => {
  assert.equal(revealText(15), "15 minutes before the start");
  assert.equal(revealText(60), "1 hour before the start");
  assert.equal(revealText(120), "2 hours before the start");
  assert.equal(revealText(0), "at the start");
  assert.equal(matchText(null), "Every confirmed team");
  assert.equal(matchText({ id: "m", teamA: "A", teamB: "B" }), "A vs B");
});

test("room adapters never pass on unexpected fields; a reveal needs both values", () => {
  const room = toOrganiserRoom({ id: "r1", label: "L", startsAt: "x", revealAt: "y", revealMinutesBefore: 15, phase: "revealed", hasCredentials: true, version: 2, views: 3, teamsSeenCurrent: 1, secret_enc: "v1.x", roomId: "LEAK", password: "LEAK" });
  assert.equal(JSON.stringify(room).includes("LEAK"), false);
  assert.equal(JSON.stringify(room).includes("v1.x"), false);
  assert.equal(room.phase, "revealed");
  assert.equal(toOrganiserRoom({ id: "r1", phase: "weird" }).phase, "waiting");
  const cap = toCaptainRoom({ id: "r1", event: { id: "e1", name: "Cup" }, team: "A", label: "L", phase: "waiting", password: "LEAK" });
  assert.equal(JSON.stringify(cap).includes("LEAK"), false);
  assert.equal(toRevealed({ id: "r1", roomId: "R" }), null);
  assert.deepEqual(toRevealed({ id: "r1", label: "L", team: "A", startsAt: "s", version: 1, roomId: "R", password: "P" }), { id: "r1", label: "L", team: "A", startsAt: "s", version: 1, roomId: "R", password: "P" });
  const st = toRoomsState({ event: { id: "e1", name: "Cup" }, canEdit: true, rooms: [{ id: "r1" }, { nope: 1 }], matches: [{ id: "m1", teamA: "A", teamB: "B", round: 1 }], limits: {} });
  assert.equal(st.rooms.length, 1);
  assert.equal(st.revealMax, 180);
  assert.deepEqual(toToolSwitches({ rooms: true, recaps: "yes" }), { rooms: true, recaps: false, screenshots: false, canEdit: false });
});

test("revealed credentials are kept in memory only, and their block is masked from recorders and translators", () => {
  const hook = read("src/features/match-rooms/hooks/useRooms.ts");
  assert.doesNotMatch(hook, /localStorage|sessionStorage|history\.(push|replace)State|location\.(href|hash)\s*=/);
  const ui = read("src/features/match-rooms/ui/RoomsScreens.tsx");
  assert.match(ui, /data-clarity-mask="true" translate="no"/);
  const api = read("src/features/match-rooms/services/rooms.api.ts");
  assert.match(api, /revealRoom = \(roomId: string\) => map\(v3Post/);
});

test("confirm all confirms only the rows without problems, and saving still needs every row confirmed", () => {
  let rows = fromRead(parseResultsText("1 Alpha 12" + String.fromCharCode(10) + "2 Beta 8" + String.fromCharCode(10) + "2 Gamma 3"));
  assert.equal(cleanUnconfirmed(rows), 1); // Beta and Gamma share placement 2
  rows = confirmClean(rows);
  assert.deepEqual(rows.map((r) => r.confirmed), [true, false, false]);
  assert.match(saveBlocker(rows, "3"), /problem|confirmed/);
  assert.throws(() => toSaveBody(rows, "3", false));
  rows = editRow(rows, "r3", { placement: "3" });
  rows = confirmClean(rows);
  assert.ok(rows.every((r) => r.confirmed));
  assert.ok(toSaveBody(rows, "3", false).rows.every((r) => r.confirmed === true));
  assert.equal(cleanUnconfirmed(rows), 0);
});
