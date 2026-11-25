/**
 * Fancy letters: plain A to Z, a to z and 0 to 9 mapped to look-alike Unicode letters (bold, script, small capitals and so on).
 * Pure, shared by the team name generator (guild and team names) and the player name style pages.
 *
 * Facts about Unicode, not about any game: the "maths" alphabets (bold, bold italic, bold script, bold fraktur, double-struck, sans bold,
 * monospace) sit outside the Basic Multilingual Plane, so older phones and some game fonts may draw them as empty boxes. Small capitals,
 * full-width (wide) and circled letters are inside it and are drawn by more fonts. Neither group is promised to work in any game.
 */

export type LetterStyle = "plain" | "bold" | "smallcaps" | "wide" | "bolditalic" | "script" | "fraktur" | "double" | "sans" | "mono" | "circled";

/** How widely fonts draw a style: "plain" letters everywhere, "common" symbols in most fonts, "newer" only in newer fonts. */
export type FontSupport = "plain" | "common" | "newer";

export const SMALL_CAPS = Array.from("ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢ");

const shift = (c: string, upper: number, lower: number, digit?: number): string => {
  const n = c.charCodeAt(0);
  if (n >= 65 && n <= 90) return String.fromCodePoint(upper + n - 65);
  if (n >= 97 && n <= 122) return String.fromCodePoint(lower + n - 97);
  if (digit !== undefined && n >= 48 && n <= 57) return String.fromCodePoint(digit + n - 48);
  return c;
};

/** Double-struck capitals that Unicode had already encoded elsewhere (the maths block leaves holes for them). */
const DOUBLE_HOLES: Record<string, string> = { C: "ℂ", H: "ℍ", N: "ℕ", P: "ℙ", Q: "ℚ", R: "ℝ", Z: "ℤ" };

const MAP: Record<Exclude<LetterStyle, "plain">, (c: string) => string> = {
  bold: (c) => shift(c, 0x1d400, 0x1d41a, 0x1d7ce),
  bolditalic: (c) => shift(c, 0x1d468, 0x1d482, 0x1d7ce),
  script: (c) => shift(c, 0x1d4d0, 0x1d4ea),
  fraktur: (c) => shift(c, 0x1d56c, 0x1d586),
  double: (c) => DOUBLE_HOLES[c] ?? shift(c, 0x1d538, 0x1d552, 0x1d7d8),
  sans: (c) => shift(c, 0x1d5d4, 0x1d5ee, 0x1d7ec),
  mono: (c) => shift(c, 0x1d670, 0x1d68a, 0x1d7f6),
  wide: (c) => shift(c, 0xff21, 0xff41, 0xff10),
  smallcaps: (c) => { const l = c.toLowerCase(); return l >= "a" && l <= "z" ? SMALL_CAPS[l.charCodeAt(0) - 97]! : c; },
  circled: (c) => (c === "0" ? "⓪" : c >= "1" && c <= "9" ? String.fromCodePoint(0x2460 + c.charCodeAt(0) - 49) : shift(c, 0x24b6, 0x24d0)),
};

export const SUPPORT: Record<LetterStyle, FontSupport> = {
  plain: "plain", smallcaps: "common", wide: "common", circled: "common",
  bold: "newer", bolditalic: "newer", script: "newer", fraktur: "newer", double: "newer", sans: "newer", mono: "newer",
};

/** Letters outside A to Z and 0 to 9 (accents such as ç, ã, é, other scripts, symbols) are kept as they are. */
export function styleLetters(text: string, style: LetterStyle): string {
  const s = text.normalize("NFC");
  if (style === "plain") return s;
  const f = MAP[style];
  return Array.from(s).map(f).join("");
}

/** Characters as a person counts them (a symbol such as ꧁ counts once). A game may count differently. */
export const charCount = (s: string): number => Array.from(s).length;
