// Tells IndexNow search engines (Bing, Yandex and others; Google does not use it) which pages are new or changed.
// Run after a deploy. By default it submits only pages whose source changed in the last commit. FORCE=1 submits every page in the sitemap.
// The key is public by design: it is published at /<key>.txt so the engines can check that the site is ours.
import { execSync } from "node:child_process";
import fs from "node:fs";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://esports.streamerosai.com";
const HOST = new URL(SITE).host;
const keyFile = fs.readdirSync("public").find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) { console.log("No IndexNow key file in public/; nothing to do."); process.exit(0); }
const KEY = keyFile.replace(".txt", "");

// The live sitemap, because this runs after the deploy.
const sitemap = await (await fetch(`${SITE}/sitemap.xml`)).text();
const all = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
// A scheduled guide goes live on its date with no commit of its own, so its sitemap lastmod is the only sign. Submit those too.
const todayUtc = new Date().toISOString().slice(0, 10);
const liveToday = [...sitemap.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)].filter((m) => m[2].slice(0, 10) === todayUtc && m[1].includes("/guides/")).map((m) => m[1]);

let urls;
if (process.env.FORCE === "1") urls = all;
else {
  let changed = [];
  try { changed = execSync("git diff --name-only HEAD^ HEAD", { encoding: "utf8" }).split("\n").filter(Boolean); } catch { changed = []; }
  const set = new Set();
  for (const f of changed) {
    if (f === "src/content/guides.ts") all.filter((u) => u.includes("/guides/")).forEach((u) => set.add(u));
    else if (f === "src/lib/tool-pages.ts" || f === "src/lib/data.ts" || f.startsWith("src/components/tools/") || f.startsWith("src/components/seo/ToolLanding")) all.filter((u) => u.includes("/tools/")).forEach((u) => set.add(u));
    else if (f === "src/app/(site)/page.tsx") set.add(`${SITE}/`);
    else { const m = /^src\/app\/\(site\)\/([a-z0-9-/]+)\/page\.tsx$/.exec(f.replace(/\\/g, "/")); if (m) set.add(`${SITE}/${m[1]}/`); }
  }
  liveToday.forEach((u) => set.add(u));
  urls = [...set].filter((u) => all.includes(u));
}
if (!urls.length) { console.log("No indexable pages changed in this commit."); process.exit(0); }
console.log(`Submitting ${urls.length} URL(s) to IndexNow:\n  ${urls.join("\n  ")}`);
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST", headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: urls }),
});
console.log(`IndexNow answered HTTP ${res.status}`); // 200 or 202 means accepted
