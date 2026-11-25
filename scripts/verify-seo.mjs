// Checks the built site in ./out the way a search engine would read it. Run after `npm run build`. Exits 1 on any problem.
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve("out");
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://esports.streamerosai.com";
const problems = [];
const bad = (page, msg) => problems.push(`${page}: ${msg}`);

// Pages that must stay out of search results (demo data, private screens, one-off links).
const NOINDEX = [/^\/games\//, /^\/events\//, /^\/communities\//, /^\/manage\//, /^\/arcade\//, /^\/login\//, /^\/signup\//, /^\/forgot-password\//, /^\/reset-password\//, /^\/app\//, /^\/gate\//, /^\/join\//, /^\/pass\//, /^\/register\//, /^\/display\//, /^\/live\//, /^\/overlay\//, /^\/embed\//, /^\/score\//, /^\/report\//, /^\/ready\//, /^\/run\//, /^\/league\//, /^\/lft\//, /^\/players\//, /^\/team\//, /^\/teams\//, /^\/scrims\//, /^\/unsubscribe\//, /^\/verify-email\//, /^\/admin\//, /^\/developers\//, /^\/overlay-kit\/live\//, /^\/p\//];
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
// ---- player pages: /players/<slug>/ is indexable only when the quality gate passed (src/features/profiles/seo/player-gate.ts); /players/view/ never ----
const gateSrc = fs.readFileSync(path.resolve("src/features/profiles/seo/player-gate.ts"), "utf8");
const playerGate = await import("data:text/javascript;base64," + Buffer.from(ts.transpileModule(gateSrc, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText).toString("base64"));
const playerIndexable = new Map(); // "/players/<slug>/" -> boolean
const isPlayerPage = (p) => /^\/players\/[^/]+\/$/.test(p) && p !== "/players/view/";
// ---- community: /trust/ always noindex; /calendar/ indexable only when its index rule passes (scripts/verify-community.mjs) ----
import { COMMUNITY_NOINDEX, calendarVerdict } from "./verify-community.mjs";
NOINDEX.push(...COMMUNITY_NOINDEX);
const calendar = calendarVerdict(OUT);
for (const msg of calendar.problems) bad("/calendar/", msg);
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
  if (p === "/calendar/") return !calendar.expectIndexable;
  if (p === "/tournaments/") {
    if (!dirInfo || dirInfo.indexable !== true || !(dirInfo.upcoming >= dirMin)) return true; // legacy page, or too few upcoming tournaments
    return dirInfo.mode === "v3" ? ![...v3Indexable.values()].some(Boolean) : false; // the v3 index also needs one page that passed the guard
  }
  if (isV3Tournament(p)) return !v3Indexable.get(p);
  if (isPlayerPage(p)) return !playerIndexable.get(p);
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

const playerPages = [];
for (const p of pages.filter((q) => isPlayerPage(q.url))) {
  const html = fs.readFileSync(p.file, "utf8");
  const m = /<script type="application\/json" id="eh-player">([\s\S]*?)<\/script>/.exec(html);
  let info = null;
  try { info = m ? JSON.parse(m[1]) : null; } catch { /* reported below */ }
  const indexable = !/noindex/.test(attr(html, /<meta name="robots" content="([^"]*)"/) ?? "");
  playerIndexable.set(p.url, indexable);
  playerPages.push({ ...p, html, info, indexable });
}

const PERSON_ID = "https://yk.streamerosai.com/#person";
const jsonLdOfPage = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((m) => { try { const d = JSON.parse(m[1]); return Array.isArray(d) ? d : d["@graph"] ?? [d]; } catch { return []; } });
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
  if (!title) bad(p.url, "no title"); else { if (title.length > 60) bad(p.url, `title too long (${title.length}, max 60; use pageTitle() from src/lib/schema.ts): ${title}`); if (title.length < 15) bad(p.url, `title too short: ${title}`); (titles.get(title) ?? titles.set(title, []).get(title)).push(p.url); }
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
  // Entities (src/lib/schema.ts): one Organization with sameAs, tools with @id + publisher + author, and the Person only referenced by @id.
  const nodes = jsonLdOfPage(html);
  const orgs = nodes.filter((d) => d["@type"] === "Organization");
  if (orgs.length !== 1 || orgs[0]["@id"] !== `${SITE}/#org` || !(orgs[0].sameAs ?? []).length) bad(p.url, `want exactly one Organization (${SITE}/#org) with sameAs, found ${orgs.length}`);
  for (const a of nodes.filter((d) => d["@type"] === "SoftwareApplication")) {
    if (a["@id"] !== `${SITE}${p.url}#app`) bad(p.url, `SoftwareApplication @id is ${a["@id"]}, expected ${SITE}${p.url}#app`);
    if (a.publisher?.["@id"] !== `${SITE}/#org` || a.author?.["@id"] !== PERSON_ID) bad(p.url, "SoftwareApplication without the Organization as publisher and the Person as author");
  }
  if (/"jobTitle"|"addressLocality"/.test(JSON.stringify(nodes.filter((d) => d["@type"] === "Person")))) bad(p.url, "the Person is redeclared with its own details; reference it by @id (the portfolio owns it)");
  // hreflang pairs only between indexable pages: a link to a noindex page is ignored and can drop the pair.
  for (const m of html.matchAll(/<link rel="alternate" hrefLang="([^"]+)" href="([^"]+)"/g)) {
    const target = m[2].replace(SITE, "");
    if (!urlSet.has(target)) bad(p.url, `hreflang ${m[1]} points at a missing page ${m[2]}`);
    else if (isNoindexPath(target)) bad(p.url, `hreflang ${m[1]} points at a noindex page ${m[2]}`);
  }

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
// Player pages: gate re-checked on what shipped, ProfilePage + BreadcrumbList, canonical, sitemap, and no personal or internal data in the HTML.
const PII = [
  [/[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,}/, "an email address"], [/(?<![\w/.-])(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}(?!\d)/, "a phone number"],
  [/\b[0-9a-f]{32}\b/, "a 32-character internal id"], [/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i, "a UUID"],
  [/\/p\/\?k=|"cardPath"|user_?id|"userId"|adultConfirmed|resumeConsent|\baadhaar\b|date of birth|\bdob\b/i, "a private field or card link"],
];
for (const v of playerPages) {
  if (!v.info) { bad(v.url, "player page without its eh-player data"); continue; }
  const failures = playerGate.playerGateFailures(v.info.input ?? {});
  if (failures.length) bad(v.url, `a player page was emitted for a profile that fails the gate: ${failures.join(", ")}`);
  const visibleText = v.html.replace(/<script[\s\S]*?<\/script>/g, " ");
  for (const [re, what] of PII) if (re.test(visibleText) || re.test(JSON.stringify(jsonLdOf(v.html)))) bad(v.url, `contains ${what}`);
  const canon = attr(v.html, /<link rel="canonical" href="([^"]*)"/);
  if (canon !== `${SITE}${v.url}`) bad(v.url, `canonical is ${canon}`);
  if ((v.html.match(/<h1[\s>]/g) || []).length !== 1) bad(v.url, "player page must have exactly one h1");
  const ld = jsonLdOf(v.html);
  const prof = ld.filter((d) => d["@type"] === "ProfilePage");
  if (v.indexable) {
    if (v.info.indexable !== true) bad(v.url, "indexable but the build did not mark it indexable");
    const title = decode(attr(v.html, /<title>([^<]*)<\/title>/) ?? "");
    if (title.length > 60) bad(v.url, `player page title longer than 60 characters: ${title}`);
    if (prof.length !== 1 || prof[0].mainEntity?.["@type"] !== "Person" || !prof[0].mainEntity?.name) bad(v.url, "needs exactly one ProfilePage whose mainEntity is a Person with a name");
    if (prof[0] && prof[0].url !== `${SITE}${v.url}`) bad(v.url, "ProfilePage url differs from the canonical");
    if (!ld.some((d) => d["@type"] === "BreadcrumbList")) bad(v.url, "no BreadcrumbList");
    if (!smUrls.includes(`${SITE}${v.url}`)) bad("sitemap.xml", `missing indexable player page ${v.url}`);
  } else {
    if (prof.length) bad(v.url, "ProfilePage JSON-LD on a noindex player page");
    if (smUrls.includes(`${SITE}${v.url}`)) bad("sitemap.xml", `lists a noindex player page ${v.url}`);
  }
}
const playerEpochs = playerPages.filter((v) => v.indexable).length;
if (playerEpochs > 0) console.log(`players: ${playerPages.length} pre-rendered page(s), ${playerEpochs} indexable.`); else console.log("players: no pre-rendered player pages (API off or none passed the gate).");
// The mock API (scripts/mock-v3-api.mjs) serves one profile that passes and one that fails: only the passing one may be built.
if (fs.existsSync(path.join(OUT, "players", "fixture-player-pass", "index.html")) && fs.existsSync(path.join(OUT, "players", "fixture-player-thin"))) bad("/players/fixture-player-thin/", "a profile that fails the gate was built");
// The card page and the shared-profile page always exist and are always noindex, nofollow.
for (const u of ["/p/", "/players/view/"]) {
  const f = path.join(OUT, ...u.split("/").filter(Boolean), "index.html");
  if (!fs.existsSync(f)) { bad(u, "missing from the build"); continue; }
  const h = fs.readFileSync(f, "utf8");
  if (!/<meta name="robots" content="noindex, nofollow"/.test(h)) bad(u, "must be noindex, nofollow");
  if (!/<meta name="referrer" content="no-referrer"/.test(h)) bad(u, "must send no referrer");
  if (smUrls.some((x) => x.startsWith(`${SITE}${u}`))) bad("sitemap.xml", `lists ${u}`);
}

const idxEpochs = v3Pages.filter((v) => v.indexable && v.info).map((v) => v.info.input.publishedAt).filter(Number.isFinite);
if (guard.maxInAnyWeek(idxEpochs) > guard.WEEKLY_CAP) bad("tournaments", `more than ${guard.WEEKLY_CAP} newly indexable tournament pages in one week (${guard.maxInAnyWeek(idxEpochs)})`);
console.log(calendar.present ? `community: calendar emitted, ${calendar.count ?? 0} upcoming verified, ${calendar.expectIndexable ? "indexable" : "noindex"}.` : "community: no calendar page emitted (flag off).");
if (v3Pages.length) console.log(`v3: ${v3Pages.length} tournament page(s), ${v3Pages.filter((v) => v.indexable).length} indexable.`); else console.log("v3: no tournament pages emitted (API off or empty).");
if (v3Pages.length === 0 && pages.some((q) => q.url.startsWith("/tournaments/") && q.url !== "/tournaments/")) bad("tournaments", "tournament pages exist without eh-guard data");

// The points table pages (25 Nov 2026). The calculators render in the browser only, so everything an assistant or a search engine needs to trust
// the page must be in the static HTML around them: the h1, what it calculates, the scoring rules it really uses, who runs it, the "Safe to use"
// box and the FAQ, with exactly one FAQPage that matches the visible questions and answers, a Person linked from the SoftwareApplication, no ratings.
const TRUST_PAGES = {
  "/points-table/free-fire/": "1st 10, 2nd 6", "/points-table/bgmi/": "1st 10, 2nd 6", "/points-table/cod-mobile/": "1st 15, 2nd 12",
  "/points-table/valorant/": "3 for a match win", "/tools/points-table/": "1st 10, 2nd 6", "/pt-br/points-table/free-fire/": "1º 10, 2º 6",
};
const visible = (html) => decode(html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ");
const block = (html, testid) => { const m = new RegExp(`<(section|aside|p)[^>]*data-testid="${testid}"[^>]*>([\\s\\S]*?)</\\1>`).exec(html); return m ? m[2] : null; };
for (const [u, rule] of Object.entries(TRUST_PAGES)) {
  const file = path.join(OUT, ...u.split("/").filter(Boolean), "index.html");
  if (!fs.existsSync(file)) { bad(u, "points table page missing from the build"); continue; }
  const html = fs.readFileSync(file, "utf8"), text = visible(html);
  const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html);
  if (!h1 || visible(h1[1]).trim().length < 10) bad(u, "no h1 text in the static HTML");
  const who = block(html, "who-runs");
  if (!who || !/Yaseen Khatib/.test(who) || !who.includes('href="https://yk.streamerosai.com/"') || !who.includes('href="https://www.linkedin.com/in/yaseen-yk"')) bad(u, "the 'who runs this' line with the portfolio and LinkedIn links is missing");
  const rules = block(html, "scoring-rules");
  if (!rules) bad(u, "the scoring rules are missing from the static HTML");
  else {
    const lead = /<p[^>]*>([\s\S]*?)<\/p>/.exec(rules);
    if (!lead || (visible(lead[1]).match(/[.!?](\s|$)/g) ?? []).length < 2) bad(u, "the scoring rules need a description of at least two sentences");
    if ((rules.match(/<li[\s>]/g) ?? []).length < 3) bad(u, "the scoring rules list is too short");
    if (!visible(rules).includes(rule)) bad(u, `the scoring rules do not state the calculator's starting points ("${rule}")`);
  }
  const safe = block(html, "safe-to-use");
  if (!safe || (safe.match(/<li[\s>]/g) ?? []).length < 5) bad(u, "the 'Safe to use' box is missing or incomplete");
  const ld = jsonLdOf(html).flatMap((d) => (Array.isArray(d) ? d : d["@graph"] ?? [d]));
  const faqs = ld.filter((d) => d["@type"] === "FAQPage");
  if (faqs.length !== 1) bad(u, `${faqs.length} FAQPage blocks (want exactly 1)`);
  else {
    const qs = faqs[0].mainEntity ?? [];
    const faqSection = /<section[^>]*aria-labelledby="faq"[^>]*>([\s\S]*?)<\/section>/.exec(html);
    const shown = faqSection ? (faqSection[1].match(/<details[\s>]/g) ?? []).length : 0;
    if (shown !== qs.length) bad(u, `FAQPage has ${qs.length} questions but the page shows ${shown}`);
    for (const q of qs) {
      if (!text.includes(q.name)) bad(u, `FAQ question not visible on the page: ${q.name}`);
      if (!text.includes(q.acceptedAnswer?.text ?? "\u0000")) bad(u, `FAQ answer not visible on the page: ${q.name}`);
    }
  }
  if (ld.some((d) => d["@type"] === "Person")) bad(u, "a Person node is declared; the points table pages reference the portfolio's Person by @id only");
  const app = ld.find((d) => d["@type"] === "SoftwareApplication" || d["@type"] === "WebApplication");
  if (!app || app.author?.["@id"] !== PERSON_ID || app.creator?.["@id"] !== PERSON_ID || app.offers?.price !== "0" || app.isAccessibleForFree !== true) bad(u, "the SoftwareApplication must be free (price 0) and name the Person as author and creator");
  if (/"(aggregateRating|review|reviewRating)"/.test(JSON.stringify(ld))) bad(u, "ratings or reviews in structured data");
}

// The OBS overlay kit flag (NEXT_PUBLIC_OVERLAY_KIT): off means none of its pages may be in the build, and nothing may link to them.
const KIT_ON = ["1", "true", "on"].includes(process.env.NEXT_PUBLIC_OVERLAY_KIT ?? "");
if (!KIT_ON) {
  for (const p of pages) if (p.url.startsWith("/overlay-kit/")) bad(p.url, "overlay kit page in a build with the overlay kit flag off");
  for (const u of smUrls) if (u.includes("/overlay-kit/")) bad("sitemap.xml", `lists ${u} with the overlay kit flag off`);
  for (const p of pages) if (/href="\/overlay-kit\//.test(fs.readFileSync(p.file, "utf8"))) bad(p.url, "links to the overlay kit with its flag off");
}
// The 404 page carries exactly one robots tag, and it says noindex.
for (const f of ["404.html", path.join("404", "index.html")].map((x) => path.join(OUT, x)).filter((x) => fs.existsSync(x))) {
  const tags = fs.readFileSync(f, "utf8").match(/<meta name="robots"[^>]*>/g) ?? [];
  if (tags.length !== 1 || !/noindex/.test(tags[0])) bad(path.relative(OUT, f), `want one noindex robots tag, found ${tags.length}: ${tags.join(" ")}`);
}
// llms.txt and llms-full.txt: present, and every link in llms.txt is a real indexable page (or a file the site serves).
const llms = fs.existsSync(path.join(OUT, "llms.txt")) ? fs.readFileSync(path.join(OUT, "llms.txt"), "utf8") : "";
if (!llms) bad("llms.txt", "missing");
if (!fs.existsSync(path.join(OUT, "llms-full.txt")) || fs.statSync(path.join(OUT, "llms-full.txt")).size < 10000) bad("llms-full.txt", "missing or too small");
for (const m of llms.matchAll(/\]\((https?:\/\/[^)]+)\)/g)) {
  const p = m[1].replace(SITE, "");
  if (p.startsWith("http")) continue;
  if (/\.(txt|xml)$/.test(p)) { if (!fs.existsSync(path.join(OUT, p))) bad("llms.txt", `links to a missing file ${p}`); continue; }
  if (!urlSet.has(p)) bad("llms.txt", `links to a missing page ${p}`); else if (isNoindexPath(p)) bad("llms.txt", `links to a noindex page ${p}`);
}
console.log(`${pages.length} pages checked, ${indexable} indexable, ${smUrls.length} in the sitemap.`);
if (problems.length) { console.error(`\n${problems.length} SEO problem(s):\n- ` + problems.join("\n- ")); process.exit(1); }
console.log("SEO check passed.");
