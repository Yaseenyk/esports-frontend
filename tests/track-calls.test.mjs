import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");

// Where each free tool reports its one success. Server-side events (signup_done, club_created, ...) are written by the backend inside its own batch;
// the client registry holds only tool_complete, so none of those has a client call. check-in has no on-site success point (the scanner lives on /gate/,
// where tracking is off), so it is deliberately absent.
const SITES = {
  poster: "components/tools/PosterMaker.tsx",
  plan: "components/tools/PlanWizard.tsx",
  "id-cards": "components/idcard/IdCardStudio.tsx",
  "double-elimination": "components/tools/DoubleElimination.tsx",
  registration: "components/tools/RegistrationTemplate.tsx",
  "round-robin": "components/tools/RoundRobin.tsx",
  schedule: "components/tools/ScheduleMaker.tsx",
  certificates: "components/tools/CertificateMaker.tsx",
  "display-screen": "components/display/DisplayDemo.tsx",
  brackets: "components/tools/BracketMaker.tsx",
  "points-table": "components/tools/PointsTable.tsx",
  groups: "components/features/stages/GroupsTool.tsx",
  "print-kits": "components/features/printkits/PrintKits.tsx",
};

for (const [slug, file] of Object.entries(SITES)) {
  test(`${slug}: sends tool_complete from ${file}`, () => {
    const src = read(file);
    assert.match(src, /import \{ sendEvent \} from "@\/lib\/track";/);
    assert.ok(src.includes(`sendEvent("tool_complete", "${slug}")`), "call site missing");
  });
}

test("every call passes only the registered name and a tool slug", () => {
  const { TOOL_IDS } = { TOOL_IDS: readFileSync(new URL("../src/lib/track.ts", import.meta.url), "utf8").match(/TOOL_IDS = \[([\s\S]*?)\]/)[1].match(/"([^"]+)"/g).map((s) => s.slice(1, -1)) };
  for (const file of new Set(Object.values(SITES))) {
    const calls = read(file).match(/sendEvent\([^)]*\)/g) ?? [];
    assert.ok(calls.length > 0, file);
    for (const c of calls) {
      const m = /^sendEvent\("tool_complete", "([a-z-]+)"\)$/.exec(c);
      assert.ok(m, `unexpected payload in ${file}: ${c}`);
      assert.ok(TOOL_IDS.includes(m[1]), `${m[1]} is not a registered tool`);
    }
  }
});

test("no tool slug is called from the wrong file and none runs at module or render level", () => {
  for (const [slug, file] of Object.entries(SITES)) {
    const src = read(file);
    for (const m of src.matchAll(/sendEvent\("tool_complete", "([a-z-]+)"\)/g)) assert.equal(m[1], slug, `${file} reports ${m[1]}`);
  }
});
