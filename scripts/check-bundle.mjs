// Bundle budget. Run after a build: `npm run check:bundle`. Not part of `npm run build`.
// Reads the static export in ./out (or .next/ as a fallback), adds up the JavaScript each key page loads first, gzipped,
// and fails when a page is over its budget or a non-admin chunk contains an admin module.
// Update BUDGETS deliberately: record the new size in the same commit that grows it (blueprint F0: more than 10 KB gzip growth needs a reason).
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join, resolve } from "node:path";

const ROOT = resolve(process.argv[2] ?? ".");
const OUT = join(ROOT, "out");
const KB = 1024;

// gzip bytes of first-load JS per page. Measured 12 Nov 2026: /app 189.0 KB, /app/events 203.6 KB; budget = measured + 10 KB (rounded up).
const BUDGETS = JSON.parse(process.env.BUNDLE_BUDGETS ?? "null") ?? {
  "app/index.html": 200 * KB,
  "app/events/index.html": 214 * KB,
};
const ADMIN_MARKERS = ["/admin/v1", "admin-console"];

const htmlPath = (page) => join(OUT, page);
const scripts = (html) => [...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map((m) => m[1].split("?")[0]);

function fail(msg) { console.error(`check:bundle FAIL: ${msg}`); process.exitCode = 1; }

if (!existsSync(OUT)) { console.error("check:bundle: no ./out folder. Run `npm run build` first."); process.exit(2); }

for (const [page, budget] of Object.entries(BUDGETS)) {
  const file = htmlPath(page);
  if (!existsSync(file)) { fail(`${page} is missing from out/`); continue; }
  const srcs = [...new Set(scripts(readFileSync(file, "utf8")))];
  let total = 0;
  for (const s of srcs) {
    const f = join(OUT, s.replace(/^\//, ""));
    if (!existsSync(f)) { fail(`${page} references ${s} but it is not in out/`); continue; }
    total += gzipSync(readFileSync(f)).length;
  }
  const line = `${page}: ${(total / KB).toFixed(1)} KB gzip of ${(budget / KB).toFixed(0)} KB (${srcs.length} scripts)`;
  if (total > budget) fail(`${line} is over budget`); else console.log(`ok   ${line}`);
}

// No admin module in a chunk the public app loads. Admin code must live in its own route's chunks.
const chunkDir = join(OUT, "_next", "static", "chunks");
if (existsSync(chunkDir)) {
  const publicSrcs = new Set();
  for (const page of Object.keys(BUDGETS)) { const f = htmlPath(page); if (existsSync(f)) scripts(readFileSync(f, "utf8")).forEach((s) => publicSrcs.add(s.replace(/^\//, ""))); }
  for (const s of publicSrcs) {
    const f = join(OUT, s);
    if (!existsSync(f)) continue;
    const text = readFileSync(f, "utf8");
    for (const m of ADMIN_MARKERS) if (text.includes(m)) fail(`${s} (loaded by the public app) contains the admin marker "${m}"`);
  }
}
if (!process.exitCode) console.log("check:bundle: within budget");
