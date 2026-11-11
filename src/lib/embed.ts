/**
 * Pure logic for the embeddable widgets: which options are valid, how the iframe address and the copy-paste snippets are built,
 * and how the height message from the widget is checked. public/embed.js is a minimal hand-written equivalent of the URL and
 * message rules here; tests/embed.test.mjs runs both and checks they agree. No browser or network code.
 */
export const EMBED_ORIGIN = "https://esports.streamerosai.com";
export const EMBED_VIEWS = ["standings", "bracket", "schedule", "matches"] as const;
export type EmbedView = (typeof EMBED_VIEWS)[number];
export const EMBED_THEMES = ["dark", "light"] as const;
export type EmbedTheme = (typeof EMBED_THEMES)[number];
export const EMBED_MSG = "eh-embed-height";
export const HEIGHT_MIN = 120;
export const HEIGHT_MAX = 2000;
export const TEAM_MAX = 60;

export const VIEW_LABEL: Record<EmbedView, string> = { standings: "Standings", bracket: "Bracket", schedule: "Schedule", matches: "Matches" };

const SLUG = /^[a-z0-9-]{3,40}$/;
const ID = /^[a-z0-9_-]{1,24}$/i;

export const isSlug = (s: unknown): s is string => typeof s === "string" && SLUG.test(s);
export const isView = (s: unknown): s is EmbedView => typeof s === "string" && (EMBED_VIEWS as readonly string[]).includes(s);
export const isTheme = (s: unknown): s is EmbedTheme => s === "dark" || s === "light";
export const isFrameId = (s: unknown): s is string => typeof s === "string" && ID.test(s);

/** A team name from a link: plain text, control characters dropped, at most 60 characters. */
export const cleanTeam = (s: unknown): string => (typeof s === "string" ? s.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, TEAM_MAX) : "");

export interface EmbedOptions { slug: string; view: EmbedView; theme: EmbedTheme; team: string; id: string }

/** Reads the widget's query string. Returns null when the slug is not valid; a bad view or theme falls back to the default. */
export function parseEmbedQuery(search: string): EmbedOptions | null {
  const q = new URLSearchParams(search);
  const slug = q.get("e") ?? "", view = q.get("v") ?? "", theme = q.get("theme") ?? "", id = q.get("id") ?? "";
  if (!isSlug(slug)) return null;
  return { slug, view: isView(view) ? view : "standings", theme: isTheme(theme) ? theme : "dark", team: cleanTeam(q.get("team")), id: isFrameId(id) ? id : "" };
}

/** The iframe address. Returns "" when the slug is not valid. View and theme are validated, defaults are dark standings. */
export function embedUrl(o: { slug: string; view?: string; theme?: string; team?: string; id?: string }, origin: string = EMBED_ORIGIN): string {
  if (!isSlug(o.slug)) return "";
  const view = isView(o.view) ? o.view : "standings", theme = isTheme(o.theme) ? o.theme : "dark", team = cleanTeam(o.team);
  let u = `${origin.replace(/\/$/, "")}/embed/?e=${encodeURIComponent(o.slug)}&v=${view}&theme=${theme}`;
  if (team) u += `&team=${encodeURIComponent(team)}`;
  if (isFrameId(o.id)) u += `&id=${o.id}`;
  return u;
}

/** Whole pixels between 120 and 2000. Anything that is not a number gives the minimum. */
export function clampHeight(h: unknown): number {
  const n = typeof h === "number" ? h : typeof h === "string" ? Number(h) : NaN;
  if (!Number.isFinite(n)) return HEIGHT_MIN;
  return Math.min(HEIGHT_MAX, Math.max(HEIGHT_MIN, Math.round(n)));
}

/** True only for a message sent by the widget itself, from our own origin. Returns the clamped height, or null. */
export function heightFromMessage(origin: string, data: unknown, allowed: string = EMBED_ORIGIN): number | null {
  if (origin !== allowed || !data || typeof data !== "object") return null;
  const d = data as { type?: unknown; height?: unknown };
  if (d.type !== EMBED_MSG || typeof d.height !== "number" || !Number.isFinite(d.height)) return null;
  return clampHeight(d.height);
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Copy-paste code 1: a plain iframe. Works anywhere that accepts HTML. The height is fixed, so the script option is better. */
export function iframeSnippet(o: { slug: string; view?: string; theme?: string; team?: string }, origin: string = EMBED_ORIGIN): string {
  const src = embedUrl(o, origin);
  if (!src) return "";
  return `<iframe src="${esc(src)}" title="Live on Esports Hub" width="100%" height="480" style="border:0;max-width:100%" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" loading="lazy"></iframe>`;
}

/** Copy-paste code 2: a placeholder div plus the tiny loader, which makes the frame as tall as its content. */
export function scriptSnippet(o: { slug: string; view?: string; theme?: string; team?: string }, origin: string = EMBED_ORIGIN): string {
  if (!isSlug(o.slug)) return "";
  const view = isView(o.view) ? o.view : "standings", theme = isTheme(o.theme) ? o.theme : "dark", team = cleanTeam(o.team);
  const t = team ? ` data-team="${esc(team)}"` : "";
  return `<div data-esports-hub="${o.slug}" data-view="${view}" data-theme="${theme}"${t}></div>\n<script async src="${origin.replace(/\/$/, "")}/embed.js"></script>`;
}

/** Which published view the widget draws for a chosen kind of widget, in order of preference. `matches` is not a published view. */
export const KINDS_FOR: Record<Exclude<EmbedView, "matches">, string[]> = { standings: ["standings", "league"], bracket: ["bracket"], schedule: ["schedule"] };
