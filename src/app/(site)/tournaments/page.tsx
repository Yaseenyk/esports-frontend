import type { Metadata } from "next";
import TournamentsPage from "@/components/features/directory/TournamentsPage";
import { DirectoryScreen } from "@/features/directory";
import AlertsBox from "@/features/alerts/ui/AlertsBox";
import { tournamentsIndexVerdict } from "@/features/directory/services/page-verdict";
import { loadBuildTournaments, indexableOnly } from "@/features/tournaments/services/build-data";
import { TournamentList } from "@/features/tournaments/ui/TournamentParts";
import { EmptyState } from "@/features/shared/ui/States";
import Link from "next/link";
import { v3Enabled } from "@/features/shared/flags";
import { h1, link } from "@/features/shared/ui/styles";
import { SITE_URL } from "@/lib/site";

/**
 * /tournaments/ has three lives, decided at build time from the public API (features/directory/services/page-verdict.ts):
 *  - directory (flag v3.directory on): upcoming public tournaments with game and city filters and Register buttons;
 *  - v3 (tournaments API on, directory off): the earlier index of published tournament pages;
 *  - legacy (both off or empty, as today): the existing "Find a tournament" page, noindex, exactly as before.
 * Indexable ONLY with at least 5 upcoming public tournaments (AdSense review: a near-empty list is thin content); otherwise noindex and out of the sitemap.
 */
export async function generateMetadata(): Promise<Metadata> {
  const v = await tournamentsIndexVerdict();
  if (v.mode === "legacy") return { title: "Find a tournament", robots: { index: false, follow: false } };
  const title = v.mode === "directory" ? "Upcoming esports tournaments in India, by game and city" : "Esports tournaments in India, with dates and results";
  return {
    title, alternates: { canonical: "/tournaments/" },
    description: "Student and community esports tournaments in India: dates, venues, open registration and verified results, all published by the organisers.",
    robots: v.indexable ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: { type: "website", url: `${SITE_URL}/tournaments/`, title: "Esports tournaments in India", images: ["/og.png"] },
    twitter: { card: "summary_large_image", images: ["/og.png"] },
  };
}

export default async function Page() {
  const v = await tournamentsIndexVerdict();
  // The index decision travels with the page so scripts/verify-seo.mjs can re-check what was shipped. Counts only.
  const data = <script type="application/json" id="eh-directory" dangerouslySetInnerHTML={{ __html: JSON.stringify({ mode: v.mode, upcoming: v.upcoming, min: v.min, indexable: v.indexable }) }} />;
  if (v.mode === "legacy") return <>{data}<TournamentsPage /></>;
  if (v.mode === "directory" && v.directory) return <>{data}<DirectoryScreen initial={v.directory} indexable={v.indexable} />{v3Enabled("alerts") && <div className="mx-auto mt-8 max-w-5xl"><AlertsBox /></div>}</>;
  const all = await loadBuildTournaments();
  const ready = indexableOnly(all);
  const shown = (ready.length > 0 ? ready : all).map((t) => t.detail);
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {data}
      <header className="space-y-3">
        <h1 className={h1}>Esports tournaments in India</h1>
        <p className="max-w-3xl text-zinc-300">Every tournament here was created and published by its organiser on Esports Hub. Each page shows the dates, the venue, whether registration is open and, once the organiser has verified them, the results. We do not list tournaments we cannot link to a real organiser.</p>
      </header>
      {shown.length > 0 ? <TournamentList items={shown} heading="Tournaments" /> : <EmptyState title="No tournaments yet" body="Organisers have not published any tournament yet." action={v3Enabled("disputes") ? <p className="text-sm text-zinc-300">Played in a tournament and have a problem with a result? <Link href="/app/disputes/" className={link}>Raise a dispute</Link></p> : undefined} />}
    </div>
  );
}
