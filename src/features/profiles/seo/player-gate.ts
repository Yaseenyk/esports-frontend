/**
 * The quality gate for a pre-rendered, indexable /players/<slug>/ page, as the build can check it from the public payload. Pure, dependency-free
 * (scripts/verify-seo.mjs loads this file to re-check every shipped page). The backend (src/v3/lib/player-seo.ts) is the authority and also requires
 * the player's "Show my profile in Google search" setting, 18+, consent and no moderation hide; the build only lists slugs the backend passed, then
 * re-checks the content here, then applies the weekly cap.
 */
export const SEO_BIO_MIN = 80;
export const PLAYER_WEEKLY_CAP = 10;
export const WEEK_SECONDS = 7 * 24 * 3600;

export interface PlayerGateInput { visibility: string; apiIndexable: boolean; bioLength: number; games: number; verifiedResults: number }

export function playerGateFailures(i: PlayerGateInput): string[] {
  const out: string[] = [];
  if (i.visibility !== "public") out.push("not_public");
  if (!i.apiIndexable) out.push("api_not_indexable");
  if (!((i.bioLength >= SEO_BIO_MIN && i.games >= 1) || i.verifiedResults >= 1)) out.push("thin_content");
  return out;
}

/**
 * The weekly cap on NEWLY indexable player pages (CLAUDE.md "Cadence cap"), counted by the opt-in time the API gives (`listedSince`, epoch seconds).
 * Oldest first: a page is held back when `cap` pages were listed in the 7 days up to it. Returns the slugs allowed.
 */
export function capPlayers(items: readonly { slug: string; at: number }[], cap: number = PLAYER_WEEKLY_CAP): Set<string> {
  const sorted = [...items].sort((a, b) => a.at - b.at || a.slug.localeCompare(b.slug));
  const allowed: number[] = [];
  const out = new Set<string>();
  for (const it of sorted) {
    if (allowed.filter((t) => t > it.at - WEEK_SECONDS && t <= it.at).length >= cap) continue;
    allowed.push(it.at);
    out.add(it.slug);
  }
  return out;
}
