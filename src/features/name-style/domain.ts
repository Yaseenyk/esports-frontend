/**
 * Player name styles for Free Fire and BGMI: a typed name turned into fancy letters, symbol frames and an optional clan tag, plus a
 * ready-made list of names made by this engine at build time. Pure, so the lists and the checks are unit tested in node.
 *
 * What we could and could not verify (checked 25 Nov 2026), and therefore what the pages may say:
 * - Free Fire: Garena's own help centre (Brazil) says a nickname is changed with Diamonds or a Nickname Change Card, and asks players to
 *   avoid special characters because Garena cannot promise they show on every device. It gives no character limit and no price.
 * - BGMI: the BGMI help centre has a "How do I change my name?" page about the Rename Card. Its server refused our connection, so the
 *   pages link it and add no detail from it. No character limit or symbol rule could be verified.
 * So the pages give no character limit for either game, never promise a symbol works, keep the plain name next to every style, and
 * tell the player to check in the game.
 */
import { SUPPORT, charCount, styleLetters, type FontSupport, type LetterStyle } from "@/features/shared/fancy-text";
import { checkName, rng } from "@/features/team-name/domain";

export type Game = "free-fire" | "bgmi";
export type Lang = "en" | "pt-BR";

export const CHECKED = "25 Nov 2026";
export const SOURCES = {
  ffNickname: "https://ffsuporte.garena.com/support/solutions/articles/154000130473-como-faco-para-trocar-meu-nickname-",
  bgmiRename: "https://help.battlegroundsmobileindia.com/hc/en/6-bgmi/faq/530-how-do-i-change-my-name/",
} as const;

/** The letter styles shown on the page, in order: the plain name first, then the styles most fonts draw, then the newer ones. */
export const STYLES: readonly LetterStyle[] = ["plain", "smallcaps", "wide", "circled", "bold", "bolditalic", "sans", "script", "fraktur", "double", "mono"];
export const STYLE_LABEL: Record<Lang, Record<LetterStyle, string>> = {
  en: { plain: "Plain", smallcaps: "Small capitals", wide: "Wide", circled: "Circled", bold: "Bold", bolditalic: "Bold italic", sans: "Sans bold", script: "Script", fraktur: "Gothic", double: "Outline", mono: "Typewriter" },
  "pt-BR": { plain: "Normal", smallcaps: "Versalete", wide: "Larga", circled: "Em círculo", bold: "Negrito", bolditalic: "Negrito itálico", sans: "Sem serifa negrito", script: "Cursiva", fraktur: "Gótica", double: "Contorno", mono: "Máquina de escrever" },
};

/** Symbol frames around the name. All are single characters inside the Basic Multilingual Plane. */
export type Frame = "none" | "curl" | "mark" | "corner" | "star" | "cross" | "crown" | "wave";
export const FRAMES: readonly { id: Frame; open: string; close: string }[] = [
  { id: "none", open: "", close: "" },
  { id: "curl", open: "꧁", close: "꧂" },
  { id: "mark", open: "亗", close: "亗" },
  { id: "corner", open: "『", close: "』" },
  { id: "star", open: "★", close: "★" },
  { id: "cross", open: "乂", close: "乂" },
  { id: "crown", open: "♛", close: "♛" },
  { id: "wave", open: "彡", close: "彡" },
];

/** Ways to put a clan tag before the name. */
export type TagStyle = "bar" | "corner" | "dot";
export const TAG_STYLES: readonly { id: TagStyle; make: (tag: string) => string }[] = [
  { id: "bar", make: (t) => `${t}丨` },
  { id: "corner", make: (t) => `『${t}』` },
  { id: "dot", make: (t) => `${t}•` },
];

/** This tool's own input limits (not a game's rule, which we could not verify). */
export const NAME_INPUT_MAX = 24;
export const TAG_MAX = 5;

export interface Variant { style: LetterStyle; text: string; chars: number; support: FontSupport }

/** One styled name: optional clan tag, then the frame around the styled name. Letters in the tag get the same style. */
export function styleName(name: string, style: LetterStyle, frame: Frame, tag = "", tagStyle: TagStyle = "bar"): string {
  const n = name.normalize("NFC").replace(/\s+/g, " ").trim();
  const f = FRAMES.find((x) => x.id === frame) ?? FRAMES[0]!;
  const t = tag.normalize("NFC").replace(/\s+/g, "").trim();
  const tagText = t ? (TAG_STYLES.find((x) => x.id === tagStyle) ?? TAG_STYLES[0]!).make(styleLetters(t, style)) : "";
  return `${tagText}${f.open}${styleLetters(n, style)}${f.close}`;
}

/** Every style of one name with one frame, plain first. */
export function variants(name: string, frame: Frame, tag = "", tagStyle: TagStyle = "bar"): Variant[] {
  return STYLES.map((style) => { const text = styleName(name, style, frame, tag, tagStyle); return { style, text, chars: charCount(text), support: SUPPORT[style] }; });
}

export type Problem = "empty" | "long" | "tag" | "slur";
export const PROBLEM_TEXT: Record<Lang, Record<Problem, string>> = {
  en: {
    empty: "Type a name to see the styles.",
    long: `Keep it to ${NAME_INPUT_MAX} characters in this box.`,
    tag: `Keep the clan tag to ${TAG_MAX} characters.`,
    slur: "That name contains an abusive or hateful word. Try another name.",
  },
  "pt-BR": {
    empty: "Digite um nome para ver os estilos.",
    long: `Use até ${NAME_INPUT_MAX} caracteres nesta caixa.`,
    tag: `Use até ${TAG_MAX} caracteres na tag do clã.`,
    slur: "Esse nome tem uma palavra ofensiva ou de ódio. Tente outro nome.",
  },
};

/**
 * Why a typed name cannot be styled, or undefined. Only abusive words are refused: a player's own nickname may mention a game
 * (unlike a team name), so the game and organisation parts of the blocklist do not apply here.
 */
export function nameProblem(name: string, tag = ""): Problem | undefined {
  const n = name.replace(/\s+/g, " ").trim();
  if (!n) return "empty";
  if (charCount(n) > NAME_INPUT_MAX) return "long";
  if (charCount(tag.trim()) > TAG_MAX) return "tag";
  const c = checkName(`${tag} ${n}`);
  return c.blocked && c.reason === "slur" ? "slur" : undefined;
}

// ------------------------------------------------------------------ ready-made names

/** Word lists for the ready-made names: our own words, no gods, no brands, no real player or team names. */
const FIRST = ["Silent", "Iron", "Swift", "Frost", "Shadow", "Golden", "Rapid", "Night", "Storm", "Steel", "Ghost", "Blaze", "Lucky", "Wild", "Toofani", "Tez", "Desi", "Mast", "Dark", "Lone", "Red", "Neon", "Calm", "Quick"];
const SECOND = ["Cobra", "Hawk", "Wolf", "Kite", "Owl", "Raven", "Shark", "Viper", "Baaz", "Bijli", "Yodha", "Toofan", "Sniper", "Ninja", "Rider", "Hunter", "Tiger", "Lynx", "Fox", "Orca", "Comet", "Bolt", "Ace", "Spark"];

/** The plain names are kept to this many letters, a style choice for short names (no game's limit could be verified). */
export const READY_MAX = 12;

export interface ReadyName { plain: string; styled: string; style: LetterStyle; frame: Frame; support: FontSupport }

/** `count` names made by this engine, the same every build for a game. Each has a plain spelling and one styled version. */
export function readyNames(game: Game, count = 60): ReadyName[] {
  const r = rng(game === "free-fire" ? 2611 : 3411), out: ReadyName[] = [], seen = new Set<string>();
  const styles = STYLES.filter((s) => s !== "plain"), frames = FRAMES.filter((f) => f.id !== "none");
  for (let tries = 0; out.length < count && tries < count * 50; tries++) {
    const a = FIRST[Math.floor(r() * FIRST.length)]!, b = SECOND[Math.floor(r() * SECOND.length)]!;
    const plain = r() < 0.5 ? `${a}${b}` : `${a}_${b}`;
    const key = plain.replace("_", "").toLowerCase();
    if (seen.has(key) || charCount(plain) > READY_MAX || checkName(plain).blocked) continue;
    const style = styles[Math.floor(r() * styles.length)]!, frame = frames[Math.floor(r() * frames.length)]!.id;
    seen.add(key);
    out.push({ plain, styled: styleName(plain, style, frame), style, frame, support: SUPPORT[style] });
  }
  return out;
}

/** Symbols players put in names, each a single character. "common": drawn by most fonts. Emoji-like ones may show in colour. */
export const SYMBOLS: readonly { char: string; en: string; pt: string }[] = [
  { char: "꧁", en: "Javanese curl, left", pt: "Arabesco javanês, esquerdo" }, { char: "꧂", en: "Javanese curl, right", pt: "Arabesco javanês, direito" },
  { char: "亗", en: "Mark", pt: "Marca" }, { char: "乂", en: "Cross", pt: "Cruz" }, { char: "彡", en: "Wave", pt: "Onda" }, { char: "么", en: "Hook", pt: "Gancho" },
  { char: "『", en: "Corner bracket, left", pt: "Colchete de canto, esquerdo" }, { char: "』", en: "Corner bracket, right", pt: "Colchete de canto, direito" },
  { char: "【", en: "Black bracket, left", pt: "Colchete preto, esquerdo" }, { char: "】", en: "Black bracket, right", pt: "Colchete preto, direito" },
  { char: "丨", en: "Bar", pt: "Barra" }, { char: "•", en: "Dot", pt: "Ponto" }, { char: "×", en: "Times", pt: "Vezes" },
  { char: "★", en: "Star", pt: "Estrela" }, { char: "☆", en: "Star outline", pt: "Estrela vazada" }, { char: "✦", en: "Four-point star", pt: "Estrela de quatro pontas" },
  { char: "♛", en: "Crown", pt: "Coroa" }, { char: "♚", en: "King", pt: "Rei" }, { char: "☠", en: "Skull", pt: "Caveira" },
  { char: "⚡", en: "Lightning", pt: "Raio" }, { char: "✿", en: "Flower", pt: "Flor" }, { char: "♡", en: "Heart outline", pt: "Coração vazado" },
  { char: "ツ", en: "Smile (katakana tsu)", pt: "Sorriso (katakana tsu)" }, { char: "〆", en: "Closing mark", pt: "Marca de fechamento" },
  { char: "ᴷᴵᴺᴳ", en: "Small raised KING (four letters)", pt: "KING pequeno elevado (quatro letras)" }, { char: "ᴾᴿᴼ", en: "Small raised PRO (three letters)", pt: "PRO pequeno elevado (três letras)" },
];
