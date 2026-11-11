import type { CSSProperties } from "react";
import { FONTS, type FontKey } from "./idcard/types";

/**
 * Designs for the display screens. A design is more than colours: it also sets the font, the shape of a row, how the rank is shown,
 * how the title looks and what pattern sits behind the content, so two designs look like different broadcast packages.
 * Pure data and pure functions, so every design can be tested without a browser.
 */
export type RowStyle = "pill" | "slab" | "slant" | "outline" | "glass" | "stripe";
export type RankStyle = "plain" | "block" | "circle";
export type HeadStyle = "plain" | "bar" | "underline";
export type ThemeGroup = "Stream" | "Venue" | "Light";

export interface DisplayTheme {
  id: string; name: string; group: ThemeGroup; tags: string[];
  fg: string; soft: string; accent: string; accent2: string;
  /** Text colour on top of the accent colour (rank blocks, the title bar, NOW tags). */
  on: string;
  /** Row fill and line colour. */
  row: string; line: string;
  /** A solid colour for the screen. Used for contrast checks and as the page colour. */
  base: string;
  /** The full background (may be a gradient). */
  bg: string;
  /** A pattern drawn over the background and under the content. */
  deco?: string; decoSize?: string;
  font: FontKey; upper: boolean;
  rows: RowStyle; rank: RankStyle; head: HeadStyle;
  /** Corner radius for rows and cards, in vmin. */
  radius: number;
  medals: [string, string, string];
}

const GOLD = ["#facc15", "#d4d4d8", "#d97706"] as [string, string, string];

export const DISPLAY_THEMES: DisplayTheme[] = [
  { id: "dark", name: "Midnight", group: "Stream", tags: ["clean", "default"], fg: "#f4f4f5", soft: "#a1a1aa", accent: "#22d3ee", accent2: "#a855f7", on: "#05070a", row: "rgba(255,255,255,.06)", line: "rgba(255,255,255,.14)", base: "#05070a", bg: "#05070a", font: "body", upper: false, rows: "pill", rank: "plain", head: "plain", radius: 1.2, medals: GOLD },
  { id: "neon", name: "Neon Grid", group: "Stream", tags: ["neon", "gaming"], fg: "#ffffff", soft: "#c4b5fd", accent: "#22d3ee", accent2: "#f472b6", on: "#05070a", row: "rgba(168,85,247,.16)", line: "rgba(34,211,238,.4)", base: "#0b0220", bg: "linear-gradient(160deg,#0b0220,#150636)", deco: "linear-gradient(rgba(34,211,238,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,.08) 1px,transparent 1px)", decoSize: "6vmin 6vmin", font: "display", upper: false, rows: "glass", rank: "plain", head: "underline", radius: 1.4, medals: GOLD },
  { id: "stadium", name: "Stadium Lights", group: "Venue", tags: ["broadcast", "bold"], fg: "#ffffff", soft: "#9fb3d1", accent: "#facc15", accent2: "#38bdf8", on: "#0a1226", row: "rgba(255,255,255,.07)", line: "rgba(250,204,21,.35)", base: "#0a1226", bg: "radial-gradient(70% 45% at 50% 0%,#1d3a78 0%,#0a1226 70%)", font: "bebas", upper: true, rows: "slant", rank: "block", head: "bar", radius: 0.6, medals: GOLD },
  { id: "crimson", name: "Crimson Strike", group: "Stream", tags: ["aggressive", "red"], fg: "#ffffff", soft: "#d9a3ad", accent: "#ff3b57", accent2: "#ff7a45", on: "#12060a", row: "rgba(255,59,87,.10)", line: "rgba(255,59,87,.45)", base: "#12060a", bg: "linear-gradient(120deg,#12060a,#2a0a14)", deco: "repeating-linear-gradient(115deg,rgba(255,59,87,.07) 0 1.2vmin,transparent 1.2vmin 5vmin)", font: "anton", upper: true, rows: "slab", rank: "block", head: "bar", radius: 0, medals: ["#ffd23f", "#e5e7eb", "#ff9f43"] },
  { id: "gold", name: "Gold Rush", group: "Venue", tags: ["premium", "awards"], fg: "#fbf3da", soft: "#b8a36b", accent: "#e7c35a", accent2: "#b8862b", on: "#1a1405", row: "rgba(231,195,90,.06)", line: "rgba(231,195,90,.5)", base: "#0b0b10", bg: "linear-gradient(160deg,#0b0b10,#1b1710)", font: "montserrat", upper: true, rows: "outline", rank: "circle", head: "underline", radius: 1, medals: ["#f5d77a", "#d9dde3", "#c98a4b"] },
  { id: "synthwave", name: "Synthwave", group: "Stream", tags: ["retro", "neon"], fg: "#fff0fb", soft: "#d6a8e6", accent: "#ff4fd8", accent2: "#ffb347", on: "#1a0b3a", row: "rgba(255,79,216,.12)", line: "rgba(255,79,216,.45)", base: "#1a0b3a", bg: "linear-gradient(180deg,#1a0b3a 0%,#3a0b3a 70%,#5a0b4a 100%)", deco: "radial-gradient(40% 30% at 50% 100%,rgba(255,179,71,.28),transparent 70%)", font: "display", upper: true, rows: "glass", rank: "circle", head: "underline", radius: 1.8, medals: GOLD },
  { id: "toxic", name: "Toxic Terminal", group: "Stream", tags: ["hacker", "green"], fg: "#e8ffd0", soft: "#86a368", accent: "#b6ff3b", accent2: "#3bff9d", on: "#071002", row: "rgba(182,255,59,.06)", line: "rgba(182,255,59,.4)", base: "#050805", bg: "#050805", deco: "repeating-linear-gradient(0deg,rgba(182,255,59,.05) 0 1px,transparent 1px 4px)", font: "mono", upper: true, rows: "outline", rank: "plain", head: "bar", radius: 0.4, medals: ["#b6ff3b", "#d1fae5", "#fbbf24"] },
  { id: "carbon", name: "Carbon Orange", group: "Venue", tags: ["racing", "orange"], fg: "#ffffff", soft: "#a3a3ab", accent: "#ff8a1f", accent2: "#ffc247", on: "#1a0d00", row: "rgba(255,255,255,.06)", line: "rgba(255,138,31,.4)", base: "#0e0e10", bg: "linear-gradient(145deg,#0e0e10,#1c1c20)", deco: "repeating-linear-gradient(45deg,rgba(255,255,255,.035) 0 .4vmin,transparent .4vmin 1.2vmin)", font: "oswald", upper: true, rows: "slab", rank: "block", head: "bar", radius: 0.3, medals: ["#ffc247", "#d4d4d8", "#d97706"] },
  { id: "pitch", name: "Pitch", group: "Venue", tags: ["football", "cricket", "sports"], fg: "#ffffff", soft: "#bfe3c8", accent: "#fde047", accent2: "#ffffff", on: "#052e16", row: "rgba(255,255,255,.10)", line: "rgba(255,255,255,.3)", base: "#0b3d20", bg: "linear-gradient(180deg,#0e4a27,#0a3a1d)", deco: "repeating-linear-gradient(90deg,rgba(255,255,255,.04) 0 10vmin,transparent 10vmin 20vmin)", font: "oswald", upper: true, rows: "stripe", rank: "block", head: "underline", radius: 0, medals: ["#fde047", "#e5e7eb", "#fdba74"] },
  { id: "royal", name: "Royal Violet", group: "Stream", tags: ["premium", "violet"], fg: "#f4efff", soft: "#a89bd6", accent: "#8b5cf6", accent2: "#22d3ee", on: "#0c0820", row: "rgba(139,92,246,.14)", line: "rgba(139,92,246,.5)", base: "#0c0820", bg: "linear-gradient(140deg,#0c0820,#1d1048)", font: "poppins", upper: false, rows: "glass", rank: "circle", head: "plain", radius: 1.6, medals: ["#fcd34d", "#e5e7eb", "#fb923c"] },
  { id: "light", name: "Daylight", group: "Light", tags: ["clean", "projector"], fg: "#111827", soft: "#4b5563", accent: "#0e7490", accent2: "#7c3aed", on: "#ffffff", row: "rgba(17,24,39,.06)", line: "rgba(17,24,39,.18)", base: "#ffffff", bg: "#ffffff", font: "body", upper: false, rows: "pill", rank: "plain", head: "plain", radius: 1.2, medals: ["#b45309", "#52525b", "#9a3412"] },
  { id: "arctic", name: "Arctic", group: "Light", tags: ["minimal", "blue"], fg: "#0b1b34", soft: "#52688a", accent: "#2563eb", accent2: "#38bdf8", on: "#ffffff", row: "rgba(37,99,235,.07)", line: "rgba(37,99,235,.25)", base: "#eef5ff", bg: "linear-gradient(160deg,#f4f9ff,#dbeafe)", font: "poppins", upper: false, rows: "stripe", rank: "circle", head: "underline", radius: 0, medals: ["#b45309", "#475569", "#9a3412"] },
  { id: "paper", name: "Scoreboard Paper", group: "Light", tags: ["print", "mono"], fg: "#111111", soft: "#555555", accent: "#111111", accent2: "#555555", on: "#ffffff", row: "rgba(0,0,0,.05)", line: "rgba(0,0,0,.35)", base: "#f7f5ef", bg: "#f7f5ef", font: "mono", upper: false, rows: "outline", rank: "block", head: "bar", radius: 0.3, medals: ["#111111", "#444444", "#666666"] },
  { id: "sakura", name: "Sakura", group: "Light", tags: ["playful", "pink"], fg: "#3a1030", soft: "#8a4a6e", accent: "#be185d", accent2: "#f472b6", on: "#ffffff", row: "rgba(236,72,153,.09)", line: "rgba(190,24,93,.3)", base: "#fff5f8", bg: "linear-gradient(160deg,#fff5f8,#ffe3ee)", font: "poppins", upper: false, rows: "pill", rank: "circle", head: "plain", radius: 2.2, medals: ["#b45309", "#52525b", "#9a3412"] },
];

export const THEME_IDS = DISPLAY_THEMES.map((t) => t.id);
export const themeById = (id: string | null | undefined): DisplayTheme => DISPLAY_THEMES.find((t) => t.id === id) ?? DISPLAY_THEMES[0]!;
export const fontCss = (t: DisplayTheme) => FONTS[t.font].css;

/** The box a row, card or tile sits in, in this design. `i` is the row number (for stripes). */
export function surface(t: DisplayTheme, i = 0): CSSProperties {
  const r = `${t.radius}vmin`;
  switch (t.rows) {
    case "slab": return { background: t.row, borderRadius: r, borderLeft: `.9vmin solid ${t.accent}` };
    case "slant": return { background: t.row, borderRadius: r, clipPath: "polygon(0 0, 100% 0, calc(100% - 1.6vmin) 100%, 0 100%)", borderLeft: `.5vmin solid ${t.accent}` };
    case "outline": return { background: "transparent", borderRadius: r, border: `.25vmin solid ${t.line}` };
    case "glass": return { background: t.row, borderRadius: r, border: `.15vmin solid ${t.line}`, backdropFilter: "blur(1vmin)" };
    case "stripe": return { background: i % 2 === 0 ? t.row : "transparent", borderRadius: 0, borderBottom: `.12vmin solid ${t.line}` };
    default: return { background: t.row, borderRadius: r };
  }
}

/** The rank number, in this design's style. Rows 0 to 2 use the medal colours. */
export function rankStyle(t: DisplayTheme, i: number): CSSProperties {
  const medal = i < 3 ? t.medals[i]! : null;
  const onMedal = medal && contrast(medal, "#0b0b0b") >= 4.5 ? "#0b0b0b" : "#ffffff"; // dark text on a light medal, white on a dark one
  if (t.rank === "block") return { background: medal ?? t.accent, color: medal ? onMedal : t.on, borderRadius: `${Math.min(t.radius, 0.8)}vmin`, padding: ".2vmin 0", textAlign: "center", fontWeight: 800 };
  if (t.rank === "circle") return { background: medal ?? t.row, color: medal ? onMedal : t.fg, borderRadius: "50%", width: "5.2vmin", height: "5.2vmin", display: "grid", placeItems: "center", fontWeight: 800, border: medal ? "none" : `.2vmin solid ${t.line}` };
  return { color: medal ?? t.soft, fontWeight: 800 };
}

/** Relative luminance and contrast, for tests and checks. Accepts #rgb or #rrggbb. */
export function contrast(a: string, b: string): number {
  const lum = (hex: string) => {
    const h = hex.replace("#", ""); const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const [r, g, bl] = [0, 2, 4].map((k) => parseInt(full.slice(k, k + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r! + 0.7152 * g! + 0.0722 * bl!;
  };
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x! + 0.05) / (y! + 0.05);
}
