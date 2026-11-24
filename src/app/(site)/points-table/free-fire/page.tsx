import type { Metadata } from "next";
import PointsTable from "@/components/tools/PointsTableLazy";
import ToolLanding from "@/components/seo/ToolLanding";
import { PAGE_SCALES, battleRoyaleRules } from "@/features/tool-trust/domain";
import PortugueseOffer from "@/components/PortugueseOffer";
import { GAME_PAGES } from "@/lib/game-pages";
import { PT_BR_PAGES, hreflangFor } from "@/lib/pt-br";

const t = GAME_PAGES["free-fire"];
export const metadata: Metadata = {
  title: t.title, description: t.description, alternates: { canonical: t.path, languages: hreflangFor(t.path) },
  openGraph: { title: t.title, description: t.description, url: t.path, images: ["/og.png"] }, twitter: { card: "summary_large_image", title: t.title, description: t.description, images: ["/og.png"] },
};

export default function Page() {
  return <><PortugueseOffer href={PT_BR_PAGES[t.path]!} /><ToolLanding t={t} trust={{ rules: battleRoyaleRules("Free Fire", PAGE_SCALES["free-fire"]) }}><PointsTable preset={t.preset} path={t.path} /></ToolLanding></>;
}
