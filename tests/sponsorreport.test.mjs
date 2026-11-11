// Run: node --import tsx --test tests/sponsorreport.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { HOW_COUNTED, chartBars, chartText, fillDays, isoDay, parseDay, pdfFileName, percentOf, peakOf, rangeFor, shortDay, sourceRows, summaryText, viewLabel } from "../src/lib/sponsorreport.ts";
import { cleanView, sendHit } from "../src/lib/hits.ts";

const NOW = Date.parse("2026-12-10T15:00:00Z");

test("ranges end today in UTC and have the right length", () => {
  assert.deepEqual(rangeFor("7d", NOW), { from: "2026-12-04", to: "2026-12-10", capped: false });
  assert.deepEqual(rangeFor("30d", NOW), { from: "2026-11-11", to: "2026-12-10", capped: false });
});

test("whole event starts at the event date, is capped at 90 days, and never goes backwards", () => {
  assert.equal(rangeFor("event", NOW, "2026-12-01").from, "2026-12-01");
  assert.equal(rangeFor("event", NOW, "2026-12-01T10:00:00Z").from, "2026-12-01");
  const old = rangeFor("event", NOW, "2025-01-01");
  assert.equal(old.capped, true);
  assert.equal((Date.parse(old.to) - Date.parse(old.from)) / 86_400_000 + 1, 90);
  assert.deepEqual(rangeFor("event", NOW, "2027-01-01"), { from: "2026-12-10", to: "2026-12-10", capped: false });
  assert.equal(rangeFor("event", NOW).capped, false);
  assert.equal(rangeFor("event", NOW, "garbage").from, old.from);
});

test("day parsing is strict", () => {
  assert.equal(parseDay("2026-02-31"), null);
  assert.equal(parseDay("2026-2-3"), null);
  assert.equal(isoDay(parseDay("2026-12-01")), "2026-12-01");
});

test("fillDays shows quiet days as zero and keeps order", () => {
  const d = fillDays([{ day: "2026-12-02", hits: 5 }], "2026-12-01", "2026-12-03");
  assert.deepEqual(d, [{ day: "2026-12-01", hits: 0 }, { day: "2026-12-02", hits: 5 }, { day: "2026-12-03", hits: 0 }]);
  assert.deepEqual(fillDays([], "2026-12-03", "2026-12-01"), []);
});

test("peak ignores zero days and picks the first of equals", () => {
  assert.equal(peakOf([{ day: "a", hits: 0 }]), null);
  assert.equal(peakOf([{ day: "a", hits: 2 }, { day: "b", hits: 2 }]).day, "a");
});

test("chart bars start at zero, scale to the max and mark the peak", () => {
  const { bars, max } = chartBars([{ day: "2026-12-01", hits: 0 }, { day: "2026-12-02", hits: 10 }, { day: "2026-12-03", hits: 5 }], 300, 100);
  assert.equal(max, 10);
  assert.deepEqual(bars.map((b) => b.h), [0, 100, 50]);
  assert.deepEqual(bars.map((b) => b.peak), [false, true, false]);
  assert.ok(bars.every((b) => b.y + b.h === 100 && b.x + b.w <= 300.001));
  assert.equal(chartBars([], 300, 100).bars.length, 0);
});

test("text alternative lists every day", () => {
  const t = chartText([{ day: "2026-12-01", hits: 3 }, { day: "2026-12-02", hits: 0 }]);
  assert.match(t, /1 Dec: 3/);
  assert.match(t, /2 Dec: 0/);
});

test("honest wording: loads, never people, viewers, reach or audience", () => {
  const texts = [
    summaryText({ total: 1, peak: { day: "2026-12-01", hits: 1 } }, "Last 7 days"),
    summaryText({ total: 12, peak: { day: "2026-12-01", hits: 9 } }, "Last 7 days"),
    summaryText({ total: 0, peak: null }, "Last 7 days"),
    HOW_COUNTED,
  ];
  assert.match(texts[0], /1 page load\./);
  assert.match(texts[1], /12 page loads/);
  assert.match(texts[2], /No page loads/);
  for (const t of texts) assert.doesNotMatch(t.replace(/not (unique )?people/gi, ""), /\b(viewers?|reach|audience|people|visitors)\b/i);
  assert.match(HOW_COUNTED, /loads, not people/);
  assert.match(HOW_COUNTED, /no personal|no names/i);
});

test("sources, percentages, view names and file name", () => {
  assert.deepEqual(sourceRows({ live: 3, overlay: 1, embed: 0 }).map((r) => r.label), ["Live page", "Stream overlay", "Embedded widgets"]);
  assert.equal(percentOf(1, 3), 33);
  assert.equal(percentOf(1, 0), 0);
  assert.equal(viewLabel("overlay", "table"), "Standings table");
  assert.equal(viewLabel("live", ""), "Whole page");
  assert.equal(viewLabel("embed", "<b>x</b>"), "<b>x</b>");
  assert.equal(shortDay("2026-12-03"), "3 Dec");
  assert.equal(pdfFileName("Spring Cup!"), "Spring-Cup-sponsor-report.pdf");
  assert.equal(pdfFileName(""), "event-sponsor-report.pdf");
});

test("view names are cleaned to what the server accepts", () => {
  assert.equal(cleanView("Table"), "table");
  assert.equal(cleanView("a b"), "");
  assert.equal(cleanView("x".repeat(21)), "");
  assert.equal(cleanView(undefined), "");
});

test("sendHit is a safe no-op without a browser or backend and never throws", () => {
  assert.doesNotThrow(() => sendHit("abcdefghijkl", "live"));
  assert.doesNotThrow(() => sendHit("", "embed", "x"));
});
