// Run: node --import tsx --test tests/runofshow.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import {
  TEMPLATES, absMinutes, clampItem, displayTime, filterByOwner, firstProblem, formatHM, fromTemplate, inText, moveItem, newItem, nowNext, owners,
  parseHM, progress, readToken, runUrl, shiftItems, sortByTime, toPayload, whenText,
} from "../src/lib/runofshow.ts";

const it = (atTime, title, o = {}) => newItem({ atTime, title, ...o });
const at = (h, m, day = 0) => new Date(2026, 11, 1 + day, h, m); // event day is 2026-12-01

test("times parse and format", () => {
  assert.equal(parseHM("09:30"), 570);
  assert.equal(parseHM("9:30"), 570);
  assert.equal(parseHM("24:00"), null);
  assert.equal(parseHM("12:60"), null);
  assert.equal(parseHM("noon"), null);
  assert.equal(formatHM(570), "09:30");
  assert.equal(formatHM(1440 + 5), "00:05");
  assert.equal(formatHM(-5), "23:55");
  assert.equal(displayTime("00:05"), "12:05 am");
  assert.equal(displayTime("12:00"), "12:00 pm");
  assert.equal(displayTime("13:45"), "1:45 pm");
  assert.equal(displayTime("bad"), "bad");
  assert.equal(whenText({ atTime: "09:00", dayOffset: 1 }), "9:00 am, next day");
  assert.equal(whenText({ atTime: "09:00", dayOffset: 2 }), "9:00 am, day 3");
});

test("templates are plain suggestions with valid times", () => {
  assert.deepEqual(TEMPLATES.map((t) => t.title), ["College fest esports day", "Weekend custom-room tournament", "Gaming cafe league night"]);
  for (const t of TEMPLATES) {
    assert.ok(t.items.length >= 8);
    for (const i of t.items) { assert.ok(parseHM(i.atTime) !== null, i.title); assert.ok(i.title.length <= 100); }
    const rows = fromTemplate(t.id);
    assert.equal(rows.length, t.items.length);
    assert.equal(new Set(rows.map((r) => r.id)).size, rows.length);
    assert.equal(firstProblem(rows), null);
  }
  assert.ok(TEMPLATES[0].items.some((i) => /doors open/i.test(i.title)));
  assert.ok(TEMPLATES[0].items.some((i) => /captains/i.test(i.title)));
  assert.deepEqual(fromTemplate("nope"), []);
});

test("move up and down", () => {
  const l = ["a", "b", "c"];
  assert.deepEqual(moveItem(l, 1, -1), ["b", "a", "c"]);
  assert.deepEqual(moveItem(l, 1, 1), ["a", "c", "b"]);
  assert.equal(moveItem(l, 0, -1), l);
  assert.equal(moveItem(l, 2, 1), l);
  assert.deepEqual(l, ["a", "b", "c"]);
});

test("sort by time keeps the order of equal times and puts later days last", () => {
  const l = [it("10:00", "b"), it("09:00", "a2"), it("09:00", "a1"), it("01:00", "next", { dayOffset: 1 })];
  assert.deepEqual(sortByTime(l).map((x) => x.title), ["a2", "a1", "b", "next"]);
});

test("shift by minutes, rolling over midnight and stopping at the start of the day", () => {
  const l = [it("09:00", "a"), it("23:30", "b")];
  const r = shiftItems(l, 45);
  assert.deepEqual(r.items.map((x) => [x.atTime, x.dayOffset]), [["09:45", 0], ["00:15", 1]]);
  assert.equal(r.clamped, false);
  const back = shiftItems(r.items, -45);
  assert.deepEqual(back.items.map((x) => [x.atTime, x.dayOffset]), [["09:00", 0], ["23:30", 0]]);
  const early = shiftItems(l, -600);
  assert.deepEqual(early.items.map((x) => x.atTime), ["00:00", "13:30"]);
  assert.equal(early.clamped, true);
  assert.deepEqual(shiftItems(l, 0).items.map((x) => x.atTime), ["09:00", "23:30"]);
  assert.equal(l[0].atTime, "09:00"); // input untouched
});

test("now and next follow the local time", () => {
  const l = [it("09:00", "Doors"), it("10:00", "Briefing"), it("12:00", "Matches")];
  let r = nowNext(l, at(9, 30), "2026-12-01");
  assert.equal(r.now.title, "Doors"); assert.equal(r.next.title, "Briefing"); assert.equal(r.minutesToNext, 30);
  r = nowNext(l, at(8, 0), "2026-12-01");
  assert.equal(r.now, null); assert.equal(r.next.title, "Doors");
  r = nowNext(l, at(13, 0), "2026-12-01");
  assert.equal(r.now.title, "Matches"); assert.equal(r.next, null); assert.equal(r.minutesToNext, null);
  // finished items are never "now"; a doing item wins
  const d = [it("09:00", "Doors", { status: "done" }), it("10:00", "Briefing", { status: "doing" }), it("11:00", "Matches")];
  assert.equal(nowNext(d, at(11, 30), "2026-12-01").now.title, "Briefing");
  const done = [it("09:00", "Doors", { status: "done" }), it("10:00", "Briefing", { status: "todo" })];
  assert.equal(nowNext(done, at(9, 30), "2026-12-01").now, null);
  // order of the input does not matter
  assert.equal(nowNext([...l].reverse(), at(10, 15), "2026-12-01").now.title, "Briefing");
});

test("now and next across days and with the event date unknown", () => {
  const l = [it("18:00", "Day 1 end"), it("10:00", "Day 2 start", { dayOffset: 1 })];
  assert.equal(nowNext(l, at(9, 0, 1), "2026-12-01").now.title, "Day 1 end");
  assert.equal(nowNext(l, at(9, 0, 1), "2026-12-01").minutesToNext, 60);
  assert.equal(nowNext(l, at(11, 0, 1), "2026-12-01").now.title, "Day 2 start");
  // before the event day nothing has started; a week later everything has
  assert.equal(nowNext(l, at(12, 0, -3), "2026-12-01").now, null);
  assert.equal(nowNext(l, at(12, 0, 5), "2026-12-01").next, null);
  // no date: today counts as day 0
  assert.equal(nowNext(l, at(19, 0), "").now.title, "Day 1 end");
  assert.equal(nowNext(l, at(19, 0), "Dec 2026").now.title, "Day 1 end");
});

test("owner filter and owner list", () => {
  const l = [it("09:00", "a", { ownerName: "Asha" }), it("10:00", "b", { ownerName: "asha / Ravi" }), it("11:00", "c", { ownerName: "Mira" }), it("12:00", "d")];
  assert.deepEqual(filterByOwner(l, "Asha").map((x) => x.title), ["a", "b"]);
  assert.deepEqual(filterByOwner(l, "ravi").map((x) => x.title), ["b"]);
  assert.equal(filterByOwner(l, "").length, 4);
  assert.equal(filterByOwner(l, "  ").length, 4);
  assert.deepEqual(owners(l), ["Asha", "asha / Ravi", "Mira"]);
});

test("validation, clamping and payload", () => {
  assert.equal(firstProblem([it("09:00", "ok")]), null);
  assert.match(firstProblem([it("09:00", "  ")]), /Item 1 needs a title/);
  assert.match(firstProblem([it("09:00", "ok"), it("9am", "x")]), /Item 2 needs a time/);
  assert.match(firstProblem(Array.from({ length: 201 }, (_, i) => it("09:00", `i${i}`))), /at most 200/);
  const c = clampItem(it("09:00", "t".repeat(150), { ownerName: "o".repeat(90), notes: "n".repeat(400), dayOffset: 99 }));
  assert.equal(c.title.length, 100); assert.equal(c.ownerName.length, 60); assert.equal(c.notes.length, 300); assert.equal(c.dayOffset, 30);
  const p = toPayload([it("9:05", "  Hi  ", { ownerName: " Asha " })]);
  assert.equal(p[0].atTime, "09:05"); assert.equal(p[0].title, "Hi"); assert.equal(p[0].ownerName, "Asha");
  assert.deepEqual(progress([{ status: "done" }, { status: "todo" }, { status: "doing" }]), { done: 1, total: 3 });
  assert.equal(absMinutes({ atTime: "01:00", dayOffset: 1 }), 1500);
});

test("link url, token reading and duration text", () => {
  assert.equal(runUrl("https://hub.example/", "abc_DEF-ghi123456789012345"), "https://hub.example/run/?t=abc_DEF-ghi123456789012345");
  assert.equal(readToken("?t=abc_DEF-ghi123456789012345"), "abc_DEF-ghi123456789012345");
  assert.equal(readToken("?t=short"), "");
  assert.equal(readToken(""), "");
  assert.equal(inText(0), "less than a minute"); assert.equal(inText(45), "45 min"); assert.equal(inText(60), "1 h"); assert.equal(inText(135), "2 h 15 min");
});
