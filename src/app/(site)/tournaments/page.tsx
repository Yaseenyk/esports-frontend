import type { Metadata } from "next";
import TournamentsPage from "@/components/features/directory/TournamentsPage";
import { loadBuildTournaments, indexableOnly } from "@/features/tournaments/services/build-data";
import { TournamentList } from "@/features/tournaments/ui/TournamentParts";
import { EmptyState } from "@/features/shared/ui/States";
import { h1 } from "@/features/shared/ui/styles";
import { SITE_URL } from "@/lib/site";

/**
 * /tournaments/ has two lives, decided at build time from the public API:
 *  - API off, empty or unreachable (flags are off today): the existing "Find a tournament" directory, noindex, exactly as before.
 *  - API has tournaments: the v3 index. Indexable only when at least one tournament passes the thin-page guard; otherwise noindex.
 */
export async function generateMetadata(): Promise<Metadata> {
  const all = await loadBuildTournaments();
  if (all.length === 0) return { title: "Find a tournament", robots: { index: false, follow: false } };
  const ready = indexableOnly(all).length > 0;
  return {
    title: "Esports tournaments in India, with dates and results", alternates: { canonical: "/tournaments/" },
    description: "Student and community esports tournaments in India: dates, venues, open registration and verified results, all published by the organisers.",
    robots: ready ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: { type: "website", url: `${SITE_URL}/tournaments/`, title: "Esports tournaments in India", images: ["/og.png"] },
    twitter: { card: "summary_large_image", images: ["/og.png"] },
  };
}

export default async function Page() {
  const all = await loadBuildTournaments();
  if (all.length === 0) return <TournamentsPage />;
  const ready = indexableOnly(all);
  const shown = (ready.length > 0 ? ready : all).map((t) => t.detail);
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="space-y-3">
        <h1 className={h1}>Esports tournaments in India</h1>
        <p className="max-w-3xl text-zinc-300">Every tournament here was created and published by its organiser on Esports Hub. Each page shows the dates, the venue, whether registration is open and, once the organiser has verified them, the results. We do not list tournaments we cannot link to a real organiser.</p>
      </header>
      {shown.length > 0 ? <TournamentList items={shown} heading="Tournaments" /> : <EmptyState title="No tournaments yet" body="Organisers have not published any tournament yet." />}
    </div>
  );
}
