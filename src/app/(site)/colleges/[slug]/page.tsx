import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import { COLLEGE_PLACEHOLDER, collegeStaticParams, findCollege } from "@/features/colleges/college";
import { TournamentList } from "@/features/tournaments/ui/TournamentParts";
import { breadcrumbJsonLd } from "@/features/tournaments/seo/jsonld";
import { h1 } from "@/features/shared/ui/styles";
import { SITE_URL } from "@/lib/site";

export const dynamicParams = false;
/** One page per verified college that hosts a real public tournament. With the API off it is only the placeholder, which the build deletes. */
export const generateStaticParams = collegeStaticParams;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const c = await findCollege(params.slug);
  if (!c) return {};
  const url = `/colleges/${c.slug}/`;
  const title = `${c.name} esports tournaments`;
  const description = `Esports tournaments hosted by ${c.name}: dates, venues, registration and results, published by the organisers.`;
  return {
    title, description, alternates: { canonical: url },
    robots: c.indexable ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: { type: "website", title, description, url, images: ["/og.png"] }, twitter: { card: "summary_large_image", images: ["/og.png"] },
  };
}

export default async function CollegePage({ params }: { params: { slug: string } }) {
  const c = await findCollege(params.slug);
  if (!c) { if (params.slug === COLLEGE_PLACEHOLDER) return null; notFound(); }
  const url = `${SITE_URL}/colleges/${c.slug}/`;
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {c.indexable && <JsonLd data={breadcrumbJsonLd(SITE_URL, c.name, url)} />}
      <header className="space-y-3">
        <h1 className={h1}>{c.name} esports tournaments</h1>
        <p className="max-w-3xl text-zinc-300">Tournaments hosted by {c.name} on Esports Hub. The college is verified, and every detail below was published by its organisers.</p>
      </header>
      <TournamentList items={c.tournaments} heading="Tournaments" />
    </div>
  );
}
