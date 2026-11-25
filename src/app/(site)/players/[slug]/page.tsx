import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import { PLACEHOLDER_SLUG, findBuildPlayer, playerDescription, playerJsonLd, playerStaticParams, playerTitle } from "@/features/profiles/services/build-data";
import { LivePlayer } from "@/features/profiles/ui/LivePlayer";
import { loadBuildTournaments } from "@/features/tournaments/services/build-data";
import { h2 } from "@/features/shared/ui/styles";
import { SITE_URL } from "@/lib/site";

export const dynamicParams = false;

/**
 * /players/<slug>/: one pre-rendered page per profile that passed the quality gate (the player opted in to search, Public, 18+, consent, not hidden,
 * real content). Built from the live API at build time; the daily rebuild adds new ones and drops the ones that no longer pass. With the API off or no
 * profile passing, only the placeholder exists and scripts/prune-v3.mjs deletes it. Everything else about players stays on /players/view/ (noindex).
 */
export const generateStaticParams = playerStaticParams;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const b = await findBuildPlayer(params.slug);
  if (!b) return { robots: { index: false, follow: false } };
  const url = `/players/${b.page.slug}/`;
  const title = playerTitle(b.page), description = playerDescription(b.page);
  return {
    title: { absolute: title }, description, alternates: { canonical: url },
    // Held back by the weekly cap: built for sharing, noindex until the window passes.
    robots: b.indexable ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: { type: "profile", title, description, url, images: [{ url: `${SITE_URL}/og.png`, width: 1200, height: 630, alt: "Esports Hub" }] },
    twitter: { card: "summary_large_image", title, description, images: [`${SITE_URL}/og.png`] },
  };
}

export default async function PlayerStaticPage({ params }: { params: { slug: string } }) {
  const b = await findBuildPlayer(params.slug);
  if (!b) { if (params.slug === PLACEHOLDER_SLUG) return null; notFound(); }
  const url = `${SITE_URL}/players/${b.page.slug}/`;
  const tournaments = (await loadBuildTournaments()).map((t) => t.detail.slug);
  return (
    <>
      {b.indexable && <JsonLd data={playerJsonLd(b.page, url, SITE_URL)} />}
      {/* The gate's input and verdict travel with the page so scripts/verify-seo.mjs can re-check what was shipped. Public counts only. */}
      <script type="application/json" id="eh-player" dangerouslySetInnerHTML={{ __html: JSON.stringify({ slug: b.page.slug, indexable: b.indexable, failures: b.failures, input: b.gate }).replace(/</g, "\u003c") }} />
      <LivePlayer initial={b.page} linkable={tournaments} />
      <section className="mx-auto mt-8 max-w-3xl border-t border-white/10 pt-6" aria-labelledby="how-h">
        <h2 id="how-h" className={h2}>How this page works</h2>
        <p className="mt-3 text-zinc-300">This is a player profile on Esports Hub, a free set of tools for esports tournaments in India. The player wrote the bio, picked the games and roles and added any links and achievements; they choose what shows here, and they asked for this page to appear in search. Numbers marked Verified are different: Esports Hub counts them from results that tournament organisers recorded and checked, and the player cannot type or change them. The player can make this page private at any time, and it then leaves this site and search results.</p>
      </section>
    </>
  );
}
