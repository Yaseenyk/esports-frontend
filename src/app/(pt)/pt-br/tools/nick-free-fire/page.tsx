import type { Metadata } from "next";
import { pageTitle } from "@/lib/schema";
import Link from "next/link";
import ToolLanding from "@/components/seo/ToolLanding";
import NameStyle from "@/features/name-style/ui/NameStyleLazy";
import ReadyLists from "@/features/name-style/ui/ReadyLists";
import { NICK_FF_PT as t } from "@/lib/tool-pages-pt";
import { enPathFor, hreflangFor, ptBrRobots } from "@/lib/pt-br";

const en = enPathFor(t.path);
export const metadata: Metadata = {
  title: pageTitle(t.title), description: t.description, robots: ptBrRobots(t.path),
  alternates: { canonical: t.path, languages: hreflangFor(en) },
  openGraph: { title: t.title, description: t.description, url: t.path, locale: "pt_BR", images: ["/og.png"] }, twitter: { card: "summary_large_image", title: t.title, description: t.description, images: ["/og.png"] },
};

/** /pt-br/tools/nick-free-fire/: the Free Fire name style generator in Brazilian Portuguese. Noindex until a native reader approves it (PT_BR_REVIEWED in src/lib/pt-br.ts). */
export default function Page() {
  return (
    <>
      <p className="no-print mb-6 text-sm text-zinc-400"><Link href={en} hrefLang="en" lang="en" className="underline underline-offset-4 hover:text-zinc-200">English version</Link></p>
      <ToolLanding t={t} lang="pt-BR"><NameStyle game="free-fire" lang="pt-BR" /><div className="mt-10"><ReadyLists game="free-fire" lang="pt-BR" /></div></ToolLanding>
    </>
  );
}
