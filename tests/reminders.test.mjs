// Run: node --import tsx --test tests/reminders.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import {
  CONSENT_TEXT, TEMPLATES, audienceCount, audienceLabel, audienceOf, audienceWarning, checkMessage, checkSendAt, isEmail, limitWords, localInputToIso, localTimeText, maskEmail,
  nowLocalInput, previewText, remainingToday, statusLabel, templateById,
} from "../src/lib/reminders.ts";

const limits = (o = {}) => ({ dayLimit: 90, eventDayLimit: 40, sentToday: 0, eventSentToday: 0, remainingToday: 40, ...o });

test("four templates render a plain subject and message from the event", () => {
  assert.deepEqual(TEMPLATES.map((t) => t.id), ["tomorrow", "closing", "results", "custom"]);
  assert.deepEqual(TEMPLATES.map((t) => t.title), ["Starts tomorrow", "Registration closes soon", "Results are up", "Custom message"]);
  const r = templateById("tomorrow").render({ eventName: "Spring  Cup", date: "2026-12-01", venue: "City Arena" });
  assert.equal(r.subject, "Spring Cup starts tomorrow");
  assert.match(r.body, /\(2026-12-01, City Arena\)/);
  assert.equal(templateById("results").render({ eventName: "X" }).subject, "Results are up for X");
  assert.equal(templateById("closing").render({ eventName: "X" }).subject, "Registration for X closes soon");
});

test("no template contains a link", () => {
  for (const t of TEMPLATES) {
    const r = t.render({ eventName: "Cup", date: "2026-12-01", venue: "Hall" });
    assert.equal(checkMessage(r.subject, r.body.length < 5 ? "Hello there" : r.body), null, t.id);
  }
});

test("message checks mirror the server", () => {
  assert.match(checkMessage("Hi", "Long enough body"), /subject/i);
  assert.match(checkMessage("Fine subject", "abc"), /message/i);
  assert.match(checkMessage("Fine subject", "see https://x.example"), /Links are not allowed/);
  assert.match(checkMessage("Fine\nsubject", "Long enough body"), /single line/);
  assert.match(checkMessage("Fine subject", "x".repeat(2001)), /at most 2000/);
  assert.equal(checkMessage("Fine subject", "Long enough body"), null);
});

test("masking hides all but the first letter", () => {
  assert.equal(maskEmail("abc@gmail.com"), "a***@gmail.com");
  assert.equal(maskEmail("x@y.io"), "x***@y.io");
  assert.equal(maskEmail("nope"), "***");
  assert.equal(maskEmail(""), "***");
});

test("email check and consent wording", () => {
  assert.equal(isEmail("a@b.co"), true);
  assert.equal(isEmail("a b@c.co"), false);
  assert.equal(isEmail("abc"), false);
  assert.match(CONSENT_TEXT, /unsubscribe/);
});

test("date and time input becomes an ISO time and shows the local time zone", () => {
  assert.equal(localInputToIso(""), null);
  assert.equal(localInputToIso("2026-12-01"), null);
  const iso = localInputToIso("2026-12-01T09:30");
  assert.equal(iso, new Date("2026-12-01T09:30").toISOString());
  assert.match(localTimeText("2026-12-01T04:00:00Z", "Asia/Kolkata"), /9:30 am/);
  assert.match(localTimeText("2026-12-01T04:00:00Z", "Asia/Kolkata"), /\(.*\)$/);
  assert.equal(localTimeText("junk"), "");
  assert.match(nowLocalInput(new Date(2026, 11, 1, 9, 5)), /^2026-12-01T09:06$/);
});

test("send time checks: past, too far ahead, empty", () => {
  const now = Date.parse("2026-12-01T00:00:00Z");
  assert.match(checkSendAt(null, now), /Pick a date/);
  assert.match(checkSendAt("2026-11-30T00:00:00Z", now), /already passed/);
  assert.equal(checkSendAt("2026-12-01T00:03:00Z", now), null); // a few minutes of slack
  assert.equal(checkSendAt("2026-12-02T00:00:00Z", now), null);
  assert.match(checkSendAt("2027-06-01T00:00:00Z", now), /within 90 days/);
});

test("budget maths takes the smaller of the site and event allowance", () => {
  assert.equal(remainingToday(limits()), 40);
  assert.equal(remainingToday(limits({ sentToday: 80 })), 10);
  assert.equal(remainingToday(limits({ eventSentToday: 38 })), 2);
  assert.equal(remainingToday(limits({ sentToday: 95 })), 0);
});

test("the daily limit is explained in words, and a reached limit says what happens next", () => {
  assert.match(limitWords(limits()), /about 90 emails a day/);
  assert.match(limitWords(limits({ sentToday: 30 })), /30 have been sent today.*up to 40 more/);
  assert.match(limitWords(limits({ sentToday: 1 })), /1 has been sent/);
  const done = limitWords(limits({ sentToday: 90 }));
  assert.match(done, /limit has been reached/);
  assert.match(done, /midnight UTC/);
});

test("audience maths and warnings", () => {
  const c = { organisers: 2, captains: 5 };
  assert.equal(audienceCount(c, { organisers: true, captains: true }), 7);
  assert.equal(audienceCount(c, { organisers: false, captains: true }), 5);
  assert.equal(audienceCount(c, { organisers: false, captains: false }), 0);
  assert.equal(audienceOf({ organisers: true, captains: true }), "both");
  assert.equal(audienceOf({ organisers: true, captains: false }), "organiser");
  assert.equal(audienceOf({ organisers: false, captains: true }), "captain");
  assert.equal(audienceOf({ organisers: false, captains: false }), null);
  assert.match(audienceWarning(0, limits()), /Nobody/);
  assert.match(audienceWarning(41, limits()), /at most 40/);
  assert.equal(audienceWarning(10, limits()), null);
  assert.equal(audienceLabel("captain"), "Captains who agreed");
});

test("status words and preview", () => {
  assert.equal(statusLabel("pending"), "Waiting to be sent");
  assert.equal(statusLabel("sending"), "Going out now");
  assert.equal(statusLabel("cancelled"), "Cancelled");
  const p = previewText("Hi\nthere", "Body text", "Spring Cup");
  assert.match(p, /^Subject: Hi there/);
  assert.match(p, /Unsubscribe from this event/);
  assert.match(p, /about Spring Cup/);
});
