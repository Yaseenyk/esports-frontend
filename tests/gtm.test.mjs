import test from "node:test";
import assert from "node:assert/strict";
import { gtmAllowed, GTM_ID, CLARITY_ID, GTM_BOOT } from "../src/lib/gtm.ts";

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

/** Runs the head loader the way a browser would, and returns how many scripts it added. */
function runBoot(path, nav = {}, host = "esports.streamerosai.com") {
  const added = [];
  const win = { clarity: undefined, location: { pathname: path, hostname: host }, navigator: { doNotTrack: "0", ...nav } };
  const doc = { head: { appendChild: (s) => added.push(s.src) }, createElement: () => ({}) };
  new Function("location", "navigator", "window", "document", GTM_BOOT)(win.location, win.navigator, win, doc);
  return added;
}

test("the head loader really loads the container on a marketing page", () => {
  assert.deepEqual(runBoot("/"), [`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`, `https://www.clarity.ms/tag/${CLARITY_ID}?ref=bwt`]);
  assert.equal(runBoot("/tools/bracket/").length, 2);
});

test("the head loader stays off for private pages and for opt-outs", () => {
  for (const p of ["/app/", "/live/x/", "/login/", "/score/", "/pass/"]) assert.equal(runBoot(p).length, 0, p);
  assert.equal(runBoot("/", { doNotTrack: "1" }).length, 0);
  assert.equal(runBoot("/", { globalPrivacyControl: true }).length, 0);
});

test("the head loader and gtmAllowed agree on every path", () => {
  for (const p of ["/", "/tools/", "/guides/x/", "/compare/", "/about/", "/contact/", "/privacy/", "/terms/", "/points-table/", "/app/", "/live/x/", "/toolsx/", "/login/"]) assert.equal(runBoot(p).length > 0, gtmAllowed(p), p);
});

test("the head loader never runs on localhost, previews or any other host", () => {
  for (const h of ["localhost", "127.0.0.1", "esports-frontend.pages.dev", "yaseenyk.github.io", "esports.streamerosai.com.evil.example", "streamerosai.com"]) assert.equal(runBoot("/", {}, h).length, 0, h);
});
