import type { Metadata } from "next";
import PointsTable from "@/components/tools/PointsTable";
import ToolLanding from "@/components/seo/ToolLanding";
import { GAME_PAGES } from "@/lib/game-pages";

const t = GAME_PAGES["bgmi"];
export const metadata: Metadata = {
  title: t.title, description: t.description, alternates: { canonical: t.path },
  openGraph: { title: t.title, description: t.description, url: t.path, images: ["/og.png"] }, twitter: { card: "summary_large_image", title: t.title, description: t.description, images: ["/og.png"] },
};

export default function Page() {
  return <ToolLanding t={t}><PointsTable preset={t.preset} /></ToolLanding>;
}
