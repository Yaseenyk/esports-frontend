// Run: node --import tsx --test tests/verify-email.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { verifyTokenFromQuery, verifyFailure, startMessage } from "../src/lib/verify-email.ts";
import { takeTokenSearch } from "../src/lib/tokenHygiene.ts";
import { createClient } from "../src/lib/api/client.ts";

test("the token is read from ?t= and capped", () => {
  assert.equal(verifyTokenFromQuery("?t=abc_123-X"), "abc_123-X");
  assert.equal(verifyTokenFromQuery("?x=1"), "");
  assert.equal(verifyTokenFromQuery(`?t=${"a".repeat(900)}`).length, 512);
});

test("all token failures read the same, a missing session asks to sign in", () => {
  assert.deepEqual(verifyFailure({ status: 400, serverError: "invalid_or_expired" }), { kind: "expired" });
  assert.deepEqual(verifyFailure({ status: 401 }), { kind: "signin" });
  assert.equal(verifyFailure({ status: 429 }).kind, "message");
  assert.equal(verifyFailure(new Error("x")).kind, "message");
  assert.match(startMessage({ status: 429 }), /cannot send any more/i);
});

test("the token leaves the address bar after load, the meta referrer tag is set, and a reload still finds it in this tab", () => {
  const store = new Map();
  const calls = [];
  const env = (search) => ({ location: { pathname: "/verify-email/", search, hash: "" }, history: { state: null, replaceState: (_s, _t, url) => calls.push(url) }, storage: { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) } });
  const metas = [];
  const doc = { head: { querySelector: () => metas[0] ?? null, appendChild: (m) => metas.push(m) }, createElement: () => ({ attrs: {}, setAttribute(k, v) { this.attrs[k] = v; } }) };
  const first = takeTokenSearch(undefined, env("?t=SECRETTOKEN"), doc);
  assert.equal(verifyTokenFromQuery(first), "SECRETTOKEN");
  assert.deepEqual(calls, ["/verify-email/"]); // no secret left in the URL
  assert.equal(metas[0].attrs.name, "referrer");
  assert.equal(metas[0].attrs.content, "no-referrer");
  assert.equal(verifyTokenFromQuery(takeTokenSearch(undefined, env(""), doc)), "SECRETTOKEN");
});

test("the client keeps the error word from the server so the page can tell expired from other failures", async () => {
  const c = createClient({ base: "http://x", fetchImpl: async () => ({ ok: false, status: 400, headers: { get: () => null }, json: async () => ({ error: "invalid_or_expired" }) }) });
  await assert.rejects(c.post("/me/email/verify", { token: "t" }), (e) => verifyFailure(e).kind === "expired");
});
