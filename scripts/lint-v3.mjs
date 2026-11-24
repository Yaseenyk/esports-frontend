// Enforces the v3 rules from CLAUDE.md on NEW code only (legacy files are grandfathered):
//   1. no arbitrary Tailwind values  (text-[#123456], p-[13px], data-[state=open]:...)
//   2. no relative parent imports     (from "../x"); use the @/ alias
//   3. Trinity: ui/ and hooks/ never call fetch; ui/ never imports services/ or lib/api
// Run: node scripts/lint-v3.mjs        Exit 1 if anything is found. Exit 0 when there is no v3 code yet.
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const V3 = [
  "src/features",
  "src/app/(site)/tournaments", "src/app/(site)/colleges", "src/app/(site)/games", "src/app/(site)/cities",
  "src/app/(site)/players", "src/app/(site)/teams", "src/app/(site)/lft", "src/app/(site)/scrims",
  "src/app/(app)/app/resume", "src/app/(app)/app/lft", "src/app/(app)/app/scrims", "src/app/(app)/app/teams", "src/app/(app)/app/tournaments", "src/app/(app)/app/disputes", "src/app/(app)/app/discord",
];
const ARBITRARY = /(?<![\w$.\]])[a-z][a-z0-9-]*-\[[^\]\s]+\]/g; // utility-[value]; a TS index like arr[0] has no hyphen before the bracket
const REL_PARENT = /(?:from|import)\s*\(?\s*["']\.\.\//g;
const FETCH = /\bfetch\s*\(/;

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

const problems = [];
let files = 0;
for (const base of V3) {
  for (const file of walk(join(ROOT, base))) {
    files++;
    const rel = relative(ROOT, file).split(sep).join("/");
    const lines = readFileSync(file, "utf8").split(/\r?\n/);
    lines.forEach((line, i) => {
      const at = `${rel}:${i + 1}`;
      if (/^\s*(\/\/|\*|\/\*)/.test(line)) return; // comments may name the forbidden patterns
      for (const m of line.matchAll(ARBITRARY)) problems.push(`${at}: arbitrary Tailwind value "${m[0]}"`);
      if (REL_PARENT.test(line)) problems.push(`${at}: relative parent import (use the @/ alias)`);
      REL_PARENT.lastIndex = 0;
      if (/\/(ui|hooks)\//.test(rel) && FETCH.test(line)) problems.push(`${at}: fetch() in ${rel.includes("/ui/") ? "ui" : "hooks"} (only services/ and lib/api call the network)`);
      if (/\/ui\//.test(rel) && /from\s+["']@\/(lib\/api|features\/[^"']+\/services)/.test(line)) problems.push(`${at}: ui imports the data layer (go through a hook)`);
    });
  }
}
if (problems.length) {
  console.error(`lint-v3: ${problems.length} problem(s) in ${files} file(s)\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log(`lint-v3: OK (${files} v3 file(s) checked${files ? "" : "; no v3 code yet"})`);
