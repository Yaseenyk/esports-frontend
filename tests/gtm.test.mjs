import test from "node:test";
import assert from "node:assert/strict";
import { gtmAllowed, GTM_ID, CLARITY_ID, GTM_BOOT, tagHostAllowed } from "../src/lib/gtm.ts";

test("the tag loads on public marketing pages", () => {
  for (const p of ["/", "/tools/", "/tools/bracket/", "/guides/", "/guides/how-to-run-a-bgmi-tournament/", "/compare/", "/about/", "/contact/", "/privacy/", "/terms/"]) assert.equal(gtmAllowed(p), true, p);
});

test("the tag never loads in the app, sign-in, or on pages whose address can hold a private link", () => {
  for (const p of ["/app/", "/app/events/", "/login/", "/signup/", "/forgot-password/", "/reset-password/", "/live/x/", "/display/", "/overlay/x/", "/embed/x/", "/score/", "/report/", "/ready/", "/run/", "/unsubscribe/", "/join/", "/pass/", "/register/", "/team/x/", "/league/x/", "/tournaments/", "/admin/"]) assert.equal(gtmAllowed(p), false, p);
});

test("a prefix that merely starts the same does not match", () => {
  assert.equal(gtmAllowed("/toolsx/"), false);
  assert.equal(gtmAllowed("/guidesecret/"), false);
});

test("the container id is the one the owner supplied", () => assert.equal(GTM_ID, "GTM-MD3J4FKT"));

/**
 * Runs the head loader the way a browser would. Nothing is added when it first runs: the tags wait for a first interaction or a 4 s timer.
 * The returned object lets a test play those moments: interact() is a scroll, tap or key press, wait() is the 4 s after the page loaded.
 */
function runBoot(path, nav = {}, host = "esports.streamerosai.com") {
  const added = [];
  const handlers = {};
  const timers = [];
  const win = {
    clarity: undefined,
    location: { pathname: path, hostname: host },
    navigator: { doNotTrack: "0", ...nav },
    addEventListener: (e, f) => { (handlers[e] = handlers[e] || []).push(f); },
    removeEventListener: (e, f) => { handlers[e] = (handlers[e] || []).filter((x) => x !== f); },
  };
  const doc = { head: { appendChild: (s) => added.push(s.src) }, createElement: () => ({}), readyState: "complete" };
  new Function("location", "navigator", "window", "document", "setTimeout", GTM_BOOT)(win.location, win.navigator, win, doc, (f) => timers.push(f));
  return {
    added, win, handlers, timers,
    armed: () => Object.values(handlers).some((l) => l.length > 0) || timers.length > 0,
    interact: (e = "scroll") => { for (const f of [...(handlers[e] || [])]) f(); },
    wait: () => { for (const f of timers.splice(0)) f(); },
  };
}

const TAGS = [`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`, `https://www.clarity.ms/tag/${CLARITY_ID}?ref=bwt`];

test("the head loader loads nothing at first, so the tags do not compete with the page", () => {
  for (const p of ["/", "/tools/bracket/", "/guides/x/"]) assert.deepEqual(runBoot(p).added, [], p);
});

test("the head loader loads the container on the first scroll, tap, key press or pointer press", () => {
  for (const e of ["scroll", "touchstart", "keydown", "pointerdown"]) assert.deepEqual((() => { const r = runBoot("/"); r.interact(e); return r.added; })(), TAGS, e);
});

test("the head loader loads the container 4 seconds after the page loaded when nobody interacts", () => {
  const r = runBoot("/tools/bracket/");
  assert.equal(r.timers.length, 1);
  r.wait();
  assert.deepEqual(r.added, TAGS);
});

test("an interaction and the timer together load the tags once", () => {
  const r = runBoot("/");
  r.interact("scroll");
  r.wait();
  r.interact("scroll");
  assert.equal(r.added.length, 2);
  assert.equal(r.win.__gtmOn, true);
});

test("the head loader stays off for private pages and for opt-outs", () => {
  for (const p of ["/app/", "/live/x/", "/login/", "/score/", "/pass/"]) { const r = runBoot(p); assert.equal(r.armed(), false, p); r.interact(); r.wait(); assert.equal(r.added.length, 0, p); }
  for (const nav of [{ doNotTrack: "1" }, { globalPrivacyControl: true }]) { const r = runBoot("/", nav); assert.equal(r.armed(), false); r.interact(); r.wait(); assert.equal(r.added.length, 0); }
});

test("a visitor who walks into a private page before the tags load never gets them there", () => {
  const r = runBoot("/");
  r.win.location.pathname = "/app/events/";
  r.interact();
  r.wait();
  assert.equal(r.added.length, 0);
  assert.notEqual(r.win.__gtmOn, true);
});

test("arming again from a private page into a public one (the in-app link) starts the same wait", () => {
  const r = runBoot("/login/");
  assert.equal(r.armed(), false);
  r.win.location.pathname = "/tools/";
  r.win.__gtmArm();
  assert.deepEqual(r.added, []);
  r.interact("pointerdown");
  assert.deepEqual(r.added, TAGS);
});

test("the head loader and gtmAllowed agree on every path", () => {
  for (const p of ["/", "/tools/", "/guides/x/", "/compare/", "/about/", "/contact/", "/privacy/", "/terms/", "/points-table/", "/app/", "/live/x/", "/toolsx/", "/login/"]) { const r = runBoot(p); r.interact(); assert.equal(r.added.length > 0, gtmAllowed(p), p); }
});

test("the head loader never runs on localhost, previews or any other host", () => {
  for (const h of ["localhost", "127.0.0.1", "esports-frontend.pages.dev", "yaseenyk.github.io", "esports.streamerosai.com.evil.example", "streamerosai.com"]) { const r = runBoot("/", {}, h); r.interact(); r.wait(); assert.equal(r.added.length, 0, h); }
});

test("analytics tags run only on the real website (local runs and tests must not count as visitors)", () => {
  assert.equal(tagHostAllowed("esports.streamerosai.com"), true);
  for (const h of ["localhost", "127.0.0.1", "0.0.0.0", "192.168.1.5", "preview.example.com", "esports.streamerosai.com.evil.test", ""]) assert.equal(tagHostAllowed(h), false, h);
});
