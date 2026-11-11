// Run: node --import tsx --test tests/token-hygiene.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { splitTokens, joinTokens, takeTokenSearch, ensureNoReferrer } from "../src/lib/tokenHygiene.ts";
import { createClient } from "../src/lib/api/client.ts";

function env(search, store = new Map()) {
  const e = { location: { pathname: "/score/", search, hash: "#x" }, history: { state: null, calls: [], replaceState(s, _t, url) { this.calls.push(url); } }, storage: { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) } };
  return e;
}
function fakeDoc() {
  const metas = [];
  const head = { querySelector: (sel) => metas.find((m) => sel.includes(m.attrs.name)) ?? null, appendChild: (m) => metas.push(m) };
  return { metas, head, createElement: () => { const m = { attrs: {}, setAttribute(k, v) { this.attrs[k] = v; } }; return m; } };
}

test("splitTokens takes t and k out and keeps the rest in order", () => {
  const r = splitTokens("?a=1&t=SECRET&b=2&k=KEY");
  assert.deepEqual(r.tokens, { t: "SECRET", k: "KEY" });
  assert.equal(r.rest, "?a=1&b=2");
  assert.equal(splitTokens("?e=cup").found, false);
  assert.equal(splitTokens("").rest, "");
  assert.equal(joinTokens({ t: "S" }, "?a=1"), "?t=S&a=1");
});

test("takeTokenSearch returns the original query and removes the tokens from the address", () => {
  const e = env("?t=SECRET&x=1");
  const out = takeTokenSearch(["t", "k"], e, fakeDoc());
  assert.equal(new URLSearchParams(out).get("t"), "SECRET");
  assert.deepEqual(e.history.calls, ["/score/?x=1#x"]);
  assert.ok(!e.history.calls[0].includes("SECRET"));
});

test("after a reload (no token in the address) the same tab still gets it; no token and nothing stored stays empty", () => {
  const store = new Map();
  takeTokenSearch(["t", "k"], env("?t=SECRET", store), fakeDoc());
  const again = env("", store);
  assert.equal(new URLSearchParams(takeTokenSearch(["t", "k"], again, fakeDoc())).get("t"), "SECRET");
  assert.equal(again.history.calls.length, 0);
  assert.equal(takeTokenSearch(["t", "k"], env("", new Map()), fakeDoc()), "");
});

test("a page with no token parameter is left alone (no replaceState)", () => {
  const e = env("?e=cup");
  assert.equal(takeTokenSearch(["t", "k"], e, fakeDoc()), "?e=cup");
  assert.equal(e.history.calls.length, 0);
});

test("the no-referrer meta tag is added once", () => {
  const d = fakeDoc();
  ensureNoReferrer(d); ensureNoReferrer(d);
  assert.equal(d.metas.length, 1);
  assert.deepEqual(d.metas[0].attrs, { name: "referrer", content: "no-referrer" });
});

test("api cache root depth: default flushes /events/7 only; a deeper root keeps sibling org data", async () => {
  const reply = (b) => new Response(JSON.stringify(b), { status: 200, headers: { "content-type": "application/json" } });
  const mk = (depth) => createClient({ base: "https://a", sleep: async () => {}, isOnline: () => true, onLatency: () => {}, fetchImpl: async () => reply({ ok: 1 }), ...(depth ? { cacheRootDepth: depth } : {}) });
  const a = mk();
  await a.get("/events/7/roster"); await a.get("/events/8/roster");
  await a.post("/events/7/members", {});
  assert.equal(a.peek("/events/7/roster"), undefined);
  assert.ok(a.peek("/events/8/roster"));
  const b = mk((p) => (p.startsWith("/orgs/") ? 4 : 2));
  await b.get("/orgs/o1/events/e1/roster"); await b.get("/orgs/o1/events/e2/roster");
  await b.post("/orgs/o1/events/e1/members", {});
  assert.equal(b.peek("/orgs/o1/events/e1/roster"), undefined);
  assert.ok(b.peek("/orgs/o1/events/e2/roster"));
});
