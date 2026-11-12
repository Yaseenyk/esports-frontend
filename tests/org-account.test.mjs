// Run: node --import tsx --test tests/org-*.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { deleteBlock } from "../src/lib/account-delete.ts";

test("deletion: the new refusals read as plain words and keep the old ones intact", () => {
  const club = deleteBlock({ status: 409, detail: { code: "sole_owner" } });
  assert.equal(club.kind, "club");
  assert.match(club.text, /only admin of a club/);
  assert.match(club.text, /Nothing was deleted/);
  const count = deleteBlock({ status: 409, detail: { code: "events_need_count_confirmation" } });
  assert.equal(count.kind, "count");
  assert.equal(deleteBlock({ status: 409, detail: { code: "events_need_delete_confirmation", events: [] } }).kind, "confirm");
  assert.equal(deleteBlock({ status: 409, detail: { code: "deletion_continues" } }), null); // handled by resending, not shown as a block
});
