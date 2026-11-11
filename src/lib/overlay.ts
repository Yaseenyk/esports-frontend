/**
 * Pure logic for the stream overlay (an OBS or YouTube browser source): build and read the overlay link, which views a published page can
 * fill, and what the one-line "lower third" says about the current or next match. No browser or network code, so all of it is unit tested.
 */
import { THEME_IDS } from "./display-themes";
import type { LiveKind, LiveSnapshot } from "./live";
import { scheduleRows } from "./live";
import { isDone, type PublicMatch } from "./matches";
import type { Payload } from "./display";

export const OVERLAY_VIEWS = ["standings", "league", "schedule", "bracket", "countdown", "matches", "nextmatch", "ticker", "sponsors"] as const;
export type OverlayView = (typeof OVERLAY_VIEWS)[number];

export const VIEW_LABEL: Record<OverlayView, string> = {
  standings: "Standings", league: "League table", schedule: "Schedule", bracket: "Bracket", countdown: "Countdown",
  matches: "Scores", nextmatch: "Next-match bar", ticker: "Ticker", sponsors: "Sponsors",
};
export const VIEW_HELP: Record<OverlayView, string> = {
  standings: "Battle royale points table with kills.",
  league: "Points table for head-to-head games.",
  schedule: "Today's rounds, with the one on now lit.",
  bracket: "The knockout bracket, winners lit.",
  countdown: "Big countdown to the start.",
  matches: "Match that is on now, the next ones and the latest results.",
  nextmatch: "One slim bar: next match, or the live score.",
  ticker: "Your announcement lines, scrolling.",
  sponsors: "Your sponsor logos in a strip.",
};

export const SCALE_MIN = 0.5, SCALE_MAX = 2.5;
export const SLUG_RE = /^[a-z0-9-]{3,40}$/;
export const TEAM_MAX = 60;

export interface OverlayParams { e: string; v: OverlayView; theme: string; bg: "transparent" | "solid"; scale: number; team: string }
export const DEFAULT_OVERLAY: OverlayParams = { e: "", v: "standings", theme: "dark", bg: "transparent", scale: 1, team: "" };

// eslint-disable-next-line no-control-regex
const oneLine = (s: string, max: number) => s.replace(/[\x00-\x1f\x7f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max).trim();
export const sameTeam = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** Reads and checks every parameter of an overlay link. Anything missing or invalid falls back to a safe default; the page is never refused for a bad option. */
export function parseOverlayParams(input: string | URLSearchParams): OverlayParams {
  const q = typeof input === "string" ? new URLSearchParams(input.startsWith("?") ? input.slice(1) : input) : input;
  const e = (q.get("e") ?? "").trim().toLowerCase();
  const v = q.get("v") ?? "";
  const theme = q.get("theme") ?? "";
  const raw = q.get("scale");
  const scale = raw === null || raw.trim() === "" ? NaN : Number(raw);
  return {
    e: SLUG_RE.test(e) ? e : "",
    v: (OVERLAY_VIEWS as readonly string[]).includes(v) ? (v as OverlayView) : DEFAULT_OVERLAY.v,
    theme: THEME_IDS.includes(theme) ? theme : DEFAULT_OVERLAY.theme,
    bg: q.get("bg") === "solid" ? "solid" : "transparent",
    scale: Number.isFinite(scale) ? Math.round(Math.min(SCALE_MAX, Math.max(SCALE_MIN, scale)) * 100) / 100 : 1,
    team: oneLine(q.get("team") ?? "", TEAM_MAX),
  };
}

/** The overlay address. Options left at their default are left out, so links stay short. */
export function buildOverlayUrl(origin: string, p: Partial<OverlayParams> & { e: string }): string {
  const c = parseOverlayParams(new URLSearchParams({
    e: p.e, v: p.v ?? DEFAULT_OVERLAY.v, theme: p.theme ?? DEFAULT_OVERLAY.theme, bg: p.bg ?? DEFAULT_OVERLAY.bg, scale: String(p.scale ?? 1), team: p.team ?? "",
  }));
  const q = new URLSearchParams({ e: p.e.trim().toLowerCase(), v: c.v });
  if (c.theme !== DEFAULT_OVERLAY.theme) q.set("theme", c.theme);
  if (c.bg !== "transparent") q.set("bg", c.bg);
  if (c.scale !== 1) q.set("scale", String(c.scale));
  if (c.team) q.set("team", c.team);
  return `${origin.replace(/\/$/, "")}/overlay/?${q.toString()}`;
}

// ---- what the published page can fill ----
const KIND_VIEWS: LiveKind[] = ["standings", "league", "schedule", "bracket", "countdown"];

/** The published view of one kind, or null. */
export function payloadOf(snap: LiveSnapshot | null | undefined, kind: LiveKind): Payload | null {
  return snap?.views.find((v) => v.kind === kind)?.payload ?? null;
}

/** Which overlay views have something to show now. A view without data shows nothing on stream, so the panel only offers these. */
export function viewAvailability(snap: LiveSnapshot | null | undefined, matches: readonly PublicMatch[] = []): Record<OverlayView, boolean> {
  const has = (k: LiveKind) => payloadOf(snap, k) !== null;
  const out = {} as Record<OverlayView, boolean>;
  for (const k of KIND_VIEWS) out[k] = has(k);
  out.matches = matches.length > 0;
  out.nextmatch = matches.length > 0 || has("schedule");
  out.ticker = (snap?.ticker.length ?? 0) > 0;
  out.sponsors = (snap?.sponsors.length ?? 0) > 0;
  return out;
}

export const availableViews = (snap: LiveSnapshot | null | undefined, matches: readonly PublicMatch[] = []): OverlayView[] => {
  const a = viewAvailability(snap, matches);
  return OVERLAY_VIEWS.filter((v) => a[v]);
};

// ---- matches ----
const startMs = (m: PublicMatch) => { const t = m.startsAt ? Date.parse(m.startsAt) : NaN; return Number.isNaN(t) ? Infinity : t; };
const byPlace = (x: PublicMatch, y: PublicMatch) => x.round - y.round || x.slot - y.slot || x.id.localeCompare(y.id);
const byUpcoming = (x: PublicMatch, y: PublicMatch) => startMs(x) - startMs(y) || x.stage.localeCompare(y.stage, undefined, { numeric: true }) || byPlace(x, y);
const involves = (m: PublicMatch, team: string) => !team || sameTeam(m.a, team) || sameTeam(m.b, team);
const hasTeams = (m: PublicMatch) => m.a.trim() !== "" || m.b.trim() !== "";

export interface MatchBoard { live: PublicMatch[]; next: PublicMatch[]; recent: PublicMatch[] }

/** What the scores view shows: matches on now, the next few not yet played, and the latest results (newest first). A team filter keeps only that team's matches. */
export function matchBoard(matches: readonly PublicMatch[], team = "", limit = 3): MatchBoard {
  const pool = matches.filter((m) => hasTeams(m) && involves(m, team));
  const live = pool.filter((m) => m.status === "live").sort(byPlace);
  const next = pool.filter((m) => !isDone(m) && m.status !== "live").sort(byUpcoming).slice(0, limit);
  const recent = pool.filter(isDone).sort((x, y) => byPlace(y, x)).slice(0, limit);
  return { live, next, recent };
}

/** "3:40 pm" in the viewer's zone, or an empty string when the time is not known. */
export function clockText(iso: string | null | undefined, o: { locale?: string; timeZone?: string } = {}): string {
  const t = iso ? Date.parse(iso) : NaN;
  if (Number.isNaN(t)) return "";
  return new Intl.DateTimeFormat(o.locale ?? "en-US", { timeZone: o.timeZone, hour: "numeric", minute: "2-digit", hour12: true }).format(t).replace(/\s?([AP])M$/i, (_m, x: string) => ` ${x.toLowerCase()}m`);
}

const nameOf = (t: string) => (t.trim() === "" ? "TBD" : t.trim());

export interface LowerThird {
  kind: "live" | "next" | "none";
  /** "LIVE" or "NEXT" ("" when there is nothing to say). */
  tag: string;
  /** The whole line, for screen readers and tests: "NEXT: A vs B at 3:40 pm" or "LIVE: A 7 - 5 B". */
  text: string;
  /** The pieces, so the bar can style the score and the time. */
  a: string; mid: string; b: string; at: string;
}
const NONE: LowerThird = { kind: "none", tag: "", text: "", a: "", mid: "", b: "", at: "" };

function line(kind: "live" | "next", a: string, mid: string, b: string, at: string): LowerThird {
  const tag = kind === "live" ? "LIVE" : "NEXT";
  const body = [a, mid, b].filter((x) => x !== "").join(" ");
  return { kind, tag, text: `${tag}: ${body}${at ? ` at ${at}` : ""}`, a, mid, b, at };
}

/**
 * What the one-line bar says. A match that is on now wins ("LIVE: A 7 - 5 B", or "A vs B" before a score is entered), otherwise the next one
 * that has not been played ("NEXT: A vs B at 3:40 pm", no time when it is not known). With a team, only that team's matches count.
 * Without matches, the published schedule is used the same way. Nothing to say gives kind "none", and the bar shows nothing.
 */
export function lowerThird(matches: readonly PublicMatch[], snap: LiveSnapshot | null | undefined, team = "", now = new Date(), o: { locale?: string; timeZone?: string } = {}): LowerThird {
  const board = matchBoard(matches, team, 1);
  const lv = board.live[0];
  if (lv) {
    const scored = lv.scoreA !== null && lv.scoreA !== undefined && lv.scoreB !== null && lv.scoreB !== undefined;
    return line("live", nameOf(lv.a), scored ? `${lv.scoreA} - ${lv.scoreB}` : "vs", nameOf(lv.b), "");
  }
  const nx = board.next[0];
  if (nx) return line("next", nameOf(nx.a), "vs", nameOf(nx.b), clockText(nx.startsAt, o));
  const sched = payloadOf(snap, "schedule");
  if (sched && sched.v === "schedule") {
    const rows = scheduleRows(sched.d, now).filter((r) => (r.state === "now" || r.state === "next" || r.state === "later") && (!team || r.label.toLowerCase().includes(team.toLowerCase())));
    const r = rows.find((x) => x.state === "now") ?? rows[0];
    if (r && r.label.trim()) return r.state === "now" ? line("live", r.label.trim(), "", "", "") : line("next", r.label.trim(), "", "", r.start);
  }
  return NONE;
}
