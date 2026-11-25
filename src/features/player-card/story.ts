/**
 * The share-ready stats story card (1080x1920 story, 1080x1350 post). Pure: what goes on the card and where. The canvas drawing is in render-story.ts.
 * Rules: numbers labelled "Verified" come only from the public player payload (results organisers recorded). Journal numbers appear only when the
 * player ticks the box, in their own block labelled "Self-logged". The QR holds the player's card link or their public page, nothing else.
 * Instagram and WhatsApp draw bars over the top and bottom 250 px of a story: nothing is placed there (SAFE from lib/share-cards).
 */
import { SAFE, SIZES, type ShareFormat } from "@/lib/share-cards";

export interface StoryStat { label: string; value: string }
export interface StoryInput {
  handle: string;
  subtitle: string; // "BGMI · IGL · Alpha Wolves" (typed by the player; drawn as plain text)
  verified: StoryStat[]; // empty when the player hid their stats or has none
  badges: string[]; // titles of earned, shown badges
  selfLogged: StoryStat[] | null; // null unless the player opted in
  qr: string | null;
  qrCaption: string;
  footer: string;
}

export interface Block { kind: "kicker" | "handle" | "subtitle" | "verified" | "badges" | "self" | "qr" | "footer"; y: number; h: number }

export const H = { kicker: 40, handle: 120, subtitle: 48, label: 48, statRow: 120, badges: 56, qrStory: 260, qrPost: 220, qrCaption: 48, footer: 36, gap: 26 } as const;

/** Rows of 2 tiles. */
const statRows = (n: number) => Math.ceil(Math.min(n, 4) / 2);

/** The blocks top to bottom, sized for the format, centred in the safe area; returns null blocks dropped. `fits` false = something was dropped to fit. */
export function storyLayout(input: StoryInput, format: ShareFormat): { blocks: Block[]; fits: boolean; w: number; h: number } {
  const { w, h } = SIZES[format];
  const top = SAFE[format].top, bottom = h - SAFE[format].bottom;
  const qrH = format === "story" ? H.qrStory : H.qrPost;
  const want: { kind: Block["kind"]; h: number; keep: boolean }[] = [
    { kind: "kicker", h: H.kicker, keep: true },
    { kind: "handle", h: H.handle, keep: true },
    { kind: "subtitle", h: H.subtitle, keep: input.subtitle.trim() !== "" },
    { kind: "verified", h: H.label + statRows(input.verified.length) * H.statRow, keep: input.verified.length > 0 },
    { kind: "badges", h: H.label + H.badges, keep: input.badges.length > 0 },
    { kind: "self", h: H.label + statRows(input.selfLogged?.length ?? 0) * H.statRow, keep: !!input.selfLogged && input.selfLogged.length > 0 },
    { kind: "qr", h: qrH + H.qrCaption, keep: input.qr !== null },
    { kind: "footer", h: H.footer, keep: true },
  ];
  let parts = want.filter((x) => x.keep);
  const used = (xs: typeof parts) => xs.reduce((n, x) => n + x.h, 0) + H.gap * (xs.length - 1);
  let fits = true;
  // Too tall (a post with every block): drop the optional blocks in this order until it fits. Verified stats and the QR are kept longest.
  for (const drop of ["badges", "self", "subtitle"] as const) {
    if (used(parts) <= bottom - top) break;
    parts = parts.filter((x) => x.kind !== drop);
    fits = false;
  }
  let y = top + Math.max(0, Math.floor((bottom - top - used(parts)) / 2));
  const blocks = parts.map((p) => { const b = { kind: p.kind, y, h: p.h }; y += p.h + H.gap; return b; });
  return { blocks, fits, w, h };
}

/** "1,234" style numbers without locale surprises. */
export const n0 = (v: number): string => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const n1 = (v: number | null): string => (v === null ? "-" : Number.isInteger(v) ? String(v) : v.toFixed(1));

/** Verified tiles from the public player stats (null = hidden by the player or none): at most 4, only ones with real counts. */
export function verifiedStats(s: { tournaments: number; matches: { played: number; wins: number }; battleRoyale: { matches: number; wins: number; kills: number } } | null): StoryStat[] {
  if (!s) return [];
  const out: StoryStat[] = [];
  if (s.tournaments > 0) out.push({ label: "Tournaments", value: n0(s.tournaments) });
  if (s.matches.played > 0) out.push({ label: "Matches won", value: `${n0(s.matches.wins)} of ${n0(s.matches.played)}` });
  if (s.battleRoyale.matches > 0) out.push({ label: "BR wins", value: `${n0(s.battleRoyale.wins)} of ${n0(s.battleRoyale.matches)}` });
  if (s.battleRoyale.matches > 0) out.push({ label: "Team kills", value: n0(s.battleRoyale.kills) });
  return out.slice(0, 4);
}

/** Self-logged tiles from the journal summary (only used when the player opted in). */
export function selfLoggedStats(t: { matches: number; avgKills: number | null; avgPlacement: number | null; wins: number }): StoryStat[] {
  if (t.matches === 0) return [];
  return [
    { label: "Matches logged", value: n0(t.matches) },
    { label: "Kills per match", value: n1(t.avgKills) },
    ...(t.avgPlacement !== null ? [{ label: "Avg placement", value: n1(t.avgPlacement) }] : []),
    { label: "1st places", value: n0(t.wins) },
  ].slice(0, 4);
}

/** The QR address: the card link (revocable) first, else the public page by slug. Anything malformed gives no QR. */
export function storyQr(siteUrl: string, cardPath: string | null, publicSlug: string | null): string | null {
  const base = siteUrl.replace(/\/+$/, "");
  if (cardPath && /^\/p\/\?k=[A-Za-z0-9_-]{22}$/.test(cardPath)) return `${base}${cardPath}`;
  if (publicSlug && /^[a-z0-9-]{3,60}$/.test(publicSlug)) return `${base}/players/view/?s=${publicSlug}`;
  return null;
}

export const storyFileName = (handle: string, format: ShareFormat): string => `stats-${format}-${(handle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "player").slice(0, 30)}.png`;
