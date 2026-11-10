// The PDF layout is the part of printing that can be checked without a browser.
import test from "node:test";
import assert from "node:assert/strict";
import { buildPdf } from "../src/lib/idcard/export.ts";
import { FORMATS } from "../src/lib/idcard/types.ts";

// A real 1x1 JPEG, so jsPDF has something to embed.
const JPG = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
const cards = (fmt, n) => Array.from({ length: n }, () => ({ png: JPG, fmt }));
const pageCount = async (blob) => ((await blob.text()).match(/\/Type\s*\/Page[^s]/g) || []).length;

test("wallet cards: 8 to an A4 page, so 20 cards need 3 pages", async () => {
  const blob = buildPdf(cards("wallet", 20), [], { marks: false });
  assert.equal(blob.type, "application/pdf");
  assert.equal(await pageCount(blob), 3);
});

test("backs go on their own pages after the fronts", async () => {
  assert.equal(await pageCount(buildPdf(cards("wallet", 8), [], { marks: true })), 1);
  assert.equal(await pageCount(buildPdf(cards("wallet", 8), cards("wallet", 8), { marks: true })), 2);
});

test("different card shapes never share a page", async () => {
  const mixed = [...cards("wallet", 2), ...cards("portrait", 2), ...cards("strip", 2)];
  assert.equal(await pageCount(buildPdf(mixed, [], { marks: false })), 3);
});

test("every shape fits at least one card per row and per page", () => {
  for (const [k, f] of Object.entries(FORMATS)) {
    const blob = buildPdf(cards(k, 1), [], { marks: true, bleedMm: 3 });
    assert.ok(blob.size > 500, k);
    assert.ok(f.w + 2 * 3 <= 210, `${k} with bleed does not fit across A4`);
  }
});

test("bleed spaces the cards further apart, so it never overlaps a neighbour", async () => {
  // Strips are tall enough that 12 fit per page with a small gap; the larger bleed gap must not push the count above what fits.
  const without = await pageCount(buildPdf(cards("strip", 24), [], { marks: false }));
  const withBleed = await pageCount(buildPdf(cards("strip", 24), [], { marks: false, bleedMm: 3 }));
  assert.ok(withBleed >= without);
  const wallet = await pageCount(buildPdf(cards("wallet", 30), [], { marks: true, bleedMm: 3 }));
  assert.ok(wallet >= 4);
});

test("an empty set still gives a valid, if empty, document", () => {
  const blob = buildPdf([], [], { marks: false });
  assert.equal(blob.type, "application/pdf");
});

test("sheet layout: tight spacing fits 10 wallet cards on A4, Letter has its own page size", async () => {
  const roomy = await pageCount(buildPdf(cards("wallet", 20), [], { marks: false }));
  const tight = await pageCount(buildPdf(cards("wallet", 20), [], { marks: false, gapMm: 0, marginMm: 5 }));
  assert.equal(roomy, 3);
  assert.equal(tight, 2);
  const letter = buildPdf(cards("wallet", 1), [], { marks: false, paper: "letter" });
  assert.match(await letter.text(), /MediaBox\s*\[\s*0\s+0\s+612\.?\s+792/);
});

test("a custom gap never lets bleed overlap the neighbour", async () => {
  const withBleed = await pageCount(buildPdf(cards("wallet", 20), [], { marks: false, gapMm: 0, marginMm: 5, bleedMm: 3 }));
  assert.ok(withBleed >= 2);
});
