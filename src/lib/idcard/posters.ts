import { uid, type El, type Fmt, type FontKey, type Pattern } from "./types";

/**
 * Poster and app-pass themes, built to the proportions, colours and type of the reference designs: every position below was measured
 * from them (as a share of the card), and the colours were sampled from the pictures. The artwork, logos and people in the references are
 * not copied; each piece here is an original element that can be moved or restyled in the editor.
 *
 * A is the card's height divided by its width. It is used to make rotated type and circles physically correct.
 */
export interface PosterDef {
  id: string; name: string; tags: string[];
  /** The card types this layout is drawn for. */
  fmts: Fmt[];
  bg: { a: string; b: string; angle: number; pattern?: Pattern };
  /** The classic palette used if the card type is changed to a shape the layout does not suit. */
  fallback: string;
  build: (A: number) => El[];
}

const rect = (x: number, y: number, w: number, h: number, fill: string, o: Partial<El> = {}): El => ({ id: uid(), kind: "rect", x, y, w, h, rot: 0, opacity: 1, fill, radius: 0, ...o });
const ell = (x: number, y: number, w: number, h: number, fill: string, o: Partial<El> = {}): El => ({ id: uid(), kind: "ellipse", x, y, w, h, rot: 0, opacity: 1, fill, ...o });
const fld = (field: El["field"], x: number, y: number, w: number, h: number, size: number, color: string, font: FontKey, o: Partial<El> = {}): El => ({ id: uid(), kind: "field", field, x, y, w, h, rot: 0, opacity: 1, size, color, font, weight: 800, align: "left", ...o });
const txt = (text: string, x: number, y: number, w: number, h: number, size: number, color: string, font: FontKey, o: Partial<El> = {}): El => ({ id: uid(), kind: "text", text, x, y, w, h, rot: 0, opacity: 1, size, color, font, weight: 600, align: "left", ...o });
const cut = (x: number, y: number, w: number, h: number, o: Partial<El> = {}): El => ({ id: uid(), kind: "photo", cutout: true, x, y, w, h, rot: 0, opacity: 1, color: "#334155", ...o });
const frame = (x: number, y: number, w: number, h: number, radius: number, o: Partial<El> = {}): El => ({ id: uid(), kind: "photo", x, y, w, h, rot: 0, opacity: 1, radius, fill: "#00000033", ...o });
const qr = (x: number, y: number, w: number, h: number, o: Partial<El> = {}): El => ({ id: uid(), kind: "qr", x, y, w, h, rot: 0, opacity: 1, color: "#111111", fill: "#ffffff", radius: 3, ...o });

/** Vertical detail centred on (cx, cy). lenH is how long it runs as a share of the card height, thick how thick as a share of the card width. */
function vert(field: El["field"], cx: number, cy: number, lenH: number, thick: number, A: number, rot: -90 | 90, color: string, font: FontKey, o: Partial<El> = {}): El {
  const w = lenH * A, h = thick / A;
  return fld(field, cx - w / 2, cy - h / 2, w, h, thick * 0.82, color, font, { rot, upper: true, align: "center", ...o });
}

/** A diagonal ribbon centred on (cx, cy): a coloured band with the same detail repeated along it. */
const ribbon = (field: El["field"], cx: number, cy: number, w: number, h: number, rot: number, fill: string, color: string, size: number, o: Partial<El> = {}): El =>
  fld(field, cx - w / 2, cy - h / 2, w, h, size, color, "montserrat", { rot, ticker: true, fill, upper: true, italic: true, spacing: 0.1, ...o });

// ---------------------------------------------------------------- App pass: a phone screen, from the mobile ID UI reference
const pass = (dark: boolean) => (A: number): El[] => {
  const top = dark ? "#141416" : "#0b0b0c";
  const tile1 = dark ? "#1d1d1f" : "#e8f8dc", tile2 = dark ? "#262628" : "#dbeafc";
  const label = dark ? "#8d8d93" : "#8a9a82", val = dark ? "#ffffff" : "#111111", foot = dark ? "#6b6b70" : "#8d8d92";
  const qw = 31.9;
  return [
    rect(0, 0, 100, 29, top), ell(-18, 15, 136, 26, top),
    txt("←", 7.2, 5.6, 8, 4.4, 5.6, "#ffffff", "poppins", { weight: 500 }),
    txt("ID Card", 15, 5.9, 40, 4, 4.3, "#ffffff", "poppins", { weight: 500 }),
    txt("···", 80, 5.6, 14, 4.4, 5.4, "#ffffff", "poppins", { weight: 700, align: "right" }),
    rect(5.8, 12.3, 85.2, 40.6, "#f6dbd9", { radius: 8 }),
    cut(5.8, 12.3, 85.2, 40.6, { color: "#d9382f", radius: 8, fade: false }),
    fld("name", 14.4, 50.7, 68.9, 5.2, 4.1, "#ffffff", "poppins", { align: "center", upper: true, weight: 600, fill: dark ? "#0c0c0d" : "#151515", radius: 50, spacing: 0.1 }),
    rect(5.8, 58.1, 40.9, 23.6, tile1, { radius: 12 }), rect(50.6, 58.1, 41.2, 23.6, tile2, { radius: 12 }),
    txt("Birth date", 9.7, 60.4, 34, 2.6, 3, label, "poppins", { weight: 400 }), fld("dob", 9.7, 63.1, 34, 3.4, 4.2, val, "poppins", { weight: 600 }),
    txt("Role", 9.7, 67.8, 34, 2.6, 3, label, "poppins", { weight: 400 }), fld("role", 9.7, 70.5, 34, 3.4, 4.2, val, "poppins", { weight: 600, upper: true }),
    txt("Team", 9.7, 75.2, 34, 2.6, 3, label, "poppins", { weight: 400 }), fld("team", 9.7, 77.9, 34, 3.4, 4.2, val, "poppins", { weight: 600 }),
    qr(50.6 + (41.2 - qw) / 2, 60.7, qw, qw / A, { radius: 10 }),
    fld("id", 50.6, 60.7 + qw / A + 1.3, 41.2, 3.2, 3.5, val, "poppins", { align: "center", weight: 500 }),
    txt("⬡", 40, 86.6, 20, 4.4, 6.4, foot, "poppins", { align: "center", weight: 500 }),
    fld("event", 8, 91.4, 84, 2.6, 2.7, foot, "poppins", { align: "center", weight: 500, upper: true, spacing: 0.1 }),
    fld("game", 8, 94.3, 84, 2.4, 2.2, foot, "poppins", { align: "center", weight: 400 }),
  ];
};

// ---------------------------------------------------------------- Campus Blue: giant vertical words behind a cut-out, name tag at the foot
const campus = (A: number): El[] => [
  vert("last", 22.6, 46, 75, 25, A, -90, "#cdd1d0", "anton", { opacity: 0.92 }),
  vert("team", 75.4, 35, 47, 25, A, 90, "#cdd1d0", "anton", { opacity: 0.92 }),
  fld("event", 8, 4.6, 84, 3.2, 2.9, "#ffffff", "poppins", { align: "center", weight: 600, upper: true, spacing: 0.25, opacity: 0.9 }),
  cut(12.7, 9, 76, 79, { color: "#0f2a52", shadow: true }),
  rect(0, 62, 100, 38, "rgba(2,66,140,0)", { fill2: "rgba(3,64,138,0.97)", ang: 180 }),
  fld("first", 9.2, 87.9, 36, 6.4, 12, "#ffffff", "anton", { fill: "#0a5ccf", upper: true, align: "left", weight: 400 }),
  fld("game", 49, 88.4, 42, 5.4, 6, "#ffffff", "anton", { align: "right", upper: true, weight: 400, opacity: 0.95 }),
  fld("id", 9.2, 95.4, 80, 2.4, 2.2, "#cfe8ff", "poppins", { weight: 500, spacing: 0.2 }),
];

// ---------------------------------------------------------------- Crew Stack: layered grey panels, outline word stack, sticker-outlined cut-out
const crew = (A: number): El[] => [
  rect(4.5, 4.6, 81, 86.4, "#aeabaa", { radius: 6, opacity: 0.85 }),
  rect(15, 8, 85, 89, "#827f7e", { radius: 6, opacity: 0.8 }),
  rect(9.4, 6.2, 85.8, 86.6, "#555457", { radius: 6, fill2: "#3d3b3e", ang: 200 }),
  rect(9.4, 6.2, 11.8, 86.6, "#8e8a89", { radius: 6, opacity: 0.55 }),
  fld("event", 24.7, 10, 64.6, 16.1, 7.4, "#ffffff", "poppins", { fill: "#d7d7d8", radius: 7, align: "center", weight: 700, upper: true, opacity: 0.9 }),
  fld("role", 24, 31, 68, 44, 22, "#ffffff", "anton", { outline: true, stroke: "#ffffff", strokeW: 0.2, repeat: 4, upper: true, align: "center", weight: 400, opacity: 0.9 }),
  cut(28, 36, 67, 54, { color: "#33373f", sticker: "#ffffff", shadow: true }),
  vert("name", 15.3, 46.5, 41, 9.2, A, -90, "#ffffff", "anton", { italic: true, weight: 400, spacing: 0.2 }),
  fld("role", 24, 78, 69, 12.5, 26, "#d8d8d9", "anton", { align: "center", upper: true, weight: 400 }),
  fld("id", 14, 89.5, 77, 4.8, 3.6, "#2b2b2d", "poppins", { fill: "#aaa7a6", radius: 50, align: "center", weight: 600, spacing: 0.15 }),
];

// ---------------------------------------------------------------- Squad Maroon: lattice, outlined title, red block, vertical word, maroon base
const maroon = (A: number): El[] => [
  fld("team", 8.2, 3.6, 31.6, 4.6, 4, "#ffffff", "bebas", { fill: "#570d0e", upper: true, weight: 400, spacing: 0.1 }),
  rect(8.5, 9.3, 84, 14.9, "transparent", { stroke: "#570d0e", strokeW: 0.55 }),
  fld("game", 10, 9.8, 81, 14, 30, "#570d0e", "anton", { align: "center", upper: true, weight: 400 }),
  rect(8.4, 28.9, 35.9, 52.1, "#d2423f", { fill2: "#a82a2e", ang: 170 }),
  vert("role", 69, 37.5, 17, 14, A, 90, "#570d0e", "anton", { weight: 400 }),
  cut(18, 20.5, 66, 66, { color: "#1d1b1c", shadow: true }),
  vert("team", 85.5, 55.5, 53, 16, A, 90, "#570d0e", "anton", { weight: 400 }),
  fld("name", 12.3, 71.4, 35.7, 4.5, 6.4, "#570d0e", "anton", { fill: "#ffffff", upper: true, weight: 400 }),
  rect(0, 86.4, 100, 13.6, "#570d0e"),
  fld("role", 10.5, 88.6, 40, 10, 17, "#ffffff", "anton", { upper: true, weight: 400 }),
  fld("event", 52, 89.4, 42, 3.2, 2.5, "#ffffff", "poppins", { align: "right", upper: true, weight: 600 }),
  fld("id", 52, 93.2, 42, 3, 2.5, "#e8b9ba", "poppins", { align: "right", weight: 500 }),
];

// ---------------------------------------------------------------- Idol Pink: rays, split panel, crossing ribbons
const pink = (A: number): El[] => [
  rect(0, 0, 36.5, 100, "#e9e5e7"),
  rect(40.2, 2.8, 20, 3.3, "#505055", { radius: 50, stroke: "#18181a", strokeW: 0.5 }),
  fld("team", 10.5, 5, 25, 4.4, 5.4, "#111111", "montserrat", { upper: true, weight: 800 }),
  fld("first", 6, 16.2, 29, 7.4, 9, "#e04675", "montserrat", { upper: true, weight: 900 }),
  fld("role", 6.5, 23.4, 29, 2.8, 2.8, "#111111", "poppins", { italic: true, upper: true, weight: 500 }),
  txt("”", 6.2, 25.6, 8, 6, 11, "#e04675", "montserrat", { weight: 900 }),
  txt("Add a short bio or tagline here.", 6.5, 31.6, 29, 2.4, 2, "#111111", "poppins", { weight: 600 }),
  ribbon("name", 17, 50.5, 46, 5.8, 9.5, "#cf2a5c", "#ffffff", 3.6),
  cut(29, 33, 68, 67, { color: "#f1efef", shadow: true }),
  vert("first", 86.5, 26, 34, 14, A, 90, "#ffffff", "montserrat", { weight: 900 }),
  fld("id", 7, 57, 30, 4.6, 7.2, "#111111", "poppins", { weight: 800 }),
  txt("ROLE", 7, 65.5, 10, 3, 3.4, "#111111", "poppins", { weight: 400 }),
  fld("game", 15, 62.2, 19, 8.6, 12, "#e04675", "montserrat", { weight: 900, upper: true }),
  ribbon("name", 50, 72, 135, 6.6, -9.8, "#f02a64", "#ffffff", 3.7),
  ribbon("team", 50, 91, 135, 6.6, 8.2, "#f02a64", "#ffffff", 3.7),
];

// ---------------------------------------------------------------- Sky Typo: split white and sky blue, giant name halves, colour dots
const sky = (A: number): El[] => [
  rect(50, 0, 50, 100, "#81c7fa"),
  vert("first", 32.5, 30.5, 51, 25, A, -90, "#7dc6fa", "anton", { weight: 400 }),
  vert("last", 68.5, 56.5, 59, 25, A, 90, "#ffffff", "anton", { weight: 400 }),
  fld("team", 51, 4.4, 44, 8.8, 11, "#ef3f4a", "montserrat", { upper: true, italic: true, weight: 900 }),
  txt("“Add a short bio or tagline here.”", 51.5, 17, 44, 3.2, 2.7, "#3b3b45", "poppins", { weight: 500, spacing: 0.18 }),
  cut(18, 30, 70, 70, { color: "#3b82f6", shadow: true }),
  vert("dob", 17.2, 42, 30, 4.6, A, -90, "#8fc3f5", "oswald", { weight: 700, spacing: 0.15 }),
  vert("event", 85.2, 74.5, 27, 5.6, A, 90, "#ffffff", "oswald", { weight: 700, spacing: 0.15 }),
  ell(4.5, 74.4, 8.8, 8.8 / A, "#81c7fa"), ell(4.5, 79.7, 8.8, 8.8 / A, "#0b9bf0"), ell(4.5, 85, 8.8, 8.8 / A, "#0a7fd1"), ell(4.5, 90.3, 8.8, 8.8 / A, "#0a68b0"), ell(4.5, 95.2, 8.8, 8.8 / A, "#07508d"),
];

// ---------------------------------------------------------------- Neon Strip: one tile of the grid reference, in six colourways
const strip = (accent: string) => (A: number): El[] => [
  rect(0, 7.2, 14, 0.4, "#ffffff", { opacity: 0.85 }), rect(0, 8.4, 14, 0.4, "#ffffff", { opacity: 0.85 }), rect(0, 9.6, 14, 0.4, "#ffffff", { opacity: 0.85 }),
  rect(78, 0, 22, 100, accent),
  frame(82, 3.6, 14, 14 / A, 14, { stroke: "#ffffff", strokeW: 0.5 }), frame(82, 3.6 + 14 / A + 1.6, 14, 14 / A, 14, { stroke: "#ffffff", strokeW: 0.5 }),
  vert("name", 89.5, 58, 70, 12.5, A, -90, "#0b0f14", "montserrat", { weight: 900 }),
  cut(2, 17, 74, 72, { color: accent, shadow: true }),
  rect(0, 66, 78, 34, "rgba(27,31,47,0)", { fill2: "rgba(27,31,47,0.96)", ang: 180 }),
  fld("first", 7, 72, 66, 6.2, 8.8, "#ffffff", "montserrat", { upper: true, italic: true, weight: 900 }),
  fld("last", 17, 78.8, 58, 6.2, 8.8, "transparent", "montserrat", { upper: true, italic: true, weight: 900, outline: true, stroke: accent, strokeW: 0.28 }),
  fld("role", 7, 86.4, 40, 2.6, 2.4, "#b9bfd2", "poppins", { weight: 500, upper: true, spacing: 0.2 }),
  fld("event", 7, 94.2, 66, 2.2, 1.9, "#8890a6", "poppins", { weight: 500 }),
  fld("id", 7, 91.6, 66, 2.2, 1.9, "#8890a6", "poppins", { weight: 500 }),
];
const stripBg = (c: string) => ({ a: "#1b1f2f", b: "#0e111c", angle: 165, pattern: { type: "rings" as const, color: c, opacity: 0.22, size: 3.2, cx: 55, cy: 26 } });

export const POSTERS: PosterDef[] = [
  { id: "pass-light", name: "App Pass (light)", tags: ["poster", "light", "minimal"], fmts: ["pass"], fallback: "arctic", bg: { a: "#ffffff", b: "#ffffff", angle: 180 }, build: pass(false) },
  { id: "pass-dark", name: "App Pass (dark)", tags: ["poster", "premium", "minimal"], fmts: ["pass"], fallback: "carbon", bg: { a: "#000000", b: "#000000", angle: 180 }, build: pass(true) },
  { id: "poster-blue", name: "Campus Blue", tags: ["poster", "bold"], fmts: ["poster"], fallback: "neon-grid", bg: { a: "#01447a", b: "#09aedd", angle: 40, pattern: { type: "rings", color: "#ffffff", opacity: 0.11, size: 3.4, cx: 14, cy: 14 } }, build: campus },
  { id: "poster-crew", name: "Crew Stack", tags: ["poster", "bold", "minimal"], fmts: ["story"], fallback: "mono", bg: { a: "#9c9390", b: "#8f8683", angle: 160, pattern: { type: "rings", color: "#c9c6c5", opacity: 0.5, size: 4.2, cx: 88, cy: 20 } }, build: crew },
  { id: "poster-maroon", name: "Squad Maroon", tags: ["poster", "light", "bold"], fmts: ["poster"], fallback: "sakura", bg: { a: "#ffffff", b: "#fafafa", angle: 180, pattern: { type: "diamonds", color: "#cfcfcf", opacity: 0.85, size: 15 } }, build: maroon },
  { id: "poster-pink", name: "Idol Pink", tags: ["poster", "bold", "playful"], fmts: ["poster"], fallback: "sakura", bg: { a: "#e04675", b: "#e04675", angle: 180, pattern: { type: "rays", color: "#b01c4a", opacity: 0.7, size: 3.4, cx: 52, cy: 38 } }, build: pink },
  { id: "poster-sky", name: "Sky Typo", tags: ["poster", "light", "playful"], fmts: ["poster"], fallback: "arctic", bg: { a: "#ffffff", b: "#f8f8fa", angle: 180 }, build: sky },
  { id: "strip-green", name: "Neon Strip Green", tags: ["poster", "neon"], fmts: ["story"], fallback: "toxic-lime", bg: stripBg("#20b97a"), build: strip("#20b97a") },
  { id: "strip-red", name: "Neon Strip Red", tags: ["poster", "neon", "aggressive"], fmts: ["story"], fallback: "crimson-strike", bg: stripBg("#d72b2b"), build: strip("#d72b2b") },
  { id: "strip-gold", name: "Neon Strip Gold", tags: ["poster", "premium"], fmts: ["story"], fallback: "midnight-gold", bg: stripBg("#f2b705"), build: strip("#f2b705") },
  { id: "strip-violet", name: "Neon Strip Violet", tags: ["poster", "neon", "premium"], fmts: ["story"], fallback: "royal-violet", bg: stripBg("#5b4bff"), build: strip("#5b4bff") },
  { id: "strip-teal", name: "Neon Strip Teal", tags: ["poster", "neon"], fmts: ["story"], fallback: "arctic", bg: stripBg("#19c3a3"), build: strip("#19c3a3") },
  { id: "strip-pink", name: "Neon Strip Pink", tags: ["poster", "playful"], fmts: ["story"], fallback: "sakura", bg: stripBg("#f2a7c9"), build: strip("#f2a7c9") },
];
