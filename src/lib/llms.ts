/**
 * Server-only: the text behind /llms.txt, /llms-full.txt and the "What Esports Hub is" fact block on /about/.
 * Every number is counted from the code at build time (tools, guides, pages), so the files can never claim more than the site has.
 * Never import this from a client component: it pulls in every guide.
 */
import { LISTED_GUIDES as GUIDES, type Block, type Guide } from "@/content/guides";
import { FREE_FIRE_TEAM_NAMES_PT } from "@/content/pt-br/free-fire-team-names-ideas";
import { COMPARE_DESCRIPTION, COMPARE_PATH, COMPARE_TITLE } from "@/lib/compare";
import { FF_COMPARE_DESCRIPTION, FF_COMPARE_PATH, FF_COMPARE_TITLE } from "@/lib/compare-ff";
import { TOOLS, type Tool } from "@/lib/data";
import { CARD_DESIGNS, SCREEN_DESIGNS } from "@/lib/facts";
import { ESPORTS_PAGE } from "@/lib/esports-id-page";
import { ALL_GAME_PAGES } from "@/lib/game-pages";
import { FREE_FIRE_PT } from "@/lib/game-pages-pt";
import { PT_BR_PAGES, ptBrReviewed } from "@/lib/pt-br";
import { SITE_URL } from "@/lib/site";
import { STUDENT_PAGE } from "@/lib/student-page";
import { TOOL_PAGES } from "@/lib/tool-pages";
import { OWNER } from "@/features/tool-trust/domain";

/**
 * Tools made for players rather than organisers. A tool page added for players lists its slug here so llms.txt files it under
 * "Free tools for players"; any slug not listed is filed under the organiser tools. Slugs not in TOOLS are ignored.
 */
export const PLAYER_TOOL_SLUGS: readonly string[] = [
  "team-name-generator", "free-fire-guild-name", "sensitivity-converter",
  "free-fire-name-style", "bgmi-name-style", "reaction-time-test", "tap-speed-test", "valorant-crosshair",
];

export const playerTools = (): Tool[] => TOOLS.filter((t) => PLAYER_TOOL_SLUGS.includes(t.slug));
export const organiserTools = (): Tool[] => TOOLS.filter((t) => !PLAYER_TOOL_SLUGS.includes(t.slug));

/** The Portuguese (Brazil) pages, with the titles and descriptions they carry. */
export function portuguesePages(): { path: string; title: string; description: string; en: string }[] {
  const meta: Record<string, { title: string; description: string }> = {
    [FREE_FIRE_PT.path]: { title: FREE_FIRE_PT.title, description: FREE_FIRE_PT.description },
    "/pt-br/guides/free-fire-team-names-ideas/": { title: FREE_FIRE_TEAM_NAMES_PT.title, description: FREE_FIRE_TEAM_NAMES_PT.description },
  };
  return Object.entries(PT_BR_PAGES).filter(([, pt]) => meta[pt] && ptBrReviewed(pt)).map(([en, pt]) => ({ path: pt, en, ...meta[pt]! }));
}

/** The honest comparison pages. */
export const COMPARE_PAGES: { path: string; title: string; description: string }[] = [
  { path: COMPARE_PATH, title: COMPARE_TITLE, description: COMPARE_DESCRIPTION },
  { path: FF_COMPARE_PATH, title: FF_COMPARE_TITLE, description: FF_COMPARE_DESCRIPTION },
];

const andList = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);
const dayText = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/**
 * "What Esports Hub is": plain sentences an assistant can quote one at a time. Facts only from the code and the site's own rules
 * (CLAUDE.md hard limits: no money, no ads on tools). No user counts, ratings or traffic numbers, because none are published.
 */
export function factSentences(now = new Date()): string[] {
  const pt = portuguesePages().length;
  return [
    `Esports Hub (${SITE_URL.replace(/^https?:\/\//, "")}) is a free website with browser tools for people who run esports and gaming tournaments, and for the players in them.`,
    "Organisers get brackets, round robin and group fixtures, battle royale points tables for BGMI and Free Fire, registration forms, ID cards, certificates, posters, gate check-in with QR passes and live screens for a TV or OBS.",
    `Tools for players: ${andList(playerTools().map((t) => t.name))}.`,
    "The tools run in the browser and need no account; a free account only adds things that need a server, such as saving events online and live check-in.",
    "The site handles no money: no entry fees, no wallets, no prizes or payouts, and no adverts on the tools.",
    `It is made in ${OWNER.city}, India, by ${OWNER.name} (${OWNER.url}).`,
    `As of ${dayText(now)} it has ${TOOLS.length} free tools, ${ALL_GAME_PAGES.length} game points table pages and ${GUIDES.length} guides; the ID card maker has ${CARD_DESIGNS} card designs and the live screens have ${SCREEN_DESIGNS} designs.`,
    `${pt === 1 ? "One page is" : `${pt} pages are`} also in Brazilian Portuguese; the rest of the site is in English.`,
    "Where a guide uses a game publisher's rule or number, it names the source.",
    `Contact: ${SITE_URL}/contact/.`,
  ];
}

const line = (name: string, href: string, text: string) => `- [${name}](${href.startsWith("http") ? href : SITE_URL + href}): ${text}`;

/** The body of /llms.txt (the llmstxt.org convention): the fact block, then every live page by group. */
export function llmsTxt(now = new Date()): string {
  const players = playerTools(), organisers = organiserTools();
  return `# Esports Hub

> Free browser tools and plain-English guides for esports and gaming tournaments in India: brackets, points tables, ID cards, check-in and live screens for organisers, and team names and a sensitivity converter for players. No account needed. Run by ${OWNER.name} (${OWNER.url}).

## What Esports Hub is

${factSentences(now).join(" ")}

## Free tools for organisers

${organisers.map((t) => line(t.name, t.href, t.blurb)).join("\n")}

## Free tools for players

${players.map((t) => line(t.name, t.href, t.blurb)).join("\n")}

## Points tables for one game

${ALL_GAME_PAGES.map((p) => line(p.name, p.path, p.description)).join("\n")}

## ID card maker pages

${[ESPORTS_PAGE, STUDENT_PAGE].map((p) => line(p.name, p.path, p.description)).join("\n")}

## Comparisons

${COMPARE_PAGES.map((p) => line(p.title, p.path, p.description)).join("\n")}

## Em português (Brazilian Portuguese)

${portuguesePages().map((p) => line(p.title, p.path, p.description)).join("\n")}

## Guides (${GUIDES.length} live)

${GUIDES.map((g) => line(g.title, `/guides/${g.slug}/`, g.description)).join("\n")}

## More

- [Full text of every tool page and guide](${SITE_URL}/llms-full.txt)
- [All guides](${SITE_URL}/guides/)
- [All tools](${SITE_URL}/tools/)
- [Sitemap](${SITE_URL}/sitemap.xml)
- [About](${SITE_URL}/about/)
- [Contact](${SITE_URL}/contact/)
`;
}

/** "[label](/path/)" links in page text, made absolute so the text file works on its own. */
const absLinks = (s: string) => s.replace(/\]\((\/[^)]*)\)/g, (_, p: string) => `](${SITE_URL}${p})`);

function blockText(b: Block): string {
  switch (b.t) {
    case "p": case "note": return absLinks(b.x);
    case "h3": return `#### ${b.x}`;
    case "ul": return b.items.map((i) => `- ${absLinks(i)}`).join("\n");
    case "ol": return b.items.map((i, n) => `${n + 1}. ${absLinks(i)}`).join("\n");
    case "table": return [b.head.join(" | "), ...b.rows.map((r) => r.join(" | "))].join("\n");
  }
}

const faqText = (faq: { q: string; a: string }[] | undefined) => (faq?.length ? `\nQuestions and answers:\n\n${faq.map((f) => `Q: ${f.q}\nA: ${absLinks(f.a)}`).join("\n\n")}\n` : "");

function guideText(g: Guide): string {
  return [
    `### ${g.title}`, `URL: ${SITE_URL}/guides/${g.slug}/`, `Updated: ${g.updated}`, "",
    ...(g.answer ? [`Short answer: ${absLinks(g.answer)}`, ""] : []),
    g.intro, "",
    ...g.sections.flatMap((s) => [`#### ${s.h2}`, "", ...s.blocks.map(blockText).flatMap((t) => [t, ""])]),
    faqText(g.faq),
  ].join("\n");
}

type PageText = { name: string; path: string; lead: string; steps: string[]; faq: { q: string; a: string }[]; updated?: string };
const pageText = (p: PageText) => [
  `### ${p.name}`, `URL: ${SITE_URL}${p.path}`, ...(p.updated ? [`Updated: ${p.updated}`] : []), "",
  p.lead, "", "How to use it:", ...p.steps.map((s, i) => `${i + 1}. ${absLinks(s)}`), faqText(p.faq),
].join("\n");

/** The body of /llms-full.txt: the fact block, then the full text of every tool page, game page and live guide, built from the same data as the pages. */
export function llmsFullTxt(now = new Date()): string {
  const tools = TOOLS.map((t) => ({ t, page: TOOL_PAGES[t.slug] }));
  return `# Esports Hub: full text

> Every tool page and every live guide on ${SITE_URL}, as plain text, generated from the same data as the pages when the site is built. The short map is ${SITE_URL}/llms.txt.

## What Esports Hub is

${factSentences(now).join("\n\n")}

## Tools

${tools.map(({ t, page }) => (page ? pageText({ name: page.name, path: t.href, lead: page.lead, steps: page.steps, faq: page.faq, updated: page.updated }) : `### ${t.name}\nURL: ${SITE_URL}${t.href}\n\n${t.blurb}\n`)).join("\n\n")}

## Points tables for one game

${ALL_GAME_PAGES.map((p) => pageText({ name: p.name, path: p.path, lead: p.lead, steps: p.steps, faq: p.faq, updated: p.updated })).join("\n\n")}

## ID card maker pages

${[ESPORTS_PAGE, STUDENT_PAGE].map((p) => pageText({ name: p.name, path: p.path, lead: p.lead, steps: p.steps, faq: p.faq, updated: p.updated })).join("\n\n")}

## Guides (${GUIDES.length} live)

${GUIDES.map(guideText).join("\n\n")}
`;
}
