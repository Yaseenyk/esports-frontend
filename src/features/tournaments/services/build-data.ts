/**
 * Build-time data for the tournament pages (Node only, never imported by a client component). Reads the public API once per build process,
 * judges every page with the thin-page guard and the weekly cap, and hands the result to `generateStaticParams`, `generateMetadata`,
 * the pages and `sitemap.ts`. Never throws: with the API off (404), empty or unreachable the answer is an empty list and no page is emitted.
 */
import { judgePages, guardInput, titleCountsOf, type PageVerdict, type SeoGuardInput } from "@/features/tournaments/seo/thin-page-guard";
import { fetchPublicDetail, fetchPublicList } from "@/features/tournaments/services/tournaments.api";
import { guardSource } from "@/features/tournaments/services/tournament.adapter";
import type { TournamentDetail } from "@/features/tournaments/domain";

export interface BuildTournament { detail: TournamentDetail; verdict: PageVerdict; guard: SeoGuardInput }

let cached: Promise<BuildTournament[]> | null = null;

async function load(): Promise<BuildTournament[]> {
  const list = await fetchPublicList(50);
  if (!list || list.length === 0) return [];
  const details: TournamentDetail[] = [];
  for (let i = 0; i < list.length; i += 6) {
    const got = await Promise.all(list.slice(i, i + 6).map((c) => fetchPublicDetail(c.slug)));
    for (const d of got) if (d) details.push(d);
  }
  const sources = details.map(guardSource);
  const verdicts = judgePages(sources);
  const counts = titleCountsOf(sources);
  return details.map((detail, i) => ({ detail, verdict: verdicts[i], guard: guardInput(sources[i], counts) }));
}

/** Every public tournament of this build with its verdict. Cached for the life of the build process. */
export const loadBuildTournaments = (): Promise<BuildTournament[]> => (cached ??= load());
export const indexableOnly = (all: readonly BuildTournament[]): BuildTournament[] => all.filter((t) => t.verdict.indexable);
export async function findBuildTournament(slug: string): Promise<BuildTournament | undefined> { return (await loadBuildTournaments()).find((t) => t.detail.slug === slug); }

/**
 * Next 14 refuses a dynamic route whose generateStaticParams() is empty under `output: "export"` (and `revalidate = 0` silently drops every page).
 * So when there is nothing to publish the route is given ONE placeholder slug, and `scripts/prune-v3.mjs` (the second half of `npm run build`)
 * deletes its output. The placeholder never reaches `out/`, so no tournament page is emitted while the API is off.
 */
export const PLACEHOLDER_SLUG = "__none__";
export async function tournamentStaticParams(): Promise<{ slug: string }[]> {
  const all = await loadBuildTournaments();
  return all.length ? all.map((t) => ({ slug: t.detail.slug })) : [{ slug: PLACEHOLDER_SLUG }];
}
