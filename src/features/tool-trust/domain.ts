/**
 * Trust facts for the points table pages: who runs the site, what the calculator really scores, and what leaves the browser.
 * Pure data and text builders (no React), so the page, the structured data and the tests read the same words.
 *
 * Every claim here was checked against the code (25 Nov 2026):
 * - The battle royale calculator (src/components/tools/PointsTable.tsx) keeps teams and results in React state only. The share picture
 *   (src/lib/share-cards.ts), the CSV and the TV screen (BroadcastChannel, src/components/display/useScreen.ts) are made in the browser.
 *   The OBS overlay kit, when its flag is on, uses this browser's localStorage and a BroadcastChannel only (overlay-kit/services/kit-store.ts).
 * - The only network call the tools make is `sendEvent("tool_complete", <tool id>)` (src/lib/track.ts) when the CSV is downloaded: the body is
 *   the tool id, nothing typed. It is not sent on /pt-br/ pages (gtmAllowed is false there), under Do Not Track, GPC or the opt-out.
 * - Page analytics: Google Analytics and Microsoft Clarity on /points-table/ and /tools/ pages (src/lib/gtm.ts), our Pulse visit counter on
 *   /points-table/ and /pt-br/ pages. Clarity is told to mask the tools (data-clarity-mask) and Pulse click labels inside the tools are fixed
 *   words (data-pulse-label), so neither receives team names or scores.
 */
import { PERSON_ID } from "@/lib/schema";
import { EXAMPLE_SCALE, CODM_EXAMPLE_SCALE, type Scale } from "@/lib/points";
import { DEFAULT_MAP_LEAGUE, BEST_OF } from "@/features/map-league/domain";

export type TrustLang = "en" | "pt-BR";

/** The person who builds and runs the site. Same ids and profiles as the portfolio's sitewide entity (portfolio src/lib/seo.ts, PERSON_ID and sameAs). */
export const OWNER = {
  name: "Yaseen Khatib",
  url: "https://yk.streamerosai.com/",
  personId: PERSON_ID,
  linkedin: "https://www.linkedin.com/in/yaseen-yk",
  github: "https://github.com/Yaseenyk",
  city: "Hyderabad",
} as const;

// No Person node here: the portfolio owns it (PERSON_ID in src/lib/schema.ts). Pages reference it by @id only.

const ordEn = (n: number) => { const t = n % 100, s = t >= 11 && t <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th"; return `${n}${s}`; };
const ordPt = (n: number) => `${n}º`;

/** "1st 10, 2nd 6, ..." from a real scale, so the page can never state numbers the calculator does not use. */
export function scaleText(s: Scale, lang: TrustLang): string {
  const ord = lang === "en" ? ordEn : ordPt;
  return s.placement.map((p, i) => `${ord(i + 1)} ${p}`).join(", ");
}

export interface ScoringRules { lead: string; items: string[] }

/** A battle royale page (BGMI, Free Fire, COD Mobile and the general points table maker). */
export function battleRoyaleRules(game: string | null, scale: Scale, lang: TrustLang = "en"): ScoringRules {
  const after = scale.placement.length + 1;
  if (lang === "pt-BR") {
    return {
      lead: `A tabela de pontos de ${game ?? "battle royale"} soma os pontos de colocação de cada equipe aos pontos por abate, partida por partida, e ordena as equipes pelo total. Equipes empatadas são separadas por critérios fixos, então os mesmos resultados dão sempre a mesma ordem.`,
      items: [
        `Pontos de colocação usados ao abrir a página: ${scaleText(scale, lang)}. Do ${ordPt(after)} lugar em diante: 0.`,
        `Pontos por abate: ${scale.perKill}.`,
        "Desempate, nesta ordem: mais vitórias, mais abates, melhor posição na última partida, nome da equipe.",
        "Os números são um exemplo, não uma tabela oficial. O organizador pode mudar os pontos de colocação e por abate no passo 1.",
      ],
    };
  }
  return {
    lead: `The ${game ? `${game} points table` : "points table maker"} adds placement points for where each team finished to points for every kill, match by match, and ranks the teams by their total over all matches. Teams on the same total are separated by fixed tie-breakers, so the same results always give the same order.`,
    items: [
      `Placement points when the page opens: ${scaleText(scale, lang)}. ${ordEn(after)} place and below: 0.`,
      `Kill points: ${scale.perKill} per kill. A match score is placement points plus kill points; the total is the sum of all matches.`,
      "Tie-breakers, in order: most wins (first places), most kills, better placement in the last match, then team name.",
      "These numbers are an example, not an official scale. Organisers can change the placement points (up to 100 places) and the points per kill in step 1.",
    ],
  };
}

/** The Valorant league table: match play, not placement and kills. */
export function leagueRules(game: string): ScoringRules {
  const s = DEFAULT_MAP_LEAGUE;
  return {
    lead: `The ${game} points table is a league table for 5v5 matches. Every team plays every other team, you type the rounds each team won on each map, and the table counts wins, losses and points, then separates teams on the same points.`,
    items: [
      `Points when the page opens: ${s.win} for a match win, ${s.loss} for a loss. Matches are best of ${BEST_OF.join(", ").replace(/, (\d+)$/, " or $1")}.`,
      "Order: points, then map difference, then round difference, then head-to-head points between the level teams, then team name.",
      "A match counts once a team has won enough maps; a level map is flagged and does not count.",
      "These defaults are common league practice, not an official rule. Organisers can change the points for a win and a loss and the best-of in step 2.",
    ],
  };
}

/** The scale each battle royale page starts with (same table as PRESETS in PointsTable.tsx). */
export const PAGE_SCALES = { bgmi: EXAMPLE_SCALE, "free-fire": EXAMPLE_SCALE, "cod-mobile": CODM_EXAMPLE_SCALE, general: EXAMPLE_SCALE } as const;

/**
 * The three trust questions every English points table page answers, in its own FAQ (so the FAQPage data matches the page).
 * `name` is the page's tool name ("Free Fire points table"), which keeps every question and answer unique across the site.
 * No digits on purpose: the Portuguese Free Fire page mirrors the English FAQ and the tests compare the numbers in each answer.
 */
export function trustFaq(name: string): { q: string; a: string }[] {
  return [
    { q: `Is the ${name} safe to use?`, a: `Yes. The ${name} asks for no sign-in, nothing to install and no payment. Team names and results are worked out in your browser and stay there: this page never sends them to our server, and the share picture, the CSV file and the TV screen are all made on your own device. Analytics record how the page is used, such as visits, clicks and scrolling, plus one anonymous “tool used” count when you download the CSV, and none of them receive your team names or scores. Microsoft Clarity, which shows us how pages are used, is told to mask the calculator. The privacy page lists every service the site loads.` },
    { q: `Do I need an account to use the ${name}?`, a: `No. Open the page and start typing: the ${name} works without an account, a sign-in or an email address, on a phone or a computer. Nothing is saved online, so the table is not kept for you after you close the tab; download the CSV or share the picture when the last match ends. A free Esports Hub account is optional and only adds things that need a server, such as saving events online, player invite links and live gate check-in.` },
    { q: `Is the ${name} free?`, a: `Yes. The ${name} is free for as many matches and events as you like, with no paid version, no trial period and no payment details asked for. Every part of it, including the CSV download, the share pictures and the TV screen, works without paying. Esports Hub is a set of free tools for people who run their own tournaments, built and run by one developer, Yaseen Khatib, and the tool pages carry no adverts.` },
  ];
}

/** The words of the "who runs this" line and the "Safe to use" box. */
export const TRUST_COPY = {
  en: {
    by: "Built and run by", role: `, a developer in ${OWNER.city}`, linkedin: "LinkedIn",
    rulesH: "How this calculator scores",
    safeH: "Safe to use",
    safe: [
      ["No sign-in.", "The calculator works without an account."],
      ["Nothing to install.", "It runs in this browser tab, on a phone or a computer."],
      ["No payment.", "It is free."],
      ["Your team names and scores stay in your browser.", "This page never sends them to our server. The standings, the share picture, the CSV file and the TV screen are all made on your device."],
      ["What analytics see.", "How the page is used (visits, clicks, scrolling) and one anonymous “tool used” count when you download the CSV. Never your team names or scores."],
    ] as [string, string][],
    privacy: "Privacy policy",
  },
  "pt-BR": {
    by: "Criado e mantido por", role: `, desenvolvedor em ${OWNER.city}, na Índia`, linkedin: "LinkedIn",
    rulesH: "Como esta calculadora conta os pontos",
    safeH: "Seguro para usar",
    safe: [
      ["Sem login.", "A calculadora funciona sem conta."],
      ["Nada para instalar.", "Roda nesta aba do navegador, no celular ou no computador."],
      ["Sem pagamento.", "É grátis."],
      ["Os nomes das equipes e os placares ficam no seu navegador.", "Esta página nunca envia esses dados para o nosso servidor. A classificação, a imagem para compartilhar, o CSV e a tela para TV são feitos no seu aparelho."],
      ["O que as estatísticas veem.", "Como a página é usada (visitas, cliques, rolagem), de forma anônima. Nunca os nomes das equipes nem os placares."],
    ] as [string, string][],
    privacy: "Privacidade (em inglês)",
  },
} as const;
