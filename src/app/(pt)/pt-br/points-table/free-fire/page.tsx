import type { Metadata } from "next";
import Link from "next/link";
import PointsTable from "@/components/tools/PointsTableLazy";
import ToolLanding from "@/components/seo/ToolLanding";
import { FREE_FIRE_PT as t } from "@/lib/game-pages-pt";
import { PT_BR_ROBOTS, enPathFor, hreflangFor } from "@/lib/pt-br";

const en = enPathFor(t.path);
export const metadata: Metadata = {
  title: t.title, description: t.description, robots: PT_BR_ROBOTS,
  alternates: { canonical: t.path, languages: hreflangFor(en) },
  openGraph: { title: t.title, description: t.description, url: t.path, locale: "pt_BR", images: ["/og.png"] }, twitter: { card: "summary_large_image", title: t.title, description: t.description, images: ["/og.png"] },
};

/** /pt-br/points-table/free-fire/: the Free Fire points table in Brazilian Portuguese. Same tool, same example scale as the English page. */
export default function Page() {
  return (
    <>
      <p className="no-print mb-6 text-sm text-zinc-400"><Link href={en} hrefLang="en" lang="en" className="underline underline-offset-4 hover:text-zinc-200">English version</Link></p>
      <ToolLanding t={t} lang="pt-BR"><PointsTable preset={t.preset} lang="pt-BR" path={t.path} /></ToolLanding>
    </>
  );
}
