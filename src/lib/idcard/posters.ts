import { uid, type El, type FontKey, type Pattern } from "./types";

/**
 * Poster-style themes for upright badges. They use the techniques of modern event and campus cards: a cut-out portrait standing in front
 * of giant type, vertical names, stacked outline words, diagonal ribbons, textured backgrounds and an app-style pass with a QR tile.
 * Everything here is an original layout; every piece can be moved or restyled in the editor.
 * Positions are percentages of the card. A is the card's height divided by its width, so shapes and rotated text can be made physically square.
 */
export interface PosterDef {
  id: string; name: string; tags: string[];
  bg: { a: string; b: string; angle: number; pattern?: Pattern };
  /** The classic palette used if the card type is changed to a shape the poster layout does not suit. */
  fallback: string;
  build: (A: number) => El[];
}

const rect = (x: number, y: number, w: number, h: number, fill: string, o: Partial<El> = {}): El => ({ id: uid(), kind: "rect", x, y, w, h, rot: 0, opacity: 1, fill, radius: 0, ...o });
const ell = (x: number, y: number, w: number, h: number, fill: string, o: Partial<El> = {}): El => ({ id: uid(), kind: "ellipse", x, y, w, h, rot: 0, opacity: 1, fill, ...o });
const fld = (field: El["field"], x: number, y: number, w: number, h: number, size: number, color: string, font: FontKey, o: Partial<El> = {}): El => ({ id: uid(), kind: "field", field, x, y, w, h, rot: 0, opacity: 1, size, color, font, weight: 800, align: "left", ...o });
const txt = (text: string, x: number, y: number, w: number, h: number, size: number, color: string, font: FontKey, o: Partial<El> = {}): El => ({ id: uid(), kind: "text", text, x, y, w, h, rot: 0, opacity: 1, size, color, font, weight: 600, align: "left", ...o });
const cut = (x: number, y: number, w: number, h: number, o: Partial<El> = {}): El => ({ id: uid(), kind: "photo", cutout: true, x, y, w, h, rot: 0, opacity: 1, color: "#334155", ...o });
const qr = (x: number, y: number, w: number, h: number, o: Partial<El> = {}): El => ({ id: uid(), kind: "qr", x, y, w, h, rot: 0, opacity: 1, color: "#111111", fill: "#ffffff", radius: 3, ...o });

/** Vertical detail, centred on (cx, cy). lenH is how long it runs as a share of the card height, thick how thick as a share of the card width. */
function vert(field: El["field"], cx: number, cy: number, lenH: number, thick: number, A: number, rot: -90 | 90, color: string, font: FontKey, o: Partial<El> = {}): El {
  const w = lenH * A, h = thick / A;
  return fld(field, cx - w / 2, cy - h / 2, w, h, thick * 0.78, color, font, { rot, upper: true, align: "center", ...o });
}

const pass = (dark: boolean) => (A: number): El[] => {
  const tile1 = dark ? "#1c1c1f" : "#e3f5dc", tile2 = dark ? "#1c1c1f" : "#dcebfb", label = dark ? "#8b8b93" : "#6b7280", val = dark ? "#ffffff" : "#111111";
  const qw = 26, qh = qw / A;
  return [
    rect(0, 0, 100, 38, dark ? "#101012" : "#0b0b0d"), ell(-14, 22, 128, 34, dark ? "#101012" : "#0b0b0d"),
    rect(6, 9, 88, 40, "#f7d6d9", { radius: 9 }), cut(6, 9, 88, 40, { color: "#b91c1c" }),
    fld("name", 19, 45.5, 62, 6.6, 4.8, "#ffffff", "heavy", { align: "center", upper: true, fill: "#111111", radius: 50 }),
    rect(6, 56, 43, 28, tile1, { radius: 8 }), rect(51, 56, 43, 28, tile2, { radius: 8 }),
    txt("Birth date", 9, 58, 38, 3.2, 2.6, label, "body", { weight: 500 }), fld("dob", 9, 61, 38, 4.4, 3.8, val, "heavy"),
    txt("Role", 9, 66.5, 38, 3.2, 2.6, label, "body", { weight: 500 }), fld("role", 9, 69.5, 38, 4.4, 3.8, val, "heavy", { upper: true }),
    txt("Team", 9, 75, 38, 3.2, 2.6, label, "body", { weight: 500 }), fld("team", 9, 78, 38, 4.4, 3.8, val, "heavy"),
    qr(51 + (43 - qw) / 2, 58, qw, qh), fld("id", 51, 58 + qh + 1.4, 43, 4, 3.6, val, "mono", { align: "center", weight: 600 }),
    fld("event", 6, 89, 88, 4, 3, label, "body", { align: "center", weight: 600 }),
    fld("game", 6, 93, 88, 4, 3, label, "body", { align: "center", weight: 500 }),
  ];
};

const neon = (accent: string, dark = "#0b0f14") => (A: number): El[] => [
  rect(86, 0, 14, 100, accent),
  vert("name", 93, 50, 94, 9.5, A, -90, "#0b0f14", "heavy"),
  fld("game", 6, 8.5, 60, 3.4, 2.8, "#9aa4b2", "body", { weight: 600, upper: true, spacing: 0.3 }),
  fld("event", 6, 11.8, 74, 4, 3.4, "#ffffff", "heavy", { upper: true }),
  cut(0, 14, 88, 66, { color: accent, shadow: true }),
  rect(0, 74, 86, 26, dark, { fill2: "rgba(11,15,20,0)", ang: 0, opacity: 0.95 }),
  fld("name", 6, 78, 76, 8.4, 8.2, accent, "heavy", { upper: true, italic: true }),
  fld("team", 6, 86.5, 76, 5, 4.6, "#ffffff", "display", { weight: 700 }),
  rect(6, 92, 24, 3.8, accent, { radius: 50 }), fld("role", 6, 92, 24, 3.8, 2.6, "#0b0f14", "heavy", { align: "center", upper: true, spacing: 0.2 }),
  fld("id", 34, 92, 46, 3.8, 2.8, "#9aa4b2", "mono", { weight: 500 }),
];

export const POSTERS: PosterDef[] = [
  { id: "pass-light", name: "App Pass (light)", tags: ["poster", "light", "minimal"], fallback: "arctic", bg: { a: "#ffffff", b: "#eef2f7", angle: 180 }, build: pass(false) },
  { id: "pass-dark", name: "App Pass (dark)", tags: ["poster", "premium", "minimal"], fallback: "carbon", bg: { a: "#050506", b: "#121214", angle: 180 }, build: pass(true) },
  {
    id: "poster-blue", name: "Campus Blue", tags: ["poster", "bold"], fallback: "neon-grid",
    bg: { a: "#0653c6", b: "#0aa8ea", angle: 165, pattern: { type: "rings", color: "#ffffff", opacity: 0.13, size: 3.4, cx: 12, cy: 10 } },
    build: (A) => [
      vert("team", 14, 50, 82, 21, A, -90, "#ffffff", "heavy", { opacity: 0.9, spacing: 0.4 }),
      vert("game", 87, 55, 70, 18, A, 90, "#e6f3ff", "heavy", { opacity: 0.7, spacing: 0.4 }),
      fld("event", 8, 8.5, 84, 3.6, 2.9, "#ffffff", "display", { align: "center", weight: 700, upper: true, spacing: 0.3, opacity: 0.9 }),
      cut(6, 12, 88, 78, { color: "#0b2a63", shadow: true }),
      rect(0, 78, 100, 22, "rgba(6,48,111,0)", { fill2: "rgba(6,48,111,0.95)", ang: 180 }),
      fld("name", 6, 88, 54, 7.4, 5.2, "#ffffff", "heavy", { fill: "#0a46c7", upper: true }),
      fld("role", 63, 88, 31, 7.4, 4, "#ffffff", "heavy", { align: "right", upper: true, spacing: 0.2 }),
      fld("id", 6, 95.6, 88, 3, 2.6, "#cfe6ff", "mono", { weight: 500 }),
    ],
  },
  {
    id: "poster-crew", name: "Crew Stack", tags: ["poster", "bold", "minimal"], fallback: "mono",
    bg: { a: "#9c9896", b: "#6c6967", angle: 160 },
    build: (A) => [
      rect(4, 3, 82, 92, "#7f7c7a", { radius: 5, opacity: 0.7 }),
      rect(10, 5, 82, 90, "#4a4949", { radius: 5 }),
      rect(15, 9, 72, 13, "#8f8d8c", { radius: 7, opacity: 0.9 }), fld("event", 15, 9, 72, 13, 5.6, "#ffffff", "heavy", { align: "center", upper: true, spacing: 0.2 }),
      fld("role", 24, 26, 66, 40, 11, "#ffffff", "heavy", { outline: true, stroke: "#ffffff", strokeW: 0.35, repeat: 4, upper: true, align: "center", opacity: 0.8 }),
      cut(17, 26, 74, 64, { color: "#2f3b4a", sticker: "#ffffff", shadow: true }),
      vert("name", 19, 56, 70, 8.5, A, -90, "#ffffff", "heavy", { spacing: 0.3 }),
      fld("role", 14, 77, 82, 13, 13, "#ffffff", "heavy", { align: "center", upper: true }),
      rect(14, 90.2, 74, 4.2, "#d0d0d0", { radius: 50 }), fld("id", 14, 90.2, 74, 4.2, 3, "#3d3d3d", "mono", { align: "center", weight: 700 }),
    ],
  },
  {
    id: "poster-maroon", name: "Squad Maroon", tags: ["poster", "light", "bold"], fallback: "sakura",
    bg: { a: "#ffffff", b: "#f1f1f1", angle: 180, pattern: { type: "diamonds", color: "#bdbdbd", opacity: 0.55, size: 7 } },
    build: (A) => [
      fld("team", 5, 6, 40, 4.6, 3.4, "#ffffff", "heavy", { fill: "#7a0f16", upper: true }),
      rect(5, 13, 90, 12, "transparent", { stroke: "#7a0f16", strokeW: 0.6 }), fld("event", 5, 13, 90, 12, 8, "#7a0f16", "heavy", { align: "center", upper: true }),
      rect(6, 29, 44, 46, "#b52630", { fill2: "#8b1620", ang: 160 }),
      vert("game", 89, 54, 56, 17, A, 90, "#7a0f16", "heavy"),
      cut(12, 26, 72, 66, { color: "#1f2937", shadow: true }),
      fld("name", 5, 74, 50, 5.4, 3.8, "#111111", "heavy", { fill: "#ffffff", upper: true }),
      rect(0, 89, 100, 11, "#7a0f16"), fld("role", 5, 89, 58, 11, 10, "#ffffff", "heavy", { upper: true }),
      fld("id", 62, 89, 33, 11, 3.2, "#ffffff", "mono", { align: "right", weight: 600 }),
    ],
  },
  {
    id: "poster-pink", name: "Idol Pink", tags: ["poster", "bold", "playful"], fallback: "sakura",
    bg: { a: "#f2eded", b: "#e7e0e0", angle: 160, pattern: { type: "rays", color: "#ffffff", opacity: 0.35, size: 3.2, cx: 72, cy: 36 } },
    build: (A) => [
      rect(42, 0, 58, 100, "#e8336d", { opacity: 0.96 }),
      vert("role", 88, 33, 48, 19, A, 90, "#ffffff", "heavy"),
      fld("name", 5, 9, 58, 7, 5.6, "#ffffff", "heavy", { upper: true, italic: true, fill: "#e8336d" }),
      fld("team", 6, 17, 34, 4, 2.8, "#222222", "body", { italic: true, weight: 600 }),
      cut(16, 18, 84, 76, { color: "#f3f4f6", shadow: true }),
      fld("name", -14, 60, 130, 6.8, 3.6, "#ffffff", "heavy", { rot: -11, ticker: true, fill: "#e8336d", upper: true, spacing: 0.15 }),
      fld("team", -14, 74, 130, 6.8, 3.6, "#ffffff", "heavy", { rot: 8, ticker: true, fill: "#e8336d", upper: true, spacing: 0.15 }),
      fld("role", -14, 87, 130, 6.8, 3.6, "#ffffff", "heavy", { rot: -6, ticker: true, fill: "#d92b62", upper: true, spacing: 0.15 }),
      fld("id", 5, 45, 36, 8, 6.4, "#111111", "heavy"),
      fld("game", 6, 54, 34, 4, 3, "#111111", "body", { weight: 600 }),
    ],
  },
  {
    id: "poster-sky", name: "Sky Typo", tags: ["poster", "light", "playful"], fallback: "arctic",
    bg: { a: "#ffffff", b: "#f3f6fb", angle: 180 },
    build: (A) => [
      rect(52, 0, 48, 100, "#b7d8fb"),
      vert("name", 22, 52, 92, 32, A, -90, "#8fc3f5", "heavy", { outline: true, stroke: "#6db1f3", strokeW: 0.45, opacity: 0.95 }),
      vert("role", 84, 58, 70, 24, A, 90, "#ffffff", "heavy"),
      fld("team", 54, 6, 44, 8, 7.2, "#ef4444", "heavy", { upper: true }),
      cut(12, 14, 80, 78, { color: "#3b82f6", shadow: true }),
      vert("dob", 8, 54, 36, 4.4, A, -90, "#3b82f6", "heavy", { opacity: 0.85 }),
      ell(6, 80, 9, 9 / A, "#7cc0ff"), ell(6, 83.8, 9, 9 / A, "#2f95f0"), ell(6, 87.6, 9, 9 / A, "#0b6fc4"),
      fld("event", 54, 92, 42, 4, 2.8, "#1d4ed8", "body", { align: "right", weight: 700 }),
    ],
  },
  { id: "strip-green", name: "Neon Strip Green", tags: ["poster", "neon", "bold"], fallback: "toxic-lime", bg: { a: "#101820", b: "#06090d", angle: 160, pattern: { type: "rings", color: "#22c55e", opacity: 0.16, size: 3.6, cx: 78, cy: 22 } }, build: neon("#22c55e") },
  { id: "strip-red", name: "Neon Strip Red", tags: ["poster", "neon", "aggressive"], fallback: "crimson-strike", bg: { a: "#1a0d10", b: "#0a0506", angle: 160, pattern: { type: "rings", color: "#ef4444", opacity: 0.16, size: 3.6, cx: 78, cy: 22 } }, build: neon("#ef4444") },
  { id: "strip-gold", name: "Neon Strip Gold", tags: ["poster", "premium", "bold"], fallback: "midnight-gold", bg: { a: "#17130a", b: "#090805", angle: 160, pattern: { type: "rings", color: "#eab308", opacity: 0.16, size: 3.6, cx: 78, cy: 22 } }, build: neon("#eab308") },
  { id: "strip-violet", name: "Neon Strip Violet", tags: ["poster", "neon", "premium"], fallback: "royal-violet", bg: { a: "#120c24", b: "#07050f", angle: 160, pattern: { type: "rings", color: "#8b5cf6", opacity: 0.18, size: 3.6, cx: 78, cy: 22 } }, build: neon("#8b5cf6") },
];
