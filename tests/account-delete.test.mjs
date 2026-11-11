import test from "node:test";
import assert from "node:assert/strict";
import { deleteBlock } from "../src/lib/account-delete.ts";
import { createClient } from "../src/lib/api/client.ts";

const answer = (status, body) => async () => ({ ok: false, status, headers: { get: () => null }, json: async () => body });

test("the client keeps the code and the event list the server sends with an error", async () => {
  const body = { error: "long text", code: "events_need_delete_confirmation", events: [{ id: "e1", name: "Summer Cup" }, { nope: 1 }] };
  const c = createClient({ base: "http://x", fetchImpl: answer(409, body) });
  await assert.rejects(c.post("/auth/delete-account", { password: "p" }), (e) => e.status === 409 && e.detail.code === "events_need_delete_confirmation" && e.detail.events.length === 1 && e.detail.events[0].name === "Summer Cup");
});

test("an error without a code has no detail (nothing else changes)", async () => {
  const c = createClient({ base: "http://x", fetchImpl: answer(401, { error: "Password is wrong" }) });
  await assert.rejects(c.post("/auth/delete-account", { password: "p" }), (e) => e.status === 401 && e.detail === undefined && e.serverError === "Password is wrong");
});

test("events with only viewers ask for an explicit confirmation, in plain words", () => {
  const b = deleteBlock({ status: 409, detail: { code: "events_need_delete_confirmation", events: [{ id: "e1", name: "Summer Cup" }] } });
  assert.equal(b.kind, "confirm");
  assert.match(b.text, /Summer Cup/);
  assert.match(b.text, /deleted with your account/);
  assert.match(b.text, /Tick the box/);
  const many = deleteBlock({ status: 409, detail: { code: "events_need_delete_confirmation", events: Array.from({ length: 7 }, (_, i) => ({ id: `e${i}`, name: `Cup ${i}` })) } });
  assert.match(many.text, /and 2 more/);
});

test("a slug conflict names the co-organiser and says nothing was deleted", () => {
  const b = deleteBlock({ status: 409, detail: { code: "ownership_conflict", events: [{ id: "e1", name: "Summer Cup", newOwnerName: "Ed" }] } });
  assert.equal(b.kind, "conflict");
  assert.match(b.text, /Ed cannot take over/);
  assert.match(b.text, /Nothing was deleted/);
});

test("too many shared events gets its own message; other errors are not blocks", () => {
  assert.equal(deleteBlock({ status: 409, detail: { code: "too_many_shared_events", events: [] } }).kind, "too_many");
  assert.equal(deleteBlock({ status: 401, detail: { code: "events_need_delete_confirmation" } }), null);
  assert.equal(deleteBlock({ status: 409 }), null);
  assert.equal(deleteBlock({ status: 409, detail: { code: "something_else" } }), null);
  assert.equal(deleteBlock(null), null);
});
