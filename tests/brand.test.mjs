// Run: node --import tsx --test tests/brand.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { BLACK, INK, WHITE, brandCss, brandTheme, colourWarnings, contrast, fetchPublicBrand, fixContrast, isHex, luminance, normaliseHex, readableOn, toBrand } from "../src/lib/brand.ts";

const PNG = "data:image/png;base64,iVBORw0KGgo=";

test("contrast follows the WCAG formula", () => {
  assert.equal(luminance("#000000"), 0);
  assert.equal(luminance("#ffffff"), 1);
  assert.equal(Math.round(contrast("#000000", "#ffffff")), 21);
  assert.equal(contrast("#777777", "#777777"), 1);
  assert.ok(Math.abs(contrast("#767676", "#ffffff") - 4.54) < 0.02); // the well-known smallest grey that passes on white
  assert.equal(contrast("#123456", "#fedcba"), contrast("#fedcba", "#123456"));
});

test("readableOn picks white on dark colours and black on light ones", () => {
  assert.equal(readableOn("#000000"), WHITE);
  assert.equal(readableOn("#0a1a4a"), WHITE);
  assert.equal(readableOn("#ffff00"), BLACK);
  assert.equal(readableOn("#ffffff"), BLACK);
  assert.equal(readableOn("not a colour"), WHITE);
  for (let i = 0; i < 4096; i += 7) {
    const c = `#${((i * 4099) & 0xffffff).toString(16).padStart(6, "0")}`;
    assert.ok(contrast(c, readableOn(c)) >= 4.5, `${c} gives text below 4.5:1`);
  }
});

test("fixContrast leaves a passing colour alone and nudges a failing one", () => {
  assert.equal(fixContrast("#22d3ee", INK), "#22d3ee");
  const fixed = fixContrast("#1a2b8a", INK);
  assert.ok(contrast(fixed, INK) >= 4.5);
  assert.notEqual(fixed, "#1a2b8a");
  const onWhite = fixContrast("#ffe066", WHITE);
  assert.ok(contrast(onWhite, WHITE) >= 4.5);
  assert.equal(fixContrast("#000000", INK).length, 7);
  assert.ok(contrast(fixContrast("#000000", INK), INK) >= 4.5);
  assert.ok(contrast(fixContrast("#ffffff", WHITE), WHITE) >= 4.5);
  assert.equal(fixContrast("junk", INK), "#22d3ee");
  assert.equal(fixContrast("#abc", INK), contrast("#aabbcc", INK) >= 4.5 ? "#aabbcc" : fixContrast("#aabbcc", INK));
});

test("fixContrast keeps the hue family: a blue stays bluer than red", () => {
  const f = fixContrast("#1030a0", INK);
  const [r, , b] = [1, 3, 5].map((i) => parseInt(f.slice(i, i + 2), 16));
  assert.ok(b > r);
});

test("normaliseHex and isHex", () => {
  assert.equal(normaliseHex("#ABC"), "#aabbcc");
  assert.equal(normaliseHex(" 0A84FF "), "#0a84ff");
  assert.equal(normaliseHex("#12345"), null);
  assert.equal(normaliseHex("red"), null);
  assert.equal(normaliseHex(5), null);
  assert.equal(isHex("#0a84ff"), true);
  assert.equal(isHex("#0a84f"), false);
  assert.equal(isHex("#0a84ff;x"), false);
});

test("colourWarnings flags dark colours and near-identical pairs", () => {
  assert.deepEqual(colourWarnings("#22d3ee", "#a855f7"), []);
  assert.deepEqual(colourWarnings("#101040", "#a855f7").map((w) => w.which), ["primary"]);
  assert.deepEqual(colourWarnings("#22d3ee", "#101040").map((w) => w.which), ["secondary"]);
  assert.deepEqual(colourWarnings("#22d3ee", "#23d4ef").map((w) => w.which), ["pair"]);
  assert.ok(colourWarnings("#000000", "#010101").every((w) => w.text.length > 20));
});

test("toBrand keeps only safe values", () => {
  assert.equal(toBrand(null), null);
  assert.equal(toBrand({ name: "A", primaryColor: "red", secondaryColor: "#112233" }), null);
  assert.deepEqual(toBrand({ name: "  Acme  ", logo: PNG, primaryColor: "#ABCDEF", secondaryColor: "#112233" }), { name: "Acme", logo: PNG, primary: "#abcdef", secondary: "#112233" });
  const b = toBrand({ name: "", logo: "https://evil.example/x.png", primaryColor: "#abcdef", secondaryColor: "#112233" });
  assert.deepEqual(b, { primary: "#abcdef", secondary: "#112233" });
  assert.equal(toBrand({ logo: "data:image/svg+xml;base64,AAAA", primaryColor: "#abcdef", secondaryColor: "#112233" }).logo, undefined);
  assert.equal(toBrand({ logo: `data:image/png;base64,${"A".repeat(60001)}`, primaryColor: "#abcdef", secondaryColor: "#112233" }).logo, undefined);
  assert.equal(toBrand({ name: "n".repeat(100), primaryColor: "#abcdef", secondaryColor: "#112233" }).name.length, 60);
});

test("brandCss drops unsafe colours; brandTheme adds readable text and a lifted accent", () => {
  assert.deepEqual(brandCss(null), {});
  assert.deepEqual(brandCss({ primary: "#112233", secondary: "red; background:url(x)" }), { "--brand-primary": "#112233" });
  const t = brandTheme({ primary: "#1a2b8a", secondary: "#a855f7" });
  assert.equal(t["--brand-secondary"], "#a855f7");
  assert.equal(t["--brand-primary-fg"], WHITE);
  assert.ok(contrast(t["--brand-accent"], INK) >= 4.5);
  assert.deepEqual(brandTheme(undefined), {});
  assert.deepEqual(brandTheme({ primary: "nope", secondary: "#a855f7" }), { "--brand-secondary": "#a855f7" });
});

test("fetchPublicBrand returns null when the call fails or there is no kit", async () => {
  assert.equal(await fetchPublicBrand("aaaaaaaaaaaa"), null); // no backend configured in tests: the call fails and the page carries on unbranded
});
