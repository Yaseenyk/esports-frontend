// The feedback bot's rules: pure logic, no browser, no network. The API is a tiny mock.
import test from "node:test";
import assert from "node:assert/strict";
import { cleanPath, validatePathInput } from "../src/features/feedback/hooks/path.ts";
import { HIDDEN_ROUTE_PREFIXES, isFullscreenNow, isHiddenPath, PROMPT_DELAY_MS, PROMPT_SNOOZE_MS, DISMISS_KEY, PROMPTED_KEY } from "../src/features/feedback/config.ts";
import { armNudge, mayNudge, markDismissed, markShown, pickLine } from "../src/features/feedback/hooks/prompt.ts";
import { createErrorBuffer, sanitizeError } from "../src/features/feedback/hooks/error-capture.ts";
import { initialState, reduce, stepErrors, canWithdraw, transcript, currentPrompt } from "../src/features/feedback/hooks/conversation.ts";
import { buildReportBody } from "../src/features/feedback/services/request.ts";
import { toFeedbackFailure } from "../src/features/feedback/services/failure.ts";
import { COPY, COPY_IS_DRAFT, NUDGE_LINES } from "../src/features/feedback/copy.ts";
import { shrinkToLimit } from "../src/features/disputes/evidence.ts";
import { createClient } from "../src/lib/api/client.ts";

// ---------- path / query stripping ----------
test("cleanPath keeps the path only: no query, no hash, no host", () => {
  assert.equal(cleanPath("/join/?t=SECRET"), "/join/");
  assert.equal(cleanPath("/pass/?t=abc#frag"), "/pass/");
  assert.equal(cleanPath("https://esports.streamerosai.com/register/?t=TOKEN&x=1#h"), "/register/");
  assert.equal(cleanPath("tools/brackets"), "/tools/brackets");
  assert.equal(cleanPath("//tools///x/"), "/tools/x/");
  assert.equal(cleanPath(""), "/");
  assert.equal(cleanPath(null), "/");
  assert.ok(cleanPath("/" + "a".repeat(500)).length <= 200);
  assert.ok(!cleanPath("/a b\nc?q=1").includes("?"));
});

test("validatePathInput accepts only a path on this site", () => {
  assert.equal(validatePathInput("/tools/brackets/"), true);
  assert.equal(validatePathInput("//evil.com/x"), false);
  assert.equal(validatePathInput("https://evil.com/x", "https://esports.streamerosai.com"), false);
  assert.equal(validatePathInput("https://esports.streamerosai.com/x", "https://esports.streamerosai.com"), true);
  assert.equal(validatePathInput("javascript:alert(1)"), false);
  assert.equal(validatePathInput("tools"), false);
  assert.equal(validatePathInput(""), false);
  assert.equal(validatePathInput('/x"><script>'), false);
});

// ---------- exclusion list ----------
test("the hidden-route list is pinned and matches whole segments", () => {
  assert.deepEqual([...HIDDEN_ROUTE_PREFIXES], ["/gate", "/display", "/pass", "/overlay", "/embed"]);
  for (const p of ["/gate/", "/gate", "/display/", "/display/x/", "/pass/", "/pass/?t=1", "/overlay/", "/embed/", "/GATE/"]) assert.equal(isHiddenPath(p), true, p);
  for (const p of ["/", "/tools/", "/gatehouse/", "/passport/", "/displays/", "/tools/display-screen/", "/app/", "/live/", ""]) assert.equal(isHiddenPath(p), false, p);
  assert.equal(isHiddenPath(null), false);
});

test("fullscreen hides the widget", () => {
  assert.equal(isFullscreenNow({ fullscreenElement: {} }), true);
  assert.equal(isFullscreenNow({ fullscreenElement: null }), false);
});

// ---------- nudge timing ----------
const kv = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), m }; };
const fakeTimer = () => { const q = []; return { set: (fn, ms) => { q.push({ fn, ms }); return q.length - 1; }, clear: (h) => { q[h] = null; }, q, fire: () => q.forEach((x) => x && x.fn()) }; };

test("nudge: shows once after 20 s, never if the panel was used, once per session", () => {
  let t = 1_000_000; const env = { now: () => t, local: kv(), session: kv() };
  const timer = fakeTimer(); const shown = [];
  armNudge(env, () => false, (l) => shown.push(l), { timer, rand: () => 0 });
  assert.equal(timer.q[0].ms, PROMPT_DELAY_MS);
  assert.equal(PROMPT_DELAY_MS, 20000);
  timer.fire();
  assert.deepEqual(shown, [NUDGE_LINES[0]]);
  assert.equal(env.session.getItem(PROMPTED_KEY), "1");
  // a second page in the same session: not armed again
  const t2 = fakeTimer(); armNudge(env, () => false, (l) => shown.push(l), { timer: t2 });
  assert.equal(t2.q.length, 0);
  // interacted visitors never see it
  const env2 = { now: () => t, local: kv(), session: kv() }; const t3 = fakeTimer(); const s3 = [];
  armNudge(env2, () => true, (l) => s3.push(l), { timer: t3 }); t3.fire();
  assert.deepEqual(s3, []);
});

test("nudge: a dismissal keeps it away for 7 days and stores only a timestamp", () => {
  let t = 5_000_000; const env = { now: () => t, local: kv(), session: kv() };
  markDismissed(env);
  assert.equal(env.local.getItem(DISMISS_KEY), String(5_000_000));
  assert.equal(env.local.m.size, 1);
  assert.equal(mayNudge(env), false);
  t += PROMPT_SNOOZE_MS - 1; assert.equal(mayNudge(env), false);
  t += 2; assert.equal(mayNudge(env), true);
  assert.equal(PROMPT_SNOOZE_MS, 7 * 24 * 3600 * 1000);
  markShown(env); assert.equal(mayNudge(env), false);
});

test("nudge: blocked storage never throws and means 'nothing stored'", () => {
  const bad = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  const env = { now: () => 1, local: bad, session: bad };
  assert.equal(mayNudge(env), true);
  assert.doesNotThrow(() => { markShown(env); markDismissed(env); });
});

test("pickLine rotates through the lines, includes the three owner phrases", () => {
  assert.equal(pickLine(() => 0.9999), NUDGE_LINES[NUDGE_LINES.length - 1]);
  for (const p of ["Have feedback? Help us here.", "Found something broken? Tell us.", "Want this site to grow? Help us here."]) assert.ok(NUDGE_LINES.includes(p));
  assert.equal(NUDGE_LINES.length, 5);
  assert.equal(COPY_IS_DRAFT, true);
});

// ---------- error sanitiser ----------
test("sanitizeError strips queries, hashes, tokens, JWTs and emails; truncates to 200", () => {
  const jwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dBjftJeZ4CVPmB92K27uhbUJU1p1r_wW1gFWFOEjXk";
  const cases = [
    ["Failed to fetch https://api.x.dev/v3/thing?t=SECRETVALUE&a=1#frag", ["SECRETVALUE", "a=1", "frag"]],
    ["Loading /join/?t=TOPSECRET failed", ["TOPSECRET"]],
    ["Bad token " + jwt, [jwt, "eyJhbGci"]],
    ["Authorization: Bearer abc123def456ghi789", ["abc123def456ghi789"]],
    ["User olivia.test@example.com not found", ["olivia", "@example"]],
    ["key=ABCDEFGHIJKLMNOPQRSTUVWXYZ012345 leaked", ["ABCDEFGHIJKLMNOPQRSTUVWXYZ012345"]],
    ["see /pass/#SECRETHASH here", ["SECRETHASH"]],
    ["https://user:pw@host.example/p?x=1", ["pw@", "x=1"]],
  ];
  for (const [input, banned] of cases) { const out = sanitizeError(input); for (const b of banned) assert.ok(!out.includes(b), `${input} -> ${out} still has ${b}`); }
  assert.ok(sanitizeError("x".repeat(500)).length <= 200);
  assert.ok(sanitizeError("word ".repeat(100)).length <= 200);
  assert.equal(sanitizeError("What? Really"), "What? Really");
  assert.equal(sanitizeError(new Error("boom")), "Error: boom");
  assert.equal(sanitizeError(undefined), "undefined");
  assert.equal(sanitizeError({ toString() { throw new Error("x"); } }), "");
  assert.equal(sanitizeError("a\u0000b\nc"), "a b c");
});

test("the error buffer keeps the last 5, skips empties and repeats", () => {
  const b = createErrorBuffer();
  for (let i = 1; i <= 8; i++) b.push(`error ${i}`);
  b.push("error 8"); b.push("");
  assert.deepEqual(b.list(), ["error 4", "error 5", "error 6", "error 7", "error 8"]);
  b.clear(); assert.deepEqual(b.list(), []);
});

// ---------- the conversation ----------
const run = (s, ...actions) => actions.reduce((st, a) => reduce(st, a, "https://esports.streamerosai.com"), s);
const text = (n) => "x".repeat(n);

test("conversation: every step in order, with the page auto-detected", () => {
  let s = initialState("/tools/brackets/?t=1");
  assert.equal(s.step, "greeting"); assert.equal(s.path, "/tools/brackets/");
  s = run(s, { type: "next" }); assert.equal(s.step, "kind");
  s = run(s, { type: "next" }); assert.equal(s.step, "kind"); assert.ok(s.errors.kind);
  s = run(s, { type: "kind", kind: "bug" }, { type: "next" }); assert.equal(s.step, "message");
  s = run(s, { type: "message", text: "short" }, { type: "next" }); assert.equal(s.step, "message"); assert.ok(s.errors.message);
  s = run(s, { type: "message", text: text(10) }, { type: "next" }); assert.equal(s.step, "page");
  s = run(s, { type: "next" }); assert.equal(s.step, "shots");
  s = run(s, { type: "next" }); assert.equal(s.step, "contact");
  s = run(s, { type: "next" }); assert.equal(s.step, "review");
  assert.equal(currentPrompt(s), COPY.reviewQuestion);
});

test("conversation: validation limits on message, path, contact, shots", () => {
  const at = (step, over = {}) => ({ ...initialState("/x/"), step, kind: "bug", message: text(20), ...over });
  assert.ok(stepErrors(at("message", { message: text(9) })).message);
  assert.equal(stepErrors(at("message", { message: text(10) })).message, undefined);
  assert.equal(stepErrors(at("message", { message: text(2000) })).message, undefined);
  assert.ok(stepErrors(at("message", { message: text(2001) })).message);
  assert.ok(stepErrors(at("message", { message: "   " + text(5) + "   " })).message, "spaces do not count");
  assert.ok(stepErrors(at("page", { path: "https://evil.example/x" }), "https://esports.streamerosai.com").path);
  assert.equal(stepErrors(at("page", { path: "/ok/" })).path, undefined);
  assert.ok(stepErrors(at("contact", { contact: text(121) })).contact);
  assert.ok(stepErrors(at("shots", { shots: [{ id: "a", name: "a", status: "working" }] })).shots);
  assert.ok(stepErrors(at("review", { consent: false })).consent);
  assert.deepEqual(stepErrors(at("review", { consent: true })), {});
});

test("conversation: back, skip, and the optional steps", () => {
  let s = { ...initialState("/x/"), step: "contact", kind: "idea", message: text(20) };
  s = run(s, { type: "back" }); assert.equal(s.step, "shots");
  s = run(s, { type: "skip" }); assert.equal(s.step, "contact");
  s = run(s, { type: "contact", text: "me@x.com" }, { type: "skip" }); assert.equal(s.step, "review"); assert.equal(s.contact, "");
  s = run(s, { type: "back" }, { type: "back" }, { type: "back" }, { type: "back" }, { type: "back" }, { type: "back" }, { type: "back" });
  assert.equal(s.step, "greeting");
  assert.equal(run(s, { type: "back" }).step, "greeting");
  // the editable page field keeps only a path after the visitor edits it
  assert.equal(initialState("/a/").includeErrors, true, "errors tick defaults ON");
  assert.equal(initialState("/a/").includeAccount, false);
});

test("conversation: send needs consent, then created, then done", () => {
  let s = { ...initialState("/x/"), step: "review", kind: "bug", message: text(20) };
  s = run(s, { type: "sendStart" }); assert.equal(s.step, "review"); assert.ok(s.errors.consent);
  s = run(s, { type: "consent", on: true }, { type: "sendStart" }); assert.equal(s.step, "sending");
  s = run(s, { type: "created", id: "r1", token: "tok", expiresInSeconds: 1200, now: 1000 });
  assert.equal(s.report.expiresAt, 1000 + 1_200_000);
  s = run(s, { type: "uploadResult", uploaded: [], failed: [] }); assert.equal(s.step, "done");
  assert.equal(canWithdraw(s, 1000 + 1_199_999), true);
  assert.equal(canWithdraw(s, 1000 + 1_200_000), false, "20 minutes, then the button goes");
  s = run(s, { type: "withdrawStart" }); assert.equal(s.withdrawing, true);
  s = run(s, { type: "withdrawn" }); assert.equal(s.step, "withdrawn"); assert.equal(canWithdraw(s, 1001), false);
});

test("conversation: a failed upload after the report exists keeps the report", () => {
  let s = { ...initialState("/x/"), step: "sending", kind: "bug", message: text(20), consent: true, shots: [{ id: "s1", name: "a.png", status: "ready", size: 10 }] };
  s = run(s, { type: "created", id: "r1", token: "tok", now: 0 });
  s = run(s, { type: "uploadResult", uploaded: [], failed: ["s1"], code: "too_big", max: 2 });
  assert.equal(s.step, "partial");
  assert.equal(s.report.id, "r1", "the report is not lost");
  assert.deepEqual(s.uploadFailed, ["s1"]);
  assert.equal(s.notice, COPY.errors.too_big);
  assert.equal(currentPrompt(s), "We got your message, but the screenshot did not upload.");
  assert.equal(canWithdraw(s, 1), true);
  s = run(s, { type: "retryStart" }); assert.equal(s.step, "sending");
  s = run(s, { type: "uploadResult", uploaded: ["s1"], failed: [] }); assert.equal(s.step, "done"); assert.deepEqual(s.uploadedIds, ["s1"]);
  // finishing without it
  let p = { ...s, step: "partial", uploadFailed: ["s1"] }; p = run(p, { type: "finishWithout" }); assert.equal(p.step, "done");
});

test("conversation: every contract error code has plain words and a sensible step", () => {
  const base = { ...initialState("/x/"), step: "sending", kind: "bug", message: text(20), consent: true };
  const expect = { rate_limited: "review", daily_cap: "review", too_short: "message", invalid: "page", not_found: "review", payload: "review", network: "review", unknown: "review" };
  for (const [code, step] of Object.entries(expect)) {
    const s = run(base, { type: "sendFailed", code });
    assert.equal(s.step, step, code);
    assert.ok(s.notice.length > 10, code);
    assert.equal(s.message, base.message, "answers are kept");
  }
  const m = run(base, { type: "uploadResult", uploaded: [], failed: ["a"], code: "too_many", max: 2 });
  assert.ok(m.notice.includes("2"), "too_many names the limit");
  for (const code of ["too_big", "bad_image", "bad_token", "unsupported_type"]) assert.ok(run(base, { type: "uploadResult", uploaded: [], failed: ["a"], code }).notice.length > 10, code);
  assert.equal(run({ ...base, report: { id: "r", token: "t", expiresAt: 1 } }, { type: "withdrawFailed", code: "bad_token" }).notice, COPY.errors.withdrawExpired);
});

test("conversation: the transcript shows what was asked and answered", () => {
  const s = { ...initialState("/tools/"), step: "contact", kind: "idea", message: "I would like a seeding tool please", shots: [] };
  const t = transcript(s);
  assert.equal(t[0].text, COPY.greeting);
  assert.ok(t.some((l) => l.from === "you" && l.text.includes("seeding")));
  assert.ok(t.some((l) => l.text === "You are on: /tools/"));
});

// ---------- failure mapping ----------
test("toFeedbackFailure maps statuses and codes", () => {
  const e = (status, code) => ({ status, detail: code ? { code } : undefined });
  assert.equal(toFeedbackFailure(new Error("net")).code, "network");
  assert.equal(toFeedbackFailure(e(429, "daily_cap")).code, "daily_cap");
  assert.equal(toFeedbackFailure(e(429, "rate_limited")).code, "rate_limited");
  assert.equal(toFeedbackFailure(e(429)).code, "rate_limited");
  assert.equal(toFeedbackFailure(e(400, "too_short")).code, "too_short");
  assert.equal(toFeedbackFailure(e(400, "invalid")).code, "invalid");
  assert.equal(toFeedbackFailure(e(404)).code, "not_found");
  assert.equal(toFeedbackFailure(e(413), "create").code, "payload");
  assert.equal(toFeedbackFailure(e(413), "upload").code, "too_big");
  assert.equal(toFeedbackFailure(e(400, "bad_image"), "upload").code, "bad_image");
  assert.equal(toFeedbackFailure(e(401), "upload").code, "bad_token");
  assert.equal(toFeedbackFailure(e(409), "upload").code, "too_many");
  assert.equal(toFeedbackFailure(e(415), "upload").code, "unsupported_type");
  assert.equal(toFeedbackFailure(e(500)).code, "unknown");
});

// ---------- request building ----------
test("buildReportBody: exact JSON shape, empty honeypot, consent version, path only", () => {
  const body = buildReportBody({ kind: "bug", message: "  The bracket page does not load  ", path: "/tools/brackets/?t=SECRET#x", title: "Brackets", viewport: { w: 390.4, h: 844 }, locale: "en-IN", errors: ["e1", "e2"], contact: " me@x.com ", includeAccount: true });
  assert.deepEqual(body, {
    kind: "bug", message: "The bracket page does not load", page: { path: "/tools/brackets/", title: "Brackets" },
    client: { viewport: { w: 390, h: 844 }, locale: "en-IN", errors: ["e1", "e2"] },
    contact: "me@x.com", includeAccount: true, consent: true, consentVersion: "feedback-v1", website: "",
  });
  assert.ok(!JSON.stringify(body).includes("SECRET"));
  const min = buildReportBody({ kind: "idea", message: "x".repeat(10), path: "/", viewport: { w: 1, h: 2 } });
  assert.deepEqual(Object.keys(min).sort(), ["client", "consent", "consentVersion", "kind", "message", "page", "website"]);
  assert.deepEqual(min.client, { viewport: { w: 1, h: 2 } });
  assert.equal(min.website, "");
  assert.equal(buildReportBody({ kind: "idea", message: "x".repeat(10), path: "/", viewport: { w: 1, h: 2 }, includeAccount: false }).includeAccount, undefined);
  assert.equal(buildReportBody({ kind: "idea", message: "x".repeat(10), path: "/", viewport: { w: 1, h: 2 }, errors: [] }).client.errors, undefined);
  assert.equal(buildReportBody({ kind: "idea", message: "x".repeat(10), path: "/", viewport: { w: 1, h: 2 }, errors: Array.from({ length: 9 }, (_, i) => `e${i}`) }).client.errors.length, 5);
});

// ---------- screenshot sizing loop (reused from the dispute uploader) ----------
test("screenshot sizing: shrinks until it fits the server's limit, and reports failure when it cannot", async () => {
  const limit = 409600;
  const sizes = [];
  const fits = await shrinkToLimit(3000, 2000, async (a) => { sizes.push(a); return { size: a.w * a.h * a.quality > 500_000 ? limit + 1 : limit - 1 }; }, limit);
  assert.equal(fits.ok, true);
  assert.ok(sizes[0].w <= 1600 && sizes[0].h <= 1600, "starts inside 1600 px");
  assert.ok(sizes.length > 1, "needed more than one try");
  const never = await shrinkToLimit(800, 600, async () => ({ size: limit * 2 }), limit);
  assert.deepEqual(never, { ok: false, reason: "too_big" });
  const broken = await shrinkToLimit(800, 600, async () => null, limit);
  assert.deepEqual(broken, { ok: false, reason: "encode_failed" });
});

// ---------- the API client: anonymous calls and custom headers ----------
test("api client: anonymous calls send no bearer token and never sign anyone out; headers are passed", async () => {
  const calls = []; let signedOut = 0;
  const client = createClient({
    base: "https://api.test", token: () => "SESSION", onUnauthorized: () => { signedOut++; }, sleep: async () => {}, isOnline: () => true,
    fetchImpl: async (url, init) => { calls.push({ url, init }); const bad = url.endsWith("/bad"); return { ok: !bad, status: bad ? 401 : 201, headers: { get: () => null }, json: async () => (bad ? { error: "no", code: "bad_token" } : { id: "x" }) }; },
  });
  await client.post("/feedback", { a: 1 }, { anonymous: true });
  assert.equal(calls[0].init.headers.authorization, undefined);
  await client.post("/feedback", { a: 1 });
  assert.equal(calls[1].init.headers.authorization, "Bearer SESSION");
  await client.postRaw("/feedback/1/attachments", new Blob(["x"]), { anonymous: true, headers: { "X-Attach-Token": "T", "Content-Type": "image/webp" } });
  assert.equal(calls[2].init.headers["x-attach-token"], "T");
  assert.equal(calls[2].init.headers["content-type"], "image/webp");
  assert.equal(Object.keys(calls[2].init.headers).filter((k) => k.toLowerCase() === "content-type").length, 1, "one content-type only");
  assert.equal(calls[2].init.headers.authorization, undefined);
  await assert.rejects(client.postRaw("/bad", new Blob(["x"]), { anonymous: true }));
  assert.equal(signedOut, 0, "a 401 on an anonymous call must not sign the visitor out");
  await assert.rejects(client.postRaw("/bad", new Blob(["x"])));
  assert.equal(signedOut, 1, "unchanged behaviour for normal calls");
  await client.get("/feedback/status", { anonymous: true, retries: 0, force: true });
  assert.equal(calls.at(-1).init.headers.authorization, undefined);
});
