// Second half of `npm run build`. Deletes the placeholder tournament route that exists only to satisfy Next's "export needs at least one
// static param" rule (see src/features/tournaments/services/build-data.ts). After this, an API-off build contains no tournament page.
import fs from "node:fs";
import path from "node:path";

let removed = 0;
for (const top of ["tournaments", "colleges", "players"]) {
  const dir = path.resolve("out", top);
  if (!fs.existsSync(dir)) continue;
  for (const name of fs.readdirSync(dir)) {
    if (name === "__none__" || name.startsWith("__none__.")) { fs.rmSync(path.join(dir, name), { recursive: true, force: true }); removed++; }
  }
}
console.log(`prune-v3: removed ${removed} placeholder entr${removed === 1 ? "y" : "ies"}`);

// The OBS overlay kit is behind NEXT_PUBLIC_OVERLAY_KIT (src/features/overlay-kit/flag.ts). With the flag off (the production default until
// the owner switches it on), its pages are not part of the site: delete them, so the live build neither serves nor links them.
const kitOn = ["1", "true", "on"].includes(process.env.NEXT_PUBLIC_OVERLAY_KIT ?? "");
const kitDir = path.resolve("out", "overlay-kit");
if (!kitOn && fs.existsSync(kitDir)) { fs.rmSync(kitDir, { recursive: true, force: true }); console.log("prune-v3: overlay kit flag off, removed /overlay-kit/"); }
else console.log(`prune-v3: overlay kit ${kitOn ? "on, pages kept" : "off, nothing to remove"}`);
