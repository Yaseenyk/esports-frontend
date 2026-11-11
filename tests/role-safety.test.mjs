// Run: node --import tsx --test tests/role-safety.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { safeRole, isOwner, canEditRole, isKnownRole } from "../src/lib/role.ts";
import { PANELS, panelsFor } from "../src/components/app/panels.tsx";
import { normaliseContext } from "../src/lib/api/context.ts";
import { includeProblem } from "../src/lib/duplicate.ts";

const BAD = [undefined, null, "", "Owner", "admin", "superuser", 1, {}, ["owner"]];

test("a missing role is not owner", () => {
  for (const r of BAD) { assert.equal(isOwner(r), false, String(r)); assert.equal(safeRole(r), "viewer"); assert.equal(canEditRole(r), false); }
  assert.equal(isOwner("owner"), true);
  assert.equal(canEditRole("editor"), true);
  assert.equal(canEditRole("viewer"), false);
  assert.equal(isKnownRole("editor"), true);
});

test("an unknown role hides panels; known roles keep today's lists", () => {
  for (const r of BAD) assert.deepEqual(panelsFor(r), [], String(r));
  assert.equal(panelsFor("owner").length, PANELS.length);
  assert.equal(panelsFor("editor").length, PANELS.length);
  assert.ok(panelsFor("viewer").length > 0 && panelsFor("viewer").length < PANELS.length);
  assert.ok(panelsFor("viewer").every((p) => p.roles.includes("viewer")));
});

test("duplicate: a viewer-by-default role cannot bring people or members over", () => {
  const inc = { teams: true, people: true, members: false };
  assert.ok(includeProblem(inc, safeRole(undefined)));
  assert.equal(includeProblem(inc, safeRole("owner")), null);
});

test("context: unknown or missing roles in the server answer become viewer, never owner", () => {
  const c = normaliseContext({ user: { id: "u" }, orgs: [{ id: "o1", name: "A", kind: "personal" }, { id: "o2", role: "god", caps: ["x", 3] }, { id: "o3", role: "owner" }] });
  assert.deepEqual(c.orgs.map((o) => o.role), ["viewer", "viewer", "owner"]);
  assert.deepEqual(c.orgs[1].caps, ["x"]);
  assert.equal(c.user.emailVerified, false);
  assert.deepEqual(normaliseContext(null).orgs, []);
  assert.equal(normaliseContext(undefined).staff, null);
  assert.equal(normaliseContext({ features: { teamOrgs: "yes" } }).features.teamOrgs, false);
});
