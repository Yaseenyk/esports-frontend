import type { TableData } from "@/lib/display";
import type { Standing } from "@/lib/points";
import { THEME_IDS } from "@/lib/display-themes";
import type { MapLeagueRow } from "@/features/map-league/domain";

/**
 * The OBS overlay kit: pure logic, no browser code, all unit tested.
 *
 * A points table tool (Free Fire, BGMI, COD Mobile, the general points table, the Valorant league) turns its standings into a KitFeed.
 * The ranking is NOT redone here: the rows come from the tools' own ranking code (lib/points `standings` and map-league `mapLeagueTable`),
 * so the overlay and the tool can never disagree. The feed travels inside one browser (localStorage and BroadcastChannel, see
 * services/kit-store) to the browser source page, which draws one of three overlays: the points table, the top fraggers or team cards.
 * The overlay's settings, and optionally a snapshot of the data, ride in the link after the # sign, which never leaves the browser.
 */

export const KIT_SOURCES = ["free-fire", "bgmi", "cod-mobile", "points-table", "valorant"] as const;
export type KitSource = (typeof KIT_SOURCES)[number];
export const SOURCE_LABEL: Record<KitSource, string> = { "free-fire": "Free Fire", bgmi: "BGMI", "cod-mobile": "COD Mobile", "points-table": "Points table", valorant: "Valorant league" };
export const SOURCE_PATH: Record<KitSource, string> = { "free-fire": "/points-table/free-fire/", bgmi: "/points-table/bgmi/", "cod-mobile": "/points-table/cod-mobile/", "points-table": "/tools/points-table/", valorant: "/points-table/valorant/" };
const isSource = (x: unknown): x is KitSource => typeof x === "string" && (KIT_SOURCES as readonly string[]).includes(x);

/** "br": battle royale points (placement plus kills). "league": match play (won, lost, points). */
export type KitMode = "br" | "league";
export interface KitTeam {
  rank: number; team: string; points: number;
  /** Team kills; null for a league table, which has no kills. */
  kills: number | null;
  wins: number;
  played: number;
  /** Matches lost; null for battle royale, where a match has no loser. */
  lost: number | null;
}
export interface KitFeed { v: 1; source: KitSource; mode: KitMode; title: string; teams: KitTeam[]; /** When the tool sent it, ms since 1970. */ at: number }
export interface KitPlayer { name: string; team: string; kills: number }
export interface KitPlayers { v: 1; players: KitPlayer[]; at: number }

export const MAX_TEAMS = 64, MAX_PLAYERS = 100, NAME_MAX = 60, TITLE_MAX = 80, KILLS_MAX = 9999;

// eslint-disable-next-line no-control-regex
const oneLine = (x: unknown, max: number) => (typeof x === "string" ? x.replace(/[\x00-\x1f\x7f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max).trim() : "");
const whole = (x: unknown, max: number) => { const n = Math.floor(Number(x)); return Number.isFinite(n) && n >= 0 ? Math.min(n, max) : 0; };
const score = (x: unknown) => { const n = Number(x); return Number.isFinite(n) ? Math.max(-99999, Math.min(99999, Math.round(n * 100) / 100)) : 0; };

/** From the battle royale points tool. `rows` is the output of lib/points `standings()`, already ranked with its tie-breakers. */
export function feedFromStandings(rows: readonly Standing[], o: { source: KitSource; matches: number; title?: string; at?: number }): KitFeed {
  return {
    v: 1, source: o.source, mode: "br", title: oneLine(o.title ?? "", TITLE_MAX) || `${SOURCE_LABEL[o.source]} standings`, at: o.at ?? 0,
    teams: rows.slice(0, MAX_TEAMS).map((r) => ({ rank: r.rank, team: oneLine(r.name, NAME_MAX), points: r.total, kills: r.kills, wins: r.wins, played: whole(o.matches, 99), lost: null })),
  };
}

/** From the Valorant league tool. `rows` is the output of `mapLeagueTable()`, already ranked by points, maps, rounds and head-to-head. */
export function feedFromMapLeague(rows: readonly MapLeagueRow[], o: { source?: KitSource; title?: string; at?: number } = {}): KitFeed {
  const source = o.source ?? "valorant";
  return {
    v: 1, source, mode: "league", title: oneLine(o.title ?? "", TITLE_MAX) || "League table", at: o.at ?? 0,
    teams: rows.slice(0, MAX_TEAMS).map((r) => ({ rank: r.rank, team: oneLine(r.team, NAME_MAX), points: r.points, kills: null, wins: r.won, played: r.played, lost: r.lost })),
  };
}

/** Same feed apart from the time it was sent. Used so an unchanged table is not sent again. */
export const sameFeed = (a: KitFeed | null, b: KitFeed | null): boolean => JSON.stringify(a && { ...a, at: 0 }) === JSON.stringify(b && { ...b, at: 0 });

/** Checks and trims anything that claims to be a feed (from storage, a message or a link). Returns null for anything else. */
export function sanitizeFeed(x: unknown): KitFeed | null {
  try {
    if (!x || typeof x !== "object") return null;
    const f = x as Record<string, unknown>;
    if (f.v !== 1 || !isSource(f.source) || (f.mode !== "br" && f.mode !== "league") || !Array.isArray(f.teams)) return null;
    const br = f.mode === "br";
    const teams = (f.teams as unknown[]).slice(0, MAX_TEAMS).map((t): KitTeam | null => {
      if (!t || typeof t !== "object") return null;
      const r = t as Record<string, unknown>;
      const team = oneLine(r.team, NAME_MAX);
      if (!team) return null;
      return { rank: Math.max(1, whole(r.rank, MAX_TEAMS)), team, points: score(r.points), kills: br ? whole(r.kills, KILLS_MAX * 12) : null, wins: whole(r.wins, 999), played: whole(r.played, 999), lost: br ? null : whole(r.lost, 999) };
    }).filter((t): t is KitTeam => t !== null);
    return { v: 1, source: f.source, mode: f.mode, title: oneLine(f.title, TITLE_MAX) || SOURCE_LABEL[f.source], teams, at: whole(f.at, Number.MAX_SAFE_INTEGER) };
  } catch { return null; }
}

/** Checks and trims a player kill list. Rows without a name are dropped. */
export function sanitizePlayers(x: unknown): KitPlayers | null {
  try {
    if (!x || typeof x !== "object") return null;
    const p = x as Record<string, unknown>;
    if (p.v !== 1 || !Array.isArray(p.players)) return null;
    const players = (p.players as unknown[]).slice(0, MAX_PLAYERS).map((r): KitPlayer | null => {
      if (!r || typeof r !== "object") return null;
      const o = r as Record<string, unknown>;
      const name = oneLine(o.name, NAME_MAX);
      return name ? { name, team: oneLine(o.team, NAME_MAX), kills: whole(o.kills, KILLS_MAX) } : null;
    }).filter((r): r is KitPlayer => r !== null);
    return { v: 1, players, at: whole(p.at, Number.MAX_SAFE_INTEGER) };
  } catch { return null; }
}

/** The newest feed for a source ("auto" = whichever tool sent last). Live data and a snapshot from the link compete on their send time. */
export function pickFeed(feeds: readonly (KitFeed | null | undefined)[], src: KitSource | "auto"): KitFeed | null {
  let best: KitFeed | null = null;
  for (const f of feeds) if (f && (src === "auto" || f.source === src) && (!best || f.at > best.at)) best = f;
  return best;
}
export const pickPlayers = (lists: readonly (KitPlayers | null | undefined)[]): KitPlayers | null =>
  lists.reduce<KitPlayers | null>((best, p) => (p && (!best || p.at > best.at) ? p : best), null);

// ---- the three overlays ----

export const KIT_VIEWS = ["points", "fraggers", "cards"] as const;
export type KitView = (typeof KIT_VIEWS)[number];
export const VIEW_NAME: Record<KitView, string> = { points: "Live points table", fraggers: "Top fraggers", cards: "Team cards" };
/** How many rows or cards each overlay shows unless the link says otherwise. */
export const VIEW_COUNT: Record<KitView, number> = { points: 10, fraggers: 5, cards: 4 };
export const COUNT_MAX: Record<KitView, number> = { points: 16, fraggers: 10, cards: 8 };

/** The points table as the display system's TableData, so the overlay reuses the TV screen's table (TableView) and its 14 designs. */
export function pointsTableData(feed: KitFeed, n: number): TableData {
  const rows = feed.teams.slice(0, Math.max(1, n));
  if (feed.mode === "br") return { title: feed.title, subtitle: SOURCE_LABEL[feed.source], head: ["#", "Team", "Kills", "Wins", "Pts"], strong: 4, rows: rows.map((t) => [String(t.rank), t.team, String(t.kills ?? 0), String(t.wins), String(t.points)]) };
  return { title: feed.title, subtitle: SOURCE_LABEL[feed.source], head: ["#", "Team", "P", "W", "L", "Pts"], strong: 5, rows: rows.map((t) => [String(t.rank), t.team, String(t.played), String(t.wins), String(t.lost ?? 0), String(t.points)]) };
}

export interface FraggerRow { rank: number; name: string; team: string; kills: number }
export interface Fraggers { kind: "players" | "teams" | "none"; rows: FraggerRow[] }

/** Most kills first, then name. Equal kills share a rank (1, 2, 2, 4), so nobody is placed above a player with the same count. */
function killRanking(list: { name: string; team: string; kills: number }[], n: number): FraggerRow[] {
  const sorted = [...list].sort((a, b) => b.kills - a.kills || a.name.localeCompare(b.name));
  const out: FraggerRow[] = [];
  sorted.forEach((r, i) => { const prev = out[i - 1]; out.push({ rank: prev && prev.kills === r.kills ? prev.rank : i + 1, name: r.name, team: r.team, kills: r.kills }); });
  return out.slice(0, Math.max(1, n));
}

/**
 * The kill leaders. Player kills typed on the kit page win when there are any; otherwise the team kills from a battle royale points
 * table are used, and the overlay says "Team kills" (the points tools record kills per team, not per player). A league table has no kills.
 */
export function topFraggers(feed: KitFeed | null, players: KitPlayers | null, n: number): Fraggers {
  const ps = (players?.players ?? []).filter((p) => p.name);
  if (ps.length) return { kind: "players", rows: killRanking(ps, n) };
  if (feed && feed.mode === "br" && feed.teams.length) return { kind: "teams", rows: killRanking(feed.teams.map((t) => ({ name: t.team, team: "", kills: t.kills ?? 0 })), n) };
  return { kind: "none", rows: [] };
}

export const sameTeam = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** The teams for the card overlay: the top `n` by rank, or only the named team (for a team's own camera scene). */
export function teamCards(feed: KitFeed | null, n: number, team = ""): KitTeam[] {
  if (!feed) return [];
  if (team.trim()) return feed.teams.filter((t) => sameTeam(t.team, team)).slice(0, 1);
  return feed.teams.slice(0, Math.max(1, n));
}

/** Up to two letters for a team's drawn badge: the first letters of the first two words, or the first two letters of one word. */
export function initials(name: string): string {
  const words = name.replace(/[^\p{L}\p{N}\s]/gu, " ").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "?";
  const pick = words.length > 1 ? words[0]!.charAt(0) + words[1]!.charAt(0) : Array.from(words[0]!).slice(0, 2).join("");
  return pick.toUpperCase();
}
/** Which of the design's two accent colours a team's badge uses. Stable for a name, so a badge never changes colour mid-stream. */
export function badgeTone(name: string): 0 | 1 {
  let h = 0;
  for (const ch of name.trim().toLowerCase()) h = (h * 31 + (ch.codePointAt(0) ?? 0)) >>> 0;
  return (h % 2) as 0 | 1;
}

// ---- the link: settings (and an optional data snapshot) after the # sign ----

export const KIT_AREAS = ["full", "left", "right", "bottom"] as const;
export type KitArea = (typeof KIT_AREAS)[number];
export const AREA_NAME: Record<KitArea, string> = { full: "Whole screen", left: "Left third", right: "Right third", bottom: "Bottom band" };
export interface KitSettings {
  view: KitView; theme: string;
  /** Margin from every edge, as a percentage of the width and of the height (5 = the broadcast title-safe area). */
  safe: number;
  /** Text size multiplier. */
  scale: number;
  /** Rows or cards; 0 = the overlay's own default. */
  n: number;
  area: KitArea;
  /** Team cards only: show this one team. */
  team: string;
  src: KitSource | "auto";
}
export const DEFAULT_SETTINGS: KitSettings = { view: "points", theme: "dark", safe: 5, scale: 1, n: 0, area: "full", team: "", src: "auto" };
export const SAFE_MAX = 15, SCALE_MIN = 0.5, SCALE_MAX = 2;

export const countFor = (s: KitSettings): number => Math.min(COUNT_MAX[s.view], s.n > 0 ? s.n : VIEW_COUNT[s.view]);

/** Checks every setting; anything missing or invalid falls back to its default. A bad link never breaks the overlay. */
export function parseSettings(q: URLSearchParams): KitSettings {
  const num = (k: string) => { const raw = q.get(k); return raw === null || raw.trim() === "" ? NaN : Number(raw); };
  const view = q.get("v") ?? "", theme = q.get("theme") ?? "", area = q.get("area") ?? "", src = q.get("src") ?? "";
  const safe = num("safe"), scale = num("scale"), n = num("n");
  const v = (KIT_VIEWS as readonly string[]).includes(view) ? (view as KitView) : DEFAULT_SETTINGS.view;
  return {
    view: v,
    theme: THEME_IDS.includes(theme) ? theme : DEFAULT_SETTINGS.theme,
    safe: Number.isFinite(safe) ? Math.round(Math.min(SAFE_MAX, Math.max(0, safe)) * 10) / 10 : DEFAULT_SETTINGS.safe,
    scale: Number.isFinite(scale) ? Math.round(Math.min(SCALE_MAX, Math.max(SCALE_MIN, scale)) * 100) / 100 : 1,
    n: Number.isFinite(n) ? Math.min(COUNT_MAX[v], Math.max(0, Math.floor(n))) : 0,
    area: (KIT_AREAS as readonly string[]).includes(area) ? (area as KitArea) : DEFAULT_SETTINGS.area,
    team: oneLine(q.get("team") ?? "", NAME_MAX),
    src: src === "auto" || isSource(src) ? (src as KitSource | "auto") : "auto",
  };
}

export interface KitSnapshot { feed: KitFeed | null; players: KitPlayers | null }

const b64url = (bytes: Uint8Array) => { let s = ""; for (const b of bytes) s += String.fromCharCode(b); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
const unb64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));
export const SNAPSHOT_MAX = 60_000;

/** The data as text for the link (JSON, UTF-8, base64url). */
export function encodeSnapshot(s: KitSnapshot): string {
  const body: Record<string, unknown> = {};
  if (s.feed) body.f = s.feed;
  if (s.players?.players.length) body.p = s.players;
  return b64url(new TextEncoder().encode(JSON.stringify(body)));
}
/** The reverse. Anything damaged or hand-edited gives an empty snapshot, never an error. */
export function decodeSnapshot(text: string): KitSnapshot {
  try {
    if (!text || text.length > SNAPSHOT_MAX) return { feed: null, players: null };
    const o = JSON.parse(new TextDecoder().decode(unb64url(text))) as { f?: unknown; p?: unknown };
    return { feed: sanitizeFeed(o?.f), players: sanitizePlayers(o?.p) };
  } catch { return { feed: null, players: null }; }
}

/** The text after # in an overlay link. Settings at their default are left out, so links stay short. */
export function encodeSettings(s: KitSettings, snapshot?: KitSnapshot): string {
  const c = parseSettings(new URLSearchParams({ v: s.view, theme: s.theme, safe: String(s.safe), scale: String(s.scale), n: String(s.n), area: s.area, team: s.team, src: s.src }));
  const q = new URLSearchParams({ v: c.view });
  if (c.theme !== DEFAULT_SETTINGS.theme) q.set("theme", c.theme);
  if (c.safe !== DEFAULT_SETTINGS.safe) q.set("safe", String(c.safe));
  if (c.scale !== 1) q.set("scale", String(c.scale));
  if (c.n) q.set("n", String(c.n));
  if (c.area !== DEFAULT_SETTINGS.area) q.set("area", c.area);
  if (c.team && c.view === "cards") q.set("team", c.team);
  if (c.src !== "auto") q.set("src", c.src);
  if (snapshot && (snapshot.feed || snapshot.players?.players.length)) q.set("d", encodeSnapshot(snapshot));
  return q.toString();
}

/** Reads an overlay link's # part (with or without the leading #). */
export function decodeSettings(hash: string): { settings: KitSettings; snapshot: KitSnapshot } {
  const q = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  return { settings: parseSettings(q), snapshot: decodeSnapshot(q.get("d") ?? "") };
}

/** The browser source address for OBS. Everything is after the #: no query string, nothing that reaches a server. */
export function kitUrl(origin: string, s: KitSettings, snapshot?: KitSnapshot): string {
  return `${origin.replace(/\/$/, "")}/overlay-kit/live/#${encodeSettings(s, snapshot)}`;
}

/** Where the overlay sits inside the safe area, in percent of the safe area. */
export function areaBox(area: KitArea): { left: number; top: number; width: number; height: number } {
  if (area === "left") return { left: 0, top: 0, width: 34, height: 100 };
  if (area === "right") return { left: 66, top: 0, width: 34, height: 100 };
  if (area === "bottom") return { left: 0, top: 70, width: 100, height: 30 };
  return { left: 0, top: 0, width: 100, height: 100 };
}
