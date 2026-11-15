// Slow screens: independent calls start together. A fake fetch with a delay shows that the calls overlap and that failures are still handled in the same order.
process.env.NEXT_PUBLIC_API_URL = "https://api.test";
import test from "node:test";
import assert from "node:assert/strict";

try { Object.defineProperty(globalThis.navigator, "onLine", { get: () => true, configurable: true }); } catch { /* the client then sees Node as offline and answers from its cache */ }
let inflight = 0, peak = 0; const paths = [];
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const reply = (status, body) => ({ ok: status >= 200 && status < 300, status, headers: { get: () => null }, json: async () => body, blob: async () => new Blob([]) });
let routes = {};
globalThis.fetch = async (url) => {
  const p = new URL(url).pathname + new URL(url).search; paths.push(p);
  inflight++; peak = Math.max(peak, inflight);
  await delay(40);
  inflight--;
  const h = routes[new URL(url).pathname] ?? (() => reply(404, { error: "nf" }));
  return h();
};
const reset = (r) => { routes = r; inflight = 0; peak = 0; paths.length = 0; };
const { fetchEvent, fetchOwnedEvents } = await import("../src/features/tournaments/services/organiser.api.ts");

const EV = { id: "e1", name: "Cup", game: "bgmi", date: "2030-01-01", venue: "" };
test("fetchEvent asks for the event and the role list together", async () => {
  reset({ "/events/e1": () => reply(200, EV), "/events": () => reply(200, [{ ...EV, role: "owner" }]) });
  const t = Date.now(); const r = await fetchEvent("e1");
  assert.equal(r.ok, true); assert.equal(r.data.role, "owner");
  assert.equal(peak, 2); assert.ok(Date.now() - t < 75, "took " + (Date.now() - t));
});
test("fetchEvent: a failed list is an error only when the event has no role of its own", async () => {
  reset({ "/events/e2": () => reply(200, { ...EV, id: "e2" }), "/events": () => reply(500, { error: "x" }) });
  assert.equal((await fetchEvent("e2")).ok, false);
  reset({ "/events/e3": () => reply(404, { error: "nf" }), "/events": () => reply(200, []) });
  const r = await fetchEvent("e3"); assert.equal(r.ok, false); assert.equal(r.failure.kind, "unavailable");
});
test("fetchOwnedEvents: the probe answers first even though the list starts with it", async () => {
  await delay(100); // the previous case leaves one list call in flight (its answer is not needed)
  reset({ "/public/tournaments": () => reply(404, { error: "off" }), "/events": () => reply(200, [{ ...EV, role: "owner" }]) });
  const t = Date.now(); const r = await fetchOwnedEvents();
  assert.equal(r.ok, false); assert.equal(r.failure.kind, "unavailable"); assert.equal(peak, 2); assert.ok(Date.now() - t < 75);
});
