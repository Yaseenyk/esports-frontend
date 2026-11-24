// Part of `npm run build`, after prune-v3. The root layout is shared by every page and says <html lang="en">. The Portuguese (Brazil)
// pages under out/pt-br/ get lang="pt-BR" here, so the static HTML that browsers, Google Translate and search engines read is right
// from the first byte. (src/components/HtmlLang.tsx sets the same value after a move inside the site.)
import fs from "node:fs";
import path from "node:path";

const root = path.resolve("out", "pt-br");
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
let n = 0;
for (const f of fs.existsSync(root) ? walk(root).filter((x) => x.endsWith(".html")) : []) {
  const html = fs.readFileSync(f, "utf8");
  const next = html.replace(/<html lang="en"/, '<html lang="pt-BR"');
  if (next === html) { console.error(`set-lang: no <html lang="en"> in ${f}`); process.exit(1); }
  fs.writeFileSync(f, next); n++;
}
console.log(`set-lang: ${n} page${n === 1 ? "" : "s"} set to pt-BR`);
