// Guide FAQs are real content (they feed the page and the FAQPage structured data), so they are checked for depth and uniqueness.
import test from "node:test";
import assert from "node:assert/strict";
import { GUIDES } from "../src/content/guides.ts";

test("every guide has at least 5 FAQ items with substantial answers", () => {
  assert.ok(GUIDES.length >= 21);
  for (const g of GUIDES) {
    assert.ok(g.faq && g.faq.length >= 5, `${g.slug} has only ${g.faq?.length ?? 0} FAQ items`);
    for (const f of g.faq) {
      assert.ok(f.a.length >= 350 && f.a.length <= 900, `${g.slug}: answer is ${f.a.length} characters: ${f.q}`);
      assert.ok(!/\]\(\//.test(f.a), `${g.slug}: FAQ answers are plain text (no markdown links): ${f.q}`);
    }
  }
});

test("FAQ questions are unique across all guides and end with a question mark", () => {
  const seen = new Map();
  for (const g of GUIDES) for (const f of g.faq ?? []) {
    assert.ok(f.q.trim().endsWith("?"), `${g.slug}: question must end with ?: ${f.q}`);
    const k = f.q.trim().toLowerCase();
    assert.ok(!seen.has(k), `duplicate question "${f.q}" in ${g.slug} and ${seen.get(k)}`);
    seen.set(k, g.slug);
  }
});

test("FAQ answers are not duplicated", () => {
  const seen = new Map();
  for (const g of GUIDES) for (const f of g.faq ?? []) {
    const k = f.a.trim().toLowerCase();
    assert.ok(!seen.has(k), `duplicate answer in ${g.slug} and ${seen.get(k)}`);
    seen.set(k, g.slug);
  }
});
