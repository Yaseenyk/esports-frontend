// The two additions to the shared API client for v3: a raw-body POST (evidence upload) and an authenticated blob GET (evidence download).
import test from "node:test";
import assert from "node:assert/strict";
import { createClient, ApiError } from "../src/lib/api/client.ts";
import { toFailure, explainFailure } from "../src/features/shared/failure.ts";
import { qs } from "../src/features/shared/services/v3-api.ts";

const res = (status, body, extra = {}) => ({ ok: status >= 200 && status < 300, status, headers: { get: () => null }, json: async () => body, blob: async () => extra.blob });
const rig = (handler) => { const calls = []; const client = createClient({ base: "https://api.test", token: () => "tok", sleep: async () => {}, fetchImpl: async (url, init) => { calls.push({ url, init }); return handler(url, init); } }); return { client, calls }; };

test("postRaw sends the bytes as the body with the bearer token and no JSON encoding", async () => {
  const { client, calls } = rig(() => res(201, { id: "ev1" }));
  const blob = new Blob([new Uint8Array([1, 2, 3])], { type: "image/webp" });
  const out = await client.postRaw("/v3/disputes/d1/evidence?caption=x", blob);
  assert.deepEqual(out, { id: "ev1" });
  assert.equal(calls[0].init.method, "POST");
  assert.equal(calls[0].init.body, blob);
  assert.equal(calls[0].init.headers.authorization, "Bearer tok");
  assert.equal(calls[0].init.headers["content-type"], "application/octet-stream");
});

test("postRaw keeps the server's code, and the failure maps to plain words", async () => {
  const { client } = rig(() => res(413, { error: "too big", code: "file_too_large" }));
  await assert.rejects(() => client.postRaw("/v3/disputes/d1/evidence", new Blob([1])), (e) => {
    assert.ok(e instanceof ApiError);
    assert.equal(e.status, 413);
    assert.equal(e.detail.code, "file_too_large");
    assert.match(explainFailure(toFailure(e)), /400 KB/);
    return true;
  });
});

test("postRaw is never retried", async () => {
  const { client, calls } = rig(() => res(503, { error: "off", code: "temporarily_disabled" }));
  await assert.rejects(() => client.postRaw("/v3/disputes/d1/evidence", new Blob([1])));
  assert.equal(calls.length, 1);
});

test("getBlob returns the bytes and sends the bearer token", async () => {
  const blob = new Blob([new Uint8Array([9])], { type: "image/png" });
  const { client, calls } = rig(() => res(200, null, { blob }));
  assert.equal(await client.getBlob("/v3/disputes/d1/evidence/e1"), blob);
  assert.equal(calls[0].init.headers.authorization, "Bearer tok");
});

test("getBlob: a purged image is a 410 the screen can name", async () => {
  const { client } = rig(() => res(410, { error: "gone", code: "evidence_purged" }));
  await assert.rejects(() => client.getBlob("/v3/disputes/d1/evidence/e1"), (e) => e.status === 410 && e.detail.code === "evidence_purged");
});

test("qs leaves out empty values and turns true into 1", () => {
  assert.equal(qs({ a: "x", b: "", c: undefined, d: true, e: false, f: 0 }), "?a=x&d=1&f=0");
  assert.equal(qs({}), "");
});
