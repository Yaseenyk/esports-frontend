import type { Metadata } from "next";
import { pageTitle } from "@/lib/schema";
import ToolLanding from "@/components/seo/ToolLanding";
import PortugueseOffer from "@/components/PortugueseOffer";
import NameStyle from "@/features/name-style/ui/NameStyleLazy";
import ReadyLists from "@/features/name-style/ui/ReadyLists";
import { PT_BR_PAGES, hreflangFor } from "@/lib/pt-br";
import { FF_NAME_STYLE_PAGE as t } from "@/lib/tool-page-players";

const path = "/tools/free-fire-name-style/";
export const metadata: Metadata = {
  title: pageTitle(t.title), description: t.description, alternates: { canonical: path, languages: hreflangFor(path) },
  openGraph: { title: t.title, description: t.description, url: path, images: ["/og.png"] }, twitter: { card: "summary_large_image", title: t.title, description: t.description, images: ["/og.png"] },
};

/** The generator loads in the browser; the ready-made names, symbols and FAQ are static HTML. Reports as "free-fire-name-style". */
export default function Page() {
  return <><PortugueseOffer href={PT_BR_PAGES[path]!} /><ToolLanding t={t}><NameStyle game="free-fire" /><div className="mt-10"><ReadyLists game="free-fire" /></div></ToolLanding></>;
}
