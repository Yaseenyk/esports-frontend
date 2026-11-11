import test from "node:test";
import assert from "node:assert/strict";
import { gtmAllowed, GTM_ID } from "../src/lib/gtm.ts";

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
