import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import GuideArticle from "@/components/seo/GuideArticle";
import { guideBySlug } from "@/content/guides";
import { FREE_FIRE_TEAM_NAMES_PT } from "@/content/pt-br/free-fire-team-names-ideas";
import { toGuideOn } from "@/content/scheduled";
import { PT_BR_PAGES, PT_BR_ROBOTS, hreflangFor } from "@/lib/pt-br";

const EN = "/guides/free-fire-team-names-ideas/";
const PATH = PT_BR_PAGES[EN]!;
// Same publish and update dates as the English guide it translates.
const english = guideBySlug(FREE_FIRE_TEAM_NAMES_PT.slug)!;
const g = toGuideOn({ ...FREE_FIRE_TEAM_NAMES_PT, updated: english.updated }, english.published);
const og = fs.existsSync(path.join(process.cwd(), "public", "og", `${g.slug}.png`)) ? `/og/${g.slug}.png` : "/og.png";

export const metadata: Metadata = {
  title: g.seoTitle ?? g.title, description: g.description, robots: PT_BR_ROBOTS,
  alternates: { canonical: PATH, languages: hreflangFor(EN) },
  openGraph: { type: "article", title: g.seoTitle ?? g.title, description: g.description, url: PATH, locale: "pt_BR", publishedTime: g.published, modifiedTime: g.updated, images: [og] },
  twitter: { card: "summary_large_image", title: g.seoTitle ?? g.title, description: g.description, images: [og] },
};

/** /pt-br/guides/free-fire-team-names-ideas/: the Free Fire team names guide in Brazilian Portuguese. Related guides are the English ones. */
export default function Page() {
  const related = g.related.map((s) => guideBySlug(s)).filter((x): x is NonNullable<typeof x> => !!x);
  return (
    <>
      <p className="no-print mx-auto mb-6 max-w-3xl text-sm text-zinc-400"><Link href={EN} hrefLang="en" lang="en" className="underline underline-offset-4 hover:text-zinc-200">English version</Link></p>
      <GuideArticle g={g} path={PATH} og={og} related={related} lang="pt-BR" />
    </>
  );
}
