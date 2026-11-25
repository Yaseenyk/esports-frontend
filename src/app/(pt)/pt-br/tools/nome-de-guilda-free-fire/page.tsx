import type { Metadata } from "next";
import Link from "next/link";
import ToolLanding from "@/components/seo/ToolLanding";
import Tool from "@/features/team-name/ui/TeamNameLazy";
import { GUILD_PT as t } from "@/lib/tool-pages-pt";
import { enPathFor, hreflangFor, ptRobots } from "@/lib/pt-br";

const en = enPathFor(t.path);
export const metadata: Metadata = {
  title: { absolute: t.title }, description: t.description, robots: ptRobots(t.path),
  alternates: { canonical: t.path, languages: hreflangFor(en) },
  openGraph: { title: t.title, description: t.description, url: t.path, locale: "pt_BR", images: ["/og.png"] }, twitter: { card: "summary_large_image", title: t.title, description: t.description, images: ["/og.png"] },
};

/** /pt-br/tools/nome-de-guilda-free-fire/: the Free Fire guild name generator in Brazilian Portuguese. Noindex until a native reader approves it (PT_BR_REVIEWED in src/lib/pt-br.ts). */
export default function Page() {
  return (
    <>
      <p className="no-print mb-6 text-sm text-zinc-400"><Link href={en} hrefLang="en" lang="en" className="underline underline-offset-4 hover:text-zinc-200">English version</Link></p>
      <ToolLanding t={t} lang="pt-BR"><Tool preset="ff-guild" stylish lang="pt-BR" /></ToolLanding>
    </>
  );
}
