import test from "node:test";
import assert from "node:assert/strict";
import { secondsLeft, passwordProblem, mismatchProblem, looksLikeEmail, emailFromQuery, tokenFromQuery, forgotMessage, resetFailure, RESEND_SECONDS } from "../src/lib/auth-reset.ts";
import { createClient } from "../src/lib/api/client.ts";

test("the resend countdown rounds up and never goes negative", () => {
  assert.equal(secondsLeft(60000, 0), 60);
  assert.equal(secondsLeft(60000, 59001), 1);
  assert.equal(secondsLeft(60000, 70000), 0);
  assert.equal(RESEND_SECONDS, 60);
});

test("password rule and mismatch checks", () => {
  assert.ok(passwordProblem("short"));
  assert.equal(passwordProblem("longenough"), "");
  assert.ok(mismatchProblem("abcdefgh", "abcdefgi"));
  assert.equal(mismatchProblem("abcdefgh", "abcdefgh"), "");
});

test("email shape and query readers", () => {
  assert.ok(looksLikeEmail("a@b.co") && !looksLikeEmail("nope") && !looksLikeEmail("a@b"));
  assert.equal(emailFromQuery("?email=a%40b.co"), "a@b.co");
  assert.equal(emailFromQuery(""), "");
  assert.equal(tokenFromQuery("?t=abc123"), "abc123");
  assert.equal(tokenFromQuery("?x=1"), "");
});

test("failures get plain words and an expired link is told apart from a weak password", () => {
  assert.match(forgotMessage({ status: 429 }), /too many tries/i);
  assert.match(forgotMessage(new Error("x")), /could not reach/i);
  assert.deepEqual(resetFailure({ status: 400, serverError: "invalid_or_expired" }), { kind: "expired" });
  assert.deepEqual(resetFailure({ status: 400, serverError: "Password must be at least 8 characters" }), { kind: "message", text: "Password must be at least 8 characters" });
  assert.equal(resetFailure({ status: 429 }).kind, "message");
});

test("the client keeps the error word from the server so the screen can tell the cases apart", async () => {
  const c = createClient({ base: "http://x", fetchImpl: async () => ({ ok: false, status: 400, headers: { get: () => null }, json: async () => ({ error: "invalid_or_expired" }) }) });
  await assert.rejects(c.post("/auth/reset", { token: "t", password: "p" }), (e) => e.status === 400 && e.serverError === "invalid_or_expired");
});
