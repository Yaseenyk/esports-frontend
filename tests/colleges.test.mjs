// College adapter: only a fixed list of fields reaches the page; bad slugs and empty names are dropped.
import test from "node:test";
import assert from "node:assert/strict";
import { toCollege, toCollegeList } from "../src/features/colleges/college.ts";

test("list keeps valid rows and drops bad slugs and leaked fields", () => {
  const out = toCollegeList({ items: [
    { slug: "gokte-college", name: "Gokte College", tournaments: 2, indexable: true, lastStartsAt: "2026-12-01T10:00:00Z", orgId: "o1", ownerEmail: "a@b.c" },
    { slug: "Bad Slug", name: "X", tournaments: 1 }, { slug: "ok", name: "" }, null,
  ] });
  assert.equal(out.length, 1);
  assert.deepEqual(Object.keys(out[0]).sort(), ["indexable", "lastStartsAt", "name", "slug", "tournaments"]);
});

test("detail maps tournaments through the card adapter and defaults to noindex", () => {
  const c = toCollege({ slug: "gokte-college", name: "Gokte College", tournaments: [{ slug: "gokte-cup", title: "Gokte Cup", seoReady: true }, { slug: "BAD", title: "x" }], eventId: "e1" });
  assert.equal(c.indexable, false);
  assert.equal(c.tournaments.length, 1);
  assert.equal("eventId" in c, false);
  assert.equal(toCollege({ slug: "x" }), null);
});
