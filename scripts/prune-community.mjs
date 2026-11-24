// Part of `npm run build` (after prune-v3). Deletes every built page that rendered only the community "off" marker
// (<script id="eh-prune-community">): /calendar/, /trust/ and /app/calendar/ while their backend flag (v3.calendar, v3.trust) was off at build time.
// After this an off build contains no community page at all. The marker id is PRUNE_MARKER_ID in src/features/community/services/build-data.ts.
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve("out");
const MARKER = 'id="eh-prune-community"';
const ROUTES = ["calendar", "trust", path.join("app", "calendar")];
let removed = 0;
for (const r of ROUTES) {
  const dir = path.join(OUT, r);
  const html = path.join(dir, "index.html");
  if (!fs.existsSync(html) || !fs.readFileSync(html, "utf8").includes(MARKER)) continue;
  fs.rmSync(dir, { recursive: true, force: true });
  for (const ext of [".txt", ".html"]) { const f = path.join(OUT, r + ext); if (fs.existsSync(f)) fs.rmSync(f, { force: true }); }
  removed++;
}
// Safety net: no other page may carry the marker (it would mean a page shipped half-empty).
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const left = fs.existsSync(OUT) ? walk(OUT).filter((f) => f.endsWith(".html") && fs.readFileSync(f, "utf8").includes(MARKER)) : [];
if (left.length) { console.error(`prune-community: marker left in ${left.map((f) => path.relative(OUT, f)).join(", ")}`); process.exit(1); }
console.log(`prune-community: removed ${removed} switched-off route${removed === 1 ? "" : "s"}`);
