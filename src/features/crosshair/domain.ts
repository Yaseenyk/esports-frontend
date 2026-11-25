/**
 * Valorant crosshair profile codes: read a code, edit the primary crosshair, write the code back. Pure, unit tested in node.
 *
 * What is verified, and from where (checked 25 Nov 2026):
 * - Riot's patch notes 4.05 added import and export of crosshair codes (Settings > Crosshair, the arrow icons next to Crosshair Profile).
 * - Riot does not publish the code format. The format below follows the open-source @valapi/crosshair decoder, cross-checked with two
 *   other public decoders: values separated by ";", a leading "0", then sections P (primary), A (aim down sights), S (sniper scope),
 *   each a list of key;value pairs where a key that is left out keeps its default.
 * What this tool supports (the verified subset): the primary crosshair's colour (the eight preset colours), outlines, centre dot, and
 * inner and outer lines. Any other key, and the A and S sections, are kept exactly as they were and written back unchanged.
 * Custom hex colours are shown in the preview but not written: the public decoders disagree on how a custom colour is stored.
 */

export const CHECKED = "25 Nov 2026";
export const SOURCES = {
  patch405: "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-4-05/",
  patch504: "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-5-04/",
  valapi: "https://github.com/npmjs-valapi/node-valapi/blob/main/packages/@valapi/crosshair/src/index.ts",
} as const;

/** The preset colours by index. Index 8 means a custom colour. */
export const COLOURS: readonly { id: number; name: string; hex: string }[] = [
  { id: 0, name: "White", hex: "#FFFFFF" }, { id: 1, name: "Green", hex: "#00FF00" }, { id: 2, name: "Yellow green", hex: "#7FFF00" },
  { id: 3, name: "Green yellow", hex: "#DFFF00" }, { id: 4, name: "Yellow", hex: "#FFFF00" }, { id: 5, name: "Cyan", hex: "#00FFFF" },
  { id: 6, name: "Pink", hex: "#FF00FF" }, { id: 7, name: "Red", hex: "#FF0000" },
];

export interface Lines { show: boolean; thickness: number; length: number; vertical: number; split: boolean; offset: number; opacity: number }
export interface Primary {
  colour: number;
  /** A custom colour read from a code (#RRGGBB), preview only. */
  custom?: string;
  outlines: boolean; outlineThickness: number; outlineOpacity: number;
  dot: boolean; dotThickness: number; dotOpacity: number;
  inner: Lines; outer: Lines;
}

export const DEFAULTS: Primary = {
  colour: 0, outlines: true, outlineThickness: 1, outlineOpacity: 0.5, dot: false, dotThickness: 2, dotOpacity: 1,
  inner: { show: true, thickness: 2, length: 6, vertical: 6, split: false, offset: 3, opacity: 0.8 },
  outer: { show: true, thickness: 2, length: 2, vertical: 2, split: false, offset: 10, opacity: 0.35 },
};

/** Ranges as the public decoders validate them (Riot publishes none). Opacity is 0 to 1. */
export const RANGES = {
  outlineThickness: [1, 6], dotThickness: [1, 6],
  innerThickness: [0, 10], innerLength: [0, 20], innerOffset: [0, 20],
  outerThickness: [0, 10], outerLength: [0, 10], outerOffset: [0, 40],
} as const;

export interface Parsed {
  primary: Primary;
  /** Tokens before the first section (general settings), kept as they were. */
  general: string[];
  /** Primary keys this tool does not edit, kept in their original order. */
  extra: [string, string][];
  /** The A and S sections, kept as they were (each starts with its letter). */
  rest: string[];
}

export type ParseResult = { ok: true; value: Parsed } | { ok: false; error: "empty" | "start" | "pairs" | "value" };

const SECTIONS = new Set(["P", "A", "S"]);
const num = (s: string) => (/^-?\d+(\.\d+)?$/.test(s) ? Number(s) : NaN);
const clamp = (n: number, [lo, hi]: readonly [number, number]) => Math.min(hi, Math.max(lo, n));
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Reads a crosshair code. Spaces and a trailing ";" are tolerated; unknown keys are kept, not rejected. */
export function parseCode(raw: string): ParseResult {
  const code = raw.trim().replace(/;+$/, "");
  if (!code) return { ok: false, error: "empty" };
  const t = code.split(";").map((x) => x.trim());
  if (t[0] !== "0") return { ok: false, error: "start" };
  let i = 1;
  const general: string[] = [];
  while (i < t.length && !SECTIONS.has(t[i]!)) { general.push(t[i]!, t[i + 1] ?? ""); i += 2; }
  if (general.length % 2 || general.some((g) => g === "")) return { ok: false, error: "pairs" };
  const p: Primary = structuredClone(DEFAULTS), extra: [string, string][] = [], rest: string[] = [];
  let custom: { b?: boolean; u?: string } = {};
  while (i < t.length) {
    const sec = t[i++]!;
    const pairs: [string, string][] = [];
    while (i < t.length && !SECTIONS.has(t[i]!)) { if (i + 1 >= t.length) return { ok: false, error: "pairs" }; pairs.push([t[i]!, t[i + 1]!]); i += 2; }
    if (sec !== "P") { rest.push(sec, ...pairs.flat()); continue; }
    for (const [k, v] of pairs) {
      if (k === "u") { if (!/^[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(v)) return { ok: false, error: "value" }; custom.u = v.slice(0, 6).toUpperCase(); extra.push([k, v]); continue; }
      const n = num(v);
      if (Number.isNaN(n)) { extra.push([k, v]); continue; }
      if (k === "b") { custom.b = n === 1; extra.push([k, v]); continue; }
      if (!applyKey(p, k, n)) extra.push([k, v]);
    }
  }
  if ((p.colour === 8 || custom.b) && custom.u) p.custom = `#${custom.u}`;
  if (p.colour > 7 && !p.custom) p.colour = 0;
  return { ok: true, value: { primary: p, general, extra, rest } };
}

/** Applies one known primary key. Returns false for keys this tool does not edit. */
function applyKey(p: Primary, k: string, n: number): boolean {
  const L = (x: Lines, sub: string, r: { t: readonly [number, number]; l: readonly [number, number]; o: readonly [number, number] }): boolean => {
    switch (sub) {
      case "b": x.show = n === 1; return true;
      case "t": x.thickness = clamp(n, r.t); return true;
      case "l": x.length = clamp(n, r.l); return true;
      case "v": x.vertical = clamp(n, r.l); return true;
      case "g": x.split = n === 1; return true;
      case "o": x.offset = clamp(n, r.o); return true;
      case "a": x.opacity = clamp01(n); return true;
      default: return false;
    }
  };
  if (k.length === 2 && k[0] === "0") return L(p.inner, k[1]!, { t: RANGES.innerThickness, l: RANGES.innerLength, o: RANGES.innerOffset });
  if (k.length === 2 && k[0] === "1") return L(p.outer, k[1]!, { t: RANGES.outerThickness, l: RANGES.outerLength, o: RANGES.outerOffset });
  switch (k) {
    case "c": p.colour = Math.round(n); return true;
    case "h": p.outlines = n === 1; return true;
    case "t": p.outlineThickness = clamp(n, RANGES.outlineThickness); return true;
    case "o": p.outlineOpacity = clamp01(n); return true;
    case "d": p.dot = n === 1; return true;
    case "z": p.dotThickness = clamp(n, RANGES.dotThickness); return true;
    case "a": p.dotOpacity = clamp01(n); return true;
    default: return false;
  }
}

const fmt = (n: number) => String(Number(n.toFixed(3)));
const b = (x: boolean) => (x ? "1" : "0");

/** The primary keys this tool writes, in a fixed order, only where they differ from the default. */
function primaryPairs(p: Primary): [string, string][] {
  const d = DEFAULTS, out: [string, string][] = [];
  const put = (k: string, v: string, def: string) => { if (v !== def) out.push([k, v]); };
  put("c", String(p.colour), String(d.colour));
  put("h", b(p.outlines), b(d.outlines)); put("t", fmt(p.outlineThickness), fmt(d.outlineThickness)); put("o", fmt(p.outlineOpacity), fmt(d.outlineOpacity));
  put("d", b(p.dot), b(d.dot)); put("z", fmt(p.dotThickness), fmt(d.dotThickness)); put("a", fmt(p.dotOpacity), fmt(d.dotOpacity));
  for (const [pre, x, dx] of [["0", p.inner, d.inner], ["1", p.outer, d.outer]] as const) {
    put(`${pre}b`, b(x.show), b(dx.show)); put(`${pre}t`, fmt(x.thickness), fmt(dx.thickness)); put(`${pre}l`, fmt(x.length), fmt(dx.length));
    if (x.split) { put(`${pre}v`, fmt(x.vertical), fmt(dx.vertical)); put(`${pre}g`, "1", "0"); }
    put(`${pre}o`, fmt(x.offset), fmt(dx.offset)); put(`${pre}a`, fmt(x.opacity), fmt(dx.opacity));
  }
  return out;
}

/**
 * Writes the code. A custom colour read from the pasted code is written back exactly as it came (its own keys are in `extra`) as long as
 * the colour was not changed here; choosing a preset colour drops the custom keys.
 */
export function encodeCode(v: Parsed): string {
  const keepCustom = !!v.primary.custom;
  const extra = v.extra.filter(([k]) => keepCustom || (k !== "u" && k !== "b"));
  const own = primaryPairs(keepCustom ? { ...v.primary, colour: v.primary.colour } : v.primary);
  const pairs = [...own, ...extra];
  const parts = ["0", ...v.general, ...(pairs.length ? ["P", ...pairs.flat()] : []), ...v.rest];
  return parts.join(";");
}

export const fresh = (): Parsed => ({ primary: structuredClone(DEFAULTS), general: [], extra: [], rest: [] });

/** The colour the preview draws. */
export const colourHex = (p: Primary): string => p.custom ?? COLOURS.find((c) => c.id === p.colour)?.hex ?? "#FFFFFF";

/**
 * The shapes of the preview in crosshair pixels around the centre (0, 0): rectangles with an opacity. An approximation of how the game
 * draws the crosshair at 1080p, for comparing settings, not a pixel-exact copy.
 */
export interface Rect { x: number; y: number; w: number; h: number; opacity: number; outline: boolean }
export function previewRects(p: Primary): Rect[] {
  const out: Rect[] = [];
  const lines = (x: Lines) => {
    if (!x.show || x.thickness <= 0) return;
    const hl = x.length, vl = x.split ? x.vertical : x.length, t = x.thickness, o = x.offset;
    if (hl > 0) { out.push({ x: o, y: -t / 2, w: hl, h: t, opacity: x.opacity, outline: false }, { x: -o - hl, y: -t / 2, w: hl, h: t, opacity: x.opacity, outline: false }); }
    if (vl > 0) { out.push({ x: -t / 2, y: o, w: t, h: vl, opacity: x.opacity, outline: false }, { x: -t / 2, y: -o - vl, w: t, h: vl, opacity: x.opacity, outline: false }); }
  };
  lines(p.inner); lines(p.outer);
  if (p.dot) out.push({ x: -p.dotThickness / 2, y: -p.dotThickness / 2, w: p.dotThickness, h: p.dotThickness, opacity: p.dotOpacity, outline: false });
  if (!p.outlines) return out;
  const ot = p.outlineThickness;
  return [...out.map((r) => ({ x: r.x - ot, y: r.y - ot, w: r.w + 2 * ot, h: r.h + 2 * ot, opacity: p.outlineOpacity, outline: true })), ...out];
}

// ------------------------------------------------------------------ favourites (stored in this browser only)

export interface Favourite { name: string; code: string }
export const FAV_MAX = 20, FAV_NAME_MAX = 30;

/** Reads stored favourites safely; anything damaged is dropped. */
export function parseFavourites(raw: string | null): Favourite[] {
  try {
    const v = JSON.parse(raw ?? "[]");
    if (!Array.isArray(v)) return [];
    return v.filter((f): f is Favourite => !!f && typeof f.name === "string" && typeof f.code === "string" && parseCode(f.code).ok)
      .map((f) => ({ name: f.name.slice(0, FAV_NAME_MAX), code: f.code.slice(0, 2000) })).slice(0, FAV_MAX);
  } catch { return []; }
}

/** Adds or renames a favourite (same code = same favourite), newest first, at most FAV_MAX. */
export function addFavourite(list: Favourite[], name: string, code: string): Favourite[] {
  const n = name.replace(/\s+/g, " ").trim().slice(0, FAV_NAME_MAX) || "My crosshair";
  return [{ name: n, code }, ...list.filter((f) => f.code !== code)].slice(0, FAV_MAX);
}

/** The share link for a code: the tool page with ?c=. The page's canonical stays the tool URL, so these links never compete in search. */
export const shareLink = (site: string, code: string): string => `${site}/tools/valorant-crosshair/?c=${encodeURIComponent(code)}`;
