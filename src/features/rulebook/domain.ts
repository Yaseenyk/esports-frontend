/**
 * Rulebook template generator. Pure: the inputs become a plain-text rulebook (with "#" headings and "-" bullets) that the organiser
 * edits, and the same text is laid out into PDF pages. Every decision only the organiser can make is left in [square brackets].
 * It is a template to adapt, never the official rules of a game, a publisher or a league, and the text says so.
 */

export type GameId = "bgmi" | "free-fire" | "cod-mobile" | "valorant" | "other";
export type Format = "br-points" | "single" | "double" | "league" | "bo-maps";

export const GAMES: readonly { id: GameId; label: string; format: Format }[] = [
  { id: "bgmi", label: "BGMI", format: "br-points" },
  { id: "free-fire", label: "Free Fire", format: "br-points" },
  { id: "cod-mobile", label: "Call of Duty: Mobile", format: "br-points" },
  { id: "valorant", label: "Valorant", format: "bo-maps" },
  { id: "other", label: "Another game or sport", format: "single" },
];
export const FORMATS: readonly { id: Format; label: string }[] = [
  { id: "br-points", label: "Battle royale points" },
  { id: "single", label: "Single elimination" },
  { id: "double", label: "Double elimination" },
  { id: "league", label: "Round robin or league" },
  { id: "bo-maps", label: "Best-of maps (Valorant style)" },
];

export interface RulebookInput {
  game: GameId;
  /** The game's name when `game` is "other". */
  otherGame?: string;
  format: Format;
  eventName: string;
  organiser?: string;
  startDate?: string;
  endDate?: string;
  /** "online", or a venue name. */
  where?: string;
  teamSize?: number;
  subs?: number;
  checkInMinutes: number;
  lateMinutes: number;
  /** Best of 1, 3 or 5 for bracket and map formats. */
  bestOf?: number;
  /** Matches per team for battle royale points. */
  brMatches?: number;
  conduct: { cheating: boolean; teaming: boolean; respect: boolean; devices: boolean; streaming: boolean };
  disputeMinutes: number;
  contact?: string;
}

export const DEFAULT_INPUT: RulebookInput = {
  game: "bgmi", format: "br-points", eventName: "", organiser: "", startDate: "", endDate: "", where: "online", teamSize: 4, subs: 1,
  checkInMinutes: 30, lateMinutes: 10, bestOf: 3, brMatches: 6,
  conduct: { cheating: true, teaming: true, respect: true, devices: true, streaming: false }, disputeMinutes: 15, contact: "",
};

export const TEMPLATE_NOTE = "This rulebook is a template made with a free tool. It is not the official rules of any game, publisher or league. The organiser named below wrote and owns these rules. Change anything in [square brackets] before you publish it.";

const clean = (s: string | undefined, max = 120) => (s ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const or = (s: string | undefined, fallback: string) => clean(s) || fallback;
const plural = (n: number, w: string) => `${n} ${n === 1 ? w : /(ch|sh|s|x)$/.test(w) ? `${w}es` : `${w}s`}`;

export const gameName = (i: Pick<RulebookInput, "game" | "otherGame">): string => (i.game === "other" ? or(i.otherGame, "[game]") : GAMES.find((g) => g.id === i.game)!.label);
const isBr = (i: RulebookInput) => i.format === "br-points";

function dates(i: RulebookInput): string {
  const a = clean(i.startDate, 10), b = clean(i.endDate, 10);
  if (a && b && a !== b) return `${a} to ${b}`;
  return a || b || "[dates]";
}

function formatSection(i: RulebookInput): string[] {
  const bo = [1, 3, 5].includes(i.bestOf ?? 0) ? i.bestOf! : 3;
  switch (i.format) {
    case "br-points":
      return [
        "# Format: battle royale points",
        `- Every team plays ${i.brMatches && i.brMatches > 0 ? plural(i.brMatches, "match") : "[number of] matches"} in custom rooms. Room ID and password are shared in [where] [number] minutes before each match.`,
        "- Each match gives placement points and kill points from the scale below. [Paste your placement scale, for example 1st: __ points, 2nd: __ points, and the points per kill.]",
        "- Standings are the total of all matches. Ties are broken by [most first places], then [most total kills], then [the better placement in the last match].",
        "- Lobby assignment: [how teams are split into lobbies, if there is more than one].",
      ];
    case "single":
      return [
        "# Format: single elimination",
        "- A team that loses one match is out. The winner moves to the next round until one team is left.",
        `- Matches are best of ${bo} unless stated otherwise. The final is best of [number].`,
        "- Seeding: [by ranking, by registration order, or a random draw held in public]. With a team count that is not a power of two, the top seeds get a bye (they go to round 2 without playing).",
        "- Third place: [a third place match is played / no third place match].",
      ];
    case "double":
      return [
        "# Format: double elimination",
        "- A team is out after two losses. Every team starts in the winners bracket; a loss there moves the team to the losers bracket.",
        `- Matches are best of ${bo} unless stated otherwise.`,
        "- The winner of the winners bracket meets the winner of the losers bracket in the grand final.",
        "- Bracket reset: [if the losers bracket team wins the first grand final, a second final is played / the first grand final decides the winner].",
        "- Seeding: [by ranking, by registration order, or a random draw held in public]. Byes go to the top seeds.",
      ];
    case "league":
      return [
        "# Format: round robin or league",
        "- Every team plays every other team [once / twice].",
        "- Points: [3] for a win, [1] for a draw, [0] for a loss. [Delete the draw line if your game cannot end in a draw.]",
        "- Ties in the table are broken by [score difference], then [scores for], then [head-to-head result], then [a deciding match].",
        "- Top [number] teams go through to [the playoffs / the final].",
      ];
    case "bo-maps":
      return [
        "# Format: best-of maps",
        `- Matches are best of ${bo}: the first team to win ${Math.ceil(bo / 2)} ${Math.ceil(bo / 2) === 1 ? "map" : "maps"} wins the match.`,
        "- Map pool: [list the maps]. Map veto: [describe the ban and pick order, and who starts, for example by coin toss or higher seed].",
        "- Side selection: [the team that did not pick the map chooses the starting side].",
        "- Overtime: [as the game's tournament or custom lobby settings play it / your own rule].",
        "- Results are reported with a screenshot of the final scoreboard of every map.",
      ];
  }
}

/** Builds the full rulebook as plain text: "#" headings, "-" bullets, plain paragraphs. */
export function buildRulebook(input: RulebookInput): string {
  const i = input, game = gameName(i), name = or(i.eventName, "[Event name]"), org = or(i.organiser, "[organiser]");
  const where = clean(i.where).toLowerCase() === "online" ? "online" : or(i.where, "[venue]");
  const size = i.teamSize && i.teamSize > 0 ? plural(i.teamSize, "player") : "[number of] players";
  const subs = i.subs && i.subs > 0 ? ` plus up to ${plural(i.subs, "substitute")}` : i.subs === 0 ? " with no substitutes" : " plus [number of] substitutes";
  const c = i.conduct;
  const conduct = [
    c.cheating && "- No cheats, hacks, scripts, modified game files or any software that gives an unfair advantage. A team caught cheating is disqualified and its results are removed.",
    c.teaming && (isBr(i) ? "- No teaming: teams may not work together with another team in the same lobby." : "- No match fixing: teams must play every match to win."),
    c.respect && "- Respect players, casters and staff. Abuse, hate speech, threats or harassment in chat, voice or on social media lead to [a warning / removal from the event].",
    c.devices && `- Devices: [phones only / emulators allowed or not / PC rules]. Players use their own account and device; account sharing is not allowed.`,
    c.streaming && "- Streaming your own view is allowed with a delay of at least [number] minutes. Do not show room IDs or passwords on stream.",
    "- Any player or team that breaks these rules can be warned, lose points or be removed, at the organiser's decision.",
  ].filter((x): x is string => Boolean(x));

  const lines = [
    `# ${name}: rulebook`,
    TEMPLATE_NOTE,
    "# Event details",
    `- Game: ${game}`,
    `- Organiser: ${org}`,
    `- Dates: ${dates(i)}`,
    `- Where: ${where}`,
    `- Contact for questions and disputes: ${or(i.contact, "[phone, email or Discord channel]")}`,
    "# Teams and players",
    `- A team has ${size}${subs}. Every player is listed at registration and cannot be changed after [date or time].`,
    "- Player eligibility: [age rule, college or city rule, rank rule, if any]. The organiser may ask for proof.",
    "- Team names must not use the names of games, publishers or other esports organisations, or abusive words.",
    "# Check-in",
    `- Check-in opens ${plural(i.checkInMinutes, "minute")} before the first match and closes [number] minutes before it. Check in at [where: Discord channel, form or desk].`,
    `- A team that is not ready ${plural(i.lateMinutes, "minute")} after its match time loses that match [or: loses the points of that match].`,
    ...formatSection(i),
    "# Match settings",
    `- ${game} match settings: [mode, map, server or region, and any setting that differs from the game's default custom room or lobby].`,
    "- Disconnections: [whether a match is restarted, and up to which point, for example only before the first kill or in the first 2 minutes].",
    "# Fair play and conduct",
    ...conduct,
    "# Disputes",
    `- Raise a dispute within ${plural(i.disputeMinutes, "minute")} of the end of the match, through ${or(i.contact, "[contact]")}.`,
    "- Include evidence: screenshots or a screen recording that shows the problem, the match number and the team names.",
    `- ${org} reviews the evidence and decides. The decision is final for this event.`,
    "# Changes to these rules",
    `- ${org} may change these rules before the event starts and will tell every team through [channel]. Changes during the event are made only to keep play fair.`,
  ];
  return lines.join("\n");
}

// ------------------------------------------------------------------ layout for the PDF

export type Block = { kind: "title" | "heading" | "bullet" | "para"; text: string };

/** Reads the edited text back into blocks. The first "#" line is the title; later "#" lines are headings. */
export function parseBlocks(text: string): Block[] {
  const out: Block[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (/^#{1,6}\s+/.test(line)) out.push({ kind: out.some((b) => b.kind === "title") ? "heading" : "title", text: line.replace(/^#{1,6}\s+/, "") });
    else if (/^[-*•]\s+/.test(line)) out.push({ kind: "bullet", text: line.replace(/^[-*•]\s+/, "") });
    else out.push({ kind: "para", text: line });
  }
  return out;
}

/** Splits text into lines that fit `max` pixels, by words; a single word longer than a line is cut by characters. */
export function wrap(text: string, max: number, measure: (s: string) => number): string[] {
  const out: string[] = [];
  let cur = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = cur ? `${cur} ${word}` : word;
    if (measure(next) <= max) { cur = next; continue; }
    if (cur) out.push(cur);
    if (measure(word) <= max) { cur = word; continue; }
    let piece = "";
    for (const ch of Array.from(word)) { if (measure(piece + ch) > max && piece) { out.push(piece); piece = ch; } else piece += ch; }
    cur = piece;
  }
  if (cur) out.push(cur);
  return out;
}

export interface Line { kind: Block["kind"]; text: string; /** First line of a bullet, which gets the bullet mark. */ first: boolean; h: number; /** Space before the line. */ gap: number }
export const LINE_H: Record<Block["kind"], number> = { title: 60, heading: 44, bullet: 34, para: 34 };
export const GAP_BEFORE: Record<Block["kind"], number> = { title: 0, heading: 30, bullet: 8, para: 12 };

/** Blocks to lines, given a measure per kind (fonts differ) and the text width. */
export function layoutLines(blocks: Block[], width: number, measure: (kind: Block["kind"], s: string) => number, indent = 32): Line[] {
  return blocks.flatMap((b) => wrap(b.text, width - (b.kind === "bullet" ? indent : 0), (s) => measure(b.kind, s)).map((text, k) => ({ kind: b.kind, text, first: k === 0, h: LINE_H[b.kind], gap: k === 0 ? GAP_BEFORE[b.kind] : 0 })));
}

/** Pages of lines that fit in `height` pixels. A heading is never left alone at the bottom of a page. */
export function paginate(lines: Line[], height: number): Line[][] {
  const pages: Line[][] = [[]];
  let used = 0;
  lines.forEach((l, i) => {
    const page = pages[pages.length - 1]!;
    const need = (page.length ? l.gap : 0) + l.h;
    const next = lines[i + 1];
    const keep = l.kind === "heading" && next ? next.gap + next.h : 0;
    if (page.length && used + need + keep > height) { pages.push([l]); used = l.h; return; }
    page.push(l); used += need;
  });
  return pages.filter((p) => p.length);
}

/** A safe file name, for example "spring-cup-rulebook.pdf". */
export const rulebookFileName = (eventName: string): string => `${eventName.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "tournament"}-rulebook.pdf`;
