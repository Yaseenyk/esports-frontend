/**
 * Build time only (Node): what /tournaments/ is in this build and whether it may be indexed. ONE function used by the page, its metadata and sitemap.ts,
 * so the three can never disagree. scripts/verify-seo.mjs re-checks the result from the #eh-directory data the page ships.
 *  - "directory": v3.directory is on (the API answered): the phase 5 directory of upcoming public tournaments.
 *  - "v3": the directory is off but the tournaments API has tournaments: the earlier v3 index.
 *  - "legacy": both off or empty: the earlier "Find a tournament" page, noindex.
 * In every mode the page is indexable only with at least MIN_UPCOMING_FOR_INDEX upcoming public tournaments (and, in "v3" mode, one page passing the guard).
 */
import { loadBuildDirectory } from "@/features/directory/services/directory.api";
import { directoryIndexable, isUpcoming, MIN_UPCOMING_FOR_INDEX, type DirectoryData } from "@/features/directory/domain";
import { indexableOnly, loadBuildTournaments } from "@/features/tournaments/services/build-data";

export interface TournamentsIndexVerdict { mode: "directory" | "v3" | "legacy"; upcoming: number; min: number; indexable: boolean; directory: DirectoryData | null }

export async function tournamentsIndexVerdict(): Promise<TournamentsIndexVerdict> {
  const directory = await loadBuildDirectory();
  if (directory) return { mode: "directory", upcoming: directory.total, min: MIN_UPCOMING_FOR_INDEX, indexable: directoryIndexable(directory.total), directory };
  const all = await loadBuildTournaments();
  if (all.length === 0) return { mode: "legacy", upcoming: 0, min: MIN_UPCOMING_FOR_INDEX, indexable: false, directory: null };
  const upcoming = all.filter((t) => isUpcoming(t.detail)).length;
  return { mode: "v3", upcoming, min: MIN_UPCOMING_FOR_INDEX, indexable: indexableOnly(all).length > 0 && directoryIndexable(upcoming), directory: null };
}
