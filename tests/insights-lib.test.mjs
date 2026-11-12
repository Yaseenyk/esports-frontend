// Run: node --import tsx --test tests/insights-*.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { normaliseAnalytics, isEmpty, fillMonths, monthLabel, normaliseKeys, keyError, addMemberMessage, insightsError, MAX_KEYS } from "../src/lib/insights.ts";

test("analytics: garbage becomes zeros and personal fields are dropped", () => {
  const a = normaliseAnalytics({ events: { total: -3, byMonth: [{ month: "bad", count: 2 }, { month: "2026-11", count: 3 }] }, perEvent: [{ id: "e", name: "Cup", email: "a@b.c", registrations: { total: 2 } }] });
  assert.equal(a.events.total, 0);
  assert.deepEqual(a.events.byMonth, [{ month: "2026-11", count: 3 }]);
  assert.equal(JSON.stringify(a).includes("a@b.c"), false);
  assert.equal(isEmpty(normaliseAnalytics(null)), true);
  assert.equal(isEmpty(normaliseAnalytics({ checkIns: { total: 1 } })), false);
});

test("fillMonths gives every month oldest first, across a year boundary", () => {
  const r = fillMonths([{ month: "2026-01", count: 2 }], 3, "2026-02-10");
  assert.deepEqual(r, [{ month: "2025-12", count: 0 }, { month: "2026-01", count: 2 }, { month: "2026-02", count: 0 }]);
  assert.equal(fillMonths([], 12, "2026-11-12").length, 12);
  assert.equal(monthLabel("2026-11"), "Nov 2026");
});

test("keys: list shapes accepted, secret never kept, errors in plain words", () => {
  assert.equal(normaliseKeys({ keys: [{ id: "k", label: "Sheet", key: "ehk_secret", lastUsedAt: null }] }).length, 1);
  assert.equal(JSON.stringify(normaliseKeys([{ id: "k", label: "x", key: "ehk_secret" }])).includes("secret"), false);
  assert.deepEqual(normaliseKeys("nope"), []);
  assert.match(keyError({ status: 409 }, "create"), new RegExp(String(MAX_KEYS)));
  assert.match(keyError({ status: 404 }, "revoke"), /already gone/);
  assert.match(insightsError({ status: 404 }), /not available/);
});

test("add member: a pending invitation says Invitation sent, never 'has access'", () => {
  assert.match(addMemberMessage({ pending: true, email: "a@b.c" }, "x@y.z"), /^Invitation sent to a@b\.c/);
  assert.doesNotMatch(addMemberMessage({ pending: true }, "x@y.z"), /has .* access/);
  assert.equal(addMemberMessage({ name: "Bob", role: "editor" }, "b@x.y"), "Bob now has edit access.");
});
