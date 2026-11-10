import type { Metadata } from "next";
import PointsTable from "@/components/tools/PointsTable";
import ToolLanding from "@/components/seo/ToolLanding";
import { TOOL_PAGES } from "@/lib/tool-pages";

const t = TOOL_PAGES["points-table"]!;
export const metadata: Metadata = {
  title: t.title, description: t.description, alternates: { canonical: "/tools/points-table/" },
  openGraph: { title: t.title, description: t.description, url: "/tools/points-table/", images: ["/og.png"] }, twitter: { card: "summary_large_image", title: t.title, description: t.description, images: ["/og.png"] },
};

export default function Page() {
  return <ToolLanding t={t}><PointsTable /></ToolLanding>;
}
