import test from "node:test";
import assert from "node:assert/strict";

process.env.NEXT_PUBLIC_API_URL = "https://api.example.test";
const { sendEvent, trackingAllowed, beaconBody, resetTrackForTests, TOOL_IDS, TRACK_OFF_KEY } = await import("../src/lib/track.ts");
const { TOOL_PAGES } = await import("../src/lib/tool-pages.ts");

/** Installs a fake browser; returns what was sent. */
function browser({ path = "/tools/poster/", dnt, gpc, store = {}, beacon = true, throwing = false } = {}) {
  const beacons = [];
  const fetches = [];
  globalThis.window = { location: { pathname: path } };
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      doNotTrack: dnt, globalPrivacyControl: gpc,
      sendBeacon: beacon ? (url, blob) => { if (throwing) throw new Error("x"); beacons.push({ url, blob }); return true; } : undefined,
    },
  });
  globalThis.localStorage = { getItem: (k) => { if (throwing) throw new Error("denied"); return store[k] ?? null; } };
  globalThis.fetch = (url, init) => { fetches.push({ url, init }); return Promise.resolve({}); };
  resetTrackForTests();
  return { beacons, fetches };
}

test("a tool completion goes out once as a text/plain beacon to /public/t", async () => {
  const b = browser();
  sendEvent("tool_complete", "poster");
  sendEvent("tool_complete", "poster");
  assert.equal(b.beacons.length, 1);
  assert.equal(b.beacons[0].url, "https://api.example.test/public/t");
  assert.equal(b.beacons[0].blob.type.toLowerCase(), "text/plain;charset=utf-8");
  assert.equal(await b.beacons[0].blob.text(), '{"v":1,"e":"tool_complete","d":"poster"}');
  assert.equal(beaconBody("tool_complete", "plan"), '{"v":1,"e":"tool_complete","d":"plan"}');
});

test("falls back to fetch keepalive without credentials when sendBeacon is missing", () => {
  const b = browser({ beacon: false });
  sendEvent("tool_complete", "schedule");
  assert.equal(b.fetches.length, 1);
  assert.equal(b.fetches[0].init.keepalive, true);
  assert.equal(b.fetches[0].init.credentials, "omit");
  assert.equal(b.fetches[0].init.body, '{"v":1,"e":"tool_complete","d":"schedule"}');
});

test("Do Not Track, Global Privacy Control and the privacy-page switch send nothing", () => {
  for (const o of [{ dnt: "1" }, { gpc: true }, { store: { [TRACK_OFF_KEY]: "1" } }]) {
    const b = browser(o);
    sendEvent("tool_complete", "poster");
    assert.equal(b.beacons.length + b.fetches.length, 0, JSON.stringify(o));
  }
  const ok = browser({ dnt: "0", gpc: false });
  sendEvent("tool_complete", "poster");
  assert.equal(ok.beacons.length, 1);
});

test("never in the app or on private pages", () => {
  for (const p of ["/app/", "/app/events/", "/live/x/", "/login/", "/score/", "/pass/", "/join/", "/unsubscribe/", "/admin/"]) {
    const b = browser({ path: p });
    sendEvent("tool_complete", "poster");
    assert.equal(b.beacons.length + b.fetches.length, 0, p);
    assert.equal(trackingAllowed(p), false);
  }
});

test("only registered tool ids and the one event are sent", () => {
  const b = browser();
  sendEvent("tool_complete", "nope");
  sendEvent("tool_complete", "");
  sendEvent("signup_done", "poster");
  sendEvent("tool_complete", "poster?x=1");
  assert.equal(b.beacons.length, 0);
});

test("never throws, even when storage or the beacon API throws", () => {
  const b = browser({ throwing: true });
  assert.doesNotThrow(() => sendEvent("tool_complete", "poster"));
  assert.equal(b.beacons.length, 0);
  delete globalThis.window;
  assert.doesNotThrow(() => sendEvent("tool_complete", "poster"));
});

test("the tool id list is the keys of TOOL_PAGES", () => {
  assert.deepEqual([...TOOL_IDS].sort(), Object.keys(TOOL_PAGES).sort());
});
