// Share cards: the layout maths, the plain-text version, the extras checks and the certificate link. Drawing needs a browser and is covered in e2e/share.spec.ts.
import test from "node:test";
import assert from "node:assert/strict";
import { certificatesHref, fitText, gradientLine, matchCentres, parseBg, pickColumns, planRows, roundColumns, shareFileName, shareText, SIZES, whatsappLink, winnersText, withAlpha } from "../src/lib/share-cards.ts";
import { sanitizeExtras, validate, isLogo, encode, decode } from "../src/lib/display.ts";
import { fitSize, loadExtras, saveExtras } from "../src/lib/extras-store.ts";
import { DISPLAY_THEMES } from "../src/lib/display-themes.ts";

const measure = (s) => s.length * 10;
const PNG = "data:image/png;base64,iVBORw0KGgo=";

test("card sizes are a 1080 square and a 1080x1920 story", () => {
  assert.deepEqual(SIZES.square, { w: 1080, h: 1080 });
  assert.deepEqual(SIZES.story, { w: 1080, h: 1920 });
});

test("fitText leaves short text alone and cuts long text with an ellipsis that fits", () => {
  assert.equal(fitText("Alpha", 100, measure), "Alpha");
  const cut = fitText("Konkan Kings United", 100, measure);
  assert.ok(cut.endsWith("…") && measure(cut) <= 100, cut);
  assert.equal(fitText("anything", 0, measure), "");
  assert.equal(fitText("abcdef", 5, measure), "…");
});

test("planRows keeps every row when they fit, and otherwise cuts the table and counts what is left", () => {
  const few = planRows(5, 800, { minRow: 64, maxRow: 100, gap: 12 });
  assert.equal(few.shown, 5); assert.equal(few.more, 0); assert.ok(few.rowH >= 64 && few.rowH <= 100);
  assert.ok(5 * few.rowH + 4 * 12 <= 800);
  const many = planRows(40, 800, { minRow: 64, maxRow: 100, gap: 12 });
  assert.equal(many.shown + many.more, 40); assert.ok(many.more > 0);
  assert.ok((many.shown + 1) * 64 + many.shown * 12 <= 800 + 12, "the +N more line takes one row slot");
  assert.equal(planRows(0, 800).shown, 0);
  assert.equal(planRows(3, 0).shown, 0);
});

test("pickColumns keeps rank and name, the last figures and the highlighted one", () => {
  assert.deepEqual(pickColumns(["#", "Team", "P", "Pts"], 3), [0, 1, 2, 3]);
  const head = ["#", "Team", ...Array.from({ length: 10 }, (_, i) => `M${i + 1}`), "Kills", "Total"];
  const cols = pickColumns(head, head.length - 1, 5);
  assert.equal(cols.length, 7); assert.deepEqual(cols.slice(0, 2), [0, 1]); assert.ok(cols.includes(head.length - 1));
  const mid = pickColumns(head, 3, 5); // a highlighted column far from the end is still kept
  assert.ok(mid.includes(3)); assert.equal(mid.length, 7);
});

// A knockout with `first` matches in round one, halving each round down to the final.
const bracket = (first) => {
  const sizes = []; for (let n = first; n >= 1; n = Math.floor(n / 2)) { sizes.push(n); if (n === 1) break; }
  return { title: "Cup", sections: [{ name: "", rounds: sizes.map((n, i) => ({ name: `R${i + 1}`, matches: Array.from({ length: n }, () => ({ a: "A", b: "B" })) })) }], champion: "A" };
};
test("a bracket of up to 16 teams shows every round, a bigger one only the last three with a note", () => {
  const small = roundColumns(bracket(8)); // 16 teams, 4 rounds
  assert.equal(small.sections[0].rounds.length, 4); assert.equal(small.note, undefined);
  const big = roundColumns(bracket(16)); // 32 teams, 5 rounds
  assert.equal(big.sections[0].rounds.length, 3); assert.match(big.note, /last 3 rounds/);
  assert.equal(big.sections[0].rounds.at(-1).name, "R5");
});

test("matchCentres spreads boxes evenly inside the column", () => {
  assert.deepEqual(matchCentres(1, 100, 200), [200]);
  assert.deepEqual(matchCentres(2, 0, 100), [25, 75]);
  assert.deepEqual(matchCentres(0, 0, 100), []);
});

test("background and gradient maths", () => {
  assert.deepEqual(parseBg("#05070a", "#000000"), { kind: "solid", angle: 0, stops: ["#05070a"] });
  const lin = parseBg("linear-gradient(160deg,#0b0220,#150636)", "#0b0220");
  assert.equal(lin.kind, "linear"); assert.equal(lin.angle, 160); assert.deepEqual(lin.stops, ["#0b0220", "#150636"]);
  assert.equal(parseBg("radial-gradient(70% 45% at 50% 0%,#1d3a78 0%,#0a1226 70%)", "#0a1226").kind, "radial");
  for (const t of DISPLAY_THEMES) assert.ok(parseBg(t.bg, t.base).stops.every((s) => /^#[0-9a-f]{6}$/i.test(s)), t.id);
  const down = gradientLine(180, 100, 200); assert.ok(Math.abs(down.x0 - 50) < 1e-9 && Math.abs(down.y0) < 1e-9 && Math.abs(down.y1 - 200) < 1e-9);
  assert.equal(withAlpha("#ff0000", 0.5), "rgba(255,0,0,0.5)"); assert.equal(withAlpha("red", 0.5), "red");
});

test("file names are safe", () => {
  assert.equal(shareFileName("League table", "square"), "league-table-square.png");
  assert.equal(shareFileName("???", "story"), "esports-hub-story.png");
  assert.ok(shareFileName("x".repeat(200), "story").length < 60);
});

test("the text version of a table is clean, ready to paste and capped", () => {
  const rows = Array.from({ length: 20 }, (_, i) => [String(i + 1), `Team ${i + 1}`, "3", String(100 - i)]);
  const t = shareText({ v: "table", d: { title: "Standings", subtitle: "After 3 matches", head: ["#", "Team", "K", "Total"], rows, strong: 3 } });
  assert.match(t, /^🏆 \*Standings\*/); assert.match(t, /1\. Team 1 - 100 pts/); assert.match(t, /\+4 more/);
  assert.ok(!t.includes("Team 17")); assert.match(t, /Made with Esports Hub$/);
  assert.ok((t.match(/\p{Extended_Pictographic}/gu) ?? []).length <= 1, "at most one emoji");
});

test("the text version covers schedules, brackets and countdowns, and appends the ticker and sponsors", () => {
  const s = shareText({ v: "schedule", d: { title: "Run-sheet", date: "2026-11-20", slots: [{ n: 1, start: "10:00", end: "10:30", label: "M1, M2" }] } }, { extras: { ticker: ["Finals at 6"], sponsors: [{ name: "Acme" }] } });
  assert.match(s, /Round 1: 10:00 to 10:30 - M1, M2/); assert.match(s, /Finals at 6/); assert.match(s, /Sponsors: Acme/);
  const b = shareText({ v: "bracket", d: { title: "Cup", sections: [{ name: "", rounds: [{ name: "Final", matches: [{ a: "A", b: "B", w: 1 }] }] }], champion: "B" } });
  assert.match(b, /A vs B \(won\)/); assert.match(b, /Champion: B/);
  const now = Date.parse("2026-11-01T00:00:00Z");
  assert.match(shareText({ v: "countdown", d: { title: "Doors", at: "2026-11-03T05:00:00Z" } }, { now }), /Starts in 2 days 5 hours/);
  assert.match(shareText({ v: "countdown", d: { title: "Doors", at: "2026-10-01T00:00:00Z" } }, { now }), /starting now/);
});

test("the WhatsApp link carries the text, encoded", () => {
  const l = whatsappLink("Hi & bye\nline 2");
  assert.ok(l.startsWith("https://wa.me/?text=")); assert.equal(decodeURIComponent(l.slice("https://wa.me/?text=".length)), "Hi & bye\nline 2");
  assert.ok(winnersText({ title: "Winners", first: "A", second: "B" }).includes("2nd: B"));
  assert.ok(!winnersText({ title: "Winners", first: "A" }).includes("2nd"));
});

test("the certificate link lists winner, runner-up and third place and strips the separators from names", () => {
  const h = certificatesHref({ first: "Team A", second: "Team|B", third: "C: Crew" });
  const q = new URL(h, "https://x.test").searchParams.get("awards");
  assert.equal(q, "Winner:Team A|Runner-up:Team B|Third place:C Crew");
  assert.ok(h.startsWith("/tools/certificates/?awards=") && !h.includes("|") && !h.includes(" "));
  assert.equal(new URL(certificatesHref({ first: "Solo" }), "https://x.test").searchParams.get("awards"), "Winner:Solo");
});

test("extras are trimmed and capped: ticker 5 x 80, sponsors 4 x 40, logos only safe image data URLs", () => {
  const x = sanitizeExtras({ ticker: ["  a  ", "", "b".repeat(200), "c", "d", "e", "f"], sponsors: [{ name: "N".repeat(90), logo: PNG }, { name: "Bad", logo: "https://evil.test/x.png" }, { name: "Svg", logo: "data:image/svg+xml;base64,AAAA" }, { name: "" }, { name: "4" }, { name: "5" }] });
  assert.equal(x.ticker.length, 5); assert.equal(x.ticker[0], "a"); assert.equal(x.ticker[1].length, 80);
  assert.equal(x.sponsors.length, 4); assert.equal(x.sponsors[0].name.length, 40); assert.equal(x.sponsors[0].logo, PNG);
  assert.equal(x.sponsors[1].logo, undefined); assert.equal(x.sponsors[2].logo, undefined);
  assert.equal(sanitizeExtras({ ticker: ["", "  "], sponsors: [] }), undefined);
  assert.equal(sanitizeExtras("nope"), undefined);
  assert.ok(isLogo(PNG)); assert.ok(!isLogo("data:image/png;base64," + "A".repeat(60000))); assert.ok(!isLogo("data:image/gif;base64,AAAA")); assert.ok(!isLogo(5));
  assert.equal(sanitizeExtras({ ticker: ["a\u0000b\nc"] }).ticker[0], "a b c");
});

test("validate keeps x on a payload, drops bad x, and the link round trip carries it", async () => {
  const base = { v: "countdown", d: { title: "T", at: "2030-01-01T00:00:00Z" } };
  const p = validate({ ...base, x: { ticker: ["Hi"], sponsors: [{ name: "A", logo: PNG }] } });
  assert.deepEqual(p.x, { ticker: ["Hi"], sponsors: [{ name: "A", logo: PNG }] });
  assert.equal("x" in validate({ ...base, x: { ticker: [""] } }), false);
  assert.equal("x" in validate(base), false);
  assert.deepEqual((await decode(await encode(p))).x, p.x);
});

test("logos are scaled down to at most 240 wide and never enlarged", () => {
  assert.deepEqual(fitSize(480, 120), { w: 240, h: 60 });
  assert.deepEqual(fitSize(100, 50), { w: 100, h: 50 });
  assert.deepEqual(fitSize(200, 600), { w: 53, h: 160 });
  assert.deepEqual(fitSize(0, 0), { w: 1, h: 1 });
});

test("saved extras survive blocked or damaged storage", () => {
  assert.equal(loadExtras(), undefined); // no localStorage in node
  assert.equal(saveExtras({ ticker: ["x"] }), false);
  const mem = new Map();
  globalThis.localStorage = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), removeItem: (k) => mem.delete(k) };
  try {
    assert.equal(saveExtras({ ticker: ["x"], sponsors: [{ name: "A" }] }), true);
    assert.deepEqual(loadExtras(), { ticker: ["x"], sponsors: [{ name: "A" }] });
    mem.set("eh-extras-v1", "{not json"); assert.equal(loadExtras(), undefined);
    saveExtras(undefined); assert.equal(mem.has("eh-extras-v1"), false);
    globalThis.localStorage = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() { throw new Error("blocked"); } };
    assert.equal(loadExtras(), undefined); assert.equal(saveExtras({ ticker: ["x"] }), false);
  } finally { delete globalThis.localStorage; }
});
