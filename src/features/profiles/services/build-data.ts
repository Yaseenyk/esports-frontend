/**
 * Build-time data for the pre-rendered player pages /players/<slug>/ (Node only, never imported by a client component). Reads the public API once per
 * build: the list of slugs the backend's quality gate passed (GET /public/profiles/players), then each page. Re-checks the content gate and applies the
 * weekly cap. Never throws: with the API off (404), empty or unreachable the answer is an empty list and no player page is emitted.
 * A profile that fails later (search turned off, made private, hidden, deleted, slug changed) is simply not in the next build's list, so its page and
 * sitemap entry disappear; until that build the page's live check (LivePlayer) replaces the old text with a noindex "not available" notice.
 */
import { api } from "@/lib/api";
import { toPlayerPage } from "@/features/profiles/services/profiles.adapter";
import { capPlayers, playerGateFailures, type PlayerGateInput } from "@/features/profiles/seo/player-gate";
import type { PlayerPage } from "@/features/profiles/domain";

const BUILD_OPT = { retries: 0, timeout: 8000, ttl: 300000 } as const;
const SLUG = /^[a-z0-9-]{3,60}$/;

export interface BuildPlayer { page: PlayerPage & { slug: string }; indexable: boolean; failures: string[]; gate: PlayerGateInput; listedSince: string | null }

export function gateInputOf(p: PlayerPage): PlayerGateInput {
  return { visibility: p.visibility, apiIndexable: p.indexable, bioLength: (p.bio ?? "").trim().length, games: p.games.length, verifiedResults: p.matches.length + p.battleRoyale.length + p.certificates.length };
}

async function list(): Promise<{ slug: string; listedSince: string | null }[]> {
  try {
    const r = (await api.get<unknown>("/public/profiles/players", BUILD_OPT)) as { items?: unknown };
    if (!Array.isArray(r?.items)) return [];
    return r.items
      .map((x) => x as { slug?: unknown; listedSince?: unknown })
      .filter((x): x is { slug: string; listedSince: unknown } => typeof x.slug === "string" && SLUG.test(x.slug))
      .map((x) => ({ slug: x.slug, listedSince: typeof x.listedSince === "string" ? x.listedSince : null }))
      .slice(0, 200);
  } catch { return []; }
}
async function detail(slug: string): Promise<PlayerPage | null> {
  try { return toPlayerPage(await api.get<unknown>(`/public/profiles/players/${encodeURIComponent(slug)}`, BUILD_OPT)); } catch { return null; }
}

let cached: Promise<BuildPlayer[]> | null = null;
async function load(): Promise<BuildPlayer[]> {
  const items = await list();
  const out: BuildPlayer[] = [];
  for (let i = 0; i < items.length; i += 6) {
    const got = await Promise.all(items.slice(i, i + 6).map(async (it) => ({ it, p: await detail(it.slug) })));
    for (const { it, p } of got) {
      if (!p || p.slug !== it.slug) continue; // gone, private or renamed since the list was read: no page
      const gate = gateInputOf(p);
      const failures = playerGateFailures(gate);
      if (failures.length) continue; // a failing profile gets no static page at all
      out.push({ page: { ...p, slug: it.slug }, indexable: true, failures: [], gate, listedSince: it.listedSince });
    }
  }
  const allowed = capPlayers(out.map((b) => ({ slug: b.page.slug, at: b.listedSince ? Math.floor(Date.parse(b.listedSince) / 1000) || 0 : 0 })));
  return out.map((b) => (allowed.has(b.page.slug) ? b : { ...b, indexable: false, failures: ["weekly_cap"] }));
}

export const loadBuildPlayers = (): Promise<BuildPlayer[]> => (cached ??= load());
export async function findBuildPlayer(slug: string): Promise<BuildPlayer | undefined> { return (await loadBuildPlayers()).find((b) => b.page.slug === slug); }

/** Same trick as the tournament pages: Next refuses an empty generateStaticParams under `output: "export"`; scripts/prune-v3.mjs deletes this one. */
export const PLACEHOLDER_SLUG = "__none__";
export async function playerStaticParams(): Promise<{ slug: string }[]> {
  const all = await loadBuildPlayers();
  return all.length ? all.map((b) => ({ slug: b.page.slug })) : [{ slug: PLACEHOLDER_SLUG }];
}

/** Title at most 60 characters (handle is at most 40). Description 70 to 170 characters, from what the page shows. */
export function playerTitle(p: PlayerPage): string { return `${p.handle}: esports player profile`.slice(0, 60); }
export function playerDescription(p: PlayerPage): string {
  const games = p.games.map((g) => g.game.replace(/_/g, " ").toUpperCase()).join(", ");
  const parts = [`${p.handle} on Esports Hub${games ? `, plays ${games}` : ""}${p.teamName ? `, team ${p.teamName}` : ""}.`, p.bio ?? "", "Verified results from tournaments recorded by organisers."];
  let d = parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  if (d.length > 165) d = `${d.slice(0, 162).replace(/\s+\S*$/, "")}...`;
  return d.length >= 70 ? d : `${d} Profile, games and achievements the player chose to share.`;
}

export function playerJsonLd(p: PlayerPage & { slug: string }, url: string, siteUrl: string): object[] {
  const person: Record<string, unknown> = { "@type": "Person", name: p.handle, url, ...(p.bio ? { description: p.bio.slice(0, 300) } : {}) };
  return [
    { "@context": "https://schema.org", "@type": "ProfilePage", url, name: playerTitle(p), ...(p.updatedAt ? { dateModified: p.updatedAt } : {}), mainEntity: person },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: p.handle, item: url },
    ] },
  ];
}
