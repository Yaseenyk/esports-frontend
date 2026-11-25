import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import GuideArticle from "@/components/seo/GuideArticle";
import PortugueseOffer from "@/components/PortugueseOffer";
import { GUIDES, MERGED, guideBySlug } from "@/content/guides";
import { PT_BR_PAGES, hreflangFor } from "@/lib/pt-br";

export const dynamicParams = false;
export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

/** A guide with its own share card in public/og/<slug>.png uses it; every other guide uses the site card. */
const ogFor = (slug: string) => (fs.existsSync(path.join(process.cwd(), "public", "og", `${slug}.png`)) ? `/og/${slug}.png` : "/og.png");

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const g = guideBySlug(params.slug);
  if (!g) return {};
  const url = `/guides/${g.slug}/`;
  const og = ogFor(g.slug);
  return {
    title: g.seoTitle ?? g.title, description: g.description, alternates: { canonical: url, languages: hreflangFor(url) },
    // A merged guide stays online for old links, but search engines are pointed at the guide that replaced it.
    ...(MERGED[g.slug] ? { robots: { index: false, follow: true } } : {}),
    openGraph: { type: "article", title: g.seoTitle ?? g.title, description: g.description, url, publishedTime: g.published, modifiedTime: g.updated, images: [og] },
    twitter: { card: "summary_large_image", title: g.seoTitle ?? g.title, description: g.description, images: [og] },
  };
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const g = guideBySlug(params.slug);
  if (!g) notFound();
  const path = `/guides/${g.slug}/`;
  const related = g.related.filter((s) => !MERGED[s]).map((s) => guideBySlug(s)).filter((x): x is NonNullable<typeof x> => !!x);
  const mergedInto = MERGED[g.slug] ? guideBySlug(MERGED[g.slug]) : undefined;
  const notice = mergedInto && <p role="note" className="mt-4 rounded-xl border border-amber-500/30 bg-[#0a0b0d] px-4 py-2.5 text-sm text-amber-200">This guide has been merged into <Link prefetch={false} href={`/guides/${mergedInto.slug}/`} className="underline underline-offset-4">{mergedInto.title}</Link>, which covers the same ground in more depth. This page stays online for old links and is not listed in search results.</p>;
  return (
    <>
      {PT_BR_PAGES[path] && <PortugueseOffer href={PT_BR_PAGES[path]!} />}
      <GuideArticle g={g} path={path} og={ogFor(g.slug)} related={related} notice={notice} />
    </>
  );
}
