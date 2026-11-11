// The FAQ answers on the tool pages are the substance that people and search engines read, so they are guarded: enough questions, real answers, no repeats.
import test from "node:test";
import assert from "node:assert/strict";
import { TOOL_PAGES } from "../src/lib/tool-pages.ts";

const pages = Object.entries(TOOL_PAGES);

test("there are fourteen tool pages", () => assert.equal(pages.length, 14));

test("every tool page has at least 7 FAQ items with real answers", () => {
  for (const [slug, p] of pages) {
    assert.ok(p.faq.length >= 7, `${slug} has only ${p.faq.length} questions`);
    for (const { q, a } of p.faq) {
      assert.ok(q.trim().endsWith("?"), `${slug}: "${q}" does not end with ?`);
      assert.ok(a.length >= 350 && a.length <= 1100, `${slug}: answer to "${q}" is ${a.length} characters`);
    }
  }
});

test("questions are unique within and across pages, and no answer is repeated", () => {
  const qs = new Set(), as = new Set();
  for (const [slug, p] of pages) for (const { q, a } of p.faq) {
    const k = q.toLowerCase().trim();
    assert.ok(!qs.has(k), `${slug}: duplicate question "${q}"`);
    assert.ok(!as.has(a), `${slug}: repeated answer to "${q}"`);
    qs.add(k); as.add(a);
  }
});
