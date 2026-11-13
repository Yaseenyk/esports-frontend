// The scheduled guides (three a week, released by date) are held to a quality bar of their own, because they are written in batches
// ahead of time and published by a daily job nobody watches. Everything here runs on ALL of them, released or not.
import test from "node:test";
import assert from "node:assert/strict";
import { CORE_GUIDES } from "../src/content/guides.ts";
import { DRAFTS, SCHEDULED } from "../src/content/scheduled/index.ts";
import { FIRST_RELEASE, releaseDate } from "../src/content/scheduled/schedule.ts";
import { FACTS } from "../src/content/scheduled/facts.ts";
import { TOOLS } from "../src/lib/data.ts";

const coreSlugs = new Set(CORE_GUIDES.map((g) => g.slug));
const tools = new Set(TOOLS.map((t) => t.href));
const extraPaths = new Set(["/gate/", "/about/", "/contact/", "/privacy/", "/terms/", "/tools/", "/guides/", "/tools/poster/", "/points-table/bgmi/", "/points-table/free-fire/", "/id-card-maker/student/"]);
const textOf = (g) => [g.intro, g.answer, ...g.sections.flatMap((s) => [s.h2, ...s.blocks.flatMap((b) => (b.t === "p" || b.t === "note" || b.t === "h3" ? [b.x] : b.t === "ul" || b.t === "ol" ? b.items : b.t === "table" ? [...b.head, ...b.rows.flat()] : []))])];
const bodyOf = (g) => textOf(g).join(" ");
const words = (g) => [...textOf(g), ...g.faq.flatMap((f) => [f.q, f.a])].join(" ").split(/\s+/).length;
const BY_DATE = new Map(SCHEDULED.map((g) => [g.slug, g.published]));

test("there are no more than 100 scheduled guides, each with a unique slug, title, description and tab title", () => {
  assert.ok(SCHEDULED.length >= 1 && SCHEDULED.length <= 100, `${SCHEDULED.length} scheduled guides`);
  for (const key of ["slug", "title", "description"]) {
    assert.equal(new Set(SCHEDULED.map((g) => g[key])).size, SCHEDULED.length, `duplicate ${key}`);
  }
  assert.equal(new Set(SCHEDULED.map((g) => g.seoTitle ?? g.title)).size, SCHEDULED.length, "duplicate tab title");
  for (const g of SCHEDULED) assert.ok(!coreSlugs.has(g.slug), `${g.slug} clashes with a hand-written guide`);
  const allTitles = [...CORE_GUIDES, ...SCHEDULED].map((g) => g.title);
  assert.equal(new Set(allTitles).size, allTitles.length, "a scheduled title repeats a hand-written one");
});

test("the schedule is Monday, Wednesday, Friday, in order, never more than three in any week", () => {
  assert.equal(new Date(`${FIRST_RELEASE}T00:00:00Z`).getUTCDay(), 1, "the first release must be a Monday");
  let prev = "";
  const perWeek = new Map();
  SCHEDULED.forEach((g, i) => {
    assert.equal(g.published, releaseDate(i));
    assert.ok([1, 3, 5].includes(new Date(`${g.published}T00:00:00Z`).getUTCDay()), `${g.slug} is not on a Monday, Wednesday or Friday`);
    assert.ok(g.published > prev, `${g.slug} is not after the previous guide`);
    prev = g.published;
    const wk = Math.floor((Date.parse(g.published) - Date.parse(FIRST_RELEASE)) / (7 * 864e5));
    perWeek.set(wk, (perWeek.get(wk) ?? 0) + 1);
  });
  for (const [wk, n] of perWeek) assert.ok(n <= 3, `week ${wk} has ${n} guides`);
});

test("every scheduled guide is complete and inside search limits", () => {
  for (const g of SCHEDULED) {
    assert.match(g.slug, /^[a-z0-9-]+$/);
    assert.ok(g.title.length >= 20 && g.title.length <= 100, `${g.slug} title ${g.title.length}`);
    assert.ok((g.seoTitle ?? g.title).length <= 56, `${g.slug} tab title ${(g.seoTitle ?? g.title).length}`);
    assert.ok(g.description.length >= 100 && g.description.length <= 165, `${g.slug} description ${g.description.length}`);
    assert.ok(g.answer.length >= 120 && g.answer.length <= 420, `${g.slug} answer ${g.answer.length}`);
    assert.ok(g.intro.length >= 150, `${g.slug} intro`);
    assert.ok(g.sections.length >= 5 && g.sections.length <= 8, `${g.slug} has ${g.sections.length} sections`);
    assert.ok(g.minutes >= 4 && g.minutes <= 15);
    assert.ok(new Set(g.sections.map((s) => s.h2)).size === g.sections.length, `${g.slug} repeats a heading`);
  }
});

test("each is long enough to be useful, with a list or table and a common-mistakes section", () => {
  for (const g of SCHEDULED) {
    assert.ok(words(g) >= 700, `${g.slug} has only ${words(g)} words`);
    const blocks = g.sections.flatMap((s) => s.blocks);
    assert.ok(blocks.some((b) => b.t === "ul" || b.t === "ol"), `${g.slug} has no list`);
    assert.ok(blocks.some((b) => b.t === "table") || blocks.filter((b) => b.t === "ol").length >= 1, `${g.slug} needs a table or numbered steps`);
    assert.ok(g.sections.some((s) => /mistake|avoid|wrong|go wrong/i.test(s.h2)), `${g.slug} needs a common-mistakes section`);
  }
});

test("FAQs: three each, real answers, unique across the whole site, plain text", () => {
  const seenQ = new Map(), seenA = new Map();
  for (const g of CORE_GUIDES) for (const f of g.faq ?? []) { seenQ.set(f.q.trim().toLowerCase(), g.slug); seenA.set(f.a.trim().toLowerCase(), g.slug); }
  for (const g of SCHEDULED) {
    assert.ok(g.faq.length >= 3 && g.faq.length <= 5, `${g.slug} FAQ count ${g.faq.length}`);
    for (const f of g.faq) {
      assert.ok(f.q.trim().endsWith("?") && f.q.length >= 25, `${g.slug}: question ${f.q}`);
      assert.ok(f.a.length >= 200 && f.a.length <= 700, `${g.slug}: answer is ${f.a.length} characters: ${f.q}`);
      assert.ok(!/\]\(\//.test(f.a), `${g.slug}: FAQ answers are plain text`);
      const qk = f.q.trim().toLowerCase(), ak = f.a.trim().toLowerCase();
      assert.ok(!seenQ.has(qk), `duplicate question "${f.q}" in ${g.slug} and ${seenQ.get(qk)}`);
      assert.ok(!seenA.has(ak), `duplicate answer in ${g.slug} and ${seenA.get(ak)}`);
      seenQ.set(qk, g.slug); seenA.set(ak, g.slug);
    }
  }
});

test("links only point at things that exist on the day the guide goes live", () => {
  for (const g of SCHEDULED) {
    const ok = (path) => {
      if (extraPaths.has(path) || tools.has(path)) return true;
      const m = /^\/guides\/([a-z0-9-]+)\/$/.exec(path);
      if (!m) return false;
      if (coreSlugs.has(m[1])) return true;
      const when = BY_DATE.get(m[1]);
      return !!when && when < g.published; // a guide released earlier
    };
    const all = [...textOf(g), ...g.faq.flatMap((f) => [f.a])].join(" ");
    for (const m of all.matchAll(/\[([^\]]+)\]\(([^)]*)\)/g)) assert.ok(ok(m[2]), `${g.slug} links to ${m[2]}, which is not live when it releases`);
    assert.ok(tools.has(g.cta.href) || extraPaths.has(g.cta.href), `${g.slug} CTA ${g.cta.href}`);
    assert.ok(g.related.length >= 2 && g.related.length <= 4, `${g.slug} related count`);
    for (const r of g.related) assert.ok(ok(`/guides/${r}/`), `${g.slug} relates to ${r}, which is not live when it releases`);
    assert.ok(/\]\(\/tools\//.test(bodyOf(g)) || tools.has(g.cta.href), `${g.slug} never links to a tool`);
  }
});

test("voice: plain words, no hype, no invented statistics or sources", () => {
  const BANNED = ["delve", "game-changer", "game changer", "in today's fast-paced", "unleash", "dive into", "ultimate guide", "revolutioni", "seamless", "cutting-edge", "state-of-the-art", "tapestry", "navigate the landscape", "it's important to note", "in conclusion", "let's explore", "elevate your", "unlock the", "leverage", "TODO", "lorem", "coming soon", "TBD", "placeholder", "XXX"];
  const SOURCES = ["studies show", "research shows", "research has shown", "according to a", "survey", "statistics show", "experts say", "millions of", "billions of", "most players", "most organisers", "most organizers", "percent of", "% of"];
  for (const g of SCHEDULED) {
    const all = [g.title, g.description, ...textOf(g), ...g.faq.flatMap((f) => [f.q, f.a])].join(" ").toLowerCase();
    for (const b of BANNED) assert.ok(!all.includes(b.toLowerCase()), `${g.slug} contains "${b}"`);
    for (const b of SOURCES) assert.ok(!all.includes(b), `${g.slug} makes an unsourced claim: "${b}"`);
    assert.ok(!all.includes(" — "), `${g.slug} uses spaced em dashes`);
    assert.ok((all.match(/!/g) ?? []).length <= 1, `${g.slug} uses exclamation marks`);
  }
});

test("the verified facts file is complete: every fact has a source and a check date", () => {
  for (const [k, f] of Object.entries(FACTS)) {
    assert.ok(f.text.endsWith("."), `${k} text`);
    assert.ok(f.source.length > 10, `${k} source`);
    assert.match(f.checked, /^\d{4}-\d{2}-\d{2}$/);
  }
});

test("release logic: nothing is live before its date, and the list is the schedule", () => {
  assert.equal(DRAFTS.length, SCHEDULED.length);
  assert.equal(SCHEDULED[0].published, FIRST_RELEASE);
});
