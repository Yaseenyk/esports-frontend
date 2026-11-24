// The five tools added on 24 Nov 2026: sensitivity converter, team name generator, slot and prize split, rulebook and the day-wise
// schedule. Every calculation is checked here; the pages and downloads are covered in e2e/new-tools.spec.ts.
import test from "node:test";
import assert from "node:assert/strict";
import * as S from "../src/features/sensitivity/domain.ts";
import * as T from "../src/features/team-name/domain.ts";
import * as P from "../src/features/prize-split/domain.ts";
import * as R from "../src/features/rulebook/domain.ts";
import * as D from "../src/features/schedule-plan/domain.ts";

const near = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps;
const g = (id) => S.gameById(id);

// ------------------------------------------------------------------ sensitivity

test("sensitivity: the yaw values are the published or documented ones, with a source and a checked date", () => {
  assert.deepEqual(Object.fromEntries(S.GAMES.map((x) => [x.id, x.yaw])), { cs2: 0.022, valorant: 0.07, apex: 0.022, ow2: 0.0066 });
  for (const x of S.GAMES) {
    assert.ok(x.sources.length >= 1 && x.sources.every((s) => /^https:\/\//.test(s.url)), x.id);
    assert.ok(x.basis.length > 40, x.id);
  }
  assert.match(S.CHECKED, /^\d{1,2} [A-Z][a-z]{2} 20\d\d$/);
  assert.ok(S.GAMES.find((x) => x.id === "cs2").sources.some((s) => s.url.includes("developer.valvesoftware.com")), "CS2 cites Valve");
  // Mobile games are named only to say there is no conversion.
  assert.ok(!S.GAMES.some((x) => /bgmi|free fire|mobile/i.test(x.name)));
  assert.deepEqual([...S.MOBILE_NOT_CONVERTED], ["BGMI", "Free Fire", "Call of Duty: Mobile"]);
});

test("sensitivity: cm/360 and inches/360 follow 360 / (sens x yaw x DPI)", () => {
  // CS2 sens 1 at 800 DPI: 360 / (0.022 x 800) = 20.4545 inches = 51.95 cm.
  assert.ok(near(S.inchesPer360(1, 0.022, 800), 360 / 17.6));
  assert.ok(near(S.cmPer360(1, 0.022, 800), (360 / 17.6) * 2.54));
  assert.equal(S.roundFor(S.cmPer360(1, 0.022, 800), 2), "51.95");
  // Valorant 0.4 at 800: 360 / 22.4 = 16.07 in = 40.82 cm.
  assert.equal(S.roundFor(S.cmPer360(0.4, 0.07, 800), 2), "40.82");
  assert.equal(S.cmPer360(0, 0.07, 800), Infinity);
  assert.equal(S.degreesPerCount(2, 0.022), 0.044);
});

test("sensitivity: conversions keep cm/360, the well-known ratios hold, and a round trip returns the start", () => {
  assert.ok(near(S.convertSens(1, g("valorant"), g("cs2"), 800), 0.07 / 0.022));       // Valorant to CS2: x 3.1818
  assert.equal(S.roundFor(S.convertSens(1, g("cs2"), g("valorant"), 800), 3), "0.314"); // CS2 to Valorant: / 3.1818
  assert.equal(S.roundFor(S.convertSens(1, g("cs2"), g("ow2"), 800), 2), "3.33");       // CS2 to Overwatch 2: x 3.333
  assert.ok(near(S.convertSens(1.7, g("cs2"), g("apex"), 800), 1.7));                    // same yaw, same number
  for (const a of S.GAMES) for (const b of S.GAMES) {
    const out = S.convertSens(0.5, a, b, 800, 1600);
    assert.ok(near(S.cmPer360(out, b.yaw, 1600), S.cmPer360(0.5, a.yaw, 800), 1e-9), `${a.id} -> ${b.id} keeps cm/360`);
    assert.ok(near(S.convertSens(out, b, a, 1600, 800), 0.5, 1e-12), `${a.id} <-> ${b.id} round trip`);
  }
  // Doubling the DPI halves the sensitivity in the same game.
  assert.ok(near(S.convertSens(2, g("cs2"), g("cs2"), 400, 800), 1));
});

test("sensitivity: convert() validates input and reports the rounded value's own cm/360", () => {
  const r = S.convert({ fromId: "valorant", toId: "cs2", sens: 0.4, dpiFrom: 800, dpiTo: 800 });
  assert.ok(r.ok);
  assert.equal(r.result.sensText, "1.27");
  assert.equal(S.roundFor(r.result.cm360, 2), "40.82");
  assert.ok(Math.abs(r.result.cm360Rounded - r.result.cm360) < 0.1);
  assert.equal(r.result.edpiFrom, 320);
  assert.equal(S.convert({ fromId: "x", toId: "cs2", sens: 1, dpiFrom: 800, dpiTo: 800 }).ok, false);
  assert.equal(S.convert({ fromId: "cs2", toId: "cs2", sens: 0, dpiFrom: 800, dpiTo: 800 }).ok, false);
  assert.equal(S.convert({ fromId: "cs2", toId: "cs2", sens: 1, dpiFrom: 10, dpiTo: 800 }).ok, false);
  assert.equal(S.dpiError("800"), undefined); assert.ok(S.dpiError("")); assert.ok(S.dpiError("70000"));
  assert.equal(S.sensError("0.35"), undefined); assert.ok(S.sensError("-1")); assert.ok(S.sensError("abc"));
  assert.equal(S.allGames(1, g("cs2"), 800, 800).length, S.GAMES.length);
});

// ------------------------------------------------------------------ team names

test("team names: game and publisher names, esports organisations and slurs are blocked, also with spaces and look-alike characters", () => {
  const blocked = {
    game: ["BGMI Warriors", "Free Fire Kings", "freefire squad", "Valorant Vipers", "Team Krafton", "Garena Boys", "PUBG Legends", "Riot Crew", "Apex Hunters", "C0D Squad", "Call of Duty Gang", "V4L0R4NT Five"],
    org: ["Team Liquid", "Fnatic", "S8UL", "GodLike Esports", "Orangutan", "Cloud9", "Global Esports", "Velocity Gaming", "Team Soul", "Sentinels", "Paper Rex", "Gods Reign", "T1", "Navi", "Liquid", "Team Secret", "Entity Gaming", "Revenant Esports", "G0dl1ke"],
    slur: ["Fuck Boys", "F.u.c.k squad", "Chutiya Gang", "BC Boys", "Madarch0d", "Nazi Army", "Bhenchod Five"],
  };
  for (const [reason, names] of Object.entries(blocked)) for (const n of names) {
    const c = T.checkName(n);
    assert.ok(c.blocked, `${n} should be blocked`);
    assert.equal(c.reason, reason, `${n}: ${c.reason}`);
  }
  for (const ok of ["Monsoon Cobras", "Bindaas Toli", "Patriots", "Silent Owls", "Grape Crew", "Classic Kings", "Navin Strikers", "Crisis Five", "Desi Toofan", "Cosmic Comets"]) {
    assert.deepEqual(T.checkName(ok), { blocked: false }, ok);
  }
  assert.ok(T.nameProblem("Team Liquid").includes("esports organisation"));
  assert.ok(T.nameProblem("BGMI Kings").includes("name of a game"));
  assert.ok(T.nameProblem("x"));
  assert.ok(T.nameProblem("y".repeat(40)));
  assert.equal(T.nameProblem("  Monsoon   Cobras "), undefined);
});

test("team names: every theme makes different, clean names from our own lists, and the same seed gives the same list", () => {
  for (const { id } of T.THEMES) {
    const names = T.generateNames(id, 8, 42);
    assert.equal(names.length, 8, id);
    assert.equal(new Set(names).size, 8, `${id} repeats`);
    for (const n of names) {
      assert.equal(T.checkName(n).blocked, false, n);
      const [a, b] = n.split(" ");
      assert.ok(T.WORDS[id].first.includes(a) && T.WORDS[id].second.includes(b), `${n} is from the ${id} lists`);
    }
    assert.deepEqual(T.generateNames(id, 8, 42), names);
    assert.notDeepEqual(T.generateNames(id, 8, 43), names);
  }
  // No word in any list is itself blocked, and the lists leave out names of well-known teams.
  for (const { id } of T.THEMES) for (const w of [...T.WORDS[id].first, ...T.WORDS[id].second]) assert.equal(T.checkName(w).blocked, false, w);
  const all = Object.values(T.WORDS).flatMap((w) => [...w.first, ...w.second]);
  for (const w of ["Falcons", "Titans", "Outlaws", "Dragons", "Gladiators", "Sentinels", "Rogues", "Spirit"]) assert.ok(!all.includes(w), w);
  assert.match(T.glossFor("Bindaas Toli"), /carefree.*squad/);
});

test("team badges: initials, readable lettering and a clean SVG with no images or links", () => {
  assert.equal(T.initials("Monsoon Cobras"), "MC");
  assert.equal(T.initials("Team Silent Owls"), "SO");
  assert.equal(T.initials("Toofan"), "TO");
  assert.equal(T.initials("Lost Red Comets Club"), "LRC");
  assert.equal(T.inkOn("#05070A"), "#F8FAFC");
  assert.equal(T.inkOn("#F8FAFC"), "#05070A");
  for (const c of T.COLOURS) assert.ok(T.contrastRatio(c.hex, T.inkOn(c.hex)) >= 3, `${c.id} lettering contrast`);
  for (const shape of T.SHAPES) for (const pattern of T.PATTERNS) {
    const svg = T.badgeSvg({ name: "Monsoon <Cobras>", shape: shape.id, pattern: pattern.id, primary: "cyan", secondary: "ink" });
    assert.ok(svg.startsWith("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"512\" height=\"512\""));
    assert.ok(svg.includes(">MC</text>"));
    assert.ok(svg.includes("Monsoon &lt;Cobras&gt;"), "names are escaped");
    assert.ok(!/<image|href=|<script|gradient|filter/i.test(svg), "no images, links, scripts, gradients or filters");
  }
  assert.equal(T.badgeFileName("Monsoon Cobras", "png"), "monsoon-cobras-badge.png");
  assert.equal(T.badgeFileName("???", "svg"), "team-badge.svg");
  assert.equal(T.CREATE_TEAM_HREF, "/signup/");
});

// ------------------------------------------------------------------ slots and prize split

test("largest remainder: shares add up to the total exactly, in steps of the unit, and ties go to the higher place", () => {
  assert.deepEqual(P.largestRemainder(10, [1, 1, 1]), [4, 3, 3]);
  assert.deepEqual(P.largestRemainder(100, [1, 1, 1], 10), [40, 30, 30]);
  assert.deepEqual(P.largestRemainder(7, [0, 1]), [0, 7]);
  assert.deepEqual(P.largestRemainder(5, [0, 0]), [0, 0]);
  for (let seed = 1; seed < 200; seed++) {
    const w = Array.from({ length: 1 + (seed % 9) }, (_, i) => ((seed * 31 + i * 17) % 23) + 1), total = (seed * 97) % 5000 + 1;
    const out = P.largestRemainder(total, w);
    assert.equal(out.reduce((a, b) => a + b, 0), total, `seed ${seed}`);
    assert.ok(out.every((x) => Number.isInteger(x) && x >= 0));
    const sum = w.reduce((a, b) => a + b, 0);
    out.forEach((x, i) => assert.ok(Math.abs(x - (w[i] / sum) * total) < 1, "each share is within 1 of its exact value"));
  }
});

test("slots: an even split differs by at most one and adds up; a split by size follows the group sizes and never exceeds them", () => {
  const even = P.splitSlots({ slots: 16, groups: 5, mode: "even" });
  assert.ok(even.ok);
  assert.deepEqual(even.groups.map((x) => x.slots), [4, 3, 3, 3, 3]);
  assert.deepEqual(even.groups.map((x) => x.group), ["Group A", "Group B", "Group C", "Group D", "Group E"]);
  assert.match(even.note, /first 1 group gets one slot more/);
  assert.equal(P.splitSlots({ slots: 12, groups: 4, mode: "even" }).note, undefined);
  for (let s = 1; s <= 60; s++) for (let n = 1; n <= 12; n++) {
    const r = P.splitSlots({ slots: s, groups: n, mode: "even" });
    const v = r.groups.map((x) => x.slots);
    assert.equal(v.reduce((a, b) => a + b, 0), s); assert.ok(Math.max(...v) - Math.min(...v) <= 1);
  }
  const by = P.splitSlots({ slots: 16, groups: 5, mode: "bySize", sizes: [16, 16, 16, 16, 12] });
  assert.ok(by.ok);
  assert.deepEqual(by.groups.map((x) => x.slots), [4, 3, 3, 3, 3]);
  const tight = P.splitSlots({ slots: 10, groups: 3, mode: "bySize", sizes: [2, 10, 10] });
  assert.deepEqual(tight.groups.map((x) => x.slots), [1, 5, 4], "largest remainder: 0.91, 4.55, 4.55 -> the leftover 2 go to the biggest remainders, first group first on a tie");
  const capped = P.splitSlots({ slots: 9, groups: 3, mode: "bySize", sizes: [1, 1, 20] });
  assert.deepEqual(capped.groups.map((x) => x.slots), [1, 0, 8]);
  for (const [slots, sizes] of [[9, [1, 1, 20]], [7, [2, 2, 3]], [21, [1, 1, 20]], [5, [5]], [13, [3, 4, 6, 1]]]) {
    const r = P.splitSlots({ slots, groups: sizes.length, mode: "bySize", sizes });
    assert.equal(r.groups.reduce((a, x) => a + x.slots, 0), slots);
    r.groups.forEach((x, i) => assert.ok(x.slots <= sizes[i], "no group gets more slots than teams"));
  }
  assert.equal(P.splitSlots({ slots: 30, groups: 2, mode: "bySize", sizes: [10, 10] }).ok, false);
  assert.equal(P.splitSlots({ slots: 5, groups: 2, mode: "bySize", sizes: [3] }).ok, false);
  assert.equal(P.splitSlots({ slots: 0, groups: 2, mode: "even" }).ok, false);
  assert.equal(P.splitSlots({ slots: 5, groups: 0, mode: "even" }).ok, false);
});

test("pool split: every rule adds up to the typed figure exactly, rounded to the chosen step", () => {
  const custom = P.splitPool({ pool: 10000, places: 3, rule: "custom", percents: [50, 30, 20], unit: 1 });
  assert.ok(custom.ok);
  assert.deepEqual(custom.places.map((x) => x.share), [5000, 3000, 2000]);
  assert.equal(custom.note, undefined);
  const thirds = P.splitPool({ pool: 1000, places: 3, rule: "equal", unit: 10 });
  assert.deepEqual(thirds.places.map((x) => x.share), [340, 330, 330]);
  assert.equal(thirds.total, 1000);
  assert.match(thirds.note, /still exactly 1000/);
  assert.deepEqual(P.splitPool({ pool: 777, places: 4, rule: "winner", unit: 1 }).places.map((x) => x.share), [777, 0, 0, 0]);
  assert.deepEqual(P.splitPool({ pool: 1000, places: 4, rule: "linear", unit: 1 }).places.map((x) => x.share), [400, 300, 200, 100]);
  assert.deepEqual(P.splitPool({ pool: 700, places: 3, rule: "halving", unit: 1 }).places.map((x) => x.share), [400, 200, 100]);
  for (const rule of ["equal", "linear", "halving", "winner"]) for (const unit of [1, 5, 10, 100]) for (const places of [1, 2, 3, 5, 7, 10, 16]) {
    const pool = unit * (37 + places * 13);
    const r = P.splitPool({ pool, places, rule, unit });
    assert.ok(r.ok, `${rule} ${unit} ${places}`);
    assert.equal(r.places.reduce((a, b) => a + b.share, 0), pool);
    assert.ok(r.places.every((x) => Math.abs(x.share / unit - Math.round(x.share / unit)) < 1e-9), "multiples of the step");
    for (let k = 1; k < r.places.length; k++) assert.ok(r.places[k].share <= r.places[k - 1].share + unit, "no lower place gets more than a step above a higher one");
  }
  assert.match(P.splitPool({ pool: 1000, places: 3, rule: "custom", percents: [50, 30, 10], unit: 1 }).error, /add up to 90/);
  assert.equal(P.splitPool({ pool: 0, places: 3, rule: "equal", unit: 1 }).ok, false);
  assert.match(P.splitPool({ pool: 1005, places: 3, rule: "equal", unit: 10 }).error, /not a whole number of 10s/);
  assert.equal(P.ordinal(1), "1st"); assert.equal(P.ordinal(2), "2nd"); assert.equal(P.ordinal(3), "3rd"); assert.equal(P.ordinal(11), "11th"); assert.equal(P.ordinal(22), "22nd");
});

test("prize split wording: maths only, no currency, no entry fees", () => {
  const text = JSON.stringify([P.RULES]).toLowerCase();
  for (const bad of ["₹", "rs.", "inr", "entry fee", "pay ", "wallet", "deposit"]) assert.ok(!text.includes(bad), bad);
});

// ------------------------------------------------------------------ rulebook

test("rulebook: every format has its own section, the template note, and [brackets] for the organiser's decisions", () => {
  for (const f of R.FORMATS) {
    const text = R.buildRulebook({ ...R.DEFAULT_INPUT, format: f.id, eventName: "Spring Cup", organiser: "Campus Club" });
    assert.ok(text.startsWith("# Spring Cup: rulebook\n"));
    assert.ok(text.includes(R.TEMPLATE_NOTE));
    assert.match(text, new RegExp(`# Format: ${f.label.split(" (")[0].toLowerCase().replace("best-of maps", "best-of maps")}`, "i"));
    assert.ok((text.match(/\[[^\]]+\]/g) ?? []).length >= 5, `${f.id} leaves decisions to the organiser`);
    assert.ok(!/official (rules|scale|points)(?! of any)/i.test(text.replace(R.TEMPLATE_NOTE, "")), `${f.id}: no claim of official rules`);
  }
  const bo5 = R.buildRulebook({ ...R.DEFAULT_INPUT, format: "bo-maps", bestOf: 5 });
  assert.match(bo5, /best of 5: the first team to win 3 maps/);
  const br = R.buildRulebook({ ...R.DEFAULT_INPUT, brMatches: 4 });
  assert.match(br, /Every team plays 4 matches/);
  assert.match(br, /No teaming/);
  const empty = R.buildRulebook({ ...R.DEFAULT_INPUT, eventName: "", organiser: "", contact: "" });
  assert.match(empty, /# \[Event name\]: rulebook/);
  assert.match(empty, /Organiser: \[organiser\]/);
  const other = R.buildRulebook({ ...R.DEFAULT_INPUT, game: "other", otherGame: "Chess", format: "league" });
  assert.match(other, /Game: Chess/);
  const noConduct = R.buildRulebook({ ...R.DEFAULT_INPUT, conduct: { cheating: false, teaming: false, respect: false, devices: false, streaming: false } });
  assert.ok(!/No cheats/.test(noConduct) && /can be warned, lose points or be removed/.test(noConduct));
  assert.equal(R.GAMES.find((x) => x.id === "valorant").format, "bo-maps");
  assert.equal(R.rulebookFileName("Spring Cup 2026"), "spring-cup-2026-rulebook.pdf");
});

test("rulebook layout: text becomes blocks, lines wrap inside the width and pages never end on a lone heading", () => {
  const blocks = R.parseBlocks("# Title\n\nIntro text\n# Heading\n- one\n* two\nplain");
  assert.deepEqual(blocks.map((b) => b.kind), ["title", "para", "heading", "bullet", "bullet", "para"]);
  const m = (s) => s.length * 10;
  const lines = R.wrap("a ".repeat(40) + "supercalifragilistic", 100, m);
  assert.ok(lines.every((l) => m(l) <= 100), "every line fits");
  assert.equal(lines.join(" ").replace(/\s+/g, ""), ("a".repeat(40) + "supercalifragilistic"));
  const text = R.buildRulebook({ ...R.DEFAULT_INPUT, eventName: "Spring Cup" });
  const laid = R.layoutLines(R.parseBlocks(text), 1040, (k, s) => s.length * (k === "title" ? 24 : k === "heading" ? 16 : 12));
  const pages = R.paginate(laid, 1500);
  assert.ok(pages.length >= 2, "a full rulebook takes more than one page");
  assert.equal(pages.flat().length, laid.length, "no line is lost");
  for (const p of pages) {
    assert.notEqual(p.at(-1).kind, "heading", "a heading is never the last line of a page");
    assert.ok(p.reduce((a, l, k) => a + l.h + (k ? l.gap : 0), 0) <= 1500, "a page holds what fits");
  }
});

// ------------------------------------------------------------------ day-wise schedule

const ids = (ms) => ms.map((m) => m.id);
const byId = (ms) => new Map(ms.map((m) => [m.id, m]));
/** Every match comes after the matches it waits for, in list order. */
const topological = (ms) => { const seen = new Set(); return ms.every((m) => { const ok = m.after.every((a) => seen.has(a)); seen.add(m.id); return ok; }); };

test("bracket matches: single elimination has n - 1 matches, byes skipped, feeders listed first", () => {
  for (let n = 2; n <= 40; n++) {
    const ms = D.singleElim(n);
    assert.equal(ms.length, n - 1, `n=${n}`);
    assert.ok(topological(ms), `n=${n} order`);
    assert.equal(ms.at(-1).stage, "Final");
    assert.ok(ms.every((m) => !/Bye/.test(m.label)));
  }
  const six = D.singleElim(6);
  assert.deepEqual(six.map((m) => m.label), ["Seed 4 vs Seed 5", "Seed 3 vs Seed 6", "Seed 1 vs Winner of M1", "Seed 2 vs Winner of M2", "Winner of M3 vs Winner of M4"]);
  assert.deepEqual(six.map((m) => m.after), [[], [], ["M1"], ["M2"], ["M3", "M4"]]);
  assert.deepEqual(D.singleElim(1), []);
});

test("bracket matches: double elimination has 2n - 2 matches plus the optional reset, in a playable order", () => {
  for (let n = 3; n <= 32; n++) {
    const ms = D.doubleElim(n);
    assert.equal(ms.filter((m) => !m.optional).length, 2 * n - 2, `n=${n}`);
    assert.equal(ms.filter((m) => m.optional).length, 1);
    assert.ok(topological(ms), `n=${n} order`);
    assert.deepEqual(ms.slice(-2).map((m) => m.stage), ["Grand final", "Grand final reset (only if needed)"]);
    const map = byId(ms);
    for (const m of ms) for (const a of m.after) assert.ok(map.has(a), `${m.id} waits for a real match`);
  }
  const four = D.doubleElim(4);
  assert.equal(four[0].label, "Seed 1 vs Seed 4");
  assert.ok(four.some((m) => /Loser of M1/.test(m.label)));
});

test("bracket matches: round robin has n(n-1)/2 matches and a team's next match waits for its previous one", () => {
  for (const n of [2, 3, 4, 7, 8, 12]) {
    const ms = D.league(n);
    assert.equal(ms.length, (n * (n - 1)) / 2);
    assert.ok(topological(ms));
    const map = byId(ms);
    for (const m of ms) for (const a of m.after) {
      const shared = m.label.split(" vs ").some((t) => map.get(a).label.split(" vs ").includes(t));
      assert.ok(shared, `${m.id} waits only for a match of one of its teams`);
    }
  }
  assert.equal(D.countMatches(5).length, 5);
  assert.deepEqual(D.countMatches(0), []);
  assert.deepEqual(ids(D.planMatches("count", 3)), ["M1", "M2", "M3"]);
});

const FEST = { duration: 30, gap: 10, stations: 2, days: [{ start: "10:00", end: "18:00" }, { start: "10:00", end: "16:00" }], breakAt: "13:00", breakMinutes: 45 };

test("day plan: no match starts before its feeders finish, nothing overlaps on a station, and the break and day hours are kept", () => {
  for (const source of ["single", "double", "league", "count"]) for (const n of [4, 6, 9, 16]) {
    const r = D.planDays(D.planMatches(source, n), FEST);
    assert.ok(r.ok, `${source} ${n}`);
    const { plan } = r;
    assert.ok(D.respectsOrder(plan, FEST.gap), `${source} ${n}: dependency order`);
    for (let st = 1; st <= FEST.stations; st++) {
      const here = plan.placed.filter((p) => p.station === st).sort((a, b) => a.start - b.start);
      for (let k = 1; k < here.length; k++) assert.ok(here[k].start >= here[k - 1].end + FEST.gap, `${source} ${n}: station ${st} overlap`);
    }
    for (const p of plan.placed) {
      const local = p.start % 1440, day = FEST.days[p.day - 1];
      const [s, e] = [day.start, day.end].map((t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3)));
      assert.ok(local >= s && local + FEST.duration <= e, `${p.match.id} inside day ${p.day}`);
      assert.ok(local + FEST.duration <= 13 * 60 || local >= 13 * 60 + 45, `${p.match.id} avoids the break`);
    }
    // Teams never play two matches at once (round robin labels name the teams).
    if (source === "league") for (const a of plan.placed) for (const b of plan.placed) if (a !== b && a.start < b.end && b.start < a.end) {
      const ta = a.match.label.split(" vs "), tb = b.match.label.split(" vs ");
      assert.ok(!ta.some((t) => tb.includes(t)), `${a.match.id} and ${b.match.id} share a team at the same time`);
    }
  }
});

test("day plan: a worked example, the next day picks up, and what does not fit is listed (with what waits for it)", () => {
  const r = D.planDays(D.singleElim(8), { ...FEST, days: [{ start: "10:00", end: "12:00" }], breakMinutes: 0 });
  assert.ok(r.ok);
  const p = r.plan;
  // 4 quarter-finals on 2 stations: 10:00, 10:00, 10:40, 10:40; semis at 11:20 (both quarter-finals end 11:10, plus the 10 minute gap).
  assert.deepEqual(p.placed.slice(0, 4).map((x) => x.startText), ["10:00", "10:00", "10:40", "10:40"]);
  assert.deepEqual(p.placed.filter((x) => x.match.stage === "Semi-finals").map((x) => x.startText), ["11:20", "11:20"]);
  assert.deepEqual(p.unplaced.map((m) => m.stage), ["Final"], "the final does not fit before 12:00");
  const two = D.planDays(D.singleElim(8), { ...FEST, days: [{ start: "10:00", end: "12:00" }, { start: "09:00", end: "12:00" }], breakMinutes: 0 });
  const final = two.plan.placed.find((x) => x.match.stage === "Final");
  assert.equal(final.day, 2); assert.equal(final.startText, "09:00");
  assert.deepEqual(two.plan.days.map((d) => d.matches), [6, 1]);
  assert.deepEqual(D.planCsv(two.plan)[0], ["Day", "Start", "End", "Station", "Match", "Stage", "Teams"]);
  assert.equal(D.planCsv(two.plan).length, 8);
  // The break pushes a match that would cross it.
  const lunch = D.planDays(D.countMatches(3), { duration: 60, gap: 0, stations: 1, days: [{ start: "11:00", end: "17:00" }], breakAt: "12:30", breakMinutes: 30 });
  assert.deepEqual(lunch.plan.placed.map((x) => x.startText), ["11:00", "13:00", "14:00"]);
});

test("day plan: bad input is refused with a reason", () => {
  const ms = D.countMatches(4);
  assert.match(D.planDays(ms, { ...FEST, duration: 0 }).error, /Minutes per match/);
  assert.match(D.planDays(ms, { ...FEST, stations: 0 }).error, /Stations/);
  assert.match(D.planDays(ms, { ...FEST, days: [] }).error, /1 to 14 days/);
  assert.match(D.planDays(ms, { ...FEST, days: [{ start: "18:00", end: "10:00" }] }).error, /end time must be after/);
  assert.match(D.planDays(ms, { ...FEST, days: [{ start: "", end: "10:00" }] }).error, /start and an end/);
  assert.match(D.planDays([], FEST).error, /no matches/);
  assert.deepEqual(D.windows({ ...FEST, days: [{ start: "10:00", end: "18:00" }] }), [[600, 780], [825, 1080]]);
  assert.equal(D.fit(590, 30, [[600, 620], [700, 800]]), 700);
  assert.equal(D.fit(790, 30, [[600, 620], [700, 800]]), null);
});

// ------------------------------------------------------------------ 25 Nov 2026: presets, stylish versions, eDPI

test("eDPI: sensitivity x DPI, the matching eDPI in another game keeps cm/360, and bad input is refused", () => {
  assert.equal(S.edpi(0.4, 800), 320);
  assert.equal(S.edpi(1.5, 400), 600);
  // Valorant 320 eDPI feels like CS2 320 x 0.07 / 0.022 = 1018.18; CS2 and Apex share a yaw, so their eDPI values match.
  assert.equal(S.roundFor(S.edpiIn(320, g("valorant"), g("cs2")), 1), "1018.2");
  assert.ok(near(S.edpiIn(800, g("cs2"), g("apex")), 800));
  const r = S.edpiCalc("valorant", 0.4, 800);
  assert.ok(r.ok);
  assert.equal(r.result.edpi, 320);
  assert.equal(S.roundFor(r.result.cm360, 2), "40.82");
  assert.equal(r.result.perGame.length, S.GAMES.length);
  for (const x of r.result.perGame) {
    // The listed eDPI in each game, at any DPI, gives the same cm/360: sens = eDPI / DPI.
    assert.ok(near(S.cmPer360(x.edpi / 800, x.game.yaw, 800), r.result.cm360, 1e-9), x.game.id);
  }
  assert.equal(S.edpiCalc("x", 1, 800).ok, false);
  assert.equal(S.edpiCalc("cs2", 0, 800).ok, false);
  assert.equal(S.edpiCalc("cs2", 1, 20).ok, false);
});

test("team names: each game preset shapes the names, keeps them clean, and the Free Fire guild preset keeps them short", () => {
  assert.deepEqual(T.PRESETS.map((p) => p.id), ["general", "ff-guild", "bgmi-team", "pc-team", "clan"]);
  // The default preset gives exactly the old two-word list, so nothing changes for the existing page.
  for (const { id } of T.THEMES) assert.deepEqual(T.generateNames(id, 8, 42, "general"), T.generateNames(id, 8, 42));
  for (const { id: preset } of T.PRESETS) for (const { id: theme } of T.THEMES) {
    const names = T.generateNames(theme, 8, 7, preset);
    assert.equal(names.length, 8, `${preset}/${theme}`);
    assert.equal(new Set(names).size, 8, `${preset}/${theme} repeats`);
    for (const n of names) assert.equal(T.checkName(n).blocked, false, n);
    assert.deepEqual(T.generateNames(theme, 8, 7, preset), names, "same seed, same list");
  }
  const ff = T.THEMES.flatMap(({ id }) => T.generateNames(id, 8, 11, "ff-guild"));
  assert.ok(ff.every((n) => Array.from(n).length <= T.SHORT_NAME), "short guild names");
  assert.ok(ff.some((n) => !n.includes(" ")), "some written as one word");
  const bgmi = T.THEMES.flatMap(({ id }) => T.generateNames(id, 8, 11, "bgmi-team"));
  assert.ok(bgmi.some((n) => /^Team |Esports$|Squad$/.test(n)), "squad-style names");
  const clan = T.THEMES.flatMap(({ id }) => T.generateNames(id, 8, 11, "clan"));
  assert.ok(clan.every((n) => /^The |Clan$|^Order of the /.test(n)), "clan-style names");
  assert.match(T.glossFor("BindaasToli"), /carefree.*squad/);
});

test("stylish versions: fancy letters and symbols, turned back to the plain name before the blocklist, never hiding a blocked name", () => {
  const name = "Monsoon Cobras";
  for (const l of T.LETTERS) for (const f of T.FRAMES) {
    const s = T.stylish(name, l.id, f.id);
    assert.ok(s, `${l.id}/${f.id}`);
    if (l.id !== "plain" || f.id !== "none") assert.notEqual(s, name);
    // Normalised, the stylish version is the plain name again (frames are symbols, removed by the check).
    assert.equal(T.unstyle(s).replace(/[^A-Za-z ]/g, "").toLowerCase(), name.toLowerCase(), `${l.id}/${f.id}: ${s}`);
    assert.deepEqual(T.checkName(s), { blocked: false }, s);
    assert.equal(T.charCount(s), Array.from(s).length);
  }
  assert.equal(T.stylish(name, "bold", "curl"), "꧁𝐌𝐨𝐧𝐬𝐨𝐨𝐧 𝐂𝐨𝐛𝐫𝐚𝐬꧂");
  assert.equal(T.stylish(name, "smallcaps", "none"), "ᴍᴏɴꜱᴏᴏɴ ᴄᴏʙʀᴀꜱ");
  assert.equal(T.charCount("꧁Ab꧂"), 4);
  // Every stylish version of every generated name passes; a blocked name stays blocked in every style.
  for (const { id: preset } of T.PRESETS) for (const n of T.generateNames("animals", 8, 3, preset)) for (const l of T.LETTERS) for (const f of T.FRAMES) {
    assert.equal(T.checkName(T.stylish(n, l.id, f.id)).blocked, false, `${n} ${l.id}/${f.id}`);
  }
  for (const bad of ["Free Fire Kings", "Garena Boys", "S8UL", "Team Liquid", "Chutiya Gang", "FF Squad"]) {
    for (const l of T.LETTERS) for (const f of T.FRAMES) {
      const raw = (f.open + (l.id === "plain" ? bad : Array.from(bad).map((c) => T.stylish(c, l.id, "none") || c).join("")) + f.close);
      assert.ok(T.checkName(raw).blocked, `${raw} should be blocked`);
      assert.equal(T.stylish(bad, l.id, f.id), "", `${bad} gets no stylish version`);
    }
  }
  // Typed names in fancy letters or look-alike Cyrillic are caught as well.
  for (const n of ["ꜰʀᴇᴇꜰɪʀᴇ Kings", "𝐒𝟖𝐔𝐋", "꧁Ｖａｌｏｒａｎｔ꧂", "Gаrena Squad", "亗ʙɢᴍɪ亗"]) assert.ok(T.checkName(n).blocked, n);
});

test("schedule times read as 12-hour on the page, like the time inputs", async () => {
  const { display12 } = await import("../src/lib/schedule.ts");
  assert.equal(display12("00:05"), "12:05 AM");
  assert.equal(display12("09:30"), "9:30 AM");
  assert.equal(display12("12:00"), "12:00 PM");
  assert.equal(display12("13:45"), "1:45 PM");
  assert.equal(display12("23:59 (+1d)"), "11:59 PM (+1d)");
  assert.equal(display12(""), "");
  assert.equal(display12("soon"), "soon");
});
