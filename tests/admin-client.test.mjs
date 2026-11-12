import test from "node:test";
import assert from "node:assert/strict";
import { createAdminClient, claims, safeLink, STAFF_KEY, AdminError } from "../src/lib/admin/client.ts";

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const jwt = (c) => `${b64({ alg: "HS256" })}.${b64(c)}.sig`;
const NOW = 1_800_000_000_000;
const mem = () => { const m = new Map(); return { m, getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k) }; };
const res = (status, body, headers = {}) => ({ ok: status < 400, status, headers: { get: (k) => headers[k.toLowerCase()] ?? null }, json: async () => body });

function setup(handler, token) {
  const store = mem(); if (token) store.setItem(STAFF_KEY, token);
  const calls = [];
  const fetchImpl = async (url, init) => { calls.push({ url, method: init.method, auth: init.headers.authorization, body: init.body }); return handler(url, init, calls.length); };
  const c = createAdminClient({ base: "http://api", fetchImpl, store: () => store, now: () => NOW });
  return { c, store, calls };
}
const fresh = () => jwt({ exp: NOW / 1000 + 1500, su: NOW / 1000 - 10 });

test("claims reads exp and su, and survives garbage", () => {
  assert.deepEqual(claims(jwt({ exp: 5, su: 3 })), { exp: 5, su: 3 });
  assert.deepEqual(claims("nope"), {});
});

test("the staff token is stored in sessionStorage only after the code step; the user token is never stored", async () => {
  const staff = fresh();
  const { c, store, calls } = setup((url) => (url.endsWith("/auth/login") ? res(200, { token: "USERTOKEN", user: {} }) : res(200, { token: staff })));
  const ut = await c.checkPassword("a@b.c", "pw");
  assert.equal(ut, "USERTOKEN");
  assert.equal(store.m.size, 0, "nothing stored after the password step");
  await c.openSession(ut, "123456");
  assert.equal(store.getItem(STAFF_KEY), staff);
  assert.equal(calls[1].url, "http://api/admin/v1/session");
  assert.equal(calls[1].auth, "Bearer USERTOKEN");
  assert.equal(c.hasSession(), true);
});

test("a non-staff account gets 404 from the session route and no session is created", async () => {
  const { c, store } = setup(() => res(404, { error: "Not found" }));
  await assert.rejects(c.openSession("U", "123456"), (e) => e instanceof AdminError && e.status === 404);
  assert.equal(store.m.size, 0);
});

test("a 404 on any staff route drops the session (non-staff and expired both look like 404)", async () => {
  const { c } = setup(() => res(404, { error: "Not found" }), fresh());
  await assert.rejects(c.reports("open"));
  assert.equal(c.hasSession(), false);
});

test("a 404 from lookup means no match and keeps the session", async () => {
  const { c } = setup(() => res(404, { error: "Not found" }), fresh());
  assert.equal(await c.lookup("id", "x"), null);
  assert.equal(c.hasSession(), true);
});

test("a token close to expiry is renewed before the call", async () => {
  const old = jwt({ exp: NOW / 1000 + 60, su: NOW / 1000 });
  const renewed = fresh();
  const { c, calls, store } = setup((url) => (url.endsWith("/session/renew") ? res(200, { token: renewed }) : res(200, { items: [] })), old);
  await c.reports("open");
  assert.equal(calls[0].url, "http://api/admin/v1/session/renew");
  assert.equal(calls[1].auth, `Bearer ${renewed}`);
  assert.equal(store.getItem(STAFF_KEY), renewed);
});

test("needsStepUp follows the last verified code (five minutes)", () => {
  assert.equal(setup(() => res(200, {}), jwt({ exp: NOW / 1000 + 900, su: NOW / 1000 - 100 })).c.needsStepUp(), false);
  assert.equal(setup(() => res(200, {}), jwt({ exp: NOW / 1000 + 900, su: NOW / 1000 - 400 })).c.needsStepUp(), true);
});

test("step_up_required keeps its code, retry-after becomes milliseconds", async () => {
  const { c } = setup(() => res(403, { error: "Enter a fresh code.", code: "step_up_required" }), fresh());
  await assert.rejects(c.setFlag("kill.mail", true, "security"), (e) => e.status === 403 && e.code === "step_up_required" && e.message === "Enter a fresh code.");
  assert.equal(c.hasSession(), true);
  const t = setup(() => res(429, { error: "Slow down", retryAfter: 30 }), fresh());
  await assert.rejects(t.c.reports("open"), (e) => e.retryAfterMs === 30000);
});

test("decide, takedown and flag calls send the reason code", async () => {
  const { c, calls } = setup(() => res(200, { ok: true }), fresh());
  await c.decide("r 1", "hide", "scam");
  await c.takedown("team", "t1", "legal_request");
  await c.setFlag("kill.mail", true, "security");
  assert.deepEqual(calls.map((x) => [x.method, x.url]), [["POST", "http://api/admin/v1/reports/r%201/decide"], ["POST", "http://api/admin/v1/takedowns"], ["PUT", "http://api/admin/v1/flags/kill.mail"]]);
  assert.deepEqual(JSON.parse(calls[0].body), { source: "report", decision: "hide", reasonCode: "scam" });
  assert.deepEqual(JSON.parse(calls[1].body), { targetType: "team", targetId: "t1", reasonCode: "legal_request" });
  assert.deepEqual(JSON.parse(calls[2].body), { value: true, reasonCode: "security" });
});

test("reports are copied through an allow-list: no roster, photo or email can come through", async () => {
  const { c } = setup(() => res(200, { items: [{ id: "r1", target_type: "team", target_id: "t", reason_code: "scam", note: "x".repeat(500), priority: 3, reporters: 4, created_at: "2026-11-01T00:00:00Z", roster: [{ name: "Kid" }], photoUrl: "http://x/p.jpg", email: "a@b.c", link: "/team/x/" }], next: "c2" }), fresh());
  const p = await c.reports("open");
  assert.equal(p.next, "c2");
  const r = p.items[0];
  assert.equal(r.note.length, 200);
  assert.equal(r.link, "/team/x/");
  assert.deepEqual(Object.keys(r).sort(), ["createdAt", "hidden", "id", "link", "note", "priority", "reasonCode", "reporters", "source", "status", "targetId", "targetType"]);
  assert.equal(JSON.stringify(r).includes("Kid"), false);
});

test("the REAL report queue shape: source, numeric next, actioned means hidden, status goes in the query", async () => {
  const real = { items: [
    { source: "report", id: "a1", targetType: "live_page", targetId: "ev1", eventId: "ev1", orgId: null, reasonCode: "spam", note: "", status: "open", priority: 0, createdAt: "2026-11-01T00:00:00Z", lookupKey: "abc", reporters: 3 },
    { source: "directory", id: "d1", targetType: "directory_entry", targetId: "ev2", eventId: "ev2", orgId: "o1", reasonCode: "other", note: "n", status: "actioned", priority: 3, createdAt: "2026-11-02T00:00:00Z", lookupKey: "ev2", reporters: 1 },
  ], next: 25 };
  const { c, calls } = setup(() => res(200, real), fresh());
  const p = await c.reports("open", "25");
  assert.equal(calls[0].url, "http://api/admin/v1/reports?status=open&after=25");
  assert.equal(p.next, "25");
  assert.deepEqual(p.items.map((r) => [r.source, r.id, r.hidden, r.reporters]), [["report", "a1", false, 3], ["directory", "d1", true, 1]]);
  await c.decide("d1", "restore", "other", p.items[1].source);
  assert.deepEqual(JSON.parse(calls[1].body), { source: "directory", decision: "restore", reasonCode: "other" });
  const last = setup(() => res(200, { items: [], next: null }), fresh());
  assert.equal((await last.c.reports("needs_other_staff")).next, null);
  assert.match(last.calls[0].url, /status=needs_other_staff$/);
});

test("takedowns are listed and lifted through the restore route with a reason", async () => {
  const { c, calls } = setup((url) => (url.includes("/restore") ? res(200, { ok: true, state: "restored", changed: true }) : res(200, { items: [{ targetType: "live_page", targetId: "ev1", reasonCode: "scam", byStaff: "s-1", at: "2026-11-03T00:00:00Z", eventId: "ev1", orgId: null }], next: null })), fresh());
  const p = await c.takedowns();
  assert.deepEqual(p.items, [{ targetType: "live_page", targetId: "ev1", reasonCode: "scam", at: "2026-11-03T00:00:00Z" }]);
  assert.equal(JSON.stringify(p).includes("s-1"), false, "the staff id is not kept");
  await c.liftTakedown("live_page", "ev1", "other");
  assert.deepEqual([calls[1].method, calls[1].url], ["POST", "http://api/admin/v1/takedowns/live_page/ev1/restore"]);
  assert.deepEqual(JSON.parse(calls[1].body), { reasonCode: "other" });
});

test("lookup shows metadata only, never an email or a roster, and reads the real count shapes", async () => {
  const { c } = setup(() => res(200, { kind: "user", id: "u1", status: "active", createdAt: "t", email: "secret@x.com", roster: [1], photos: [1], emailVerified: true, orgs: [{ id: "o1", kind: "personal", status: "active", role: "admin" }], counts: { eventsOwned: 2, eventsShared: 1, name: 9 } }), fresh());
  const l = await c.lookup("email", "secret@x.com");
  assert.equal(JSON.stringify(l).includes("secret@x.com"), false);
  assert.equal(JSON.stringify(l).includes("roster"), false);
  assert.deepEqual(l.counts, [{ label: "Organisations", value: 1 }, { label: "Events owned", value: 2 }, { label: "Events shared with them", value: 1 }]);
  const ev = setup(() => res(200, { kind: "event", id: "e1", ownerId: "u-secret", orgId: null, date: "d", counts: { teams: 4, people: 80, registrations: 5, checkins: 2 } }), fresh());
  const e = await ev.c.lookup("id", "e1");
  assert.deepEqual(e.counts.map((x) => x.value), [4, 80, 5, 2]);
  assert.equal(JSON.stringify(e).includes("u-secret"), false);
  const org = setup(() => res(200, { kind: "org", id: "o1", orgKind: "team", status: "suspended", createdAt: "t", counts: { members: 3, events: 7 } }), fresh());
  assert.deepEqual((await org.c.lookup("id", "o1")).counts.map((x) => x.value), [3, 7]);
});

test("audit rows never carry an actor id", async () => {
  const { c } = setup(() => res(200, { entries: [{ id: 1, at: "t", actorType: "staff", actorId: "staff-77", orgId: null, eventId: null, action: "report.decided", targetType: "live_page", targetId: "x", reasonCode: "spam", meta: {} }], next: 1 }), fresh());
  const page = await c.audit();
  const a = page.items[0];
  assert.equal(a.action, "report.decided");
  assert.equal(page.next, "1");
  assert.equal(JSON.stringify(a).includes("staff-77"), false);
});

test("flags and usage accept both array and map shapes", async () => {
  const a = setup(() => res(200, { flags: { "kill.mail": true, "kill.uploads": false } }), fresh());
  assert.deepEqual((await a.c.flags()).map((f) => [f.key, f.value]), [["kill.mail", true], ["kill.uploads", false]]);
  const b = setup(() => res(200, [{ key: "kill.mail", value: true }]), fresh());
  assert.equal((await b.c.flags())[0].value, true);
  const u = setup(() => res(200, { items: [{ key: "mail", value: 3, limit: 90, source: "exact" }] }), fresh());
  assert.equal((await u.c.usage()).items[0].label, "Emails sent today");
});

test("the REAL flags shape keeps settable and stepUp", async () => {
  const { c } = setup(() => res(200, { flags: [{ key: "kill.mail", value: false, default: false, settable: true, stepUp: true, updatedAt: null, updatedBy: null, reasonCode: null }, { key: "takedown.enforce", value: true, default: false, settable: true, stepUp: false, updatedAt: "t", updatedBy: "s", reasonCode: "other" }, { key: "authz.mode", value: "legacy", default: "legacy", settable: false, stepUp: false, updatedAt: null, updatedBy: null, reasonCode: null }] }), fresh());
  assert.deepEqual((await c.flags()).map((f) => [f.key, f.value, f.settable, f.stepUp]), [["kill.mail", false, true, true], ["takedown.enforce", true, true, false], ["authz.mode", false, false, false]]);
});

test("the REAL usage shape: ids, availability and the exact bytes row", async () => {
  const { c } = setup(() => res(200, { day: "2026-11-12", note: "limits not verified, check Cloudflare", items: [
    { id: "d1_rows_written_today", label: "Database rows written today", value: null, limit: 90, exact: false, available: false, source: "No sample is collected yet" },
    { id: "worker_requests_today", label: "Worker requests today", value: null, limit: 90, exact: false, available: false, source: "Needs the Cloudflare token" },
    { id: "mail_sent_today", label: "Emails sent today", value: 12, limit: 90, exact: true, available: true, source: "Counted" },
    { id: "db_size_bytes", label: "Database size", value: 52000000, limit: 500000000, exact: true, available: true, source: "From the database" },
  ] }), fresh());
  const u = await c.usage();
  assert.deepEqual(u.items.map((i) => [i.key, i.value, i.available, i.unit]), [["d1_rows_written_today", null, false, ""], ["worker_requests_today", null, false, ""], ["mail_sent_today", 12, true, ""], ["db_size_bytes", 52000000, true, "bytes"]]);
  assert.equal(u.items[0].source, "No sample is collected yet");
  assert.equal(u.note, "limits not verified, check Cloudflare");
});

test("a link is kept only when it is a path on this site", () => {
  assert.equal(safeLink("/live/x/"), "/live/x/");
  for (const bad of ["https://evil.example/", "//evil.example", "javascript:alert(1)", "live/x", 5]) assert.equal(safeLink(bad), null, String(bad));
});

test("network failure is a plain sentence with status 0", async () => {
  const store = mem(); store.setItem(STAFF_KEY, fresh());
  const c = createAdminClient({ base: "x", fetchImpl: async () => { throw new Error("down"); }, store: () => store, now: () => NOW });
  await assert.rejects(c.usage(), (e) => e.status === 0 && /connection/.test(e.message));
  assert.equal(c.hasSession(), true);
});
