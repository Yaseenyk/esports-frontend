import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import { PLACEHOLDER_SLUG, findBuildTournament, tournamentStaticParams } from "@/features/tournaments/services/build-data";
import { breadcrumbJsonLd, sportsEventJsonLd } from "@/features/tournaments/seo/jsonld";
import { tournamentDescription, tournamentTitle } from "@/features/tournaments/seo/metadata";
import RegistrationIsland from "@/features/tournaments/ui/RegistrationIsland";
import TrustSlot from "@/features/community/TrustSlot";
import { AboutSection, FooterNote, ResultsSection, RulesAccordion, ScheduleList, TeamList, TournamentHeader } from "@/features/tournaments/ui/TournamentParts";
import { section, h2 } from "@/features/shared/ui/styles";
import { SITE_URL } from "@/lib/site";

export const dynamicParams = false;

/** One page per public tournament of the build. With the API off or empty it is only the placeholder, which the build then deletes (see build-data.ts). */
export const generateStaticParams = tournamentStaticParams;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const t = await findBuildTournament(params.slug);
  if (!t) return {};
  const url = `/tournaments/${t.detail.slug}/`;
  const image = `${SITE_URL}${url}og.png`;
  const title = tournamentTitle(t.detail), description = tournamentDescription(t.detail);
  return {
    title: { absolute: title }, description, alternates: { canonical: url },
    robots: t.verdict.indexable ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: { type: "website", title, description, url, images: [{ url: image, width: 1200, height: 630, alt: `${t.detail.title}: tournament card` }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function TournamentPage({ params }: { params: { slug: string } }) {
  const found = await findBuildTournament(params.slug);
  if (!found) { if (params.slug === PLACEHOLDER_SLUG) return null; notFound(); }
  const { detail: t, verdict, guard } = found;
  const url = `${SITE_URL}/tournaments/${t.slug}/`;
  const ld = sportsEventJsonLd(t, { indexable: verdict.indexable, url, image: `${url}og.png`, siteUrl: SITE_URL });
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      {ld && <JsonLd data={[ld, breadcrumbJsonLd(SITE_URL, t.title, url)]} />}
      {/* The guard's input and verdict travel with the page so scripts/verify-seo.mjs can re-check what was shipped. Public data only. */}
      <script type="application/json" id="eh-guard" dangerouslySetInnerHTML={{ __html: JSON.stringify({ slug: t.slug, indexable: verdict.indexable, failures: verdict.failures, input: guard }).replace(/</g, "\\u003c") }} />
      <TournamentHeader t={t} />
      <RegistrationIsland slug={t.slug} open={t.registration.open} registered={t.registration.registered} spotsLeft={t.registration.spotsLeft} status={t.status} />
      <AboutSection description={t.description} />
      <ScheduleList rows={t.schedule} />
      <TeamList teams={t.teams} />
      <ResultsSection matches={t.results.matches} battleRoyale={t.results.battleRoyale} />
      <TrustSlot slug={t.slug} />
      <RulesAccordion rules={t.rules} />
      <section className={section} aria-labelledby="how-h">
        <h2 id="how-h" className={h2}>How this page works</h2>
        <p className="mt-3 max-w-3xl text-zinc-300">The organiser writes the details and decides when to publish. Registration numbers on this page refresh from the live count. Only approved teams that chose to be public are named, and results appear after the organiser has verified them. If a dispute changes a result, the change is marked Corrected with the original value shown.</p>
      </section>
      <FooterNote />
    </article>
  );
}
