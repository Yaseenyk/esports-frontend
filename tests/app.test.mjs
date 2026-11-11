// The web app's pure logic: sign-in return address, saved session, error wording, request client edge cases, IDs and CSV safety.
import test from "node:test";
import assert from "node:assert/strict";
import { safeNext } from "../src/lib/safe-next.ts";
import { parseSession, authMessage, explain, gateQueueKey } from "../src/lib/api/cloud.ts";
import { createClient, ApiError } from "../src/lib/api/client.ts";
import { createBatchQueue } from "../src/lib/api/queue.ts";
import { uniqueId, idPrefix, repeatedIds } from "../src/components/idcard/ids.ts";
import { toCsv, safeCell } from "../src/lib/idcard/roster.ts";

const reply = (body, status = 200, headers = {}) => ({ ok: status >= 200 && status < 300, status, headers: { get: (k) => headers[k.toLowerCase()] ?? null }, json: async () => body });
function rig(handler, extra = {}) {
  const calls = []; let t = 1_000_000;
  const client = createClient({ base: "https://api.test", now: () => t, sleep: async () => {}, isOnline: () => true, fetchImpl: async (url, init) => { calls.push({ url, init }); return handler(url, init, calls.length); }, ...extra });
  return { client, calls, advance: (ms) => { t += ms; } };
}

// ---- return address after sign-in ----
test("safeNext keeps paths inside the app and drops everything else", () => {
  assert.equal(safeNext("/app/events/?id=e1"), "/app/events/?id=e1");
  assert.equal(safeNext("/app/brackets/"), "/app/brackets/");
  for (const bad of [null, "", "https://evil.example/", "//evil.example/app/", "/app//evil.example", "/login/", "/app/../admin", "javascript:alert(1)", "/app/\\evil", "app/x", "/application/", "/app/x#<script>"]) assert.equal(safeNext(bad), "/app/", String(bad));
});

// ---- saved session ----
test("a saved sign-in is accepted only when it has the shape the app relies on", () => {
  const ok = JSON.stringify({ token: "t", user: { id: "u1", email: "a@example.com", name: "Asha" } });
  assert.deepEqual(parseSession(ok), { token: "t", user: { id: "u1", email: "a@example.com", name: "Asha" } });
  assert.equal(parseSession(null), null);
  assert.equal(parseSession("not json"), null);
  assert.equal(parseSession("null"), null);
  assert.equal(parseSession(JSON.stringify({ token: "", user: { id: "u", email: "e" } })), null);
  assert.equal(parseSession(JSON.stringify({ token: "t" })), null);
  assert.equal(parseSession(JSON.stringify({ token: "t", user: { id: 5, email: "e" } })), null);
});

test("a saved sign-in with no name falls back to the email, so no screen ever reads name of undefined", () => {
  const s = parseSession(JSON.stringify({ token: "t", user: { id: "u", email: "a@example.com" } }));
  assert.equal(s.user.name, "a@example.com");
});

test("a saved sign-in keeps nothing but token, id, email and name", () => {
  const s = parseSession(JSON.stringify({ token: "t", extra: "x", user: { id: "u", email: "e@x.io", name: "N", isAdmin: true } }));
  assert.deepEqual(Object.keys(s).sort(), ["token", "user"]);
  assert.deepEqual(Object.keys(s.user).sort(), ["email", "id", "name"]);
});

// ---- wording ----
test("a wrong password is named as one, not as an expired sign-in", () => {
  assert.match(authMessage({ status: 401 }, "login"), /email or password is not right/i);
  assert.match(authMessage({ status: 409 }, "register"), /already has an account/i);
  assert.match(authMessage({ status: 400 }, "register"), /8 characters/);
  assert.match(authMessage({ status: 429 }, "login"), /too many tries/i);
  assert.match(authMessage(new Error("offline"), "login"), /could not reach the server/i);
});

test("every kind of failure gets a plain sentence", () => {
  assert.match(explain({ status: 401 }), /expired/);
  assert.match(explain({ status: 403 }), /permission/);
  assert.match(explain({ status: 404 }), /not found/);
  assert.match(explain({ status: 413 }), /too large/);
  assert.match(explain({ status: 503 }), /server had a problem/);
  assert.match(explain({ status: 422 }), /did not accept/);
  assert.match(explain(undefined), /could not reach/i);
});

// ---- request client ----
test("one caller giving up does not cancel a request other callers are waiting on", async () => {
  const { client, calls } = rig(async () => { await new Promise((r) => setTimeout(r, 15)); return reply({ n: 1 }); });
  const a = new AbortController();
  const first = client.get("/roster", { signal: a.signal });
  const second = client.get("/roster");
  a.abort();
  await assert.rejects(first, /aborted/);
  assert.deepEqual(await second, { n: 1 });
  assert.equal(calls.length, 1);
});

test("an answer that was already abandoned is not shown", async () => {
  const { client } = rig(() => reply({ n: 1 }));
  const a = new AbortController(); a.abort();
  await assert.rejects(client.get("/x", { signal: a.signal }), /aborted/);
});

test("signing out forgets in-flight reads, so the next person never gets the previous person's answer", async () => {
  let n = 0;
  const { client, calls } = rig(async () => { await new Promise((r) => setTimeout(r, 15)); return reply({ n: ++n }); });
  const before = client.get("/events");
  client.clear();
  const after = await client.get("/events");
  await before;
  assert.equal(calls.length, 2); // not shared
  assert.deepEqual(after, { n: 2 });
  assert.deepEqual(client.peek("/events"), { n: 2 }); // the old answer did not overwrite the new one
});

test("a read that was in flight during a write cannot put its old answer back in the cache", async () => {
  let n = 0;
  const { client } = rig(async (u, init) => { if (init?.method === "DELETE") return reply({ ok: 1 }); await new Promise((r) => setTimeout(r, 15)); return reply({ n: ++n }); });
  const slow = client.get("/events/e1/roster");
  await client.del("/events/e1");
  await slow;
  assert.equal(client.peek("/events/e1/roster"), undefined);
});

test("deleting one event also drops the cached event list", async () => {
  const { client } = rig((u, init) => (init?.method === "DELETE" ? reply({ ok: 1 }) : reply([{ id: "e1" }])));
  await client.get("/events", { ttl: 60000 });
  await client.get("/events/e1/roster", { ttl: 60000 });
  await client.del("/events/e1");
  assert.equal(client.peek("/events"), undefined);
  assert.equal(client.peek("/events/e1/roster"), undefined);
});

test("a write inside one event leaves the list and other events alone", async () => {
  const { client } = rig((u, init) => (init?.method === "POST" ? reply({ ok: 1 }) : reply({ ok: 1 })));
  await client.get("/events", { ttl: 60000 });
  await client.get("/events/e2/roster", { ttl: 60000 });
  await client.post("/events/e1/gate-keys", { label: "door" });
  assert.ok(client.peek("/events"));
  assert.ok(client.peek("/events/e2/roster"));
});

test("a rejected token signs the person out once per request, but a wrong password does not", async () => {
  let out = 0;
  const { client } = rig(() => reply({}, 401), { token: () => "tok", onUnauthorized: () => { out++; } });
  await assert.rejects(client.get("/events"), (e) => e instanceof ApiError && e.status === 401);
  assert.equal(out, 1);
  await assert.rejects(client.post("/auth/login", { email: "a", password: "b" }), (e) => e.status === 401);
  assert.equal(out, 1); // /auth/ answers are not an expired session
  const anon = rig(() => reply({}, 401), { token: () => null, onUnauthorized: () => { out++; } });
  await assert.rejects(anon.client.get("/public/pass/x"));
  assert.equal(out, 1); // no token, nothing to expire
});

test("4xx answers on a write are reported with their status and not retried", async () => {
  const { client, calls } = rig(() => reply({}, 409));
  await assert.rejects(client.post("/auth/register", {}), (e) => e.status === 409);
  assert.equal(calls.length, 1);
});

test("a 204 answer to a write is fine and has no body", async () => {
  const { client } = rig(() => ({ ok: true, status: 204, headers: { get: () => null }, json: async () => { throw new Error("no body"); } }));
  assert.equal(await client.del("/events/e1/invites/i1"), undefined);
});

// ---- batching, the gate edge cases ----
const memStore = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k), m }; };
const fakeTimers = () => { const q = []; return { set: (fn, ms) => { const t = { fn, ms }; q.push(t); return t; }, clear: (t) => { const i = q.indexOf(t); if (i >= 0) q.splice(i, 1); }, q, run: async () => { const t = q.shift(); await t?.fn(); } }; };

test("each gate key keeps its own waiting scans", () => {
  assert.notEqual(gateQueueKey("gk_door_one"), gateQueueKey("gk_door_two"));
  assert.equal(gateQueueKey("gk_door_one"), gateQueueKey("gk_door_one"));
  assert.ok(!gateQueueKey("gk_door_one").includes("door"), "the key itself is never part of the storage name");
});

test("scans waiting under one key are not picked up by another", () => {
  const store = memStore();
  const tm = fakeTimers();
  const mk = (key) => createBatchQueue({ send: async () => {}, keyOf: (c) => c, storage: store, storageKey: gateQueueKey(key), isOnline: () => false, setTimer: tm.set, clearTimer: tm.clear });
  mk("gk_a").add("code-1");
  assert.equal(mk("gk_a").size, 1);
  assert.equal(mk("gk_b").size, 0);
});

test("a damaged saved queue is ignored instead of crashing the gate", () => {
  const store = memStore(); store.setItem("q", "{not json");
  const q = createBatchQueue({ send: async () => {}, keyOf: (c) => c, storage: store, storageKey: "q" });
  assert.equal(q.size, 0);
});

test("a send that fails keeps the scans, and the next try sends them again exactly once", async () => {
  const tm = fakeTimers(); const sent = []; let fail = true;
  const q = createBatchQueue({ send: async (items) => { if (fail) throw new Error("offline"); sent.push(...items); }, keyOf: (c) => c, setTimer: tm.set, clearTimer: tm.clear, isOnline: () => true, intervalMs: 100 });
  q.add("a"); q.add("b"); q.add("a");
  await q.flush();
  assert.equal(q.size, 2);
  fail = false;
  await q.flush();
  assert.deepEqual(sent, ["a", "b"]);
  assert.equal(q.size, 0);
});

// ---- card IDs ----
test("a new ID never repeats one in use, even after someone was removed", () => {
  assert.equal(uniqueId("KON", ["KON-001", "KON-003"], 1), "KON-002");
  assert.equal(uniqueId("KON", ["KON-001", "KON-002", "KON-004"], 3), "KON-003");
  assert.equal(uniqueId("KON", ["KON-002", "KON-003"], 3), "KON-004"); // count + 1 would have said 003
  assert.equal(uniqueId("KON", [], 0), "KON-001");
});

test("IDs are made from a team name with a safe fallback", () => {
  assert.equal(idPrefix("Konkan Kings"), "KON");
  assert.equal(idPrefix("  !! "), "ID");
  assert.equal(idPrefix("a"), "A");
});

test("repeated IDs are found regardless of case and spaces", () => {
  const r = repeatedIds(["KON-001", "kon-001 ", "KON-002"]);
  assert.ok(r.has("kon-001"));
  assert.ok(!r.has("kon-002"));
});

// ---- spreadsheets ----
test("a name that would run as a spreadsheet formula is made harmless in an export", () => {
  assert.equal(safeCell("=HYPERLINK(\"http://x\")"), "'=HYPERLINK(\"http://x\")");
  assert.equal(safeCell("+91 98765"), "'+91 98765");
  assert.equal(safeCell("@SUM(A1)"), "'@SUM(A1)");
  assert.equal(safeCell("-cmd|' /C calc'!A0"), "'-cmd|' /C calc'!A0");
  assert.equal(safeCell("Aarav Mehta"), "Aarav Mehta");
  assert.equal(safeCell("12/05/2003"), "12/05/2003");
  assert.equal(safeCell("-5"), "-5");
});

test("the exported roster carries no live formulas", () => {
  const csv = toCsv([{ id: "A-1", name: "=1+1", teamId: "t", role: "Player" }], [{ id: "t", name: "Kings" }], () => false);
  assert.ok(csv.includes("'=1+1"));
  assert.ok(!/(^|,)=1\+1/.test(csv));
});
