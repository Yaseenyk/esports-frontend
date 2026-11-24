// Checks the built site in ./out the way a search engine would read it. Run after `npm run build`. Exits 1 on any problem.
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve("out");
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://esports.streamerosai.com";
const problems = [];
const bad = (page, msg) => problems.push(`${page}: ${msg}`);

// Pages that must stay out of search results (demo data, private screens, one-off links).
const NOINDEX = [/^\/games\//, /^\/events\//, /^\/communities\//, /^\/manage\//, /^\/arcade\//, /^\/login\//, /^\/signup\//, /^\/forgot-password\//, /^\/reset-password\//, /^\/app\//, /^\/gate\//, /^\/join\//, /^\/pass\//, /^\/register\//, /^\/display\//, /^\/live\//, /^\/overlay\//, /^\/embed\//, /^\/score\//, /^\/report\//, /^\/ready\//, /^\/run\//, /^\/league\//, /^\/lft\//, /^\/players\//, /^\/team\//, /^\/teams\//, /^\/scrims\//, /^\/unsubscribe\//, /^\/verify-email\//, /^\/admin\//, /^\/developers\//];
// Guides merged into a stronger guide (src/content/merged-guides.json): their pages stay for old links but must be noindex and out of the sitemap.
const MERGED_GUIDES = Object.keys(JSON.parse(fs.readFileSync(path.resolve("src/content/merged-guides.json"), "utf8")));
for (const slug of MERGED_GUIDES) NOINDEX.push(new RegExp(`^/guides/${slug}/$`));
// Portuguese (Brazil) pages stay noindex and out of the sitemap until a native reader approves them (PT_BR_REVIEWED in src/lib/pt-br.ts).
const PT_BR_REVIEWED = /export const PT_BR_REVIEWED = true;/.test(fs.readFileSync(path.resolve("src/lib/pt-br.ts"), "utf8"));
if (!PT_BR_REVIEWED) NOINDEX.push(/^\/pt-br\//);
// ---- v3: tournament pages are indexable only when the thin-page guard passed (see src/features/tournaments/seo/thin-page-guard.ts) ----
// The guard runs here too, from the TypeScript source, on the input each page shipped in its <script id="eh-guard">.
import ts from "typescript";
const guardSrc = fs.readFileSync(path.resolve("src/features/tournaments/seo/thin-page-guard.ts"), "utf8");
const guardJs = ts.transpileModule(guardSrc, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const guard = await import("data:text/javascript;base64," + Buffer.from(guardJs).toString("base64"));
const attr = (html, re) => { const m = re.exec(html); return m ? m[1] : null; };
const v3Indexable = new Map(); // "/tournaments/<slug>/" -> boolean, filled below
const isV3Tournament = (p) => /^\/tournaments\/[^/]+\/$/.test(p);
// ---- phase 5: /tournaments/ (the directory) is indexable ONLY with at least MIN upcoming public tournaments (AdSense: an almost empty list is thin) ----
const dirMin = Number(/export const MIN_UPCOMING_FOR_INDEX = (\d+);/.exec(fs.readFileSync(path.resolve("src/features/directory/domain.ts"), "utf8"))?.[1] ?? NaN);
if (!(dirMin >= 5)) problems.push(`src/features/directory/domain.ts: MIN_UPCOMING_FOR_INDEX must be at least 5 (found ${dirMin})`);
const dirFile = path.join(OUT, "tournaments", "index.html");
const dirInfo = (() => {
  if (!fs.existsSync(dirFile)) return null;
  const m = /<script type="application\/json" id="eh-directory">([\s\S]*?)<\/script>/.exec(fs.readFileSync(dirFile, "utf8"));
  try { return m ? JSON.parse(m[1]) : null; } catch { return null; }
})();
if (fs.existsSync(dirFile) && !dirInfo) problems.push("/tournaments/: missing or invalid eh-directory data");
if (dirInfo && dirInfo.indexable === true && !(dirInfo.upcoming >= dirMin)) problems.push(`/tournaments/: marked indexable with only ${dirInfo.upcoming} upcoming public tournaments (needs ${dirMin})`);
const isNoindexPath = (p) => {
  if (p === "/tournaments/") {
    if (!dirInfo || dirInfo.indexable !== true || !(dirInfo.upcoming >= dirMin)) return true; // legacy page, or too few upcoming tournaments
    return dirInfo.mode === "v3" ? ![...v3Indexable.values()].some(Boolean) : false; // the v3 index also needs one page that passed the guard
  }
  if (isV3Tournament(p)) return !v3Indexable.get(p);
  return NOINDEX.some((re) => re.test(p));
};

function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)])); }
const pages = walk(OUT).filter((f) => f.endsWith("index.html")).map((f) => ({ file: f, url: "/" + path.relative(OUT, path.dirname(f)).replace(/\\/g, "/") + "/" })).map((p) => ({ ...p, url: p.url === "//" ? "/" : p.url }));
const urlSet = new Set(pages.map((p) => p.url));
const v3Pages = [];
for (const p of pages.filter((q) => isV3Tournament(q.url))) {
  const html = fs.readFileSync(p.file, "utf8");
  const m = /<script type="application\/json" id="eh-guard">([\s\S]*?)<\/script>/.exec(html);
  let info = null;
  try { info = m ? JSON.parse(m[1]) : null; } catch { /* reported below */ }
  const robotsMeta = attr(html, /<meta name="robots" content="([^"]*)"/) ?? "";
  const indexable = !/noindex/.test(robotsMeta);
  v3Indexable.set(p.url, indexable);
  v3Pages.push({ ...p, html, info, indexable });
}

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const titles = new Map(), descs = new Map();
let indexable = 0;

for (const p of pages) {
  const html = fs.readFileSync(p.file, "utf8");
  const robots = attr(html, /<meta name="robots" content="([^"]*)"/);
  const noindex = !!robots && /noindex/.test(robots);
  const wantNoindex = isNoindexPath(p.url);
  if (p.url === "/404/") continue;
  if (wantNoindex && !noindex) bad(p.url, "should be noindex but is not");
  if (!wantNoindex && p.url !== "/_not-found/" && noindex) bad(p.url, `is noindex but should be indexed (${robots})`);
  if (wantNoindex || p.url === "/_not-found/" || p.url === "/404/") continue;
  indexable++;

  const title = decode(attr(html, /<title>([^<]*)<\/title>/) ?? "");
  const desc = decode(attr(html, /<meta name="description" content="([^"]*)"/) ?? "");
  const canon = attr(html, /<link rel="canonical" href="([^"]*)"/);
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (!title) bad(p.url, "no title"); else { if (title.length > 70) bad(p.url, `title too long (${title.length}): ${title}`); if (title.length < 15) bad(p.url, `title too short: ${title}`); (titles.get(title) ?? titles.set(title, []).get(title)).push(p.url); }
  if (!desc) bad(p.url, "no meta description"); else { if (desc.length < 70 || desc.length > 170) bad(p.url, `description length ${desc.length} (want 70 to 170)`); (descs.get(desc) ?? descs.set(desc, []).get(desc)).push(p.url); }
  if (!canon) bad(p.url, "no canonical"); else if (canon !== `${SITE}${p.url}`) bad(p.url, `canonical is ${canon}, expected ${SITE}${p.url}`);
  if (h1s !== 1) bad(p.url, `${h1s} h1 headings (want exactly 1)`);
  if (!/property="og:title"/.test(html)) bad(p.url, "no og:title");
  if (!/property="og:image"/.test(html)) bad(p.url, "no og:image");
  // English pages say lang="en"; the Brazilian Portuguese pages under /pt-br/ say lang="pt-BR".
  if (!(p.url.startsWith("/pt-br/") ? /<html lang="pt-BR"/ : /<html lang="en/).test(html)) bad(p.url, "html lang missing");

  const text = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const words = text.split(" ").length;
  if (words < 120 && !["/contact/", "/privacy/", "/terms/"].includes(p.url)) bad(p.url, `thin page: only about ${words} words of text`);
  for (const phrase of ["made-up", "sample data", "lorem ipsum", "coming soon", "not written yet", "prototype"]) if (text.toLowerCase().includes(phrase.toLowerCase())) bad(p.url, `contains placeholder wording: "${phrase}"`);
  // "TODO" is a code marker, so it is matched in capitals only: Portuguese "todo"/"todos" (all) is ordinary text.
  if (/TODO/.test(text)) bad(p.url, 'contains placeholder wording: "TODO"');

  for (const m of html.matchAll(/<img[^>]*>/g)) { if (!/alt=/.test(m[0])) bad(p.url, `image without alt: ${m[0].slice(0, 80)}`); if (!/loading="lazy"/.test(m[0]) && !/fetchPriority|fetchpriority/.test(m[0])) bad(p.url, `image that is not lazy-loaded: ${m[0].slice(0, 80)}`); }
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); } catch { bad(p.url, "invalid JSON-LD"); } }
  if (p.url.startsWith("/guides/") && p.url !== "/guides/" && !/"@type":"Article"/.test(html)) bad(p.url, "guide without Article structured data");

  for (const m of html.matchAll(/<a [^>]*href="(\/[^"#?]*)/g)) {
    const href = m[1];
    if (/\.(png|svg|webp|jpg|json|txt|xml|ico|js|css|woff2)$/.test(href) || href.startsWith("/_next")) continue;
    const norm = href.endsWith("/") ? href : href + "/";
    if (!urlSet.has(norm)) bad(p.url, `broken internal link ${href}`);
  }
}
for (const [t, urls] of titles) if (urls.length > 1) bad(urls.join(", "), `duplicate title: ${t}`);
for (const [d, urls] of descs) if (urls.length > 1) bad(urls.join(", "), `duplicate description: ${d.slice(0, 60)}...`);

// robots.txt and sitemap.xml agree with the pages
const robots = fs.readFileSync(path.join(OUT, "robots.txt"), "utf8");
if (/Disallow: \/\s*$/m.test(robots) && !/Allow: \//.test(robots)) bad("robots.txt", "blocks the whole site");
if (!/Sitemap: /.test(robots)) bad("robots.txt", "no Sitemap line");
const sm = fs.readFileSync(path.join(OUT, "sitemap.xml"), "utf8");
const smUrls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
for (const u of smUrls) {
  const p = u.replace(SITE, "");
  if (!urlSet.has(p)) bad("sitemap.xml", `lists a page that does not exist: ${u}`);
  if (isNoindexPath(p)) bad("sitemap.xml", `lists a noindex page: ${u}`);
}
for (const p of pages) if (!isNoindexPath(p.url) && !["/_not-found/", "/404/"].includes(p.url) && !smUrls.includes(`${SITE}${p.url}`)) bad("sitemap.xml", `missing indexable page ${p.url}`);

// ---- v3 checks ----
const jsonLdOf = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => { try { return JSON.parse(m[1]); } catch { return null; } }).filter(Boolean);
for (const v of v3Pages) {
  const events = jsonLdOf(v.html).filter((d) => d["@type"] === "SportsEvent");
  if (!v.info) { bad(v.url, "tournament page without its eh-guard data"); continue; }
  const verdict = guard.seoVerdict(v.info.input);
  if (v.indexable && !verdict.ready) bad(v.url, `indexable but the thin-page guard fails: ${verdict.failures.join(", ")}`);
  if (v.indexable && v.info.indexable !== true) bad(v.url, "indexable but the build did not mark it indexable");
  if (v.indexable) {
    if (events.length !== 1) bad(v.url, `expected exactly one SportsEvent JSON-LD, found ${events.length}`);
    for (const e of events) for (const k of ["name", "startDate", "location", "eventAttendanceMode", "eventStatus", "url", "image"]) if (!e[k]) bad(v.url, `SportsEvent missing ${k}`);
    if (events[0] && events[0].url !== `${SITE}${v.url}`) bad(v.url, "SportsEvent url differs from the canonical");
    if (!smUrls.includes(`${SITE}${v.url}`)) bad("sitemap.xml", `missing seo-ready tournament ${v.url}`);
  } else {
    if (events.length) bad(v.url, "SportsEvent JSON-LD on a page that is noindex (thin or held back)");
    if (smUrls.includes(`${SITE}${v.url}`)) bad("sitemap.xml", `lists a noindex tournament ${v.url}`);
  }
  const canon = attr(v.html, /<link rel="canonical" href="([^"]*)"/);
  if (canon !== `${SITE}${v.url}`) bad(v.url, `canonical is ${canon}`);
  if ((v.html.match(/<h1[\s>]/g) || []).length !== 1) bad(v.url, "tournament page must have exactly one h1");
  const png = path.join(OUT, v.url, "og.png");
  if (!fs.existsSync(png) || fs.readFileSync(png).subarray(1, 4).toString() !== "PNG") bad(v.url, "missing or invalid og.png card");
  if (!v.html.includes(`og:image" content="${SITE}${v.url}og.png"`)) bad(v.url, "og:image does not point at this tournament's card");
}
const idxEpochs = v3Pages.filter((v) => v.indexable && v.info).map((v) => v.info.input.publishedAt).filter(Number.isFinite);
if (guard.maxInAnyWeek(idxEpochs) > guard.WEEKLY_CAP) bad("tournaments", `more than ${guard.WEEKLY_CAP} newly indexable tournament pages in one week (${guard.maxInAnyWeek(idxEpochs)})`);
if (v3Pages.length) console.log(`v3: ${v3Pages.length} tournament page(s), ${v3Pages.filter((v) => v.indexable).length} indexable.`); else console.log("v3: no tournament pages emitted (API off or empty).");
if (v3Pages.length === 0 && pages.some((q) => q.url.startsWith("/tournaments/") && q.url !== "/tournaments/")) bad("tournaments", "tournament pages exist without eh-guard data");

console.log(`${pages.length} pages checked, ${indexable} indexable, ${smUrls.length} in the sitemap.`);
if (problems.length) { console.error(`\n${problems.length} SEO problem(s):\n- ` + problems.join("\n- ")); process.exit(1); }
console.log("SEO check passed.");
