import { POSTERS } from "./posters";
import { FORMATS, uid, type El, type Fmt, type FontKey, type Template } from "./types";

type Layout = "band" | "side" | "center" | "slash";
interface Pal {
  id: string; name: string; tags: string[]; layout: Layout;
  bg: [string, string]; angle: number;
  accent: string; accent2: string; on: string; text: string; muted: string;
  font: FontKey; round: number; upper: boolean;
}

/** Ten ready-made themes. Each is a normal template, so everything in it can be moved, restyled or deleted in the editor. */
const PALS: Pal[] = [
  { id: "neon-grid", name: "Neon Grid", tags: ["neon", "aggressive"], layout: "band", bg: ["#070b14", "#12103a"], angle: 135, accent: "#22D3EE", accent2: "#A855F7", on: "#05070A", text: "#ffffff", muted: "#8b9bb4", font: "display", round: 8, upper: false },
  { id: "midnight-gold", name: "Midnight Gold", tags: ["premium"], layout: "center", bg: ["#0b0b10", "#1b1710"], angle: 160, accent: "#e7c35a", accent2: "#b8862b", on: "#1a1405", text: "#fbf3da", muted: "#a89868", font: "serif", round: 50, upper: false },
  { id: "crimson-strike", name: "Crimson Strike", tags: ["aggressive"], layout: "slash", bg: ["#12060a", "#2a0a14"], angle: 120, accent: "#ff3b57", accent2: "#ff7a45", on: "#ffffff", text: "#ffffff", muted: "#c98c97", font: "heavy", round: 4, upper: true },
  { id: "arctic", name: "Arctic", tags: ["minimal", "light"], layout: "side", bg: ["#f4f9ff", "#dbeafe"], angle: 160, accent: "#2563eb", accent2: "#38bdf8", on: "#ffffff", text: "#0b1b34", muted: "#52688a", font: "body", round: 10, upper: false },
  { id: "toxic-lime", name: "Toxic Lime", tags: ["neon", "playful"], layout: "band", bg: ["#050805", "#0d1a06"], angle: 150, accent: "#b6ff3b", accent2: "#3bff9d", on: "#071002", text: "#f2ffe0", muted: "#86a368", font: "heavy", round: 14, upper: true },
  { id: "synthwave", name: "Synthwave", tags: ["neon", "playful"], layout: "slash", bg: ["#1a0b3a", "#3a0b3a"], angle: 150, accent: "#ff4fd8", accent2: "#ffb347", on: "#1a0b3a", text: "#fff0fb", muted: "#c79bd8", font: "display", round: 50, upper: false },
  { id: "mono", name: "Minimal Mono", tags: ["minimal"], layout: "side", bg: ["#ffffff", "#ececec"], angle: 180, accent: "#111111", accent2: "#555555", on: "#ffffff", text: "#111111", muted: "#6b6b6b", font: "mono", round: 0, upper: true },
  { id: "carbon", name: "Carbon Orange", tags: ["aggressive", "premium"], layout: "center", bg: ["#0e0e10", "#1c1c20"], angle: 145, accent: "#ff8a1f", accent2: "#ffc247", on: "#1a0d00", text: "#ffffff", muted: "#9a9aa2", font: "heavy", round: 12, upper: true },
  { id: "sakura", name: "Sakura", tags: ["playful", "light"], layout: "band", bg: ["#fff5f8", "#ffe3ee"], angle: 160, accent: "#ec4899", accent2: "#f9a8d4", on: "#ffffff", text: "#3a1030", muted: "#a0607f", font: "body", round: 50, upper: false },
  { id: "royal-violet", name: "Royal Violet", tags: ["premium", "neon"], layout: "side", bg: ["#0c0820", "#1d1048"], angle: 140, accent: "#8b5cf6", accent2: "#22d3ee", on: "#ffffff", text: "#f4efff", muted: "#9d90c9", font: "display", round: 50, upper: false },
];

const R = (x: number, y: number, w: number, h: number, fill: string, o: Partial<El> = {}): El => ({ id: uid(), kind: "rect", x, y, w, h, rot: 0, opacity: 1, fill, radius: 0, ...o });
const E = (x: number, y: number, w: number, h: number, fill: string, o: Partial<El> = {}): El => ({ id: uid(), kind: "ellipse", x, y, w, h, rot: 0, opacity: 1, fill, ...o });
const F = (field: El["field"], x: number, y: number, w: number, h: number, size: number, color: string, font: FontKey, o: Partial<El> = {}): El => ({ id: uid(), kind: "field", field, x, y, w, h, rot: 0, opacity: 1, size, color, font, weight: 700, align: "left", ...o });
const T = (text: string, x: number, y: number, w: number, h: number, size: number, color: string, font: FontKey, o: Partial<El> = {}): El => ({ id: uid(), kind: "text", text, x, y, w, h, rot: 0, opacity: 1, size, color, font, weight: 600, align: "left", ...o });
const P = (x: number, y: number, w: number, h: number, radius: number, stroke: string): El => ({ id: uid(), kind: "photo", x, y, w, h, rot: 0, opacity: 1, radius, fill: "#00000055", stroke, strokeW: 0.9 });

/** Upright layout for lanyard badges and event badges. The top band leaves room for the slot guide. */
function buildUpright(p: Pal): El[] {
  const f = p.font;
  return [
    E(-30, -12, 160, 44, p.accent, { opacity: 0.12 }),
    R(0, 0, 100, 16, p.accent, { fill2: p.accent2 }),
    F("event", 6, 8.6, 88, 6, 4.6, p.on, f, { align: "center", weight: 800, upper: true, spacing: 0.3 }),
    P(23, 20, 54, 33, p.round >= 50 ? 50 : Math.min(p.round, 12), p.accent),
    F("name", 6, 56, 88, 9, 8, p.text, f, { align: "center", weight: 800, upper: p.upper }),
    F("team", 6, 65.5, 88, 5.5, 5, p.accent, f, { align: "center" }),
    R(27, 72.5, 46, 6.5, p.accent, { radius: 50, fill2: p.accent2 }),
    F("role", 27, 72.5, 46, 6.5, 4, p.on, f, { align: "center", weight: 800, upper: true, spacing: 0.3 }),
    F("id", 6, 81, 88, 4.5, 4.4, p.muted, "mono", { align: "center", weight: 500 }),
    F("game", 6, 86, 88, 4, 3.4, p.muted, f, { align: "center" }),
    R(0, 93, 100, 7, p.accent, { fill2: p.accent2 }),
    T("Please wear this badge visibly", 6, 93, 88, 7, 3, p.on, "body", { align: "center", weight: 700 }),
  ];
}

/** One long line for a wristband or strap: game block, event and name, role, then ID and team. */
function buildStrip(p: Pal): El[] {
  const f = p.font;
  return [
    R(0, 0, 15, 100, p.accent, { fill2: p.accent2 }),
    F("game", 0, 0, 15, 100, 2.4, p.on, f, { align: "center", weight: 800, upper: true }),
    F("event", 18, 8, 42, 30, 1.7, p.accent, f, { weight: 800, upper: true, spacing: 0.15 }),
    F("name", 18, 38, 44, 54, 3.6, p.text, f, { weight: 800, upper: p.upper }),
    R(65, 28, 15, 44, p.accent, { radius: 50, fill2: p.accent2 }),
    F("role", 65, 28, 15, 44, 1.7, p.on, f, { align: "center", weight: 800, upper: true, spacing: 0.15 }),
    F("id", 82, 10, 16, 38, 2.1, p.muted, "mono", { align: "right", weight: 500 }),
    F("team", 82, 52, 16, 38, 2, p.accent, f, { align: "right" }),
  ];
}

function build(p: Pal, fmt: Fmt = "wallet"): El[] {
  if (fmt !== "wallet" && fmt !== "strip") return buildUpright(p);
  if (fmt === "strip") return buildStrip(p);
  const els: El[] = [];
  const f = p.font;
  if (p.layout === "band") {
    els.push(E(70, -40, 60, 95, p.accent2, { opacity: 0.1 }));
    els.push(R(0, 0, 100, 20, p.accent, { fill2: p.accent2 }));
    els.push(F("event", 5, 3, 62, 14, 4.8, p.on, f, { weight: 800, upper: true, spacing: 0.4 }));
    els.push(F("game", 66, 3, 29, 14, 3.6, p.on, f, { align: "right" }));
    els.push(P(5, 27, 26, 55, p.round, p.accent));
    els.push(F("name", 36, 27, 60, 13, 6.8, p.text, f, { weight: 800, upper: p.upper }));
    els.push(F("team", 36, 42, 60, 8, 4.4, p.accent, f));
    els.push(R(36, 56, 26, 10, p.accent, { radius: 50, fill2: p.accent2 }));
    els.push(F("role", 36, 56, 26, 10, 3.6, p.on, f, { align: "center", weight: 800, upper: true, spacing: 0.3 }));
    els.push(F("id", 36, 72, 60, 8, 3.8, p.muted, "mono", { weight: 500 }));
    els.push(R(5, 89, 90, 0.7, p.accent, { opacity: 0.6 }));
    els.push(T("Carry this card at all times", 5, 91.5, 90, 6, 2.6, p.muted, "body", { weight: 500 }));
  } else if (p.layout === "side") {
    els.push(R(0, 0, 13, 100, p.accent, { fill2: p.accent2 }));
    els.push(F("game", -33, 46, 80, 8, 3.4, p.on, f, { rot: -90, align: "center", weight: 800, upper: true, spacing: 1 }));
    els.push(F("event", 18, 5, 78, 10, 4.2, p.accent, f, { weight: 800, upper: true, spacing: 0.4 }));
    els.push(P(18, 22, 25, 52, p.round, p.accent));
    els.push(F("name", 47, 24, 50, 18, 6.4, p.text, f, { weight: 800, upper: p.upper }));
    els.push(F("team", 47, 46, 50, 8, 4.2, p.accent, f));
    els.push(R(47, 58, 24, 9, p.accent, { radius: Math.min(50, p.round * 2) }));
    els.push(F("role", 47, 58, 24, 9, 3.4, p.on, f, { align: "center", weight: 800, upper: true, spacing: 0.3 }));
    els.push(F("id", 18, 82, 50, 8, 3.8, p.muted, "mono", { weight: 500 }));
    els.push(T("Carry at all times", 62, 83, 35, 6, 2.6, p.muted, "body", { weight: 500, align: "right" }));
  } else if (p.layout === "center") {
    els.push(E(-10, -35, 120, 70, p.accent, { opacity: 0.1 }));
    els.push(R(0, 94, 100, 6, p.accent, { fill2: p.accent2 }));
    els.push(F("event", 6, 4, 88, 8, 3.8, p.accent, f, { align: "center", weight: 800, upper: true, spacing: 0.6 }));
    els.push(P(38, 14, 24, 40, 50, p.accent));
    els.push(F("name", 6, 57, 88, 12, 6.6, p.text, f, { align: "center", weight: 800, upper: p.upper }));
    els.push(F("team", 6, 69, 88, 7, 4, p.accent, f, { align: "center" }));
    els.push(R(37, 79, 26, 9, p.accent, { radius: Math.min(50, p.round * 2), fill2: p.accent2 }));
    els.push(F("role", 37, 79, 26, 9, 3.4, p.on, f, { align: "center", weight: 800, upper: true, spacing: 0.3 }));
    els.push(F("id", 4, 80, 30, 8, 3.2, p.muted, "mono", { weight: 500 }));
    els.push(F("game", 66, 80, 30, 8, 3.2, p.muted, f, { align: "right" }));
  } else {
    els.push(R(-20, 30, 80, 140, p.accent, { rot: 18, opacity: 0.16, fill2: p.accent2 }));
    els.push(R(62, -20, 10, 160, p.accent, { rot: 18, opacity: 0.5 }));
    els.push(F("event", 5, 4, 55, 10, 4.2, p.accent, f, { weight: 800, upper: true, spacing: 0.4 }));
    els.push(F("name", 5, 30, 56, 18, 7.2, p.text, f, { weight: 800, upper: p.upper }));
    els.push(F("team", 5, 52, 56, 8, 4.4, p.accent, f));
    els.push(R(5, 64, 26, 9, p.accent, { radius: Math.min(50, p.round * 2), fill2: p.accent2 }));
    els.push(F("role", 5, 64, 26, 9, 3.4, p.on, f, { align: "center", weight: 800, upper: true, spacing: 0.3 }));
    els.push(F("id", 5, 82, 55, 8, 3.8, p.muted, "mono", { weight: 500 }));
    els.push(P(66, 10, 28, 62, p.round, p.accent));
    els.push(F("game", 62, 80, 34, 8, 3.4, p.text, f, { align: "right", weight: 800, upper: true }));
  }
  return els;
}

export interface ThemeEntry { id: string; name: string; tags: string[]; group: "classic" | "poster"; fmts?: Fmt[]; make: (fmt?: Fmt) => Template }

const classic: ThemeEntry[] = PALS.map((p) => ({
  id: p.id, name: p.name, tags: p.tags, group: "classic" as const,
  make: (fmt: Fmt = "wallet") => ({ id: p.id, name: p.name, theme: p.id, fmt, bg: { a: p.bg[0], b: p.bg[1], angle: p.angle }, els: build(p, fmt) }),
}));

/** Poster and app-pass themes are drawn for specific card types (poster, story, pass). On other shapes they rebuild from a matching classic palette. */
const posters: ThemeEntry[] = POSTERS.map((p) => ({
  id: p.id, name: p.name, tags: p.tags, group: "poster" as const, fmts: p.fmts,
  make: (fmt: Fmt = p.fmts[0]) => {
    if (p.fmts.includes(fmt)) {
      const f = FORMATS[fmt];
      return { id: p.id, name: p.name, theme: p.id, fmt, bg: { ...p.bg }, els: p.build(f.h / f.w) };
    }
    const pal = PALS.find((x) => x.id === p.fallback) ?? PALS[0];
    return { id: p.id, name: p.name, theme: p.id, fmt, bg: { a: pal.bg[0], b: pal.bg[1], angle: pal.angle }, els: build(pal, fmt) };
  },
}));

export const THEMES: ThemeEntry[] = [...classic, ...posters];
/** True for the card types that have their own poster-style themes. */
export const posterFmt = (f?: Fmt) => f === "poster" || f === "story" || f === "pass";

export const VIBES = ["neon", "premium", "minimal", "aggressive", "playful", "light", "bold"] as const;
export const themeById = (id: string) => THEMES.find((t) => t.id === id);
/** A simple, honest helper: picks a theme from the chosen vibe and the team name, so each team lands on a different one. */
export function suggest(vibe: string | null, teamName: string, fmt?: Fmt): string {
  // Poster, story and pass cards get the themes drawn for them; every other shape gets the classic ones.
  const eligible = THEMES.filter((t) => (posterFmt(fmt) ? t.group === "poster" && !!fmt && !!t.fmts?.includes(fmt) : t.group === "classic"));
  const pool = eligible.filter((t) => !vibe || t.tags.includes(vibe));
  const list = pool.length ? pool : eligible;
  let h = 0; for (const c of teamName) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return list[h % list.length].id;
}
