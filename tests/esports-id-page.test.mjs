// The esports ID card maker page and its comparison guide: limits, honesty of the comparison, links, sitemap and routes.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { ESPORTS_PAGE, ESPORTS_PATH, COMPARISON_HEAD, COMPARISON_ROWS, WEAKER, CHECKED_ON, GUIDE_SLUG } from "../src/lib/esports-id-page.ts";
import { TOOL_PAGES } from "../src/lib/tool-pages.ts";
import { GROWTH_PAGES } from "../src/lib/growth-pages.ts";
import { GUIDES, guideBySlug } from "../src/content/guides.ts";
import { TOOLS } from "../src/lib/data.ts";

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const SUFFIX = " · Esports Hub".length;
const guide = guideBySlug(GUIDE_SLUG);
const gText = (g) => [g.title, g.description, g.answer ?? "", g.intro, ...g.sections.flatMap((s) => [s.h2, ...s.blocks.flatMap((b) => (b.t === "p" || b.t === "note" || b.t === "h3" ? [b.x] : b.t === "ul" || b.t === "ol" ? b.items : b.t === "table" ? [...b.head, ...b.rows.flat()] : []))]), ...(g.faq ?? []).flatMap((f) => [f.q, f.a])];

test("the esports page title is at most 60 characters with the site name, the description at most 155, and the h1 names the tool", () => {
  assert.ok(ESPORTS_PAGE.title.length + SUFFIX <= 60, `title is ${ESPORTS_PAGE.title.length + SUFFIX}`);
  assert.ok(ESPORTS_PAGE.description.length >= 70 && ESPORTS_PAGE.description.length <= 155, `description is ${ESPORTS_PAGE.description.length}`);
  assert.match(ESPORTS_PAGE.h1.toLowerCase(), /esports id card maker/);
  assert.ok(ESPORTS_PAGE.title.toLowerCase().includes("esports id card maker"));
});

test("the general ID card page now names esports, within the same title limit, and keeps its own description", () => {
  const t = TOOL_PAGES["id-cards"];
  assert.ok(t.title.length + SUFFIX <= 60, `title is ${t.title.length + SUFFIX}`);
  assert.match(t.title.toLowerCase(), /esports/);
  assert.match(t.h1.toLowerCase(), /esports/);
  assert.match(t.description.toLowerCase(), /esports/);
  assert.ok(t.description.length <= 160);
  assert.notEqual(t.description, ESPORTS_PAGE.description);
  assert.ok(t.related.some((r) => r.href === ESPORTS_PATH));
  assert.ok(t.guides.includes(GUIDE_SLUG));
});

test("the page has 4 HowTo steps, 6 FAQ answers of real depth, sample images with alt text and the sections the brief asks for", () => {
  assert.equal(ESPORTS_PAGE.steps.length, 4);
  assert.equal(ESPORTS_PAGE.howTo, true);
  assert.equal(ESPORTS_PAGE.faq.length, 6);
  for (const f of ESPORTS_PAGE.faq) { assert.ok(f.q.endsWith("?")); assert.ok(f.a.length >= 350 && f.a.length <= 900, `${f.q}: ${f.a.length}`); }
  const ids = ESPORTS_PAGE.sections.map((s) => s.id);
  for (const id of ["who", "bulk", "gate", "print", "privacy", "samples", "compare", "weaker"]) assert.ok(ids.includes(id), id);
  const imgs = ESPORTS_PAGE.sections.find((s) => s.id === "samples").images;
  assert.ok(imgs.length >= 3);
  for (const im of imgs) { assert.ok(im.alt.length > 40); assert.ok(fs.existsSync(new URL(`../public${im.src}`, import.meta.url)), im.src); }
  assert.ok(fs.existsSync(new URL(`../public${ESPORTS_PAGE.og}`, import.meta.url)));
});

test("the comparison states only the facts of the brief: one row per tool, every cell filled, a last-checked date and a weaker list", () => {
  assert.equal(CHECKED_ON, "15 Nov 2026");
  assert.deepEqual(COMPARISON_ROWS.map((r) => r[0].split(" (")[0]), ["Esports Hub", "Canva", "Template.net", "MuftTools", "Themiku", "BotCamp", "StyleNameLab", "IDCreator"]);
  for (const r of COMPARISON_ROWS) { assert.equal(r.length, COMPARISON_HEAD.length); assert.ok(r.every((c) => c.trim().length > 0)); }
  const canva = COMPARISON_ROWS.find((r) => r[0] === "Canva");
  assert.equal(canva.filter((c) => c === "Not checked").length, 4, "Canva's page could not be read, so almost everything is Not checked");
  assert.ok(COMPARISON_ROWS.find((r) => r[0] === "IDCreator")[1].startsWith("No"));
  for (const r of COMPARISON_ROWS.slice(1)) assert.ok(r[6].startsWith("No") || r[6].startsWith("Not checked"), `${r[0]} must not claim to be built for tournaments`);
  const text = WEAKER.join(" ").toLowerCase();
  for (const w of ["canva", "ai art", "shipping"]) assert.ok(text.includes(w), `weaker list should mention ${w}`);
  assert.match(ESPORTS_PAGE.sections.find((s) => s.id === "compare").paras[0], /Last checked 15 Nov 2026; check each site for current terms/);
});

test("no claim of rankings, users or results, and no unverified superlatives", () => {
  const all = JSON.stringify(ESPORTS_PAGE).toLowerCase() + gText(guide).join(" ").toLowerCase();
  for (const bad of ["#1", "number one", "most popular", "thousands of", "trusted by", " rated ", "testimonial", "guaranteed", "best in india"]) assert.ok(!all.includes(bad), `contains ${bad}`);
});

test("the guide is long, dated and honest: answer box, last checked, decision guide, design section, 6 FAQs", () => {
  assert.ok(guide, "guide exists");
  assert.equal(guide.published, "2026-11-15");
  assert.ok((guide.seoTitle ?? guide.title).length + SUFFIX <= 60, "tab title with suffix");
  assert.ok(guide.description.length >= 100 && guide.description.length <= 165, `description ${guide.description.length}`);
  const words = gText(guide).join(" ").split(/\s+/).length;
  assert.ok(words >= 900, `only ${words} words`);
  assert.ok(guide.answer.length >= 120 && guide.answer.length <= 420);
  assert.match(gText(guide).join(" "), /Last checked: 15 November 2026/);
  assert.equal(guide.faq.length, 6);
  assert.ok(guide.sections[3].h2.toLowerCase().includes("design a good tournament id card"), "section 4 is the #s3 anchor the page links to");
  assert.ok(guide.sections.some((s) => /decision/i.test(s.h2)));
  assert.ok(guide.sections.some((s) => /mistake/i.test(s.h2)));
  assert.ok(guide.sections.some((s) => s.blocks.some((b) => b.t === "ol")));
  const decision = gText(guide).join(" ");
  for (const rec of ["use Canva", "BotCamp", "StyleNameLab", "IDCreator", "MuftTools", "Esports Hub"]) assert.ok(decision.includes(rec), rec);
  assert.equal(GUIDES.filter((g) => g.slug === GUIDE_SLUG).length, 1);
  assert.ok(GUIDES.length >= 22, "21 guides plus this one");
});

test("routes, sitemap and links: the page has a route, is in the growth pages, linked from the home page, the tools hub, the footer and the student page", () => {
  assert.ok(fs.existsSync(new URL("../src/app/(site)/id-card-maker/esports/page.tsx", import.meta.url)));
  assert.ok(GROWTH_PAGES.some((p) => p.path === ESPORTS_PATH));
  assert.ok(read("src/app/sitemap.ts").includes("GROWTH_PAGES"));
  assert.ok(read("src/app/(site)/page.tsx").includes(ESPORTS_PATH));
  assert.ok(read("src/app/(site)/tools/page.tsx").includes(ESPORTS_PATH) && read("src/app/(site)/tools/page.tsx").includes(`/guides/${GUIDE_SLUG}/`));
  assert.ok(read("src/components/SiteFooter.tsx").includes(ESPORTS_PATH) && read("src/components/SiteFooter.tsx").includes('"/tools/"'));
  assert.ok(read("src/lib/student-page.ts").includes(ESPORTS_PATH));
  assert.ok(read("src/app/llms.txt/route.ts").includes("ESPORTS_PAGE"));
  assert.ok(guideBySlug("player-id-cards").sections.flatMap((s) => s.blocks).some((b) => b.t === "p" && b.x.includes(ESPORTS_PATH)));
  for (const r of ESPORTS_PAGE.related) assert.ok(r.href === "/tools/" || r.href === ESPORTS_PATH || TOOLS.some((t) => t.href === r.href) || GROWTH_PAGES.some((p) => p.path === r.href), r.href);
  assert.match(TOOLS.find((t) => t.slug === "id-cards").blurb, /no sign-up, built for tournaments/);
});

test("the shared page markup adds HowTo structured data only when asked, through the JSON-LD helper", () => {
  const src = read("src/components/seo/ToolLanding.tsx");
  assert.ok(src.includes('"@type": "HowTo"') && src.includes("t.howTo ?"));
  assert.ok(src.includes("<JsonLd"));
  assert.ok(!/<script/.test(read("src/app/(site)/id-card-maker/esports/page.tsx")));
});
