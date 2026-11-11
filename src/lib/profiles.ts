/**
 * Pure helpers for opt-in TEAM pages: link checks, the same results arithmetic the server uses (for the live preview), a record summary and
 * a privacy check for free text. No browser or network code, so all of it is unit tested. There are deliberately no player pages.
 */
import type { BrResult, PublicMatch } from "./matches";

export const CONSENT_STATEMENT = "I have the team captain's permission to publish this page";
export const LINK_HOSTS = ["instagram.com", "youtube.com", "discord.gg", "x.com", "twitter.com", "facebook.com"] as const;
export const MAX_LINKS = 5;
export const BLURB_MAX = 200;
export const NAME_MAX = 60;
const SLUG = /^[a-z2-7]{12}$/;

export const isSlug = (s: string | null | undefined): s is string => !!s && SLUG.test(s);

export type LinkCheck = { ok: true; url: string } | { ok: false; error: string };

/** Only https links to a short list of social sites, no logins in the address. */
export function checkLink(raw: string): LinkCheck {
  const t = raw.trim();
  if (!t) return { ok: false, error: "Paste a full web address." };
  if (t.length > 200) return { ok: false, error: "That address is too long." };
  let u: URL;
  try { u = new URL(t); } catch { return { ok: false, error: "That is not a full web address. Start it with https://" }; }
  if (u.protocol !== "https:") return { ok: false, error: "The address must start with https://" };
  if (u.username || u.password) return { ok: false, error: "The address must not contain a login." };
  const host = u.hostname.toLowerCase();
  if (!LINK_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) return { ok: false, error: `Only links to ${LINK_HOSTS.join(", ")} are allowed.` };
  return { ok: true, url: u.href };
}

/** Cleans a list typed by a person: blanks dropped, duplicates removed, the first problem reported. */
export function checkLinks(list: string[]): { urls: string[]; error: string } {
  const urls: string[] = [];
  for (const raw of list) {
    if (!raw.trim()) continue;
    const r = checkLink(raw);
    if (!r.ok) return { urls, error: `${raw.trim().slice(0, 40)}: ${r.error}` };
    if (!urls.includes(r.url)) urls.push(r.url);
  }
  if (urls.length > MAX_LINKS) return { urls: urls.slice(0, MAX_LINKS), error: `Use at most ${MAX_LINKS} links.` };
  return { urls, error: "" };
}

/** A friendly name for a link, from its host: "Instagram", "Discord", "YouTube"... */
export function linkLabel(url: string): string {
  let h = "";
  try { h = new URL(url).hostname.toLowerCase(); } catch { return "Link"; }
  const is = (d: string) => h === d || h.endsWith(`.${d}`);
  if (is("instagram.com")) return "Instagram";
  if (is("youtube.com")) return "YouTube";
  if (is("discord.gg")) return "Discord";
  if (is("x.com") || is("twitter.com")) return "X";
  if (is("facebook.com")) return "Facebook";
  return "Link";
}

/** Free text on a public page must not carry contact details. Returns a plain-words problem, or "" when fine. */
export function personalProblem(text: string): string {
  if (/\S+@\S+\.\S+/.test(text)) return "Remove the email address: a public page must not show contact details.";
  if (/(?:\d[\s().+-]*){8,}/.test(text)) return "Remove the phone number: a public page must not show contact details.";
  return "";
}

// ---------- results ----------
export interface Record3 { played: number; wins: number; draws: number; losses: number }
export interface BrSummary { matches: number; bestPlacement: number; kills: number }
export interface HistoryEntry { eventName: string; date: string; record: Record3 | null; br: BrSummary | null }

const same = (x: string, y: string) => x.trim().toLowerCase() === y.trim().toLowerCase();

/** Same arithmetic as the server: finished and forfeited matches only, battle royale placements by team name (case ignored). */
export function teamResults(team: string, matches: PublicMatch[], br: BrResult[]): Pick<HistoryEntry, "record" | "br"> {
  let played = 0, wins = 0, draws = 0, losses = 0;
  for (const m of matches) {
    if (m.status !== "finished" && m.status !== "forfeit") continue;
    const isA = same(m.a, team), isB = same(m.b, team);
    if (!isA && !isB) continue;
    let w: "a" | "b" | "draw" | null = m.winner ?? null;
    if (!w && m.scoreA !== null && m.scoreB !== null) w = m.scoreA > m.scoreB ? "a" : m.scoreA < m.scoreB ? "b" : "draw";
    if (!w) continue;
    played++;
    if (w === "draw") draws++;
    else if ((w === "a") === isA) wins++;
    else losses++;
  }
  const mine = br.filter((r) => same(r.team, team));
  return {
    record: played ? { played, wins, draws, losses } : null,
    br: mine.length ? { matches: mine.length, bestPlacement: Math.min(...mine.map((r) => r.placement)), kills: mine.reduce((s, r) => s + r.kills, 0) } : null,
  };
}

export interface Summary { events: number; played: number; wins: number; draws: number; losses: number; brMatches: number; bestPlacement: number | null }

/** The numbers at the top of a team page, added up over every event. */
export function summarize(history: HistoryEntry[]): Summary {
  const s: Summary = { events: history.length, played: 0, wins: 0, draws: 0, losses: 0, brMatches: 0, bestPlacement: null };
  for (const h of history) {
    if (h.record) { s.played += h.record.played; s.wins += h.record.wins; s.draws += h.record.draws; s.losses += h.record.losses; }
    if (h.br) { s.brMatches += h.br.matches; s.bestPlacement = s.bestPlacement === null ? h.br.bestPlacement : Math.min(s.bestPlacement, h.br.bestPlacement); }
  }
  return s;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** "2 won, 1 drawn, 0 lost" in plain words. */
export function recordText(r: Record3): string {
  return `${plural(r.played, "match", "matches")}: ${r.wins} won, ${r.draws} drawn, ${r.losses} lost`;
}

/** The result lines of one event, in plain words. Empty events say so. */
export function entryLines(h: HistoryEntry): string[] {
  const out: string[] = [];
  if (h.record) out.push(recordText(h.record));
  if (h.br) out.push(`Battle royale: best finish ${ordinal(h.br.bestPlacement)} in ${plural(h.br.matches, "match", "matches")}, ${plural(h.br.kills, "kill", "kills")}`);
  if (!out.length) out.push("No results yet");
  return out;
}

export function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  return `${n}${({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th"}`;
}

/** A date like 2026-12-01 as "1 Dec 2026"; anything else is shown as typed. */
export function dateText(d: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d);
  if (!m) return d;
  const mo = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(m[2]) - 1];
  return mo ? `${Number(m[3])} ${mo} ${m[1]}` : d;
}

/** The address of a team page, given the site origin. */
export const teamUrl = (origin: string, slug: string) => `${origin.replace(/\/$/, "")}/team/?s=${slug}`;
