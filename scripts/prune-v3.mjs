// Second half of `npm run build`. Deletes the placeholder tournament route that exists only to satisfy Next's "export needs at least one
// static param" rule (see src/features/tournaments/services/build-data.ts). After this, an API-off build contains no tournament page.
import fs from "node:fs";
import path from "node:path";

const dir = path.resolve("out", "tournaments");
let removed = 0;
if (fs.existsSync(dir)) {
  for (const name of fs.readdirSync(dir)) {
    if (name === "__none__" || name.startsWith("__none__.")) { fs.rmSync(path.join(dir, name), { recursive: true, force: true }); removed++; }
  }
}
console.log(`prune-v3: removed ${removed} placeholder entr${removed === 1 ? "y" : "ies"}`);
