import type { Metadata } from "next";
import ToolLanding from "@/components/seo/ToolLanding";
import NameStyle from "@/features/name-style/ui/NameStyleLazy";
import ReadyLists from "@/features/name-style/ui/ReadyLists";
import { BGMI_NAME_STYLE_PAGE as t } from "@/lib/tool-page-players";

const path = "/tools/bgmi-name-style/";
export const metadata: Metadata = {
  title: { absolute: t.title }, description: t.description, alternates: { canonical: path },
  openGraph: { title: t.title, description: t.description, url: path, images: ["/og.png"] }, twitter: { card: "summary_large_image", title: t.title, description: t.description, images: ["/og.png"] },
};

/** The generator loads in the browser; the ready-made names, symbols and FAQ are static HTML. Reports as "bgmi-name-style". */
export default function Page() {
  return <ToolLanding t={t}><NameStyle game="bgmi" /><div className="mt-10"><ReadyLists game="bgmi" /></div></ToolLanding>;
}
