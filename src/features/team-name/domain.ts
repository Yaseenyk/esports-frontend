/**
 * Team names and badges. Pure, so the word lists, the blocklist and the badge drawing are unit tested in node.
 *
 * Names come only from our own word lists. Every name, generated or typed, is checked against a blocklist of game and publisher
 * names, esports organisation names we know of, and slurs, so a team does not end up named after a brand or something hurtful.
 * Badges are simple shapes, initials and flat colours: no logos, no game art.
 */
import { SMALL_CAPS, charCount, styleLetters } from "@/features/shared/fancy-text";

export type Theme = "animals" | "elements" | "indian" | "legends" | "space";
export const THEMES: readonly { id: Theme; label: string }[] = [
  { id: "animals", label: "Animals" },
  { id: "elements", label: "Weather and elements" },
  { id: "indian", label: "Indian words" },
  { id: "legends", label: "Legends (no gods or religion)" },
  { id: "space", label: "Space" },
];

/**
 * Word lists. Nouns that are the names of well-known esports or league teams (Falcons, Titans, Outlaws, Dragons, Gladiators,
 * Sentinels and the like) are left out on purpose, and the blocklist catches any combination that still matches one.
 */
export const WORDS: Record<Theme, { first: readonly string[]; second: readonly string[]; gloss?: Record<string, string> }> = {
  animals: {
    first: ["Crimson", "Silent", "Iron", "Swift", "Midnight", "Wild", "Steel", "Frost", "Shadow", "Golden", "Rapid", "Desert", "Jungle", "Copper", "Scarlet", "Arctic"],
    second: ["Cheetahs", "Cobras", "Hornets", "Rhinos", "Mongooses", "Kites", "Owls", "Leopards", "Tuskers", "Ravens", "Sharks", "Scorpions", "Jackals", "Bison", "Stallions", "Barracudas", "Pythons", "Kestrels", "Lynxes", "Orcas", "Mantises"],
  },
  elements: {
    first: ["Blazing", "Frozen", "Electric", "Molten", "Rising", "Raging", "Solar", "Lunar", "Crystal", "Thunder", "Silent", "Burning"],
    second: ["Embers", "Tempest", "Cyclone", "Avalanche", "Monsoon", "Quake", "Inferno", "Tide", "Voltage", "Glacier", "Magma", "Storm", "Squall", "Wildfire", "Undertow"],
  },
  indian: {
    first: ["Bindaas", "Desi", "Tez", "Garam", "Jhakaas", "Mast", "Toofani", "Shaandaar", "Monsoon", "Chai", "Masala", "Dilli", "Bambai"],
    second: ["Toli", "Toofan", "Bijli", "Baaz", "Tadka", "Dhamaka", "Yodhas", "Josh", "Lehar", "Aandhi", "Jugaadus", "Cheetahs", "Tigers", "Baadal"],
    gloss: { Bindaas: "carefree", Tez: "fast", Garam: "hot", Jhakaas: "awesome (Mumbai slang)", Mast: "great", Toofani: "stormy", Shaandaar: "splendid", Toli: "gang, squad", Toofan: "storm", Bijli: "lightning", Baaz: "hawk", Tadka: "tempering, a burst of flavour", Dhamaka: "blast", Yodhas: "warriors", Josh: "zeal", Lehar: "wave", Aandhi: "dust storm", Jugaadus: "people who find a clever fix", Baadal: "cloud", Dilli: "Delhi", Bambai: "Bombay" },
  },
  legends: {
    first: ["Lost", "Last", "Hidden", "Fearless", "Northern", "Eastern", "Noble", "Ashen", "Silver", "Wandering", "Iron", "Midnight"],
    second: ["Wardens", "Rangers", "Sentries", "Vanguards", "Nomads", "Knights", "Mavericks", "Raiders", "Rebels", "Wanderers", "Pioneers", "Specters", "Archers", "Corsairs", "Drifters"],
  },
  space: {
    first: ["Cosmic", "Stellar", "Orbital", "Lunar", "Solar", "Deep", "Dark", "Red", "Binary", "Distant"],
    second: ["Comets", "Pulsars", "Quasars", "Nebula", "Orbit", "Eclipse", "Novas", "Meteors", "Satellites", "Rockets", "Asteroids", "Horizons", "Galaxies"],
  },
};

// ------------------------------------------------------------------ blocklist

/** Game titles, publishers and platforms. Matched anywhere in the name (spaces and look-alike characters ignored). */
const GAME_ANYWHERE = [
  "bgmi", "battlegrounds", "pubg", "krafton", "freefire", "garena", "valorant", "riotgames", "callofduty", "codmobile", "codm", "activision",
  "apexlegends", "counterstrike", "csgo", "overwatch", "blizzard", "fortnite", "epicgames", "minecraft", "tencent", "leagueoflegends", "dota",
  "clashroyale", "clashofclans", "supercell", "rainbowsix", "ubisoft", "mobilelegends", "moonton", "pokemonunite", "nintendo", "playstation",
  "xbox", "electronicarts", "rockstargames", "newstate", "esportshub",
];
/** Short or common words that are only a problem as a whole word ("riot" in "Patriots" is fine). */
const GAME_WORDS = ["riot", "apex", "valve", "cod", "ea", "cs2", "cs", "ff", "lol", "r6", "gta", "steam"];

/** Esports organisations with a distinctive name. Matched anywhere. */
const ORG_ANYWHERE = [
  "fnatic", "s8ul", "godlike", "orangutan", "cloud9", "faze", "natusvincere", "astralis", "furia", "mouz", "mousesports", "drx",
  "xspark", "papperrex", "paperrex", "100thieves", "godsreign", "evilgeniuses", "virtuspro", "sentinels", "leviatan", "karminecorp",
  "teamheretics", "gentlemates", "edwardgaming", "bilibiligaming", "revenantesports", "velocitygaming", "enigmagaming", "globalesports",
  "entitygaming", "blindesports", "oresports", "medalesports", "chemin", "truerippers", "marcosgaming", "skylightz", "numengaming",
  "galaxyracer", "reckoningesports", "nigmagalaxy", "optic", "teamliquid", "teamsecret", "teamspirit", "teamsoul", "teamvitality", "teamfalcons",
  "teaminsane", "carnivalgaming", "8bitcreatives", "hydraesports", "teamheroic", "talonesports", "bleedesports", "wolvesesports", "giantsgaming",
  "g2esports", "t1esports", "nrgesports", "loudesports", "teamtamilas", "puneripaltan",
];
/** Organisations whose name is an ordinary word or a short code. Blocked when the whole name is that word, with or without "team", "esports" or "gaming". */
const ORG_WORDS = [
  "liquid", "secret", "spirit", "soul", "vitality", "falcons", "heroic", "loud", "entity", "global", "talon", "bleed", "hydra", "revenant",
  "velocity", "enigma", "rogue", "fluxo", "trace", "giants", "koi", "g2", "t1", "c9", "og", "eg", "nrg", "tsm", "tl", "gen g", "geng", "kru", "zeta", "navi",
];

/** Slurs and abuse in English and Hindi, as whole words or inside a word. Kept short: the generator never produces them; this stops typed names. */
const SLUR_ANYWHERE = [
  "fuck", "shit", "bitch", "cunt", "nigg", "fagg", "retard", "whore", "slut", "hitler", "chutiy", "chutia", "madarch", "bhench", "behench",
  "bhosd", "gandu", "harami", "kamina", "jihad", "terrorist",
];
const SLUR_WORDS = ["rape", "nazi", "nazis", "fag", "mc", "bc", "bsdk", "randi", "lund", "lauda", "laude", "chakka", "hijra", "paki", "kkk", "porn", "sex", "isis"];

const LEET: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b", "@": "a", $: "s", "!": "i", "|": "i", "€": "e" };
/** Lower case, accents removed, look-alike digits and symbols mapped to letters. */
export function normalise(s: string): string {
  return s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[01345780@$!|€]/g, (c) => LEET[c] ?? c);
}
/** Normalised words, plain digits kept (so "T1" stays "t1" as a word as well as "ti"). */
const words = (s: string): string[] => {
  const plain = s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").split(/[^a-z0-9]+/).filter(Boolean);
  const leet = normalise(s).split(/[^a-z0-9]+/).filter(Boolean);
  return [...new Set([...plain, ...leet])];
};
const compact = (s: string): string[] => [s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, ""), normalise(s).replace(/[^a-z0-9]/g, "")];
const FILLER = new Set(["team", "the", "esports", "esport", "gaming", "gg", "clan", "squad", "official"]);

export type BlockReason = "game" | "org" | "slur";
export interface BlockResult { blocked: boolean; reason?: BlockReason }

/**
 * Fancy letters back to plain ones, so a decorated or stylish name is checked like the plain name. NFKD already turns the bold,
 * double-struck, script and full-width letters into plain ones; small capitals and a few look-alikes (Greek and Cyrillic letters
 * that look Latin) have no decomposition, so they are mapped by hand.
 */
const UNSTYLE: Record<string, string> = Object.fromEntries([
  ...SMALL_CAPS.map((c, i) => [c, String.fromCharCode(97 + i)]),
  ["ɑ", "a"], ["ɛ", "e"], ["ɩ", "i"], ["ο", "o"], ["α", "a"], ["ѕ", "s"], ["е", "e"], ["о", "o"], ["а", "a"], ["р", "p"], ["с", "c"], ["х", "x"], ["у", "y"], ["і", "i"],
]);
export function unstyle(s: string): string {
  return Array.from(s).map((c) => UNSTYLE[c] ?? c).join("").normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

/** Checks a team name against the blocklist. Stylish letters are turned back into plain ones first, so decoration cannot hide a name. */
export function checkName(raw: string): BlockResult {
  const name = unstyle(raw);
  const flat = compact(name), ws = words(name);
  const any = (list: string[]) => list.some((t) => flat.some((f) => f.includes(t)));
  const word = (list: string[]) => list.some((t) => (t.includes(" ") ? ws.join(" ").includes(t) : ws.includes(t)));
  if (any(SLUR_ANYWHERE) || word(SLUR_WORDS)) return { blocked: true, reason: "slur" };
  if (any(GAME_ANYWHERE) || word(GAME_WORDS)) return { blocked: true, reason: "game" };
  // The name without filler words, read plainly and with look-alike characters mapped ("T1" and "G0dl1ke" both count).
  const cores = [name.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, ""), normalise(name)].map((x) => x.split(/[^a-z0-9]+/).filter((w) => w && !FILLER.has(w)).join(" "));
  if (any(ORG_ANYWHERE) || cores.some((c) => ORG_WORDS.includes(c) || ORG_WORDS.includes(c.replace(/ /g, "")))) return { blocked: true, reason: "org" };
  return { blocked: false };
}

export const BLOCK_WORDS: Record<BlockReason, string> = {
  game: "It uses the name of a game, a publisher or a platform. Teams cannot use those names.",
  org: "It matches the name of an existing esports organisation. Pick a name of your own.",
  slur: "It contains a word that is abusive or hateful. Pick another name.",
};

export const NAME_MIN = 2, NAME_MAX = 32;
/** Why a typed name cannot be used, or undefined when it is fine. */
export function nameProblem(name: string): string | undefined {
  const n = name.replace(/\s+/g, " ").trim();
  if (Array.from(n).length < NAME_MIN) return `Type at least ${NAME_MIN} characters.`;
  if (Array.from(n).length > NAME_MAX) return `Keep it to ${NAME_MAX} characters.`;
  const c = checkName(n);
  return c.blocked ? BLOCK_WORDS[c.reason!] : undefined;
}

// ------------------------------------------------------------------ generator

/** A small seeded random number generator, so a list of names can be reproduced in tests. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T,>(a: readonly T[], r: () => number): T => a[Math.floor(r() * a.length)]!;

/**
 * Game presets change the shape of a name, not the words. A Free Fire guild gets short names (some written as one word), a BGMI squad
 * gets squad-style names, a Valorant or COD Mobile five gets scoreboard-style names, a clan gets clan-style names. These are style
 * choices of this tool, not rules of any game: the page never claims a game's character limit.
 */
export type Preset = "general" | "ff-guild" | "bgmi-team" | "pc-team" | "clan";
export const PRESETS: readonly { id: Preset; label: string; hint: string }[] = [
  { id: "general", label: "Any team", hint: "Two words from the theme, for any game or sport." },
  { id: "ff-guild", label: "Free Fire guild", hint: "Short names, some written as one word, for a guild or a squad." },
  { id: "bgmi-team", label: "BGMI team", hint: "Squad-style names: two words, Team ..., ... Esports or ... Squad." },
  { id: "pc-team", label: "Valorant or COD team", hint: "Names for a team of five that read well on a scoreboard." },
  { id: "clan", label: "Clan", hint: "Clan-style names: The ..., ... Clan or Order of the ..." },
];

type Format = (a: string, b: string) => string;
const FORMATS: Record<Preset, readonly Format[]> = {
  general: [(a, b) => `${a} ${b}`],
  "ff-guild": [(a, b) => `${a} ${b}`, (a, b) => `${a}${b}`],
  "bgmi-team": [(a, b) => `${a} ${b}`, (_a, b) => `Team ${b}`, (_a, b) => `${b} Esports`, (a) => `${a} Squad`],
  "pc-team": [(a, b) => `${a} ${b}`, (_a, b) => `${b} Gaming`, (a) => `${a} Five`],
  clan: [(a, b) => `The ${a} ${b}`, (_a, b) => `${b} Clan`, (_a, b) => `Order of the ${b}`],
};
/** The Free Fire guild preset keeps names to this many characters: a style choice for short names, not a rule of the game. */
export const SHORT_NAME = 14;

/** `count` different names from one theme, shaped by the preset. Any name the blocklist catches, or that repeats, is skipped. */
export function generateNames(theme: Theme, count: number, seed: number, preset: Preset = "general"): string[] {
  const w = WORDS[theme], r = rng(seed), out: string[] = [], seen = new Set<string>(), formats = FORMATS[preset];
  const max = Math.min(count, w.first.length * w.second.length);
  for (let tries = 0; out.length < max && tries < max * 40; tries++) {
    const a = pick(w.first, r), b = pick(w.second, r);
    const name = formats.length === 1 ? formats[0]!(a, b) : pick(formats, r)(a, b);
    if (a === b || seen.has(name) || checkName(name).blocked) continue;
    if (preset === "ff-guild" && Array.from(name).length > SHORT_NAME) continue;
    seen.add(name); out.push(name);
  }
  return out;
}

/** What the Indian words in a name mean, for the line under it. Also finds words written together ("BindaasToli"). */
export function glossFor(name: string): string {
  const g = WORDS.indian.gloss ?? {};
  return name.split(" ").flatMap((w) => w.match(/[A-Z][a-z]*/g) ?? [w]).filter((w) => g[w]).map((w) => `${w}: ${g[w]}`).join(", ");
}

// ------------------------------------------------------------------ stylish versions

/**
 * Stylish versions: fancy Unicode letters and decorative symbols around the name, as players use for guild and in-game names.
 * We found no reliable source for what Free Fire (or any other game) accepts in a guild or team name: Garena publishes no rule we
 * could check, and guide sites disagree on the length. So the page claims no limit, keeps the plain name next to every stylish one,
 * and tells the player to check that it fits in the game. Some phones also show symbols they lack as empty boxes.
 */
export type Letters = "plain" | "bold" | "smallcaps" | "wide";
export type Frame = "none" | "curl" | "stars" | "corner" | "mark";
export const LETTERS: readonly { id: Letters; label: string }[] = [
  { id: "plain", label: "Plain letters" }, { id: "bold", label: "Bold letters" }, { id: "smallcaps", label: "Small capitals" }, { id: "wide", label: "Wide letters" },
];
export const FRAMES: readonly { id: Frame; label: string; open: string; close: string }[] = [
  { id: "none", label: "No symbols", open: "", close: "" },
  { id: "curl", label: "Curls ꧁ ꧂", open: "꧁", close: "꧂" },
  { id: "stars", label: "Stars ★", open: "★", close: "★" },
  { id: "corner", label: "Brackets 『 』", open: "『", close: "』" },
  { id: "mark", label: "Mark 亗", open: "亗", close: "亗" },
];

/** The stylish version of a plain name. Empty when the result would not pass the blocklist (it always should: same letters). */
export function stylish(name: string, letters: Letters, frame: Frame): string {
  const body = styleLetters(name, letters);
  const f = FRAMES.find((x) => x.id === frame) ?? FRAMES[0]!;
  const out = `${f.open}${body}${f.close}`;
  return checkName(out).blocked ? "" : out;
}

/** Characters as a person counts them (a symbol such as ꧁ counts once). A game may count differently, so the page says to check. */
export { charCount };

// ------------------------------------------------------------------ badge

export type Shape = "shield" | "hexagon" | "circle" | "diamond" | "square";
export type Pattern = "plain" | "band" | "split" | "ring";
export const SHAPES: readonly { id: Shape; label: string }[] = [
  { id: "shield", label: "Shield" }, { id: "hexagon", label: "Hexagon" }, { id: "circle", label: "Circle" }, { id: "diamond", label: "Diamond" }, { id: "square", label: "Rounded square" },
];
export const PATTERNS: readonly { id: Pattern; label: string }[] = [
  { id: "plain", label: "Plain" }, { id: "band", label: "Band" }, { id: "split", label: "Split" }, { id: "ring", label: "Ring" },
];
export const COLOURS: readonly { id: string; label: string; hex: string }[] = [
  { id: "cyan", label: "Cyan", hex: "#22D3EE" }, { id: "violet", label: "Violet", hex: "#A855F7" }, { id: "red", label: "Red", hex: "#DC2626" },
  { id: "amber", label: "Amber", hex: "#F59E0B" }, { id: "green", label: "Green", hex: "#10B981" }, { id: "blue", label: "Blue", hex: "#2563EB" },
  { id: "slate", label: "Slate", hex: "#334155" }, { id: "ink", label: "Black", hex: "#05070A" }, { id: "white", label: "White", hex: "#F8FAFC" },
];
export const colourHex = (id: string): string => COLOURS.find((c) => c.id === id)?.hex ?? "#22D3EE";

/** Up to three letters: the first letter of each word, skipping filler words; one word gives its first two letters. */
export function initials(name: string): string {
  const ws = name.replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const real = ws.filter((w) => !FILLER.has(w.toLowerCase()));
  const use = real.length ? real : ws;
  if (use.length === 0) return "?";
  if (use.length === 1) return Array.from(use[0]!).slice(0, 2).join("").toUpperCase();
  return use.slice(0, 3).map((w) => Array.from(w)[0]!).join("").toUpperCase();
}

/** Relative luminance of a #rrggbb colour (WCAG). */
export function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16), ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * ch[0]! + 0.7152 * ch[1]! + 0.0722 * ch[2]!;
}
export const contrastRatio = (a: string, b: string): number => { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x! + 0.05) / (y! + 0.05); };
/** White or near-black lettering, whichever reads better on the colour. */
export const inkOn = (hex: string): string => (contrastRatio(hex, "#F8FAFC") >= contrastRatio(hex, "#05070A") ? "#F8FAFC" : "#05070A");

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The outline of each shape on a 512 x 512 canvas. */
export const SHAPE_PATH: Record<Shape, string> = {
  shield: "M256 24 L456 88 V248 C456 372 368 452 256 492 C144 452 56 372 56 248 V88 Z",
  hexagon: "M256 24 L457 140 V372 L256 488 L55 372 V140 Z",
  circle: "M256 24 A232 232 0 1 1 255.9 24 Z",
  diamond: "M256 16 L496 256 L256 496 L16 256 Z",
  square: "M120 40 H392 A80 80 0 0 1 472 120 V392 A80 80 0 0 1 392 472 H120 A80 80 0 0 1 40 392 V120 A80 80 0 0 1 120 40 Z",
};

export interface Badge { name: string; shape: Shape; pattern: Pattern; primary: string; secondary: string }

/** The badge as a standalone SVG file (512 x 512). Flat shapes, the team's initials and, if it fits, the name underneath. */
export function badgeSvg(b: Badge): string {
  const p = colourHex(b.primary), s = colourHex(b.secondary), path = SHAPE_PATH[b.shape], ink = inkOn(p);
  const ini = esc(initials(b.name)), size = ini.length >= 3 ? 150 : 190;
  const clip = `<clipPath id="c"><path d="${path}"/></clipPath>`;
  const pattern =
    b.pattern === "band" ? `<g clip-path="url(#c)"><path d="M0 330 L512 170 V250 L0 410 Z" fill="${s}"/></g>`
    : b.pattern === "split" ? `<g clip-path="url(#c)"><rect x="256" y="0" width="256" height="512" fill="${s}"/></g>`
    : b.pattern === "ring" ? `<path d="${path}" fill="none" stroke="${s}" stroke-width="28" transform="translate(256 256) scale(0.82) translate(-256 -256)"/>`
    : "";
  // A thin outline in the opposite colour keeps the letters readable where they cross a band or a split.
  const letters = `<text x="256" y="256" text-anchor="middle" dominant-baseline="central" font-family="system-ui, 'Segoe UI', Arial, sans-serif" font-weight="800" font-size="${size}" fill="${ink}" stroke="${inkOn(ink)}" stroke-width="${b.pattern === "plain" ? 0 : 6}" paint-order="stroke">${ini}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-label="${esc(b.name)} badge"><defs>${clip}</defs><path d="${path}" fill="${p}"/>${pattern}<path d="${path}" fill="none" stroke="${s}" stroke-width="12"/>${letters}</svg>`;
}

/** A safe file name, for example "monsoon-cobras-badge.svg". */
export const badgeFileName = (name: string, ext: "svg" | "png"): string => `${name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "team"}-badge.${ext}`;

/** Where "Create this team" goes. The sign-up page cannot take a team name yet, so nothing is passed or stored. */
export const CREATE_TEAM_HREF = "/signup/";
