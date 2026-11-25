import type { Metadata } from "next";
import PointsTable from "@/components/tools/PointsTableLazy";
import ToolLanding from "@/components/seo/ToolLanding";
import { PAGE_SCALES, battleRoyaleRules } from "@/features/tool-trust/domain";
import { GAME_PAGES } from "@/lib/game-pages";
import { pageTitle } from "@/lib/schema";

const t = GAME_PAGES["bgmi"];
export const metadata: Metadata = {
  title: pageTitle(t.title), description: t.description, alternates: { canonical: t.path },
  openGraph: { title: t.title, description: t.description, url: t.path, images: ["/og.png"] }, twitter: { card: "summary_large_image", title: t.title, description: t.description, images: ["/og.png"] },
};

export default function Page() {
  return <ToolLanding t={t} trust={{ rules: battleRoyaleRules("BGMI", PAGE_SCALES.bgmi) }}><PointsTable preset={t.preset} path={t.path} /></ToolLanding>;
}
