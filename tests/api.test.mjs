// The request-saving machinery: caching, de-duplication, retries, batching, polling and the loading-screen timing.
import test from "node:test";
import assert from "node:assert/strict";
import { createClient, ApiError } from "../src/lib/api/client.ts";
import { createBatchQueue } from "../src/lib/api/queue.ts";
import { createPoller } from "../src/lib/api/poller.ts";
import { phaseFor, timingFor, FAST, KNOWN_SLOW, recordLatency, typicalLatency, resetLatency } from "../src/lib/loading.ts";

const reply = (body, status = 200, headers = {}) => ({ ok: status >= 200 && status < 300, status, headers: { get: (k) => headers[k.toLowerCase()] ?? null }, json: async () => body });
function rig(handler, extra = {}) {
  const calls = []; let t = 1_000_000;
  const client = createClient({
    base: "https://api.test", now: () => t, sleep: async () => {}, isOnline: () => true,
    fetchImpl: async (url, init) => { calls.push({ url, init }); return handler(url, init, calls.length); }, ...extra,
  });
  return { client, calls, advance: (ms) => { t += ms; } };
}

test("a repeat read inside its fresh window never reaches the network", async () => {
  const { client, calls } = rig(() => reply({ n: 1 }));
  await client.get("/events/1", { ttl: 10000 });
  await client.get("/events/1", { ttl: 10000 });
  await client.get("/events/1", { ttl: 10000 });
  assert.equal(calls.length, 1);
  assert.equal(client.stats.cacheHits, 2);
});

test("simultaneous identical reads share one request", async () => {
  const { client, calls } = rig(async () => { await new Promise((r) => setTimeout(r, 10)); return reply({ ok: true }); });
  const out = await Promise.all([client.get("/roster"), client.get("/roster"), client.get("/roster")]);
  assert.equal(calls.length, 1);
  assert.equal(client.stats.deduped, 2);
  assert.deepEqual(out[0], out[2]);
});

test("a stale answer is shown at once and refreshed in the background", async () => {
  let n = 0;
  const { client, calls, advance } = rig(() => reply({ n: ++n }));
  assert.deepEqual(await client.get("/live", { ttl: 1000, swr: 60000 }), { n: 1 });
  advance(5000); // stale, but inside the stale-while-revalidate window
  assert.deepEqual(await client.get("/live", { ttl: 1000, swr: 60000 }), { n: 1 }); // instant, old
  await new Promise((r) => setTimeout(r, 5));
  assert.equal(calls.length, 2);
  assert.deepEqual(client.peek("/live"), { n: 2 }); // refreshed behind the scenes
});

test("past the stale window the client waits for fresh data", async () => {
  let n = 0;
  const { client, advance } = rig(() => reply({ n: ++n }));
  await client.get("/x", { ttl: 1000, swr: 2000 });
  advance(10000);
  assert.deepEqual(await client.get("/x", { ttl: 1000, swr: 2000 }), { n: 2 });
});

test("an ETag turns an unchanged answer into a 304 that keeps the cached copy", async () => {
  const { client, calls, advance } = rig((url, init) => (init.headers["if-none-match"] === "v1" ? reply(null, 304) : reply({ big: "payload" }, 200, { etag: "v1" })));
  await client.get("/roster", { ttl: 100, swr: 0 });
  advance(1000);
  assert.deepEqual(await client.get("/roster", { ttl: 100, swr: 0 }), { big: "payload" });
  assert.equal(calls[1].init.headers["if-none-match"], "v1");
  assert.equal(client.stats.notModified, 1);
});

test("server errors are retried with backoff, then succeed", async () => {
  const { client, calls } = rig((u, i, n) => (n < 3 ? reply({}, 503) : reply({ ok: 1 })));
  assert.deepEqual(await client.get("/flaky"), { ok: 1 });
  assert.equal(calls.length, 3);
  assert.equal(client.stats.retried, 2);
});

test("client errors are never retried", async () => {
  const { client, calls } = rig(() => reply({}, 404));
  await assert.rejects(client.get("/missing"), (e) => e instanceof ApiError && e.status === 404);
  assert.equal(calls.length, 1);
});

test("a rate-limit answer waits for Retry-After and then tries again", async () => {
  const waits = [];
  const { client } = rig((u, i, n) => (n === 1 ? reply({}, 429, { "retry-after": "2" }) : reply({ ok: 1 })), { sleep: async (ms) => { waits.push(ms); } });
  await client.get("/busy");
  assert.deepEqual(waits, [2000]);
});

test("writes are sent once and never retried automatically", async () => {
  const { client, calls } = rig(() => reply({}, 500));
  await assert.rejects(client.post("/events/1/checkin", { id: "A" }));
  assert.equal(calls.length, 1);
});

test("a successful write forgets cached reads of the same collection", async () => {
  let n = 0;
  const { client } = rig((u, init) => (init?.method === "POST" ? reply({ ok: 1 }) : reply({ n: ++n })));
  await client.get("/events/7/roster");
  await client.post("/events/7/roster", { people: [] });
  assert.equal(client.peek("/events/7/roster"), undefined);
  assert.deepEqual(await client.get("/events/7/roster"), { n: 2 });
});

test("offline, an old answer is better than an error", async () => {
  let up = true;
  const { client, advance } = rig(() => reply({ n: 1 }), { isOnline: () => up });
  await client.get("/pass", { ttl: 10, swr: 0 });
  advance(100000); up = false;
  assert.deepEqual(await client.get("/pass", { ttl: 10, swr: 0 }), { n: 1 });
});

test("the signed-in token is attached to every request", async () => {
  const { client, calls } = rig(() => reply({}), { token: () => "tok123" });
  await client.get("/me");
  assert.equal(calls[0].init.headers.authorization, "Bearer tok123");
});

test("a request that outlives its timeout is cancelled", async () => {
  const { client } = rig((u, init) => new Promise((_, rej) => init.signal.addEventListener("abort", () => rej(new Error("aborted")))));
  await assert.rejects(client.get("/slow", { timeout: 20, retries: 0 }), /aborted/);
});

test("request speed is recorded per endpoint", async () => {
  const seen = [];
  let t = 0;
  const client = createClient({ base: "https://a", now: () => (t += 700), sleep: async () => {}, isOnline: () => true, fetchImpl: async () => reply({}), onLatency: (k, ms) => seen.push([k, ms]) });
  await client.get("/events?x=1");
  assert.equal(seen[0][0], "/events"); // query string dropped, so every page of one endpoint shares a speed
  assert.equal(seen[0][1], 700);
});

// ---- batching ----
const fakeTimers = () => { const q = []; return { set: (fn, ms) => { const t = { fn, ms }; q.push(t); return t; }, clear: (t) => { const i = q.indexOf(t); if (i >= 0) q.splice(i, 1); }, q, run: async () => { const t = q.shift(); await t?.fn(); } }; };
const memStore = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k), m }; };

test("fifty scans become one request, and a repeat scan is counted once", async () => {
  const sent = [], T = fakeTimers();
  const q = createBatchQueue({ send: async (items) => { sent.push(items); }, keyOf: (x) => x.id, setTimer: T.set, clearTimer: T.clear, isOnline: () => true });
  for (let i = 0; i < 50; i++) q.add({ id: "P" + i, at: i });
  q.add({ id: "P3", at: 99 }); // the same person scanned twice
  assert.equal(T.q.length, 1); // one timer, not fifty
  await T.run();
  assert.equal(sent.length, 1);
  assert.equal(sent[0].length, 50);
  assert.equal(q.size, 0);
});

test("a full batch is sent straight away", async () => {
  const sent = [], T = fakeTimers();
  const q = createBatchQueue({ send: async (i) => { sent.push(i.length); }, keyOf: (x) => x.id, maxBatch: 5, setTimer: T.set, clearTimer: T.clear, isOnline: () => true });
  for (let i = 0; i < 5; i++) q.add({ id: String(i) });
  await new Promise((r) => setTimeout(r, 5));
  assert.deepEqual(sent, [5]);
});

test("when sending fails the scans are kept and retried later with a longer wait", async () => {
  let fail = true; const T = fakeTimers();
  const q = createBatchQueue({ send: async () => { if (fail) throw new Error("down"); }, keyOf: (x) => x.id, intervalMs: 1000, setTimer: T.set, clearTimer: T.clear, isOnline: () => true });
  q.add({ id: "A" });
  await T.run();
  assert.equal(q.size, 1);
  assert.equal(T.q[0].ms, 2000); // backed off
  fail = false;
  await T.run();
  assert.equal(q.size, 0);
});

test("scans survive a reload, and nothing is sent while offline", async () => {
  const store = memStore(), T = fakeTimers(); let online = false; const sent = [];
  const mk = () => createBatchQueue({ send: async (i) => { sent.push(...i); }, keyOf: (x) => x.id, storage: store, storageKey: "k", setTimer: T.set, clearTimer: T.clear, isOnline: () => online });
  mk().add({ id: "A" });
  const again = mk(); // page reloaded
  assert.equal(again.size, 1);
  await again.flush();
  assert.equal(sent.length, 0); // still offline
  online = true;
  await again.flush();
  assert.deepEqual(sent, [{ id: "A" }]);
  assert.equal(JSON.parse(store.getItem("k")).length, 0);
});

test("hiding the tab flushes what is left", async () => {
  const sent = [], T = fakeTimers(), listeners = {};
  const doc = { visibilityState: "visible", addEventListener: (e, f) => { listeners[e] = f; }, removeEventListener() {} };
  const win = { addEventListener: (e, f) => { listeners[e] = f; }, removeEventListener() {} };
  const q = createBatchQueue({ send: async (i) => { sent.push(i.length); }, keyOf: (x) => x.id, setTimer: T.set, clearTimer: T.clear, isOnline: () => true });
  q.attach(doc, win); q.add({ id: "A" });
  doc.visibilityState = "hidden"; listeners.visibilitychange();
  await new Promise((r) => setTimeout(r, 5));
  assert.deepEqual(sent, [1]);
});

// ---- polling ----
test("polling slows down while nothing changes and snaps back when something does", async () => {
  const T = fakeTimers(); let v = 1; const seen = [];
  const p = createPoller({ fetch: async () => v, onData: (x, c) => seen.push(c), minMs: 10000, maxMs: 60000, setTimer: T.set, clearTimer: T.clear, isVisible: () => true, isOnline: () => true });
  p.start(); await new Promise((r) => setTimeout(r, 2));
  const waits = [];
  for (let i = 0; i < 6; i++) { waits.push(T.q[0].ms); await T.run(); await new Promise((r) => setTimeout(r, 2)); }
  assert.deepEqual(waits.slice(0, 5), [10000, 15000, 22500, 33750, 50625]);
  assert.equal(Math.max(...waits), 60000); // capped
  v = 2; await T.run(); await new Promise((r) => setTimeout(r, 2));
  assert.equal(T.q[0].ms, 10000); // back to fast
});

test("a hidden tab makes no requests, and coming back refreshes only if the data is old", async () => {
  const T = fakeTimers(); let visible = true, t = 0, calls = 0;
  const p = createPoller({ fetch: async () => ++calls, onData() {}, minMs: 10000, staleMs: 8000, now: () => t, setTimer: T.set, clearTimer: T.clear, isVisible: () => visible, isOnline: () => true });
  p.start(); await new Promise((r) => setTimeout(r, 2));
  assert.equal(calls, 1);
  visible = false; await T.run(); await new Promise((r) => setTimeout(r, 2));
  assert.equal(calls, 1); // the timer fired but nothing was fetched
  t = 3000; visible = true; p.resume(); await new Promise((r) => setTimeout(r, 2));
  assert.equal(calls, 1); // only 3 s old: no new request
  t = 20000; p.resume(); await new Promise((r) => setTimeout(r, 2));
  assert.equal(calls, 2);
});

test("failures slow the poller down instead of hammering a struggling server", async () => {
  const T = fakeTimers(); let n = 0;
  const p = createPoller({ fetch: async () => { n++; throw new Error("x"); }, onData() {}, minMs: 5000, maxMs: 40000, setTimer: T.set, clearTimer: T.clear, isVisible: () => true, isOnline: () => true });
  p.start(); await new Promise((r) => setTimeout(r, 2));
  assert.equal(T.q[0].ms, 10000);
  await T.run(); await new Promise((r) => setTimeout(r, 2));
  assert.equal(T.q[0].ms, 20000);
});

// ---- loading screen timing ----
test("quick loads show nothing; normal ones a skeleton; long ones a hint; stuck ones a retry", () => {
  assert.equal(phaseFor(50), "hidden");
  assert.equal(phaseFor(400), "skeleton");
  assert.equal(phaseFor(5000), "slow");
  assert.equal(phaseFor(20000), "stuck");
});

test("an API that usually takes a second or more shows its skeleton at once; a quick one waits a beat", () => {
  assert.equal(timingFor(undefined), FAST);
  assert.equal(timingFor(1000), KNOWN_SLOW);
  assert.equal(timingFor(2200).delay, 0);
  assert.equal(timingFor(80).delay, 180);
  assert.equal(phaseFor(10, timingFor(1500)), "skeleton");
  assert.equal(phaseFor(10, timingFor(80)), "hidden");
});

test("the running average follows the endpoint's recent speed", () => {
  resetLatency();
  recordLatency("/a", 1000); recordLatency("/a", 1000);
  assert.equal(Math.round(typicalLatency("/a")), 1000);
  for (let i = 0; i < 10; i++) recordLatency("/a", 100);
  assert.ok(typicalLatency("/a") < 300);
});
