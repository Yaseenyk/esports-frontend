// Checks the built site in ./out the way a search engine would read it. Run after `npm run build`. Exits 1 on any problem.
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve("out");
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://esports.streamerosai.com";
const problems = [];
const bad = (page, msg) => problems.push(`${page}: ${msg}`);

// Pages that must stay out of search results (demo data, private screens, one-off links).
const NOINDEX = [/^\/games\//, /^\/events\//, /^\/communities\//, /^\/manage\//, /^\/arcade\//, /^\/login\//, /^\/signup\//, /^\/forgot-password\//, /^\/reset-password\//, /^\/app\//, /^\/gate\//, /^\/join\//, /^\/pass\//, /^\/register\//, /^\/display\//, /^\/live\//, /^\/overlay\//, /^\/embed\//, /^\/score\//, /^\/report\//, /^\/ready\//, /^\/run\//, /^\/league\//, /^\/tournaments\//, /^\/team\//, /^\/unsubscribe\//, /^\/verify-email\//];
const isNoindexPath = (p) => NOINDEX.some((re) => re.test(p));

function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)])); }
const pages = walk(OUT).filter((f) => f.endsWith("index.html")).map((f) => ({ file: f, url: "/" + path.relative(OUT, path.dirname(f)).replace(/\\/g, "/") + "/" })).map((p) => ({ ...p, url: p.url === "//" ? "/" : p.url }));
const urlSet = new Set(pages.map((p) => p.url));

const attr = (html, re) => { const m = re.exec(html); return m ? m[1] : null; };
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
  if (!/<html lang="en/.test(html)) bad(p.url, "html lang missing");

  const text = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const words = text.split(" ").length;
  if (words < 120 && !["/contact/", "/privacy/", "/terms/"].includes(p.url)) bad(p.url, `thin page: only about ${words} words of text`);
  for (const phrase of ["made-up", "sample data", "lorem ipsum", "TODO", "coming soon", "not written yet", "prototype"]) if (text.toLowerCase().includes(phrase.toLowerCase())) bad(p.url, `contains placeholder wording: "${phrase}"`);

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

console.log(`${pages.length} pages checked, ${indexable} indexable, ${smUrls.length} in the sitemap.`);
if (problems.length) { console.error(`\n${problems.length} SEO problem(s):\n- ` + problems.join("\n- ")); process.exit(1); }
console.log("SEO check passed.");
